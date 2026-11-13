"""Export IRBI's first-ending staff roll, Italian END card and native dragon.

Ownership is overlay10's mode0 task -> overlay181, then movie7, save205,
END182. This exporter does not register the postgame Hall of Fame (overlay180).
"""
from pathlib import Path
import argparse,hashlib,importlib.util,json,shutil,struct,subprocess
from PIL import Image


def module(name,file):
    spec=importlib.util.spec_from_file_location(name,Path(__file__).with_name(file))
    value=importlib.util.module_from_spec(spec);spec.loader.exec_module(value);return value


patterns=module('credit_patterns','finale-field-patterns.py')
from irbi_reader import NintendoDSRom,NARC,lz10,code_decompress


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--rom',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--work',type=Path,required=True)
    p.add_argument('--apicula',type=Path,required=True)
    a=p.parse_args();r=NintendoDSRom.fromFile(a.rom)
    if r.idCode!=b'IRBI':raise ValueError('Italian Black IRBI required')
    o=r.loadArm9Overlays([181])[181];sha=hashlib.sha256(o.data).hexdigest()
    if sha!='e31de43bd6b05ca75db6fba462349a02ca5fe8c8ec882d32aa11895a5a3c5ab4':raise ValueError('Staff roll owner changed')
    arm=code_decompress(r.arm9)
    ptr=struct.unpack_from('<I',arm,0x20a6b58-r.arm9RamAddress+220*4)[0]
    archive=arm[ptr-r.arm9RamAddress:].split(b'\0')[0].decode()
    if archive!='a/2/2/0':raise ValueError('Staff roll archive changed')
    raw=NARC(r.getFileByName(archive)).files
    files=[lz10(b) if b[:1]==b'\x10' else b for b in raw]
    if len(files)!=13 or len(files[1])!=437*16:raise ValueError('Staff roll table changed')
    evt=module('credits_messages','extract-original-events.py');gfx=module('credits_graphics','extract-menu.py')
    messages=NARC(r.getFileByName('a/0/0/2')).files
    texts=evt.messages(messages[177]);save=evt.messages(messages[36])
    def words(addr,count):return list(struct.unpack_from('<'+'I'*count,o.data,addr-o.ramAddress))
    if words(0x21baa84,9)!=[220,6,0,220,7,0,220,8,0]:raise ValueError('Native Black model resources changed')
    rows=[]
    for at in range(0,len(files[1]),16):
        b=files[1][at:at+16];text,y,kind,arg,color,font,align,x,offset=struct.unpack('<IHBBBBHhh',b)
        if kind==0 and text!=65535 and text>=len(texts):raise ValueError('Staff name outside native bank')
        rows.append({'text':text,'y':y,'kind':kind,'arg':arg,'color':color,'font':font,'align':align,'x':x,'offset':offset})
    # Last two records follow the terminating kind5 in the ROM. Preserve them
    # as data, but the interpreter must stop at5 rather than invent extra names.
    colors=list(struct.unpack_from('<8H',o.data,0x21baa40-o.ramAddress))
    cameras=[list(struct.unpack_from('<6i',o.data,0x21babe4-o.ramAddress+i*24)) for i in range(7)]
    data={'source':{'overlay':181,'overlaySHA256':sha,'archive':archive,'tableMember':1,'tableSHA256':hashlib.sha256(raw[1]).hexdigest(),'messageBank':177,'messageSHA256':hashlib.sha256(messages[177]).hexdigest(),'modelMembers':[6,7,8]},'rows':rows,'texts':texts,'saveMessages':save,'nativeColorWords':colors,'cameraQ12':cameras,'fonts':{},'images':{},'model':{},'music':1016,'limits':['Export only; native task timing, browser rendering, save failures and three viewport formats require separate verification.']}
    sine,cosine=struct.unpack_from('<2h',arm,0x20a1db0-r.arm9RamAddress+12)
    data['perspective']={'sin':sine/4096,'cos':cosine/4096,'near':1,'far':1024,'nativeAspectQ12':0x1555}
    data['intro']={'leadFrames':42,'holdFrames':166,'fadeStep':2,'maxScale':8,'center':[128,96],'source':'overlay181:021b964c/021ba73c; ARM9:02051df4 uses reciprocal affine scale'}
    dest=a.output/'assets/finale/credits';dest.mkdir(parents=True,exist_ok=True)
    def image(name,im):
        f=dest/(name+'.png');im.save(f);data['images'][name]={'src':f.relative_to(a.output).as_posix(),'size':list(im.size),'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
    image('end-it',gfx.layer(files,3,5,2))
    title=[lz10(b) if b[:1]==b'\x10' else b for b in NARC(r.getFileByName('a/0/2/6')).files]
    image('title',gfx.layer(title,0,1,2));image('copyright',gfx.layer(title,9,10,11))
    # 181:021b9934..021b995e loads member12 into palette bank15 on
    # both engines. Member2 belongs to the END card and makes body text black.
    palette=gfx.pal(files[12]);fonts=NARC(r.getFileByName('a/0/2/3')).files
    data['fontPalette']={'archive':archive,'member':12,'sha256':hashlib.sha256(raw[12]).hexdigest(),'colorsRGB':palette[:16]}
    for index in sorted({row['font'] for row in rows if row['kind']==0 and row['text']!=65535}):
        native_index=0 if index==0 else 2
        b=fonts[native_index];glyph,_,off=struct.unpack_from('<3I',b,32);cw,ch,sz=struct.unpack_from('<BBH',b,glyph);mapping={}
        while off and off+12<=len(b):
            first,last,kind,_,nxt=struct.unpack_from('<4HI',b,off);at=off+12
            if kind==0:
                start=struct.unpack_from('<H',b,at)[0];mapping.update({chr(c):start+c-first for c in range(first,last+1)})
            elif kind==1:mapping.update({chr(c):struct.unpack_from('<H',b,at+(c-first)*2)[0] for c in range(first,last+1)})
            elif kind==2:
                count=struct.unpack_from('<H',b,at)[0];mapping.update({chr(c):v for c,v in struct.iter_unpack('<HH',b[at+2:at+2+count*4])})
            else:raise ValueError('Unknown native font mapping')
            off=nxt
        characters=sorted(set(''.join(texts)))
        if any(c not in mapping or mapping[c]==65535 for c in characters):raise ValueError('Credit name glyph missing from native font')
        metrics={};height=((len(characters)+15)//16)*ch
        for color in sorted({row['color'] for row in rows if row['kind']==0 and row['text']!=65535 and row['font']==index}):
            im=Image.new('RGBA',(cw*16,height));word=colors[color];fg,shadow=(word>>10)&31,(word>>5)&31
            for n,c in enumerate(characters):
                cell=b[glyph+8+mapping[c]*sz:glyph+8+(mapping[c]+1)*sz];left,width,advance=cell[:3];metrics[c]=[n%16*cw,n//16*ch,left,advance]
                for y in range(ch):
                    for x in range(cw):
                        pos=y*cw+x;ink=(cell[3+pos//4]>>(6-(pos%4)*2))&3
                        if ink in (1,2):im.putpixel((n%16*cw+x,n//16*ch+y),(*palette[fg if ink==1 else shadow],255))
            image(f'font{index}-color{color}',im)
        data['fonts'][index]={'cellWidth':cw,'height':ch,'glyphs':metrics,'nativeMember':native_index,'sourceSHA256':hashlib.sha256(b).hexdigest()}
    a.work.mkdir(parents=True,exist_ok=True);inputs=[]
    for member in [6,7,8]:
        f=a.work/f'{member}.bin';f.write_bytes(files[member]);inputs.append(str(f.resolve()))
    converted=a.work/'converted';run=subprocess.run([str(a.apicula.resolve()),'convert',*inputs,'-o',str(converted.resolve()),'-f','glb','--all-animations','--overwrite'],capture_output=True)
    (a.work/'conversion.log').write_bytes(run.stdout+run.stderr);run.check_returncode()
    modeldir=dest/'model';modeldir.mkdir(exist_ok=True)
    for f in converted.iterdir():shutil.copyfile(f,modeldir/f.name)
    glbs=list(modeldir.glob('*.glb'))
    if len(glbs)!=1:raise ValueError('Expected one original staff dragon')
    f=glbs[0];blob=f.read_bytes();doc=json.loads(blob[20:20+struct.unpack_from('<I',blob,12)[0]])
    duration=max(doc['accessors'][sampler['input']]['max'][0] for animation in doc.get('animations',[]) for sampler in animation['samplers'])
    data['model']={'url':f.relative_to(a.output).as_posix(),'sha256':hashlib.sha256(blob).hexdigest(),'loopFrames':round(duration*60)+1}
    # BTP frame textures are exported using the same verified Nitro decoder as
    # the earlier field models, preserving the original texture/palette pairs.
    native=files[6];blocks=struct.unpack_from('<'+'I'*struct.unpack_from('<H',native,14)[0],native,16)
    tex=next(native[at:at+struct.unpack_from('<I',native,at+4)[0]] for at in blocks if native[at:at+4]==b'TEX0')
    container=struct.pack('<4sHHIHHI',b'BTX0',0xfeff,1,20+len(tex),16,1,20)+tex
    data['materialTextures']=patterns.tracks(container,[files[7],files[8]],2,modeldir,a.output).get('0',{})
    (a.output/'finale-credits-data.js').write_text('window.FINALE_CREDITS='+json.dumps(data,separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf8')
    print(json.dumps({'rows':len(rows),'texts':len(texts),'fonts':list(data['fonts']),'images':len(data['images']),'model':data['model']['url'],'endingMode':0}))


if __name__=='__main__':main()
