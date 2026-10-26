"""Extract IRBI Bag quantity and field Ready-menu original resources.

No window is redrawn. Palette-bank changes are described separately because
the list highlight is a native BG palette remap, not a replacement bitmap.
"""
from pathlib import Path
import argparse,importlib.util,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10
from PIL import Image

def sibling(name):
 s=importlib.util.spec_from_file_location(name,Path(__file__).with_name(name+'.py'));m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m

def extract(rom,out):
 assert rom.idCode==b'IRBI'
 gfx=sibling('extract-menu');text=sibling('extract-original-events')
 dest=out/'assets/field-popups';dest.mkdir(parents=True,exist_ok=True)
 def archive(path):return [ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName(path)).files]
 images={};groups={}
 for key,path,c,s,p in [('bagQuantity','a/0/8/8',33,35,34),('readyBackground','a/1/2/8',5,7,6)]:
  f=archive(path);im=gfx.layer(f,c,s,p);im.save(dest/(key+'.png'));images[key]={'src':'assets/field-popups/'+key+'.png','size':list(im.size),'source':{'archive':path,'char':c,'screen':s,'palette':p}}
 f=archive('a/1/2/8');group={'source':{'archive':'a/1/2/8','char':3,'cells':2,'animation':1,'palette':4},'cells':[],'animations':gfx.animations(f[1])}
 for i,(im,box)in enumerate(gfx.cells(f,3,2,4)):
  name=f'ready-marker-{i}.png';im.save(dest/name);group['cells'].append({'src':'assets/field-popups/'+name,'origin':box[:2],'size':box[2:]})
 groups['readyMarkers']=group
 banks=ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files;b3=text.messages(banks[3])
 data={'source':'Pokemon Black Italian IRBI; overlay70 itemmenu.c and overlay21 shortcut_menu.c','images':images,'groups':groups,
 'bagQuantity':{'physicalScreen':'bottom','imagePosition':[128,96],'clip':[0,0,256,192],'textWindow':[136,104,88,16],'textFont':0,'initialQuantity':1,'minimum':1,'quantityFormat':b3[131],'messages':{str(i):b3[i]for i in(53,54,55)},'keys':{'UP':1,'DOWN':-1,'RIGHT':10,'LEFT':-10,'A':'confirm quantity then Yes/No','B':'cancel to Bag'},'boundary':'wrap >maximum to1; <1 to maximum','touch':{'increase':[234,92,22,24],'decrease':[234,116,22,24],'confirm':[128,96,104,48],'cancel':[224,168,24,24]},'touchRepeat':{'delayFrames':30,'accelerateAfterFrames':120,'acceleratedStep':10},'source':'70:021b7704,021b775c,021b7c90,021b7ce8..021b7e28,021bb0b8,021bb154,021b9b0c'},
 'ready':{'physicalScreen':'top','backgroundPosition':[0,0],'bg':1,'window':[8,96,240,96],'font':0,'capacity':25,'visibleRows':5,'itemTextX':21,'firstRowTextY':104,'rowStep':16,'normalPaletteBank':11,'highlightPaletteBank':12,'headerPaletteBank':10,'markerAnchorsX':[128,10,246],'markerInitialY':96,'labels':text.messages(banks[173]),'keys':{'UP':'previous row','DOWN':'next row','A':'use shortcut / place reordered entry','Y':'use shortcut','X':'cancel menu','B':'cancel / cancel reordering','SELECT':'toggle reordering when count>1'},'source':'21:021c4e60,021c5284,021c5420..021c55dc,021c5660,021c57b0; template021da96c; markerX021da940; ARM9:020202d0'},
 'palettes':{'readyBg':gfx.pal(f[0]),'readyHeader':gfx.pal(f[6]),'readyObjects':gfx.pal(f[4])},
 'limits':['Ready source NSCR preserves its original palette indices; native BG runtime transfers/remaps listed banks.','List reordering edge-scroll special destination0xff is not fully transcribed.','Bag quantity arrows reuse existing Bag sprite resources; their exact native object-group association remains unverified.']}
 font=ndspy.narc.NARC(rom.getFileByName('a/0/2/3')).files[0]
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
 chars=sorted(c for c in mapping if mapping[c]!=65535);metrics={};variants={};colors=gfx.pal(f[0])
 for state,slot in [('normal',0),('highlight',1)]:
  atlas=Image.new('RGBA',(384,((len(chars)+31)//32)*15))
  for i,ch in enumerate(chars):
   cell=font[glyph+8+mapping[ch]*48:glyph+8+(mapping[ch]+1)*48];left,_,advance=cell[:3];metrics[ch]=[i%32*12,i//32*15,left,advance]
   for y in range(15):
    for x in range(12):
     pos=y*12+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
     if ci in(1,2):atlas.putpixel((i%32*12+x,i//32*15+y),(*colors[slot*16+(1 if ci==1 else 2)],255))
  name='ready-font-'+state+'.png';atlas.save(dest/name);variants[state]={'src':'assets/field-popups/'+name,'paletteBank':11+slot,'foreground':1,'shadow':2,'background':15}
 data['fonts']={'height':15,'glyphs':metrics,'variants':variants,'source':'Native Font0 a/0/2/3 member0, all mapped glyphs; a/1/2/8 NCLR0 first two banks transferred to BG banks11/12; fg1 shadow2 bg15; proven by template bytes+0x17=0x18,+0x18=0x2f decoded at ARM9:0201ff18..0201ff66 and printer020204a4..020204c4'}
 data['ready']['appendCancelRow']=False
 data['ready']['cancelRowEvidence']='021c57bc reads count;021c57c4 allocates count;021c57d0..57ec inserts count shortcuts only;021c5848 passes unchanged count to ListMenu'
 (out/'field-popup-assets.js').write_text('window.FIELD_POPUP_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom');p.add_argument('--output',type=Path,default=Path('src'));a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)

