"""Convert apicula GLB geometry to the site vertex layout; preserve texture sampling."""
import json,struct,shutil
from pathlib import Path
import numpy as np
from PIL import Image
def u32(data,p):return struct.unpack_from('<I',data,p)[0]

def flatten_glb(file,key,assets,asset_url,units=16):
    textures={};models={}
    raw=file.read_bytes();length=u32(raw,12);doc=json.loads(raw[20:20+length]);binary=raw[28+length:]
    def accessor(index):
        a=doc['accessors'][index];v=doc['bufferViews'][a['bufferView']]
        fmt,size={5126:('f',4),5125:('I',4),5123:('H',2),5121:('B',1)}[a['componentType']]
        count={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
        offset=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',count*size)
        vals=np.array([struct.unpack_from('<'+fmt*count,binary,offset+i*stride) for i in range(a['count'])],dtype=float)
        if a.get('normalized'):vals/={5121:255,5123:65535}[a['componentType']]
        return vals
    world={}
    def visit(i,parent):
        n=doc['nodes'][i]
        if 'matrix' in n:local=np.array(n['matrix']).reshape((4,4),order='F')
        else:
            x,y,z,w=n.get('rotation',[0,0,0,1]);rot=np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)], [2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
            local=np.eye(4);local[:3,:3]=rot@np.diag(n.get('scale',[1,1,1]));local[:3,3]=n.get('translation',[0,0,0])
        world[i]=parent@local
        for c in n.get('children',[]):visit(c,world[i])
    for i in doc['scenes'][doc.get('scene',0)]['nodes']:visit(i,np.eye(4))
    groups=[]
    for ni,node in enumerate(doc['nodes']):
        if 'mesh' not in node:continue
        for primitive in doc['meshes'][node['mesh']]['primitives']:
            a=primitive['attributes'];p=accessor(a['POSITION']);norm=accessor(a['NORMAL']) if 'NORMAL' in a else np.tile([0,1,0],(len(p),1))
            matrices=np.tile(world[ni],(len(p),1,1))
            if 'skin' in node:
                skin=doc['skins'][node['skin']];inverse=accessor(skin['inverseBindMatrices'])
                joints=[world[i]@inverse[j].reshape((4,4),order='F') for j,i in enumerate(skin['joints'])]
                indices=accessor(a['JOINTS_0']).astype(int);weights=accessor(a['WEIGHTS_0'])
                matrices=np.array([sum((joints[j]*w for j,w in zip(js,ws)),np.zeros((4,4))) for js,ws in zip(indices,weights)])
            p=np.einsum('nij,nj->ni',matrices,np.column_stack((p,np.ones(len(p)))))[:,:3]/units
            norm=np.einsum('nij,nj->ni',matrices[:,:3,:3],norm)
            # Unlit Nitro triangles may carry undefined GLB normals. Keep their baked vertex colour.
            norm=np.nan_to_num(norm,nan=0.0,posinf=0.0,neginf=0.0)
            colors=accessor(a['COLOR_0'])[:,:3] if 'COLOR_0' in a else np.ones((len(p),3))
            mat=doc['materials'][primitive['material']];pbr=mat.get('pbrMetallicRoughness',{});factor=pbr.get('baseColorFactor',[1,1,1,1]);colors*=factor[:3]
            texid=pbr.get('baseColorTexture',{}).get('index');texture=None;width=height=1;sampler={}
            if texid is not None:
                tex=doc['textures'][texid];img=doc['images'][tex['source']]['uri'];texture=key+'-'+Path(img).stem
                path=assets/(texture+'.png');shutil.copyfile(file.parent/img,path)
                with Image.open(path) as im:width,height=im.size
                textures[texture]={'src':asset_url+'/'+path.name,'w':width,'h':height}
                sampler=doc.get('samplers',[])[tex['sampler']] if 'sampler' in tex else {}
            uv=accessor(a['TEXCOORD_0']) if 'TEXCOORD_0' in a else np.zeros((len(p),2));uv*=np.array([width,height])
            packed=np.concatenate([p,uv,colors,norm],axis=1)
            idx=accessor(primitive['indices']).astype(int).flatten() if 'indices' in primitive else range(len(p))
            groups.append({'texture':texture,'w':width,'h':height,'alpha':factor[3],'doubleSided':mat.get('doubleSided',False),
                'repeatS':sampler.get('wrapS',10497)!=33071,'repeatT':sampler.get('wrapT',10497)!=33071,
                'mirrorS':sampler.get('wrapS')==33648,'mirrorT':sampler.get('wrapT')==33648,
                'verts':np.round(packed[idx].flatten(),5).tolist()})
    models[key]={'groups':groups}

    return models[key],textures
