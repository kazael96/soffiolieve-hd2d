"""Export native Tower films13/14, models, animation sets and recorded cameras."""
import argparse,hashlib,importlib.util,json,math,shutil,struct,subprocess,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'audio-tools/python-packages'))
from irbi_reader import NintendoDSRom,NARC
from nitro_geometry import flatten_glb
projection_spec=importlib.util.spec_from_file_location('tower_native_projection',Path(__file__).with_name('native-film-projection.py'))
projection_module=importlib.util.module_from_spec(projection_spec);projection_spec.loader.exec_module(projection_module)
p=argparse.ArgumentParser(description=__doc__)
for key in ['rom','output','work','apicula']:p.add_argument('--'+key,type=Path,required=True)
a=p.parse_args();a.work.mkdir(parents=True,exist_ok=True);r=NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI';files=NARC(r.getFileByName('a/1/6/0')).files;overlay=r.loadArm9Overlays([203])[203]
def words(at,count):return struct.unpack_from('<'+str(count)+'I',overlay.data,at-overlay.ramAddress)
def first_leaf(pointer,count):
 first=words(pointer,1)[0]
 if not overlay.ramAddress<=first<overlay.ramAddress+len(overlay.data):return list(struct.unpack_from('<'+str(count)+'H',overlay.data,pointer-overlay.ramAddress))
 child,length=words(pointer,2);return first_leaf(child,length)
def dictionary(raw,start):
 count=raw[start+1];entry=start+struct.unpack_from('<H',raw,start+6)[0];size,names=struct.unpack_from('<HH',raw,entry)
 return [(raw[entry+names+i*16:entry+names+(i+1)*16].split(b'\0')[0].decode('ascii'),entry+4+i*size,size)for i in range(count)]
def material_tracks(raw):
 assert raw[:4]==b'BMA0' and raw[0x44:0x48]==b'M\0AM';start=0x44;frames=struct.unpack_from('<H',raw,start+4)[0];alpha={};color={}
 for name,entry,size in dictionary(raw,start+8):
  assert size==20;channels=struct.unpack_from('<5I',raw,entry)
  # These two films use constant channels or one sample per frame only.
  def samples(channel,width):
   if channel&0x20000000:return [channel&0xffff]*frames
   assert channel>>16==frames,hex(channel)
   return [struct.unpack_from('<H' if width==2 else '<B',raw,start+(channel&0xffff)+i*width)[0]for i in range(frames)]
  assert all(c&0x20000000 for c in channels[1:4]),'Animated secondary material channels require a decoder'
  alpha[name]=samples(channels[4],1);assert max(alpha[name])<=31
  if not channels[0]&0x20000000:color[name]=[[((v>>shift)&31)/31 for shift in [0,5,10]]for v in samples(channels[0],2)]
 return alpha,color
def texture_tracks(raw,destination):
 # Pattern structure: scurest/nsbmd_docs, PatternAnimation/Track/Keyframe.
 assert raw[:4]==b'BTP0' and raw[0x44:0x48]==b'M\0PT';start=0x44;frames,nt,np,ot,op=struct.unpack_from('<HBBHH',raw,start+4)
 names=lambda off,count:[raw[start+off+i*16:start+off+(i+1)*16].split(b'\0')[0].decode('ascii')for i in range(count)]
 textures,palettes=names(ot,nt),names(op,np);result={}
 assert np==1,'Multiple pattern palettes require explicit PNG matching'
 for material,entry,size in dictionary(raw,start+12):
  assert size==8;count,unknown,offset=struct.unpack_from('<IHH',raw,entry);keys=[]
  for i in range(count):
   frame,tex,pal=struct.unpack_from('<HBB',raw,start+offset+i*4);assert frame<frames and tex<nt and pal<np
   file=destination/(textures[tex].replace('.','_')+'.png');assert file.exists(),file
   keys.append({'frame':frame,'url':file.relative_to(a.output).as_posix()})
  assert keys[0]['frame']==0 and all(x['frame']<y['frame']for x,y in zip(keys,keys[1:]));result[material]=keys
 return result
