"""Extract IRBI Skyla/Route7/Tower/Twist Mountain and Icirrus arrival.

Shares the reviewed field/map reader with previous chapters. Extraction is not
runtime support; optional Brycen Gym114 is deliberately outside this milestone.
"""
from pathlib import Path
import sys

repo = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(repo.parent / 'audio-tools/python-packages'))
source = Path(__file__).with_name('extract-castelia.py').read_text(encoding='utf8')
old = 'selected=[28,29,30,31,32,33,34,35,38,40,41,51,56]'
selected = [107,108,109,110,111,112,337,338,339,340,341,342,343,344,
            198,199,200,201,202,203,204,113,115,116,117,118,119]
assert old in source
source = source.replace(old, 'selected=' + repr(selected))
source = source.replace('castelia', 'icirrus').replace('CASTELIA', 'ICIRRUS').replace('Castelia', 'Icirrus')
source = source.replace("f'ca-", "f'ic-")
source = source.replace("with_name('icirrus-opcodes.json')",
                        "with_name('castelia-opcodes.json')")
source = source.replace('import inspect',
    "table.update({k:v['spec'] for name in ['nimbasa','driftveil','mistralton','icirrus'] "
    "for k,v in json.loads(Path(__file__).with_name(name+'-opcodes.json').read_text(encoding='utf8')).items()})\nimport inspect")
old_ids = "ids=sorted({x['model'] for key,zone in zones.items() for x in zone['actors'] if x['model']<8192})"
assert old_ids in source
source = source.replace(old_ids,
    "extra_models={c['args'][4] for program in scripts.values() for c in program['code'].values() "
    "if c['name']=='ActorNew' and 0<=c['args'][4]<8192}\n"
    "# House343 native graphic variable16416 selects209 in Black,129 otherwise.\n"
    "ids=sorted({x['model'] for zone in zones.values() for x in zone['actors'] if x['model']<8192}"
    "|extra_models|{129,209})")
exec(compile(source, str(Path(__file__).with_name('extract-castelia.py')), 'exec'))
