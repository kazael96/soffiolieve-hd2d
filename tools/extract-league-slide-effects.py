"""Export IRBI's original field-slide dust, including shared TEX0 palettes.

This exports assets only. Runtime integration and graphical acceptance remain
separate. Conversion is invisible and raw executables stay outside the site.
"""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import struct
import subprocess
import sys

from irbi_reader import NintendoDSRom, NARC

MODEL_SHA = '57aa837573bcdab619b7ce7e036422f134b2ad401b5894dd0172cad9c0b4b0e6'
PATTERN_SHA = '3d1d16e46bfc1bf7e3c4bebe8cfbd6e90811c7a918f7ab1361f8b3cbd2c18f31'
OVERLAY_SHA = '183a65b049bc622a6ca1f2c75b28b943f1541e949da6055a7612abdda059099e'


def palette_ranges(entries, data_offset, data_length, block_length):
    """Alias names share a span; the next *distinct* offset terminates it."""
    if not entries or data_offset < 0 or data_length <= 0 or data_offset + data_length > block_length:
        raise ValueError('Invalid native palette data range')
    offsets = {}
    for name, offset in entries:
        if name in offsets or not isinstance(offset, int) or offset < 0 or offset * 8 >= data_length:
            raise ValueError('Invalid native palette entry')
        offsets[name] = data_offset + offset * 8
    bounds = sorted(set([*offsets.values(), data_offset + data_length]))
    return {name: (start, next(end for end in bounds if end > start)) for name, start in offsets.items()}


def export(args):
    sys.path.insert(0, str(args.dependencies.resolve()))
    import ndspy.texture
    import ndspy.color
    from nitro_geometry import flatten_glb
    spec = importlib.util.spec_from_file_location('slide_native_patterns', Path(__file__).with_name('extract-league-gym.py'))
    gym = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(gym)
    rom = NintendoDSRom.fromFile(args.rom)
    if rom.idCode != b'IRBI':
        raise ValueError('Expected Italian Black IRBI')
    overlay = rom.loadArm9Overlays([21])[21]
    if hashlib.sha256(overlay.data).hexdigest() != OVERLAY_SHA:
        raise ValueError('Unreviewed field overlay')
    native = lambda address: struct.unpack_from('<I', overlay.data, address - overlay.ramAddress)[0]
    if native(0x021ac474) != 0x021d8f94 or native(0x021d8e48 + 12) != 1 or native(0x021d8e48 + 16) != 0x021ac395:
        raise ValueError('Unreviewed dust registration')
    files = NARC(rom.getFileByName('a/0/7/5')).files
    model, pattern = files[48], files[96]
    if hashlib.sha256(model).hexdigest() != MODEL_SHA or hashlib.sha256(pattern).hexdigest() != PATTERN_SHA:
        raise ValueError('Unreviewed dust resources')
    args.work.mkdir(parents=True, exist_ok=True)
    destination = args.output / 'assets/league/slide'
    if destination.exists():
        raise ValueError('Refusing to overwrite existing dust assets')
    destination.mkdir(parents=True)
    inputs = []
    for number, raw in [(48, model), (96, pattern)]:
        file = args.work / f'{number}.bin'
        file.write_bytes(raw)
        inputs.append(str(file.resolve()))
    command = [str(args.apicula.resolve()), 'convert', *inputs, '-o', str(destination.resolve()), '-f', 'glb', '--all-animations', '--overwrite']
    proc = subprocess.run(command, capture_output=True, creationflags=0x08000000 if os.name == 'nt' else 0)
    (args.work / 'convert.log').write_bytes(proc.stdout + proc.stderr)
    proc.check_returncode()
    blocks = struct.unpack_from('<' + 'I' * struct.unpack_from('<H', model, 14)[0], model, 16)
    at = next(at for at in blocks if model[at:at + 4] == b'TEX0')
    tex = model[at:at + struct.unpack_from('<I', model, at + 4)[0]]
    header = struct.unpack_from('<IHH3IHH4IHH2I', tex, 8)
    length, directory, start = header[-4] * 8, header[-2], header[-1]
    entries = gym.dictionary(tex, directory)
    if any(len(entry) != 4 for _, entry in entries):
        raise ValueError('Unreviewed palette entry size')
    ranges = palette_ranges([(name, struct.unpack('<HH', entry)[0]) for name, entry in entries], start, length, len(tex))
    container = struct.pack('<4sHHIHHI', b'BTX0', 0xfeff, 1, 20 + len(tex), 16, 1, 20) + tex
    data = ndspy.texture.NSBTX(container)
    textures, palettes = dict(data.textures), dict(data.palettes)
    for name, (begin, end) in ranges.items():
        palettes[name].colors = list(struct.unpack('<' + 'H' * ((end - begin) // 2), tex[begin:end]))
    ndspy.color.prepareLUTs()
    tracks = gym.pattern_tracks(pattern)
    native_track = gym.native_track(pattern)
    if list(tracks) != ['hero_kemu'] or native_track['nativeFrames'] != 12 or [k['frame'] for k in tracks['hero_kemu']] != [0, 3, 6, 9]:
        raise ValueError('Unreviewed dust pattern timeline')
    for key in tracks['hero_kemu']:
        image = textures[key['texture']].renderAsImage(palettes[key['palette']])
        file = destination / (key['texture'].replace('.', '_') + '--native.png')
        image.save(file)
        key['url'] = file.relative_to(args.output).as_posix()
    geometry, converted_textures = flatten_glb(next(destination.glob('*.glb')), 'league-slide-dust', destination, 'assets/league/slide')
    result = {'source': {'rom': 'IRBI', 'archive': 'a/0/7/5', 'model': 48, 'pattern': 96, 'modelSha256': MODEL_SHA, 'patternSha256': PATTERN_SHA, 'overlaySha256': OVERLAY_SHA, 'spawn': '021ac428', 'descriptor': '021d8f94'},
              'frames': 12, 'keys': tracks['hero_kemu'], 'paletteRanges': ranges, 'geometry': geometry, 'textures': converted_textures,
              'offset': [0, 1 / 16, 6 / 16], 'intervalFrames': 2,
              'scope': 'Original assets only; native billboard and world presentation need runtime acceptance'}
    (args.work / 'extraction-report.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
    vertices = [group['verts'] for group in geometry['groups']]
    xs = [values[i] for values in vertices for i in range(0, len(values), 11)]
    ys = [values[i + 1] for values in vertices for i in range(0, len(values), 11)]
    result.pop('geometry')
    result.pop('textures')
    result['worldSize'] = [max(xs) - min(xs), max(ys) - min(ys)]
    if result['worldSize'] != [2, 1]:
        raise ValueError('Unreviewed native dust quad')
    (args.output / 'league-slide-effects-data.js').write_text('window.LEAGUE_SLIDE_EFFECTS=' + json.dumps(result, separators=(',', ':')) + ';\n', encoding='utf-8')
    print('Original slide dust: 4 pattern keys,12frames; asset export only')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ['rom', 'output', 'work', 'dependencies', 'apicula']:
        parser.add_argument('--' + key, type=Path, required=True)
    export(parser.parse_args())
