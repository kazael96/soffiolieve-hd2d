"""Local conversion of user-supplied IRBI maps. Never copies the ROM into the site."""
from pathlib import Path
import argparse, json, math, struct, shutil, subprocess, hashlib
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
    from nitro_geometry import flatten_glb
    model,images=flatten_glb(file,key,assets,'assets/opening')
    models[key]=model;textures.update(images)

bundles={}
def prop(id,indoor):
    kind='in' if indoor else 'out';key=f'{kind}-prop-{id}'
    if key in models:return key
    member=6 if indoor else 0
    bundle=narc('a/2/3/0' if indoor else 'a/2/2/9')[member]
    count=bundle[2]//2;offsets=struct.unpack_from('<'+str(count*2)+'I',bundle,4)
    matching=[i for i in range(count) if struct.unpack_from('<H',bundle,offsets[i])[0]==id]
    if not matching and indoor and id in (23,24,139,140,141):
        # The laboratory machines and room-change props are in shared bundles.
        member=1 if id in (23,24) else 5;bundle=narc('a/2/3/0')[member];count=bundle[2]//2
        offsets=struct.unpack_from('<'+str(count*2)+'I',bundle,4)
        matching=[i for i in range(count) if struct.unpack_from('<H',bundle,offsets[i])[0]==id]
    assert matching, (kind,id)
    index=matching[0]
    offset=offsets[count+index];model=bundle[offset:offset+u32(bundle,offset+8)]
    flatten(convert(model,narc('a/1/7/7' if indoor else 'a/1/7/6')[member],key),key)
    return key

scenes={}
specs={'bedroom':[(505,212,0,0)],'bedroomMess':[(633,212,0,0)],'home':[(504,212,0,0)],'bianca':[(502,212,0,0)],'biancaRoom':[(503,212,0,0)],'komorHome':[(500,212,0,0)],'komorRoom':[(501,212,0,0)],'lab':[(506,213,0,0)],'north':[(4,2,0,-64),(5,2,0,-96),(6,2,-32,-96)]}
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
payload={'models':models,'textures':textures,'scenes':scenes,'source':{'game':'POKEMON B','code':rom.idCode.decode(),'landArchive':'a/0/0/8','landMembers':sorted({member for entries in specs.values() for member,_,_,_ in entries})}}
(OUTPUT/'opening-assets.js').write_text('window.OPENING_ASSETS='+json.dumps(payload,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
print('textures',len(textures),'models',len(models))

p=narc('a/0/1/6');g=narc('a/0/1/7');data={}
for name,id in [('Snivy',495),('Tepig',498),('Oshawott',501),('Patrat',504),('Lillipup',506)]:
    f=struct.unpack_from('<6B2BBBH3H10BHHBBHHH',p[id]);growth=f[17]
    data[name]={'catchRate':f[8],'yield':f[28],'evYield':{stat:(f[10]>>(2*i))&3 for i,stat in enumerate(['hp','atk','def','spe','spa','spd'])},'growth':list(struct.unpack('<'+str(len(g[growth])//4)+'I',g[growth]))}
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
for name,id in [('Komor',7),('Belle',134),('Aralia',105),('Mamma',147),('Regalo',208),('Padre',24),('Viandante',18),*[(f'Original{i}',i) for i in [9,14,20,22,25,26,27]]]:
    record=fmt.unpack_from(table,4+id*fmt.size);resource=record[15];tex=ndspy.texture.NSBTX(graphics[resource]);paths=[]
    palette=tex.palettes[0][1]
    palette.colors=[ndspy.color.pack(*c) for c in palette.colors]
    for i,(n,t) in enumerate(tex.textures):
        t.isColor0Transparent=True
        file=f'assets/opening/{name}-{i}.png';t.renderAsImage(tex.palettes[0][1]).save(OUTPUT/file);paths.append(file+'?v='+hashlib.sha256((OUTPUT/file).read_bytes()).hexdigest()[:12])
    sprites[name]=paths;print(name,id,resource,len(paths),[n for n,t in tex.textures][:4])
(OUTPUT/'opening-sprites.js').write_text('window.OPENING_SPRITES='+json.dumps(sprites,separators=(',',':'))+';\n',encoding='utf8',newline='\n')

# The two opening gestures are billboard animation programs in IRBI overlay 21.
# Match the complete ROM byte sequences, including END; never infer a frame from
# a model's texture count (Belle's padded texture slots are transparent).
overlay=rom.loadArm9Overlays()[21]
gestures={}
for name,signature in {
    'Komor':[(3,2),(12,4),(13,4),(12,2),(3,2),(13,4),(3,2)],
    'Belle':[(3,10),(12,8),(13,25),(14,3),(3,10)],
}.items():
    needle=b''.join(struct.pack('<HH',*step) for step in [*signature,(0x3fff,0)])
    assert overlay.data.count(needle)==1, f'Unexpected IRBI gesture program: {name}'
    offset=overlay.data.index(needle)
    steps=[list(struct.unpack_from('<HH',overlay.data,offset+i*4)) for i in range(len(signature))]
    gestures[name]={'steps':steps,'overlay':21,'offset':offset}
with (OUTPUT/'opening-sprites.js').open('a',encoding='utf8',newline='\n') as output:
    output.write('window.OPENING_GESTURES='+json.dumps(gestures,separators=(',',':'))+';\n')
