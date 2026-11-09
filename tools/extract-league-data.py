"""Private IRBI052 trainer/encounter/learning references; no automatic story unlock."""
from pathlib import Path
import runpy
import sys


def separate_postgame(data):
    """Program456 is physically on the route, but its battles are after the ending."""
    references = {}
    for trainer in [591, 592, 593]:
        row = data['trainers'].get(trainer)
        if row is None or max(mon['level'] for mon in row['party']) != 67:
            raise ValueError('Unreviewed native Komor rematch')
        references[trainer] = row
    for trainer in references:
        del data['trainers'][trainer]
    data['referenceOnlyTrainers'] = references
    data['excludedPostgameTrainerIds'] = list(references)


def build_source():
    tools = str(Path(__file__).resolve().parent)
    if tools not in sys.path:
        sys.path.insert(0, tools)
    previous = Path(__file__).with_name('extract-opelucid-data.py')
    namespace = {'__file__': str(previous)}
    prefix = previous.read_text(encoding='utf-8').rpartition('exec(compile(source,')[0]
    exec(compile(prefix, str(previous), 'exec'), namespace)
    source = namespace['source']
    selected = runpy.run_path(str(Path(__file__).with_name('extract-league.py')))['SELECTED']
    grounds = [214, *range(215, 229), 355]

    def replace(old, new):
        nonlocal source
        if old not in source:
            raise ValueError('Reviewed progression exporter changed: ' + old)
        source = source.replace(old, new)

    replace('opelucid-events.js', 'league-events.js')
    replace(repr([114, *namespace['grounds']]), repr([121, *grounds]))
    replace(repr(namespace['selected']), repr(selected))
    old_encounters = sorted(set(namespace['old_encounters'] + namespace['grounds']))
    replace('for zone in ' + repr(old_encounters) + ':', 'for zone in ' + repr(sorted(set(old_encounters + grounds))) + ':')
    replace('zone in ' + repr(namespace['grounds']), 'zone in ' + repr(grounds))
    replace("(a.output/'icirrus-data.js').read_text(encoding='utf8')", "_prior_text('opelucid-data.js')")
    replace("(a.output/old_file).read_text(encoding='utf8')", '_prior_text(old_file)')
    replace("'mistralton-data.js','icirrus-data.js']", "'mistralton-data.js','icirrus-data.js','opelucid-data.js']")
    replace('<=43', '<=50')
    replace("'levelCap':43,'capSteps':[{'badge':4,'level':31},{'badge':5,'level':35},{'badge':6,'level':39},{'badge':7,'level':43}]",
            "'levelCap':50,'capSteps':[{'badge':4,'level':31},{'badge':5,'level':35},{'badge':6,'level':39},{'badge':7,'level':43},{'badge':8,'level':50}]")
    replace("'levelCap':43,'nextGym':133", "'levelCap':50,'currentGym':133,'firstLeagueTrainers':[228,229,230,231]")
    replace("a.output/'opelucid-data.js').write_text", "a.output/'league-data.js').write_text")
    replace('window.OPELUCID_DATA=', 'window.LEAGUE_DATA=')
    replace("'icirrus','opelucid']", "'icirrus','opelucid','league']")
    replace("print('IRBI051:'", "print('IRBI052:'")
    marker = "(a.output/'league-data.js').write_text"
    replace(marker, 'separate_postgame(data)\n' + marker)
    helper = '''
def _prior_text(name):
    allowed = ['training-data.js','pinwheel-data.js','castelia-data.js','nimbasa-data.js','driftveil-data.js','mistralton-data.js','icirrus-data.js','opelucid-data.js']
    if name not in allowed:
        raise ValueError('Unexpected predecessor catalog')
    return (Path(__file__).resolve().parents[1] / 'src' / name).read_text(encoding='utf8')
'''
    return helper + '\n' + source


if __name__ == '__main__':
    exec(compile(build_source(), str(Path(__file__).with_name('extract-pinwheel-data.py')), 'exec'))
