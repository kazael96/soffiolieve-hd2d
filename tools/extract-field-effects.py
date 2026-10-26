"""Export only the IRBI field effects referenced by the scoped opening programs.

No ROM, overlay, or raw executable file is written into the site. Model and joint
animation conversion uses apicula; original material alpha tracks are separate.
"""
from pathlib import Path
import argparse,hashlib,json,shutil,struct,subprocess,tempfile
import ndspy.rom,ndspy.narc
import ndspy.codeCompression
from PIL import Image

def particle(raw,dest):
    assert raw[:8]==b' APS12_1' and struct.unpack_from('<HH',raw,8)==(1,1)
    p=32;u16=lambda o:struct.unpack_from('<H',raw,p+o)[0];i16=lambda o:struct.unpack_from('<h',raw,p+o)[0];i32=lambda o:struct.unpack_from('<i',raw,p+o)[0]
    f=struct.unpack_from('<I',raw,p)[0];assert f==0x1005502
    e={'flags':f,'position':[i32(o)/4096 for o in(4,8,12)],'rate':i32(16)/4096,'radius':i32(20)/4096,'length':i32(24)/4096,
       'axis':[i16(o)/4096 for o in(28,30,32)],'color':u16(34),'radialVelocity':i32(36)/4096,'axialVelocity':i32(40)/4096,
       'scale':i32(44)/4096,'aspect':u16(48)/4096,'delay':u16(50),'rotation':[i16(52),i16(54)],'baseRotation':u16(56),
       'emitterLife':u16(60),'life':u16(62),'randomScale':raw[p+64],'randomLife':raw[p+65],'randomVelocity':raw[p+66],
       'interval':raw[p+68],'alpha':raw[p+69]&31,'resistance':raw[p+70],'texture':raw[p+71],'offset':[i16(80),i16(82)],
       'framesPerLoop':raw[p+72],'billboardScale':u16(73),'textureLoopFlags':raw[p+75],'texturePositionFlags':struct.unpack_from('<I',raw,p+76)[0]}
    q=p+88;e['scaleKeys']=[struct.unpack_from('<H',raw,q+i*2)[0]/4096 for i in range(3)];e['scaleTimes']=[raw[q+6]/255,raw[q+7]/255]
    e['scaleFlags']=struct.unpack_from('<H',raw,q+8)[0];q+=12
    v=struct.unpack_from('<I',raw,q)[0];e['alphaKeys']=[v&31,v>>5&31,v>>10&31];e['alphaTimes']=[raw[q+4]/255,raw[q+5]/255];e['alphaFlags']=struct.unpack_from('<H',raw,q+2)[0];q+=8
    e['gravity']=[struct.unpack_from('<h',raw,q+i*2)[0]/4096 for i in range(3)];q+=8
    t=struct.unpack_from('<I',raw,24)[0];assert q==t and raw[t:t+4]==b' TPS'
    flags,length,palette_offset,palette_length=struct.unpack_from('<4I',raw,t+4);assert flags&7==1
    w=8<<(flags>>4&15);h=8<<(flags>>8&15);assert length==w*h
    colors=[tuple(((c>>s)&31)*255//31 for s in(0,5,10))for c, in struct.iter_unpack('<H',raw[t+palette_offset:t+palette_offset+palette_length])]
    image=Image.new('RGBA',(w,h));image.putdata([(*colors[v&31],(v>>5)*255//7)for v in raw[t+32:t+32+length]])
    image.save(dest/'particle-8-0.png')
    return {'id':8,'emitters':[e],'textures':[{'name':'particle-8-0.png','w':w,'h':h,'fmt':1}],
            'source':'IRBI a/1/1/5:8','sha256':hashlib.sha256(raw).hexdigest()}

def extract(rom,output,apicula):
    assert rom.idCode==b'IRBI','Expected Italian Pokémon Black IRBI'
    overlays=rom.loadArm9Overlays([10,21]);ov=overlays[21];native=bytes(ov.data);base=ov.ramAddress
    assert struct.unpack_from('<I',overlays[10].data,0x1b4bc+415*4)[0]==0x21c8011
    assert struct.unpack_from('<6i',native,0x21da5bc-base)==(0,4096,0,0,4096,0)
    assert struct.unpack_from('<6i',native,0x21da5d4-base)==(0,0,524288,0,0,524288)
    arm=ndspy.codeCompression.decompress(rom.arm9);ab=rom.arm9RamAddress
    for index,path in[(115,b'a/1/1/5'),(117,b'a/1/1/7')]:
        p=struct.unpack_from('<I',arm,0x20a6b58-ab+index*4)[0]-ab;assert arm[p:p+7]==path
    assert struct.unpack_from('<hh',arm,0x20a1dbc-ab)==(1398,3850)
    files=ndspy.narc.NARC(rom.getFileByName('a/1/1/5')).files
    descriptors=ndspy.narc.NARC(rom.getFileByName('a/1/1/7')).files
    expected=[8,0,0,0,9,180,0,0,11,12,65535,65535,13,14,65535,65535,0,0]
    assert list(struct.unpack('<18H',descriptors[50]))==expected
    expected[5]=181;assert list(struct.unpack('<18H',descriptors[51]))==expected
    dest=output/'assets/field-effects';dest.mkdir(parents=True,exist_ok=True)
    result={'source':'IRBI a/1/1/7:50,51 + a/1/1/5; overlay21',
            'models':{},'materialAlpha':{},'effects':{},'hashes':{}}
    result['verification']={'handler':'overlay21:021c8010','dispatcher':'overlay21:021c23d4','nativeHandlerSha256':hashlib.sha256(native[0x21c8010-base:0x21c8052-base]).hexdigest(),
                            'eventCalls':[[792,741,50],[792,751,51]],'message':[435,19],'blocking':True}
    result['particles']=particle(files[8],dest)
    result['perspective']={'sin':1398/4096,'cos':3850/4096,'aspect':0x1555/4096,'near':1,'far':1024}
    result['camera']={'eye':[0,0,128],'target':[0,0,0],'up':[0,1,0]}
    with tempfile.TemporaryDirectory() as temporary:
        tmp=Path(temporary)
        for name,indices in [('background',[9,11]),('dexM',[180,13]),('dexF',[181,13])]:
            inputs=[]
            for index in indices:
                path=tmp/f'{index}.bin';path.write_bytes(files[index]);inputs.append(str(path))
                result['hashes'][str(index)]=hashlib.sha256(files[index]).hexdigest()
            folder=tmp/name
            subprocess.run([str(apicula.resolve()),'convert',*inputs,'-o',str(folder),'-f','glb','--all-animations'],check=True,capture_output=True)
            target=dest/name;target.mkdir(exist_ok=True)
            for path in folder.iterdir():shutil.copyfile(path,target/path.name)
            glb=next(target.glob('*.glb'));data=glb.read_bytes();length=struct.unpack_from('<I',data,12)[0];document=json.loads(data[20:20+length])
            result['models'][name]={'url':glb.relative_to(output).as_posix(),'sourceMembers':indices,
                'animationNames':[a.get('name','')for a in document.get('animations',[])]}
    for name,index in [('background',12),('dexM',14),('dexF',14)]:
        raw=files[index];assert raw[:4]==b'BMA0' and raw[0x44:0x48]==b'M\0AM'
        start=0x44;frames,=struct.unpack_from('<H',raw,start+4);dictionary=start+8
        count=raw[dictionary+1];entry=dictionary+struct.unpack_from('<H',raw,dictionary+6)[0]
        size,names=struct.unpack_from('<HH',raw,entry);assert size==20
        tracks={}
        for i in range(count):
            material=raw[entry+names+i*16:entry+names+(i+1)*16].split(b'\0')[0].decode('ascii')
            channels=struct.unpack_from('<5I',raw,entry+4+i*20)
            assert all(c&0x20000000 for c in channels[:4]),'Animated material colour requires a native decoder'
            alpha=channels[4];assert alpha>>16==frames,'Unexpected alpha sampling'
            values=list(raw[start+(alpha&0xffff):start+(alpha&0xffff)+frames]);assert len(values)==frames and max(values)<=31
            tracks[material]=values
        result['materialAlpha'][name]=tracks
        result['models'][name]['frames']=frames
        result['hashes'][str(index)]=hashlib.sha256(raw).hexdigest()
    for id,model in [(50,'dexM'),(51,'dexF')]:
        result['effects'][id]={'descriptor':list(struct.unpack('<18H',descriptors[id])),
            'background':'background','item':model,'frames':max(result['models']['background']['frames'],result['models'][model]['frames']),
            'descriptorSha256':hashlib.sha256(descriptors[id]).hexdigest(),'emitter':0,'emitterStartFrame':0,'emitterPositionDelta':[0,0,64/4096]}
    (output/'field-effect-assets.js').write_text('window.FIELD_EFFECT_ASSETS='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
    return result

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('rom',type=Path);parser.add_argument('output',type=Path);parser.add_argument('--apicula',type=Path,required=True);args=parser.parse_args()
    result=extract(ndspy.rom.NintendoDSRom.fromFile(args.rom),args.output,args.apicula)
    print(json.dumps({'models':result['models'],'effects':result['effects']},indent=2))
