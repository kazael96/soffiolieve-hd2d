"""Partition new chapter052 geometry; preserve the three existing Opelucid scenes."""
import argparse
import json
from pathlib import Path
import struct
from irbi_reader import NintendoDSRom, NARC

FAMILIES = {'drayden': [121], 'route10': [355], 'badgeGates': list(range(356, 365)),
            'victoryOutside': [214], 'victoryCaves': list(range(215, 229)), 'leagueEntry': [136, 146]}
SHARED = {120, 123, 132}


def partition(assets, events, rails, gym, headers, areas):
    zones = [zone for group in FAMILIES.values() for zone in group]
    if len(zones) != len(set(zones)) or set(map(int, assets['scenes'])) != set(zones) | SHARED:
        raise ValueError('Chapter052 scope mismatch')
    descriptors, parts = {}, {}
    for family, zones in FAMILIES.items():
        scenes = {str(z): assets['scenes'][str(z)] for z in zones}
        variants = {str(z): assets['variantScenes'][str(z)] for z in zones if assets.get('variantScenes', {}).get(str(z))}
        all_scenes = list(scenes.values()) + [s for group in variants.values() for s in group.values()]
        keys = {item['model'] for scene in all_scenes for item in scene['instances']}
        models = {key: assets['models'][key] for key in sorted(keys)}
        textures = {key: assets['textures'][key] for key in sorted({g['texture'] for m in models.values() for g in m['groups'] if g.get('texture')})}
        actors = {a['model'] for z in zones for a in events['zones'][str(z)]['actors']}
        banks = {str(events['zones'][str(z)]['script']) for z in zones}
        actors |= {c['args'][4] for bank in banks for c in events['scripts'][bank]['code'].values() if c['name'] == 'ActorNew'}
        if family == 'drayden':
            actors.add(180)  # Native work16416 selector, reviewed IRBI init242.
            models.update(gym['geometry'])
            textures.update(gym['textures'])
        sprites = {str(key): assets['sprites'][str(key)] for key in sorted(actors) if str(key) in assets['sprites']}
        parts[family] = {'source': 'IRBI', 'family': family, 'models': models, 'textures': textures,
                         'scenes': scenes, 'sprites': sprites, **({'variantScenes': variants} if variants else {})}
        for z in zones:
            header = struct.unpack_from('<BBHHHHH4HHHHHHHHHiii', headers, z * 48)
            area = areas[header[2] * 10:header[2] * 10 + 10]
            if len(area) != 10:
                raise ValueError('Missing native area metadata')
            descriptors[z] = {k: v for k, v in scenes[str(z)].items() if k != 'instances'}
            descriptors[z].update({'zone': z, 'family': family, 'outdoor': area[6] == 1,
                                   'sourceArea': header[2], 'sourceMatrix': header[3],
                                   **({'railZone': z} if str(z) in rails else {})})
    return descriptors, parts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('rom', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    def read(name):
        return json.loads((args.output / name).read_text(encoding='utf-8').split('=', 1)[1].rstrip(';\n'))
    def write(name, variable, value):
        (args.output / name).write_text('window.' + variable + '=' + json.dumps(value, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8', newline='\n')
    rom = NintendoDSRom.fromFile(args.rom)
    if rom.idCode != b'IRBI':
        raise ValueError('Expected IRBI ROM')
    assets, events, rails, gym = [read(name) for name in ['league-assets.js', 'league-events.js', 'league-rails.js', 'league-gym-data.js']]
    descriptors, parts = partition(assets, events, rails, gym, NARC(rom.getFileByName('a/0/1/2')).files[0], rom.getFileByName('a/0/1/3'))
    manifest = {'source': 'IRBI; new052 maps only, shared120/123/132 retain051 geometry', 'families': {}, 'zoneFamily': {}, 'residentLimit': 3}
    for family, data in parts.items():
        if family == 'drayden':
            data['extraImages'] = [p.relative_to(args.output).as_posix() for p in sorted((args.output / 'assets/league/gym').rglob('*.png'))]
        filename = 'league-' + family + '-assets.js'
        write(filename, 'LEAGUE_PART_ASSETS', data)
        zones = FAMILIES[family]
        manifest['families'][family] = {'src': filename, 'variable': 'LEAGUE_PART_ASSETS', 'pack': 'assets/league-' + family + '-pack.bin',
                                         'zones': zones, 'models': len(data['models']), 'textures': len(data['textures']),
                                         'catalogBytes': (args.output / filename).stat().st_size}
        for z in zones:
            manifest['zoneFamily'][z] = family
    write('league-scenes.js', 'LEAGUE_SCENES', descriptors)
    write('league-parts.js', 'LEAGUE_PARTS', manifest)
    write('league-sprites.js', 'LEAGUE_SPRITES', assets['sprites'])
    print('Native052: 28 new maps, six bounded families; existing120/123/132 geometry preserved')


if __name__ == '__main__':
    main()
