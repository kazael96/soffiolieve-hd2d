"""Decode original overlay56 entrance sound controls; these nine channels are not transforms."""
from pathlib import Path
import argparse
import hashlib
import json
import math
import struct
from irbi_reader import NintendoDSRom, NARC, code_decompress


def extract(rom):
    arm = code_decompress(rom.arm9)
    pointer = struct.unpack_from('<I', arm, 0x20a6b58-rom.arm9RamAddress+150*4)[0]
    name = arm[pointer-rom.arm9RamAddress:].split(b'\0', 1)[0].decode('ascii')
    if name != 'a/1/5/0':
        raise ValueError('Unexpected original archive150')
    archive = NARC(rom.getFileByName(name)).files
    overlay = rom.loadArm9Overlays([56])[56]
    data, base = overlay.data, overlay.ramAddress
    digest = hashlib.sha256(data).hexdigest()
    if digest != '5b4a33c20a371fb7b13ebeeead7cf0f2e450a9cbc009fdca693cd58d08b527a2':
        raise ValueError('Unreviewed original overlay56')
    sounds = struct.unpack_from('<36H', data, 0x21f4284-base)
    rooms = {}
    # 201183c deinterleaves S/R/T into +24/+20/+1c. The caller21f3f80
    # reads T(2011610), S(2011660), R(2011638) into sound channels0..8.
    order = [6, 7, 8, 0, 1, 2, 3, 4, 5]
    for room in range(4):
        raw = archive[28+room]
        frames, kind = struct.unpack_from('<2I', raw)
        if kind != 0x10101 or len(raw) != 8+36*frames:
            raise ValueError('Unexpected native sound-control format')
        ids = sounds[room*9:room*9+9]
        events = []
        for frame in range(frames):
            sample = struct.unpack_from('<9f', raw, 8+36*frame)
            if not all(math.isfinite(value) for value in sample):
                raise ValueError('Invalid native sound-control value')
            for channel, offset in enumerate(order):
                value = sample[offset]
                if ids[channel] != 0xffff and value in (1, 2):
                    events.append({'frame': frame, 'channel': channel, 'id': ids[channel], 'action': 'play' if value == 1 else 'stop'})
        rooms[str(140+room)] = {'frames': frames, 'member': 28+room, 'sourceSHA256': hashlib.sha256(raw).hexdigest(), 'soundIds': list(ids), 'events': events,
                                 'destination': list(struct.unpack_from('<3i', data, 0x21f41e8-base+12*room)), 'facing': struct.unpack_from('<H', data, 0x21f4144-base+2*room)[0]}
    return {'source': 'IRBI overlay56:021f3f80/021f4104/021f411c, table021f4284; native archive150 members28..31', 'overlaySHA256': digest, 'channels': order, 'rooms': rooms}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rom', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    result = extract(NintendoDSRom.fromFile(args.rom))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text('window.FINALE_ELITE_CONTROLS='+json.dumps(result, separators=(',', ':'))+';\n', encoding='utf8')
    print('Decoded4native sound-control tracks:', sum(len(room['events']) for room in result['rooms'].values()), 'events.')


if __name__ == '__main__':
    main()
