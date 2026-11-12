"""Inspect explicitly owned overlay203 movie records for the IRBI first ending."""
import argparse
import hashlib
import json
import struct
from pathlib import Path
from irbi_reader import NintendoDSRom


def inspect(rom):
    if rom.idCode != b'IRBI':
        raise ValueError('Expected Italian Black ROM')
    overlay = rom.loadArm9Overlays([203])[203]
    data, base = overlay.data, overlay.ramAddress

    def words(address, count):
        at = address - base
        if not 0 <= at <= len(data) - count * 4:
            raise ValueError('Record outside explicitly owned overlay203')
        return list(struct.unpack_from('<' + str(count) + 'I', data, at))

    def leaf(pointer, count, seen=()):
        if pointer in seen or len(seen) > 8 or not 1 <= count <= 100:
            raise ValueError('Invalid model descriptor')
        first = words(pointer, 1)[0]
        if base <= first < base + len(data):
            child, length = words(pointer, 2)
            return leaf(child, length, (*seen, pointer))
        at = pointer - base
        return list(struct.unpack_from('<' + str(count) + 'H', data, at))

    result = {'owner': 'overlay203', 'base': hex(base), 'sha256': hashlib.sha256(data).hexdigest(), 'registry': '021c175c', 'films': {}}
    for identifier in [6, 9, 10, 11, 12, 13, 14]:
        row = words(0x21c175c + identifier * 20, 5)
        descriptor = words(row[0], 7)
        models = []
        for index in range(row[4]):
            pointer, count = words(row[3] + index * 8, 2)
            models.append(leaf(pointer, count))
        events = []
        for index in range(1000):
            raw = words(row[1] + index * 40, 10)
            events.append({'kind': raw[0], 'frame': raw[1], 'args': raw[2:]})
            if raw[0] == 18:
                break
        else:
            raise ValueError('No movie timeline sentinel')
        result['films'][identifier] = {'row': [hex(n) for n in row], 'descriptor': descriptor, 'models': models, 'events': events}
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rom', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    result = inspect(NintendoDSRom.fromFile(args.rom))
    args.output.write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    for identifier, film in result['films'].items():
        print(identifier, 'models', film['models'], 'events', len(film['events']), 'kinds', sorted({e['kind'] for e in film['events']}))
