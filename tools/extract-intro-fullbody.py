"""Decode the original Black new-game actors, including Juniper's native layers."""
import argparse, hashlib, json, math, struct
from pathlib import Path
from PIL import Image
from irbi_reader import NARC

SIZES = [[(8,8),(16,16),(32,32),(64,64)],[(16,8),(32,8),(32,16),(64,32)],[(8,16),(8,32),(16,32),(32,64)]]

def lz11(raw):
    assert raw[0] == 17
    size=int.from_bytes(raw[1:4],'little');at=4;out=bytearray()
    assert 0 < size <= 8*1024*1024
    while len(out)<size:
        flags=raw[at];at+=1
        for bit in range(7,-1,-1):
            if len(out)>=size:break
            if not flags>>bit&1:out.append(raw[at]);at+=1;continue
            a=raw[at];at+=1;n=a>>4
            if n==0:
                b,c=raw[at:at+2];at+=2;length=((a&15)<<4|b>>4)+17;distance=((b&15)<<8|c)+1
            elif n==1:
                b,c,d=raw[at:at+3];at+=3;length=((a&15)<<12|b<<4|c>>4)+273;distance=((c&15)<<8|d)+1
            else:b=raw[at];at+=1;length=n+1;distance=((a&15)<<8|b)+1
            assert 0<distance<=len(out)
            for _ in range(min(length,size-len(out))):out.append(out[-distance])
    return bytes(out)

