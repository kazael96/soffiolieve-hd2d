"""Re-export native receipt meshes with a nonsingular conversion bind basis.

Original zero-scale rigid nodes collapse geometry before GLB Float32 storage.
Using unit scale only for the conversion bind preserves native local vertices;
the original BCA retains every animated scale/rotation/translation unchanged.
This tool writes private output and evidence, never edits the supplied source.
Binary layout reference: https://github.com/scurest/nsbmd_docs/blob/master/nsbmd_docs.txt
"""
import argparse, hashlib, json, struct, subprocess
from pathlib import Path
from irbi_reader import NintendoDSRom, NARC

CATALOGS=['field-effect-assets.js','trio-badge-assets.js','mistralton-badge-assets.js','icirrus-badge-assets.js','opelucid-badge-assets.js','league-badge-assets.js']
SHA=lambda raw:hashlib.sha256(raw).hexdigest()

def dictionary(raw,start):
    entry=start+struct.unpack_from('<H',raw,start+6)[0];size,names=struct.unpack_from('<HH',raw,entry)
    return [(raw[entry+names+i*16:entry+names+(i+1)*16].split(b'\0')[0].decode('ascii'),entry+4+i*size)for i in range(raw[start+1])]

def unit_conversion_bind(raw,node_names):
    assert raw[:4]==b'BMD0';mdl=struct.unpack_from('<I',raw,16)[0];assert raw[mdl:mdl+4]==b'MDL0'
    entries=dictionary(raw,mdl+8);assert len(entries)==1
    model=mdl+struct.unpack_from('<I',raw,entries[0][1])[0];bones=model+64;patched=bytearray(raw);changes=[]
    for name,pointer in dictionary(raw,bones):
        if name not in node_names:continue
        at=bones+struct.unpack_from('<I',raw,pointer)[0];flags=struct.unpack_from('<H',raw,at)[0];pos=at+4
        if not flags&1:pos+=12
        if flags&8:pos+=4
        elif not flags&2:pos+=16
        assert not flags&4,('Expected explicit zero bind scale',name)
        values=struct.unpack_from('<6i',raw,pos)
        assert values==(0,)*6,('Refusing a nonzero or unknown scale basis',name,values)
        struct.pack_into('<6i',patched,pos,*([4096]*6))
        changes.append({'node':name,'offset':pos,'beforeQ12':list(values),'conversionBindQ12':[4096]*6})
    assert {c['node']for c in changes}==set(node_names)
    allowed={p for c in changes for p in range(c['offset'],c['offset']+24)}
    assert all(a==b or i in allowed for i,(a,b)in enumerate(zip(raw,patched,strict=True)))
    return bytes(patched),changes

def glb(path):
    raw=path.read_bytes();assert raw[:4]==b'glTF';size=struct.unpack_from('<I',raw,12)[0]
    return raw,json.loads(raw[20:20+size]),raw[28+size:]

