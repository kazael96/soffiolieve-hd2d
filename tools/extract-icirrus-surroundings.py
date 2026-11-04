"""Native one-cell visual ring around Icirrus; never opens future story/collisions."""
from pathlib import Path
import argparse, hashlib, json, math, struct, subprocess, sys
from types import SimpleNamespace
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'audio-tools/python-packages'))
from irbi_reader import NintendoDSRom,NARC
from nitro_geometry import flatten_glb
p=argparse.ArgumentParser()
for key in ['rom','output','work','apicula']:p.add_argument('--'+key,type=Path,required=True)
a=p.parse_args();a.work.mkdir(parents=True,exist_ok=True)
r=NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
cache={}
def narc(name):
 if name not in cache:cache[name]=NARC(r.getFileByName(name)).files
 return cache[name]
data=json.loads((a.output/'icirrus-assets.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
assets=a.output/'assets/icirrus';headers=narc('a/0/1/2')[0]
matrix=narc('a/0/0/9')[0];w,h=struct.unpack_from('<HH',matrix,4)
zone_at=lambda x,y:struct.unpack_from('<I',matrix,8+(w*h+y*w+x)*4)[0]
member_at=lambda x,y:struct.unpack_from('<I',matrix,8+(y*w+x)*4)[0]
own={(x,y)for y in range(h)for x in range(w)if zone_at(x,y)==113}
ring={(x+dx,y+dy)for x,y in own for dx in [-1,0,1]for dy in [-1,0,1]}-own
helpers=Path(__file__).with_name('extract-castelia.py').read_text(encoding='utf8')
helpers=helpers[helpers.index('def convert('):helpers.index('for zone in selected:',helpers.index('def convert('))]
helpers=helpers.replace("f'ca-","f'ic-").replace("'assets/castelia'","'assets/icirrus'")
ns=dict(a=SimpleNamespace(work_dir=a.work,apicula=a.apicula),assets=assets,models=data['models'],textures=data['textures'],r=r,narc=narc,struct=struct,subprocess=subprocess,flatten_glb=flatten_glb,hashlib=hashlib,json=json)
exec(compile(helpers,'reviewed-native-map-helpers','exec'),ns)
instances=[];proof=[]
for col,row in sorted(ring,key=lambda p:(p[1],p[0])):
 if not(0<=col<w and 0<=row<h):continue
 member,zone=member_at(col,row),zone_at(col,row)
 if member==0xffffffff or zone==198:continue # Already rendered by the owned neighbor.
 area_zone=113 if zone==0xffffffff else zone
 v=struct.unpack_from('<BBHHHHH4HHHHHHHHHiii',headers,area_zone*48)
 area=r.getFileByName('a/0/1/3')[v[2]*10:v[2]*10+10];bundle,terrain=struct.unpack_from('<HH',area);outdoor=area[6]==1
 land=narc('a/0/0/8')[member];u32=lambda at:struct.unpack_from('<I',land,at)[0]
 key=f'ic-map-{member}';off=u32(4);x,z=col*32+16-784,row*32+16-752
 if key not in data['models']:ns['convert'](land[off:off+u32(off+8)],narc('a/0/1/4')[terrain],key)
 instances.append(dict(model=key,x=x,y=0,z=z,rotation=0))
 at=u32(8)if land[:2]==b'NG'else u32(16)if off==24 else u32(12)
 for i in range(u32(at)):
  px,py,pz,rot,hi,lo=struct.unpack_from('<iiiHBB',land,at+4+i*16);pid=(hi<<8)|lo
  instances.append(dict(nativeModelId=pid,model=ns['prop'](pid,bundle,outdoor),x=x+px/65536,y=py/65536,z=z-pz/65536,rotation=rot*math.tau/65536))
 proof.append(dict(cell=[col,row],member=member,zone=None if zone==0xffffffff else zone,areaZone=area_zone,x=x,z=z,landSHA256=hashlib.sha256(land).hexdigest()))
data.setdefault('visualSurroundings',{})['113']={'instances':instances,'cells':proof,'collisionPolicy':'Visual only; active scene permissions and story ownership are unchanged'}
(a.output/'icirrus-assets.js').write_text('window.ICIRRUS_ASSETS='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
print(json.dumps({'visualCells':proof,'instances':len(instances),'models':len(data['models']),'textures':len(data['textures'])}))
