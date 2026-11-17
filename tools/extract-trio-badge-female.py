"""Export native IRBI female Trio badge42 without replacing the shipped male2.

The shared receipt exporter verifies the original descriptor and background,
converts native model148/joint149/pattern150 and records the existing BVA/SPL
adaptation explicitly. Raw ROM members and proof remain outside the site.
"""
from pathlib import Path
import argparse,hashlib,importlib.util,json,struct
from irbi_reader import NintendoDSRom,NARC,install
install()

def glb_document(path):
    raw=path.read_bytes();assert raw[:4]==b'glTF'
    return json.loads(raw[20:20+struct.unpack_from('<I',raw,12)[0]])

def rigid_skin_proof(path):
    raw=path.read_bytes();size=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+size]);binary=raw[28+size:];cache={}
    def accessor(index):
        if index in cache:return cache[index]
        a=doc['accessors'][index];v=doc['bufferViews'][a['bufferView']];count={'SCALAR':1,'VEC4':4}[a['type']]
        fmt,unit,denom={5126:('f',4,1),5123:('H',2,65535),5121:('B',1,255),5125:('I',4,4294967295)}[a['componentType']]
        at=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',count*unit)
        values=[list(struct.unpack_from('<'+fmt*count,binary,at+i*stride))for i in range(a['count'])]
        if a.get('normalized'):values=[[x/denom for x in row]for row in values]
        cache[index]=values;return values
    vertices=set();triangles=0
    for mesh in doc['meshes']:
        for primitive in mesh['primitives']:
            a=primitive['attributes'];weights=accessor(a['WEIGHTS_0']);joints=accessor(a['JOINTS_0'])
            owners=[]
            for i,row in enumerate(weights):
                positive=[k for k,w in enumerate(row)if w>0]
                assert len(positive)==1 and abs(sum(row)-1)<1e-6,'Visibility requires original rigid native vertices'
                owner=joints[i][positive[0]];assert owner<7;owners.append(owner);vertices.add((a['WEIGHTS_0'],i))
            indices=[row[0]for row in accessor(primitive['indices'])]if 'indices'in primitive else list(range(len(weights)))
            assert len(indices)%3==0
            for i in range(0,len(indices),3):
                assert len({owners[j]for j in indices[i:i+3]})==1,'A triangle spans native visibility owners'
                triangles+=1
    return {'vertices':len(vertices),'triangles':triangles,'onePositiveWeightPerVertex':True,'oneNativeOwnerPerTriangle':True,'GLBSHA256':hashlib.sha256(raw).hexdigest()}

