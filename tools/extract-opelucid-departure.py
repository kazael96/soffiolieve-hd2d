"""IRBI417/effect17: original fly_out3 with its material/pattern tracks.

This exports the native component only; actor texture substitution, field
handoff and destination continuity remain separate runtime requirements.
"""
import argparse, ast, hashlib, json, shutil, struct, subprocess, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'audio-tools/python-packages'))
from irbi_reader import NintendoDSRom, NARC
import ndspy.texture, ndspy.color, ndspy._common
p=argparse.ArgumentParser(description=__doc__)
for key in ['rom','output','work','apicula']:p.add_argument('--'+key,type=Path,required=True)
a=p.parse_args();a.work.mkdir(parents=True,exist_ok=True)
r=NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
meta=NARC(r.getFileByName('a/1/1/7')).files[17]
assert struct.unpack('<18H',meta)==(57,0,56,0,103,65535,0,0,104,105,106,65535,65535,65535,65535,65535,0,0)
files=NARC(r.getFileByName('a/1/1/5')).files
target=a.output/'assets/opelucid/departure';target.mkdir(parents=True,exist_ok=True)
proof=[]
for member,suffix in [(103,'nsbmd'),(104,'nsbca'),(105,'nsbma'),(106,'nsbtp')]:
 raw=files[member];(a.work/f'{member}.{suffix}').write_bytes(raw)
 proof.append({'member':member,'sha256':hashlib.sha256(raw).hexdigest()})
converted=a.work/'converted'
subprocess.run([str(a.apicula.resolve()),'convert','-f=glb',str(a.work/'103.nsbmd'),str(a.work/'104.nsbca'),'-o',str(converted),'--overwrite'],check=True,capture_output=True)
for file in converted.iterdir():
 if file.suffix in ['.glb','.png']:shutil.copyfile(file,target/file.name)
# Reuse the reviewed Nitro material/pattern decoders without running their CLI.
source=Path(__file__).with_name('extract-opelucid-cinematics.py')
tree=ast.parse(source.read_text(encoding='utf8'))
for node in tree.body:
 if isinstance(node,ast.FunctionDef) and node.name in ['dictionary','material_tracks','texture_tracks']:
  exec(compile(ast.Module(body=[node],type_ignores=[]),str(source),'exec'),globals())
alpha,color=material_tracks(files[105])
# This effect has four palettes. Render each BTP texture/palette pair explicitly;
# converter PNGs include only the initially bound texture, not later patterns.
model=files[103];blocks=struct.unpack_from('<'+'I'*struct.unpack_from('<H',model,14)[0],model,16)
tex=next(model[at:at+struct.unpack_from('<I',model,at+4)[0]]for at in blocks if model[at:at+4]==b'TEX0')
container=struct.pack('<4sHHIHHI',b'BTX0',0xfeff,1,20+len(tex),16,1,20)+tex
textures=ndspy.texture.NSBTX(container)
ndspy.color.prepareLUTs()
# ndspy's generic palette reader takes the next offset even when it is equal
# to this one. The three fly_effect palettes alias the same native bytes.
header=struct.unpack_from('<IHH3IHH4IHH2I',tex,8)
palOff,palDataOff,palDataEnd=header[-2],header[-1],header[-1]+(header[-4]<<3)
rows=[]
for name,unk00,unk02,palHeader in ndspy._common.loadInfoBlock(tex,palOff,4):
 off,unk=struct.unpack('<HH',palHeader);rows.append((name,unk00,unk02,unk,palDataOff+(off<<3)))
boundaries=sorted({row[-1]for row in rows}|{palDataEnd});paletteByName={}
for name,unk00,unk02,unk,startOff in rows:
 endOff=next(end for end in boundaries if end>startOff)
 palette=ndspy.texture.Palette(unk00,unk02,unk,tex[startOff:endOff])
 palette.colors=[ndspy.color.pack(*color)for color in palette.colors];paletteByName[name]=palette
textureByName=dict(textures.textures)
raw=files[106];start=0x44;patternFrames,nt,np,ot,op=struct.unpack_from('<HBBHH',raw,start+4)
names=lambda off,count:[raw[start+off+i*16:start+off+(i+1)*16].split(b'\0')[0].decode('ascii')for i in range(count)]
textureNames,paletteNames=names(ot,nt),names(op,np);patterns={}
for material,entry,size in dictionary(raw,start+12):
 assert size==8
 count,unknown,offset=struct.unpack_from('<IHH',raw,entry);keys=[]
 for i in range(count):
  frame,textureId,paletteId=struct.unpack_from('<HBB',raw,start+offset+i*4)
  assert frame<patternFrames and textureId<nt and paletteId<np
  name,palette=textureNames[textureId],paletteNames[paletteId]
  image=target/(name.replace('.','_')+'--'+palette.replace('.','_')+'.png')
  texture=textureByName[name];texture.isColor0Transparent=True
  texture.renderAsImage(paletteByName[palette]).save(image)
  keys.append({'frame':frame,'url':image.relative_to(a.output).as_posix()})
 assert keys[0]['frame']==0 and all(x['frame']<y['frame']for x,y in zip(keys,keys[1:]))
 patterns[material]=keys
frames=struct.unpack_from('<H',files[104],0x44+4)[0]
result={'source':{'rom':'IRBI','command':417,'effect':17,'descriptorArchive':'a/1/1/7','descriptorMember':17,'archive':'a/1/1/5','proof':proof},
        'model':'assets/opelucid/departure/fly_out3.glb','frames':frames,'alpha':alpha,'color':color,'texturePatterns':patterns,
        'camera':[[0,0,0,0,0,128]],'perspective':{'sin':__import__('math').sin(0x1555*__import__('math').tau/65536),'cos':__import__('math').cos(0x1555*__import__('math').tau/65536),'near':1,'far':1024},
        'cameraSource':'IRBI021c19d8: eye021da5d4 /4096; angle0x1555, near4096, far0x400000',
        'sounds':[{'frame':24,'id':1650}],
        'scope':'Native fly_out3 already contains fly_champ textures for Nardo; runtime must preserve physical departure and destination continuity'}
(a.output/'opelucid-departure-data.js').write_text('window.OPELUCID_DEPARTURE_DATA='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8')
print(json.dumps({'frames':frames,'alphaMaterials':list(alpha),'colorMaterials':list(color),'patternMaterials':list(patterns),'files':[f.name for f in target.iterdir()]},ensure_ascii=False))
