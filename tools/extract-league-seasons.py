"""Export native052 seasonal textures in geographic families, without a second resident cache."""
from pathlib import Path
import json
import os
import subprocess

ZONES = [136, 214, *range(355, 365)]


def quiet_run(command, **kwargs):
    if os.name == 'nt':
        kwargs['creationflags'] = kwargs.get('creationflags', 0) | 0x08000000
    return subprocess.run(command, **kwargs)


def read(root, name):
    return json.loads((root / name).read_text(encoding='utf-8').split('=', 1)[1].rstrip(';\n'))


def split_catalog(catalog, output, manifest):
    season = catalog['season']
    for family in ['route10', 'badgeGates', 'victoryOutside', 'leagueEntry']:
        part = manifest['families'][family]
        base = read(output, part['src'])
        scenes = {str(z): catalog['scenes'].get(str(z), base['scenes'][str(z)]) for z in part['zones']}
        available = {**base['models'], **catalog['models']}
        model_ids = {item['model'] for scene in scenes.values() for item in scene['instances']}
        models = {key: available[key] for key in sorted(model_ids)}
        texture_ids = {group['texture'] for model in models.values() for group in model['groups'] if group.get('texture')}
        available = {**base['textures'], **catalog['textures']}
        textures = {key: available[key] for key in sorted(texture_ids)}
        data = {'source': 'IRBI052 native season; ordinary bounded family ownership', 'family': family,
                'season': season, 'scenes': scenes, 'models': models, 'textures': textures, 'sprites': base['sprites']}
        filename = f'league-{family}-season{season}-assets.js'
        (output / filename).write_text('window.LEAGUE_PART_ASSETS=' + json.dumps(data, separators=(',', ':')) + ';\n', encoding='utf-8', newline='\n')
        part.setdefault('seasons', {})[str(season)] = {**{k: v for k, v in part.items() if k not in ['seasons']},
            'src': filename, 'pack': f'assets/league-{family}-season{season}-pack.bin', 'season': season,
            'models': len(models), 'textures': len(textures), 'catalogBytes': (output / filename).stat().st_size}


def build_source():
    source = Path(__file__).with_name('extract-opelucid-seasons.py').read_text(encoding='utf-8')
    source = source.replace('opelucid', 'league').replace('OPELUCID', 'LEAGUE').replace('op-season', 'lg-season')
    def replace(old, new):
        nonlocal source
        if old not in source:
            raise ValueError('Reviewed seasonal exporter changed: ' + old)
        source = source.replace(old, new)
    replace('for zone in [113,205,345,346]:', 'for zone in ' + repr(ZONES) + ':')
    replace("land[:2]in [b'WB',b'GC'];u32=", "land[:2]in [b'WB',b'GC',b'NG'];is_ng=land[:2]==b'NG';u32=")
    replace("    scene['permissionGrids'].append", "    if not is_ng: scene['permissionGrids'].append")
    replace('    surfaces.append(', '    if not is_ng: surfaces.append(')
    replace('    grids[str(member)]=', '    if not is_ng: grids[str(member)]=')
    replace('at=u32(16)if off==24 else u32(12)', 'at=u32(8) if is_ng else u32(16)if off==24 else u32(12)')
    replace('reports=[]', "reports=[]\nmanifest=read(a.output,'league-parts.js')\nbase_surfaces=read(a.output,'league-surface-data.js')")
    marker = 'reports=[]\nmanifest='
    replace(marker, "helpers=helpers.replace('subprocess.run(', '_quiet_run(')\nreports=[]\nmanifest=")
    replace('subprocess=subprocess,flatten_glb=', 'subprocess=subprocess,_quiet_run=quiet_run,flatten_glb=')
    # New areas have native seasonal terrain textures but no seasonal changes
    # to their land geometry/permissions. Fail if that assumption ever changes.
    replace('land=narc(\'a/0/0/8\')[member];', "assert member==original,('Seasonal native land replacement requires integration',zone,original,member)\n    land=narc('a/0/0/8')[member];")
    replace(' catalog=dict(season=season,', " assert all(surface_scenes[z]==base_surfaces['scenes'][z] for z in surface_scenes), 'Seasonal floor placement changed'\n for member,layers in grids.items():\n  assert layers==base_surfaces['grids'][member], 'Seasonal floor permissions changed'\n catalog=dict(season=season,")
    replace(" (a.output/f'league-season-{season}-assets.js').write_text", " split_catalog(catalog,a.output,manifest)\n (a.output/f'league-season-{season}-assets.js').write_text")
    source += "\n(a.output/'league-parts.js').write_text('window.LEAGUE_PARTS='+json.dumps(manifest,separators=(',',':'))+';\\n',encoding='utf8')\n"
    return source


if __name__ == '__main__':
    exec(compile(build_source(), str(Path(__file__).with_name('extract-league-seasons.py')), 'exec'))
