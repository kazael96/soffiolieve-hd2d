"""Separate native animated diffuse from the converter's baked vertex color.

Apicula applies default diffuse before GPU commands (primitives/mod.rs) and
encodes it into linear COLOR_0 (convert/gltf/mod.rs). Neutralize only the
conversion copy; the original BMA channels remain unchanged at runtime.
https://github.com/scurest/apicula/blob/master/src/primitives/mod.rs
https://github.com/scurest/apicula/blob/master/src/convert/gltf/mod.rs
"""
import json, struct

def dictionary(raw,start):
    entry=start+struct.unpack_from('<H',raw,start+6)[0];size,names=struct.unpack_from('<HH',raw,entry)
    return [(raw[entry+names+i*16:entry+names+(i+1)*16].split(b'\0')[0].decode('ascii'),entry+4+i*size)for i in range(raw[start+1])]

def neutral_diffuse(raw,names):
    names=set(names)
    if not names:return raw,[]
    if raw[:4]!=b'BMD0':raise ValueError('Expected native BMD model')
    mdl=struct.unpack_from('<I',raw,16)[0]
    if raw[mdl:mdl+4]!=b'MDL0':raise ValueError('Expected MDL0')
    models=dictionary(raw,mdl+8)
    if len(models)!=1:raise ValueError('Expected one native model')
    model=mdl+struct.unpack_from('<I',raw,models[0][1])[0];matbase=model+struct.unpack_from('<I',raw,model+8)[0]
    patched=bytearray(raw);changes=[]
    for name,pointer in dictionary(raw,matbase+4):
        if name not in names:continue
        at=matbase+struct.unpack_from('<I',raw,pointer)[0]+4;value=struct.unpack_from('<H',raw,at)[0]
        if not value&0x8000:raise ValueError('Animated diffuse is not the default vertex color: '+name)
        struct.pack_into('<H',patched,at,value|0x7fff)
        changes.append({'material':name,'offset':at,'beforeRGB5':[(value>>k)&31 for k in [0,5,10]],'before':value,'after':value|0x7fff})
    if {row['material']for row in changes}!=names:raise ValueError('Animated diffuse material missing from BMD')
    allowed={i for row in changes for i in [row['offset'],row['offset']+1]}
    if any(a!=b and i not in allowed for i,(a,b)in enumerate(zip(raw,patched,strict=True))):raise ValueError('Unrelated native bytes changed')
    return bytes(patched),changes

def mark_glb(raw,names):
    if not names:return raw
    if raw[:4]!=b'glTF' or struct.unpack_from('<I',raw,4)[0]!=2:raise ValueError('Expected GLB2')
    size,kind=struct.unpack_from('<II',raw,12)
    if kind!=0x4e4f534a:raise ValueError('Expected GLB JSON')
    doc=json.loads(raw[20:20+size]);names=sorted(set(names))
    if not set(names)<={m['name']for m in doc['materials']}:raise ValueError('Unbound neutral diffuse')
    extras=doc.setdefault('extras',{})
    if 'nativeAnimatedDiffuseNeutral'in extras:raise ValueError('Diffuse basis already marked')
    extras['nativeAnimatedDiffuseNeutral']=names
    encoded=json.dumps(doc,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4)
    remainder=raw[20+size:]
    return struct.pack('<4sIIII',b'glTF',2,20+len(encoded)+len(remainder),len(encoded),kind)+encoded+remainder
