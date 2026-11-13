"""Export Black's original Light Stone gimmick53, owned explicitly by overlay64."""
import argparse,hashlib,importlib.util,json,shutil,struct,subprocess
from pathlib import Path

# Retain the same reviewed native texture/UV readers as the five movies.
spec=importlib.util.spec_from_file_location('stone_film_helpers',Path(__file__).with_name('extract-finale-films.py'))
films=importlib.util.module_from_spec(spec);spec.loader.exec_module(films)
from irbi_reader import NintendoDSRom,NARC,code_decompress

def main():
    p=argparse.ArgumentParser(description=__doc__)
    for key in ['rom','output','work','apicula']:p.add_argument('--'+key,type=Path,required=True)
    a=p.parse_args();rom=NintendoDSRom.fromFile(a.rom)
    if rom.idCode!=b'IRBI':raise ValueError('Expected Black IRBI')
    ov=rom.loadArm9Overlays([21,64]);owner=ov[64];registry=ov[21];word=lambda address:struct.unpack_from('<I',registry.data,address-registry.ramAddress)[0]
    if [word(address+53*4)for address in [0x21d9c84,0x21d9ba8,0x21d9acc,0x21d9d60]]!=[64,0x21f35a1,0x21f3671,0x21f368d]:raise ValueError('Original gimmick53 registry changed')
    arm=code_decompress(rom.arm9);pointer=struct.unpack_from('<I',arm,0x20a6b58-rom.arm9RamAddress+219*4)[0];name=arm[pointer-rom.arm9RamAddress:].split(b'\0',1)[0].decode('ascii')
    if name!='a/2/1/9':raise ValueError('Original archive219 changed')
    files=NARC(rom.getFileByName(name)).files
    result={'source':{'rom':'IRBI','gimmick':53,'overlay':64,'overlaySHA256':hashlib.sha256(owner.data).hexdigest(),'registryOverlaySHA256':hashlib.sha256(registry.data).hexdigest(),'registryOverlayIds':'21:021d9c84','registryConstructor':'21:021d9ba8','registryDestructor':'21:021d9acc','registryTick':'21:021d9d60','constructor':'64:021f3698','task':'64:021f372c','archive':name},'models':{},'materialTextures':{},'materialUV':{},'materialAlpha':{},'materialColor':{}}
    for index,members in enumerate([[0,1,2,3,4],[6,7,9,8]]):
        key='part'+str(index);work=a.work/key;work.mkdir(parents=True,exist_ok=True);inputs=[]
        for member in members:
            file=work/(str(member)+'.bin');file.write_bytes(files[member]);inputs.append(str(file.resolve()))
        converted=work/'converted';run=subprocess.run([str(a.apicula.resolve()),'convert',*inputs,'-o',str(converted.resolve()),'-f','glb','--all-animations','--overwrite'],capture_output=True)
        (work/'convert.log').write_bytes(run.stdout+run.stderr);run.check_returncode()
        destination=a.output/'assets/finale/stone'/key;destination.mkdir(parents=True,exist_ok=True)
        for file in converted.iterdir():shutil.copyfile(file,destination/file.name)
        glbs=list(destination.glob('*.glb'))
        if len(glbs)!=1:raise ValueError('Expected one original model per stone part')
        blob=glbs[0].read_bytes();doc=json.loads(blob[20:20+struct.unpack_from('<I',blob,12)[0]]);resources=[files[m]for m in members if files[m][:4]!=b'BMD0'];model=files[members[0]]
        blocks=struct.unpack_from('<'+'I'*struct.unpack_from('<H',model,14)[0],model,16);tex=next(model[at:at+struct.unpack_from('<I',model,at+4)[0]]for at in blocks if model[at:at+4]==b'TEX0');container=struct.pack('<4sHHIHHI',b'BTX0',0xfeff,1,20+len(tex),16,1,20)+tex
        result['materialTextures'][key]=films.patterns.tracks(container,resources,len(resources),destination,a.output).get('0',{})
        sizes={}
        for material in doc.get('materials',[]):
            texture=material.get('pbrMetallicRoughness',{}).get('baseColorTexture',{}).get('index')
            if texture is not None:
                uri=doc['images'][doc['textures'][texture]['source']]['uri'];png=(destination/uri).read_bytes();sizes[material['name']]=struct.unpack_from('>II',png,16)
        result['materialUV'][key]=films.srt.maya_matrix_tracks(resources,doc,sizes)
        for animation in resources:
            if animation[:4]==b'BMA0':result['materialAlpha'][key],result['materialColor'][key]=films.material_tracks(animation)
        frames=films.patterns.duration(next(r for r in resources if r[:4]==b'BCA0'))
        result['models'][key]={'url':glbs[0].relative_to(a.output).as_posix(),'members':members,'frames':frames,'sha256':hashlib.sha256(blob).hexdigest(),'bindings':films.srt.animation_bindings(resources,len(resources),doc).get('0',[]),'materials':[m['name']for m in doc.get('materials',[])]}
    result.update(frames=result['models']['part0']['frames'],sounds=[{'frame':0,'id':2000},{'frame':108,'id':1996},{'frame':131,'id':1995},{'frame':250,'id':2034}],flash={'start':101,'end':117,'brightness':16},nativeFieldScale=1/16)
    a.output.mkdir(parents=True,exist_ok=True);(a.output/'finale-stone-data.js').write_text('window.FINALE_STONE='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8');print('Exported native gimmick53/overlay64 Light Stone parts: '+str({k:v['frames']for k,v in result['models'].items()}))

if __name__=='__main__':main()
