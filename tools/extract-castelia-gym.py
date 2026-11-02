"""IRBI honey-gym models and placement tables, overlays 37/38 + a/1/3/5."""
from pathlib import Path
import argparse,json,struct,subprocess,shutil
import ndspy.rom,ndspy.narc
from nitro_geometry import flatten_glb
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);p.add_argument('--apicula',type=Path,required=True);p.add_argument('--work-dir',type=Path,required=True);a=p.parse_args()
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
f=ndspy.narc.NARC(r.getFileByName('a/1/3/5')).files;ov=r.loadArm9Overlays([37,38]);o=ov[38]
def positions(addr,count):return [[v/65536 for v in struct.unpack_from('<3i',o.data,addr-o.ramAddress+i*12)]for i in range(count)]
data={'source':'IRBI overlays37/38 and a/1/3/5','buttons':positions(0x21f45c8,8),'poles':positions(0x21f4628,10),'walls':positions(0x21f4574,7),'buttonPoles':[[0],[1],[2],[3,4],[5],[6],[7,8],[9]],'wallPoles':[[0,1],[2,3],[4,5],[6,6],[7,7],[8,9]],'models':{}}
path=a.output/'castelia-assets.js';assets=json.loads(path.read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'));dest=a.output/'assets/castelia/gym';dest.mkdir(parents=True,exist_ok=True)
for key,model,animations in [('pole1',0,[6,7]),('pole2',1,[8,9]),('switch',3,[12,13]),('wall1',4,[14,15,16,17,18,19,20,21]),('wall2',5,[22,23,24,25])]:
 work=a.work_dir/key;work.mkdir(parents=True,exist_ok=True);inputs=[]
 for member in [model,*animations]:
  file=work/f'{member}.bin';file.write_bytes(f[member]);inputs.append(str(file.resolve()))
 converted=work/'converted';subprocess.run([str(a.apicula.resolve()),'convert',*inputs,'-o',str(converted.resolve()),'-f','glb','--all-animations','--overwrite'],check=True,capture_output=True)
 for file in converted.iterdir():shutil.copyfile(file,dest/file.name)
 glb=next(converted.glob('*.glb'));prefix='ca-gym-'+key;m,t=flatten_glb(glb,prefix,a.output/'assets/castelia','assets/castelia');assets['models'][prefix]=m;assets['textures'].update(t)
 data['models'][key]={'url':'assets/castelia/gym/'+glb.name,'model':prefix,'members':[model,*animations]}
path.write_text('window.CASTELIA_ASSETS='+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
(a.output/'castelia-gym-data.js').write_text('window.CASTELIA_GYM_DATA='+json.dumps(data,separators=(',',':'))+';\n')
print('Exported honey gym models,7walls,10poles,8buttons',data['walls'])
