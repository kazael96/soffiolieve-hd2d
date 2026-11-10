"""Render scoped052 music/effects with the retained original DS driver."""
import argparse
from pathlib import Path


def build_source():
    source = Path(__file__).with_name('render-mistralton-audio.py').read_text(encoding='utf-8')
    source = source.replace('mistralton-audio.js', 'league-audio.js').replace('MISTRALTON_AUDIO', 'LEAGUE_AUDIO').replace('MistraltonAudio', 'LeagueAudio')
    old = "old_music = catalog(reference/'field-audio.js')"
    if source.count(old) != 1:
        raise ValueError('Reviewed audio exporter changed')
    source = source.replace(old, old + """
    for name in ['mistralton', 'icirrus', 'opelucid', 'league']:
        file = reference/(name+'-audio.js')
        if file.is_file():
            prior = catalog(file)
            old_music.update(prior.get('music', {}))
            old_music.update(prior.get('sounds', {}))
""")
    old = "if rate != record['rate'] or len(audio) != round(record['duration']*rate) or not np.any(audio != 0):"
    if source.count(old) != 1:
        raise ValueError('Reviewed sample verification changed')
    source = source.replace(old, """if method.startswith('reused') and abs(len(audio)-record['duration']*rate)<=rate*.000501:
            record={**record,'duration':len(audio)/rate}
        """ + old)
    source = source.replace('sustained=identifier in [1738,1741,1754]', 'sustained=identifier in [1748,1788]')
    # Exporter modules only define functions; the original CLI block stays idle.
    return source


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ['work', 'output', 'reference', 'report-dir']:
        parser.add_argument('--' + key, type=Path, required=True)
    parser.add_argument('--music', type=int, nargs='*', default=[])
    parser.add_argument('--sounds', type=int, nargs='*', default=[])
    args = parser.parse_args()
    if set(args.music) & set(args.sounds) or any(not 1000 <= n <= 2500 for n in args.music + args.sounds):
        raise ValueError('Invalid sequence inventory')
    scope = {'__name__': 'league_audio_export', '__file__': str(Path(__file__).with_name('render-mistralton-audio.py'))}
    exec(compile(build_source(), scope['__file__'], 'exec'), scope)
    scope.update(MUSIC=sorted(set(args.music)), SOUNDS=sorted(set(args.sounds)), CRIES=[],
                 SOUND_HANDLERS={n: ['IRBI overlay46 native dragon task'] for n in args.sounds})
    scope['export'](args.work.resolve(), args.output.resolve(), args.reference.resolve(), args.report_dir.resolve())


if __name__ == '__main__':
    main()
