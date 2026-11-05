"""Export IRBI storage backgrounds and Italian text; no original executable emitted."""
from pathlib import Path
import argparse, hashlib, importlib.util, json, sys
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'audio-tools/python-packages'))
from irbi_reader import install
install()
import ndspy.rom, ndspy.narc, ndspy.lz10

def module(name,file):
 spec=importlib.util.spec_from_file_location(name,Path(__file__).parent/file)
 result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result);return result

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
 r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
 menu=module('storage_menu','extract-menu.py');events=module('storage_events','extract-original-events.py')
 raw=r.getFileByName('a/1/1/6');members=ndspy.narc.NARC(raw).files
 files=[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in members]
 dest=a.output/'assets/pokemon-storage';dest.mkdir(parents=True,exist_ok=True)
 images={}
 for name,char,screen,palette in [('main',3,2,4),('base',1,0,4),('sub',6,5,7),('wallpaper',14,13,38)]:
  image=menu.layer(files,char,screen,palette);image.save(dest/(name+'.png'))
  images[name]={'path':'assets/pokemon-storage/'+name+'.png','width':image.width,'height':image.height,'members':{str(i):hashlib.sha256(members[i]).hexdigest()for i in [char,screen,palette]}}
 texts={}
 for archive,bank,key in [('a/0/0/2',9,'actions'),('a/0/0/2',10,'messages'),('a/0/0/3',314,'pc')]:
  rawText=ndspy.narc.NARC(r.getFileByName(archive)).files[bank]
  texts[key]={'archive':archive,'bank':bank,'sha256':hashlib.sha256(rawText).hexdigest(),'messages':events.messages(rawText)}
 data={'source':'IRBI overlay170, a/1/1/6 native background layers; dynamic HD-2D menu composition documented separately','archiveSha256':hashlib.sha256(raw).hexdigest(),'images':images,'texts':texts}
 (a.output/'pokemon-storage-assets.js').write_text('window.POKEMON_STORAGE_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
 print(json.dumps({'images':len(images),'textBanks':len(texts),'archiveSha256':data['archiveSha256']}))
