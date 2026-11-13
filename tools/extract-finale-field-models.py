"""Export original animated children referenced by the23 first-ending maps only."""
from pathlib import Path
import importlib.util


def build_source():
    reviewed = Path(__file__).with_name('extract-league-field-models.py')
    spec = importlib.util.spec_from_file_location('reviewed_league_children', reviewed)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    source = module.build_source().replace('league', 'finale').replace('LEAGUE', 'FINALE').replace('League', 'Finale')
    source = source.replace('IRBI052', 'IRBI053').replace('Native052', 'Native053')
    source = source.replace('lg-prop-', 'fn-prop-').replace('lg-field-', 'fn-field-').replace('scope lg', 'scope fn').replace('scopes.lg=', 'scopes.fn=')
    selection = 'if mode == 2 and per_set * sets and kind in [1, 2, 3, 11, 12, 13, 14, 15]:'
    if source.count(selection) != 1:
        raise ValueError('Reviewed native mode selection changed')
    source = source.replace(selection, 'if mode in [1, 2] and per_set * sets and kind in [0, 1, 2, 3, 10, 11, 12, 13, 14, 15]:')
    marker = "source = source_path.read_text(encoding='utf8')"
    if source.count(marker) != 1:
        raise ValueError('Reviewed native field reader changed')
    changes = [
        ("assert raw[:4] in (b'BCA0',b'BMA0')", "assert raw[:4] in (b'BCA0',b'BMA0',b'BTA0',b'BTP0'), ('Unsupported native field animation', path, member, model_id, ai, raw[:4].hex())"),
        ("duration=struct.unpack_from('<H',raw,section+4)[0]", "duration=_finale_duration(raw)"),
        ('assert mode==2 and 1<=per_set*sets<=4', 'assert mode in [1,2] and 1<=per_set*sets<=4'),
        ("'loop':False", "'loop':mode==1"),
        ("animations={}", "patterns=_finale_patterns(tex,resources,per_set,folder,output);uv=_finale_uv(resources,per_set,doc);bindings=_finale_bindings(resources,per_set,doc);animations={}"),
        ("'index':state,", "'index':state,'bindings':bindings.get(str(state),[]),"),
        ("'materialAlpha':alpha,", "'materialAlpha':alpha,'materialTextures':patterns,'materialUV':uv,'nativeFormats':[r[:4].decode('ascii') for r in resources],"),
    ]
    patches = []
    for original, replacement in changes:
        patches.append(f"if source.count({original!r}) != 1: raise ValueError('Reviewed field conversion source changed')")
        patches.append(f"source = source.replace({original!r}, {replacement!r})")
    source = source.replace(marker, marker+'\n'+'\n'.join(patches))
    marker = "scope['_quiet_run'] = quiet_run"
    if source.count(marker) != 1:
        raise ValueError('Reviewed conversion hooks changed')
    source = source.replace(marker, marker + "\n    scope['_finale_patterns'] = finale_patterns\n    scope['_finale_duration'] = finale_duration\n    scope['_finale_uv'] = finale_uv\n    scope['_finale_bindings'] = finale_bindings")
    marker = "record['model'] = (destination / Path(record['model']).name).relative_to(args.output).as_posix()"
    if source.count(marker) != 1:
        raise ValueError('Reviewed asset rewrite changed')
    source = source.replace(marker, marker + "\n        for materials in record.get('materialTextures', {}).values():\n            for keys in materials.values():\n                for pattern_key in keys:\n                    pattern_key['url'] = (destination / Path(pattern_key['url']).name).relative_to(args.output).as_posix()")
    return source, module


if __name__ == '__main__':
    spec = importlib.util.spec_from_file_location('finale_patterns', Path(__file__).with_name('finale-field-patterns.py'))
    patterns = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(patterns)
    spec = importlib.util.spec_from_file_location('native_srt', Path(__file__).with_name('native-texture-srt.py'))
    srt = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(srt)
    source, module = build_source()
    scope = {'__name__': 'finale_native_children_export', '__file__': __file__, 'quiet_run': module.quiet_run, 'build_staging': module.build_staging, 'finale_patterns': patterns.tracks, 'finale_duration': patterns.duration, 'finale_uv': srt.translation_tracks, 'finale_bindings': srt.animation_bindings}
    exec(compile(source, str(Path(__file__)), 'exec'), scope)
