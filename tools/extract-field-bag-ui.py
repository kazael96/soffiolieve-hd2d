from pathlib import Path
import sys,importlib.util,json,struct,hashlib,argparse
sys.path.insert(0,str(Path('work/audio-tools/python-packages').resolve()))
import ndspy.rom,ndspy.narc,ndspy.lz10
from PIL import Image
ap=argparse.ArgumentParser();ap.add_argument('rom');ap.add_argument('output',type=Path);args=ap.parse_args()
spec=importlib.util.spec_from_file_location('mg',Path(__file__).with_name('extract-menu.py'));mg=importlib.util.module_from_spec(spec);spec.loader.exec_module(mg)
rom=ndspy.rom.NintendoDSRom.fromFile(args.rom)
arc=rom.getFileByName('a/0/8/8');f=[ndspy.lz10.decompress(v)if v[:1]==b'\x10'else v for v in ndspy.narc.NARC(arc).files]
dest=(args.output/'assets/field-bag');dest.mkdir(exist_ok=True)
imgs={}
for label,c,s,p in [('bottomMale',3,5,4),('bottomFemale',0,2,1),('topDecoration',6,7,8),('topPanel',17,23,8),('bottomList',33,35,34)]:
 im=mg.layer(f,c,s,p);im.save(dest/(label+'.png'));imgs[label]={'path':'assets/field-bag/'+label+'.png','char':c,'screen':s,'palette':p,'size':list(im.size)}
male=list(f);male[8]=bytearray(f[8]);male[8][40:72]=f[8][72:104]
for label,c,s in [('topDecorationMale',6,7),('topPanelMale',17,23)]:
 im=mg.layer(male,c,s,8);im.save(dest/(label+'.png'));imgs[label]={'path':'assets/field-bag/'+label+'.png','char':c,'screen':s,'palette':8,'paletteRemap':'male: source bank1 replaces destination bank0','size':list(im.size),'source':'ov70 021B9200–021B9212;ARM9 02049B5C/02049BFC sourceOffset32 destination0 length32'}
windows=[{'managerOffset':o,'bg':bg,'rect':[x*8,y*8,w*8,h*8],'paletteBank':p}for o,bg,x,y,w,h,p in[(0x774,3,18,9,12,3,3),(0x754,3,17,13,11,2,3),(0x76c,3,17,15,11,2,3),(0x734,6,0,19,32,5,0),(0x73c,6,7,5,18,3,0),(0x744,6,20,8,6,3,0),(0x74c,6,2,12,29,7,0)]]
data={'source':'IRBI ov70','archive':'a/0/8/8','archiveSHA256':hashlib.sha256(arc).hexdigest(),'lcd':{'source':'021B8E90–021B8E9C writes POWCNT1 &=0x7FFF','main':'bottom','sub':'top'},'images':imgs,'windows':windows,'description':{'source':'021B9B92 window;021B9944 item description;021B995E print','bg':6,'screen':'top','window':[16,96,232,56],'textLocalOrigin':[0,4],'textScreenOrigin':[16,100],'font':0,'packedTextColor':0x3dc0,'textIndices':[15,14,0],'note':'Packed color follows native renderer convention fg bits10..14, shadow bits5..9, background bits0..4.'},'font':{'source':'021B8714 r1=0;021B871E FontLoad arc23 ->manager530','index':0},'list':{'source':'021BA028–021BA0B6','rows':8,'rowPitch':24,'objOrigin':[140,0],'selectorOrigin':[116,0],'note':'Native eight OBJ row actors at y24*i, clipped/scrolled by native engine. Dynamic label bitmap origin still to trace.'},'notes':'TopPanel uses palette8 already loaded for sub BG, not palette21. Final dynamic color effects and text palette mapping remain to verify.'}
ov=bytes(rom.loadArm9Overlays([70])[70].data);base=0x21b6000
data['bagActors']={'source':'ov70 021BA7B4,coordinates021BBAAC,sequence pairs021BB975','screen':'bottom','graphicsGroup':'MENU_ASSETS.groups.bagMale or bagFemale (not bagPockets)','positions':[list(struct.unpack_from('<2h',ov,0x21bbaac-base+i*4))for i in range(5)],'objOriginAdjustment':[-16,0],'sequencePairs':[list(ov[0x21bb975-base+i*2:0x21bb975-base+i*2+2])for i in range(5)],'note':'Five overlapping whole-bag actor states, initial origins -16,80. Active bag state selection and animation controls visibility; these are not five footer icons.'}
fonts=ndspy.narc.NARC(rom.getFileByName('a/0/2/3')).files;pc=mg.pal(fonts[5]);fm=json.loads((args.output/'assets/battle-ui/provenance.json').read_text(encoding='utf8'))['fonts']['0'];src=Image.open(args.output/'assets/battle-ui/font-0.png');off=fm['variantOffset'];font=src.crop((0,off,src.width,off*2))
for y in range(font.height):
 for x in range(font.width):
  v=font.getpixel((x,y))
  if v[3] and tuple(v[:3])==tuple(pc[2]):font.putpixel((x,y),(*mg.pal(male[8])[14],255))
font.save(dest/'font-0-fg15-shadow14.png');data['font'].update({'path':'assets/field-bag/font-0-fg15-shadow14.png','cellWidth':fm['cellWidth'],'height':fm['height'],'glyphs':fm['glyphs'],'palette':'a/0/8/8 member8 male bank1 replaces bank0; TOP window palette0','foreground':mg.pal(male[8])[15],'shadow':mg.pal(male[8])[14],'packingSource':'ARM9 0201C8E6–0201C924 shifts10/5/0 ->0201DD78'})
data['topItemIcon']={'source':'ov70 021B9D76–021B9DA6','actorOrigin':[132,80],'screen':'top','note':'Apply original itemicon NCER cell origin to actor origin.'}
data['topTitle']={'window':[56,40,144,24],'textLocalOrigin':[0,4],'textScreenOrigin':[56,44],'source':'021B9822'}
data['topQuantity']={'window':[160,64,48,24],'textLocalOrigin':[0,4],'textScreenOrigin':[160,68],'source':'021B987E'}
data['bagActors'].update({'initialOrigins':[[-16,80]]*5,'settledOrigins':[[0,80]]*5,'slideSource':'ov70 021BB584–021BB5C6 adds4 to actorX until table021BBAAC x0; creation021BA7B4 starts16left'})
data['list'].update({'bufferedRows':True,'normalFirstItemActor':1,'normalFirstItemOrigin':[140,24],'normalFirstItemCellTop':12,'scrollBaseMinimum':-1,'scrollSource':'ov70 021B6244 stores-1 ctx814;021B7C74 clampsminimum-1;021BA1B6 usesctx814+actorIndex;021B60B8 selected=ctx810+ctx814+1','note':'Actor0 is a clipped buffer row at y0 (cell top-12). At scrollBase-1 item0 belongs actor1 y24 (cell top12). Preserve buffering, do not shift all actors down12.'})
(dest/'provenance.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps(data['description']))