result={'source':{'rom':'IRBI','archive':'a/1/6/0','registry':'203:021c175c','overlaySha256':hashlib.sha256(overlay.data).hexdigest()},'films':{}};proof=[]
for id,expected in [(13,[[198,200,199,196,197],[202,201]]),(14,[[206,208,207,204,205],[210,209]])]:
 row=words(0x21c175c+id*20,5);assert row[4]==2;camera_id=struct.unpack_from('<H',overlay.data,row[0]-overlay.ramAddress)[0];assert camera_id==({13:203,14:211}[id]);raw=files[camera_id];frames,kind=struct.unpack_from('<2I',raw);assert kind==0x10100 and len(raw)==8+frames*24
 camera=[list(struct.unpack_from('<6f',raw,8+frame*24))for frame in range(frames)];assert all(math.isfinite(value)for frame in camera for value in frame)
 descriptor=list(words(row[0],9));film={'models':{},'camera':camera,'frames':frames,'perspective':projection_module.projection(r,descriptor),'source':{'cameraMember':camera_id,'cameraSha256':hashlib.sha256(raw).hexdigest(),'modelMembers':[]}}
 # Native203:021c3c00 dispatch[10] ->021bee84, screen brightness task.
 assert words(0x21c3c00+10*4,1)[0]==0x21bee85
 events=[];at=row[1]
 while True:
  event=list(struct.unpack_from('<10i',overlay.data,at-overlay.ramAddress));assert event[0] in [1,2,10,18],event
  if event[0]==18:break
  events.append({'kind':event[0],'frame':event[1],'args':event[2:]});at+=40
  assert len(events)<20
 film['timeline']=events;film['brightness']=[0]*frames
 for event in events:
  if event['kind']!=10:continue
  screen,duration,begin,end=event['args'][:4];assert screen==1 and duration>0 and -16<=begin<=16 and -16<=end<=16
  # Q12 accumulator and arithmetic shift in021beff2-021bf002.
  increment=int(((end-begin)*4096)/duration)
  for frame in range(event['frame'],frames):
   elapsed=frame-event['frame'];film['brightness'][frame]=end if elapsed>=duration else (begin*4096+increment*elapsed)//4096
 film['source']['timelineAddress']=hex(row[1]);film['source']['brightnessHandler']='203:021bee84;021beec4;021befb4'
 for i,key in enumerate(['stage','dragon']):
  pointer,count=words(row[3]+i*8,2);leaf=first_leaf(pointer,count);assert leaf==expected[i],(id,key,leaf);film['source']['modelMembers'].append(leaf)
  work=a.work/str(id)/key;work.mkdir(parents=True,exist_ok=True);inputs=[]
  for member in leaf:
   file=work/(str(member)+'.bin');file.write_bytes(files[member]);inputs.append(str(file.resolve()))
  converted=work/'converted';run=subprocess.run([str(a.apicula.resolve()),'convert',*inputs,'-o',str(converted.resolve()),'-f','glb','--all-animations','--overwrite'],check=True,capture_output=True);(work/'convert.log').write_bytes(run.stdout+run.stderr)
  destination=a.output/'assets/opelucid/cinematics'/str(id)/key;destination.mkdir(parents=True,exist_ok=True)
  for file in converted.iterdir():shutil.copyfile(file,destination/file.name)
  glb=next(converted.glob('*.glb'));b=glb.read_bytes();doc=json.loads(b[20:20+struct.unpack_from('<I',b,12)[0]]);private=work/'proof';private.mkdir(exist_ok=True);model,_=flatten_glb(glb,'proof',private,'proof');verts=[g['verts'] for g in model['groups']]
  film['models'][key]={'url':(destination/glb.name).relative_to(a.output).as_posix(),'members':leaf,'sha256':hashlib.sha256(b).hexdigest(),'maxJoints':max([len(skin['joints'])for skin in doc.get('skins',[])],default=0),'bounds':[[min(v for g in verts for v in g[k::11]),max(v for g in verts for v in g[k::11])]for k in range(3)]}
  if key=='stage':
   alpha,color=material_tracks(files[leaf[4]]);film['materialAlpha']={key:alpha};film['materialColor']={key:color};film['materialTextures']={key:texture_tracks(files[leaf[1]],destination)}
  proof.append({'film':id,'part':key,**film['models'][key],'animations':[{'name':v.get('name'),'channels':len(v.get('channels',[])),'propertyChannels':[v.get('target')for v in v.get('extensions',{}).get('EXT_property_animation',{}).get('channels',[])]}for v in doc.get('animations',[])]})
 result['films'][id]=film;print('Native film',id,frames,'frames',[(k,v['maxJoints'])for k,v in film['models'].items()],flush=True)
(a.output/'opelucid-cinematics-data.js').write_text('window.OPELUCID_CINEMATICS='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8',newline='\n');(a.work/'report.json').write_text(json.dumps(proof,indent=2)+'\n',encoding='utf8')