def accessor(doc,binary,index):
    a=doc['accessors'][index];v=doc['bufferViews'][a['bufferView']]
    size={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
    fmt,unit={5126:('f',4),5123:('H',2),5121:('B',1),5125:('I',4)}[a['componentType']]
    at=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',size*unit)
    return [struct.unpack_from('<'+fmt*size,binary,at+i*stride)for i in range(a['count'])]

def compare_conversion(source,destination,changed_nodes):
    oldraw,old,oldbin=glb(source);newraw,new,newbin=glb(destination)
    for key in ['materials','textures','images','samplers','scenes','scene']:
        assert old.get(key)==new.get(key),('Native definitions changed',key)
    assert len(old['nodes'])==len(new['nodes'])
    for before,after in zip(old['nodes'],new['nodes'],strict=True):
        expected=dict(before)
        if before.get('name')in changed_nodes:expected['scale']=[1,1,1]
        assert expected==after,('Hierarchy or non-bind transform changed',before.get('name'))
    targets=set();samples=0
    for oa,na in zip(old['animations'],new['animations'],strict=True):
        assert oa['channels']==na['channels']
        for channel in oa['channels']:targets.add((old['nodes'][channel['target']['node']]['name'],channel['target']['path']))
        for os,ns in zip(oa['samplers'],na['samplers'],strict=True):
            assert os.get('interpolation')==ns.get('interpolation')
            for key in ['input','output']:
                before,after=accessor(old,oldbin,os[key]),accessor(new,newbin,ns[key])
                assert before==after,('Native BCA samples changed',key)
                samples+=len(before)
    assert all((name,'scale')in targets for name in changed_nodes),'Bind change requires explicit original animated scale'
    for om,nm in zip(old['meshes'],new['meshes'],strict=True):
        for op,np in zip(om['primitives'],nm['primitives'],strict=True):
            assert op['material']==np['material']
            assert accessor(old,oldbin,op['indices'])==accessor(new,newbin,np['indices'])
            assert op['attributes'].keys()==np['attributes'].keys()
            for key in op['attributes']:
                if key=='POSITION':continue
                assert accessor(old,oldbin,op['attributes'][key])==accessor(new,newbin,np['attributes'][key]),('Non-position vertex data changed',key)
    maximum=0
    for os,ns in zip(old['skins'],new['skins'],strict=True):
        assert os['joints']==ns['joints'] and os.get('skeleton')==ns.get('skeleton')
        maximum=max(maximum,*(abs(v)for row in accessor(new,newbin,ns['inverseBindMatrices'])for v in row))
    assert maximum<1e6,'Converted bind still ill-conditioned'
    textures=[]
    for image in old['images']:
        name=image['uri'];a,b=(source.parent/name).read_bytes(),(destination.parent/name).read_bytes();assert a==b,('Texture changed',name)
        textures.append({'uri':name,'sha256':SHA(a)})
    return {'beforeGLBSHA256':SHA(oldraw),'afterGLBSHA256':SHA(newraw),'nativeBCASamplesExactlyEqual':samples,'maximumAbsInverseBind':maximum,'hierarchyMaterialsTexturesIndicesWeightsIdentical':True,'textures':textures}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    for key in ['source','output','apicula']:p.add_argument('--'+key,type=Path,required=True)
    native=p.add_mutually_exclusive_group(required=True);native.add_argument('--rom',type=Path);native.add_argument('--raw-index',type=Path,nargs='+',help='Lists of private raw paths; each member matched by verified native SHA, never filename alone')
    p.add_argument('--models',help='Explicit partial private conversion; comma-separated native model names')
    a=p.parse_args();source=a.source.resolve();out=a.output.resolve()
    assert not out.is_relative_to(source)and not source.is_relative_to(out),'Private output must be separate from shipped source'
    models={};effects={};hashes={}
    for file in CATALOGS:
        text=(source/file).read_text(encoding='utf8');d=json.JSONDecoder().raw_decode(text[text.index('=')+1:].lstrip())[0]
        models.update(d['models']);effects.update(d['effects']);hashes.update(d['hashes'])
    names={'badgeBackground',*(e['item']for e in effects.values()if e['item']not in ['dexM','dexF'])};assert len(names)==17
    if a.models:
        selected=set(a.models.split(','));assert selected<=names and selected;names=selected
    provenance={}
    if a.rom:
        romraw=a.rom.read_bytes();rom=NintendoDSRom(romraw);assert rom.idCode==b'IRBI';files=NARC(rom.getFileByName('a/1/1/5')).files
        retained=[]
        for identifier,effect in effects.items():
            if effect['item']not in names:continue
            for kind,offset in [('PAT',13),('BVA',14)]:
                member=effect['descriptor'][offset];expected=hashes[str(member)];assert SHA(files[member])==expected,('Native retained animation source mismatch',identifier,kind,member)
                retained.append({'effect':int(identifier),'kind':kind,'member':member,'sha256':expected,'catalogAndTextureAssetsUnchanged':True})
        provenance={'romSHA256':SHA(romraw),'gameCode':rom.idCode.decode(),'retainedNativePATandBVA':retained}
    else:
        wanted={i:hashes[str(i)]for name in names for i in models[name]['sourceMembers']};by_hash={};examined=0
        for index in a.raw_index:
            for line in index.read_text(encoding='utf-8-sig').splitlines():
                file=Path(line.strip())
                if not file.is_file()or file.stat().st_size>3_000_000:continue
                raw=file.read_bytes();examined+=1;digest=SHA(raw)
                if digest in wanted.values():by_hash[digest]=(raw,str(file.resolve()))
        missing=[i for i,digest in wanted.items()if digest not in by_hash]
        assert not missing,('Verified native members unavailable; no conversion installed',sorted(missing))
        files={i:by_hash[digest][0]for i,digest in wanted.items()};provenance={'rawIndexes':[str(f.resolve())for f in a.raw_index],'filesExamined':examined,'nativeMatchedBySHA256':{i:by_hash[digest][1]for i,digest in wanted.items()}}
    assert not out.exists(),'Preserve prior conversion evidence';out.mkdir(parents=True)
    report={'result':'RUNNING',**provenance,'converter':{'path':str(a.apicula.resolve()),'sha256':SHA(a.apicula.read_bytes())},'exportToolSHA256':SHA(Path(__file__).read_bytes()),'modelsRequested':sorted(names),'partial':len(names)!=17,'rows':[],'scope':'Native geometry conversion bind only; original BCA/PAT/BVA unchanged. Output private, not installed.'}
    proof=out/'proof.json';proof.write_text(json.dumps(report,indent=2))
    for name in sorted(names):
        record=models[name];members=record['sourceMembers'];work=out/'raw-private'/name;work.mkdir(parents=True);inputs=[]
        original=files[members[0]];assert SHA(original)==hashes[str(members[0])]
        patched,changes=unit_conversion_bind(original,['circle1']if name=='badgeBackground'else ['LL','RR'])
        for i,member in enumerate(members):
            assert SHA(files[member])==hashes[str(member)]
            file=work/f'{member}.bin';file.write_bytes(patched if i==0 else files[member]);inputs.append(str(file))
        destination=out/'converted'/Path(record['url']).parent;destination.mkdir(parents=True)
        run=subprocess.run([str(a.apicula.resolve()),'convert',*inputs,'-o',str(destination),'-f','glb','--all-animations','--overwrite'],capture_output=True,check=True)
        (work/'convert.log').write_bytes(run.stdout+run.stderr)
        converted=out/'converted'/record['url'];details=compare_conversion(source/record['url'],converted,{c['node']for c in changes})
        row={'model':name,'url':record['url'],'sourceMembers':members,'nativeMembers':[{'member':i,'sha256':SHA(files[i])}for i in members],'conversionBind':changes,**details};report['rows'].append(row);proof.write_text(json.dumps(report,indent=2));print(name,details['afterGLBSHA256'],flush=True)
    assert len(report['rows'])==len(names);report['result']=('PARTIAL_'if len(names)!=17 else '')+'NATIVE_REEXPORT_PROOF_PASS_PENDING_VISUAL_REVIEW';proof.write_text(json.dumps(report,indent=2))

if __name__=='__main__':main()
