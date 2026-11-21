"""Reuse an exactly matching rigid case component from a native receipt export.

The old component must have byte-identical typed vertex attributes and oriented
triangle topology. All native item geometry, target BCA curves and materials stay
unchanged. No closest-position, texture-based or shape-guess fallback is allowed.
"""
import argparse,collections,importlib.util,json,struct,hashlib,shutil
from pathlib import Path
spec=importlib.util.spec_from_file_location('native_receipt_rebind',Path(__file__).with_name('rebind-native-receipts.py'));native=importlib.util.module_from_spec(spec);spec.loader.exec_module(native)

def span(doc,binary,index,vertex):
    a=doc['accessors'][index];view=doc['bufferViews'][a['bufferView']];size={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]*{5126:4,5123:2,5121:1,5125:4}[a['componentType']]
    at=view.get('byteOffset',0)+a.get('byteOffset',0)+vertex*view.get('byteStride',size)
    return at,size

def piece(doc,binary):
    vertices={};triangles=collections.Counter()
    for mesh in doc['meshes']:
        for p in mesh['primitives']:
            attrs=p['attributes'];j=native.accessor(doc,binary,attrs['JOINTS_0']);w=native.accessor(doc,binary,attrs['WEIGHTS_0']);indices=[i[0]for i in native.accessor(doc,binary,p['indices'])]
            for start in range(0,len(indices),3):
                indices3=indices[start:start+3];owners=[]
                for i in indices3:
                    active=[k for k,v in enumerate(w[i])if v>0];rec=doc['accessors'][attrs['WEIGHTS_0']];one=255 if rec.get('normalized')and rec['componentType']==5121 else 1
                    assert len(active)==1 and w[i][active[0]]==one;owners.append(j[i][active[0]])
                if not any(o in [1,2]for o in owners):continue
                assert len(set(owners))==1 and owners[0]in [1,2]
                signatures=[]
                for i in indices3:
                    parts=[]
                    for name,index in sorted(attrs.items()):
                        at,size=span(doc,binary,index,i);a=doc['accessors'][index]
                        parts.append(name.encode()+str((a['componentType'],a['type'],a.get('normalized',False))).encode()+binary[at:at+size])
                    key=b'|'.join(parts);vertices[(attrs['POSITION'],i)]=key;signatures.append(key)
                key=tuple(signatures);triangles[min(key,key[1:]+key[:1],key[2:]+key[:2])]+=1
    return vertices,triangles

def convert(source,target_name,reference_name,native_proof,out):
    proof=json.loads(native_proof.read_text());assert proof['result'].endswith('NATIVE_REEXPORT_PROOF_PASS_PENDING_VISUAL_REVIEW')
    ref=next(r for r in proof['rows']if r['model']==reference_name);models={}
    for file in native.CATALOGS:
        text=(source/file).read_text();d=json.JSONDecoder().raw_decode(text[text.index('=')+1:].lstrip())[0];models.update(d['models'])
    record=models[target_name];assert target_name!=reference_name
    original,doc,binary=native.glb(source/record['url']);before,old,oldbin=native.glb(source/ref['url']);after,new,newbin=native.glb(native_proof.parent/'converted'/ref['url'])
    assert native.SHA(before)==ref['beforeGLBSHA256']and native.SHA(after)==ref['afterGLBSHA256']
    for i in [1,2]:
        assert doc['nodes'][i]==old['nodes'][i]and doc['nodes'][i]['name']in ['LL','RR']
        a,size=span(doc,binary,doc['skins'][0]['inverseBindMatrices'],i);b,n=span(old,oldbin,old['skins'][0]['inverseBindMatrices'],i)
        assert size==n and binary[a:a+size]==oldbin[b:b+n]
    vertices,triangles=piece(doc,binary);refverts,reftriangles=piece(old,oldbin)
    assert vertices and triangles==reftriangles,'Refusing non-identical native case topology/attributes'
    mapping=collections.defaultdict(set)
    for (index,i),key in refverts.items():
        at,size=span(new,newbin,index,i);mapping[key].add(newbin[at:at+size])
    assert all(key in mapping and len(mapping[key])==1 for key in vertices.values()),'Refusing ambiguous or incomplete native case mapping'
    rewritten=bytearray(binary);allowed=set()
    for (index,i),key in vertices.items():
        at,size=span(doc,binary,index,i);value=next(iter(mapping[key]));assert len(value)==size
        rewritten[at:at+size]=value;allowed.update(range(at,at+size))
    for i in [1,2]:
        a,size=span(doc,binary,doc['skins'][0]['inverseBindMatrices'],i);b,n=span(new,newbin,new['skins'][0]['inverseBindMatrices'],i);assert size==n
        rewritten[a:a+size]=newbin[b:b+n];allowed.update(range(a,a+size));doc['nodes'][i]['scale']=[1,1,1]
    assert all(a==b or i in allowed for i,(a,b)in enumerate(zip(binary,rewritten,strict=True)))
    for index in {index for index,i in vertices}:
        values=native.accessor(doc,rewritten,index);doc['accessors'][index]['min']=[min(row[k]for row in values)for k in range(3)];doc['accessors'][index]['max']=[max(row[k]for row in values)for k in range(3)]
    text=json.dumps(doc,separators=(',',':')).encode();text+=b' '*((-len(text))%4);data=bytes(rewritten);data+=b'\0'*((-len(data))%4)
    encoded=struct.pack('<4sII',b'glTF',2,12+8+len(text)+8+len(data))+struct.pack('<I4s',len(text),b'JSON')+text+struct.pack('<I4s',len(data),b'BIN\0')+data
    assert not out.exists(),'Preserve prior component reuse evidence';destination=out/'converted'/record['url'];destination.parent.mkdir(parents=True);destination.write_bytes(encoded)
    for image in doc['images']:shutil.copyfile((source/record['url']).parent/image['uri'],destination.parent/image['uri'])
    details=native.compare_conversion(source/record['url'],destination,{'LL','RR'})
    result={'result':'EXACT_NATIVE_SHARED_CASE_REUSE_PENDING_VISUAL_REVIEW','model':target_name,'url':record['url'],'nativeReferenceModel':reference_name,'nativeReferenceProofSHA256':native.SHA(native_proof.read_bytes()),'nativeReferenceGLBSHA256':ref['afterGLBSHA256'],'caseVertices':len(vertices),'uniqueSignatures':len(mapping),'orientedTriangles':sum(triangles.values()),'byteIdenticalOldTypedAttributesAndTopology':True,'onlyChangedBinaryRanges':'LL/RR POSITION vertices and LL/RR inverse-bind rows; native item bytes untouched',**details,'limits':['Original target BMD unavailable; only exact shared component reuse from an independently verified native model.','No animation curve, material, texture, index, weight or non-case position replaced.','Private output not installed; visual and integrated checks required.']}
    (out/'proof.json').write_text(json.dumps(result,indent=2));print(json.dumps({k:result[k]for k in ['result','model','caseVertices','orientedTriangles','afterGLBSHA256']}));return result

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    for key in ['source','native-proof','output']:parser.add_argument('--'+key,type=Path,required=True)
    for key in ['target','reference']:parser.add_argument('--'+key,required=True)
    a=parser.parse_args();convert(a.source,a.target,a.reference,a.native_proof,a.output)
