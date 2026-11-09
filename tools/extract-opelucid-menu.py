"""Native051 icons; palette choices reviewed on the three-palette contact sheet."""
from pathlib import Path
import json
import sys

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root.parent / 'audio-tools/python-packages'))


def read(name):
    return json.loads((root / 'src' / f'{name}-data.js').read_text(encoding='utf8').split('=', 1)[1].rstrip(';\n'))


old, current = read('icirrus'), read('opelucid')
old_ids = {row['id'] for row in old['progression'].values()}
new_ids = {row['id'] for row in current['progression'].values()} - old_ids
slots = [(553, 0), (556, 1), (558, 2), (563, 0), (576, 2), (593, 0),
         (598, 1), (606, 2), (608, 2), (611, 1), (619, 0), (621, 0),
         (623, 0), (624, 0), (626, 0)]
assert {sid for sid, palette in slots} == new_ids
items = sorted(int(item) for item in current['itemNames'] if item not in old['itemNames'])
original = Path(__file__).with_name('extract-route3-menu.py')
source = original.read_text(encoding='utf8')
source = source.replace('[(519,0),(522,0),(524,0),(527,0),(532,1),(535,2)]', repr(slots))
source = source.replace('[14,18,21,150,373]', repr(items)).replace('route3-menu.js', 'opelucid-menu.js').replace('ROUTE3_MENU', 'OPELUCID_MENU')
exec(compile(source, str(original), 'exec'))
print('Native051 menu:', len(slots), 'species,', len(items), 'items; reviewed palette selection, no native LUT claim')

# New fixed-stock items also need native ball cells and letter paper.
import importlib.util as _util
_spec=_util.spec_from_file_location("opelucid_market_assets",Path(__file__).with_name("extract-opelucid-market-assets.py"))
_market_assets=_util.module_from_spec(_spec);_spec.loader.exec_module(_market_assets)
_market_assets.extract(a.rom,a.output,root.parent/"opelucid-market-assets-work")
