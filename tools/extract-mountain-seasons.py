"""Export separate lazy IRBI Mountain season catalogs, with native grids/props.

The kind1 matrix replacement is distinct from kind0 member replacements.
Output is preparation only until the field controller installs a chosen catalog.
"""
from pathlib import Path
from types import SimpleNamespace
import argparse, hashlib, json, math, struct, subprocess, sys
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'audio-tools/python-packages'))
from irbi_reader import NintendoDSRom,NARC
from nitro_geometry import flatten_glb

p=argparse.ArgumentParser()
for name in ['rom','output','work','apicula']:p.add_argument('--'+name,type=Path,required=True)
a=p.parse_args();a.work.mkdir(parents=True,exist_ok=True);a.output.mkdir(parents=True,exist_ok=True)
r=NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI';cache={}
def narc(name):
 if name not in cache:cache[name]=NARC(r.getFileByName(name)).files
 return cache[name]
headers=narc('a/0/1/2')[0];replacements=narc('a/0/1/0')[0]
rows=[struct.unpack_from('<HBB5HH',replacements,i)for i in range(0,len(replacements),16)]
assert rows[34][:7]==(93,1,0,93,93,93,193)
helpers=Path(__file__).with_name('extract-castelia.py').read_text(encoding='utf-8')
helpers=helpers[helpers.index('def convert('):helpers.index('for zone in selected:',helpers.index('def convert('))]
helpers=helpers.replace("f'ca-","f'ic-").replace("'assets/castelia'","'assets/field-seasons'")
assets=a.output/'assets/field-seasons';assets.mkdir(parents=True,exist_ok=True);reports=[]
for season in range(4):
 models={};textures={};ns=dict(a=SimpleNamespace(work_dir=a.work,apicula=a.apicula),assets=assets,models=models,textures=textures,r=r,narc=narc,struct=struct,subprocess=subprocess,flatten_glb=flatten_glb,hashlib=hashlib,json=json)
 exec(compile(helpers,'reviewed-native-map-helpers','exec'),ns)
 zone=199;v=struct.unpack_from('<BBHHHHH4HHHHHHHHHiii',headers,zone*48);base_area,base_matrix=v[2],v[3]
 matrix_id=base_matrix
 for key,kind,selector,*variants in rows:
  if key==base_matrix and kind==1 and selector==0:matrix_id=variants[season]
 assert matrix_id==([93,93,93,193][season])
 area_id=base_area+season if 2<=base_area<210 else base_area
 area=r.getFileByName('a/0/1/3')[area_id*10:area_id*10+10]
 terrain=struct.unpack_from('<H',area,2)[0];outdoor=area[6]==1;bundle=(base_area-2)//4+1
 assert outdoor and base_area==110 and base_matrix==93 and bundle==28
 matrix=narc('a/0/0/9')[matrix_id];w,h=struct.unpack_from('<HH',matrix,4)
 scene={'instances':[],'permissionGrids':[],'surfaces':[]};proof=[]
 for row in range(h):
  for col in range(w):
   member=struct.unpack_from('<I',matrix,8+(row*w+col)*4)[0]
   if member==0xffffffff:continue
   land=narc('a/0/0/8')[member];u32=lambda at:struct.unpack_from('<I',land,at)[0]
   assert land[:2] in [b'WB',b'GC']
   off=u32(4);key=f'ic-season{season}-map-{member}';x,z=col*32,row*32
   ns['convert'](land[off:off+u32(off+8)],narc('a/0/1/4')[terrain],key)
   scene['instances'].append(dict(model=key,x=x,y=0,z=z,rotation=0))
   scene['permissionGrids'].append(dict(x=x,z=z,bytes=list(land[u32(8):u32(12)])))
   scene['surfaces'].append(dict(member=member,x=x,y=0,z=z))
   at=u32(16)if off==24 else u32(12)
   for i in range(u32(at)):
    px,py,pz,rot,hi,lo=struct.unpack_from('<iiiHBB',land,at+4+i*16);pid=(hi<<8)|lo
    scene['instances'].append(dict(nativeModelId=pid,model=ns['prop'](pid,bundle,outdoor),x=x+px/65536,y=py/65536,z=z-pz/65536,rotation=rot*math.tau/65536))
   proof.append(dict(member=member,cell=[col,row],landSha256=hashlib.sha256(land).hexdigest()))
 source={'zone':zone,'season':season,'baseMatrix':base_matrix,'matrix':matrix_id,'baseArea':base_area,'area':area_id,'terrainTextureMember':terrain,'propContainer':bundle,'matrixSha256':hashlib.sha256(matrix).hexdigest(),'textureSha256':hashlib.sha256(narc('a/0/1/4')[terrain]).hexdigest(),'propContainerSha256':hashlib.sha256(narc('a/2/2/9')[bundle]).hexdigest(),'lands':proof}
 catalog={'source':source,'season':season,'models':models,'textures':textures,'scenes':{str(zone):scene}}
 (a.output/f'field-season-{season}-assets.js').write_text('window.ICIRRUS_SEASON_ASSETS='+json.dumps(catalog,separators=(',',':'))+';\n',encoding='utf-8')
 reports.append(dict(season=season,matrix=matrix_id,terrainTexture=terrain,models=len(models),textures=len(textures),maps=len(scene['surfaces']),props=sum('nativeModelId'in i for i in scene['instances'])))
 print(json.dumps(reports[-1]),flush=True)
(a.work/'report.json').write_text(json.dumps(reports,indent=2)+'\n',encoding='utf-8')
