"""Export the native bicycle billboard, call 4, and small scene descriptors."""
import argparse,hashlib,json,struct,importlib.util
from pathlib import Path
import ndspy.rom,ndspy.narc,ndspy.texture,ndspy.color
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
def narc(path):return ndspy.narc.NARC(r.getFileByName(path)).files
def read(name):return json.loads((a.output/name).read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
def write(name,key,data):(a.output/name).write_text('window.'+key+'='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
assets=read('nimbasa-assets.js');ndspy.color.prepareLUTs()
fmt=struct.Struct('<HBBBBBBBBBBBbbbHHHHHH');rec=fmt.unpack_from(narc('a/0/4/8')[0],4+2*fmt.size)
assert rec[15]==7
texture=ndspy.texture.NSBTX(narc('a/0/4/9')[rec[15]]);palette=texture.palettes[0][1];palette.colors=[ndspy.color.pack(*c) for c in palette.colors];paths=[]
assert len(texture.textures)==16
for index,(_,tex) in enumerate(texture.textures):
 tex.isColor0Transparent=True;file=a.output/f'assets/nimbasa/bicycle-{index}.png';tex.renderAsImage(palette).save(file);paths.append(file.relative_to(a.output).as_posix()+'?v='+hashlib.sha256(file.read_bytes()).hexdigest()[:12])
assets['sprites']['2']=paths;write('nimbasa-assets.js','NIMBASA_ASSETS',assets)
metadata={z:{k:v for k,v in scene.items()if k!='instances'} for z,scene in assets['scenes'].items()};write('nimbasa-scenes.js','NIMBASA_SCENES',metadata)
sp=importlib.util.spec_from_file_location('events',Path(__file__).with_name('extract-original-events.py'));ev=importlib.util.module_from_spec(sp);sp.loader.exec_module(ev)
b=narc('a/1/3/1')[66];call={'source':'IRBI a/1/3/1:66','participants':list(b[:4]),'commands':list(struct.iter_unpack('<BBH',b[8:])),'text':ev.messages(narc('a/0/0/2')[195])}
assert set(call['participants'])<={0,1,3,255},call['participants']
assert any('Sciroccopoli' in line for line in call['text'])
write('nimbasa-phone.js','NIMBASA_PHONE',call)
print('Bicycle:',len(paths),'frames; call 4:',call['participants'],call['text'][0])
