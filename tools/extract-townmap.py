"""Extract IRBI's original town map, descriptions, markers and regional positions."""
from pathlib import Path
import argparse,hashlib,importlib.util,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10
from PIL import Image
SIZES=[[(8,8),(16,16),(32,32),(64,64)],[(16,8),(32,8),(32,16),(64,32)],[(8,16),(8,32),(16,32),(32,64)]]
def extract(rom,output):
    assert rom.idCode==b'IRBI'
    def narc(path):return [ndspy.lz10.decompress(b) if b[:1]==b'\x10' else b for b in ndspy.narc.NARC(rom.getFileByName(path)).files]
    files=narc('a/0/8/5');data=narc('a/0/8/6')[0];assert len(files)==21 and len(data)==61*54
    ov=bytes(rom.loadArm9Overlays([72])[72].data);assert ov[0x21bba3c-0x21b94a0:0x21bba40-0x21b94a0]==bytes.fromhex('36234b43')
    dest=output/'assets/townmap';dest.mkdir(parents=True,exist_ok=True)
    def palette(index):
        b=files[index];return [tuple(((c>>s)&31)*255//31 for s in(0,5,10))for c, in struct.iter_unpack('<H',b[40:40+struct.unpack_from('<I',b,32)[0]])]
    def layer(char,screen,pal):
        b=files[char];raw=b[48:48+struct.unpack_from('<I',b,40)[0]];fmt=struct.unpack_from('<I',b,28)[0];colors=palette(pal);b=files[screen];im=Image.new('RGBA',(256,192));pix=im.load()
        for y in range(192):
            for x in range(256):
                t,=struct.unpack_from('<H',b,36+((y//8)*32+x//8)*2);xx=7-x%8 if t&1024 else x%8;yy=7-y%8 if t&2048 else y%8
                if fmt==4:ci=raw[(t&1023)*64+yy*8+xx];index=(t>>12)*256+ci
                else:ci=(raw[(t&1023)*32+yy*4+xx//2]>>(4*(xx%2)))&15;index=(t>>12)*16+ci
                if ci:pix[x,y]=(*colors[index],255)
        return im
    bg=layer(7,16,0);bg.alpha_composite(layer(5,17,0));bg.save(dest/'map.png');layer(6,15,1).save(dest/'info.png')
    colors=palette(2);b=files[8];raw=b[48:48+struct.unpack_from('<I',b,40)[0]];b=files[12];count,kind,off,mapping=struct.unpack_from('<HHII',b,24);start=24+off;stride=16 if kind else 8;oambase=start+count*stride;cells=[]
    for i in range(count):
        n,flags,off=struct.unpack_from('<HHI',b,start+i*stride);im=Image.new('RGBA',(512,256))
        for j in reversed(range(n)):
            a0,a1,a2=struct.unpack_from('<HHH',b,oambase+off+j*6);assert not a0&0x300
            x,y=a1&511,a0&255;x=x if x<256 else x-512;y=y if y<128 else y-256;w,h=SIZES[a0>>14][a1>>14];tile=(a2&1023)*(32<<mapping);p=(a2>>12)*16
            obj=Image.new('RGBA',(w,h));pix=obj.load()
            for yy in range(h):
                for xx in range(w):
                    pos=tile+((yy//8)*(w//8)+xx//8)*32+(yy%8)*4+(xx%8)//2;ci=(raw[pos]>>(4*(xx%2)))&15
                    pix[xx,yy]=(*colors[p+ci],255 if ci else 0)
            if a1&4096:obj=obj.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            if a1&8192:obj=obj.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
            im.alpha_composite(obj,(256+x,128+y))
        box=im.getbbox() or(256,128,257,129);im.crop(box).save(dest/f'cell-{i}.png');cells.append([box[0]-256,box[1]-128,box[2]-box[0],box[3]-box[1]])
    b=files[19];count,_,so,fo,eo=struct.unpack_from('<HHIII',b,24);animations=[]
    for i in range(count):
        n,loop,kind,mode,off=struct.unpack_from('<HHIII',b,24+so+i*16);assert kind in(0x10000,0x10002);frames=[]
        for j in range(n):
            elem,duration,_=struct.unpack_from('<IHH',b,24+fo+off+j*8);cell=struct.unpack_from('<H',b,24+eo+elem)[0];x,y=struct.unpack_from('<hh',b,24+eo+elem+4)if kind==0x10002 else(0,0);frames.append([cell,duration,x,y])
        animations.append({'mode':mode,'loop':loop,'frames':frames})
    spec=importlib.util.spec_from_file_location('events',Path(__file__).with_name('extract-original-events.py'));events=importlib.util.module_from_spec(spec);spec.loader.exec_module(events)
    banks=narc('a/0/0/2');names=events.messages(banks[89]);texts=events.messages(banks[185]);headers=narc('a/0/1/2')[0];places=[]
    for row in struct.iter_unpack('<27H',data):
        zone=row[0];name_id=struct.unpack_from('<H',headers,zone*48+26)[0]&1023
        places.append({'zone':zone,'name':names[name_id],'params':row,'description':texts[row[17]]if row[17]!=65535 else'','landmarks':[texts[i]for i in row[18:24]if i!=65535]})
    result={'source':'IRBI overlay72, a/0/8/5:0..20, a/0/8/6:0, text89/185','hash':hashlib.sha256(ov).hexdigest(),'places':places,'cells':cells,'animations':animations,'revision':hashlib.sha256(b''.join(p.read_bytes()for p in sorted(dest.glob('*.png')))).hexdigest()[:12]}
    (output/'townmap-assets.js').write_text('window.TOWNMAP_ASSETS='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)
