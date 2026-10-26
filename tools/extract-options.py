"""Export native IRBI Options graphics, selected by overlay68's loader."""
from pathlib import Path
import argparse,hashlib,importlib.util,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10
from PIL import Image
def sibling(name):
 spec=importlib.util.spec_from_file_location(name,Path(__file__).with_name(name+'.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
def extract(rom,output):
 assert rom.idCode==b'IRBI';gfx=sibling('extract-menu');events=sibling('extract-original-events')
 files=[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName('a/0/2/7')).files];assert len(files)==17
 ov=bytes(rom.loadArm9Overlays([68])[68].data);base=0x21b94a0
 assert ov[0x21b98fa-base:0x21b98fc-base]==bytes.fromhex('1b20')
 dest=output/'assets/options';dest.mkdir(parents=True,exist_ok=True);images={};groups={}
 for label,char,screen,palette in [('topBackground',13,14,1),('rows',0,2,1),('lowerBackground',7,9,8)]:
  im=gfx.layer(files,char,screen,palette);name=label+'.png';im.save(dest/name);images[label]={'src':'assets/options/'+name,'size':list(im.size),'source':{'archive':'a/0/2/7','char':char,'screen':screen,'palette':palette}}
 for label,char,cer,anr in [('selector',5,4,3),('extra',12,11,10)]:
  group={'source':{'archive':'a/0/2/7','char':char,'cells':cer,'animation':anr,'palette':6},'cells':[],'animations':gfx.animations(files[anr])}
  for i,(im,box)in enumerate(gfx.cells(files,char,cer,6)):
   name=f'{label}-{i}.png';im.save(dest/name);group['cells'].append({'src':'assets/options/'+name,'origin':box[:2],'size':box[2:]})
  groups[label]=group
 banks=ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files
 labels=events.messages(banks[29]);font=ndspy.narc.NARC(rom.getFileByName('a/0/2/3')).files[0]
 glyph,_,off=struct.unpack_from('<3I',font,0x20);mapping={}
 while off and off+12<len(font):
  first,last,kind,_,nxt=struct.unpack_from('<4HI',font,off);at=off+12
  if kind==0:
   start=struct.unpack_from('<H',font,at)[0];mapping.update({chr(c):start+c-first for c in range(first,last+1)})
  elif kind==1:mapping.update({chr(c):struct.unpack_from('<H',font,at+(c-first)*2)[0]for c in range(first,last+1)})
  elif kind==2:
   count=struct.unpack_from('<H',font,at)[0];mapping.update({chr(c):g for c,g in struct.iter_unpack('<HH',font[at+2:at+2+count*4])})
  else:raise ValueError('Unknown font map')
  off=nxt
 chars=[c for c in sorted(set(''.join(chr(c)for c in range(32,256))+''.join(labels)))if c in mapping and mapping[c]!=65535]
 rows=(len(chars)+15)//16;metrics={};colors=gfx.pal(files[1]);font_variants={}
 for state,slot in [('normalChosen',0),('normalOther',3),('focusedChosen',7),('focusedOther',12)]:
  atlas=Image.new('RGBA',(192,rows*15))
  for i,ch in enumerate(chars):
   cell=font[glyph+8+mapping[ch]*48:glyph+8+(mapping[ch]+1)*48];left,_,advance=cell[:3];metrics[ch]=[i%16*12,i//16*15,left,advance]
   for y in range(15):
    for x in range(12):
     pos=y*12+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
     if ci in(1,2):atlas.putpixel((i%16*12+x,i//16*15+y),(*colors[slot*16+ci],255))
  name='font-'+state+'.png';atlas.save(dest/name);font_variants[state]={'src':'assets/options/'+name,'paletteBank':slot}
 # Overlay68:021ba90c remaps the BG2 tilemap palette for each option row.
 row_banks=list(ov[0x21bb438-base:0x21bb438-base+5]);assert row_banks==[3,1,0,1,3]
 for label,slot in [('rowNormal'+str(i),p)for i,p in enumerate(row_banks)]+[('rowSelected',7)]:
  changed=list(files);screen=bytearray(files[2])
  for off in range(36,len(screen),2):
   tile=struct.unpack_from('<H',screen,off)[0];struct.pack_into('<H',screen,off,(tile&0xfff)|(slot<<12))
  changed[2]=bytes(screen);im=gfx.layer(changed,0,2,1).crop((0,16,256,40));name=label+'.png';im.save(dest/name)
  images[label]={'src':'assets/options/'+name,'size':[256,24],'source':{'archive':'a/0/2/7','char':0,'screen':2,'palette':1,'paletteBank':slot,'crop':[0,16,256,24],'remapRoutine':'overlay68:021ba90c'}}
 data={'source':'IRBI overlay68, text29; graphics loader021b98fa NARC27 a/0/2/7','images':images,'groups':groups,'labels':events.messages(banks[29]),'limits':['Rows tilemap is256x512; preserve native scroll/crop rather than shrinking','Palette-range transfer at021b9970 copies NCLR8 byteOffset128 to BG palette byteOffset480 for32 bytes; exported source palette is retained','Dynamic selector positions, text positions and input repeat are not certified by these static resources'],'revision':hashlib.sha256(b''.join(p.read_bytes()for p in sorted(dest.glob('*.png')))).hexdigest()[:12]}
 images['bottomBackground']={**images['topBackground'],'physicalScreen':'bottom','background':0}
 images['upperBackground']={**images['lowerBackground'],'physicalScreen':'top','background':5}
 images['rows'].update({'physicalScreen':'bottom','background':2})
 images['topBackground']['legacyAliasOf']='bottomBackground';images['lowerBackground']['legacyAliasOf']='upperBackground'
 data['screenLayout']={'mainEngine':'bottom','subEngine':'top','powerSwapBit15':0,'source':'overlay68:021b9788→021b978a calls ARM9:020435bc'}
 data['layout']={'font':0,'initialScroll':{'bg1Y':12,'bg2Y':-8,'spriteYOffset':24},'windows':[dict(zip(['textId','tileX','tileY','width','height'],struct.unpack_from('<I4B',ov,0x21bb720-base+i*8)))for i in range(16)],'selectors':[dict(zip(['row','value','x','y','touchXY','touchWH'],struct.unpack_from('<6I',ov,0x21bb604-base+i*24)))for i in range(11)],'normalRowPaletteBanks':row_banks,'selectedRowPaletteBank':7,'valuePaletteBanks':{'focusedChosen':7,'focusedOther':12,'normalChosen':0,'normalOther':3},'labelPaletteBanks':{'focused':7,'normal':0},'selectorAnimation':{'normalChosen':0,'normalOther':1,'focusedOther':2,'focusedChosen':3},'source':'overlay68:021b9b0e,021ba634,021ba90c,021baae0'}
 data['font']={'height':15,'glyphs':metrics,'variants':font_variants,'source':'Font0 a/0/2/3 member0; literal native NCLR a/0/2/7 member1 palette banks0,3,7,12 selected by021ba97a..021ba9ea; glyph ink1/shadow2'}
 (output/'options-assets.js').write_text('window.OPTIONS_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)
