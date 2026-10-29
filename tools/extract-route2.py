"""Extract the next IRBI chapter from the user-supplied ROM; never copy the ROM.

New opcode operand counts checked in overlays 10/21. Matrix 0 contains a
u32 land grid followed by a u32 zone grid; area records are ten bytes.
"""
import argparse, hashlib, importlib.util, json, math, struct, subprocess
from pathlib import Path
import ndspy.rom, ndspy.narc, ndspy.texture, ndspy.color
from nitro_geometry import flatten_glb

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--rom',type=Path,required=True)
p.add_argument('--apicula',type=Path,required=True)
p.add_argument('--output',type=Path,required=True)
p.add_argument('--work-dir',type=Path,required=True)
a=p.parse_args(); a.output.mkdir(parents=True,exist_ok=True); a.work_dir.mkdir(parents=True,exist_ok=True)
r=ndspy.rom.NintendoDSRom.fromFile(a.rom)
assert r.idCode==b'IRBI'
cache={}
def narc(path):
    if path not in cache:cache[path]=ndspy.narc.NARC(r.getFileByName(path)).files
    return cache[path]
spec=importlib.util.spec_from_file_location('events',Path(__file__).with_name('extract-original-events.py'))
ev=importlib.util.module_from_spec(spec);spec.loader.exec_module(ev)
table=json.loads(Path(__file__).with_name('irbi-field-commands.json').read_text())
table.update({str(k):{'name':name,'args':['u16']*n} for k,name,n in [
    (190,'MapChangeFly',4),(584,'UnknownBW0248',2),
    (58,'MsgAt',4),(59,'MsgAtClose',1),(140,'CallBattleBlackout',0)]})
