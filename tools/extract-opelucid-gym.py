"""Native Brycen puzzle resources/tables; export is not controller integration."""
import argparse
import hashlib
import json
import shutil
import struct
import subprocess
from pathlib import Path
from irbi_reader import NintendoDSRom, NARC
from nitro_geometry import flatten_glb

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('rom', type=Path)
parser.add_argument('output', type=Path)
parser.add_argument('--apicula', type=Path, required=True)
parser.add_argument('--work-dir', type=Path, required=True)
args = parser.parse_args()
rom = NintendoDSRom.fromFile(args.rom)
assert rom.idCode == b'IRBI'
overlay = rom.loadArm9Overlays([45])[45]
assert hashlib.sha256(overlay.data).hexdigest() == '5250b8cd29c8f0b58f205c16fcd32f318a5e1051accbf474f1aecc05a42bb0ee'


def rows(address, count, fmt):
    size = struct.calcsize(fmt)
    return [struct.unpack_from(fmt, overlay.data, address - overlay.ramAddress + i * size) for i in range(count)]


def name_list(raw, offset):
    count = raw[offset + 1]
    entries = offset + struct.unpack_from('<H', raw, offset + 6)[0]
    size, names = struct.unpack_from('<HH', raw, entries)
    return [(raw[entries + names + i * 16:entries + names + (i + 1) * 16].split(b'\0')[0].decode('ascii'),
             raw[entries + 4 + i * size:entries + 4 + (i + 1) * size]) for i in range(count)]


def native_animation(member):
    raw = archive[member]
    block = struct.unpack_from('<I', raw, 16)[0]
    assert raw[block:block + 4] in [b'JNT0', b'SRT0']
    entries = name_list(raw, block + 8)
    assert len(entries) == 1 and len(entries[0][1]) == 4
    name, pointer = entries[0]
    animation = block + struct.unpack('<I', pointer)[0]
    count = struct.unpack_from('<H', raw, animation + 4)[0]
    assert count > 0
    targets = [name for name, data in name_list(raw, animation + 8)] if raw[:4] == b'BTA0' else []
    return {'name': name, 'frames': count, 'targets': targets, 'format': raw[:4].decode('ascii')}


resource_ptr, count, models_ptr, model_count = rows(0x021f3a30, 1, '<4I')[0]
resources = rows(resource_ptr, count, '<3I')
descriptors = rows(models_ptr, model_count, '<4I')
assert count == 9 and model_count == 6 and all(archive == 153 and flag == 0 for archive, member, flag in resources)
archive = NARC(rom.getFileByName('a/1/5/3')).files
assert [bytes(raw[:4]) for raw in archive] == [b'BMD0'] * 3 + [b'BCA0'] * 4 + [b'BTA0'] * 2
origins_a = [[n / 65536 for n in row] for row in rows(0x021f3a60, 3, '<3i')]
origins_b = [[n / 65536 for n in row] for row in rows(0x021f3a84, 3, '<3i')]
rules = rows(0x021f3a40, 8, '<2H')
assert rules == [(0, 0), (0, 1), (1, 0), (1, 1), (2, 0), (2, 0), (2, 1), (2, 1)]
data = {'source': 'IRBI overlay45:021f35a0/021f3a30 + a/1/5/3', 'overlaySha256': hashlib.sha256(overlay.data).hexdigest(),
        'zone': 114, 'tickRate': 30, 'initialStates': [0, 0, 0], 'origins': origins_a + origins_b,
        'rampStateRules': rules, 'nativeRampMode': 2, 'nativeRampGate': '45:021f37a4/021f37e8; movement-mode meaning still to integrate',
        'sounds': {'start': 1744, 'finish': 1776}, 'geometry': {}, 'textures': {}, 'models': {}, 'instances': [],
        'resourceHashes': {i: hashlib.sha256(raw).hexdigest() for i, raw in enumerate(archive)},
        'adaptation': 'Original resources and tables. Browser controller, collision and checkpoint integration remain separate.'}