def cells(files,char,pal,cell):
    raw=files[char];assert raw[:4]==b'RGCN'
    h,w,fmt=struct.unpack_from('<HHI',raw,24);assert fmt==3
    linear=bool(struct.unpack_from('<I',raw,36)[0]&1)
    size,offset=struct.unpack_from('<II',raw,40);pixels=raw[24+offset:24+offset+size];assert len(pixels)==size
    p=files[pal];colors=[tuple(((v>>s)&31)*255//31 for s in (0,5,10)) for v, in struct.iter_unpack('<H',p[40:40+struct.unpack_from('<I',p,32)[0]])]
    b=files[cell];assert b[:4]==b'RECN'
    count,kind,offset,mapping=struct.unpack_from('<HHII',b,24);start=24+offset;stride=16 if kind else 8;oam=start+count*stride;result=[]
    for index in range(count):
        n,flags,offset=struct.unpack_from('<HHI',b,start+index*stride);image=Image.new('RGBA',(192,192))
        for a0,a1,a2 in list(struct.iter_unpack('<HHH',b[oam+offset:oam+offset+n*6]))[::-1]:
            x=a1&511;x=x if x<256 else x-512;y=a0&255;y=y if y<128 else y-256
            width,height=SIZES[a0>>14][a1>>14];tile=a2&1023;bank=(a2>>12)*16;obj=Image.new('RGBA',(width,height));dst=obj.load()
            for yy in range(height):
                for xx in range(width):
                    if linear:
                        assert mapping==4 and w==32
                        pixel=((tile//32)*8+yy)*(w*8)+(tile%32)*8+xx
                        byte=pixels[pixel//2];ci=byte>>(4*(pixel%2))&15
                    else:
                        address=tile*(32<<mapping)+((yy//8)*(width//8)+xx//8)*32+(yy%8)*4+xx%8//2
                        byte=pixels[address];ci=byte>>(4*(xx%2))&15
                    dst[xx,yy]=(*colors[bank+ci],255 if ci else 0)
            if a1&4096:obj=obj.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            if a1&8192:obj=obj.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
            image.alpha_composite(obj,(96+x,96+y))
        result.append(image)
    return result

def native_nodes(files):
    b=files[30];n,nf,so,fo,co=struct.unpack_from('<HHIII',b,24);poses=[]
    for index in range(n):
        count,loop,kind,mode,offset=struct.unpack_from('<HHIII',b,24+so+index*16)
        data,duration,pad=struct.unpack_from('<IHH',b,24+fo+offset);start=24+co+data;cell=struct.unpack_from('<H',b,start)[0]
        node={'cell':cell,'x':0,'y':0,'angle':0,'scaleX':1,'scaleY':1}
        if kind&65535==1:
            _,angle,sx,sy,x,y=struct.unpack_from('<HHii hh',b,start);node.update(angle=angle/65536*2*math.pi,scaleX=sx/4096,scaleY=sy/4096,x=x,y=y)
        elif kind&65535==2:node['x'],node['y']=struct.unpack_from('<hh',b,start+4)
        else:assert kind&65535==0
        poses.append(node)
    b=files[36];count,pad,so,ho=struct.unpack_from('<HHII',b,24);n,animations,offset=struct.unpack_from('<HHI',b,24+so+2*8);result=[]
    for index in range(n):
        sequence,x,y,attr=struct.unpack_from('<HhhH',b,24+ho+offset+index*8);node=dict(poses[sequence]);node.update(x=x+node['x'],y=y+node['y'],sequence=sequence,priority=attr>>8,index=index);result.append(node)
    return result

def compose(parts,nodes,arm_only=None,indices=None):
    result=Image.new('RGBA',(192,192));arm_nodes={0,1,2,4}
    for node in nodes[::-1]:
        if indices is not None and node['index'] not in indices:continue
        arm=node['index'] in arm_nodes
        if arm_only is not None and arm!=arm_only:continue
        c=math.cos(node['angle']);s=math.sin(node['angle']);sx=node['scaleX'];sy=node['scaleY'];a,b=c/sx,s/sx;d,e=-s/sy,c/sy
        x=96+node['x'];y=96+node['y'];matrix=(a,b,96-a*x-b*y,d,e,96-d*x-e*y)
        transformed=parts[node['cell']].transform((192,192),Image.Transform.AFFINE,matrix,resample=Image.Resampling.NEAREST)
        result.alpha_composite(transformed)
    return result

def extract(archive,output,report):
    data=archive.read_bytes();files=list(NARC(data).files);files[30]=lz11(files[30]);files[31]=lz11(files[31]);dest=output/'assets/intro-fullbody';dest.mkdir(parents=True,exist_ok=True);records=[]
    def save(name,image,source):
        box=image.getbbox();assert box and all(0<v<192 for v in box),'Native actor is clipped'
        path=dest/(name+'.png');image.save(path);digest=hashlib.sha256(path.read_bytes()).hexdigest();record={'src':path.relative_to(output).as_posix(),'sha256':digest,'size':list(image.size),'bounds':list(box),'source':source};records.append(record);return record
    actors={}
    for name,char,pal,cell in [('Alcide',6,7,5),('Anita',10,11,9),('Komor',17,18,16),('Belle',21,22,20)]:
        actors[name]=save(name,cells(files,char,pal,cell)[0],{'archive':'a/1/7/0','char':char,'palette':pal,'cellBank':cell,'cell':0})
    parts=cells(files,31,34,33);nodes=native_nodes(files);base={'archive':'a/1/7/0','char':31,'palette':34,'cellBank':33,'animationBank':30,'multiCellBank':36,'multiCell':2,'frame':0}
    actors['aralia']=save('Aralia',compose(parts,nodes),base)
    actors['araliaBody']=save('Aralia-body',compose(parts,nodes,False),base)
    actors['araliaArm']=save('Aralia-arm',compose(parts,nodes,True),base)
    actors['araliaUpper']=save('Aralia-upper',compose(parts,nodes,indices={4}),base)
    actors['araliaForearm']=save('Aralia-forearm',compose(parts,nodes,indices={2}),base)
    actors['araliaHand']=save('Aralia-hand',compose(parts,nodes,indices={0,1}),base)
    # Native cells split hair/legs from face/chest, rather than at anatomical joints.
    # Join the unmodified native pixels first, then separate at the neck row.
    anatomical=compose(parts,nodes,indices={3,5,6,7})
    head=anatomical.copy();head.paste((0,0,0,0),(0,64,192,192))
    torso=anatomical.copy();torso.paste((0,0,0,0),(0,0,192,64))
    actors['araliaHead']=save('Aralia-head',head,{**base,'nativeYBand':[0,64]})
    actors['araliaTorso']=save('Aralia-torso',torso,{**base,'nativeYBand':[64,192]})
    actors['araliaCoatLeft']=save('Aralia-coat-left',compose(parts,nodes,indices={8}),base)
    actors['araliaCoatRight']=save('Aralia-coat-right',compose(parts,nodes,indices={9}),base)
    check=compose(parts,nodes,indices={8,9});check.alpha_composite(torso);check.alpha_composite(head)
    assert check.tobytes()==compose(parts,nodes,False).tobytes(),'Anatomical split changed the native body pixels'
    catalog={'source':'Native Pokemon Black new-game graphics, existing workspace NitroFS archive','archive':'a/1/7/0','archiveSHA256':hashlib.sha256(data).hexdigest(),'actors':actors,'rig':{'origin':[96,96],'shoulder':[89,67],'elbow':[83,76],'hand':[75,69],'feet':[96,158]},'nodes':nodes}
    (output/'intro-fullbody-assets.js').write_bytes(('window.INTRO_FULLBODY_ASSETS='+json.dumps(catalog,separators=(',',':'))+';\n').encode('utf8'))
    report.parent.mkdir(parents=True,exist_ok=True);report.write_bytes(json.dumps({'archiveFile':str(archive.resolve()),'catalog':catalog,'images':records,'reference':'https://ds-pokemon-hacking.github.io/docs/generation-v/resources/sprite_locations/bw-sprite_locations/'},indent=2).encode('utf8'))
    print(json.dumps({'actors':list(actors),'archiveSHA256':catalog['archiveSHA256']}))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('archive',type=Path);p.add_argument('output',type=Path);p.add_argument('report',type=Path);a=p.parse_args();extract(a.archive,a.output,a.report)