def visibility(raw,document):
    assert raw[:4]==b'BVA0';block=struct.unpack_from('<I',raw,16)[0];assert raw[block:block+4]==b'VIS0'
    start=raw.index(b'V\0AV');frames,count,size=struct.unpack_from('<HHI',raw,start+4)
    assert frames==361 and start+size==len(raw)
    names=[document['nodes'][i]['name']for i in range(count)]
    assert document['skins'][0]['joints'][:count]==list(range(count))
    at=start+12;assert at+(frames*count+7)//8<=len(raw)
    tracks={name:[(raw[at+(f*count+n)//8]>>((f*count+n)%8))&1 for f in range(frames)]for n,name in enumerate(names)}
    masks=[sum(tracks[name][f]<<i for i,name in enumerate(names))for f in range(frames)]
    keys=[{'frame':f,'mask':mask}for f,mask in enumerate(masks)if f==0 or mask!=masks[f-1]]
    return tracks,{'frames':frames,'nativeNodes':names,'keys':keys,'sha256':hashlib.sha256(raw).hexdigest()}

def export(rom_path,output,apicula,work,proof_name='native-animation-proof.json'):
    if work.resolve().is_relative_to(output.resolve()):
        raise ValueError('Raw native work must stay outside published sources')
    spec=importlib.util.spec_from_file_location('trio_native_badge_export',Path(__file__).with_name('extract-quake-badge.py'))
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    report=module.export(rom_path,output,apicula,work,badge='trio-female')
    rom=NintendoDSRom.fromFile(rom_path);assert rom.idCode==b'IRBI'
    descriptors=NARC(rom.getFileByName('a/1/1/7')).files
    models=NARC(rom.getFileByName('a/1/1/5')).files
    male=struct.unpack('<18H',descriptors[2]);female=struct.unpack('<18H',descriptors[42])
    assert female==(15,0,0,270,16,148,0,0,18,19,20,65535,149,150,151,65535,1,0)
    assert male[4]==female[4] and male[5]!=female[5] and male[12]!=female[12]
    catalog=output/'trio-badge-assets.js';text=catalog.read_text(encoding='utf8');prefix='window.TRIO_BADGE_ASSETS='
    data,end=json.JSONDecoder().raw_decode(text[len(prefix):]);tail=text[len(prefix)+end:]
    data['nodeVisibility']={};data['materialTextures']={};native_visibility={};rigid={};coverage=[]
    pattern_spec=importlib.util.spec_from_file_location('trio_native_pattern_reader',Path(__file__).with_name('extract-league-gym.py'))
    pattern_reader=importlib.util.module_from_spec(pattern_spec);pattern_spec.loader.exec_module(pattern_reader)
    catalogs=[data]
    for name in ['field-effect-assets.js','mistralton-badge-assets.js','icirrus-badge-assets.js','opelucid-badge-assets.js','league-badge-assets.js']:
        source=(output/name).read_text(encoding='utf8');catalogs.append(json.JSONDecoder().raw_decode(source[source.find('=')+1:].lstrip())[0])
    all_effects={k:v for c in catalogs for k,v in c['effects'].items()};all_models={k:v for c in catalogs for k,v in c['models'].items()}
    assert set(all_effects)>={str(i)for i in [2,4,5,6,7,8,9,10,42,43,44,45,46,47,48,49]}
    for identifier in [2,4,5,6,7,8,9,10,42,43,44,45,46,47,48,49]:
        descriptor=struct.unpack('<18H',descriptors[identifier]);effect=all_effects[str(identifier)];name=effect['item'];model=all_models[name]
        assert model['sourceMembers']==list(descriptor[i]for i in [5,12,13])
        file=output/model['url'];rigid[name]=rigid_skin_proof(file)
        member=descriptor[14];data['nodeVisibility'][name],native_visibility[name]=visibility(models[member],glb_document(file))
        native_visibility[name].update({'archive':'a/1/1/5','member':member});data['hashes'][str(member)]=hashlib.sha256(models[member]).hexdigest()
        patterns=pattern_reader.pattern_tracks(models[descriptor[13]])
        for keys in patterns.values():
            assert [key['frame']for key in keys]==[0,272,273,274,275,276]
            for key in keys:
                assert key['palette']==key['texture']+'_pl','Unexpected palette pairing requires an explicit new native texture export'
                image=file.parent/(key['texture'].replace('.','_')+'.png');assert image.is_file()
                key['url']=image.relative_to(output).as_posix()
        data['materialTextures'][name]=patterns;data['hashes'][str(descriptor[13])]=hashlib.sha256(models[descriptor[13]]).hexdigest()
        coverage.append({'effect':identifier,'model':name,'nativeModel':descriptor[5],'joint':descriptor[12],'pattern':descriptor[13],'visibility':member,
                         'modelSHA256':hashlib.sha256(models[descriptor[5]]).hexdigest(),'jointSHA256':hashlib.sha256(models[descriptor[12]]).hexdigest(),
                         'patternSHA256':hashlib.sha256(models[descriptor[13]]).hexdigest(),'visibilitySHA256':hashlib.sha256(models[member]).hexdigest()})
    background=output/all_models['badgeBackground']['url'];rigid['badgeBackground']=rigid_skin_proof(background)
    data['nodeVisibility']['badgeBackground'],native_visibility['badgeBackground']=visibility(models[20],glb_document(background))
    native_visibility['badgeBackground'].update({'archive':'a/1/1/5','member':20});data['hashes']['20']=hashlib.sha256(models[20]).hexdigest()
    data['nativeAnimationProof']={'visibility':native_visibility,'coverage':coverage,'rigidSkinning':rigid,
        'nodeOrder':'First native joint nodes in GLB skin.joints preserve BMD/BCA order; synthesized mesh root excluded',
        'projection':'Normal field opcode415 selects native perspective camera0 and identity SRT; no arbitrary scale/camera change applied'}
    data['effects']['42']['adaptation']='Original model/joint/pattern/node visibility and shared background alpha; SPL15 remains unreconstructed'
    tail=tail.replace("['models','materialAlpha','effects','hashes']","['models','materialAlpha','effects','hashes','nodeVisibility','materialTextures']")
    catalog.write_text(prefix+json.dumps(data,separators=(',',':'))+tail,encoding='utf8',newline='\n')
    proof={'gameCode':'IRBI','romSHA256':hashlib.sha256(rom.raw).hexdigest(),
           'descriptorArchive':'a/1/1/7','femaleDescriptor':{'id':42,'record':female,'sha256':hashlib.sha256(descriptors[42]).hexdigest()},
           'maleComparison':{'id':2,'record':male,'sha256':hashlib.sha256(descriptors[2]).hexdigest()},
           'resourceArchive':'a/1/1/5','members':{str(i):{'magic':models[i][:4].decode('ascii'),'sha256':hashlib.sha256(models[i]).hexdigest()}
             for i in [16,18,19,20,148,149,150,151]},
           'catalog':str(output/'trio-badge-assets.js'),'catalogSHA256':hashlib.sha256((output/'trio-badge-assets.js').read_bytes()).hexdigest(),
           'generatedFiles':report['files'],'reviewed':False,
           'nativeAnimationProof':data['nativeAnimationProof'],
           'limits':['Native female model/joint/pattern/node visibility and shared background alpha exported. SPL15 retains the documented existing receipt adaptation.',
                     'Asset extraction does not certify renderer pixels or campaign completion. Every exported PNG needs visual review.']}
    assert Path(proof_name).name==proof_name,'Proof filename must stay inside raw work'
    (work/proof_name).write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    return report

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('rom',type=Path);p.add_argument('output',type=Path)
    p.add_argument('--apicula',type=Path,required=True);p.add_argument('--work-dir',type=Path,required=True)
    p.add_argument('--proof-name',default='native-animation-proof.json')
    a=p.parse_args();r=export(a.rom,a.output,a.apicula,a.work_dir,a.proof_name)
    print(json.dumps({'nativeEffect':42,'generatedFiles':len(r['files']),'proof':str(a.work_dir/a.proof_name)}))
