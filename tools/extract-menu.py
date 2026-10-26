"""Export verified IRBI X-menu tilemaps and cells, preserving original NCER origins.

The B2/W2 resource indices differ. This tool checks the Italian Black archive
directly; no executable or raw ROM resource is emitted.
"""
from pathlib import Path
import argparse,hashlib,importlib.util,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10
from PIL import Image
def pal(b):return [tuple(((c>>s)&31)*255//31 for s in(0,5,10))for c, in struct.iter_unpack('<H',b[40:40+struct.unpack_from('<I',b,32)[0]])]
SIZES=[[(8,8),(16,16),(32,32),(64,64)],[(16,8),(32,8),(32,16),(64,32)],[(8,16),(8,32),(16,32),(32,64)]]
def layer(f,char,screen,palette):
 b=f[char];raw=b[48:48+struct.unpack_from('<I',b,40)[0]];fmt=struct.unpack_from('<I',b,28)[0];c=pal(f[palette]);b=f[screen];w,h=struct.unpack_from('<HH',b,24);im=Image.new('RGBA',(w,h));pix=im.load()
 for y in range(h):
  for x in range(w):
   t,=struct.unpack_from('<H',b,36+((y//8)*(w//8)+x//8)*2);xx=7-x%8 if t&1024 else x%8;yy=7-y%8 if t&2048 else y%8
   if fmt==4:ci=raw[(t&1023)*64+yy*8+xx];idx=ci
   else:ci=(raw[(t&1023)*32+yy*4+xx//2]>>(4*(xx%2)))&15;idx=(t>>12)*16+ci
   if ci:pix[x,y]=(*c[idx],255)
 return im
def cells(f,char,cer,palette,palette_slot=None):
 b=f[char];raw=b[48:48+struct.unpack_from('<I',b,40)[0]];c=pal(f[palette]);b=f[cer];count,kind,off,mapping=struct.unpack_from('<HHII',b,24);start=24+off;stride=16 if kind else 8;oambase=start+count*stride;out=[]
 for i in range(count):
  n,flags,off=struct.unpack_from('<HHI',b,start+i*stride);im=Image.new('RGBA',(512,256))
  for j in reversed(range(n)):
   a0,a1,a2=struct.unpack_from('<HHH',b,oambase+off+j*6);x,y=a1&511,a0&255;x=x if x<256 else x-512;y=y if y<128 else y-256;w,h=SIZES[a0>>14][a1>>14];tile=(a2&1023)*(32<<mapping);p=((a2>>12)if palette_slot is None else palette_slot)*16;obj=Image.new('RGBA',(w,h));pix=obj.load()
   for yy in range(h):
    for xx in range(w):
     pos=tile+((yy//8)*(w//8)+xx//8)*32+(yy%8)*4+(xx%8)//2
     if pos>=len(raw):continue
     ci=(raw[pos]>>(4*(xx%2)))&15;pix[xx,yy]=(*c[p+ci],255 if ci else 0)
   if a1&4096:obj=obj.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
   if a1&8192:obj=obj.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
   im.alpha_composite(obj,(256+x,128+y))
  box=im.getbbox() or(256,128,257,129);out.append((im.crop(box),[box[0]-256,box[1]-128,box[2]-box[0],box[3]-box[1]]))
 return out

def animations(b):
 count,_,so,fo,eo=struct.unpack_from('<HHIII',b,24);out=[]
 for i in range(count):
  n,loop,kind,mode,off=struct.unpack_from('<HHIII',b,24+so+i*16);assert kind in(0x10000,0x10001,0x10002);frames=[]
  for j in range(n):
   elem,duration,_=struct.unpack_from('<IHH',b,24+fo+off+j*8);cell=struct.unpack_from('<H',b,24+eo+elem)[0];x,y=struct.unpack_from('<hh',b,24+eo+elem+4)if kind==0x10002 else(0,0)
   frame=[cell,duration,x,y]
   if kind==0x10001:
    angle,sx,sy,x,y=struct.unpack_from('<Hiihh',b,24+eo+elem+2);frame=[cell,duration,x,y,angle,sx,sy]
   frames.append(frame)
  out.append({'kind':kind,'mode':mode,'loop':loop,'frames':frames})
 return out
def extract(rom,output):
 assert rom.idCode==b'IRBI'
 def files(p):return [ndspy.lz10.decompress(b) if b[:1]==b'\x10' else b for b in ndspy.narc.NARC(rom.getFileByName(p)).files]
 f=files('a/0/7/1');assert len(f)==39 and f[0][:4]==b'RLCN' and f[14][:4]==b'RCSN'
 dest=output/'assets/menu';dest.mkdir(parents=True,exist_ok=True)
 images={};groups={}
 for label,screen in [('background',14),('cursorLayer',15),('buttons6',16),('buttons2',17),('buttons1',18)]:
  im=layer(f,2,screen,0);name=label+'.png';im.save(dest/name);images[label]={'src':'assets/menu/'+name,'size':list(im.size),'source':{'archive':'a/0/7/1','char':2,'screen':screen,'palette':0}}
 for label,char,cer,anr in [('cursor',3,19,29),('messages',4,20,30),('pokedex',5,21,31),('extra',6,22,32),('bag',7,23,33),('pokemon',8,24,34),('save',9,25,35),('trainer',10,26,36),('xtransceiverMale',11,27,37),('xtransceiverFemale',12,27,37),('selection',13,28,38)]:
  palette_slot={'pokemon':3,'trainer':6,'bag':10,'save':0,'pokedex':8}.get(label)
  group={'source':{'archive':'a/0/7/1','char':char,'cells':cer,'animation':anr,'palette':1,'paletteSlot':palette_slot},'cells':[],'animations':animations(f[anr])}
  for i,(im,box) in enumerate(cells(f,char,cer,1,palette_slot)):
   name=f'{label}-{i}.png';im.save(dest/name);group['cells'].append({'src':'assets/menu/'+name,'origin':box[:2],'size':box[2:]})
  groups[label]=group
 f=files('a/0/7/6');im=layer(f,12,18,6);im.save(dest/'party-panels.png');images['partyPanels']={'src':'assets/menu/party-panels.png','size':list(im.size),'source':{'archive':'a/0/7/6','char':12,'screen':18,'palette':6}}
 f=files('a/0/7/8')
 for label,char,screen in [('summary',8,63),('summaryStats',10,64),('summaryHeader',9,65)]:
  im=layer(f,char,screen,0);im.save(dest/(label+'.png'));images[label]={'src':'assets/menu/'+label+'.png','size':list(im.size),'source':{'archive':'a/0/7/8','char':char,'screen':screen,'palette':0}}
 f=files('a/0/0/7');icons={}
 # Five scoped species only. Palette variants are visually checked against
 # each species' native colours; the general palette selector is not ported.
 for sid,pi in [(495,1),(498,0),(501,0),(504,2),(506,2)]:
  patched=list(f);patched[0]=bytearray(f[0]);patched[0][40:72]=f[0][40+pi*32:72+pi*32];group={'source':{'archive':'a/0/0/7','char':sid*2+7,'cells':2,'palette':0,'paletteSlot':pi},'cells':[],'animations':animations(f[1])}
  for i,(im,box) in enumerate(cells(patched,sid*2+7,2,0)):
   name=f'pokemon-{sid}-{i}.png';im.save(dest/name);group['cells'].append({'src':'assets/menu/'+name,'origin':box[:2],'size':box[2:]})
  icons[str(sid)]=group
 f=files('a/0/8/8')
 for label,char,screen,palette in [('bagFemale',0,2,1),('bagMale',3,5,4),('bagDecoration',6,7,8)]:
  im=layer(f,char,screen,palette);im.save(dest/(label+'.png'));images[label]={'src':'assets/menu/'+label+'.png','size':list(im.size),'source':{'archive':'a/0/8/8','char':char,'screen':screen,'palette':palette}}
 for label,char,cer,anr,palette in [('bagFemale',11,10,9,12),('bagMale',15,14,13,16),('bagButton',20,19,18,21),('bagCursor',27,26,25,28),('bagPockets',31,30,29,32),('bagTms',38,37,36,39)]:
  group={'source':{'archive':'a/0/8/8','char':char,'cells':cer,'animation':anr,'palette':palette},'cells':[],'animations':animations(f[anr])}
  for i,(im,box) in enumerate(cells(f,char,cer,palette)):
   name=f'{label}-{i}.png';im.save(dest/name);group['cells'].append({'src':'assets/menu/'+name,'origin':box[:2],'size':box[2:]})
  groups[label]=group
 spec=importlib.util.spec_from_file_location('events',Path(__file__).with_name('extract-original-events.py'));events=importlib.util.module_from_spec(spec);spec.loader.exec_module(events)
 banks=ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files
 texts={str(i):events.messages(banks[i])for i in [3,29,34,36,55,157,158,168,187]}
 itemDescriptions={str(i):events.messages(banks[53])[i]for i in [4,17,442,621,626]}
 data={'source':'IRBI a/0/7/1, a/0/7/6, a/0/7/8, a/0/8/8, a/0/0/7; Italian text a/0/0/2 banks3,29,34,53,55,157,158,168,187','images':images,'groups':groups,'pokemonIcons':icons,'texts':texts,'itemDescriptions':itemDescriptions,'revision':hashlib.sha256(b''.join(p.read_bytes()for p in sorted(dest.glob('*.png')))).hexdigest()[:12]}
 (output/'menu-assets.js').write_text('window.MENU_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)