table['178']={'name':'MenuCreate','args':['u8','u8','u16','u8','u16']}
table['175']={'name':'MenuAdd','args':['u16']*3}
table['176']={'name':'MenuShow','args':[]}
table['165']={'name':'BGMTrackGet','args':['u16','u16']}
table['163']={'name':'BGMTrackEnable','args':['u16']}
table['164']={'name':'BGMTrackDisable','args':['u16']}
table['382']={'name':'UnknownBW017E','args':['u16']}
def write(name,variable,data):
    (a.output/name).write_text('window.'+variable+'='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
table['227']={'name':'EnableRunningShoes','args':[]} # IRBI overlay10 0215AF68, no operands.
zones={};scripts={};texts={};headers=narc('a/0/1/2')[0]
selected=[319,6,8]
for zone in selected:
    v=struct.unpack_from('<BBHHHHH4HHHHHHHHHiii',headers,zone*48)
    raw=narc('a/0/5/7')[v[4]];entries=0
    while struct.unpack_from('<H',raw,entries*4)[0]!=0xfd13:entries+=1
    try:scripts[str(v[4])]=ev.program(raw,list(range(9)) if zone==6 else list(range(entries)),table)
    except Exception as error:raise ValueError(f'Zone {zone}: {error}') from error
    init=[];on_enter=[];raw=narc('a/0/5/7')[v[4]+1];pos=0
    while struct.unpack_from('<H',raw,pos)[0]:
        mode,entry=struct.unpack_from('<HI',raw,pos);pos+=6
        if mode==1:
            q=pos+entry
            while struct.unpack_from('<H',raw,q)[0]:
                var,value,event_id=struct.unpack_from('<HHH',raw,q);q+=6
                on_enter.append({'var':var,'value':value,'entry':event_id-1})
        else:init.append({'mode':mode,'entry':entry-1})
    zones[str(zone)]={'zone':zone,'script':v[4],'text':v[6],'music':v[7],
        'init':init,'onEnter':on_enter,**ev.entities(narc('a/1/2/5')[v[12]])}
    texts[str(v[6])]=ev.messages(narc('a/0/0/3')[v[6]])
assets=a.output/'assets/route2';assets.mkdir(parents=True,exist_ok=True)
texts['346']=ev.messages(narc('a/0/0/3')[346])
models={};textures={};scenes={}
def convert(model,texture,key):
    folder=a.work_dir/key;folder.mkdir(exist_ok=True)
    (folder/'model.nsbmd').write_bytes(model);(folder/'texture.nsbtx').write_bytes(texture)
    subprocess.run([str(a.apicula.resolve()),'convert','-f=glb',str(folder/'model.nsbmd'),str(folder/'texture.nsbtx'),'-o',str(folder/'converted'),'--overwrite'],check=True,capture_output=True)
    file=next((folder/'converted').glob('*.glb'))
    m,t=flatten_glb(file,key,assets,'assets/route2');models[key]=m;textures.update(t)
def prop(pid,bundle,outdoor=False):
    if pid in (75,83):bundle=25 # Unique source bundle for these shared props.
    key=f'route-prop-{outdoor}-{bundle}-{pid}'
    if key in models:return key
    b=narc('a/2/2/9' if outdoor else 'a/2/3/0')[bundle];count=b[2]//2;offsets=struct.unpack_from('<'+str(count*2)+'I',b,4)
    matches=[i for i in range(count) if struct.unpack_from('<H',b,offsets[i])[0]==pid]
    if not outdoor and not matches and bundle not in (1,7,25):return prop(pid,1) # Shared indoor furniture.
    if not outdoor and not matches and bundle==1:return prop(pid,7)
    if not matches and outdoor:
        for shared in [0,1]:
            if shared==bundle:continue
            b2=narc('a/2/2/9')[shared];n2=b2[2]//2;o2=struct.unpack_from('<'+str(n2*2)+'I',b2,4)
            if any(struct.unpack_from('<H',b2,o2[i])[0]==pid for i in range(n2)):return prop(pid,shared,True)
    assert matches,(pid,bundle)
    off=offsets[count+matches[0]];length=struct.unpack_from('<I',b,off+8)[0]
    convert(b[off:off+length],narc('a/1/7/6' if outdoor else 'a/1/7/7')[bundle],key);return key
for zone in selected:
    # Extract only the selected outdoor cells, preserving the shared origin.
    v=struct.unpack_from('<BBHHHHH4HHHHHHHHHiii',headers,zone*48)
    matrix=narc('a/0/0/9')[v[3]];w,h=struct.unpack_from('<HH',matrix,4)
    area=r.getFileByName('a/0/1/3')[v[2]*10:v[2]*10+10]
    bundle,terrain=struct.unpack_from('<HH',area)
    scene={'instances':[],'permissionGrids':[]}
    for row in range(h):
        for col in range(w):
            member=struct.unpack_from('<I',matrix,8+(row*w+col)*4)[0]
            if member==0xffffffff:continue
            if v[3]==0 and struct.unpack_from('<I',matrix,8+(w*h+row*w+col)*4)[0]!=zone:continue
            land=narc('a/0/0/8')[member];u32=lambda pos:struct.unpack_from('<I',land,pos)[0]
            off=u32(4);key=f'acc-map-{member}';x,z=(col*32+16-784,row*32+16-752) if v[3]==0 else (col*32,row*32)
            if key not in models:convert(land[off:off+u32(off+8)],narc('a/0/1/4')[terrain],key)
            scene['instances'].append({'model':key,'x':x,'y':0,'z':z,'rotation':0})
            scene['permissionGrids'].append({'x':x,'z':z,'bytes':list(land[u32(8):u32(12)])})
            at=u32(12)
            for i in range(u32(at)):
                px,py,pz,rot,hi,lo=struct.unpack_from('<iiiHBB',land,at+4+i*16)
                scene['instances'].append({'model':prop((hi<<8)|lo,bundle,v[3]==0),'x':x+px/65536,'y':py/65536,'z':z-pz/65536,'rotation':rot*math.tau/65536})
    scenes[str(zone)]=scene
ndspy.color.prepareLUTs();sprites={};st=narc('a/0/4/8')[0];fmt=struct.Struct('<HBBBBBBBBBBBbbbHHHHHH')
ids=sorted({x['model'] for key,zone in zones.items() for x in zone['actors'] if x['model']<8192})
for mid in ids:
    rec=fmt.unpack_from(st,4+mid*fmt.size);tex=ndspy.texture.NSBTX(narc('a/0/4/9')[rec[15]])
    pal=tex.palettes[0][1];pal.colors=[ndspy.color.pack(*c) for c in pal.colors];paths=[]
    for i,(_,t) in enumerate(tex.textures):
        t.isColor0Transparent=True;file=assets/f'actor-{mid}-{i}.png';t.renderAsImage(pal).save(file)
        paths.append('assets/route2/'+file.name+'?v='+hashlib.sha256(file.read_bytes()).hexdigest()[:12])
    sprites[str(mid)]=paths
write('route2-assets.js','ROUTE2_ASSETS',{'models':models,'textures':textures,'scenes':scenes,'sprites':sprites})
write('route2-events.js','ROUTE2_EVENTS',{'source':'IRBI','zones':zones,'scripts':scripts,'texts':texts})
print('Extracted',len(zones),'zones,',len(models),'models,',len(textures),'textures,',len(ids),'actors')
