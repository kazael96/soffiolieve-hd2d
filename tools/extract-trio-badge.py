"""Export IRBI Medaglia Tris receipt model, joint and material alpha tracks."""
from pathlib import Path
import argparse,hashlib,json,struct,subprocess,tempfile,shutil
import ndspy.rom,ndspy.narc
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);p.add_argument('--apicula',type=Path,required=True);a=p.parse_args()
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
f=ndspy.narc.NARC(r.getFileByName('a/1/1/5')).files;d=ndspy.narc.NARC(r.getFileByName('a/1/1/7')).files
path=a.output/'field-effect-assets.js';s=path.read_text(encoding='utf8');data=json.loads(s.split('=',1)[1].strip().rstrip(';'))
with tempfile.TemporaryDirectory() as t:
 t=Path(t)
 for name,indices in [('badgeBackground',[16,18]),('trioBadge',[17,21,22])]:
  inputs=[]
  for i in indices:
   x=t/f'{i}.bin';x.write_bytes(f[i]);inputs.append(str(x));data['hashes'][str(i)]=hashlib.sha256(f[i]).hexdigest()
  folder=t/name;subprocess.run([str(a.apicula.resolve()),'convert',*inputs,'-o',str(folder),'-f','glb','--all-animations'],check=True,capture_output=True)
  dest=a.output/'assets/field-effects'/name;dest.mkdir(parents=True,exist_ok=True)
  for x in folder.iterdir():shutil.copyfile(x,dest/x.name)
  glb=next(dest.glob('*.glb'));data['models'][name]={'url':glb.relative_to(a.output).as_posix(),'sourceMembers':indices,'frames':361}
raw=f[19];start=0x44;dictionary=start+8;entry=dictionary+struct.unpack_from('<H',raw,dictionary+6)[0];size,names=struct.unpack_from('<HH',raw,entry);assert size==20
tracks={}
for i in range(raw[dictionary+1]):
 name=raw[entry+names+i*16:entry+names+(i+1)*16].split(b'\0')[0].decode();channels=struct.unpack_from('<5I',raw,entry+4+i*20);assert all(c&0x20000000 for c in channels[:4]);alpha=channels[4];assert alpha>>16==361;tracks[name]=list(raw[start+(alpha&0xffff):start+(alpha&0xffff)+361]);assert max(tracks[name])<=31
# Native joint and alpha; badge visibility/pattern and SPL15 remain recorded adaptations.
data['materialAlpha']['badgeBackground']=tracks;data['materialAlpha']['trioBadge']={}
data['effects']['2']={'descriptor':list(struct.unpack('<18H',d[2])),'background':'badgeBackground','item':'trioBadge','frames':361,'particles':False,'descriptorSha256':hashlib.sha256(d[2]).hexdigest(),'label':'Medaglia Tris','adaptation':'Native models, joint and background alpha; BTP/BVA and SPL15 not reconstructed'}
path.write_text('window.FIELD_EFFECT_ASSETS='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
print('Exported Tris badge receipt')
