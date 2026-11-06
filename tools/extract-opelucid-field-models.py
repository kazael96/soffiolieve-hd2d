"""Extract native animated children actually referenced by the051 geography.

Keep bundle-specific identifiers and register a lazy op scope. No ROM is
included in the exported site; conversion uses the existing field decoder.
"""
from pathlib import Path
import argparse
import json
import re
import shutil
import struct
import irbi_reader
irbi_reader.install()
import ndspy.rom
import ndspy.narc

parser = argparse.ArgumentParser(description=__doc__)
for key in ['rom', 'output', 'work', 'apicula']:
    parser.add_argument('--' + key, type=Path, required=True)
args = parser.parse_args()
rom = ndspy.rom.NintendoDSRom.fromFile(args.rom)
assert rom.idCode == b'IRBI'
used = {}
for asset_file in sorted(args.output.glob('opelucid-*-assets.js')):
    assets = json.loads(asset_file.read_text(encoding='utf8').split('=', 1)[1].rstrip(';\n'))
    for scene in assets.get('scenes', {}).values():
        for instance in scene['instances']:
            match = re.fullmatch(r'op-prop-(True|False)-(\d+)-(\d+)', instance['model'])
            if match:
                used.setdefault((match[1] == 'True', int(match[2])), set()).add(int(match[3]))
source_path = Path(__file__).with_name('extract-field-models.py')
source = source_path.read_text(encoding='utf8')
start = source.index('    for path,member,texture_path,texture_member,ids in [')
end = source.index('        bundle=ndspy.narc.NARC', start)
source = source[:start] + '    for path,member,texture_path,texture_member,ids in plans:\n' + source[end:]
source = source.replace("(b'BCA0',b'BMA0')", "(b'BCA0',b'BMA0',b'BTA0')")
combined = {'source': 'IRBI051 native field children; lazy geographic scope op', 'models': {}, 'children': {}}
for (outdoor, member), parents in sorted(used.items()):
    archive = 'a/2/2/9' if outdoor else 'a/2/3/0'
    texture = 'a/1/7/6' if outdoor else 'a/1/7/7'
    bundle = ndspy.narc.NARC(rom.getFileByName(archive)).files[member]
    count = bundle[2] // 2
    offsets = struct.unpack_from('<' + 'I' * (count * 2), bundle, 4)
    headers = {struct.unpack_from('<H', bundle, at)[0]: at for at in offsets[:count]}
    candidates = set(parents)
    for parent in parents:
        if parent in headers:
            candidates.add(struct.unpack_from('<H', bundle, headers[parent] + 4)[0])
    ids = []
    for mid in sorted(candidates):
        if mid not in headers:
            continue
        at = headers[mid]
        kind = struct.unpack_from('<H', bundle, at + 2)[0]
        mode, _, per_set, sets = struct.unpack_from('<4B', bundle, at + 16)
        if mode == 2 and per_set * sets and kind in [1, 2, 3, 11, 12, 13, 14, 15]:
            ids.append(mid)
    if not ids:
        continue
    name = f'{outdoor}-{member}'
    folder = args.work / name
    folder.mkdir(parents=True, exist_ok=True)
    scope = {'__name__': 'opelucid_field_export', 'plans': [(archive, member, texture, member, ids)]}
    exec(compile(source, str(source_path), 'exec'), scope)
    result = scope['extract'](rom, folder, args.apicula.resolve())
    for mid, record in result['models'].items():
        key = f'{name}-{mid}'
        record['key'] = 'op-field-' + key
        destination = args.output / 'assets/opelucid/field-models' / name / Path(record['model']).parent.name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(folder / Path(record['model']).parent, destination, dirs_exist_ok=True)
        record['model'] = (destination / Path(record['model']).name).relative_to(args.output).as_posix()
        combined['models'][key] = record
    for parent, record in result['children'].items():
        record['modelKey'] = f'{name}-{record["model"]}'
        combined['children'][f'{name}-{parent}'] = record
assert combined['models'] and combined['children']
payload = json.dumps(combined, separators=(',', ':'))
installer = "(()=>{let installed=false;window.OpelucidFieldModels={install(){if(installed)return;FIELD_MODEL_ASSETS.scopes??={};FIELD_MODEL_ASSETS.scopes.op=OPELUCID_FIELD_MODELS;installed=true;}};})();\n"
(args.output / 'opelucid-field-models.js').write_text('window.OPELUCID_FIELD_MODELS=' + payload + ';\n' + installer, encoding='utf8', newline='\n')
print('Native051 field models:', len(combined['models']), 'models;', len(combined['children']), 'children')
