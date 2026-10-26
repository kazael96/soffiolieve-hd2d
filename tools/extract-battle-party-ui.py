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
data.pop('inferredVisualStates',None);data['notes']='Font0 names, font3 level/HP and bank9 palette are now traced. Normal/reserve/empty/pressed selectors are native; row2 remains unassigned. Background and cards use BG7/BG6 respectively.'
(dest/'provenance.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps({'records':records,'fonts':list(newfonts)}))
