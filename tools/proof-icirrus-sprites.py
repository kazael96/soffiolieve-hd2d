"""Contact sheets of actual Nitro composites and all three native icon palettes."""
from pathlib import Path
import json
import re
import sys

root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root.parent/'audio-tools/python-packages'))
def read(name):return json.loads((root/'src'/f'{name}-data.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
old={row['id']for row in read('mistralton')['progression'].values()}
ids=sorted({row['id']for row in read('icirrus')['progression'].values()}-old)
source=Path(__file__).with_name('proof-mistralton-sprites.py').read_text(encoding='utf8')
source=source.replace('outputs/chapter049/moves','outputs/chapter050/moves')
# Match pokemon-anim.js: equal-priority OAM and multi-cell records draw in
# reverse index order. The old research sheet hid Solosis behind its gel layer.
source=source.replace('for o in sorted(cells,key=lambda o:-o[7]):', 'for o in sorted(reversed(cells),key=lambda o:-o[7]):')
source=source.replace("for row in d['maps'][pf[0]]:canvas.alpha_composite(part(d,atlas,row))", "for row in reversed(d['maps'][pf[0]]):canvas.alpha_composite(part(d,atlas,row))")
source,count=re.subn(r'^ids=\[[^\n]+\]$', 'ids='+repr(ids),source,flags=re.M)
assert count==1
exec(compile(source,str(Path(__file__).with_name('proof-mistralton-sprites.py')),'exec'))
