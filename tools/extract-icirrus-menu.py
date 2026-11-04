"""Original050 menu cells. Palette choices reviewed in the native3-palette sheet."""
from pathlib import Path
import json
import sys

root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root.parent/'audio-tools/python-packages'))
def read(name):return json.loads((root/'src'/f'{name}-data.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
old=read('mistralton');current=read('icirrus')
old_ids={row['id']for row in old['progression'].values()}
new_ids={row['id']for row in current['progression'].values()}-old_ids
slots=[(497,1),(500,0),(503,2),(537,0),(560,0),(562,0),(569,1),(577,1),(578,1),
       (591,0),(594,0),(596,0),(600,0),(603,0),(604,0),(605,0),(607,0),(610,1),
       (613,0),(614,0),(615,0),(616,0),(618,2),(622,0)]
assert {sid for sid,pi in slots}==new_ids
items=sorted({int(i)for i in current['itemNames']if i not in old['itemNames']}|{157})
source=Path(__file__).with_name('extract-route3-menu.py').read_text(encoding='utf8')
source=source.replace('[(519,0),(522,0),(524,0),(527,0),(532,1),(535,2)]',repr(slots))
source=source.replace('[14,18,21,150,373]',repr(items)).replace('route3-menu.js','icirrus-menu.js').replace('ROUTE3_MENU','ICIRRUS_MENU')
exec(compile(source,str(Path(__file__).with_name('extract-route3-menu.py')),'exec'))
print('Native050 menu:',len(slots),'species,',len(items),'items')
