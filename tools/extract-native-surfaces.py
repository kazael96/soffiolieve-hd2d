"""Export native WB/GC surface references for the050 maps, including winter.

Normals and plane offsets are original overlay21 tables. No mesh-height guesses.
"""
import argparse
import base64
import json
import re
import struct
from pathlib import Path
from irbi_reader import NintendoDSRom, NARC

p = argparse.ArgumentParser()
p.add_argument('rom', type=Path)
p.add_argument('output', type=Path)
a = p.parse_args()
r = NintendoDSRom.fromFile(a.rom)
assert r.idCode == b'IRBI'
overlay = r.loadArm9Overlays([21])[21]
normals = [list(struct.unpack_from('<3h', overlay.data, 0x021db88c - overlay.ramAddress + i * 6)) for i in range(328)]
offsets = list(struct.unpack_from('<1314i', overlay.data, 0x021dc044 - overlay.ramAddress))
assert normals[0] == [0, 4094, 0] and offsets[0] == 0
assets = json.loads((a.output / 'icirrus-assets.js').read_text(encoding='utf8').split('=', 1)[1].rstrip(';\n'))
scenes = {}
for zone, scene in assets['scenes'].items():
    scenes[zone] = [dict(member=int(match[1]), x=i['x'], y=i['y'], z=i['z'])
                    for i in scene['instances'] if (match := re.fullmatch(r'ic-map-(\d+)', i['model']))]
# Previous regions now reachable by Surf need their original WB/GC heights too.
for filename, zones, prefix in [('route2-assets.js',[6],'acc'),('route3-assets.js',[321,324],'acc'),
                              ('pinwheel-assets.js',[155],'pw'),('nimbasa-assets.js',[326],'nb'),
                              ('mistralton-assets.js',[96,191,193,194,331],'mt')]:
    older=json.loads((a.output/filename).read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
    for zone in zones:
        scenes[str(zone)]=[dict(member=int(match[1]),x=i['x'],y=i['y'],z=i['z'])
                          for i in older['scenes'][str(zone)]['instances']
                          if (match:=re.fullmatch(prefix+r'-map-(\d+)',i['model']))]
# Original opening export: a/0/0/8 members0..4, before the folded later towns.
scenes['389']=[dict(member=0,x=0,y=0,z=0),dict(member=1,x=-32,y=0,z=0)]
scenes['317']=[dict(member=2,x=-32,y=0,z=-32),dict(member=3,x=0,y=0,z=-32),dict(member=4,x=0,y=0,z=-64)]
lands = NARC(r.getFileByName('a/0/0/8')).files
members = {i['member'] for scene in scenes.values() for i in scene} | set(range(396, 400))
grids = {}
for member in sorted(members):
    land = lands[member]
    if land[:2] not in [b'WB', b'GC']:
        raise ValueError(('Missing native surface', member, land[:2]))
    layers = []
    for layer in range(2 if land[:2] == b'GC' else 1):
        start, end = struct.unpack_from('<II', land, 8 + layer * 4)
        raw = land[start:end]
        width, depth = struct.unpack_from('<HH', raw)
        assert width and depth and len(raw) >= 4 + width * depth * 8
        layers.append(base64.b64encode(raw).decode('ascii'))
    grids[member] = layers
data = {'source': {'rom': 'IRBI', 'normalTable': '21:021db88c', 'planeOffsetTable': '21:021dc044',
                   'sampler': '21:021d13ac / 21:0218d9ec'}, 'normals': normals, 'offsets': offsets,
        'grids': grids, 'scenes': scenes}
(a.output / 'native-surface-data.js').write_text('window.NATIVE_SURFACE_DATA=' + json.dumps(data, separators=(',', ':')) + ';\n', encoding='utf8')
print('Native surfaces:', len(scenes), 'scenes,', len(grids), 'maps,', sum(map(len, grids.values())), 'layers')
