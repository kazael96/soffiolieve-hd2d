"""Verified native party background and context-menu frame export, IRBI only."""
from pathlib import Path
import argparse,importlib.util,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10
from PIL import Image

def extract(rom,output):
 assert rom.idCode==b'IRBI'
 spec=importlib.util.spec_from_file_location('menu',Path(__file__).with_name('extract-menu.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
 files=lambda path:[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName(path)).files]
 dest=output/'assets/party-popup';dest.mkdir(parents=True,exist_ok=True);images={}
 f=files('a/0/7/6')
 for label,char,screen,palette,engine in [('mainBackground',15,20,6,'main'),('subBackground',14,19,5,'sub')]:
  im=m.layer(f,char,screen,palette).crop((0,0,256,192));im.save(dest/(label+'.png'));images[label]={'src':'assets/party-popup/'+label+'.png','size':[256,192],'source':{'archive':'a/0/7/6','char':char,'screen':screen,'palette':palette},'engine':engine}
 f=files('a/0/8/3')
 # Native02028258 copies the nine source tiles as a stretchable3x3 frame.
 for label,width,palette in [('buttonNormal',13,1),('buttonSelected',13,0),('confirmationNormal',8,1),('confirmationSelected',8,0)]:
  tiles=[(0 if x==0 else 2 if x==width-1 else 1)if y==0 else(6 if x==0 else 8 if x==width-1 else 7)if y==2 else(3 if x==0 else 5 if x==width-1 else 4)for y in range(3)for x in range(width)]
  nscr=bytearray(36+len(tiles)*2);struct.pack_into('<HH',nscr,24,width*8,24)
  for i,t in enumerate(tiles):struct.pack_into('<H',nscr,36+i*2,t|(palette<<12))
  ff=f+[nscr];im=m.layer(ff,32,len(f),31);im.save(dest/(label+'.png'));images[label]={'src':'assets/party-popup/'+label+'.png','size':list(im.size),'source':{'archive':'a/0/8/3','char':32,'palette':31,'paletteSlot':palette,'tiles':'native02028258 3x3 nine-slice0..8'},'nativeComposition':True}
 spec=importlib.util.spec_from_file_location('events',Path(__file__).with_name('extract-original-events.py'));e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
 texts=ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files;messages=e.messages(texts[157])
 ov=rom.loadArm9Overlays([91])[91];a=bytes(ov.data);base=ov.ramAddress
 ids=list(struct.unpack_from('<22I',a,0x021beb8c-base))
 actionMap={str(i):{'message':n,'label':messages[n]}for i,n in enumerate(ids)if n}
 maskloc=((0x21b6cf8+4)&~3)+0xe8;mask=struct.unpack_from('<I',a,maskloc-base)[0];assert mask==0xffff7fff
 data={'source':'IRBI overlay91 and ARM9 native context-menu engine','images':images,'actions':actionMap,'messages':messages,'native':{'physicalBottom':'main','physicalTop':'sub','lcdProof':'0x021b6cf6..6cfe POWCNT1 &=0xffff7fff','backgroundLoader':'0x021b7198','contextConstructor':'0x021b66a8 -> 0x02027ee0(BG0,palette1,font0)','popupConstructor':'0x021bb9f8 -> 0x020276f8','popupGeometry':'0x020279a4','popupFrame':'0x02028258','actionTextTable':'0x021beb8c','actionLabels':'0x021bbc98','normal':{'bg':0,'width':104,'rowHeight':24,'x':152,'yFormula':'192 - 24*count','textOffset':[10,6],'font':0,'frameNormal':'buttonNormal','frameSelected':'buttonSelected','fontColorPacked':'0x440'},'confirmation':{'width':64,'rowHeight':24,'x':192,'yFormula':'144 - 24*count','source':'0x021bba40'},'defaultActions':[0,3,4,6],'defaultLabels':['INFO','ORDINA','STRUMENTI','ESCI'],'defaultNormalY':[96,120,144,168],'defaultNote':'Selector1 expands usable field moves after INFO; message variant5 replaces4 for mail; eggs skip field moves/item','cancelAction':6,'cancelInput':'B chooses final row; ESCI is the native text, not ANNULLA','fullScreenOverlay':False,'selectedPalette':0,'normalPalette':1,'paletteLoad':'0x02027f32 NCLR31 first2 palettes -> BG palette slots1,2'}}
 data['native']['partyCards']={'table':'0x021beb74','rects':[[0,8,128,48],[128,16,128,48],[0,56,128,48],[128,64,128,48],[0,104,128,48],[128,112,128,48]],'source':'0x021ba5a0; entry animation initially copies128px right of final position'}
 data['native']['prompt']={'bg':0,'x':16,'y':152,'width':112,'height':32,'font':0,'message':18,'text':messages[18],'source':'0x021b813c..8154 +0x021bb65e','framePaletteSlot':12,'constructor':'0x021bb65e..686'}
 data['native']['normal']['fontColorPacked']='0x39e0'
 data['native']['fontColorProof']={'normalLiteral':'0x021bbc94','normal':'0x39e0','fieldMoveLiteral':'0x021bbc90','fieldMove':'0x35e0','normalFgIndex':14,'fieldMoveFgIndex':13,'shadowIndex':15}
 font=files('a/0/2/3')[0];glyph,widths,off=struct.unpack_from('<3I',font,0x20);mapping={}
 while off and off+12<len(font):
  first,last,kind,_,nxt=struct.unpack_from('<4HI',font,off);at=off+12
  if kind==0:
   start=struct.unpack_from('<H',font,at)[0];mapping.update({chr(c):start+c-first for c in range(first,last+1)})
  elif kind==1:mapping.update({chr(c):struct.unpack_from('<H',font,at+(c-first)*2)[0]for c in range(first,last+1)})
  elif kind==2:
   count=struct.unpack_from('<H',font,at)[0];mapping.update({chr(c):g for c,g in struct.iter_unpack('<HH',font[at+2:at+2+count*4])})
  off=nxt
 chars=[c for c in sorted(set('♂♀'+''.join(chr(c)for c in range(32,256))))if c in mapping and mapping[c]!=65535];rows=(len(chars)+15)//16;atlas=Image.new('RGBA',(192,rows*15*2));metrics={};pal=m.pal(f[31])
 for i,ch in enumerate(chars):
  cell=font[glyph+8+mapping[ch]*48:glyph+8+(mapping[ch]+1)*48];left,w,advance=cell[:3];metrics[ch]=[i%16*12,i//16*15,left,advance]
  for variant,ink in enumerate([14,13]):
   for y in range(15):
    for x in range(12):
     pos=y*12+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
     if ci in(1,2):atlas.putpixel((i%16*12+x,i//16*15+y+variant*rows*15),(*pal[ink if ci==1 else 15],255))
 atlas.save(dest/'font.png');data['font']={'src':'assets/party-popup/font.png','height':15,'variantOffset':rows*15,'glyphs':metrics,'normalVariant':0,'selectedVariant':0,'fieldMoveVariant':1,'source':{'font':'a/0/2/3:0','palette':'a/0/8/3:31','foreground':14,'shadow':15,'nativePacked':'0x39e0'},'colors':{'foreground':pal[14],'shadow':pal[15],'fieldMove':pal[13]}}
 (output/'party-popup-assets.js').write_text('window.PARTY_POPUP_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8');print('party popup assets',len(images))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)

