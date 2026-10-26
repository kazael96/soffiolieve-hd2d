"""Extract IRBI's two starter-selection scenes, camera curves and menu sprites.

apicula converts the original Nitro joint/texture animations to GLB. The BMA
alpha tracks are decoded separately, including the letter fade and ball light.
"""
from pathlib import Path
import argparse, hashlib, json, shutil, struct, subprocess, tempfile
import ndspy.rom, ndspy.narc, ndspy.lz10
from PIL import Image

SIZES = [[(8,8),(16,16),(32,32),(64,64)],[(16,8),(32,8),(32,16),(64,32)],[(8,16),(8,32),(16,32),(32,64)]]

def extract(rom, output, apicula):
    if rom.idCode != b'IRBI': raise ValueError('Expected Italian Pokémon Black IRBI')
    files = ndspy.narc.NARC(rom.getFileByName('a/2/0/5')).files
    files = [ndspy.lz10.decompress(b) if b[:1]==b'\x10' else b for b in files]
    assert len(files)==40
    overlay = rom.loadArm9Overlays([223])[223].data
    base = 0x021b94a0
    assert struct.unpack_from('<12I',overlay,0x021bc71c-base)==(205,29,0,205,30,0,205,31,0,205,32,0)
    assert struct.unpack_from('<15I',overlay,0x021bc784-base)==(205,34,0,205,35,0,205,37,0,205,38,0,205,39,0)
    dest=output/'assets/starter';dest.mkdir(parents=True,exist_ok=True)
    result={'source':'IRBI a/2/0/5, overlay223','hashes':{str(i):hashlib.sha256(b).hexdigest() for i,b in enumerate(files)},'models':{},'curves':{}}
    with tempfile.TemporaryDirectory() as tmp:
        tmp=Path(tmp)
        for name,indices in [('letter',[29,30,32]),('selection',[34,35]),('ball',[37,39])]:
            paths=[]
            for i in indices:
                path=tmp/f'{i}.bin';path.write_bytes(files[i]);paths.append(str(path))
            folder=tmp/name
            subprocess.run([str(apicula),'convert',*paths,'-o',str(folder),'-f','glb','--all-animations'],check=True)
            target=dest/name;target.mkdir(exist_ok=True)
            for path in folder.iterdir():shutil.copyfile(path,target/path.name)
            result['models'][name]=(target/next(folder.glob('*.glb')).name).relative_to(output).as_posix()
    for name,index in [('letter',33),('selection',36)]:
        raw=files[index];count,kind=struct.unpack_from('<II',raw)
        assert kind==0x10100 and len(raw)==8+count*24
        result['curves'][name]=[list(struct.unpack_from('<6f',raw,8+i*24)) for i in range(count)]
    result['cameraFrames']=[list(struct.unpack_from('<5H',overlay,0x021bc68c-base+i*10)) for i in range(3)]
    result['ballPositions']=[list(v/4096 for v in struct.unpack_from('<3i',overlay,0x021bc6cc-base+i*12)) for i in range(3)]
    result['pokeMoves']=[list(overlay[0x021bc6f0-base+i*14:0x021bc6f0-base+(i+1)*14]) for i in range(3)]
    result['materialAlpha']={}
    for name,index in [('letter',31),('ball',38)]:
        raw=files[index];assert raw[:4]==b'BMA0' and raw[0x44:0x48]==b'M\0AM'
        start=0x44;frames,=struct.unpack_from('<H',raw,start+4);dictionary=start+8
        count=raw[dictionary+1];entry=dictionary+struct.unpack_from('<H',raw,dictionary+6)[0]
        size,names=struct.unpack_from('<HH',raw,entry);assert size==20
        tracks={}
        for i in range(count):
            material=raw[entry+names+i*16:entry+names+(i+1)*16].split(b'\0')[0].decode('ascii')
            channels=struct.unpack_from('<5I',raw,entry+4+i*20)
            assert all(c&0x20000000 for c in channels[:4]), 'Unexpected animated material colour'
            alpha=channels[4];assert alpha>>16==frames, 'Unexpected alpha sampling mode'
            values=list(raw[start+(alpha&0xffff):start+(alpha&0xffff)+frames]);assert len(values)==frames and max(values)<=31
            tracks[material]=values
        result['materialAlpha'][name]=tracks
    # Native camera uses sin/cos of about20 degrees, giving a40 degree FOV.
    result['perspective']={'sin':1398/4096,'cos':3850/4096,'aspect':0x1555/4096,'near':1,'far':1024}
    def palette(index):
        b=files[index];return [tuple(((c>>s)&31)*255//31 for s in (0,5,10)) for c, in struct.iter_unpack('<H',b[40:40+struct.unpack_from('<I',b,32)[0]])]
    def cells(pal,char,cell):
        colors=palette(pal);b=files[char];raw=b[48:48+struct.unpack_from('<I',b,40)[0]]
        b=files[cell];count,kind,off,mapping=struct.unpack_from('<HHII',b,24);start=24+off;stride=16 if kind else 8;oambase=start+count*stride
        images=[]
        for i in range(count):
            n,flags,off=struct.unpack_from('<HHI',b,start+i*stride);image=Image.new('RGBA',(128,128))
            for j in reversed(range(n)):
                a0,a1,a2=struct.unpack_from('<HHH',b,oambase+off+j*6);assert not a0&0x300
                x,y=a1&511,a0&255;x=x if x<256 else x-512;y=y if y<128 else y-256
                w,h=SIZES[a0>>14][a1>>14];tile=(a2&1023)*(32<<mapping);p=(a2>>12)*16
                obj=Image.new('RGBA',(w,h));pixels=obj.load()
                for yy in range(h):
                    for xx in range(w):
                        pos=tile+((yy//8)*(w//8)+xx//8)*32+(yy%8)*4+(xx%8)//2;ci=(raw[pos]>>(4*(xx%2)))&15
                        pixels[xx,yy]=(*colors[p+ci],255 if ci else 0)
                if a1&4096:obj=obj.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
                if a1&8192:obj=obj.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
                image.alpha_composite(obj,(64+x,64+y))
            images.append(image)
        return images
    result['sprites']=[]
    for i in range(3):
        record={}
        for name,pal in [('normal',i*2),('dim',i*2+1)]:
            image=cells(pal,12+i,21+i)[0];path=dest/f'pokemon-{i}-{name}.png';image.save(path);record[name]=path.relative_to(output).as_posix()
        result['sprites'].append(record)
    for i,image in enumerate(cells(11,17,24)):image.save(dest/f'cursor-{i}.png')
    b=files[28];n,f,so,fo,eo=struct.unpack_from('<HHIII',b,24);assert n==1
    count,loop,kind,mode,off=struct.unpack_from('<HHIII',b,24+so);assert kind==0x10002 and mode==2
    frames=[]
    for i in range(count):
        elem,duration,pad=struct.unpack_from('<IHH',b,24+fo+off+i*8);cell,pad,x,y=struct.unpack_from('<HHhh',b,24+eo+elem);assert cell==0
        frames.append([x,y,duration])
    result['cursor']={'src':'assets/starter/cursor-0.png','positions':[list(overlay[0x021bc616-base+i*2:0x021bc618-base+i*2]) for i in range(3)],'frames':frames}
    # The lower-screen tile maps use the original four interchangeable palettes.
    result['backgrounds']=[]
    raw=files[16][48:];assert struct.unpack_from('<I',files[16],28)[0]==4
    for index in [9,8,10,7]:
        colors=palette(index);image=Image.new('RGBA',(256,192));pixels=image.load()
        for map_index in (19,20):
            entries=files[map_index][36:]
            for y in range(192):
                for x in range(256):
                    tile,=struct.unpack_from('<H',entries,((y//8)*32+x//8)*2);xx=x%8;yy=y%8
                    if tile&1024:xx=7-xx
                    if tile&2048:yy=7-yy
                    pos=(tile&1023)*64+yy*8+xx;ci=raw[pos]
                    if ci:pixels[x,y]=(*colors[ci],255)
        path=dest/f'background-{index}.png';image.save(path);result['backgrounds'].append(path.relative_to(output).as_posix())
    (output/'starter-assets.js').write_text('window.STARTER_ASSETS='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8',newline='\n')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);p.add_argument('--apicula',type=Path,required=True);args=p.parse_args()
    extract(ndspy.rom.NintendoDSRom.fromFile(args.rom),args.output,args.apicula)
