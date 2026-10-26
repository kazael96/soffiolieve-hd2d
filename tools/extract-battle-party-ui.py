"""Original IRBI battle-only party panel sources and native six-slot geometry."""
from pathlib import Path
import argparse,importlib.util,json,struct,hashlib
import ndspy.rom,ndspy.narc,ndspy.lz10
ap=argparse.ArgumentParser();ap.add_argument('rom');ap.add_argument('output',type=Path);args=ap.parse_args()
spec=importlib.util.spec_from_file_location('mg',Path(__file__).with_name('extract-menu.py'));mg=importlib.util.module_from_spec(spec);spec.loader.exec_module(mg)
rom=ndspy.rom.NintendoDSRom.fromFile(args.rom);assert rom.idCode==b'IRBI'
arc=rom.getFileByName('a/1/0/0');f=[ndspy.lz10.decompress(v)if v[:1]==b'\x10'else v for v in ndspy.narc.NARC(arc).files];assert len(f)==20
dest=args.output/'assets/battle-party';dest.mkdir(exist_ok=True);images={}
for i in range(18):
 im=mg.layer(f,18,i,19);im.save(dest/f'map-{i}.png');images[str(i)]={'path':f'assets/battle-party/map-{i}.png','char':18,'screen':i,'palette':19,'size':list(im.size)}
ov=rom.loadArm9Overlays([198])[198];b=bytes(ov.data);base=ov.ramAddress;records=[list(b[0x2211974-base+i*4:0x2211974-base+(i+1)*4])for i in range(6)]
atlas=mg.layer(f,18,16,19);panels=[]
for col in range(2):
 for row in range(4):
  x,y=col*128,row*48;label=f'panel-{col}-{row}';atlas.crop((x,y,x+128,y+48)).save(dest/(label+'.png'));panels.append({'path':f'assets/battle-party/{label}.png','sourceRect':[x,y,128,48],'sourceBuffer':0x1dc+col*0x300+row*0xc0,'stateRoleVerified':False})
ko={}
for bank in(7,8):
 ff=list(f);mp=bytearray(f[16])
 for pos in range(36,len(mp),2):
  v,=struct.unpack_from('<H',mp,pos);struct.pack_into('<H',mp,pos,(v&4095)|(bank<<12))
 ff[16]=mp;y=(bank&1^1)*48;im=mg.layer(ff,18,16,19).crop((0,y,128,y+48));name=f'panel-ko-bank{bank}.png';im.save(dest/name);ko[str(bank)]={'path':'assets/battle-party/'+name,'paletteBank':bank,'sourceRect':[0,y,128,48]}
data={'source':'IRBI ov198 02210508–022105A0','archive':'a/1/0/0','archiveSHA256':hashlib.sha256(arc).hexdigest(),'bg':7,'images':images,'panels':panels,'buttonRecords':records,'buttonRecordEncoding':'xTile,yTile,wTile,hTile','slots':[{'id':i,'rect':[v*8 for v in r]}for i,r in enumerate(records)],'geometrySource':'ov198 0220B4C4 references table02211976/77 (width,height), table begins02211974; source panel copy0220B020 ->0220B360','font':{'createdIndex':3,'textBank':18,'source':'02210610–0221063C r1=3 fontLoad; bank18','sourceAtlas':'assets/battle-ui/font-3.png','slotRoleVerified':False,'note':'Several slot printers use root context+0xC font handle; creation of font3 alone does not prove its use for slot names/HP. Do not infer its active palette from field font5.'},'inferredVisualStates':{'source':'Visual inspection only; roles not yet traced','normal':'panel-0-0.png','selected':'panel-0-1.png','selectedVariant':'panel-0-2.png','empty':'panel-0-3.png'},'fainted':{'source':'0220B560–0220B580 HP0 overrides original tile palette with7+(state&1)','variants':ko},'notes':'This archive is distinct from field party ov91/a0/7/6. Original native map sources and cropped128x48 panel sources; final slot-table consumer and normal/selected state roles still to certify. Visual state inferences are explicitly separated from proven palette override.'}
from PIL import Image
fonts=ndspy.narc.NARC(rom.getFileByName('a/0/2/3')).files;old=mg.pal(fonts[5]);pc=mg.pal(f[19])[144:160];fm=json.loads((args.output/'assets/battle-ui/provenance.json').read_text(encoding='utf8'))['fonts'];newfonts={}
for index,role in [(0,'name'),(3,'levelAndHp')]:
 m=fm[str(index)];src=Image.open(args.output/f'assets/battle-ui/font-{index}.png');off=m['variantOffset'];im=src.crop((0,off,src.width,off*2))
 for y in range(im.height):
  for x in range(im.width):
   v=im.getpixel((x,y))
   if v[3]:im.putpixel((x,y),(*pc[14 if tuple(v[:3])==tuple(old[2])else 15],255))
 name=f'font-{index}-slot.png';im.save(dest/name);newfonts[role]={'index':index,'path':'assets/battle-party/'+name,'cellWidth':m['cellWidth'],'height':m['height'],'glyphs':m['glyphs'],'paletteBank':9,'indices':[15,14,0],'foreground':pc[15],'shadow':pc[14],'verified':True}
