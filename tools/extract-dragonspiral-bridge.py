"""Export the native map-event4 Dragonspiral bridge variant (matrix208)."""
import argparse,hashlib,json,math,struct,subprocess,sys
from pathlib import Path
from types import SimpleNamespace
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'audio-tools/python-packages'))
from irbi_reader import NintendoDSRom,NARC
from nitro_geometry import flatten_glb
p=argparse.ArgumentParser(description=__doc__)
for key in ['rom','output','work','apicula']:p.add_argument('--'+key,type=Path,required=True)
a=p.parse_args();a.work.mkdir(parents=True,exist_ok=True)
r=NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI';cache={}
def narc(name):
 if name not in cache:cache[name]=NARC(r.getFileByName(name)).files
 return cache[name]
def read(name):return json.loads((a.output/name).read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
def write(name,var,data):(a.output/name).write_text('window.'+var+'='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
table=narc('a/0/1/0')[0];row=struct.unpack_from('<HBB5HH',table,43*16);assert row==(207,1,7,207,208,0,0,0,65535)
ov=r.loadArm9Overlays([10])[10];condition=struct.unpack_from('<BBHH',ov.data,0x2170ea0-ov.ramAddress+4*6);assert condition==(7,4,16437,790)
matrix=narc('a/0/0/9')[208];w,h=struct.unpack_from('<HH',matrix,4);assert (w,h)==(2,2)
helpers=Path(__file__).with_name('extract-castelia.py').read_text(encoding='utf8');helpers=helpers[helpers.index('def convert('):helpers.index('for zone in selected:',helpers.index('def convert('))]
helpers=helpers.replace("f'ca-","f'op-bridge-").replace("'assets/castelia'","'assets/opelucid/bridge'")
assets=a.output/'assets/opelucid/bridge';assets.mkdir(parents=True,exist_ok=True);models={};textures={}
ns=dict(a=SimpleNamespace(work_dir=a.work,apicula=a.apicula),assets=assets,models=models,textures=textures,r=r,narc=narc,struct=struct,subprocess=subprocess,flatten_glb=flatten_glb,hashlib=hashlib,json=json)
exec(compile(helpers,'reviewed-native-map-helpers','exec'),ns)
scene={'instances':[],'permissionGrids':[]};proof=[]
for iz in range(h):
 for ix in range(w):
  member=struct.unpack_from('<I',matrix,8+(iz*w+ix)*4)[0];land=narc('a/0/0/8')[member];u32=lambda at:struct.unpack_from('<I',land,at)[0]
  assert land[:2] in [b'WB',b'GC'];off=u32(4);key='op-bridge-map-'+str(member);ns['convert'](land[off:off+u32(off+8)],narc('a/0/1/4')[114],key)
  x,z=ix*32,iz*32;scene['instances'].append(dict(model=key,x=x,y=0,z=z,rotation=0));scene['permissionGrids'].append(dict(x=x,z=z,bytes=list(land[u32(8):u32(12)])))
  at=u32(16)if off==24 else u32(12)
  for i in range(u32(at)):
   px,py,pz,rot,hi,lo=struct.unpack_from('<iiiHBB',land,at+4+i*16);pid=(hi<<8)|lo
   scene['instances'].append(dict(nativeModelId=pid,model=ns['prop'](pid,29,True),x=x+px/65536,y=py/65536,z=z-pz/65536,rotation=rot*math.tau/65536))
  proof.append(dict(member=member,sha256=hashlib.sha256(land).hexdigest()))
aggregate=read('opelucid-assets.js');aggregate['models'].update(models);aggregate['textures'].update(textures);aggregate.setdefault('variantScenes',{})['206']={'bridge':scene};write('opelucid-assets.js','OPELUCID_ASSETS',aggregate)
metadata={'source':{'rom':'IRBI','replacementRow':43,'matrix':208,'conditionAddress':'10:02170ea0+24','maps':proof},'event':4,'work':16437,'value':790,'zone':206,'surfaceZone':2061,'variant':'bridge','scene':{k:v for k,v in scene.items()if k!='instances'}}
write('opelucid-map-variants.js','OPELUCID_MAP_VARIANTS',metadata)
(a.work/'report.json').write_text(json.dumps({**metadata['source'],'models':len(models),'textures':len(textures)},indent=2)+'\n')
print('Exported native matrix208:',len(models),'models,',len(textures),'textures; condition work16437=790/event4')
