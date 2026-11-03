"""Original IRBI roller-coaster cart, switches, rails and joint animations."""
from pathlib import Path
import argparse,json,struct,subprocess,shutil
import ndspy.rom,ndspy.narc
from nitro_geometry import flatten_glb
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);p.add_argument('--apicula',type=Path,required=True);p.add_argument('--work-dir',type=Path,required=True);a=p.parse_args()
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
f=ndspy.narc.NARC(r.getFileByName('a/1/0/7')).files;o=r.loadArm9Overlays([39])[39]
def positions(addr,count):return [[v/65536 for v in struct.unpack_from('<3i',o.data,addr-o.ramAddress+i*12)]for i in range(count)]
stations=list(struct.iter_unpack('<HH',o.data[0x21f4b38-o.ramAddress:0x21f4b38-o.ramAddress+36]))
data={'source':'IRBI overlay39 + a/1/0/7','stations':stations,'origins':positions(0x21f4b80,16),'models':{}}
path=a.output/'driftveil-assets.js';assets=json.loads(path.read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'));dest=a.output/'assets/driftveil/gym';dest.mkdir(parents=True,exist_ok=True)
for key,model,animations in [('cart',0,list(range(11,19))),('switch',2,[]),('rail1',19,[]),('rail2',20,[]),('rail3',21,[]),('rail4',22,[])]:
 work=a.work_dir/key;work.mkdir(parents=True,exist_ok=True);inputs=[]
 for member in [model,*animations]:
  file=work/f'{member}.bin';file.write_bytes(f[member]);inputs.append(str(file.resolve()))
 converted=work/'converted';subprocess.run([str(a.apicula.resolve()),'convert',*inputs,'-o',str(converted.resolve()),'-f','glb','--all-animations','--overwrite'],check=True,capture_output=True)
 for file in converted.iterdir():shutil.copyfile(file,dest/file.name)
 glb=next(converted.glob('*.glb'));prefix='dv-gym-'+key;m,t=flatten_glb(glb,prefix,a.output/'assets/driftveil','assets/driftveil');assets['models'][prefix]=m;assets['textures'].update(t)
 data['models'][key]={'url':'assets/driftveil/gym/'+glb.name,'model':prefix,'members':[model,*animations]}
 if key=='cart':
  raw=glb.read_bytes();length=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+length]);binary=raw[28+length:]
  def accessor(index):
   acc=doc['accessors'][index];view=doc['bufferViews'][acc['bufferView']];size={'SCALAR':1,'VEC3':3,'VEC4':4}[acc['type']];offset=view.get('byteOffset',0)+acc.get('byteOffset',0)
   return [list(struct.unpack_from('<'+str(size)+'f',binary,offset+i*size*4))for i in range(acc['count'])]
  data['paths']=[]
  for animation in doc['animations']:
   channel=next(c for c in animation['channels']if c['target']['path']=='translation');sampler=animation['samplers'][channel['sampler']]
   data['paths'].append({'name':animation['name'],'times':[v[0]for v in accessor(sampler['input'])],'values':accessor(sampler['output'])})
path.write_text('window.DRIFTVEIL_ASSETS='+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
(a.output/'driftveil-gym-data.js').write_text('window.DRIFTVEIL_GYM_DATA='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
print('Exported original roller-coaster models and 8 cart paths; stations',stations)