data['font']={'textBank':18,'variants':newfonts,'nameSource':'ov93 021E9920–26 ctx+B0(font0)->partyRoot+C;ov1980220BE44–48','levelHpSource':'02210638 font3->manager1E9C;0220C040/042,0220C090/128','paletteSource':'table02211ADA windows BG5 bank9; palette a1/0/0:19 bank9; packed0x3DC0'}
wr=[list(b[0x2211ada-base+i*6:0x2211ada-base+(i+1)*6])for i in range(6)]
data['textWindows']=[{'bg':r[0],'rect':[r[1]*8,r[2]*8,r[3]*8,r[4]*8],'paletteBank':r[5]}for r in wr]
data['textLayout']={'name':{'font':0,'localOrigin':[32,7],'source':'0220D7CC–0220D7DA'},'level':{'font':3,'localOrigin':[8,32],'message':11,'source':'0220D888–0220D8AC ->0220BFD0','condition':'Only when02027644 returns8 (status label occupies this area otherwise)'} ,'hp':{'font':3,'slashCenter':[92,32],'currentRight':'92-floor(widthOfSlash/2)','maximumLeft':'92-floor(widthOfSlash/2)+widthOfSlash','source':'0220D85E–0220D86A ->0220C06C;0220C128–0220C1F4'},'hpBar':{'rect':[64,27,48,2],'source':'0220D86E–0220D87A ->0220C1F8; two horizontal lines atY24+3 and24+4'}}
data['states']={'verified':True,'source':'02210A00 species0=>empty;02210E4C active predicate;0220B770–0220B7B8;0220B400 columns;0220B6AC press task','active':{'column':0,'row':0},'reserve':{'column':1,'row':0},'empty':{'column':1,'row':3},'pressed':{'row':1,'note':'Native press task switches row1 then restores row0 after counter4; keyboard-focus brackets are separate.'},'row2':{'roleVerified':False},'fainted':'HP0 palette7+(row&1) overrides source palette; source row retained'}
data['panelBg']=6;data['backgroundBg']=7;data['geometrySource']+='; final0220B61E–0220B62E passes tablex/y intoBG6 copy02041010'
data['fainted']['byColumn']={}
for col in range(2):
 for bank in(7,8):
  ff=list(f);mp=bytearray(f[16])
  for pos in range(36,len(mp),2):
   v,=struct.unpack_from('<H',mp,pos);struct.pack_into('<H',mp,pos,(v&4095)|(bank<<12))
  ff[16]=mp;yy=0 if bank==7 else 48;name=f'panel-ko-col{col}-bank{bank}.png';mg.layer(ff,18,16,19).crop((col*128,yy,col*128+128,yy+48)).save(dest/name);data['fainted']['byColumn'][f'{col}-{bank}']={'path':'assets/battle-party/'+name,'column':col,'paletteBank':bank,'row':0 if bank==7 else 1}
common=[ndspy.lz10.decompress(v)if v[:1]==b'\x10'else v for v in ndspy.narc.NARC(rom.getFileByName('a/0/8/3')).files];status=[]
for i,(im,box)in enumerate(mg.cells(common,12,13,11)):
 name=f'status-{i}.png';im.save(dest/name);status.append({'path':'assets/battle-party/'+name,'cell':i,'bounds':box})
