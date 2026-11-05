"""Export Skyla's original cannon model, four BCA/BMA sets and14 float paths."""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
import struct
import subprocess
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'audio-tools/python-packages'))
from irbi_reader import NintendoDSRom, NARC, code_decompress
from nitro_geometry import flatten_glb

p=argparse.ArgumentParser()
p.add_argument('rom',type=Path);p.add_argument('output',type=Path)
p.add_argument('--apicula',type=Path,required=True);p.add_argument('--work-dir',type=Path,required=True)
a=p.parse_args();r=NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
o=r.loadArm9Overlays([41])[41]
assert hashlib.sha256(o.data).hexdigest()=='6be658eeb33bff1324460a15c745cb1490f91b5f9bcc9cd613463a5802e8b024'
archive=NARC(r.getFileByName('a/1/2/1')).files
def rows(address,count,fmt):
 size=struct.calcsize(fmt)
 return [list(struct.unpack_from(fmt,o.data,address-o.ramAddress+i*size)) for i in range(count)]

data={'source':'IRBI overlay41 + a/1/2/1','zone':108,'tickRate':30,
      'origins':[[n/65536 for n in row]for row in rows(0x021f40e8,10,'<3i')],
      'anchors':rows(0x021f3fd0,10,'<3H'),
      'orientations':list(o.data[0x021f4540-o.ramAddress:0x021f4540-o.ramAddress+10]),
      'directionCycle':list(o.data[0x021f3f60-o.ramAddress:0x021f3f60-o.ramAddress+4]),
      'nativeDirectionToColumn':[0,1,3,2],
      'animationFrames':{key:[v[0]for v in rows(at,4,'<H')]for key,at in [('soundA',0x021f3f64),('recoilStart',0x021f3f6c),('soundB',0x021f3f74),('flightStart',0x021f3f7c)]},
      'routes':[[{'member':v[0],'destination':v[1:4],'profile':v[4]}for v in rows(0x021f4200+i*80,4,'<5i')]for i in range(10)],
      'profiles':rows(0x021f4078,14,'<HHBBBB'),'paths':{},'materialAnimations':{},
      'sounds':[1688,1689,1696,1686,1687,1697]}
for member in range(9,23):
 raw=archive[member];count,flags=struct.unpack_from('<II',raw)
 assert len(raw)==8+count*12 and flags==65536
 points=[[int(v*4096+(.5 if v>=0 else -.5)) for v in row]for row in struct.iter_unpack('<3f',raw[8:])]
 data['paths'][member]={'frames':count,'pointsQ16':points,'sha256':hashlib.sha256(raw).hexdigest()}
for member in [2,4,6,8]:
 raw=archive[member];assert raw[:4]==b'BMA0'
 section=0x44;duration=struct.unpack_from('<H',raw,section+4)[0]
 dictionary=section+8;n=raw[dictionary+1];entry=dictionary+struct.unpack_from('<H',raw,dictionary+6)[0]
 size,names=struct.unpack_from('<HH',raw,entry);assert size==20
 materials={}
 for j in range(n):
  name=raw[entry+names+j*16:entry+names+(j+1)*16].split(b'\0')[0].decode('ascii')
  channels=struct.unpack_from('<5I',raw,entry+4+j*20);assert all(c&0x20000000 for c in channels[:4])
  value=channels[4]
  if value&0x20000000:alpha=[value&31]*duration
  else:
   assert value>>16==duration
   alpha=list(raw[section+(value&65535):section+(value&65535)+duration])
  assert len(alpha)==duration and max(alpha)<=31
  materials[name]={'alpha':alpha,'constantRGB555':[v&32767 for v in channels[:4]]}
 data['materialAnimations'][(member-2)//2]={'frames':duration,'materials':materials}

arm=code_decompress(r.arm9);lookup=arm[0x020a1a30-r.arm9RamAddress:0x020a1a30-r.arm9RamAddress+16384]
assert len(lookup)==16384 and struct.unpack_from('<2h',lookup,0)==(0,4096)
assert struct.unpack_from('<2h',lookup,4096)==(4096,0)
data['sinCosQ12']=[list(pair)for pair in struct.iter_unpack('<2h',lookup)]
work=a.work_dir;work.mkdir(parents=True,exist_ok=True);inputs=[]
for member in range(9):
 file=work/f'cannon-{member}.bin';file.write_bytes(archive[member]);inputs.append(str(file.resolve()))
converted=work/'converted'
result=subprocess.run([str(a.apicula.resolve()),'convert',*inputs,'-o',str(converted.resolve()),'-f','glb','--all-animations','--overwrite'],check=True,capture_output=True,text=True)
(work/'apicula.log').write_text(result.stdout+'\n'+result.stderr,encoding='utf8')
dest=a.output/'assets/icirrus/gym';dest.mkdir(parents=True,exist_ok=True)
for file in converted.iterdir():
 if file.suffix in ['.glb','.png']:shutil.copyfile(file,dest/file.name)
glb=next(converted.glob('*.glb'));prefix='ic-gym-cannon'
geometry,textures=flatten_glb(glb,prefix,a.output/'assets/icirrus','assets/icirrus')
raw=glb.read_bytes();length=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+length])
assert len(doc.get('animations',[]))==4
data.update({'model':{'url':'assets/icirrus/gym/'+glb.name,'key':prefix,'animations':[v['name']for v in doc['animations']]},'geometry':{prefix:geometry},'textures':textures})
assert sum(route['member']>=0 for row in data['routes']for route in row)==14
for i,row in enumerate(data['routes']):
 for route in row:
  if route['member']<0:continue
  last=data['paths'][route['member']]['pointsQ16'][-1]
  actual=[data['origins'][i][k]+last[k]/65536 for k in range(3)]
  assert all(abs(actual[k]-(route['destination'][k]+.5))<.00002 for k in [0,2])
(a.output/'icirrus-gym-data.js').write_text('window.ICIRRUS_GYM_DATA='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
print('Skyla:10 cannons,14 paths,4 BCA/BMA sets,4096 Q12 sine/cosine pairs')
