"""Local conversion of user-supplied IRBI maps. Never copies the ROM into the site."""
from pathlib import Path
import argparse, json, math, struct, shutil, subprocess
import numpy as np
from PIL import Image
import ndspy.rom, ndspy.narc

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--rom',type=Path,required=True)
parser.add_argument('--apicula',type=Path,required=True)
parser.add_argument('--output',type=Path,default=Path('src'))
parser.add_argument('--work-dir',type=Path,default=Path('_extract'))
args=parser.parse_args()
ROOT=args.work_dir.resolve();ROOT.mkdir(parents=True,exist_ok=True)
(ROOT/'opening-assets').mkdir(exist_ok=True)
OUTPUT=args.output.resolve();OUTPUT.mkdir(parents=True,exist_ok=True)
APICULA=args.apicula.resolve()
rom=ndspy.rom.NintendoDSRom.fromFile(args.rom)
if rom.idCode != b'IRBI':raise SystemExit('Expected the Italian Pokemon Black IRBI data layout')
cache={}
def narc(name):
    if name not in cache:cache[name]=ndspy.narc.NARC(rom.getFileByName(name)).files
    return cache[name]
def u32(data,p):return struct.unpack_from('<I',data,p)[0]
def convert(model,texture,key):
    folder=ROOT/'opening-assets'/key;folder.mkdir(exist_ok=True)
    (folder/'model.nsbmd').write_bytes(model);(folder/'texture.nsbtx').write_bytes(texture)
    subprocess.run([str(APICULA),'convert','-f=glb',str(folder/'model.nsbmd'),str(folder/'texture.nsbtx'),'-o',str(folder/'converted'),'--overwrite'],check=True,capture_output=True)
    return next((folder/'converted').glob('*.glb'))

assets=OUTPUT/'assets/opening';assets.mkdir(parents=True,exist_ok=True)
textures={};models={}
def flatten(file,key):
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
            p=np.einsum('nij,nj->ni',matrices,np.column_stack((p,np.ones(len(p)))))[:,:3]/16
            norm=np.einsum('nij,nj->ni',matrices[:,:3,:3],norm)
            colors=accessor(a['COLOR_0'])[:,:3] if 'COLOR_0' in a else np.ones((len(p),3))
            mat=doc['materials'][primitive['material']];pbr=mat.get('pbrMetallicRoughness',{});factor=pbr.get('baseColorFactor',[1,1,1,1]);colors*=factor[:3]
            texid=pbr.get('baseColorTexture',{}).get('index');texture=None;width=height=1;sampler={}
            if texid is not None:
                tex=doc['textures'][texid];img=doc['images'][tex['source']]['uri'];texture=key+'-'+Path(img).stem
                path=assets/(texture+'.png');shutil.copyfile(file.parent/img,path)
                with Image.open(path) as im:width,height=im.size
                textures[texture]={'src':'assets/opening/'+path.name,'w':width,'h':height}
                sampler=doc.get('samplers',[])[tex['sampler']] if 'sampler' in tex else {}
            uv=accessor(a['TEXCOORD_0']) if 'TEXCOORD_0' in a else np.zeros((len(p),2));uv*=np.array([width,height])
            packed=np.concatenate([p,uv,colors,norm],axis=1)
            idx=accessor(primitive['indices']).astype(int).flatten() if 'indices' in primitive else range(len(p))
            groups.append({'texture':texture,'w':width,'h':height,'alpha':factor[3],
                'repeatS':sampler.get('wrapS',10497)!=33071,'repeatT':sampler.get('wrapT',10497)!=33071,
                'mirrorS':sampler.get('wrapS')==33648,'mirrorT':sampler.get('wrapT')==33648,
                'verts':np.round(packed[idx].flatten(),5).tolist()})
    models[key]={'groups':groups}

bundles={}
def prop(id,indoor):
    kind='in' if indoor else 'out';key=f'{kind}-prop-{id}'
    if key in models:return key
    member=6 if indoor else 0
    bundle=narc('a/2/3/0' if indoor else 'a/2/2/9')[member]
    count=bundle[2]//2;offsets=struct.unpack_from('<'+str(count*2)+'I',bundle,4)
    matching=[i for i in range(count) if struct.unpack_from('<H',bundle,offsets[i])[0]==id]
    if not matching and indoor and id in (23,24):
        # Laboratory machines have identical models in banks 1, 3, 38 and 42.
        member=1;bundle=narc('a/2/3/0')[member];count=bundle[2]//2
        offsets=struct.unpack_from('<'+str(count*2)+'I',bundle,4)
        matching=[i for i in range(count) if struct.unpack_from('<H',bundle,offsets[i])[0]==id]
    assert matching, (kind,id)
    index=matching[0]
    offset=offsets[count+index];model=bundle[offset:offset+u32(bundle,offset+8)]
    flatten(convert(model,narc('a/1/7/7' if indoor else 'a/1/7/6')[member],key),key)
    return key

