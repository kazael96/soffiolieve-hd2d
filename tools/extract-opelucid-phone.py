"""IRBI Castle call5: native table67 and overlay174 bank191+5."""
import argparse
import importlib.util
import json
import struct
from pathlib import Path
from irbi_reader import NintendoDSRom, NARC, install
install()
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
rom=NintendoDSRom.fromFile(a.rom);assert rom.idCode==b'IRBI'
raw=NARC(rom.getFileByName('a/1/3/1')).files[67]
spec=importlib.util.spec_from_file_location('events',Path(__file__).with_name('extract-original-events.py'))
events=importlib.util.module_from_spec(spec);spec.loader.exec_module(events)
data={'source':'IRBI a/1/3/1:67','id':5,'participants':list(raw[:4]),'commands':list(struct.iter_unpack('<BBH',raw[8:])),
      'textBank':196,'text':events.messages(NARC(rom.getFileByName('a/0/0/2')).files[196]),
      'textSource':{'overlay':174,'selector':'021b668a..021b669a','baseBank':191}}
assert data['participants']==[3,0,255,255]
assert data['commands']==[(1,0,0),(0,0,0)]
assert len(data['text'])==1 and 'Museo' in data['text'][0] and 'Zefiropoli' in data['text'][0]
(a.output/'opelucid-phone.js').write_text('window.OPELUCID_PHONE='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print('Call5: Aralia/Alcide; native bank196; one message')
