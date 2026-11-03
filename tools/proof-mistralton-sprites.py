"""Static original-composite and native palette evidence, separate from battle QA."""
from pathlib import Path
import argparse,json,math,importlib.util
from PIL import Image,ImageDraw
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);a=p.parse_args()
root=Path(__file__).resolve().parents[1];out=root/'outputs/chapter049/moves';assets=root/'src/assets/animated';out.mkdir(parents=True,exist_ok=True)
ids=[508,521,529,530,549,555,564,566,575,581,582,583,585,586,588,590,592,595,597,599,602]
def part(data,atlas,row):
 f=data['animations'][row[0]]['frames'][0];cells=data['cells'][f[0]];c=Image.new('RGBA',(256,256))
 for o in sorted(cells,key=lambda o:-o[7]):
  im=data['images'][o[4]];tile=atlas.crop((im[0],im[1],im[0]+im[2],im[1]+im[3]))
  if o[5]:tile=tile.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
  if o[6]:tile=tile.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
  c.alpha_composite(tile,(128+o[0],128+o[1]))
 # Native first frames use identity scale/rotation; translations are retained.
 assert f[2]==0 and f[3:5]==[4096,4096],f
 shifted=Image.new('RGBA',c.size);shifted.alpha_composite(c,(row[1]+f[5],row[2]+f[6]));return shifted
keys=[str(id)for id in ids]+['521-female','592-female']+[str(id)for id in range(701,707)]
sheet=Image.new('RGBA',(6*150,math.ceil(len(keys)*2/6)*150),(235,238,232,255));draw=ImageDraw.Draw(sheet)
for index,(key,side)in enumerate((key,side)for key in keys for side in ['front','back']):
 d=json.loads((assets/(key+'-'+side+'.json')).read_text());atlas=Image.open(assets/(key+'-'+side+'.png'));canvas=Image.new('RGBA',(256,256))
 pf=d['parent'][0]['frames'][0]
 for row in d['maps'][pf[0]]:canvas.alpha_composite(part(d,atlas,row))
 box=canvas.getbbox();im=canvas.crop(box);im.thumbnail((120,115),Image.Resampling.NEAREST);x=index%6*150;y=index//6*150;sheet.alpha_composite(im,(x+(150-im.width)//2,y+125-im.height));draw.text((x+4,y+132),key+' '+side,fill=(15,20,25,255))
 if key in [str(i)for i in ids]:
  rows=d['maps'][pf[0]];grid=Image.new('RGBA',(8*105,math.ceil(len(rows)/8)*110),(240,240,232,255));g=ImageDraw.Draw(grid)
  for j,row in enumerate(rows):
   tile=part(d,atlas,row);box=tile.getbbox()
   if box:
    tile=tile.crop(box);tile.thumbnail((95,85),Image.Resampling.NEAREST);xx=j%8*105;yy=j//8*110;grid.alpha_composite(tile,(xx+(105-tile.width)//2,yy+88-tile.height));g.text((xx+3,yy+92),'track '+str(row[0]),fill=(0,0,0,255))
  grid.save(out/(key+'-'+side+'-parts.png'))
sheet.save(out/'original-composites.png')
try:import ndspy.rom
except ModuleNotFoundError:
 from irbi_reader import install
 install()
 import ndspy.rom
import ndspy.narc,ndspy.lz10
spec=importlib.util.spec_from_file_location('menu',root/'tools/extract-menu.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);f=[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(r.getFileByName('a/0/0/7')).files]
icon_ids=ids+list(range(701,707))
proof=Image.new('RGBA',(450,len(icon_ids)*45),(245,245,235,255));draw=ImageDraw.Draw(proof)
for row,sid in enumerate(icon_ids):
 for pi in range(3):
  patched=list(f);patched[0]=bytearray(f[0]);patched[0][40:72]=f[0][40+pi*32:72+pi*32];im=m.cells(patched,sid*2+7,2,0)[0][0];im=im.resize((im.width*2,im.height*2),Image.Resampling.NEAREST);proof.alpha_composite(im,(pi*150+50,row*45));draw.text((pi*150+2,row*45+15),str(sid)+'/'+str(pi),fill=(0,0,0,255))
proof.save(out/'palette-proof.png');print('Original composites, part sheets and three native palettes:',out)
