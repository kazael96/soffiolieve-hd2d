"""Read the IRBI OP139 trainer-class music table, without rendering audio."""
import argparse
import hashlib
import json
from pathlib import Path
import struct

ARM9_SHA = 'a972ed6ac0177f1b86dce216d5377e49a96b5e8b5ac9055bc56a74c5fc855ba5'


def read_table(arm9, base):
    def offset(address, size):
        at = address - base
        if at < 0 or at + size > len(arm9):
            raise ValueError('Trainer music pointer outside ARM9')
        return at
    def u32(address):
        return struct.unpack_from('<I', arm9, offset(address, 4))[0]
    classes, music, fallback = [u32(a) for a in [0x2029dcc, 0x2029dd0, 0x2029dd4]]
    if music != classes + 2 or not 1000 <= fallback < 1300:
        raise ValueError('Unreviewed trainer music table layout')
    result = {}
    for index in range(106):
        klass, sequence = struct.unpack_from('<HH', arm9, offset(classes + index * 4, 4))
        if klass == 105:
            return {'source': 'IRBI OP139 021aeb40 -> ARM9 02029da0', 'arm9Sha256': hashlib.sha256(arm9).hexdigest(),
                    'fallback': fallback, 'classMusic': result}
        if not 0 <= klass < 105 or str(klass) in result or not 1000 <= sequence < 1300:
            raise ValueError('Invalid native trainer music row')
        result[str(klass)] = sequence
    raise ValueError('Missing native trainer music sentinel')


def main():
    from irbi_reader import NintendoDSRom, code_decompress
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('rom', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    rom = NintendoDSRom.fromFile(args.rom)
    if rom.idCode != b'IRBI':
        raise ValueError('Expected Italian Pokemon Black ROM')
    arm9 = code_decompress(rom.arm9)
    if hashlib.sha256(arm9).hexdigest() != ARM9_SHA:
        raise ValueError('Unreviewed IRBI ARM9')
    data = read_table(arm9, rom.arm9RamAddress)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text('window.TRAINER_INTRO_MUSIC=' + json.dumps(data, separators=(',', ':')) + ';\n', encoding='utf-8')
    print('Original trainer-class music:', len(data['classMusic']), 'rows; fallback', data['fallback'])


if __name__ == '__main__':
    main()
