"""Native models/joint animation for the N wheel and drawbridge story scenes."""
from pathlib import Path
import argparse,json,subprocess,shutil
try:
 import ndspy.rom,ndspy.narc
except ModuleNotFoundError:
 from irbi_reader import install
 install()
 import ndspy.rom,ndspy.narc
from nitro_geometry import flatten_glb
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);p.add_argument('--apicula',type=Path,required=True);p.add_argument('--work-dir',type=Path,required=True);a=p.parse_args()
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI';f=ndspy.narc.NARC(r.getFileByName('a/1/6/0')).files
data={'source':'IRBI a/1/6/0, native model and joint animation; camera framing adapted for browser','models':{}}
dest=a.output/'assets/driftveil/cinematics';dest.mkdir(parents=True,exist_ok=True)
for key,model,animations in [('wheel',76,[75]),('wheelFrame',78,[77]),('wheelField',65,[]),('wheelSky',71,[]),('bridge',213,[212]),('bridgeSky',215,[])]:
 work=a.work_dir/key;work.mkdir(parents=True,exist_ok=True);inputs=[]
 for member in [model,*animations]:
  file=work/f'{member}.bin';file.write_bytes(f[member]);inputs.append(str(file.resolve()))
 converted=work/'converted';subprocess.run([str(a.apicula.resolve()),'convert',*inputs,'-o',str(converted.resolve()),'-f','glb','--all-animations','--overwrite'],check=True,capture_output=True)
 for file in converted.iterdir():shutil.copyfile(file,dest/file.name)
 glb=next(converted.glob('*.glb'));m,t=flatten_glb(glb,'proof-'+key,work,'proof')
 verts=[g['verts'] for g in m['groups']];bounds=[[min(v for g in verts for v in g[k::11]),max(v for g in verts for v in g[k::11])]for k in range(3)]
 data['models'][key]={'url':'assets/driftveil/cinematics/'+glb.name,'members':[model,*animations],'bounds':bounds}
(a.output/'driftveil-cinematics-data.js').write_text('window.DRIFTVEIL_CINEMATICS='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
print(data)
