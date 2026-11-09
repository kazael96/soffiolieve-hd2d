"""Split native051 geometry by geography; core collision metadata stays separate."""
import argparse
import json
import struct
from pathlib import Path
from irbi_reader import NintendoDSRom, NARC

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('rom', type=Path)
parser.add_argument('output', type=Path)
args = parser.parse_args()
rom = NintendoDSRom.fromFile(args.rom)
assert rom.idCode == b'IRBI'


def read(name):
    return json.loads((args.output / name).read_text(encoding='utf8').split('=', 1)[1].rstrip(';\n'))


def write(name, variable, data):
    (args.output / name).write_text('window.' + variable + '=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf8', newline='\n')


assets, events, rails, gym = [read(name) for name in ['opelucid-assets.js', 'opelucid-events.js', 'opelucid-rails.js', 'opelucid-gym-data.js']]
headers = NARC(rom.getFileByName('a/0/1/2')).files[0]
areas = rom.getFileByName('a/0/1/3')
families = {'nacrene': [16, 17], 'icirrus': [113, 115, 116, 117, 118, 119], 'brycen': [114],
            'dragonspiral': list(range(205, 214)), 'desert': [157, 158, 159], 'relic': list(range(160, 166)),
            'route8': [345, 346, 347], 'tubeline': [254, 349], 'route9': [348], 'opelucid': [120, *range(122, 136)]}
assert sorted(zone for zones in families.values() for zone in zones) == sorted(map(int, assets['scenes']))
descriptors, manifest = {}, {'source': 'IRBI; geographic split of the reviewed native catalog', 'families': {}, 'zoneFamily': {}, 'residentLimit': 3}
for family, zones in families.items():
    scene_rows = {str(zone): assets['scenes'][str(zone)] for zone in zones}
    model_ids = {instance['model'] for scene in scene_rows.values() for instance in scene['instances']}
    variants = {str(zone): assets.get('variantScenes', {}).get(str(zone), {}) for zone in zones if assets.get('variantScenes', {}).get(str(zone))}
    model_ids |= {instance['model'] for group in variants.values() for scene in group.values() for instance in scene['instances']}
    models = {key: assets['models'][key] for key in sorted(model_ids)}
    texture_ids = {group['texture'] for model in models.values() for group in model['groups'] if group.get('texture')}
    textures = {key: assets['textures'][key] for key in sorted(texture_ids)}
    actor_ids = {actor['model'] for zone in zones for actor in events['zones'][str(zone)]['actors']}
    banks = {str(events['zones'][str(zone)]['script']) for zone in zones}
    actor_ids |= {command['args'][4] for bank in banks for command in events['scripts'][bank]['code'].values() if command['name'] == 'ActorNew'}
    sprites = {str(key): assets['sprites'][str(key)] for key in sorted(actor_ids) if str(key) in assets['sprites']}
    extra_images = []
    if family == 'brycen':
        models.update(gym['geometry'])
        textures.update(gym['textures'])
        extra_images = [path.relative_to(args.output).as_posix() for path in sorted((args.output / 'assets/opelucid/gym').rglob('*.png'))]
    filename = 'opelucid-' + family + '-assets.js'
    write(filename, 'OPELUCID_PART_ASSETS', {'source': 'IRBI', 'family': family, 'models': models, 'textures': textures, 'scenes': scene_rows, **({'variantScenes': variants} if variants else {}), 'sprites': sprites, 'extraImages': extra_images})
    manifest['families'][family] = {'src': filename, 'pack': 'assets/opelucid-' + family + '-pack.bin', 'zones': zones,
                                    'models': len(models), 'textures': len(textures), 'catalogBytes': (args.output / filename).stat().st_size}
    for zone in zones:
        manifest['zoneFamily'][zone] = family
        header = struct.unpack_from('<BBHHHHH4HHHHHHHHHiii', headers, zone * 48)
        area = areas[header[2] * 10:header[2] * 10 + 10]
        descriptors[zone] = {key: value for key, value in assets['scenes'][str(zone)].items() if key != 'instances'}
        descriptors[zone].update({'zone': zone, 'family': family, 'outdoor': area[6] == 1,
                                 'sourceArea': header[2], 'sourceMatrix': header[3], **({'railZone': zone} if str(zone) in rails else {})})
write('opelucid-scenes.js', 'OPELUCID_SCENES', descriptors)
write('opelucid-parts.js', 'OPELUCID_PARTS', manifest)
write('opelucid-sprites.js', 'OPELUCID_SPRITES', assets['sprites'])
print('Native051 geographic families:', len(families), '; total catalog bytes', sum(row['catalogBytes'] for row in manifest['families'].values()), '; current/neighbor resident limit3')
for family, row in manifest['families'].items():
    print(family, len(row['zones']), 'zones', row['catalogBytes'], 'bytes')