data['statusLabels']={'archive':'a/0/8/3','char':12,'cellmap':13,'palette':11,'animation':16,'cells':status,'animations':mg.animations(common[16]),'positions':[list(struct.unpack_from('<2h',b,0x2211ccc-base+i*4))for i in range(6)],'source':'0220E2F0–0220E34A load12/11/13/16;0220EA4A–0220EA58 position at02211CCC ->0220E874','sequenceMap':{'sleep':1,'burn':2,'poison':3,'toxic':3,'paralysis':4,'freeze':5,'fainted':6,'none':8},'mappingSource':'ARM9 02027644–0202768E;0220E874 uses enum directly as sequence,8 skips visible status','note':'Original status label OBJ source cells with signed origins. Position is actor anchor; apply NCER origin. Lv is omitted when status enum !=8.'}
data['states']['pressed'].update({'pressedHoldTicks':5,'source':'0220B6CC row1 at phase0; phase1 counter0..4 restoresrow0 when4 at0220B6E6–0220B70C','recoveryTicks':2,'note':'Pressed persists five update intervals including phase0→first phase1; phase2 then waits two updates before unlock. Simulation tick counts, not a scheduler-independent wall-clock guarantee.'})
spec=importlib.util.spec_from_file_location('events',Path(__file__).with_name('extract-original-events.py'));ev=importlib.util.module_from_spec(spec);spec.loader.exec_module(ev)
data['messages']=ev.messages(ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files[18])
data['prompt']={'source':'0220BD52–0220BD7A ->0220C50C; two-window table02211A14','screen':'sub/bottom (battle app does not swap LCDs)','bg':4,'rect':[16,168,176,16],'paletteBank':13,'fillIndex':15,'font':0,'fontPalette':'a/0/2/3 member5 loaded tosub bank13 at022105EA–022105FE','packedColor':0x440,'indices':[1,2,0],'textLocalOrigin':[0,0],'nativeModes':{'2':{'message':9,'text':data['messages'][9]},'3':{'message':7,'text':data['messages'][7]},'default':{'message':6,'text':data['messages'][6]}},'timing':'Initial setup0220F49E creates windows then0220F4A6 invokes initial prompt after slot composition; no independent arbitrary delay is present in prompt selection. Print queue completion is handled by native font task.','note':'Party prompt is on the lower screen and is distinct from top battle narrative and bank15:69 Cosa deve fare...? Do not leave the command prompt active as the forced-switch/item-target prompt.'}
fm0=fm['0'];src=Image.open(args.output/'assets/battle-ui/font-0.png');src.crop((0,0,src.width,fm0['variantOffset'])).save(dest/'font-0-prompt.png')
data['font']['variants']['prompt']={'index':0,'path':'assets/battle-party/font-0-prompt.png','cellWidth':fm0['cellWidth'],'height':fm0['height'],'glyphs':fm0['glyphs'],'paletteBank':13,'paletteSource':'a/0/2/3:5','indices':[1,2,0],'foreground':old[1],'shadow':old[2],'verified':True}
data['prompt']['fillColor']=old[15]
data.pop('inferredVisualStates',None);data['notes']='Font0 names, font3 level/HP and bank9 palette are now traced. Normal/reserve/empty/pressed selectors are native; row2 remains unassigned. Background and cards use BG7/BG6 respectively.'
# Native contextual selection page: ov198 0220B836, not a generic popup.
allrecords=[list(b[0x2211974-base+i*4:0x2211974-base+(i+1)*4])for i in range(32)]
contextparts={};atlas17=mg.layer(f,18,17,19)
for label,source,rect,position in [('panel',atlas17,[0,0,240,136],[0,8]),('panel-pressed',atlas17,[0,136,240,136],[0,8]),('panel-disabled',atlas17,[0,272,240,136],[0,8]),('info',atlas,[0,312,104,40],[0,152]),('info-pressed',atlas,[0,352,104,40],[0,152]),('info-disabled',atlas,[104,352,104,40],[0,152]),('back',atlas,[208,192,40,40],[216,152]),('back-pressed',atlas,[208,232,40,40],[216,152])]:
 x,y,w,h=rect;name='context-'+label+'.png';source.crop((x,y,x+w,y+h)).save(dest/name);contextparts[label]={'path':'assets/battle-party/'+name,'sourceRect':rect,'position':position,'screen':17 if source is atlas17 else 16}
