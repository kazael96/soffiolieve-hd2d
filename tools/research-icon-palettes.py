"""Locate a native menu palette LUT using previously reviewed icon selections.

Matches are evidence for review, never automatically accepted as runtime data.
"""
import argparse
import json
import struct
from pathlib import Path
from irbi_reader import NintendoDSRom, code_decompress

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('rom', type=Path)
parser.add_argument('report', type=Path)
args = parser.parse_args()
rom = NintendoDSRom.fromFile(args.rom)
assert rom.idCode == b'IRBI'
known = {497: 1, 500: 0, 503: 2, 519: 0, 522: 0, 524: 0, 527: 0,
         532: 1, 535: 2, 537: 0, 560: 0, 562: 0, 569: 1, 577: 1, 578: 1,
         591: 0, 594: 0, 596: 0, 600: 0, 603: 0, 604: 0, 605: 0, 607: 0,
         610: 1, 613: 0, 614: 0, 615: 0, 616: 0, 618: 2, 622: 0}
new_ids = [553, 556, 558, 563, 576, 593, 598, 606, 608, 611, 619, 621, 623, 624, 626]
regions = [('arm9', rom.arm9RamAddress, code_decompress(rom.arm9))]
regions += [(f'overlay{key}', ov.ramAddress, ov.data) for key, ov in rom.loadArm9Overlays().items()]
matches = []
for name, address, raw in regions:
    for stride in [1, 2, 4]:
        at = raw.find(b'\x01')
        while at != -1:
            start = at - 497 * stride
            if start >= 0 and start + 650 * stride <= len(raw) and all(raw[start + sid * stride] == value for sid, value in known.items()):
                pointer = address + start
                refs = [hex(address + off) for off in range(len(raw) - 3) if raw[off:off + 4] == struct.pack('<I', pointer)]
                matches.append({'region': name, 'address': hex(pointer), 'offset': start, 'stride': stride,
                                'knownMatches': len(known), 'literalReferencesInRegion': refs,
                                'newPaletteCandidates': {sid: raw[start + sid * stride] for sid in new_ids}})
            at = raw.find(b'\x01', at + 1)
report = {'source': 'Read-only IRBI decompressed ARM9/overlays', 'status': 'Candidates require native caller review', 'matches': matches}
args.report.parent.mkdir(parents=True, exist_ok=True)
args.report.write_text(json.dumps(report, indent=2), encoding='utf8', newline='\n')
print(json.dumps(report, indent=2))
