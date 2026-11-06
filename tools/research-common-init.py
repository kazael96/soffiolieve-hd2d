"""Read-only common script866 reference; decoding does not enable its commands."""
import argparse
import importlib.util
import json
from pathlib import Path
import struct
from irbi_reader import NintendoDSRom, NARC, install
install()
p=argparse.ArgumentParser(description=__doc__);p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
spec=importlib.util.spec_from_file_location('events',Path(__file__).with_name('extract-original-events.py'));ev=importlib.util.module_from_spec(spec);spec.loader.exec_module(ev)
r=NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI';raw=NARC(r.getFileByName('a/0/5/7')).files[866]
table=json.loads(Path(__file__).with_name('irbi-field-commands.json').read_text(encoding='utf8'))
for name in ['route3','pinwheel','castelia','nimbasa','driftveil','mistralton','icirrus','opelucid']:table.update(json.loads(Path(__file__).with_name(name+'-opcodes.json').read_text(encoding='utf8')))
# Native215ac50 reads one value through2159a10, conditional2012900; reference only.
table['217']={'name':'NativeOpcode217','args':['u16']}
# Operand reads verified in overlay10 at215c458,215accc,215af68.
for op,count in [(249,1),(220,5),(227,0),(224,1),(228,1)]:
 table[str(op)]={'name':'NativeOpcode'+str(op),'args':['u16']*count}
entries=[];pos=0
while struct.unpack_from('<H',raw,pos)[0]!=0xfd13:entries.append(pos+4+struct.unpack_from('<i',raw,pos)[0]);pos+=4
result={'source':'IRBI a/0/5/7 member866','entries':entries,'programs':{},'failures':[]}
for i in range(len(entries)):
 try:result['programs'][i]=ev.program(raw,[i],table)
 except ValueError as error:result['failures'].append({'entry':i,'error':str(error)})
a.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
for entry,program in result['programs'].items():print('entry',entry,'commands',len(program['code']),'flags570..615',[c['args'][0]for c in program['code'].values()if c['op']==35 and 570<=c['args'][0]<=615])
print('failures',result['failures'])
