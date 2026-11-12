"""Decode six graphics selected by IRBI556 work16416/16417, not dummy162/163."""
from pathlib import Path
import argparse,struct,json,hashlib,sys
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'audio-tools/python-packages'))
from irbi_reader import NintendoDSRom,NARC
import ndspy.texture,ndspy.color

def extract(rom_path,output):
 rom=NintendoDSRom.fromFile(rom_path);assert rom.idCode==b'IRBI';ndspy.color.prepareLUTs()
 table=NARC(rom.getFileByName('a/0/4/8')).files[0];archive=NARC(rom.getFileByName('a/0/4/9')).files;fmt=struct.Struct('<HBBBBBBBBBBBbbbHHHHHH')
 records={};sprites={};metrics={};proof=[]
 for mid in [211,212,213,214,221,222]:
  record=fmt.unpack_from(table,4+mid*fmt.size);assert record[0]==mid and record[1]==1
  member=record[15];raw=archive[member];assert raw[:4]==b'BTX0';data=ndspy.texture.NSBTX(raw)
  palette=data.palettes[0][1];palette.colors=[ndspy.color.pack(*color)for color in palette.colors];frames=[];bounds=[];size=None
  for index,(_,texture)in enumerate(data.textures):
   texture.isColor0Transparent=True;image=texture.renderAsImage(palette);size=size or image.size;assert image.size==size
   file=output/'assets/finale'/f'actor-{mid}-{index}.png';file.parent.mkdir(parents=True,exist_ok=True);image.save(file)
   frames.append('assets/finale/'+file.name+'?v='+hashlib.sha256(file.read_bytes()).hexdigest()[:12]);bounds.append(image.getbbox())
  sprites[str(mid)]=frames;metrics[str(mid)]={'width':size[0],'height':size[1],'bounds':bounds,'sourceRecord':list(record)}
  proof.append({'model':mid,'archive':'a/0/4/9','member':member,'sha256':hashlib.sha256(raw).hexdigest(),'frames':len(frames)})
 result={'source':'IRBI556 work16416/16417 selectors162/163; original BTX0 billboards','sprites':sprites,'metrics':metrics,'proof':proof}
 (output/'finale-selector-sprites.js').write_text('window.FINALE_SELECTOR_SPRITES='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8')
 print('Decoded six native selector graphics:',[(mid,len(frames))for mid,frames in sprites.items()])

if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('rom',type=Path);parser.add_argument('output',type=Path);args=parser.parse_args();extract(args.rom,args.output)
