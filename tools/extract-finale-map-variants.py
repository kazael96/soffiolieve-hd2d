"""Export native Champion stairs and broken throne wall, with collision planes."""
import argparse,base64,hashlib,json,math,struct,subprocess
from pathlib import Path
from types import SimpleNamespace
from irbi_reader import NintendoDSRom,NARC
from nitro_geometry import flatten_glb

def main():
    p=argparse.ArgumentParser(description=__doc__)
    for key in ['rom','source','output','work','apicula']:p.add_argument('--'+key,type=Path,required=True)
    a=p.parse_args();r=NintendoDSRom.fromFile(a.rom)
    if r.idCode!=b'IRBI':raise ValueError('Expected IRBI')
    a.work.mkdir(parents=True,exist_ok=True);a.output.mkdir(parents=True,exist_ok=True);cache={}
    def narc(name):
        if name not in cache:cache[name]=NARC(r.getFileByName(name)).files
        return cache[name]
    def read(file):return json.JSONDecoder().raw_decode((a.source/file).read_text(encoding='utf8').split('=',1)[1])[0]
    def write(file,var,data):(a.output/file).write_text('window.'+var+'='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
    helpers=Path(__file__).with_name('extract-castelia.py').read_text(encoding='utf8');helpers=helpers[helpers.index('def convert('):helpers.index('for zone in selected:',helpers.index('def convert('))]
    helpers=helpers.replace("f'ca-","f'fn-variant-").replace("'assets/castelia'","'assets/finale/variants'")
    assets=a.output/'assets/finale/variants';assets.mkdir(parents=True,exist_ok=True);models={};textures={}
    namespace=dict(a=SimpleNamespace(work_dir=a.work,apicula=a.apicula),assets=assets,models=models,textures=textures,r=r,narc=narc,struct=struct,subprocess=subprocess,flatten_glb=flatten_glb,hashlib=hashlib,json=json,math=math)
    exec(compile(helpers,'reviewed-native-map-helpers','exec'),namespace)
    overlay=r.loadArm9Overlays([10])[10];table=narc('a/0/1/0')[0];surfaces=read('finale-surface-data.js');variants={};families={}
    for zone,family,index,base,matrix,event,work,value,key in [(144,'leagueHall',37,125,218,1,16434,548,'castleStairs'),(278,'castleThrone',42,172,212,3,16436,4617,'brokenWall')]:
        row=struct.unpack_from('<HBB5HH',table,index*16)
        if row[:5]!=(base,1,event+3,base,matrix):raise ValueError('Native map replacement row changed')
        condition=struct.unpack_from('<BBHH',overlay.data,0x2170ea0-overlay.ramAddress+event*6)
        if condition!=(event+3,event,work,value):raise ValueError('Native map replacement condition changed')
        headers=narc('a/0/1/2')[0];header=struct.unpack_from('<BBHHHHH4HHHHHHHHHiii',headers,zone*48)
        if header[3]!=base:raise ValueError('Wrong source field matrix')
        area=r.getFileByName('a/0/1/3')[header[2]*10:header[2]*10+10];bundle,terrain=struct.unpack_from('<HH',area);outdoor=area[6]==1
        raw_matrix=narc('a/0/0/9')[matrix];width,depth=struct.unpack_from('<HH',raw_matrix,4);scene={'instances':[],'permissionGrids':[]};proof=[];surface=[]
        for z in range(depth):
            for x in range(width):
                member=struct.unpack_from('<I',raw_matrix,8+(z*width+x)*4)[0]
                if member==0xffffffff:continue
                land=narc('a/0/0/8')[member]
                if land[:2] not in [b'WB',b'GC']:raise ValueError('Native variant surface unavailable')
                u32=lambda at:struct.unpack_from('<I',land,at)[0]
                model='fn-variant-map-'+str(member);offset=u32(4)
                if model not in models:namespace['convert'](land[offset:offset+u32(offset+8)],narc('a/0/1/4')[terrain],model)
                px,pz=x*32,z*32;scene['instances'].append(dict(model=model,x=px,y=0,z=pz,rotation=0));scene['permissionGrids'].append(dict(x=px,z=pz,bytes=list(land[u32(8):u32(12)])))
                at=u32(16) if offset==24 else u32(12)
                for i in range(u32(at)):
                    ox,oy,oz,rotation,hi,lo=struct.unpack_from('<iiiHBB',land,at+4+i*16);pid=hi<<8|lo
                    scene['instances'].append(dict(nativeModelId=pid,model=namespace['prop'](pid,bundle,outdoor),x=px+ox/65536,y=oy/65536,z=pz-oz/65536,rotation=rotation*math.tau/65536))
                layers=[]
                for layer in range(2 if land[:2]==b'GC' else 1):
                    begin,end=struct.unpack_from('<II',land,8+layer*4);grid=land[begin:end];w,h=struct.unpack_from('<HH',grid)
                    if not w or not h or len(grid)<4+w*h*8:raise ValueError('Truncated variant collision grid')
                    layers.append(base64.b64encode(grid).decode('ascii'))
                surfaces['grids'][str(member)]=layers;surface.append(dict(member=member,x=px,y=0,z=pz));proof.append(dict(member=member,sha256=hashlib.sha256(land).hexdigest()))
        if family not in families:families[family]=read('finale-'+family+'-assets.js')
        families[family].setdefault('variantScenes',{}).setdefault(str(zone),{})[key]=scene
        surface_zone=zone*10+1;surfaces['scenes'][str(surface_zone)]=surface
        variants[str(zone)]=dict(event=event,work=work,value=value,key=key,surfaceZone=surface_zone,scene={'permissionGrids':scene['permissionGrids']},source=dict(replacementRow=index,condition=list(condition),baseMatrix=base,matrix=matrix,matrixSHA256=hashlib.sha256(raw_matrix).hexdigest(),lands=proof))
    for family,data in families.items():
        used={instance['model'] for variants_for_zone in data.get('variantScenes',{}).values() for variant in variants_for_zone.values() for instance in variant['instances']}
        added={key:model for key,model in models.items() if key in used}
        images={group['texture'] for model in added.values() for group in model.get('groups',[]) if group.get('texture')}
        data['models'].update(added);data['textures'].update({key:texture for key,texture in textures.items() if key in images});write('finale-'+family+'-assets.js','FINALE_PART_ASSETS',data)
    write('finale-map-variants-data.js','FINALE_MAP_VARIANTS',variants);write('finale-surface-data.js','FINALE_SURFACE_DATA',surfaces)
    print('Exported2 native field variants with original geometry, permission grids and height planes into '+str(a.output))

if __name__=='__main__':main()