scenes={}
specs={'bedroom':[(505,212,0,0)],'home':[(504,212,0,0)],'bianca':[(502,212,0,0)],'lab':[(506,213,0,0)],'north':[(4,2,0,-64),(5,2,0,-96),(6,2,-32,-96)]}
for name,entries in specs.items():
    scene={'instances':[],'permissionGrids':[]}
    for id,texture,x,z in entries:
        land=narc('a/0/0/8')[id];pos=u32(land,4);model=land[pos:pos+u32(land,pos+8)];key=f'map-{id}'
        flatten(convert(model,narc('a/0/1/4')[texture],key),key)
        scene['instances'].append({'model':key,'x':x,'y':0,'z':z,'rotation':0})
        start,end=u32(land,8),u32(land,12)
        # Keep the WB section byte offsets used by the existing collision reader.
        terrain=land[start:end];w,h=struct.unpack_from('<HH',terrain)
        assert (w,h)==(32,32)
        scene['permissionGrids'].append({'x':x,'z':z,'bytes':list(terrain)})
        at=u32(land,12)
        for i in range(u32(land,at)):
            px,py,pz,rot,hi,lo=struct.unpack_from('<iiiHBB',land,at+4+i*16)
            scene['instances'].append({'model':prop((hi<<8)|lo,name!='north'),'x':x+px/65536,'y':py/65536,'z':z-pz/65536,'rotation':rot*math.tau/65536})
    scenes[name]=scene
    print('scene',name,len(scene['instances']))
payload={'models':models,'textures':textures,'scenes':scenes,'source':{'game':'POKEMON B','code':rom.idCode.decode(),'landArchive':'a/0/0/8','landMembers':[505,504,502,506,4,5,6]}}
(OUTPUT/'opening-assets.js').write_text('window.OPENING_ASSETS='+json.dumps(payload,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
print('textures',len(textures),'models',len(models))

p=narc('a/0/1/6');g=narc('a/0/1/7');data={}
for name,id in [('Snivy',495),('Tepig',498),('Oshawott',501),('Patrat',504),('Lillipup',506)]:
    f=struct.unpack_from('<6B2BBBH3H10BHHBBHHH',p[id]);growth=f[17]
    data[name]={'catchRate':f[8],'yield':f[28],'growth':list(struct.unpack('<'+str(len(g[growth])//4)+'I',g[growth]))}
header=narc('a/0/1/2')[0];eid=struct.unpack_from('<H',header,317*48+20)[0]&8191;e=narc('a/1/2/6')[eid]
print('encounter',eid,len(e),e[:60].hex())
print([(k,v['yield'],v['catchRate'],v['growth'][:8]) for k,v in data.items()])
slots=[]
for i,weight in enumerate([20,20,10,10,10,10,5,5,4,4,1,1]):
    species,lo,hi=struct.unpack_from('<HBB',e,8+i*4)
    assert lo==hi and species in (504,506)
    slots.append({'name':{504:'Patrat',506:'Lillipup'}[species],'level':lo,'weight':weight})
(OUTPUT/'opening-data.js').write_text('window.OPENING_DATA='+json.dumps(data,separators=(',',':'))+';\nwindow.OPENING_ENCOUNTERS='+json.dumps(slots,separators=(',',':'))+';\n',encoding='utf8',newline='\n')

import ndspy.texture, ndspy.color
ndspy.color.prepareLUTs()
table=narc('a/0/4/8')[0];graphics=narc('a/0/4/9')
fmt=struct.Struct('<HBBBBBBBBBBBbbbHHHHHH');sprites={}
for name,id in [('Regalo',208),('Padre',24),('Viandante',18)]:
    record=fmt.unpack_from(table,4+id*fmt.size);resource=record[15];tex=ndspy.texture.NSBTX(graphics[resource]);paths=[]
    palette=tex.palettes[0][1]
    palette.colors=[ndspy.color.pack(*c) for c in palette.colors]
    for i,(n,t) in enumerate(tex.textures):
        file=f'assets/opening/{name}-{i}.png';t.renderAsImage(tex.palettes[0][1]).save(OUTPUT/file);paths.append(file)
    sprites[name]=paths;print(name,id,resource,len(paths),[n for n,t in tex.textures][:4])
(OUTPUT/'opening-sprites.js').write_text('window.OPENING_SPRITES='+json.dumps(sprites,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
