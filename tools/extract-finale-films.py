"""Export five native first-ending films, rejecting unsupported bound materials."""
import argparse
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import shutil
import struct
import subprocess


def helper(name, filename):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name(filename))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


# Capture the full texture reader before the small ROM adapter installs ndspy.
patterns = helper('film_patterns', 'finale-field-patterns.py')
srt = helper('film_srt', 'native-texture-srt.py')
from irbi_reader import NintendoDSRom, NARC
inspect = helper('film_source', 'inspect-finale-films.py').inspect


def material_tracks(raw):
    if raw[:4] != b'BMA0' or raw[0x44:0x48] != b'M\0AM':
        raise ValueError('Invalid native material animation')
    start = 0x44
    frames = struct.unpack_from('<H', raw, start + 4)[0]
    alpha, color = {}, {}
    for name, entry in patterns.nitro.dictionary(raw, start + 8):
        if len(entry) != 20:
            raise ValueError('Invalid BMA channel record')
        channels = struct.unpack('<5I', entry)

        def samples(channel, width):
            if channel & 0x20000000:
                return [channel & 65535] * frames
            if channel >> 16 != frames:
                raise ValueError('Unsupported sparse native BMA channel')
            return [struct.unpack_from('<H' if width == 2 else '<B', raw, start + (channel & 65535) + i * width)[0] for i in range(frames)]

        if any(not value & 0x20000000 for value in channels[1:4]):
            raise ValueError('Animated secondary material channels need explicit shader support')
        alpha[name] = samples(channels[4], 1)
        if max(alpha[name]) > 31:
            raise ValueError('Invalid native material alpha')
        if not channels[0] & 0x20000000:
            color[name] = [[((v >> shift) & 31) / 31 for shift in [0, 5, 10]] for v in samples(channels[0], 2)]
    return alpha, color


def brightness(frames, events):
    values = [0] * frames
    for event in events:
        if event['kind'] != 10:
            continue
        screen, duration, begin, end = event['args'][:4]
        begin = begin-4294967296 if begin >= 2147483648 else begin
        end = end-4294967296 if end >= 2147483648 else end
        if screen != 1 or duration < 1 or not -16 <= begin <= 16 or not -16 <= end <= 16:
            raise ValueError('Unreviewed native screen brightness command')
        increment = int((end-begin)*4096/duration)
        for frame in range(event['frame'], frames):
            elapsed = frame-event['frame']
            values[frame] = end if elapsed >= duration else (begin*4096+increment*elapsed)//4096
    return values


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ['rom', 'output', 'work', 'apicula']:
        parser.add_argument('--' + key, type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    args.work.mkdir(parents=True, exist_ok=True)
    rom = NintendoDSRom.fromFile(args.rom)
    source = inspect(rom)
    files = NARC(rom.getFileByName('a/1/6/0')).files
    result = {'source': source, 'films': {}}
    for identifier in [6, 9, 10, 11, 12]:
        record = source['films'][identifier]
        camera_id = record['descriptor'][0] & 65535
        raw = files[camera_id]
        frames, kind = struct.unpack_from('<II', raw)
        if kind != 0x10100 or len(raw) != 8 + frames * 24:
            raise ValueError('Unexpected native camera format')
        camera = [list(struct.unpack_from('<6f', raw, 8 + frame * 24)) for frame in range(frames)]
        if not all(math.isfinite(v) for row in camera for v in row):
            raise ValueError('Nonfinite native camera')
        angle = record['descriptor'][4] * math.tau / 65536
        film = {'frames': frames, 'camera': camera, 'perspective': {'sin': math.sin(angle), 'cos': math.cos(angle), 'near': record['descriptor'][5] / 4096, 'far': record['descriptor'][6] / 4096}, 'models': {}, 'materialAlpha': {}, 'materialColor': {}, 'materialTextures': {}, 'materialUV': {}, 'timeline': record['events'], 'sourceCameraSHA256': hashlib.sha256(raw).hexdigest()}
        film['brightness'] = brightness(frames, record['events'])
        for index, members in enumerate(record['models']):
            key = 'part' + str(index)
            work = args.work / str(identifier) / key
            work.mkdir(parents=True, exist_ok=True)
            inputs = []
            for member in members:
                path = work / (str(member) + '.bin')
                path.write_bytes(files[member])
                inputs.append(str(path.resolve()))
            converted = work / 'converted'
            run = subprocess.run([str(args.apicula.resolve()), 'convert', *inputs, '-o', str(converted.resolve()), '-f', 'glb', '--all-animations', '--overwrite'], capture_output=True)
            (work / 'convert.log').write_bytes(run.stdout + run.stderr)
            run.check_returncode()
            destination = args.output / 'assets/finale/cinematics' / str(identifier) / key
            destination.mkdir(parents=True, exist_ok=True)
            for file in converted.iterdir():
                shutil.copyfile(file, destination / file.name)
            glbs = list(destination.glob('*.glb'))
            if len(glbs) != 1:
                raise ValueError('Expected one native model per film part')
            blob = glbs[0].read_bytes()
            doc = json.loads(blob[20:20 + struct.unpack_from('<I', blob, 12)[0]])
            resources = [files[member] for member in members if files[member][:4] != b'BMD0']
            native_model = next(files[member] for member in members if files[member][:4] == b'BMD0')
            blocks = struct.unpack_from('<' + 'I' * struct.unpack_from('<H', native_model, 14)[0], native_model, 16)
            tex = next(native_model[at:at+struct.unpack_from('<I', native_model, at+4)[0]] for at in blocks if native_model[at:at+4] == b'TEX0')
            container = struct.pack('<4sHHIHHI', b'BTX0', 0xfeff, 1, 20+len(tex), 16, 1, 20) + tex
            film['materialTextures'][key] = patterns.tracks(container, resources, len(resources), destination, args.output).get('0', {})
            material_sizes = {}
            for material in doc.get('materials', []):
                texture = material.get('pbrMetallicRoughness', {}).get('baseColorTexture', {}).get('index')
                if texture is not None:
                    uri = doc['images'][doc['textures'][texture]['source']]['uri']
                    image = (destination / uri).read_bytes()
                    if image[:8] != b'\x89PNG\r\n\x1a\n':
                        raise ValueError('Expected original PNG texture dimensions')
                    material_sizes[material['name']] = struct.unpack_from('>II', image, 16)
            film['materialUV'][key] = srt.maya_matrix_tracks(resources, doc, material_sizes)
            for animation in resources:
                if animation[:4] == b'BMA0':
                    film['materialAlpha'][key], film['materialColor'][key] = material_tracks(animation)
            film['models'][key] = {'url': glbs[0].relative_to(args.output).as_posix(), 'members': members, 'sha256': hashlib.sha256(blob).hexdigest(), 'bindings': srt.animation_bindings(resources, len(resources), doc).get('0', []), 'materials': [m['name'] for m in doc.get('materials', [])]}
            print(identifier, key, 'native members', members, 'bound recovered UV', len(film['materialUV'][key]), flush=True)
        result['films'][identifier] = film
    (args.output / 'finale-cinematics-data.js').write_text('window.FINALE_CINEMATICS=' + json.dumps(result, separators=(',', ':')) + ';\n', encoding='utf-8')
    print('Exported five original films; audio and runtime validation remain separate')


if __name__ == '__main__':
    main()
