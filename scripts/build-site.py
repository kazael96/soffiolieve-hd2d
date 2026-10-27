#!/usr/bin/env python3
"""Combine editable sources with the verified v0.8 asset package."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import tempfile
import zipfile

ARCHIVE_SHA256 = "2451b9f6531a90bcec395037624de300fa16a2e49f88becbe2701969a77176d6"
ROOT = Path(__file__).resolve().parents[1]


def build(archive, target):
    with archive.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    if digest != ARCHIVE_SHA256:
        raise ValueError("Release SHA-256 mismatch; refusing to publish")
    if target.exists():
        raise ValueError(f"Output already exists: {target}. Choose an empty destination.")
    with tempfile.TemporaryDirectory() as folder:
        staging = Path(folder)
        with zipfile.ZipFile(archive) as bundle:
            for name in bundle.namelist():
                path = Path(name.replace('\\', '/'))
                if path.is_absolute() or '..' in path.parts or ':' in name:
                    raise ValueError(f"Unsafe archive path: {name}")
            bundle.extractall(staging)
        site = staging / 'soffiolieve'
        if not (site / 'assets/animated/800-front.png').is_file():
            raise ValueError("Incomplete release asset package")
        for source in (ROOT / 'src').rglob('*'):
            if source.is_file():
                destination = site / source.relative_to(ROOT / 'src')
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(source, destination)
        # A content hash changes script/CSS URLs on every source update.
        hashes = {p.relative_to(site).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in sorted(site.glob('*')) if p.suffix in ('.js', '.css', '.html')}
        asset_hashes = {p.relative_to(ROOT / 'src').as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                        for p in sorted((ROOT / 'src/assets').rglob('*')) if p.is_file()}
        revision = hashlib.sha256(json.dumps({'files': hashes, 'assets': asset_hashes}, sort_keys=True).encode()).hexdigest()[:16]
        index = site / 'index.html'
        html = index.read_text(encoding='utf-8')
        html = html.replace('<html lang="it">', f'<html lang="it" data-build="{revision}">')
        html = re.sub(r'((?:src|href)=")([^"?]+\.(?:js|css))"',
                      lambda match: f'{match[1]}{match[2]}?v={revision}"', html)
        index.write_text(html, encoding='utf-8', newline='\n')
        hashes['index.html'] = hashlib.sha256(index.read_bytes()).hexdigest()
        (site / 'build.json').write_text(json.dumps({
            'version': '0.18', 'revision': revision,
            'archive_sha256': digest, 'files': hashes, 'assets': asset_hashes,
        }, indent=2) + '\n', encoding='utf-8', newline='\n')
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(site, target)
    print(f"Built Soffiolieve 0.18 ({revision}) in {target}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('target', type=Path, nargs='?', default=Path('_site'))
    arguments = parser.parse_args()
    try:
        build(arguments.archive, arguments.target)
    except (ValueError, OSError, zipfile.BadZipFile) as error:
        parser.exit(1, f"Build failed: {error}\n")
