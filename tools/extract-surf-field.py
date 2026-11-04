"""Export original IRBI Surf rider textures, sea_ride and shibuki animations."""
from pathlib import Path
import argparse, hashlib, json, shutil, struct, subprocess, sys
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'audio-tools/python-packages'))
from irbi_reader import NintendoDSRom, NARC
import ndspy.texture, ndspy.color
from nitro_geometry import flatten_glb

p=argparse.ArgumentParser()
for name in ['rom','output','work','apicula']: p.add_argument('--'+name,type=Path,required=True)
a=p.parse_args();r=NintendoDSRom.fromFile(a.rom)
assets=a.output/'assets/field-surf';assets.mkdir(parents=True,exist_ok=True)
a.work.mkdir(parents=True,exist_ok=True)
proof=[];bundle=NARC(r.getFileByName('a/0/7/5')).files
for member,suffix in [(49,'nsbmd'),(54,'nsbmd'),(107,'nsbca'),(133,'nsbta')]:
 raw=bundle[member];file=a.work/f'{member}.{suffix}';file.write_bytes(raw)
 proof.append({'archive':'a/0/7/5','member':member,'sha256':hashlib.sha256(raw).hexdigest()})
converted=a.work/'converted'
subprocess.run([str(a.apicula.resolve()),'convert','-f=glb',*[str(a.work/f'{i}.{s}')for i,s in [(49,'nsbmd'),(54,'nsbmd'),(107,'nsbca'),(133,'nsbta')]],'-o',str(converted),'--overwrite'],check=True,capture_output=True)
models={};textures={};urls={}
for name in ['sea_ride','shibuki01']:
 file=converted/(name+'.glb');key='surf-'+name
 models[key],ts=flatten_glb(file,key,assets,'assets/field-surf');textures.update(ts)
 shutil.copyfile(file,assets/file.name);urls[name]='assets/field-surf/'+file.name
 for texture in converted.glob('*.png'):shutil.copyfile(texture,assets/texture.name)
sprites={};ndspy.color.prepareLUTs();raws=NARC(r.getFileByName('a/0/4/9')).files
for sex,member in [('male',8),('female',11)]:
 raw=raws[member];tex=ndspy.texture.NSBTX(raw);pal=tex.palettes[0][1];pal.colors=[ndspy.color.pack(*c)for c in pal.colors]
 proof.append({'archive':'a/0/4/9','member':member,'sha256':hashlib.sha256(raw).hexdigest()})
 frames=[]
 for i,(_,t)in enumerate(tex.textures):
  t.isColor0Transparent=True;name=f'{sex}-{i}.png';t.renderAsImage(pal).save(assets/name)
  frames.extend(['assets/field-surf/'+name]*3)
 sprites['AlcideSurf'if sex=='male'else'AnitaSurf']=frames
headers=NARC(r.getFileByName('a/0/1/2')).files[0]
# IRBI map headers are fixed48-byte records in a/0/1/2.
musicFlags={str(z):bool(struct.unpack_from('<H',headers,z*48+0x1e)[0]&0x4000)for z in [6,96,155,191,193,194,198,331,337,113]}
result={'source':'IRBI Surf: a/0/7/5 members49/54/107/133, a/0/4/9 members8/11','proof':proof,'models':models,'textures':textures,'urls':urls,'sprites':sprites,'musicFlags':musicFlags,
 'directions':{'rideYaw':[32768,0,49152,16384],'sprayYaw':[0,32768,16384,49152],'sprayOffsetQ16':[[0,-16384,57344],[0,-16384,-57344],[57344,-16384,0],[-57344,-16384,0]]}}
(a.output/'surf-field-assets.js').write_text('window.SURF_FIELD_ASSETS='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8')
print(json.dumps({'models':len(models),'textures':len(textures),'sprites':len(sprites),'proof':proof,'musicFlags':musicFlags}))
