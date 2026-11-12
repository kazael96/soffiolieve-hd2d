"""Preserve original BTP texture/palette bindings alongside converted field joints."""
from pathlib import Path
import importlib.util
import struct
import hashlib
import ndspy.texture as texture_reader
import ndspy.color as color_reader

spec = importlib.util.spec_from_file_location('reviewed_nitro_patterns', Path(__file__).with_name('extract-league-gym.py'))
nitro = importlib.util.module_from_spec(spec)
spec.loader.exec_module(nitro)


def tracks(texture, resources, per_set, destination, output):
    relevant = [(index, raw) for index, raw in enumerate(resources) if raw[:4] == b'BTP0']
    if not relevant:
        return {}
    color_reader.prepareLUTs()
    reader = texture_reader.NSBTX(texture)
    textures, palettes = dict(reader.textures), dict(reader.palettes)
    blocks = struct.unpack_from('<'+'I'*struct.unpack_from('<H', texture, 14)[0], texture, 16)
    tex = next(texture[at:at+struct.unpack_from('<I', texture, at+4)[0]] for at in blocks if texture[at:at+4] == b'TEX0')
    size = struct.unpack_from('<H', tex, 0x30)[0]*8
    dictionary, start = struct.unpack_from('<2I', tex, 0x34)
    offsets = {name: start+struct.unpack('<HH', entry)[0]*8 for name, entry in nitro.dictionary(tex, dictionary)}
    ends = sorted(set(offsets.values()) | {start+size})
    for name, offset in offsets.items():
        end = next((value for value in ends if value>offset), None)
        if end is None or not start<=offset<end<=start+size or (end-offset)%2:
            raise ValueError('Invalid original field palette range')
        palettes[name].colors = list(struct.unpack('<'+'H'*((end-offset)//2), tex[offset:end]))
    result = {}
    for index, raw in relevant:
        state = str(index//per_set)
        target = result.setdefault(state, {})
        native = nitro.native_track(raw)
        for material, keys in nitro.pattern_tracks(raw).items():
            if material in target:
                raise ValueError('Conflicting native material pattern')
            for key in keys:
                image = destination/(key['texture'].replace('.', '_')+'--'+key['palette'].replace('.', '_')+'.png')
                if image.parent != destination:
                    raise ValueError('Original pattern name escapes destination')
                rendered = textures[key['texture']].renderAsImage(palettes[key['palette']])
                rendered.save(image)
                key.update(url=image.relative_to(output).as_posix(), w=rendered.width, h=rendered.height, sourceSHA256=native['nativeSha256'], imageSHA256=hashlib.sha256(image.read_bytes()).hexdigest())
            target[material] = keys
    return result


def duration(raw):
    if raw[:4] in (b'BCA0', b'BTP0', b'BTA0'):
        return nitro.native_track(raw)['nativeFrames']
    if raw[:4] == b'BMA0':
        return struct.unpack_from('<H', raw, 0x48)[0]
    raise ValueError('Unsupported native animation format')
