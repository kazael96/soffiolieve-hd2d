#!/usr/bin/env python3
"""Combine editable sources with the verified v0.8 asset package."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import struct
import tempfile
import zipfile

ARCHIVE_SHA256 = "2451b9f6531a90bcec395037624de300fa16a2e49f88becbe2701969a77176d6"
ROOT = Path(__file__).resolve().parents[1]


def startup_pack(site):
    paths=set()
    for name in ['assets/scene.js','assets/sprites.js','opening-assets.js','opening-sprites.js','accumula-assets.js','route2-assets.js','striaton-assets.js']:
        file=site/name
        if not file.exists():continue
        match=re.search(r'window\.[A-Z_]+\s*=\s*',file.read_text(encoding='utf8'))
        if not match:continue
        data=json.JSONDecoder().raw_decode(file.read_text(encoding='utf8')[match.end():])[0]
        def visit(value):
            if isinstance(value,str) and re.search(r'\.png(?:\?|$)',value):paths.add(value.split('?')[0])
            elif isinstance(value,dict):
                for v in value.values():visit(v)
            elif isinstance(value,list):
                for v in value:visit(v)
        visit(data)
    index={};chunks=[];offset=0
    for name in sorted(paths):
        file=site/name
        if not file.is_file():continue
        raw=file.read_bytes();index[name]=[offset,len(raw)];chunks.append(raw);offset+=len(raw)
    header=json.dumps(index,separators=(',',':')).encode()
    dest=site/'assets/field-pack.bin';dest.write_bytes(b'SFP1'+struct.pack('<I',len(header))+header+b''.join(chunks))
    return {'images':len(index),'bytes':dest.stat().st_size}


def bundle_entries(site):
    index=site/'index.html';html=index.read_text(encoding='utf8');scripts=[];styles=[]
    def script(match):
        name=match.group(1);scripts.append([name,(site/name).read_text(encoding='utf8')]);return '<script src="app.js"></script>' if len(scripts)==1 else ''
    html=re.sub(r'<script\s+src="([^"?]+\.js)"\s*>\s*</script>',script,html)
    # Separate classic script elements preserve hoisting and global lexical scopes.
    code='/* Generated classic-script transport; source files remain available. */\nfor(const [file,source] of '+json.dumps(scripts,ensure_ascii=True,separators=(',',':'))+'){const tag=document.createElement("script");tag.textContent=source+"\\n//# sourceURL="+new URL(file,location.href).href;document.body.append(tag);tag.remove();}\n'
    (site/'app.js').write_text(code,encoding='utf8',newline='\n')
    def style(match):
        name=match.group(1);styles.append(name);return '<link rel="stylesheet" href="app.css">' if len(styles)==1 else ''
    html=re.sub(r'<link\s+rel="stylesheet"\s+href="([^"?]+\.css)"\s*>',style,html)
    (site/'app.css').write_text('\n'.join((site/name).read_text(encoding='utf8') for name in styles),encoding='utf8',newline='\n')
    index.write_text(html,encoding='utf8',newline='\n')
    return {'scripts':[s[0] for s in scripts],'styles':styles}

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
        packed = startup_pack(site)
        entrypoints = bundle_entries(site)
        # A content hash changes script/CSS URLs on every source update.
        hashes = {p.relative_to(site).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in sorted(site.glob('*')) if p.suffix in ('.js', '.css', '.html')}
        asset_hashes = {p.relative_to(ROOT / 'src').as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                        for p in sorted((ROOT / 'src/assets').rglob('*')) if p.is_file()}
        asset_hashes['assets/field-pack.bin'] = hashlib.sha256((site/'assets/field-pack.bin').read_bytes()).hexdigest()
        revision = hashlib.sha256(json.dumps({'files': hashes, 'assets': asset_hashes}, sort_keys=True).encode()).hexdigest()[:16]
        index = site / 'index.html'
        html = index.read_text(encoding='utf-8')
        html = html.replace('<html lang="it">', f'<html lang="it" data-build="{revision}">')
        html = re.sub(r'((?:src|href)=")([^"?]+\.(?:js|css))"',
                      lambda match: f'{match[1]}{match[2]}?v={revision}"', html)
        index.write_text(html, encoding='utf-8', newline='\n')
        hashes['index.html'] = hashlib.sha256(index.read_bytes()).hexdigest()
        (site / 'build.json').write_text(json.dumps({
            'version': '0.41', 'revision': revision,
            'archive_sha256': digest, 'files': hashes, 'assets': asset_hashes, 'startup': {'pack': packed, **entrypoints},
        }, indent=2) + '\n', encoding='utf-8', newline='\n')
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(site, target)
    print(f"Built Soffiolieve 0.41 ({revision}) in {target}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('target', type=Path, nargs='?', default=Path('_site'))
    arguments = parser.parse_args()
    try:
        build(arguments.archive, arguments.target)
    except (ValueError, OSError, zipfile.BadZipFile) as error:
        parser.exit(1, f"Build failed: {error}\n")
