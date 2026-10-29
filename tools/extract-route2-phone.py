"""Extract the opening Interpoké call, portraits and cells from the supplied IRBI ROM."""
from pathlib import Path
import argparse,json,struct
from PIL import Image
import ndspy.rom,ndspy.narc,ndspy.lz10
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);args=p.parse_args()
rom=ndspy.rom.NintendoDSRom.fromFile(args.rom)
if rom.idCode!=b'IRBI':raise ValueError('Expected IRBI')
files=ndspy.narc.NARC(rom.getFileByName('a/1/3/1')).files
files=[ndspy.lz10.decompress(b) if b[:1]==b'\x10' else b for b in files]
sizes=[[(8,8),(16,16),(32,32),(64,64)],[(16,8),(32,8),(32,16),(64,32)],[(8,16),(8,32),(16,32),(32,64)]]
def render(i,pal):
 b=files[i];h,w,fmt=struct.unpack_from('<HHI',b,24);size,off=struct.unpack_from('<II',b,40);raw=b[24+off:24+off+size];w*=8;h*=8
 if w>4096:w,h=128,192
 colors=files[pal];colors=[tuple(((c>>s)&31)*255//31 for s in [0,5,10]) for c, in struct.iter_unpack('<H',colors[40:40+struct.unpack_from('<I',colors,32)[0]])]
 pixels=bytearray(w*h)
 for y in range(h):
  for x in range(w):pixels[y*w+x]=raw[((y//8)*(w//8)+x//8)*64+(y%8)*8+x%8]
 im=Image.new('RGBA',(w,h));im.putdata([(*colors[p],0 if p==0 else 255) for p in pixels]);return im
def cells(pal,char,cell):
 pb=files[pal];cols=[tuple(((c>>s)&31)*255//31 for s in [0,5,10]) for c, in struct.iter_unpack('<H',pb[40:40+struct.unpack_from('<I',pb,32)[0]])]
 b=files[char];raw=b[48:48+struct.unpack_from('<I',b,40)[0]];b=files[cell];num,kind,offset,mapping=struct.unpack_from('<HHII',b,24);start=24+offset;size=16 if kind else 8;oambase=start+num*size;imgs=[]
 for i in range(num):
  count,flags,off=struct.unpack_from('<HHI',b,start+i*size);im=Image.new('RGBA',(96,96))
  for j in reversed(range(count)):
   a0,a1,a2=struct.unpack_from('<HHH',b,oambase+off+j*6);x=(a1&511);x=x if x<256 else x-512;y=a0&255;y=y if y<128 else y-256;w,h=sizes[a0>>14][a1>>14];tile=(a2&1023)*(32<<mapping);palette=(a2>>12)*16
   obj=Image.new('RGBA',(w,h));px=obj.load()
   for yy in range(h):
    for xx in range(w):
     pixel_offset=tile+((yy//8)*(w//8)+xx//8)*32+(yy%8)*4+(xx%8)//2
     if pixel_offset>=len(raw):raise Exception((char,pixel_offset,len(raw)))
     ci=(raw[pixel_offset]>>(4*(xx%2)))&15;px[xx,yy]=(*cols[palette+ci],255 if ci else 0)
   if a1&4096:obj=obj.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
   if a1&8192:obj=obj.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
   im.alpha_composite(obj,(48+x,48+y))
  imgs.append(im)
 return imgs

dest=args.output/'assets/phone';dest.mkdir(parents=True,exist_ok=True)
catalog={}
# Face-cell resources and full portraits have distinct ordering in the archive.
for name,portrait,cell_index in [('Mamma',5,4)]:
 base=render(24+portrait*2,18+portrait);parts=cells(39+cell_index*4,40+cell_index*4,41+cell_index*4);paths=[]
 for blink in range(3):
  for mouth in range(3):
   image=base.copy();image.alpha_composite(parts[blink],(16,56))
   if len(parts)>3:image.alpha_composite(parts[min(3+mouth,len(parts)-1)],(16,56))
   file=dest/f'{name}-{blink}-{mouth}.png';image.save(file);paths.append(file.relative_to(args.output).as_posix())
 catalog[name]=paths
background=render(6,0);background.save(dest/'route.png')
call=files[64]
result={'portraits':catalog,'background':'assets/phone/route.png','participants':list(call[:4]),'commands':list(struct.iter_unpack('<BBH',call[8:])),'source':'IRBI a/1/3/1:64'}
(args.output/'route2-phone.js').write_text('window.ROUTE2_PHONE='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8',newline='\n')

