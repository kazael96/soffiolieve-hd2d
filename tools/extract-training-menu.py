"""Original menu icons for the level25 roster; palette choices remain scoped."""
from pathlib import Path
import argparse,importlib.util,json
import ndspy.rom,ndspy.narc,ndspy.lz10
from PIL import Image,ImageDraw
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);p.add_argument('--proof',type=Path);a=p.parse_args()
spec=importlib.util.spec_from_file_location('menu',Path(__file__).with_name('extract-menu.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
f=[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(r.getFileByName('a/0/0/7')).files]
# Like the earlier exports, these slots are scoped, visually reviewed choices,
# not a port of the general ARM palette selector.
slots={496:1,499:0,502:0,505:2,507:2,510:0,520:0,525:0,528:0,531:0,533:1,536:2,538:1,539:0,540:1,541:1,542:1,543:1,544:0,546:1,547:1,548:1,551:1}
icons={};proof=Image.new('RGBA',(360,len(slots)*38),(245,245,240,255));draw=ImageDraw.Draw(proof)
for row,(sid,slot) in enumerate(slots.items()):
 for pi in range(3):
  patched=list(f);patched[0]=bytearray(f[0]);patched[0][40:72]=f[0][40+pi*32:72+pi*32]
  cells=m.cells(patched,sid*2+7,2,0)
  im=cells[0][0];proof.alpha_composite(im,(pi*110+42,row*38+5));draw.text((pi*110+1,row*38+12),str(sid)+'/'+str(pi),fill=(15,25,30,255))
  if pi!=slot:continue
  record={'cells':[],'animations':m.animations(f[1]),'source':{'archive':'a/0/0/7','char':sid*2+7,'palette':0,'paletteSlot':pi}}
  for i,(image,box)in enumerate(cells):
   name=f'assets/menu/pokemon-{sid}-{i}.png';image.save(a.output/name);record['cells'].append({'src':name,'origin':box[:2],'size':box[2:]})
  icons[sid]=record
if a.proof:proof.save(a.proof)
(a.output/'training-menu.js').write_text('window.TRAINING_MENU='+json.dumps({'icons':icons},separators=(',',':'))+';Object.assign(MENU_ASSETS.pokemonIcons,TRAINING_MENU.icons);\n',encoding='utf8')
