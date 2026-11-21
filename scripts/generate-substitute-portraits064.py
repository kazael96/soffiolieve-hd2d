#!/usr/bin/env python3
"""Reproduce the two genuine Substitute rest portraits from native bank cells.

The input is the verified asset package's assets/animated folder. Existing
portraits are preserved and must have identical decoded pixels. No ROM or
packed texture is modified; the source atlas is composed, never copied as art.
"""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image


def compose(source, view):
    data_file = source / f'800-{view}.json'
    image_file = data_file.with_suffix('.png')
    data = json.loads(data_file.read_text(encoding='utf-8'))
    parent = data['parent'][0]['frames'][0]
    if parent[2:] != [0, 4096, 4096, 0, 0]:
        raise ValueError('Nonidentity parent needs a new native composition review')
    parts = []
    for row in data['maps'][parent[0]]:
        frame = data['animations'][row[0]]['frames'][0]
        if frame[2:] != [0, 4096, 4096, 0, 0]:
            raise ValueError('Nonidentity part needs a new native composition review')
        for cell in data['cells'][frame[0]]:
            parts.append((row, cell, len(parts)))
    left = min(r[1] + o[0] for r, o, _ in parts)
    top = min(r[2] + o[1] for r, o, _ in parts)
    right = max(r[1] + o[0] + o[2] for r, o, _ in parts)
    bottom = max(r[2] + o[1] + o[3] for r, o, _ in parts)
    canvas = Image.new('RGBA', (right-left, bottom-top))
    with Image.open(image_file) as source_image:
        atlas = source_image.convert('RGBA')
    for row, cell, _ in sorted(parts, key=lambda p: (-p[1][7], -p[2])):
        x, y, width, height, index, hf, vf, *_ = cell
        ix, iy, iw, ih = data['images'][index]
        if (iw, ih) != (width, height):
            raise ValueError('Native cell and texture rectangle disagree')
        tile = atlas.crop((ix, iy, ix+iw, iy+ih))
        if hf:
            tile = tile.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        if vf:
            tile = tile.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        canvas.alpha_composite(tile, (row[1]+x-left, row[2]+y-top))
        tile.close()
    atlas.close()
    box = canvas.getbbox()
    actual = [box[0]+left, box[1]+top, box[2]+left, box[3]+top]
    if actual != data['opaqueBounds']:
        raise ValueError('Native alpha and original rest bounds disagree')
    portrait = canvas.crop(box)
    canvas.close()
    return portrait, data_file, image_file


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('native_banks', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    rows = []
    for view in ['front', 'back']:
        image, data_file, texture_file = compose(args.native_banks, view)
        target = args.output / f'800-{view}.png'
        if target.exists():
            with Image.open(target) as old:
                if old.size != image.size or old.convert('RGBA').tobytes() != image.tobytes():
                    raise ValueError(f'Existing portrait differs; preserving {target}')
        else:
            image.save(target)
        rows.append({'view': view, 'size': image.size,
                     'PNG_SHA256': hashlib.sha256(target.read_bytes()).hexdigest(),
                     'RGBA_SHA256': hashlib.sha256(image.tobytes()).hexdigest(),
                     'nativeJSON_SHA256': hashlib.sha256(data_file.read_bytes()).hexdigest(),
                     'nativeTexture_SHA256': hashlib.sha256(texture_file.read_bytes()).hexdigest()})
        image.close()
    print(json.dumps({'status': 'SOURCE_PIXELS_REPRODUCED_NOT_NEW_VISUAL_APPROVAL', 'rows': rows}))


if __name__ == '__main__':
    main()
