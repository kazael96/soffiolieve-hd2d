"""IRBI Clay Gym lifts: original placement/collision tables and animated models.

Only the separate mistralton-gym-data.js catalog and assets are written. The
shared chapter catalog is never modified. Fixed-point tables are from overlay43;
the grid collision at the mine floor remains the original map524 permission grid.
"""
from pathlib import Path
import argparse, hashlib, json, struct, subprocess, shutil
try:
    import ndspy.rom, ndspy.narc
except ModuleNotFoundError:
    from irbi_reader import install
    install()
    import ndspy.rom, ndspy.narc
from nitro_geometry import flatten_glb

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('rom',type=Path);p.add_argument('output',type=Path)
p.add_argument('--apicula',type=Path,required=True);p.add_argument('--work-dir',type=Path,required=True)
a=p.parse_args();r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
overlays=r.loadArm9Overlays([43,44]);o=overlays[43];f=ndspy.narc.NARC(r.getFileByName('a/1/3/8')).files
def rows(addr,count,width):return [list(struct.unpack_from('<'+'i'*width,o.data,addr-o.ramAddress+i*width*4))for i in range(count)]
liftrows=rows(0x21f4360,6,6);staticrows=rows(0x21f43f0,8,5)
assert [(v[0],v[1],v[2],v[3])for v in liftrows]==[(18,24,5,3),(18,20,5,3),(8,24,5,3),(13,24,5,3),(8,20,5,3),(14,20,3,3)]
data={'source':'IRBI overlay43:021f4360/021f43f0/021f4220 + a/1/3/8',
      'overlaySha256':hashlib.sha256(o.data).hexdigest(),'zone':97,'antechamber':98,
      'lifts':[{'x':v[0],'z':v[1],'width':v[2],'depth':v[3],'heights':[v[4]/65536,v[5]/65536]}for v in liftrows],
      'bridges':[{'x':v[0],'z':v[1],'width':v[2],'depth':v[3],'height':v[4]/65536}for v in staticrows],
      'origins':[[n/65536 for n in v]for v in rows(0x21f4238,6,3)],
      'mainOrigin':[n/65536 for n in rows(0x21f422c,1,3)[0]],
      'barrierOrigin':[n/65536 for n in rows(0x21f4220,1,3)[0]],
      'antechamberOrigin':[n/65536 for n in struct.unpack_from('<3i',overlays[44].data,0x21f38fc-overlays[44].ramAddress)],
      'initialStates':[0,0,0,0,0,0],'initialFlags':[0,1,0,1,1,0],'texturePolarity':rows(0x21f4208,6,1),
      'tickRate':30,'liftSpeed':7.5,'deepLiftSpeed':15,'mainSpeed':3.75,'floorHeight':-59,
      'models':{},'geometry':{},'textures':{},'hashes':{str(i):hashlib.sha256(b).hexdigest()for i,b in enumerate(f)},
      'adaptation':'Original geometry, tables, texture/joint tracks. Continuous browser motion uses native 30Hz speeds; DS camera shake is adapted.'}
data['texturePolarity']=[v[0]for v in data['texturePolarity']]
dest=a.output/'assets/mistralton/gym';dest.mkdir(parents=True,exist_ok=True)
for key,member,animations in [('lift',0,[3,4]),('main',1,[5,6]),('barrier',2,[7])]:
    work=a.work_dir/key;work.mkdir(parents=True,exist_ok=True);inputs=[]
    for i in [member,*animations]:
        file=work/f'{i}.bin';file.write_bytes(f[i]);inputs.append(str(file.resolve()))
    converted=work/'converted'
    subprocess.run([str(a.apicula.resolve()),'convert',*inputs,'-o',str(converted.resolve()),'-f','glb','--all-animations','--overwrite'],check=True,capture_output=True)
    for file in converted.iterdir():shutil.copyfile(file,dest/file.name)
    glb=next(converted.glob('*.glb'));prefix='mt-gym-'+key
    model,textures=flatten_glb(glb,prefix,a.output/'assets/mistralton','assets/mistralton')
    data['geometry'][prefix]=model;data['textures'].update(textures)
    data['models'][key]={'url':'assets/mistralton/gym/'+glb.name,'model':prefix,'members':[member,*animations]}
    raw=glb.read_bytes();length=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+length])
    data['models'][key]['animations']=[v.get('name','')for v in doc.get('animations',[])]
    data['models'][key]['frames']=[round(max((doc['accessors'][v['input']].get('max',[0])[0]for v in animation['samplers']),default=0)*60)for animation in doc.get('animations',[])]
(a.output/'mistralton-gym-data.js').write_text('window.MISTRALTON_GYM_DATA='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
(a.work_dir/'extraction-report.json').write_text(json.dumps({k:v for k,v in data.items()if k not in ['geometry','textures']},indent=2),encoding='utf8')
print('Exported Clay Gym:6 lifts,8 fixed bridges,3 native models; floor',data['floorHeight'])
