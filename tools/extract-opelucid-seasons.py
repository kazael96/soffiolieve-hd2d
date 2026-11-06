"""Export lazy IRBI Icirrus/Route8/Moor seasons with native land replacements."""
from pathlib import Path
from types import SimpleNamespace
import argparse, base64, hashlib, json, math, struct, subprocess, sys
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
headers=narc('a/0/1/2')[0];raw=narc('a/0/1/0')[0]
rows=[struct.unpack_from('<HBB5HH',raw,at)for at in range(0,len(raw),16)]
# kind0 keys the MATRIX, with the original land member in the first variant.
# The key is not a land member. Route8's winter replacements are198 and199.
assert any(row[:7]==(0,0,0,68,68,68,198)for row in rows)
assert any(row[:7]==(183,1,0,183,183,183,253)for row in rows)
helpers=Path(__file__).with_name('extract-castelia.py').read_text(encoding='utf8')
helpers=helpers[helpers.index('def convert('):helpers.index('for zone in selected:',helpers.index('def convert('))]
helpers=helpers.replace("f'ca-","f'op-season{season}-").replace("'assets/castelia'","'assets/opelucid-seasons/season'+str(season)")
reports=[]
for season in range(4):
 models={};textures={};scenes={};grids={};surface_scenes={};sources={}
 assets=a.output/'assets/opelucid-seasons'/('season'+str(season));assets.mkdir(parents=True,exist_ok=True)
 ns=dict(a=SimpleNamespace(work_dir=a.work,apicula=a.apicula),season=season,assets=assets,models=models,textures=textures,r=r,narc=narc,struct=struct,subprocess=subprocess,flatten_glb=flatten_glb,hashlib=hashlib,json=json)
 exec(compile(helpers,'reviewed-native-map-helpers','exec'),ns)
 for zone in [113,205,345,346]:
  v=struct.unpack_from('<BBHHHHH4HHHHHHHHHiii',headers,zone*48);base_area,base_matrix=v[2:4]
  matrix_id=next((row[3+season]for row in rows if row[0]==base_matrix and row[1:3]==(1,0)),base_matrix)
  area_id=base_area+season;area=r.getFileByName('a/0/1/3')[area_id*10:(area_id+1)*10]
  bundle,terrain=struct.unpack_from('<HH',area);assert bundle==5 and area[6]==1
  matrix=narc('a/0/0/9')[matrix_id];w,h=struct.unpack_from('<HH',matrix,4)
  scene={'instances':[],'permissionGrids':[],'sourceMatrix':matrix_id};surfaces=[];proof=[]
  for row in range(h):
   for col in range(w):
    original=struct.unpack_from('<I',matrix,8+(row*w+col)*4)[0]
    if original==0xffffffff:continue
    if base_matrix==0 and struct.unpack_from('<I',matrix,8+(w*h+row*w+col)*4)[0]!=zone:continue
    member=next((record[3+season]for record in rows if record[0]==base_matrix and record[1:3]==(0,0)and record[3]==original),original)
    land=narc('a/0/0/8')[member];assert land[:2]in [b'WB',b'GC'];u32=lambda at:struct.unpack_from('<I',land,at)[0]
    off=u32(4);key=f'op-season{season}-map-{member}';x,z=(col*32+16-784,row*32+16-752)if base_matrix==0 else(col*32,row*32)
    ns['convert'](land[off:off+u32(off+8)],narc('a/0/1/4')[terrain],key)
    scene['instances'].append(dict(model=key,x=x,y=0,z=z,rotation=0))
    scene['permissionGrids'].append(dict(x=x,z=z,bytes=list(land[u32(8):u32(12)])))
    surfaces.append(dict(member=member,x=x,y=0,z=z))
    grids[str(member)]=[base64.b64encode(land[u32(8+layer*4):u32(12+layer*4)]).decode('ascii')for layer in range(2 if land[:2]==b'GC'else 1)]
    at=u32(16)if off==24 else u32(12)
    for i in range(u32(at)):
     px,py,pz,rot,hi,lo=struct.unpack_from('<iiiHBB',land,at+4+i*16);pid=(hi<<8)|lo
     scene['instances'].append(dict(nativeModelId=pid,model=ns['prop'](pid,bundle,True),x=x+px/65536,y=py/65536,z=z-pz/65536,rotation=rot*math.tau/65536))
    proof.append(dict(original=original,member=member,cell=[col,row],landSha256=hashlib.sha256(land).hexdigest()))
   # end native matrix row
  scenes[str(zone)]=scene;surface_scenes[str(zone)]=surfaces
  sources[str(zone)]=dict(baseMatrix=base_matrix,matrix=matrix_id,baseArea=base_area,area=area_id,propContainer=bundle,terrainTexture=terrain,lands=proof,matrixSha256=hashlib.sha256(matrix).hexdigest(),textureSha256=hashlib.sha256(narc('a/0/1/4')[terrain]).hexdigest())
 catalog=dict(season=season,source=dict(rom='IRBI',zones=sources,replacementsSha256=hashlib.sha256(raw).hexdigest()),models=models,textures=textures,scenes=scenes,surfaces=dict(scenes=surface_scenes,grids=grids))
 (a.output/f'opelucid-season-{season}-assets.js').write_text('window.OPELUCID_SEASON_ASSETS='+json.dumps(catalog,separators=(',',':'))+';\n',encoding='utf8')
 report=dict(season=season,models=len(models),textures=len(textures),zones=sources);reports.append(report);print(json.dumps(report),flush=True)
(a.work/'report.json').write_text(json.dumps(reports,indent=2)+'\n',encoding='utf8')
