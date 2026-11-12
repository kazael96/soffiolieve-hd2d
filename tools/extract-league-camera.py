"""Export only native camera presets actually referenced by chapter052."""
import argparse
import hashlib
import json
import struct
from pathlib import Path
from irbi_reader import NintendoDSRom, NARC, code_decompress

ROOT = Path(__file__).resolve().parents[1]


def extract(rom_path, output):
    rom = NintendoDSRom.fromFile(rom_path)
    if rom.idCode != b'IRBI':
        raise ValueError('Expected Italian Black')
    arm = code_decompress(rom.arm9)
    pointer = struct.unpack_from('<I', arm, 0x020a6b58 - rom.arm9RamAddress + 163 * 4)[0]
    name = arm[pointer - rom.arm9RamAddress:].split(b'\0', 1)[0].decode('ascii')
    if name != 'a/1/6/3':
        raise ValueError('Native NARC163 table changed')
    text = (ROOT / 'src/league-events.js').read_text(encoding='utf-8')
    events = json.loads(text.split('=', 1)[1].strip().rstrip(';'))
    ids = sorted({row['args'][0] for bank in events['scripts'].values() for row in bank['code'].values() if row['name'] == 'NativeOpcode326'})
    files = NARC(rom.getFileByName(name)).files
    presets = {}
    for identifier in ids:
        raw = bytes(files[identifier])
        if len(raw) != 44:
            raise ValueError('Camera layout changed')
        pitch, yaw, distance, x, y, z, *flags = struct.unpack('<HH10i', raw)
        presets[str(identifier)] = {'pitchTurn16': pitch, 'yawTurn16': yaw, 'distanceFx': distance, 'targetFx': [x, y, z], 'flags': flags, 'sourceSha256': hashlib.sha256(raw).hexdigest()}
    data = {'source': 'IRBI NARC163/a/1/6/3; overlay21:021b5310, ARM9 table020a6b58', 'arm9Sha256': hashlib.sha256(arm).hexdigest(), 'presets': presets}
    output.write_text('window.LEAGUE_CAMERA_PRESETS=' + json.dumps(data, separators=(',', ':')) + ';\n', encoding='utf-8')
    print('Exported native camera presets', ids)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('rom', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    extract(args.rom, args.output)
