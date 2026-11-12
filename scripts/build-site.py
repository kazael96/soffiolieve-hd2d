#!/usr/bin/env python3
"""Combine editable sources with the verified v0.8 asset package."""
import argparse
import errno
import hashlib
import json
from pathlib import Path
import re
import shutil
import struct
import tempfile
import zipfile
import uuid
from contextlib import contextmanager

ARCHIVE_SHA256 = "2451b9f6531a90bcec395037624de300fa16a2e49f88becbe2701969a77176d6"
ROOT = Path(__file__).resolve().parents[1]


@contextmanager
def build_staging():
    # Python 3.13's private Windows tempfile ACL can exclude a workspace's
    # restricted capability token. Inherit this workspace directory's ACL;
    # only generated, non-sensitive build/test files are placed here.
    parent = (ROOT / '.build-tmp').resolve()
    parent.mkdir(exist_ok=True)
    folder = parent / ('stage-' + uuid.uuid4().hex)
    folder.mkdir()
    try:
        yield str(folder)
    finally:
        resolved = folder.resolve()
        if resolved.parent != parent or not resolved.name.startswith('stage-'):
            raise ValueError('Unsafe staging cleanup path')
        if any(p.name == '.git' or p.is_symlink() or getattr(p, 'is_junction', lambda: False)()
               for p in [folder, *folder.rglob('*')]):
            raise ValueError('Linked or repository staging directory; cleanup refused')
        shutil.rmtree(resolved)


def startup_pack(site, sources=None, filename='assets/field-pack.bin', strict=False):
    paths=set()
    for name in sources or ['assets/scene.js','assets/sprites.js','opening-assets.js','opening-sprites.js','accumula-assets.js','route2-assets.js','striaton-assets.js','route3-assets.js','pinwheel-assets.js']:
        file=site/name
        if not file.exists():
            if strict:raise ValueError(f'Missing pack catalogue: {name}')
            continue
        match=re.search(r'window\.[A-Z][A-Z0-9_]*\s*=\s*',file.read_text(encoding='utf8'))
        if not match:
            if strict:raise ValueError(f'Invalid pack catalogue: {name}')
            continue
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
        if not file.is_file():
            if strict:raise ValueError(f'Missing pack image: {name}')
            continue
        raw=file.read_bytes();index[name]=[offset,len(raw)];chunks.append(raw);offset+=len(raw)
    header=json.dumps(index,separators=(',',':')).encode()
    dest=site/filename;dest.write_bytes(b'SFP1'+struct.pack('<I',len(header))+header+b''.join(chunks))
    return {'images':len(index),'bytes':dest.stat().st_size}


def geographic_packs(site, prefix='opelucid'):
    """Keep native geographic transport separated by area, including dynamic images."""
    if prefix not in ['opelucid', 'league']:raise ValueError('Invalid geographic pack prefix')
    file=site/(prefix+'-parts.js')
    if not file.exists():return {}
    text=file.read_text(encoding='utf8')
    match=re.match(r'\s*window\.'+prefix.upper()+r'_PARTS\s*=\s*',text)
    if not match:raise ValueError('Invalid geographic pack manifest')
    data=json.JSONDecoder().raw_decode(text[match.end():])[0]
    result={}
    for name,part in data['families'].items():
        # These are source-controlled paths, nevertheless reject escapes before writing.
        pattern=r'[a-z0-9]+' if prefix=='opelucid' else r'[a-z][a-zA-Z0-9]*'
        if not re.fullmatch(pattern,name) or part['src']!=f'{prefix}-{name}-assets.js' or part['pack']!=f'assets/{prefix}-{name}-pack.bin':
            raise ValueError('Invalid geographic pack path')
        result[name]={'pack':part['pack'],**startup_pack(site,[part['src']],part['pack'],strict=True)}
        variants=part.get('seasons',{})
        if variants and (prefix!='league' or set(variants)!={'0','1','2','3'}):raise ValueError('Incomplete geographic seasons')
        for season,variant in variants.items():
            suffix=f'{name}-season{season}'
            if variant.get('season')!=int(season) or variant['src']!=f'league-{suffix}-assets.js' or variant['pack']!=f'assets/league-{suffix}-pack.bin' or sorted(variant.get('zones',[]))!=sorted(part.get('zones',[])):
                raise ValueError('Invalid geographic season path or zones')
            result[suffix]={'pack':variant['pack'],**startup_pack(site,[variant['src']],variant['pack'],strict=True)}
    return result


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

def publish_staging(site, target):
    """Move exclusively owned staging files, copying only across volumes."""
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists() or target.is_symlink():
        raise ValueError(f"Output already exists: {target}. Choose an empty destination.")
    try:
        site.rename(target)
        return 'rename'
    except OSError as error:
        if error.errno != errno.EXDEV:
            raise
    shutil.copytree(site, target)
    return 'copy'


