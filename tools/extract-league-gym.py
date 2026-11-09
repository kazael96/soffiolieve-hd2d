"""Export original Drayden models/tracks and placement tables; not a puzzle controller."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import struct
import subprocess

from irbi_reader import NintendoDSRom, NARC
from nitro_geometry import flatten_glb

OVERLAY_SHA = '3ebd5f85a5d2564762a988cd7889da4ffb4f53bbbc49c55e9d87b6af01592244'


def dictionary(raw, offset):
    count = raw[offset + 1]
    entries = offset + struct.unpack_from('<H', raw, offset + 6)[0]
    size, names = struct.unpack_from('<HH', raw, entries)
    if entries + names + count * 16 > len(raw) or entries + 4 + count * size > len(raw):
        raise ValueError('Truncated Nitro dictionary')
    return [(raw[entries + names + i * 16:entries + names + (i + 1) * 16].split(b'\0')[0].decode('ascii'),
             raw[entries + 4 + i * size:entries + 4 + (i + 1) * size]) for i in range(count)]


def native_track(raw):
    expected = {b'BCA0': b'JNT0', b'BTA0': b'SRT0', b'BTP0': b'PAT0'}
    block = struct.unpack_from('<I', raw, 16)[0]
    if raw[:4] not in expected or raw[block:block + 4] != expected[raw[:4]]:
        raise ValueError('Unreviewed Nitro animation format')
    entries = dictionary(raw, block + 8)
    if len(entries) != 1 or len(entries[0][1]) != 4:
        raise ValueError('Expected one native track')
    name, pointer = entries[0]
    animation = block + struct.unpack('<I', pointer)[0]
    frames = struct.unpack_from('<H', raw, animation + 4)[0]
    if not frames:
        raise ValueError('Empty native track')
    return {'name': name, 'nativeFrames': frames, 'format': raw[:4].decode('ascii'),
            'nativeSha256': hashlib.sha256(raw).hexdigest()}


def rows(overlay, address, count, fmt):
    size = struct.calcsize(fmt)
    offset = address - overlay.ramAddress
    if offset < 0 or count < 0 or offset + count * size > len(overlay.data):
        raise ValueError('Native table outside overlay46')
    return [list(struct.unpack_from(fmt, overlay.data, offset + i * size)) for i in range(count)]


def reference(overlay, archive):
    if hashlib.sha256(overlay.data).hexdigest() != OVERLAY_SHA:
        raise ValueError('Unreviewed Drayden overlay')
    ptr, count, model_ptr, model_count = rows(overlay, 0x021f4000, 1, '<4I')[0]
    resources = rows(overlay, ptr, count, '<3I')
    if count != 19 or model_count != 16 or any(a != 162 or flag for a, _, flag in resources):
        raise ValueError('Unreviewed Drayden resource table')
    if [bytes(raw[:4]) for raw in archive] != [b'BMD0'] * 4 + [b'BCA0'] * 12 + [b'BMD0', b'BTP0', b'BTA0']:
        raise ValueError('Incomplete Drayden archive')
    descriptors = []
    for index, (model, texture, tracks, track_count) in enumerate(rows(overlay, model_ptr, model_count, '<4I')):
        if model != texture or not 0 <= model < count:
            raise ValueError('Invalid Drayden model descriptor')
        indices = [item[0] for item in rows(overlay, tracks, track_count, '<I')]
        if any(i >= count for i in indices):
            raise ValueError('Invalid Drayden animation descriptor')
        descriptors.append({'index': index, 'model': resources[model][1], 'tracks': [resources[i][1] for i in indices]})
    a = rows(overlay, 0x021f4074, 3, '<3i')
    b = rows(overlay, 0x021f4050, 3, '<3i')
    c = rows(overlay, 0x021f40e4, 6, '<3i')
    instances = []
    for dragon in range(3):
        for local, origin in enumerate([a[dragon], b[dragon], b[dragon], c[dragon * 2], c[dragon * 2 + 1]]):
            native = [n / 65536 for n in origin]
            instances.append({'index': dragon * 5 + local, 'nativeOrigin': native,
                              'worldOrigin': [native[0] - 16, native[1], native[2] - 16],
                              'rotationRaw': rows(overlay, 0x021f3fe8 + dragon * 2, 1, '<H')[0][0] if local < 3 else 0})
    native = [n / 65536 for n in rows(overlay, 0x021f4098, 1, '<3i')[0]]
    instances.append({'index': 15, 'nativeOrigin': native, 'worldOrigin': [native[0] - 16, native[1], native[2] - 16], 'rotationRaw': 0})
    return {'zone': 121, 'source': 'IRBI overlay46:021f4000 + archive162 a/1/6/2', 'overlaySha256': OVERLAY_SHA,
            'resources': resources, 'descriptors': descriptors, 'instances': instances,
            'collisionStateRows': rows(overlay, 0x021f4310, 12, '<6I'),
            'resourceHashes': {i: hashlib.sha256(raw).hexdigest() for i, raw in enumerate(archive)},
            'geometry': {}, 'textures': {}, 'models': {},
            'adaptation': 'Original geometry/tracks/placement only. Native tasks, collision transitions and checkpoints still require integration.'}


def quiet_run(command, **kwargs):
    if os.name == 'nt':
        kwargs['creationflags'] = kwargs.get('creationflags', 0) | 0x08000000
    return subprocess.run(command, **kwargs)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('rom', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--apicula', type=Path, required=True)
    parser.add_argument('--work-dir', type=Path, required=True)
    args = parser.parse_args()
    rom = NintendoDSRom.fromFile(args.rom)
    if rom.idCode != b'IRBI':
        raise ValueError('Expected IRBI ROM')
    archive = NARC(rom.getFileByName('a/1/6/2')).files
    data = reference(rom.loadArm9Overlays([46])[46], archive)
    for descriptor in data['descriptors']:
        member = descriptor['model']
        key = 'lg-gym-' + str(member)
        if key in data['models']:
            if data['models'][key]['tracks'] != descriptor['tracks']:
                raise ValueError('Conflicting model tracks')
            continue
        model = data['models'][key] = {'member': member, 'tracks': descriptor['tracks'], 'states': []}
        for track in descriptor['tracks']:
            work = args.work_dir / key / str(track)
            work.mkdir(parents=True, exist_ok=True)
            inputs = []
            for index in [member, track]:
                file = work / f'{index}.bin'
                file.write_bytes(archive[index])
                inputs.append(str(file.resolve()))
            converted = work / 'converted'
            result = quiet_run([str(args.apicula.resolve()), 'convert', *inputs, '-o', str(converted.resolve()),
                                '-f', 'glb', '--all-animations', '--overwrite'], check=True, capture_output=True, text=True)
            (work / 'apicula.log').write_text(result.stdout + '\n' + result.stderr, encoding='utf-8')
            glbs = list(converted.glob('*.glb'))
            if len(glbs) != 1:
                raise ValueError('Expected one converted Drayden model')
            glb = glbs[0]
            dest = args.output / 'assets/league/gym' / key / str(track)
            dest.mkdir(parents=True, exist_ok=True)
            (dest / 'native.bin').write_bytes(archive[track])
            for file in converted.iterdir():
                if file.suffix in ['.glb', '.png']:
                    shutil.copyfile(file, dest / file.name)
            if key not in data['geometry']:
                geometry, textures = flatten_glb(glb, key, args.output / 'assets/league', 'assets/league')
                data['geometry'][key] = geometry
                data['textures'].update(textures)
            raw = glb.read_bytes()
            doc = json.loads(raw[20:20 + struct.unpack_from('<I', raw, 12)[0]])
            animations = doc.get('animations', [])
            # Retain unsupported BTP/UV bindings explicitly; never invent a joint track.
            model['states'].append({'member': track, **native_track(archive[track]),
                                    'nativeUrl': f'assets/league/gym/{key}/{track}/native.bin',
                                    'url': f'assets/league/gym/{key}/{track}/{glb.name}',
                                    'convertedAnimations': len(animations),
                                    'binding': 'converted' if animations else 'not-converted',
                                    'lastFrames60': [round(max((doc['accessors'][s['input']].get('max', [0])[0]
                                                                for s in anim['samplers']), default=0) * 60) for anim in animations]})
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output / 'league-gym-data.js').write_text('window.LEAGUE_GYM_DATA=' + json.dumps(data, separators=(',', ':')) + ';\n', encoding='utf-8', newline='\n')
    (args.work_dir / 'extraction-report.json').write_text(json.dumps({k: v for k, v in data.items() if k not in ['geometry', 'textures']}, indent=2), encoding='utf-8')
    print('Drayden: 5 models, 16 instances, original track references; runtime controller not integrated')


if __name__ == '__main__':
    main()
