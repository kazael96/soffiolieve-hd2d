"""Native051 WB/GC references; NG maps are recorded as requiring rail support."""
import argparse
import base64
import hashlib
import json
import re
import struct
from pathlib import Path
from irbi_reader import NintendoDSRom, NARC

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('rom', type=Path)
parser.add_argument('output', type=Path)
args = parser.parse_args()
rom = NintendoDSRom.fromFile(args.rom)
assert rom.idCode == b'IRBI'


def read(name):
    return json.loads((args.output / name).read_text(encoding='utf8').split('=', 1)[1].rstrip(';\n'))


assets, prior = read('opelucid-assets.js'), read('native-surface-data.js')
overlay = rom.loadArm9Overlays([21])[21]
normal_bytes = overlay.data[0x021db88c - overlay.ramAddress:0x021db88c - overlay.ramAddress + 328 * 6]
offset_bytes = overlay.data[0x021dc044 - overlay.ramAddress:0x021dc044 - overlay.ramAddress + 1314 * 4]
assert prior['normals'] == [list(row) for row in struct.iter_unpack('<3h', normal_bytes)]
assert prior['offsets'] == list(struct.unpack('<1314i', offset_bytes))
lands = NARC(rom.getFileByName('a/0/0/8')).files
scenes, grids, rail_maps, hashes = {}, {}, [], {}
for zone, scene in assets['scenes'].items():
    scenes[zone] = []
    for instance in scene['instances']:
        match = re.fullmatch(r'op-map-(\d+)', instance['model'])
        if not match:
            continue
        member = int(match[1])
        raw = lands[member]
        entry = {'member': member, 'x': instance['x'], 'y': instance['y'], 'z': instance['z']}
        if raw[:2] == b'NG':
            rail_maps.append({'zone': int(zone), **entry})
            continue
        assert raw[:2] in [b'WB', b'GC'], (zone, member, raw[:2])
        scenes[zone].append(entry)
        if member in grids:
            continue
        layers = []
        for layer in range(2 if raw[:2] == b'GC' else 1):
            start, end = struct.unpack_from('<II', raw, 8 + layer * 4)
            grid = raw[start:end]
            width, depth = struct.unpack_from('<HH', grid)
            assert width and depth and len(grid) >= 4 + width * depth * 8
            layers.append(base64.b64encode(grid).decode('ascii'))
        grids[member] = layers
        hashes[member] = hashlib.sha256(raw).hexdigest()
data = {'source': {'rom': 'IRBI', 'sampler': '21:021d13ac / 21:0218d9ec',
                   'normalTableSha256': hashlib.sha256(normal_bytes).hexdigest(), 'offsetTableSha256': hashlib.sha256(offset_bytes).hexdigest()},
        'scenes': scenes, 'grids': grids, 'railMaps': rail_maps, 'mapHashes': hashes,
        'note': 'Merge native shared normals/offsets when constructing the sampler. NG entries require native rails, never mesh-height fallback.'}
(args.output / 'opelucid-surface-data.js').write_text('window.OPELUCID_SURFACE_DATA=' + json.dumps(data, separators=(',', ':')) + ';\n', encoding='utf8', newline='\n')
print('Native051 surfaces:', len(scenes), 'scenes,', len(grids), 'WB/GC maps,', sum(map(len, grids.values())), 'layers; NG rail zones', sorted({row['zone'] for row in rail_maps}))