cr=[list(b[0x2211a80-base+i*6:0x2211a80-base+(i+1)*6])for i in range(4)]
data['context']={'verified':True,'parts':contextparts,'windows':[{'bg':r[0],'rect':[v*8 for v in r[1:5]],'paletteBank':r[5]}for r in cr],'font':'name','labelTextLocalY':5,'labelAlignment':'horizontal center in window','nameTextLocalY':7,'labels':{'swap':21,'info':24,'moves':25},'unavailableLabels':{'2':26,'3':27,'4':28,'1':29},'buttons':[{'id':7,'action':'swap','rect':[v*8 for v in allrecords[7]]},{'id':8,'action':'info','rect':[v*8 for v in allrecords[8]]},{'id':10,'action':'moves','rect':[v*8 for v in allrecords[10]]},{'id':6,'action':'back','rect':[v*8 for v in allrecords[6]]}],'source':'0220F676–0220F6A4 slot press -> state29 -> state12;0220D8B4 labels;0220F78C action routing;0220B836 graphics;0220B020/0220B2B4 atlas extraction;02211974 geometry;02211A80 text windows;0220C594 centered labels Y5/font0/color3DC0','flow':'Slot tap opens this contextual page; swap is only committed by action0 at0220F82C. Item target mode3 bypasses this page. Back arrow/B returns six slots. INFO and MOSTRA MOSSE are internal ov198 states13 and14, not the field Summary app. Egg hides INFO/MOSTRA MOSSE.'}

data['context']['background']={'bg6':images['15'],'bg7':images['14'],'source':'02210C4C table022120D4 page1'}
for label,x,y in [('previous',0,392),('previous-pressed',40,392),('next',0,432),('next-pressed',40,432),('wide',0,312),('wide-pressed',0,352)]:
 w=104 if label.startswith('wide')else 40;name='context-'+label+'.png';atlas.crop((x,y,x+w,y+40)).save(dest/name);contextparts[label]={'path':'assets/battle-party/'+name,'sourceRect':[x,y,w,40],'screen':16}
data['detailPages']={}
for key,page,table,count,buttons in [('info',2,0x2211bb0,22,[12,13,11,6]),('moves',3,0x2211afe,6,[12,13,14,15,16,17,9,6])]:
 rr=[list(b[table-base+i*6:table-base+(i+1)*6])for i in range(count)];pair=struct.unpack_from('<2I',b,0x22120d4-base+page*8)
 data['detailPages'][key]={'page':page,'background':{'bg6':images[str(pair[0])],'bg7':images[str(pair[1])]},'windows':[{'bg':r[0],'rect':[v*8 for v in r[1:5]],'paletteBank':r[5]}for r in rr],'buttons':[{'id':i,'rect':[v*8 for v in allrecords[i]]}for i in buttons],'source':'0220BB70 table dispatch;0220B89C INFO;0220B8F0 MOSSE;02210C4C background table; text roles not yet individually traced'}

for role,fg,sh in [('detailNumber',8,9),('male',10,11),('female',12,13)]:
 m=fm['0'];src=Image.open(args.output/'assets/battle-ui/font-0.png');off=m['variantOffset'];im=src.crop((0,off,src.width,off*2))
 for yy in range(im.height):
  for xx in range(im.width):
   v=im.getpixel((xx,yy))
   if v[3]:im.putpixel((xx,yy),(*pc[sh if tuple(v[:3])==tuple(old[2])else fg],255))
 name='font-0-'+role+'.png';im.save(dest/name);data['font']['variants'][role]={'index':0,'path':'assets/battle-party/'+name,'cellWidth':m['cellWidth'],'height':m['height'],'glyphs':m['glyphs'],'paletteBank':9,'indices':[fg,sh,0],'foreground':pc[fg],'shadow':pc[sh],'verified':True}
