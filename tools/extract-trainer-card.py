"""Export original IRBI trainer-card resources selected by overlay111."""
from pathlib import Path
import argparse,hashlib,importlib.util,json,shutil,struct,subprocess,tempfile
import ndspy.rom,ndspy.narc,ndspy.lz10
def sibling(name):
 spec=importlib.util.spec_from_file_location(name,Path(__file__).with_name(name+'.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
def extract(rom,output,apicula):
 assert rom.idCode==b'IRBI';gfx=sibling('extract-menu');events=sibling('extract-original-events')
 def files(p):return [ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName(p)).files]
 f=files('a/0/4/0');assert len(f)==53
 dest=output/'assets/trainer-card';dest.mkdir(parents=True,exist_ok=True);images={};groups={};models={}
 for label,char,screen,palette in [('badges',25,33,0),('grid',25,34,1),('topGrid',25,34,0),('logo',26,35,1),('frontMaleRank0',32,42,15),('frontFemaleRank0',28,41,5),('backMaleRank0',32,39,15),('backFemaleRank0',28,36,5),('frontGridRank0',30,40,15),('avatarMaleSourceRank0',31,43,15),('avatarFemaleSourceRank0',31,44,5)]:
  im=gfx.layer(f,char,screen,palette);name=label+'.png';im.save(dest/name);images[label]={'src':'assets/trainer-card/'+name,'size':list(im.size),'source':{'archive':'a/0/4/0','char':char,'screen':screen,'palette':palette}}
 group={'source':{'archive':'a/0/4/0','char':29,'cells':46,'animation':48,'palette':12},'cells':[],'animations':gfx.animations(f[48])}
 for i,(im,box)in enumerate(gfx.cells(f,29,46,12)):
  name=f'controls-{i}.png';im.save(dest/name);group['cells'].append({'src':'assets/trainer-card/'+name,'origin':box[:2],'size':box[2:]})
 groups['controls']=group
 common=files('a/0/8/3');im=gfx.layer(common,28,29,27);im.save(dest/'commonFrame.png');images['commonFrame']={'src':'assets/trainer-card/commonFrame.png','size':list(im.size),'source':{'archive':'a/0/8/3','char':28,'screen':29,'palette':27}}
 for label,screen,palette in [('avatarMaleRank0',43,15),('avatarFemaleRank0',44,5)]:
  im=gfx.layer(f,31,screen,palette).crop((168,16,248,104));name=label+'.png';im.save(dest/name)
  images[label]={'src':'assets/trainer-card/'+name,'size':[80,88],'position':[168,16],'physicalScreen':'bottom','source':{'archive':'a/0/4/0','char':31,'screen':screen,'palette':palette,'crop':[168,16,80,88],'routine':'overlay111:021c5780 copies BG7 destination tile21,2 width10 height11 from source tile21,2 via ARM9:02041050→02042620'}}
 for model,animation in [(49,51),(50,52)]:
  assert f[model][:4]==b'BMD0'and f[animation][:4]==b'BCA0'
  with tempfile.TemporaryDirectory()as tmp:
   tmp=Path(tmp);m=tmp/'card.nsbmd';a=tmp/'animation.nsbca';m.write_bytes(f[model]);a.write_bytes(f[animation]);converted=tmp/'converted'
   subprocess.run([str(apicula),'convert',str(m),str(a),'-o',str(converted),'-f','glb','--all-animations','--overwrite'],check=True,capture_output=True)
   folder=dest/f'model-{model}';folder.mkdir(exist_ok=True)
   for p in converted.iterdir():shutil.copyfile(p,folder/p.name)
  glb=next(folder.glob('*.glb'));raw=glb.read_bytes();doc=json.loads(raw[20:20+struct.unpack_from('<I',raw,12)[0]])
  models[str(model)]={'src':glb.relative_to(output).as_posix(),'source':{'archive':'a/0/4/0','model':model,'animation':animation},'names':[m.get('name')for m in doc.get('meshes',[])],'animations':[{'name':a.get('name'),'channels':len(a.get('channels',[]))}for a in doc.get('animations',[])]}
 banks=ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files
 data={'source':'IRBI overlay111 text187; NARC40 a/0/4/0; shared NARC83 a/0/8/3','images':images,'groups':groups,'models':models,'labels':events.messages(banks[187]),'limits':['Native card-rank/gender palette selection, character portrait, field positions and 3D transitions not yet reproduced','Models49/50 and animations51/52 are exported without guessing their runtime role or gender mapping','Grid, badges and common frame are native separate layers, not an invented composite card'],'revision':hashlib.sha256(b''.join(p.read_bytes()for p in sorted(dest.rglob('*'))if p.is_file())).hexdigest()[:12]}
 data['screenLayout']={'mainEngine':'top','subEngine':'bottom','powerSwapBit15':1,'source':'overlay111:021c428c reads04000304,021c4292 produces8000,021c4296 OR,021c4298 writes POWCNT1'}
 data['frontLayout']={'physicalScreen':'bottom','cardBackground':6,'gridBackground':5,'avatarBackground':7,'classMale':20,'classFemale':21,'paletteByRank':[[15,5],[16,6],[17,7],[18,8],[19,9],[20,10],[11,11]],'source':'overlay111:021c420c table021c8ca0;021c43c4,021c43d0,021c43dc; avatar BG7 copy021c5780'}
 ov=bytes(rom.loadArm9Overlays([111])[111].data);base=0x21c3b60;table=struct.unpack_from('<I',ov,0x21c5f38-base)[0]
 data['frontLayout']['font']=0
 data['frontLayout']['windows']=[dict(zip(['background','tileX','tileY','width','height','paletteBank'],ov[table-base+i*6:table-base+i*6+6]))for i in range(8)]
 data['frontLayout']['labelWindows']={'indices':[0,1,2,3,4],'textBank187Ids':[0,1,2,3,4],'positionInWindow':[0,0],'source':'overlay111:021c5f6c..021c5fc0; font0 loaded021c4070..76'}
 data['classLabels']=events.messages(banks[191])
 data['frontLayout']['values']={'name':{'window':0,'rightEdgeLocal':128,'yLocal':0,'source':'021c5fde..021c5fe6→021c6ac8'},'trainerClass':{'window':1,'rightEdgeLocal':128,'yLocal':0,'offlineTextBank':191,'offlineTextId':0,'source':'021c608c..021c6102'},'nature':{'window':2,'rightEdgeLocal':128,'yLocal':0,'textBank':187,'textIdOffset':31,'source':'021c612c..021c6198'},'money':{'window':4,'rightEdgeLocal':208,'yLocal':0,'digits':7,'source':'021c602a..021c6048→021c67f4'}}
 data['frontLayout']['dexCount']={'predicate':'seen','regionalUntilNationalDex':True,'source':'overlay10:0216f650 callsARM9:0200d0ac→0200d0cc/0200d0f8 which iterate seen0200d064; writes context+0x24'}
 data['backLayout']={'background':6,'physicalScreen':'bottom','screenTable':[39,36,38,37],'normalScreenMale':39,'normalScreenFemale':36,'source':'overlay111:021c463c→021c45f4 table021c8460','textWindow':6,'rowStep':16,'labelsBank':187,'initialLabelIds':[5,6,7],'flip':{'controlIndex':6,'animation':22,'cell':25,'position':[100,168],'cellOrigin':[2,2],'keys':['LEFT','RIGHT'],'source':'021c4f5a mask0x30 returnsAction3→021c55e4→state5→021c4a3c; object table021c862c'}}
 data['limits']=['Front text fields still need complete tracing','Models49/50 are gym_leader models; not the card body or protagonist portraits','Shared NARC83 palette19/char20/NCER21/NANR24 are controls, not protagonist portraits']
 (output/'trainer-card-assets.js').write_text('window.TRAINER_CARD_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);p.add_argument('--apicula',type=Path,required=True);a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output,a.apicula)