kind_by_member = {1: 'platformA', 0: 'platformB', 2: 'switch'}
for index, descriptor in enumerate(descriptors):
    model_resource, texture_resource, animations_ptr, animation_count = descriptor
    assert model_resource == texture_resource and animation_count == 2
    member = resources[model_resource][1]
    animation_resources = [row[0] for row in rows(animations_ptr, animation_count, '<I')]
    members = [member, *[resources[i][1] for i in animation_resources]]
    kind = kind_by_member[member]
    data['instances'].append({'index': index, 'kind': kind, 'members': members, 'nativeOrigin': data['origins'][index],
                              'worldOrigin': [data['origins'][index][0] - 16, data['origins'][index][1], data['origins'][index][2] - 16]})
    if kind in data['models']:
        assert data['models'][kind]['members'] == members
        continue
    key = 'op-gym-' + kind
    data['models'][kind] = {'key': key, 'members': members, 'states': []}
    # The converter selected only one switch BTA when both were supplied in
    # the same call. Export each native state separately, so neither is lost.
    for state, animation_member in enumerate(members[1:]):
        work = args.work_dir / kind / f'state{state}'
        work.mkdir(parents=True, exist_ok=True)
        inputs = []
        for member in [members[0], animation_member]:
            file = work / f'{member}.bin'
            file.write_bytes(archive[member])
            inputs.append(str(file.resolve()))
        converted = work / 'converted'
        result = subprocess.run([str(args.apicula.resolve()), 'convert', *inputs, '-o', str(converted.resolve()), '-f', 'glb', '--all-animations', '--overwrite'], check=True, capture_output=True, text=True)
        (work / 'apicula.log').write_text(result.stdout + '\n' + result.stderr, encoding='utf8')
        dest = args.output / 'assets/opelucid/gym' / kind / f'state{state}'
        dest.mkdir(parents=True, exist_ok=True)
        for file in converted.iterdir():
            if file.suffix in ['.glb', '.png']:
                shutil.copyfile(file, dest / file.name)
        glb = next(converted.glob('*.glb'))
        if state == 0:
            geometry, textures = flatten_glb(glb, key, args.output / 'assets/opelucid', 'assets/opelucid')
            data['geometry'][key] = geometry
            data['textures'].update(textures)
        raw = glb.read_bytes()
        length = struct.unpack_from('<I', raw, 12)[0]
        doc = json.loads(raw[20:20 + length])
        animations = doc.get('animations', [])
        native = native_animation(animation_member)
        material_names = {material['name'] for material in doc.get('materials', [])}
        # Native SRT tracks bind by material name. The supplied BTA8 targets
        # ice_s_02_1; the switch BMD has lambert2/lambert3, so there is no bound
        # track. Retain its native duration explicitly instead of inventing UV.
        # Format reference: github.com/scurest/nsbmd_docs/blob/master/nsbmd_docs.txt
        unbound = native['format'] == 'BTA0' and native['targets'] and not material_names.intersection(native['targets'])
        if unbound:
            assert len(animations) == 0, (kind, state, 'Unexpected animation for unmatched track')
            assert all(name.encode('ascii') in archive[members[0]] for name in material_names)
            assert all(name.encode('ascii') not in archive[members[0]] for name in native['targets'])
            animation = None
        else:
            assert len(animations) == 1, (kind, state, len(animations))
            animation = animations[0]
        data['models'][kind]['states'].append({'url': 'assets/opelucid/gym/' + kind + f'/state{state}/' + glb.name,
            'nativeMember': animation_member, 'animation': 0 if animation else None, 'name': native['name'],
            'nativeFrames': native['frames'], 'nativeTargets': native['targets'],
            'binding': 'unmatched-native-material-name' if unbound else 'bound',
            'gltfLastFrame': round(max((doc['accessors'][sampler['input']].get('max', [0])[0] for sampler in animation['samplers']), default=0) * 60) if animation else None})
args.output.mkdir(parents=True, exist_ok=True)
(args.output / 'opelucid-gym-data.js').write_text('window.OPELUCID_GYM_DATA=' + json.dumps(data, separators=(',', ':')) + ';\n', encoding='utf8', newline='\n')
(args.work_dir / 'extraction-report.json').write_text(json.dumps({key: value for key, value in data.items() if key not in ['geometry', 'textures']}, indent=2), encoding='utf8', newline='\n')
print('Native Brycen references:3 models,6 logical native states (one unmatched material track),6 instances,8 rules; controller not integrated')