roles=['name','abilityName','abilityDescription','heldItemName','hpNumbers','attackValue','defenseValue','speedValue','specialAttackValue','specialDefenseValue','hpBar','levelValue','experienceToNextLevel','hpLabel','attackLabel','defenseLabel','speedLabel','specialAttackLabel','specialDefenseLabel','levelLabel','experienceToNextLabel','showMovesButton']
info=data['detailPages']['info'];info['verifiedTextRoles']=True
for i,r in enumerate(roles):info['windows'][i]['role']=r
info['textLayout']={'font':0,'whiteFont':'name','numberFont':'detailNumber','allLocalOrigin':[0,0],'exceptions':{'21':{'alignment':'center','localY':5}},'messageByWindow':{'1':14,'3':15,'13':38,'14':42,'15':44,'16':50,'17':46,'18':48,'19':33,'20':35,'21':25},'numberAlignment':{'4':'slash centered in56px window; current right of left half and maximum left after slash','5':'right','6':'right','7':'right','8':'right','9':'right','12':'right'},'level100ExperienceToNext':0,'source':'0220DBA8 composer;0220C614 level+exp;0220C7F0/C8F0/C9F0/CAF0/CBF0 stats;0220CCF0 hp;0220C298 ability;0220C32C item;0220CEC4 abilitydescription'}
info['abilityDescriptionBank']=183;info['abilityDescriptions']=ev.messages(ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files[183]);info['emptyHeldItemMessage']=30
info['hpBar']={'window':10,'localRect':[0,3,48,2],'source':'0220DBD6–0220DBE4 ->0220C1F8'}
anchors=lambda address,count:[list(struct.unpack_from('<2h',b,address-base+i*4))for i in range(count)]
info['sprites']={'pokemonIcon':anchors(0x2211c44,1)[0],'status':anchors(0x2211c68,1)[0],'types':anchors(0x2211c98,2),'heldItemIcon':anchors(0x2211c38,1)[0],'source':'0220EB2C–0220EBBA; actor anchor positions, apply NCER signed origin; Pokemon is original party icon, not large battle sprite'}
move=data['detailPages']['moves'];move['sprites']={'pokemonIcon':anchors(0x2211c70,1)[0],'status':anchors(0x2211c6c,1)[0],'types':anchors(0x2211c78,2),'moveTypes':anchors(0x2211ca0,4),'source':'0220EBCC;0220EF60'}
move['textLayout']={'font':0,'fontVariant':'name','headerLocalOrigin':[0,0],'moveName':{'windows':[1,2,3,4],'alignment':'center','localY':7,'messages':[71,74,77,80]},'pp':{'windows':[1,2,3,4],'localY':24,'labelX':40,'slashX':80,'currentRight':80,'maximumLeft':'80+widthOfSlash','messages':{'label':53,'current':54,'maximum':55,'slash':56},'source':'0220D5DC–0220D77C'},'infoButton':{'window':5,'message':24,'alignment':'center','localY':5},'source':'0220DB04–0220DB92 calls0220C3DC for centered move names and0220D5DC PP'}
move['panelStates']={}
for state,rect in [('normal',[0,408,128,48]),('pressed',[128,408,128,48]),('variant2',[0,456,128,48]),('empty',[128,456,128,48])]:
 x,y,w,h=rect;name='detail-move-'+state+'.png';atlas17.crop((x,y,x+w,y+h)).save(dest/name);move['panelStates'][state]={'path':'assets/battle-party/'+name,'sourceRect':rect,'screen':17}
move['panelStateSource']='0220B8F0–0220B974 uses variant0 whenmoveIDnonzero,variant3whenempty;0220B3B0 source1830+variant*C0;0220B2B4 crops'
for key in ['info','moves']:
 data['detailPages'][key]['headerGender']={'maleMessage':22,'femaleMessage':23,'fontVariants':['male','female'],'alignment':'right edge of header window','localY':0,'skip':'egg or genderless','source':'0220BDB8–0220BFB6'}
data['context']['sprites']={'pokemonIcon':anchors(0x2211c34,1)[0],'source':'0220EACC–0220EB20; original party icon; mini held-item badge at icon anchor+8,+8'}

