"""Extract original IRBI Save information panel; never modifies save/ROM data."""
from pathlib import Path
import argparse,importlib.util,json,struct,hashlib
import ndspy.rom,ndspy.narc,ndspy.lz10
from PIL import Image
ap=argparse.ArgumentParser();ap.add_argument('rom');ap.add_argument('output',type=Path);args=ap.parse_args()
spec=importlib.util.spec_from_file_location('mg',Path(__file__).with_name('extract-menu.py'));mg=importlib.util.module_from_spec(spec);spec.loader.exec_module(mg)
rom=ndspy.rom.NintendoDSRom.fromFile(args.rom);assert rom.idCode==b'IRBI'
arc=rom.getFileByName('a/1/9/6');files=[ndspy.lz10.decompress(v)if v[:1]==b'\x10'else v for v in ndspy.narc.NARC(arc).files]
dest=args.output/'assets/save-ui';dest.mkdir(exist_ok=True);im=mg.layer(files,1,0,2);im.save(dest/'panel.png')
ov=bytes(rom.loadArm9Overlays([34])[34].data);base=rom.loadArm9Overlays([34])[34].ramAddress
windows=[]
for i in range(8):
 v=list(ov[0x21f0940-base+i*6:0x21f0940-base+(i+1)*6]);bg,x,y,w,h,p=v
 windows.append({'id':i,'bg':bg,'tilePosition':[x,y],'tileSize':[w,h],'paletteBank':p,'pixelRect':[x*8,y*8,w*8,h*8],'message':i,'textLocalOrigin':[0,4 if i==0 else 0],'packedColor':0x3580 if i==0 else 0x3dc0})
pc=mg.pal(files[2]);fm=json.loads((args.output/'assets/battle-ui/provenance.json').read_text(encoding='utf8'))['fonts']['0'];src=Image.open(args.output/'assets/battle-ui/font-0.png');off=fm['variantOffset'];fonts=ndspy.narc.NARC(rom.getFileByName('a/0/2/3')).files;old=mg.pal(fonts[5]);variants={}
for name,fg,sh in [('header',13,12),('body',15,14)]:
 bank=windows[0 if name=='header'else 1]['paletteBank'];cols=pc[bank*16:bank*16+16];font=src.crop((0,off,src.width,off*2))
 for y in range(font.height):
  for x in range(font.width):
   v=font.getpixel((x,y))
   if v[3]:font.putpixel((x,y),(*cols[sh if tuple(v[:3])==tuple(old[2])else fg],255))
 font.save(dest/f'font-0-{name}.png');variants[name]={'path':f'assets/save-ui/font-0-{name}.png','paletteBank':bank,'indices':[fg,sh,0],'foreground':cols[fg],'shadow':cols[sh]}
data={'source':'IRBI ov34 021F0108,021F0164','archive':'a/1/9/6','archiveSHA256':hashlib.sha256(arc).hexdigest(),'panel':{'path':'assets/save-ui/panel.png','char':1,'screen':0,'palette':2,'bg':4,'size':list(im.size)},'windows':windows,'font':{'index':0,'source':'021F01B6–021F01C0 font0 arc23; native packed color decode0201C8E6','cellWidth':fm['cellWidth'],'height':fm['height'],'glyphs':fm['glyphs'],'variants':variants},'textBank':168,'pokedexConditional':{'source':'021F03F2–021F0406','flag':0x962},'notes':'Original Save information panel. All windows are sub-engine. Caller ov21 loads overlay34 then calls its entry; no LCD swap in panel app, so inherited field sub-screen mapping applies. Dates/counts/player names are runtime state, not ROM identities.'}
data['entry']={'source':'IRBI ov21 021A13CC–021A13E2 loads overlay34 (#0x22) via02034A44 then calls021EFDA0; ov34 entry021EFDA0','overlay':34,'heapFromCaller':True,'lcd':'No POWCNT1 swap in this app: sub-engine remains on the same physical LCD used by the field X menu.'}
data['lastSavedConditional']={'source':'021F04E6–021F04F8','note':'Last-save line7 only when native save metadata predicates020071F0==0 and020071EC==1; do not show fabricated saved timestamp before first save.'}
data['confirmation']={'source':'ov10 02169FAC,0216A038','textBank':168,'yes':8,'no':9,'packedTextColor':0x39e3,'note':'Original popup helper020277CC; data-panel resources are separate from confirmation buttons.'}
(dest/'provenance.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps({'windows':windows,'paletteCount':len(pc)}))

