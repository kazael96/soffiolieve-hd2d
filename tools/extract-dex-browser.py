"""Export IRBI's original list-Pokedex graphics using overlay209 load indices."""
from pathlib import Path
import argparse,hashlib,importlib.util,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10
from PIL import Image

def module(name,path):
 spec=importlib.util.spec_from_file_location(name,path);out=importlib.util.module_from_spec(spec);spec.loader.exec_module(out);return out

def extract(rom,output):
 assert rom.idCode==b'IRBI'
 menu=module('menu',Path(__file__).with_name('extract-menu.py'));events=module('events',Path(__file__).with_name('extract-original-events.py'))
 files=lambda name:[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName(name)).files]
 f=files('a/1/5/9');o=rom.loadArm9Overlays([209])[209];ov=bytes(o.data)
 assert o.ramAddress==0x021bc140 and len(ov)==10464
 # Original initializer0x021BC474 loads palette48/49, characters56..59,
 # screen62->BG3, screen63->BG7. Row states66..68 are supplied to frame_list.
 assert ov[0x021bc486-o.ramAddress:0x021bc488-o.ramAddress]==b'\x30\x21'
 dest=output/'assets/dex-browser';dest.mkdir(parents=True,exist_ok=True);images={}
 def image(label,char,screen,palette,crop=None):
  im=menu.layer(f,char,screen,palette)
  if crop:im=im.crop(crop)
  else:im=im.crop((0,0,256,192))
  name=label+'.png';im.save(dest/name);images[label]={'src':'assets/dex-browser/'+name,'size':list(im.size),'source':{'archive':'a/1/5/9','char':char,'screen':screen,'palette':palette,'crop':list(crop)if crop else[0,0,256,192]}}
 # Native209 clears POWCNT1.bit15: sub engine on physical top, main bottom.
 image('upperBackground',57,63,49);image('lowerBackground',56,62,48)
 for label,screen in [('rowCaught',66),('rowSeen',67),('rowUnknown',68)]:image(label,58,screen,48,(0,0,160,24))
 image('lowerDecoration',59,69,49,(0,0,256,48))
 groups={}
 for label,char,cer,anr,palette in [('listObjects',55,61,71,51)]:
  group={'source':{'archive':'a/1/5/9','char':char,'cells':cer,'animation':anr,'palette':palette,'nativeLoader':'overlay209 0x021bd8f0..0x021bd938'},'cells':[],'animations':menu.animations(f[anr])}
  for i,(im,box)in enumerate(menu.cells(f,char,cer,palette)):
   name=f'{label}-{i}.png';im.save(dest/name);group['cells'].append({'src':'assets/dex-browser/'+name,'origin':box[:2],'size':box[2:]})
  groups[label]=group
 banks=files('a/0/0/2');labels=events.messages(banks[276]);names=events.messages(banks[70])
 personal=files('a/0/1/6');assert len(personal[668])==1300
 regional=list(struct.unpack('<650H',personal[668]))
 # The table is copied directly by209 into overlay67's frame_list constructor.
 address=struct.unpack_from('<I',ov,0x021bca50-o.ramAddress)[0];config=ov[address-o.ramAddress:address-o.ramAddress+40]
 assert address==0x021be6ac and config[:8]==bytes([2,6,12,0,20,3,7,0])
 data={'source':'Italian Black IRBI, list overlay209 + frame_list overlay67','images':images,'groups':groups,'labels':labels,'names':names,'layout':{'screen':[256,192],'visibleRows':7,'rowX':96,'rowY':0,'rowWidth':160,'rowHeight':24,'rowSourceRectangle':[0,0,160,24],'frameListConfigAddress':hex(address),'frameListConfigBytes':list(config),'scrollThumbX':252,'scrollThumbYRange':[12,156],'rowStateScreens':{'caught':66,'seen':67,'unknown':68}},'provenance':{'overlay':209,'base':hex(o.ramAddress),'sha256':hashlib.sha256(ov).hexdigest(),'bgInitializer':'0x021bc474','paletteLoads':['0x021bc492','0x021bc4a4'],'rowTemplateLoader':'0x021bc930..0x021bc960','labelsBank':276,'namesBank':70,'font':'existing original font0 assets from a/0/2/3'},'limitations':['Native background/resource indices and frame size/origin are verified; dynamic text-window placement and exact scroll easing remain runtime work.','Row state names follow the visible Poké Ball/empty-circle components; seen/caught logic belongs to save data.','Object cell coordinates and NANR timing are retained; dynamic object placement is not certified.']}
 data['revision']=hashlib.sha256(b''.join(p.read_bytes()for p in sorted(dest.glob('*.png')))).hexdigest()[:12]
 data['regionalNumbers']=regional
 order=struct.unpack('<649H',files('a/0/9/8')[4]);data['regionalOrder']=[sid for sid in order if regional[sid]!=999]
 assert len(data['regionalOrder'])==156 and data['regionalOrder'][:2]==[494,495]
 data['images']['mainBackground']=images['lowerBackground'];data['images']['subBackground']=images['upperBackground']
 data['layout'].update({'physicalTopEngine':'sub','physicalBottomEngine':'main','mainBG':2,'subBG':6,'rowsPerScreen':8,'physicalTopRelativeStart':-8,'physicalBottomRelativeStart':0,'listLengthRule':'last ordered index seen or caught + 1; includes unknown slots before that index; zero if none'})
 data['provenance']['lcdSetter']='overlay209 0x021bcbca r0=0 -> 0x020435bc clears POWCNT1.bit15'
 data['provenance']['listLengthRoutine']='overlay212 0x021c9188'
 data['provenance']['regionalOrderSource']='a/0/9/8:4 filtered by regionalNumber!=999, overlay212 0x021c966c'
 data['provenance']['regionalNumberSource']='a/0/1/6:668, uint16 species-indexed'
 data['provenance']['caughtPredicate']='0x0200ced4'
 data['provenance']['seenPredicate']='0x0200d064'
 data['objectRoles']={'searchButton':0,'orderButton':1,'scrollThumb':2,'scrollTrack':3,'searchButtonHighlighted':4,'orderButtonHighlighted':5,'portraitFrame':6}
 # The detail module's Italian tab captions are actual sprite pixels.
 detail=rom.loadArm9Overlays([208])[208];db=bytes(detail.data);assert detail.ramAddress==0x021bc140
 ptr=struct.unpack_from('<I',db,0x021bde9c-detail.ramAddress)[0];assert ptr==0x021c8340
 records=[list(struct.unpack_from('<IhhIII',db,ptr-detail.ramAddress+i*20))for i in range(9)]
 expected={7:(48,168,32),8:(80,168,32),9:(112,168,32),10:(144,168,32)}
 assert all(tuple(row[1:4])==expected[row[0]]for row in records if row[0]in expected)
 all_cells=menu.cells(f,13,27,3);selected=[*range(1,9),25,26,27,28];mapping={c:i for i,c in enumerate(selected)}
 g={'source':{'archive':'a/1/5/9','char':13,'cells':27,'animation':44,'palette':3,'nativeLoader':'overlay208 0x021bdc98','buttonTable':'0x021c8340'},'cells':[],'nativeCellToIndex':mapping,'animations':[]}
 for native_cell in selected:
  im,box=all_cells[native_cell];name=f'detail-control-{native_cell}.png';im.save(dest/name);g['cells'].append({'src':'assets/dex-browser/'+name,'origin':box[:2],'size':box[2:],'nativeCell':native_cell})
 for index,a in enumerate(menu.animations(f[44])):
  if all(frame[0]in mapping for frame in a['frames']):g['animations'].append({**a,'nativeAnimation':index,'frames':[[mapping[frame[0]],*frame[1:]]for frame in a['frames']]})
 groups['detailNavigation']=g
 data['detail']={'tabs':{'info':{'normal':0,'highlighted':1,'x':48,'y':168,'width':32},'zona':{'normal':2,'highlighted':3,'x':80,'y':168,'width':32},'verso':{'normal':4,'highlighted':5,'x':112,'y':168,'width':32},'forme':{'normal':6,'highlighted':7,'x':144,'y':168,'width':32}},'cryControls':{'play':{'normal':8,'highlighted':9},'replay':{'normal':10,'highlighted':11}},'buttonTableRecords':records,'sourceOverlaySHA256':hashlib.sha256(db).hexdigest(),'infoModule':206,'note':'Info original panel already exported by extract-pokedex.py; native tab pixels replace browser-authored navigation. Other detail modes require their own native content; only navigation components are exported here.'}
 data['layout']['visibleRows']=8
 data['layout']['trackedRowObjectLimit']=7
 common=files('a/0/8/3');raw_cells=menu.cells(common,20,23,19);selected=[0,1,2,3,8,9,10,11];mapping={c:i for i,c in enumerate(selected)}
 g={'source':{'archive':'a/0/8/3','char':20,'cells':23,'animation':26,'palette':19,'nativeGetters':['0x02027564','0x02027594','0x02027598','0x0202759c','0x020275a0']},'cells':[],'animations':[],'nativeCellToIndex':mapping}
 for native_cell in selected:
  im,box=raw_cells[native_cell];name=f'detail-common-{native_cell}.png';im.save(dest/name);g['cells'].append({'src':'assets/dex-browser/'+name,'origin':box[:2],'size':box[2:],'nativeCell':native_cell})
 for index,a in enumerate(menu.animations(common[26])):
  if all(frame[0]in mapping for frame in a['frames']):g['animations'].append({**a,'nativeAnimation':index,'frames':[[mapping[frame[0]],*frame[1:]]for frame in a['frames']]})
 groups['detailCommon']=g
 data['detail']['commonButtons']={'close':{'normal':0,'highlighted':4,'x':208,'y':168,'width':24},'back':{'normal':1,'highlighted':5,'x':232,'y':168,'width':24},'previous':{'normal':3,'highlighted':7,'x':0,'y':168,'width':24},'next':{'normal':2,'highlighted':6,'x':24,'y':168,'width':24}}
 data['detail']['info']={'reuseImage':'assets/pokedex/entry.png','source':{'archive':'a/1/5/9','char':25,'screens':[31,40],'palette':9},'mainBottomOffsetY':-24,'navigationY':168,'nativeProof':['208 0x021bebe8 creates206 mode2/main0','208 0x021bec34 creates206 mode2/sub1','208 0x021bec3a hides secondary via0x021ba6c8','206 0x021b9ea4 stores-24 in field0x1b4','206 0x021ba17a applies offset to all three Info BGs'],'topCompositionVerified':False,'note':'Default Info is main/bottom with all its pixels, text and portrait shifted up24. Secondary sub/top Info instance is hidden by default; its separate common-header composition is not fully reconstructed here.'}
 # Full wild habitat coverage for the five scoped species, not a guessed
 # route marker: all seven encounter methods in all four seasonal blocks.
 encounters=ndspy.narc.NARC(rom.getFileByName('a/1/2/6')).files
 assert all(len(b)in(232,928)for b in encounters)
 methods=[('grass',12),('doubleGrass',12),('shakingGrass',12),('surf',5),('surfRipples',5),('fishing',5),('fishingRipples',5)];scope=[495,498,501,504,506];hits={sid:{}for sid in scope}
 for member,b in enumerate(encounters):
  for season in range(len(b)//232):
   off=8
   for method_index,(method,count)in enumerate(methods):
    if b[season*232+method_index]:
     for slot in range(count):
      sid,low,high=struct.unpack_from('<HBB',b,season*232+off+slot*4);sid&=1023
      if sid in hits:hits[sid].setdefault(member,[]).append({'seasonBlock':season,'method':method,'slot':slot,'levels':[low,high]})
    off+=count*4
 header=ndspy.narc.NARC(rom.getFileByName('a/0/1/2')).files[0];place_rows={row[0]:row for row in struct.iter_unpack('<27H',ndspy.narc.NARC(rom.getFileByName('a/0/8/6')).files[0])};place_names=events.messages(banks[89]);areas={}
 for member in sorted(set.union(*(set(v)for v in hits.values()))):
  zones=[z for z in range(len(header)//48)if(struct.unpack_from('<H',header,z*48+20)[0]&8191)==member]
  for zone in zones:
   assert zone in place_rows;row=place_rows[zone];name_id=struct.unpack_from('<H',header,zone*48+26)[0]&1023
   areas[str(member)]={'zone':zone,'encounterMember':member,'name':place_names[name_id],'x':row[2],'y':row[3],'townmapParameters':list(row),'source':{'header':'a/0/1/2:0','encounters':'a/1/2/6:'+str(member),'position':'a/0/8/6:0'}}
 data['detail']['habitat']={'mapSrc':'assets/townmap/map.png','mapSource':{'archive':'a/0/8/5','characters':[7,5],'screens':[16,17],'extendedPalette':0},'areas':areas,'species':{str(sid):{'areaMembers':sorted(hits[sid]),'evidence':hits[sid]}for sid in scope},'checks':{'encounterFilesScanned':len(encounters),'allScopedAreasHaveOriginalMapPositions':True,'startersAbsentFromAllActiveWildTables':all(not hits[sid]for sid in scope[:3])},'note':'Original global encounter areas for scoped species are verified. A browser-rendered highlight on the original map is still an adaptation of the native habitat-mask effect.'}
 data['revision']=hashlib.sha256(b''.join(p.read_bytes()for p in sorted(dest.glob('*.png')))).hexdigest()[:12]
 (output/'dex-browser-assets.js').write_text('window.DEX_BROWSER_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
 print({'images':len(images),'objectCells':len(groups['listObjects']['cells']),'labels':len(labels),'names':len(names)})
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)
