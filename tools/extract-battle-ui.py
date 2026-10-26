"""Extract verified IRBI battle UI resources, without guessing final screen placement.

The archive also contains models. Export only identified 2D resources; no ROM,
overlay, or raw Nitro files are copied to the destination.
"""
from pathlib import Path
import argparse,hashlib,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10
from PIL import Image

SIZES=[[(8,8),(16,16),(32,32),(64,64)],[(16,8),(32,8),(32,16),(64,32)],[(8,16),(8,32),(16,32),(32,64)]]

def extract(rom,output):
 assert rom.idCode==b'IRBI','Italian Pokemon Black (IRBI) required'
 archive=rom.getFileByName('a/0/1/1');files=ndspy.narc.NARC(archive).files
 files=[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in files]
 assert len(files)==222 and files[165][:4]==b'RGCN' and files[166][:4]==b'RECN'
 dest=output/'assets/battle-ui';dest.mkdir(parents=True,exist_ok=True)
 def palette(i):
  b=files[i];assert b[:4]==b'RLCN'
  return[tuple(((v>>s)&31)*255//31 for s in(0,5,10))for v, in struct.iter_unpack('<H',b[40:40+struct.unpack_from('<I',b,32)[0]])]
 def pixels(i):
  b=files[i];assert b[:4]==b'RGCN'
  return b[48:48+struct.unpack_from('<I',b,40)[0]]
 def cells(c,p,n):
  raw=pixels(c);cols=palette(p);b=files[n];assert b[:4]==b'RECN'
  count,kind,off,mapping=struct.unpack_from('<HHII',b,24);start=24+off;stride=16 if kind else 8;base=start+count*stride;result=[]
  for i in range(count):
   if c==115 and i>7:continue # later cells need affine/matrix interpretation
   num,flags,offset=struct.unpack_from('<HHI',b,start+i*stride);im=Image.new('RGBA',(512,256))
   for j in reversed(range(num)):
    a0,a1,a2=struct.unpack_from('<HHH',b,base+offset+j*6);assert not a0&0x300,(c,i,j,hex(a0))
    x,y=a1&511,a0&255;x=x if x<256 else x-512;y=y if y<128 else y-256
    w,h=SIZES[a0>>14][a1>>14];tile=(a2&1023)*(32<<mapping);pal=(a2>>12)*16;obj=Image.new('RGBA',(w,h));pix=obj.load()
    for yy in range(h):
     for xx in range(w):
      pos=tile+((yy//8)*(w//8)+xx//8)*32+(yy%8)*4+(xx%8)//2;ci=(raw[pos]>>(4*(xx%2)))&15;pix[xx,yy]=(*cols[pal+ci],255 if ci else 0)
    if a1&4096:obj=obj.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    if a1&8192:obj=obj.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    im.alpha_composite(obj,(256+x,128+y))
   box=im.getbbox()or(256,128,257,129);image=im.crop(box);name=f'cell-{c}-{n}-{i}.png';image.save(dest/name)
   result.append({'path':'assets/battle-ui/'+name,'cell':i,'bounds':[box[0]-256,box[1]-128,image.width,image.height]})
  return {'char':c,'palette':p,'cellmap':n,'cells':result}
 groups={}
 # These are native image/cell groupings, not invented semantic screen layouts.
 for c,p,n in[(115,116,117),(189,190,191),(165,162,166),(168,162,169),(171,162,172),(174,162,175),(177,162,178),(183,162,184),(186,162,187)]:groups[str(c)]=cells(c,p,n)
 # 114 is a 512x512 NSCR image: decoded as a source image, not a DS screenshot.
 raw=pixels(113);cols=palette(92);b=files[114];w,h=struct.unpack_from('<HH',b,24);assert(w,h)==(512,512)
 im=Image.new('RGBA',(w,h));pix=im.load()
 for y in range(h):
  for x in range(w):
   t,=struct.unpack_from('<H',b,36+((y//8)*(w//8)+x//8)*2);xx=7-x%8 if t&1024 else x%8;yy=7-y%8 if t&2048 else y%8;ci=raw[(t&1023)*64+yy*8+xx];pix[x,y]=(*cols[ci],255 if ci else 0)
 im.save(dest/'touchscreen-sphere-source.png')
 # Text BG map uses DS 32x32 screen-block ordering, unlike affine sphere source.
 # Preserve complete maps and first256x192 view; scroll/copy selection is not certified.
 layers=[]
 for screen in range(104,113):
  b=files[screen];w,h=struct.unpack_from('<HH',b,24);raw=pixels(91);cols=palette(92);im=Image.new('RGBA',(w,h));pix=im.load()
  for y in range(h):
   for x in range(w):
    tx,ty=x//8,y//8;idx=((ty//32)*(w//256)+tx//32)*1024+(ty%32)*32+tx%32
    t,=struct.unpack_from('<H',b,36+idx*2);xx=7-x%8 if t&1024 else x%8;yy=7-y%8 if t&2048 else y%8;ci=(raw[(t&1023)*32+yy*4+xx//2]>>(4*(xx%2)))&15
    if ci:pix[x,y]=(*cols[(t>>12)*16+ci],255)
  im.save(dest/f'command-source-{screen}.png');im.crop((0,0,256,192)).save(dest/f'command-view-{screen}.png')
  layers.append({'char':91,'screen':screen,'palette':92,'source':f'assets/battle-ui/command-source-{screen}.png','view':f'assets/battle-ui/command-view-{screen}.png','crop':[0,0,256,192],'sourceSize':[w,h]})
 result={'source':'IRBI a/0/1/1','archiveSHA256':hashlib.sha256(archive).hexdigest(),'groups':groups,'sphere':{'path':'assets/battle-ui/touchscreen-sphere-source.png','char':113,'screen':114,'palette':92,'size':[512,512]},'placementVerified':False,'notes':'Cell bounds are native signed OAM origins relative to the cell; not absolute DS screen positions. Source sphere is not a final 256x192 composite.'}
 result['commandLayers']=layers
 fonts=ndspy.narc.NARC(rom.getFileByName('a/0/2/3')).files;font_groups={}
 pal=fonts[5];cols=[tuple(((v>>s)&31)*255//31 for s in(0,5,10))for v, in struct.iter_unpack('<H',pal[40:40+struct.unpack_from('<I',pal,32)[0]])]
 for index in(1,3,4):
  b=fonts[index];assert b[:4]==b'RTFN';glyph,widths,off=struct.unpack_from('<3I',b,32);cw,ch,sz=struct.unpack_from('<BBH',b,glyph);mapping={}
  while off and off+12<len(b):
   first,last,kind,_,nxt=struct.unpack_from('<4HI',b,off);data=off+12
   if kind==0:
    start=struct.unpack_from('<H',b,data)[0];mapping.update({chr(c):start+c-first for c in range(first,last+1)})
   elif kind==1:mapping.update({chr(c):struct.unpack_from('<H',b,data+(c-first)*2)[0]for c in range(first,last+1)})
   elif kind==2:
    n=struct.unpack_from('<H',b,data)[0];mapping.update({chr(c):g for c,g in struct.iter_unpack('<HH',b[data+2:data+2+n*4])})
   else:raise ValueError(kind)
   off=nxt
  chars=sorted(c for c,g in mapping.items()if g!=65535 and(ord(c)<384 or c in '♂♀…éÉ'))
  rows=(len(chars)+15)//16;im=Image.new('RGBA',(16*cw,rows*ch*2));metrics={}
  for k,c in enumerate(chars):
   cell=b[glyph+8+mapping[c]*sz:glyph+8+(mapping[c]+1)*sz];left,width,advance=cell[:3];metrics[c]=[k%16*cw,k//16*ch,left,advance]
   for variant,ink in enumerate((1,15)):
    for y in range(ch):
     for x in range(cw):
      pos=y*cw+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
      if ci in(1,2):im.putpixel((k%16*cw+x,k//16*ch+y+variant*rows*ch),(*cols[ink if ci==1 else 2],255))
  im.save(dest/f'font-{index}.png');font_groups[str(index)]={'source':f'IRBI a/0/2/3:{index}, palette5','path':f'assets/battle-ui/font-{index}.png','cellWidth':cw,'height':ch,'cellBytes':sz,'variantOffset':rows*ch,'glyphs':metrics,'battleRoleVerified':False}
 result['fonts']=font_groups
 (dest/'provenance.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 return result

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();r=extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output);print(json.dumps({'groups':len(r['groups']),'archiveSHA256':r['archiveSHA256']}))