def build(archive, target):
    with archive.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    if digest != ARCHIVE_SHA256:
        raise ValueError("Release SHA-256 mismatch; refusing to publish")
    if target.exists():
        raise ValueError(f"Output already exists: {target}. Choose an empty destination.")
    with build_staging() as folder:
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
        chapter_pack = startup_pack(site,['castelia-assets.js'],'assets/castelia-pack.bin')
        nimbasa_pack = startup_pack(site,['nimbasa-assets.js'],'assets/nimbasa-pack.bin')
        driftveil_pack = startup_pack(site,['driftveil-assets.js'],'assets/driftveil-pack.bin')
        mistralton_pack = startup_pack(site,['mistralton-assets.js'],'assets/mistralton-pack.bin')
        icirrus_pack = startup_pack(site,['icirrus-assets.js'],'assets/icirrus-pack.bin')
        capture_pack = startup_pack(site,['capture-data.js','route2-ball.js','route3-ball.js','nimbasa-ball.js','driftveil-ball.js','mistralton-ball.js'],'assets/capture-pack.bin')
        opelucid_packs = geographic_packs(site)
        league_packs = geographic_packs(site, 'league')
        for season in range(4):
            for prefix in ['field','opelucid']:
                if (site / f'{prefix}-season-{season}-assets.js').exists():
                    startup_pack(site,[f'{prefix}-season-{season}-assets.js'],f'assets/{prefix}-season-{season}-pack.bin')
        entrypoints = bundle_entries(site)
        # A content hash changes script/CSS URLs on every source update.
        hashes = {p.relative_to(site).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in sorted(site.glob('*')) if p.suffix in ('.js', '.css', '.html')}
        asset_hashes = {p.relative_to(ROOT / 'src').as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
                        for p in sorted((ROOT / 'src/assets').rglob('*')) if p.is_file()}
        for season in range(4):
            for prefix in ['field','opelucid']:
                pack = site / f'assets/{prefix}-season-{season}-pack.bin'
                if pack.exists():
                    asset_hashes[pack.relative_to(site).as_posix()] = hashlib.sha256(pack.read_bytes()).hexdigest()
        asset_hashes['assets/icirrus-pack.bin'] = hashlib.sha256((site/'assets/icirrus-pack.bin').read_bytes()).hexdigest()
        for part in [*opelucid_packs.values(), *league_packs.values()]:
            asset_hashes[part['pack']] = hashlib.sha256((site/part['pack']).read_bytes()).hexdigest()
        asset_hashes['assets/mistralton-pack.bin'] = hashlib.sha256((site/'assets/mistralton-pack.bin').read_bytes()).hexdigest()
        asset_hashes['assets/driftveil-pack.bin'] = hashlib.sha256((site/'assets/driftveil-pack.bin').read_bytes()).hexdigest()
        asset_hashes['assets/nimbasa-pack.bin'] = hashlib.sha256((site/'assets/nimbasa-pack.bin').read_bytes()).hexdigest()
        asset_hashes['assets/castelia-pack.bin'] = hashlib.sha256((site/'assets/castelia-pack.bin').read_bytes()).hexdigest()
        asset_hashes['assets/field-pack.bin'] = hashlib.sha256((site/'assets/field-pack.bin').read_bytes()).hexdigest()
        asset_hashes['assets/capture-pack.bin'] = hashlib.sha256((site/'assets/capture-pack.bin').read_bytes()).hexdigest()
        revision = hashlib.sha256(json.dumps({'files': hashes, 'assets': asset_hashes}, sort_keys=True).encode()).hexdigest()[:16]
        index = site / 'index.html'
        html = index.read_text(encoding='utf-8')
        html = html.replace('<html lang="it">', f'<html lang="it" data-build="{revision}">')
        html = re.sub(r'((?:src|href)=")([^"?]+\.(?:js|css))"',
                      lambda match: f'{match[1]}{match[2]}?v={revision}"', html)
        index.write_text(html, encoding='utf-8', newline='\n')
        hashes['index.html'] = hashlib.sha256(index.read_bytes()).hexdigest()
        (site / 'build.json').write_text(json.dumps({
            'version': '0.52', 'revision': revision, 'capture': {'pack':'assets/capture-pack.bin', **capture_pack},
            'archive_sha256': digest, 'files': hashes, 'assets': asset_hashes, 'startup': {'pack': packed, **entrypoints}, 'chapters': {'castelia': chapter_pack, 'nimbasa': nimbasa_pack, 'driftveil': driftveil_pack, 'mistralton': mistralton_pack, 'icirrus': icirrus_pack, 'opelucid': opelucid_packs, 'league': league_packs},
        }, indent=2) + '\n', encoding='utf-8', newline='\n')
        publish_staging(site, target)
    print(f"Built Soffiolieve 0.52 ({revision}) in {target}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('target', type=Path, nargs='?', default=Path('_site'))
    arguments = parser.parse_args()
    try:
        build(arguments.archive, arguments.target)
    except (ValueError, OSError, zipfile.BadZipFile) as error:
        parser.exit(1, f"Build failed: {error}\n")
