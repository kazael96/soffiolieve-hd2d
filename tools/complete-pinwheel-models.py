"""Preserve material culling and export the native special actors by UID table."""
from pathlib import Path
import json,struct,subprocess,argparse
import ndspy.rom,ndspy.narc
from nitro_geometry import flatten_glb
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);p.add_argument('work',type=Path);p.add_argument('apicula',type=Path);a=p.parse_args()
file=a.output/'pinwheel-assets.js';data=json.loads(file.read_text().split('=',1)[1].rsplit(';',1)[0]);assets=a.output/'assets/pinwheel'
for key in list(data['models']):
 folder=a.work/key/'converted';glbs=list(folder.glob('*.glb'))
 assert len(glbs)==1,(key,glbs)
 model,textures=flatten_glb(glbs[0],key,assets,'assets/pinwheel');data['models'][key]=model;data['textures'].update(textures)
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
st=ndspy.narc.NARC(r.getFileByName('a/0/4/8')).files[0];fmt=struct.Struct('<HBBBBBBBBBBBbbbHHHHHH');records={}
for offset in range(4,len(st)-fmt.size+1,fmt.size):
 rec=fmt.unpack_from(st,offset);records[rec[0]]=rec
f=ndspy.narc.NARC(r.getFileByName('a/0/4/9')).files;special={}
for uid in [8198,8199]:
 resource=records[uid][15];assert resource=={8198:2,8199:3}[uid]
 key='pw-actor-'+str(uid);folder=a.work/key;folder.mkdir(exist_ok=True);(folder/'model.nsbmd').write_bytes(f[resource])
 subprocess.run([str(a.apicula.resolve()),'convert','-f=glb',str(folder/'model.nsbmd'),'-o',str(folder/'converted'),'--overwrite'],check=True,capture_output=True)
 model,textures=flatten_glb(next((folder/'converted').glob('*.glb')),key,assets,'assets/pinwheel');data['models'][key]=model;data['textures'].update(textures);special[uid]={'model':key,'resource':resource,'archive':'a/0/4/9'}
data['specialActors']=special
file.write_text('window.PINWHEEL_ASSETS='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
print('Converted',len(data['models']),'models with native material culling; special actors',special)
