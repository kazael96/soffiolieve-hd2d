"""Read Nitro SRT channels with native signed FX12 values and sparse-frame interpolation.

Reference: NitroSystem d636fb5/libraries/g3d/src/anm/nsbta.c and res_struct.h.
This decoder retains all five channels; the renderer adapter may support a
smaller set of matrix modes and must reject unsupported bound transforms.
"""
import importlib.util
from pathlib import Path
import struct
import re

spec = importlib.util.spec_from_file_location('reviewed_srt_dictionary', Path(__file__).with_name('extract-league-gym.py'))
nitro = importlib.util.module_from_spec(spec)
spec.loader.exec_module(nitro)

FX16, CONSTANT, STEP2, STEP4 = 0x10000000, 0x20000000, 0x40000000, 0x80000000


def signed32(value):
    return value-(1 << 32) if value & 0x80000000 else value


def sample(raw, base, info, value, frame, rotation=False):
    if not isinstance(frame, int) or frame < 0:
        raise ValueError('Invalid native SRT frame')
    if rotation and info & FX16:
        raise ValueError('Native rotation uses a packed sine/cosine pair')
    if info & CONSTANT:
        if rotation:
            return struct.unpack('<2h', struct.pack('<I', value))
        return signed32(value)
    mode = info & (STEP2 | STEP4)
    if mode == STEP2 | STEP4:
        raise ValueError('Reserved native SRT step')
    shift = 1 if mode == STEP2 else 2 if mode == STEP4 else 0
    step, end = 1 << shift, info & 0xffff

    def read(index):
        size = 4 if rotation or not info & FX16 else 2
        offset = base+value+index*size
        if index < 0 or offset < base or offset+size > len(raw):
            raise ValueError('Truncated native SRT channel')
        return struct.unpack_from('<2h' if rotation else '<h' if info & FX16 else '<i', raw, offset)

    remainder = frame % step
    if not remainder:
        values = read(frame >> shift)
    elif frame > end:
        values = read((end >> shift)+remainder)
    else:
        first, second = read(frame >> shift), read((frame >> shift)+1)
        values = tuple((a*(step-remainder)+b*remainder) >> shift for a, b in zip(first, second))
    return values if rotation else values[0]


def decode(raw):
    native = nitro.native_track(raw)
    if native['format'] != 'BTA0':
        raise ValueError('Expected original SRT track')
    block = struct.unpack_from('<I', raw, 16)[0]
    _, pointer = nitro.dictionary(raw, block+8)[0]
    start = block+struct.unpack('<I', pointer)[0]
    result = {**native, 'flags': raw[start+6], 'texMtxMode': raw[start+7], 'materials': {}}
    for name, entry in nitro.dictionary(raw, start+8):
        if len(entry) != 40:
            raise ValueError('Unexpected native SRT descriptor')
        descriptors = [struct.unpack_from('<2I', entry, i*8) for i in range(5)]
        frames = []
        for frame in range(native['nativeFrames']):
            scale_s, scale_t = [sample(raw, start, *descriptors[i], frame) for i in range(2)]
            sine, cosine = sample(raw, start, *descriptors[2], frame, rotation=True)
            trans_s, trans_t = [sample(raw, start, *descriptors[i], frame) for i in [3, 4]]
            frames.append([scale_s, scale_t, sine, cosine, trans_s, trans_t])
        result['materials'][name] = frames
    return result


def translation_tracks(resources, per_set, doc):
    """Recover only missing Maya translations; do not replace converted joints/SRT."""
    materials = {material['name'] for material in doc.get('materials', [])}
    converted = set()
    for animation in doc.get('animations', []):
        for channel in animation.get('extensions', {}).get('EXT_property_animation', {}).get('channels', []):
            match = re.match(r'/materials/(\d+)/', channel.get('target', ''))
            if match:
                converted.add(doc['materials'][int(match[1])]['name'])
    result = {}
    for index, raw in enumerate(resources):
        if raw[:4] != b'BTA0':
            continue
        data = decode(raw)
        for name, frames in data['materials'].items():
            if name not in materials or name in converted:
                continue
            if data['texMtxMode'] != 0 or any(values[:4] != [4096, 4096, 0, 4096] for values in frames):
                raise ValueError('Bound native texture scale/rotation requires full matrix support')
            target = result.setdefault(str(index//per_set), {})
            if name in target:
                raise ValueError('Conflicting native SRT material')
            target[name] = {'sourceSHA256': data['nativeSha256'], 'matrixMode': 'native-maya-translation',
                            'frames': [[-values[4]/4096, values[5]/4096] for values in frames]}
    return result


def maya_matrix_tracks(resources, doc, material_sizes):
    """Native Maya matrix, in normalized UV units (NitroSystem maya.c).

    Keep the scale and its effect on both translations. Do not substitute an
    identity matrix when apicula omitted a bound animation. Original texture
    dimensions preserve the native fixed-point aspect conversion for rotation.
    """
    materials = {material['name'] for material in doc.get('materials', [])}
    result = {}
    for raw in resources:
        if raw[:4] != b'BTA0':
            continue
        data = decode(raw)
        for name, frames in data['materials'].items():
            if name not in materials:
                continue
            if data['texMtxMode'] != 0:
                raise ValueError('Only the reviewed native Maya matrix mode is supported')
            width, height = material_sizes[name]
            if name in result:
                raise ValueError('Conflicting native SRT film material')
            values = []
            for scale_s, scale_t, sine, cosine, trans_s, trans_t in frames:
                # C shift14 truncation matches the SDK Q12->Q16 translation.
                us = (scale_s * trans_s) >> 8
                vt = (scale_t * trans_t) >> 8
                ss_sin, ss_cos = (scale_s*sine) >> 12, (scale_s*cosine) >> 12
                st_sin, st_cos = (scale_t*sine) >> 12, (scale_t*cosine) >> 12
                ratio_hw, ratio_wh = round(height/width*4096), round(width/height*4096)
                m01 = (-st_sin*ratio_hw) >> 12
                m10 = (ss_sin*ratio_wh) >> 12
                values.append([ss_cos/4096, m01*width/height/4096, 0,
                               m10*height/width/4096, st_cos/4096, 0,
                               (-ss_sin-ss_cos+scale_s)/8192-us/65536,
                               (st_sin-st_cos-scale_t+8192)/8192+vt/65536, 1])
            result[name] = {'sourceSHA256': data['nativeSha256'], 'matrixMode': 'native-maya', 'frames': values}
    return result


def animation_bindings(resources, per_set, doc):
    result = {}
    for resource_index, raw in enumerate(resources):
        if raw[:4] not in (b'BCA0', b'BTA0'):
            continue
        native = nitro.native_track(raw)
        kind = 'joint' if raw[:4] == b'BCA0' else 'material'
        found = []
        for index, animation in enumerate(doc.get('animations', [])):
            if animation.get('name') != native['name']:
                continue
            channels = animation.get('channels', []) if kind == 'joint' else animation.get('extensions', {}).get('EXT_property_animation', {}).get('channels', [])
            if kind == 'joint':
                channels = [channel for channel in channels if 'node' in channel.get('target', {})]
            if channels:
                found.append({'index': index, 'kind': kind, 'frames': native['nativeFrames']})
        if kind == 'joint' and not found:
            raise ValueError('Original joint animation was not converted')
        result.setdefault(str(resource_index//per_set), []).extend(found)
    return result
