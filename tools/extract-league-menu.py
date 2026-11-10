"""Export scoped IRBI052 icons; review the three native palette slots first."""
import argparse
import hashlib
import importlib.util
import json
import struct
from pathlib import Path
from irbi_reader import install
install()
import ndspy.rom
import ndspy.narc
import ndspy.lz10
import ndspy.codeCompression
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]


def catalog(path):
    return json.loads(path.read_text(encoding='utf-8').split('=', 1)[1].rstrip(';\n'))


def extract(rom_path, output, palettes=None):
    old, current = [catalog(ROOT / 'src' / (key + '-data.js')) for key in ['opelucid', 'league']]
    previous = {row['id'] for row in old['progression'].values()}
    species = sorted((row['id'], name) for name, row in current['progression'].items() if row['id'] not in previous)
    assert len(species) == 13 and len({sid for sid, name in species}) == 13
    if palettes is not None and (set(palettes) != {str(sid) for sid, name in species} or any(v not in [0, 1, 2] for v in palettes.values())):
        raise ValueError('Review one native palette slot for every new species')
    rom = ndspy.rom.NintendoDSRom.fromFile(rom_path)
    assert rom.idCode == b'IRBI'
    files = lambda name: [ndspy.lz10.decompress(b) if b[:1] == b'\x10' else b for b in ndspy.narc.NARC(rom.getFileByName(name)).files]
    spec = importlib.util.spec_from_file_location('native_menu', Path(__file__).with_name('extract-menu.py'))
    gfx = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(gfx)
    output.mkdir(parents=True, exist_ok=True)
    icons, items, f = {}, {}, files('a/0/0/7')
    sheet = Image.new('RGBA', (420, len(species) * 72), (235, 235, 235, 255))
    draw = ImageDraw.Draw(sheet)
    for row, (sid, name) in enumerate(species):
        for palette in range(3):
            patched = list(f)
            patched[0] = bytearray(f[0])
            patched[0][40:72] = f[0][40 + palette * 32:72 + palette * 32]
            cells = gfx.cells(patched, sid * 2 + 7, 2, 0)
            image, box = cells[0]
            sheet.alpha_composite(image.resize((image.width * 2, image.height * 2), Image.Resampling.NEAREST), (palette * 140 + 40, row * 72))
            draw.text((palette * 140 + 2, row * 72 + 48), f'{sid} {name} p{palette}', fill='black')
            if palettes is None or palettes[str(sid)] != palette:
                continue
            record = {'cells': [], 'animations': gfx.animations(f[1]), 'source': {'archive': 'a/0/0/7', 'char': sid * 2 + 7, 'palette': 0, 'paletteSlot': palette, 'selection': 'reviewed native colour variant; general palette LUT not ported'}}
            for frame, (image, box) in enumerate(cells):
                file = f'assets/menu/pokemon-{sid}-{frame}.png'
                (output / file).parent.mkdir(parents=True, exist_ok=True)
                image.save(output / file)
                record['cells'].append({'src': file, 'origin': box[:2], 'size': box[2:]})
            icons[str(sid)] = record
    sheet.save(output / 'palette-review.png')
    if palettes is None:
        return {'reviewOnly': True, 'species': species}
    f = files('a/0/2/5')
    arm = ndspy.codeCompression.decompress(rom.arm9)
    for item in sorted(int(i) for i in current['itemNames'] if i not in old['itemNames']):
        char, palette = struct.unpack_from('<HH', arm, 0x0209eaec - rom.arm9RamAddress + item * 4)
        image, box = gfx.cells(f, char, 1, palette)[0]
        file = f'assets/party-details/item-{item}.png'
        (output / file).parent.mkdir(parents=True, exist_ok=True)
        image.save(output / file)
        items[str(item)] = {'src': file, 'origin': box[:2], 'size': box[2:], 'source': {'archive': 'a/0/2/5', 'char': char, 'palette': palette, 'cells': 1, 'mappingAddress': hex(0x0209eaec + item * 4)}}
    data = {'source': 'IRBI scoped052 native menu icons and ARM9 item mapping', 'icons': icons, 'items': items}
    (output / 'league-menu.js').write_text('window.LEAGUE_MENU=' + json.dumps(data, separators=(',', ':')) + ';Object.assign(MENU_ASSETS.pokemonIcons,LEAGUE_MENU.icons);Object.assign(PARTY_DETAIL_ASSETS.itemMap,LEAGUE_MENU.items);\n', encoding='utf-8')
    report = {'species': species, 'items': list(items), 'files': {p.relative_to(output).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in output.rglob('*') if p.is_file() and p.name not in ['palette-review.png', 'extraction-report.json']}}
    (output / 'extraction-report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('rom', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--palettes', type=Path)
    args = parser.parse_args()
    report = extract(args.rom, args.output, json.loads(args.palettes.read_text(encoding='utf-8')) if args.palettes else None)
    print('Native052 icons:', len(report['species']), 'species;', 'palette review' if report.get('reviewOnly') else str(len(report['items'])) + 'items')
