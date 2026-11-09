"""Read-only IRBI topology inventory for the chapter after Icirrus arrival.

The report is private research, not runtime integration or a postgame unlock.
Keep native rail records; this inspection does not reinterpret their coordinates.
"""
import argparse
import importlib.util
import inspect
import json
import struct
from pathlib import Path
from irbi_reader import NintendoDSRom, NARC, install

install()
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('rom', type=Path)
parser.add_argument('report', type=Path)
args = parser.parse_args()
rom = NintendoDSRom.fromFile(args.rom)
assert rom.idCode == b'IRBI'
cache = {}


def narc(name):
    if name not in cache:
        cache[name] = NARC(rom.getFileByName(name)).files
    return cache[name]


spec = importlib.util.spec_from_file_location('native_events', Path(__file__).with_name('extract-original-events.py'))
events = importlib.util.module_from_spec(spec)
spec.loader.exec_module(events)
exec(inspect.getsource(events.entities).replace("raise ValueError('Rail entity outside selected grid-map format')", 'pass'), events.__dict__)
headers = narc('a/0/1/2')[0]
assert len(headers) % 48 == 0
place_names = events.messages(narc('a/0/0/2')[89])
zones = {}
for zone in range(len(headers) // 48):
    values = struct.unpack_from('<BBHHHHH4HHHHHHHHHiii', headers, zone * 48)
    record = events.entities(narc('a/1/2/5')[values[12]])
    name_id = struct.unpack_from('<H', headers, zone * 48 + 26)[0] & 1023
    zones[zone] = {'name': place_names[name_id], 'header': list(values), 'matrix': values[3], 'script': values[4], 'text': values[6], 'music': values[7], **record}

matrix = narc('a/0/0/9')[0]
width, height = struct.unpack_from('<HH', matrix, 4)
grid = struct.unpack_from(f'<{width * height}I', matrix, 8 + width * height * 4)
neighbors = {zone: set() for zone in zones}
for row in range(height):
    for col in range(width):
        zone = grid[row * width + col]
        if zone not in zones:
            continue
        for x, y in [(col - 1, row), (col + 1, row), (col, row - 1), (col, row + 1)]:
            if 0 <= x < width and 0 <= y < height:
                other = grid[y * width + x]
                if other in zones and other != zone:
                    neighbors[zone].add(other)
for zone, record in zones.items():
    record['adjacentOutdoorZones'] = sorted(neighbors[zone])
    record['warpDestinations'] = sorted({warp['zone'] for warp in record['warps']})

focus = sorted({113, 114, *neighbors[113], *zones[113]['warpDestinations']})
chapter_names = ['Mistralopoli', 'Torre Dragospira', 'Castello Sepolto', 'Boreduopoli', 'Percorso 8', 'Percorso 9', 'Ponte Propoli', 'Deserto della Quiete']
named = {zone: record['name'] for zone, record in zones.items() if any(name in record['name'] for name in chapter_names)}
report = {'source': 'User-provided IRBI ROM, native headers/entities/matrix0', 'scope': 'Read-only reference; not gameplay integration', 'globalMatrix': {'width': width, 'height': height}, 'focus': focus, 'zones': zones}
report['chapterNameMatches'] = named
args.report.parent.mkdir(parents=True, exist_ok=True)
args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf8', newline='\n')
for zone in focus:
    record = zones[zone]
    print(zone, 'matrix', record['matrix'], 'script', record['script'], 'text', record['text'], 'outdoor', record['adjacentOutdoorZones'], 'warps', record['warpDestinations'])
print('Reference zones:', len(zones), '; no runtime files modified')
print('Native place-name matches:', json.dumps(named, ensure_ascii=False))
