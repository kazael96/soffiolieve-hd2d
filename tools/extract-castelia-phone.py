"""Call 3 follows calls 1/2 in IRBI's a/1/3/1 table; portraits are reused."""
import argparse,json,struct
from pathlib import Path
import ndspy.rom,ndspy.narc
import importlib.util
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
b=ndspy.narc.NARC(r.getFileByName('a/1/3/1')).files[65]
data={'source':'IRBI a/1/3/1:65','participants':list(b[:4]),'commands':list(struct.iter_unpack('<BBH',b[8:]))}
spec=importlib.util.spec_from_file_location('events',Path(__file__).with_name('extract-original-events.py'));events=importlib.util.module_from_spec(spec);spec.loader.exec_module(events)
texts=ndspy.narc.NARC(r.getFileByName('a/0/0/2')).files
data['text']=events.messages(texts[194]);assert 'Iris' in data['text'][0]
assert set(data['participants'])<={0,2,255},data['participants']
(a.output/'castelia-phone.js').write_text('window.CASTELIA_PHONE='+json.dumps(data,separators=(',',':'))+';\n')
print(data)
