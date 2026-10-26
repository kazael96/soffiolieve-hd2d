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
 ff[16]=mp;im=mg.layer(ff,18,16,19).crop((0,0,128,48));name=f'panel-ko-bank{bank}.png';im.save(dest/name);ko[str(bank)]={'path':'assets/battle-party/'+name,'paletteBank':bank,'sourceRect':[0,0,128,48]}
data={'source':'IRBI ov198 02210508–022105A0','archive':'a/1/0/0','archiveSHA256':hashlib.sha256(arc).hexdigest(),'bg':7,'images':images,'panels':panels,'buttonRecords':records,'buttonRecordEncoding':'xTile,yTile,wTile,hTile','slots':[{'id':i,'rect':[v*8 for v in r]}for i,r in enumerate(records)],'geometrySource':'ov198 0220B4C4 references table02211976/77 (width,height), table begins02211974; source panel copy0220B020 ->0220B360','font':{'createdIndex':3,'textBank':18,'source':'02210610–0221063C r1=3 fontLoad; bank18','sourceAtlas':'assets/battle-ui/font-3.png','slotRoleVerified':False,'note':'Several slot printers use root context+0xC font handle; creation of font3 alone does not prove its use for slot names/HP. Do not infer its active palette from field font5.'},'inferredVisualStates':{'source':'Visual inspection only; roles not yet traced','normal':'panel-0-0.png','selected':'panel-0-1.png','selectedVariant':'panel-0-2.png','empty':'panel-0-3.png'},'fainted':{'source':'0220B560–0220B580 HP0 overrides original tile palette with7+(state&1)','variants':ko},'notes':'This archive is distinct from field party ov91/a0/7/6. Original native map sources and cropped128x48 panel sources; final slot-table consumer and normal/selected state roles still to certify. Visual state inferences are explicitly separated from proven palette override.'}
(dest/'provenance.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps({'records':records,'sizes':{k:v['size']for k,v in images.items()}}))
