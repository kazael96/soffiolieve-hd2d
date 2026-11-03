"""Extract IRBI Chargestone dynamic crystals and original placement tables.

The magnetic destinations are behavior50 in the original map permission grids;
they are deliberately not hand-authored in this catalog. No shared asset file
is modified. Model80/BTP102 is the separate transient floor electricity effect;
its original texture-pattern records are exported directly alongside the BCA.
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
a=p.parse_args();rom=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert rom.idCode==b'IRBI'
overlays=rom.loadArm9Overlays([21,51]);o=overlays[51];f=ndspy.narc.NARC(rom.getFileByName('a/0/7/5')).files
def table(addr):
    result={}
    for i in range(3):
        zone,count,ptr=struct.unpack_from('<3I',o.data,addr-o.ramAddress+i*12)
        result[zone]=[list(struct.unpack_from('<3i',o.data,ptr-o.ramAddress+j*12))for j in range(count)]
    return result
data={'source':'IRBI overlay51:021f3c94/021f3cdc; overlay21:021c8d4c; a/0/7/5',
      'overlaySha256':hashlib.sha256(o.data).hexdigest(),'big':table(0x21f3c94),'mini':table(0x21f3cdc),
      'tickRate':30,'units':16,'origin':[16,16],'magneticBehavior':50,'maxScan':32,
      'movementFrames':{'far':16,'middle':8,'near':4},'bigOffset':[0,-.25,.15625],
      'nativeHandlers':{'initialize':'021f3610','direction':'021f3784','push':'021f3838','motion':'021f38d8','failure':'021f3994','scan':'021f3aa4','anchored':'021f3b78','magneticBehavior':'021ab2f8','movementDirections':'02197d7c'},
      'models':{},'geometry':{},'textures':{},'hashes':{str(i):hashlib.sha256(f[i]).hexdigest()for i in [78,79,80,81,102,120,121,122,123]},
      'adaptation':'Native positions, collision behavior50, 32-cell scan and16/8/4 frame tile movement at30Hz; continuous browser positions interpolate those original steps. Mini visual height is native tableY+0.5.'}
assert [len(v)for v in data['big'].values()]==[12,5,3]
assert [len(v)for v in data['mini'].values()]==[14,11,11]
# Original billboard programs: actor148 uses set19, animation1 selected by
# movement171. The motion handler's22-frame wait equals the sum of these holds.
web=overlays[21];table=327760+19*8;ptr,count=struct.unpack_from('<II',web.data,table);assert count==2
programs=[]
for i in range(count):
    address=struct.unpack_from('<I',web.data,ptr-web.ramAddress+i*4)[0];steps=[];j=0
    while True:
        frame,hold=struct.unpack_from('<HH',web.data,address-web.ramAddress+j*4);j+=1
        if frame==16383:break
        assert frame<4 and hold>0;steps.append([frame,hold])
    programs.append({'address':hex(address),'steps':steps})
assert programs[0]['steps']==[[0,2]] and programs[1]['steps']==[[0,4],[1,6],[2,6],[3,6]]
data['web']={'zone':194,'model':148,'animationSet':19,'table':hex(web.ramAddress+table),'programs':programs,'frames':22,'movement':171,'initialize':'02199bc8','tick':'02199be4','motionTable':'021d41c4','spriteArchive':'a/0/4/9','spriteMember':145,'spriteSha256':hashlib.sha256(ndspy.narc.NARC(rom.getFileByName('a/0/4/9')).files[145]).hexdigest()}
dest=a.output/'assets/mistralton/puzzles';dest.mkdir(parents=True,exist_ok=True)
for key,member,animations in [('big',78,[120,121]),('mini',79,[122,123]),('shadow',81,[]),('floor',80,[102])]:
    work=a.work_dir/key;work.mkdir(parents=True,exist_ok=True);inputs=[]
    for i in [member,*animations]:
        file=work/f'{i}.bin';file.write_bytes(f[i]);inputs.append(str(file.resolve()))
    converted=work/'converted'
    result=subprocess.run([str(a.apicula.resolve()),'convert',*inputs,'-o',str(converted.resolve()),'-f','glb','--all-animations','--overwrite'],check=True,capture_output=True)
    (work/'apicula.log').write_bytes(result.stdout+result.stderr)
    for file in converted.iterdir():shutil.copyfile(file,dest/file.name)
    glb=next(converted.glob('*.glb'));prefix='mt-crystal-'+key
    model,textures=flatten_glb(glb,prefix,a.output/'assets/mistralton','assets/mistralton')
    data['geometry'][prefix]=model;data['textures'].update(textures)
    raw=glb.read_bytes();length=struct.unpack_from('<I',raw,12)[0];doc=json.loads(raw[20:20+length])
    data['models'][key]={'url':'assets/mistralton/puzzles/'+glb.name,'model':prefix,'members':[member,*animations],
      'animations':[v.get('name','')for v in doc.get('animations',[])],
      'frames':[round(max((doc['accessors'][v['input']].get('max',[0])[0]for v in animation['samplers']),default=0)*60)for animation in doc.get('animations',[])]}
    if key=='floor':
        # Apicula preserves BTP textures but does not export texture-index tracks.
        # Read the original PAT material record instead of fabricating a cycle.
        from PIL import Image
        b=f[102];base=b.index(b'M\x00PT');frames,num_tex,num_pal,texofs,palofs=struct.unpack_from('<HBBHH',b,base+4)
        dictionary=base+12;entries=dictionary+struct.unpack_from('<H',b,dictionary+6)[0]
        count,flags,ratio,keyofs=struct.unpack_from('<4H',b,entries+4)
        names=[b[base+texofs+i*16:base+texofs+(i+1)*16].split(b'\0')[0].decode('ascii')for i in range(num_tex)]
        keys=[]
        for i in range(count):
            frame,tex,palette=struct.unpack_from('<HBB',b,base+keyofs+i*4)
            assert tex==palette and tex<num_tex
            stem=names[tex].replace('.','_');texture=prefix+'-'+stem;path=a.output/'assets/mistralton'/(texture+'.png')
            shutil.copyfile(converted/(stem+'.png'),path)
            with Image.open(path)as im:width,height=im.size
            data['textures'][texture]={'src':'assets/mistralton/'+path.name,'w':width,'h':height}
            keys.append({'frame':frame,'texture':texture,'nativeTexture':names[tex]})
        assert frames==15 and [k['frame']for k in keys]==[0,1,4,7,10]
        data['floor']={'behavior':48,'frames':frames,'keys':keys,'handler':'overlay10:0216379c/021637b0 -> overlay21:021c8e60','predicate':'overlay21:021ab2ec','sound':1698,'soundHandler':'overlay21:021c8eb4/021c8eb6','patternSha256':hashlib.sha256(b).hexdigest()}
(a.output/'mistralton-puzzle-data.js').write_text('window.MISTRALTON_PUZZLE_DATA='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
(a.work_dir/'extraction-report.json').write_text(json.dumps({k:v for k,v in data.items()if k not in ['geometry','textures']},indent=2),encoding='utf8')
print('Exported native crystals:20 physical,36 decorative,4 original models,4 joint animations and original15-frame floor BTP')