rr=[list(b[0x2211b24-base+i*6:0x2211b24-base+(i+1)*6])for i in range(11)];roles=['moveName','ppNumbers','accuracyValue','powerValue','description','categoryValue','pokemonName','ppLabel','accuracyLabel','powerLabel','categoryLabel']
detail={'page':4,'verifiedTextRoles':True,'background':{'bg6':images['7'],'bg7':images['6']},'windows':[{'bg':r[0],'rect':[v*8 for v in r[1:5]],'paletteBank':r[5],'role':roles[i]}for i,r in enumerate(rr)],'buttons':[{'id':i,'rect':[v*8 for v in allrecords[i]]}for i in[6,28,29,30,31]],'descriptionBank':202,'descriptions':ev.messages(ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files[202]),'textLayout':{'font':0,'fontVariant':'name','allLocalOrigin':[0,0],'ppNumbers':'slash centered in window, current right-aligned before slash, maximum left-aligned after slash','accuracyPowerAlignment':'right','accuracyZero':'-- message60','powerZeroOrOne':'-- message60','messageByWindow':{'7':20,'8':61,'9':58,'10':63},'categoryMessageMap':{'0':65,'1':64,'2':66},'moveNameMessages':[71,74,77,80]},'source':'0220DC78–0220DD3E composer;0220CF34 precision label;0220CF90 precision value;0220D0BC power label;0220D118 power value;0220D248 description;0220D2B4/D318 category;0220D394 PP'}
detail['sprites']={'pokemonIcon':anchors(0x2211c64,1)[0],'status':anchors(0x2211c60,1)[0],'types':anchors(0x2211c88,2),'moveType':anchors(0x2211c58,1)[0],'categoryIcon':anchors(0x2211c48,1)[0],'source':'0220EC54–0220ED1C actor anchors; status/item semantics same as INFO'}
detail['tabStates']={}
for i,state in enumerate(['normal','pressed','selected']):
 x=i*40;name='move-detail-tab-'+state+'.png';atlas.crop((x,472,x+40,488)).save(dest/name);detail['tabStates'][state]={'path':'assets/battle-party/'+name,'sourceRect':[x,472,40,16],'screen':16}
detail['tabSource']='0220B990–0220B9D6 usesvariant2forcurrentmove,0otherwise;0220B3B0 IDs28..31 source1E3C+variant14;0220B250 extraction'
data['detailPages']['moveDetail']=detail

held=[]
for i,(im,box)in enumerate(mg.cells(common,65,67,66)):
 name=f'held-badge-{i}.png';im.save(dest/name);held.append({'path':'assets/battle-party/'+name,'cell':i,'bounds':box})
data['heldItemBadge']={'archive':'a/0/8/3','char':65,'cellmap':67,'palette':66,'animation':70,'cells':held,'animations':mg.animations(common[70]),'source':'0220E930 chooses sequence1 when020212EC(itemID)==1 else0; no visible sprite whenitemID0; generic normal/mail badge'}

cats={}
for i,bank in enumerate([0,0,1]):
 cc=[]
 for j,(im,box)in enumerate(mg.cells(common,56+i,59,33,bank)):
  name=f'move-category-{i}-{j}.png';im.save(dest/name);cc.append({'path':'assets/battle-party/'+name,'cell':j,'bounds':box})
 cats[str(i)]={'char':56+i,'paletteBank':bank,'cells':cc}
data['moveCategoryIcons']={'archive':'a/0/8/3','cellmap':59,'palette':33,'animation':62,'animations':mg.animations(common[62]),'categories':cats,'source':'0220E360 loadsNCLR33/NCER59/NANR62;0220E7B4 dynamicchar02027590=56+category;02027584 table0209FBE4 palettebanks[0,0,1]','categoryMap':{'0':'status','1':'physical','2':'special'}}
data['states']['pressed']['appliesTo']='Every ID passed to0220B660, including6,7,8,9,10,11,12,13,28..31; shared0220B6AC alwaysdrawsvariant1 for5intervals, thenvariant0, then2recoveryupdates. Tabs selectedvariant2 is restored by subsequentpagecomposition.'

(dest/'provenance.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps({'records':records,'fonts':list(newfonts)}))
