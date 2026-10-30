"""Export Aloé's male/female badge models; keep the existing scoped receipt adaptation."""
from pathlib import Path
import argparse,hashlib,json,struct,subprocess,tempfile,shutil
import ndspy.rom,ndspy.narc
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);p.add_argument('--apicula',type=Path,required=True);a=p.parse_args()
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
f=ndspy.narc.NARC(r.getFileByName('a/1/1/5')).files;d=ndspy.narc.NARC(r.getFileByName('a/1/1/7')).files
path=a.output/'field-effect-assets.js';data=json.loads(path.read_text().split('=',1)[1].rstrip().rstrip(';'))
assert data['hashes']['16']==hashlib.sha256(f[16]).hexdigest()
with tempfile.TemporaryDirectory() as t:
 t=Path(t)
 for id,name in [(4,'basicBadgeM'),(43,'basicBadgeF')]:
  descriptor=struct.unpack('<18H',d[id]);assert descriptor[4]==16 and descriptor[8:12]==(18,19,20,65535)
  indices=[descriptor[5],descriptor[12],descriptor[13]];inputs=[]
  for i in indices:
   file=t/f'{i}.bin';file.write_bytes(f[i]);inputs.append(str(file));data['hashes'][str(i)]=hashlib.sha256(f[i]).hexdigest()
  folder=t/name;subprocess.run([str(a.apicula.resolve()),'convert',*inputs,'-o',str(folder),'-f','glb','--all-animations'],check=True,capture_output=True)
  dest=a.output/'assets/field-effects'/name;dest.mkdir(parents=True,exist_ok=True)
  for file in folder.iterdir():shutil.copyfile(file,dest/file.name)
  glb=next(dest.glob('*.glb'));data['models'][name]={'url':glb.relative_to(a.output).as_posix(),'sourceMembers':indices,'frames':361};data['materialAlpha'][name]={}
  data['effects'][str(id)]={'descriptor':descriptor,'background':'badgeBackground','item':name,'frames':361,'particles':False,'descriptorSha256':hashlib.sha256(d[id]).hexdigest(),'label':'Medaglia Base','adaptation':'Original models, joint animation and background alpha; visibility/pattern and SPL15 are not reconstructed'}
path.write_text('window.FIELD_EFFECT_ASSETS='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8');print('Exported Basic Badge receipt',4,43)
