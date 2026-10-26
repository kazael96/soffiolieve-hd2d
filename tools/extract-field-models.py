"""Export IRBI's original field-door and bedroom replacement animations locally.

Requires ndspy and the official apicula converter. Source ROM is never copied
to output; only converted model geometry, textures and decoded alpha tracks.
"""
from pathlib import Path
import argparse, hashlib, json, shutil, struct, subprocess, tempfile
import ndspy.rom, ndspy.narc

def u32(b,p):return struct.unpack_from('<I',b,p)[0]
def extract(rom,output,apicula):
    assert rom.idCode==b'IRBI', 'Italian Pokemon Black layout required'
    ov=rom.loadArm9Overlays([21])[21];base=ov.ramAddress
    # These are Black IRBI's field command handlers, not guessed BW2 indices.
    table=rom.loadArm9Overlays([10])[10].data
    assert struct.unpack_from('<4I',table,0x1b4bc+295*4)==(0x21b2c35,0x21b2c99,0x21b2cbd,0x21b2d61)
    filters=list(ov.data[0x21d3cac-base:0x21d3cbc-base])
    assert filters==[0,1,1,1,2,0,3,4,5,6,7,8,9,1,1,1]
    sounds=[struct.unpack_from('<5H',ov.data,0x21d3c70-base+i*10) for i in range(6)]
    sound_map={r[0]:list(r[1:]) for r in sounds}
    result={'source':'Pokemon Black IRBI, field overlay21','units':16,'tickRate':30,
      'timingNote':'30 Hz is the web field adaptation; native advancement is one Nitro frame per field update. No hardware frame-rate certification.',
      'selector':{'class':1,'minX':-2,'maxX':2,'minZ':-3,'maxZ':3,'inclusive':True,'choice':'first matching loaded instance, not nearest','heightChecked':False},
      'native':{'create':'0x021b2c34','play':'0x021b2cbc','wait':'0x021b2d60','selector':'0x0218c484','step':'0x0218c0c4','classTable':'0x021d3cac','soundTable':'0x021d3c70'},
      'models':{},'children':{},'classMap':filters,'soundTable':sound_map}
    dest=output/'assets/field-models';dest.mkdir(parents=True,exist_ok=True)
    for path,member,texture_path,texture_member,ids in [
      ('a/2/2/9',0,'a/1/7/6',0,[93,101,103,164,165]),
      ('a/2/3/0',5,'a/1/7/7',5,[140])]:
        bundle=ndspy.narc.NARC(rom.getFileByName(path)).files[member]
        tex=ndspy.narc.NARC(rom.getFileByName(texture_path)).files[texture_member]
        count=bundle[2]//2;offsets=struct.unpack_from('<'+str(count*2)+'I',bundle,4)
        headers={struct.unpack_from('<H',bundle,p)[0]:p for p in offsets[:count]}
        for parent_id,p in headers.items():
            child,*xyz=struct.unpack_from('<H3h',bundle,p+4)
            if child in ids:result['children'][str(parent_id)]={'model':child,'rawOffset':xyz,'offset':[v/16 for v in xyz],'source':f'{path}:{member}@{p}'}
        for model_id in ids:
            p=headers[model_id];i=offsets.index(p);model_start=offsets[count+i]
            raw_model=bundle[model_start:model_start+u32(bundle,model_start+8)]
            kind=struct.unpack_from('<H',bundle,p+2)[0];mode,unknown,per_set,sets=struct.unpack_from('<4B',bundle,p+16)
            offsets_anim=struct.unpack_from('<4I',bundle,p+20)
            assert mode==2 and per_set*sets==2
            resources=[];alpha={};frames=[]
            for ai,ao in enumerate(offsets_anim[:2]):
                start=p+16+ao;raw=bundle[start:start+u32(bundle,start+8)]
                assert raw[:4] in (b'BCA0',b'BMA0')
                section=0x44;duration=struct.unpack_from('<H',raw,section+4)[0]
                frames.append(duration);resources.append(raw)
                if raw[:4]==b'BMA0':
                    dictionary=section+8;n=raw[dictionary+1];entry=dictionary+struct.unpack_from('<H',raw,dictionary+6)[0]
                    size,names=struct.unpack_from('<HH',raw,entry);assert size==20
                    for mi in range(n):
                        name=raw[entry+names+mi*16:entry+names+(mi+1)*16].split(b'\0')[0].decode('ascii')
                        channels=struct.unpack_from('<5I',raw,entry+4+mi*20);assert all(c&0x20000000 for c in channels[:4])
                        value=channels[4]
                        if value&0x20000000: values=[value&31]*duration
                        else:
                            assert value>>16==duration, f'Unexpected alpha sampling {value:x}'
                            values=list(raw[section+(value&0xffff):section+(value&0xffff)+duration])
                        assert len(values)==duration and max(values)<=31
                        alpha[name]=values
            key=f'field-{model_id}';folder=dest/key
            with tempfile.TemporaryDirectory() as tmp:
                tmp=Path(tmp);inputs=[]
                for name,raw in [('model.nsbmd',raw_model),('texture.nsbtx',tex),*[(f'animation{j}.bin',r) for j,r in enumerate(resources)]]:
                    f=tmp/name;f.write_bytes(raw);inputs.append(str(f))
                subprocess.run([str(apicula),'convert',*inputs,'-o',str(tmp/'converted'),'-f','glb','--all-animations','--overwrite'],check=True,capture_output=True)
                folder.mkdir(exist_ok=True)
                for f in (tmp/'converted').iterdir():shutil.copyfile(f,folder/f.name)
            glb=next(folder.glob('*.glb'));raw=glb.read_bytes();doc=json.loads(raw[20:20+u32(raw,12)])
            animations={}
            for state in range(sets):
                animations[str(state)]={'index':state,'frames':max(frames[state*per_set:(state+1)*per_set]),'loop':False,'sound':sound_map.get(kind,[0]*4)[state]}
            result['models'][str(model_id)]={'key':key,'kind':kind,'class':filters[kind],'mode':mode,'animationsPerSet':per_set,
              'model':glb.relative_to(output).as_posix(),'source':{'archive':path,'member':member,'headerOffset':p,'modelOffset':model_start,'textureArchive':texture_path,'textureMember':texture_member},
              'sha256':{'model':hashlib.sha256(raw_model).hexdigest(),'animations':[hashlib.sha256(r).hexdigest() for r in resources]},
              'animations':animations,'materialAlpha':alpha,'resourceFrames':frames,'glbAnimations':[a.get('name') for a in doc.get('animations',[])]}
            print(model_id,kind,filters[kind],frames,result['models'][str(model_id)]['glbAnimations'])
    (output/'field-model-assets.js').write_text('window.FIELD_MODEL_ASSETS='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
    return result

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--rom',type=Path,required=True);p.add_argument('--apicula',type=Path,required=True);p.add_argument('--output',type=Path,default=Path('src'));a=p.parse_args()
    extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output.resolve(),a.apicula.resolve())
