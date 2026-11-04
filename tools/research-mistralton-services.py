"""Read the native common-script routing and Center/airport service evidence."""
from pathlib import Path
import sys,json,struct,importlib.util
try:import ndspy.rom
except ModuleNotFoundError:
 from irbi_reader import install
 install()
 import ndspy.rom
import ndspy.narc
root=Path(__file__).resolve().parents[1];out=root/'outputs/chapter049/moves';r=ndspy.rom.NintendoDSRom.fromFile(sys.argv[1]);cache={}
def narc(name):
 if name not in cache:cache[name]=ndspy.narc.NARC(r.getFileByName(name)).files
 return cache[name]
spec=importlib.util.spec_from_file_location('ev',Path(__file__).with_name('extract-original-events.py'));ev=importlib.util.module_from_spec(spec);spec.loader.exec_module(ev)
table=json.loads(Path(__file__).with_name('irbi-field-commands.json').read_text())
for name in ['route3','pinwheel','castelia','nimbasa','driftveil','mistralton']:
 table.update({k:v['spec']for k,v in json.loads(Path(__file__).with_name(name+'-opcodes.json').read_text()).items()})
table['6']={'name':'NativeOpcode6','args':['u16']};table['263']={'name':'NativeOpcode263','args':['u16']*3}
table['329']={'name':'NativeOpcode329','args':['u16']*2}
table['334']={'name':'NativeOpcode334','args':['u16']*3}
table['315']={'name':'NativeOpcode315','args':['u16']}
table['178']={'name':'MenuCreate','args':['u8','u8','u16','u8','u16']};table['175']={'name':'MenuAdd','args':['u16']*3};table['176']={'name':'MenuShow','args':[]}
overlay=r.loadArm9Overlays([10])[10];p=0x2170098-overlay.ramAddress;routes=[row for row in struct.iter_unpack('<5H',overlay.data[p:p+460]) if row[0]<=10110<=row[1] or row[0]<=2814<=row[1]]
data={'routes':routes,'texts':{str(bank):ev.messages(narc('a/0/0/3')[bank])for bank in [424,283,214,346]},'scripts':{}}
for bank,entries in [(871,[0]),(862,[14]),(855,[1])]:
 try:data['scripts'][bank]=ev.program(narc('a/0/5/7')[bank],entries,table)
 except Exception as e:data['scripts'][bank]={'error':str(e),'hex':narc('a/0/5/7')[bank].hex()}
(out/'service-native-reference.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
for bank,texts in data['texts'].items():
 print('TEXT',bank)
 for i,text in enumerate(texts):print(i,text)
for bank,program in data['scripts'].items():
 print('SCRIPT',bank)
 if 'error'in program:print(program['error'])
 else:
  for pc,c in sorted(program['code'].items(),key=lambda v:int(v[0])):print(pc,c['name'],c['args'])
