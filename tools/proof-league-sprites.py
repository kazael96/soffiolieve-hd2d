"""Static original-composite and native palette evidence, separate from battle QA."""
from pathlib import Path
import argparse,json,math,importlib.util
from PIL import Image,ImageDraw
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);a=p.parse_args()
root=Path(__file__).resolve().parents[1];out=(root/'../../outputs/chapter052/moves').resolve();assets=root/'src/assets/animated';out.mkdir(parents=True,exist_ok=True)
ids=[526,534,584,589,601,612,617,620,629,631,632,633,634]
def part(data,atlas,row):
 f=data['animations'][row[0]]['frames'][0];cells=data['cells'][f[0]];c=Image.new('RGBA',(256,256))
 for o in sorted(reversed(cells),key=lambda o:-o[7]):
  im=data['images'][o[4]];tile=atlas.crop((im[0],im[1],im[0]+im[2],im[1]+im[3]))
  if o[5]:tile=tile.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
  if o[6]:tile=tile.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
  c.alpha_composite(tile,(128+o[0],128+o[1]))
 # Native first frames use identity scale/rotation; translations are retained.
 assert f[2]==0 and f[3:5]==[4096,4096],f
 shifted=Image.new('RGBA',c.size);shifted.alpha_composite(c,(row[1]+f[5],row[2]+f[6]));return shifted
keys=[str(id)for id in ids]
sheet=Image.new('RGBA',(6*150,math.ceil(len(keys)*2/6)*150),(235,238,232,255));draw=ImageDraw.Draw(sheet)
for index,(key,side)in enumerate((key,side)for key in keys for side in ['front','back']):
 d=json.loads((assets/(key+'-'+side+'.json')).read_text());atlas=Image.open(assets/(key+'-'+side+'.png'));canvas=Image.new('RGBA',(256,256))
 pf=d['parent'][0]['frames'][0]
 for row in reversed(d['maps'][pf[0]]):canvas.alpha_composite(part(d,atlas,row))
 box=canvas.getbbox();im=canvas.crop(box);im.thumbnail((120,115),Image.Resampling.NEAREST);x=index%6*150;y=index//6*150;sheet.alpha_composite(im,(x+(150-im.width)//2,y+125-im.height));draw.text((x+4,y+132),key+' '+side,fill=(15,20,25,255))
 if key in [str(i)for i in ids]:
  rows=d['maps'][pf[0]];grid=Image.new('RGBA',(8*105,math.ceil(len(rows)/8)*110),(240,240,232,255));g=ImageDraw.Draw(grid)
  for j,row in enumerate(rows):
   tile=part(d,atlas,row);box=tile.getbbox()
   if box:
    tile=tile.crop(box);tile.thumbnail((95,85),Image.Resampling.NEAREST);xx=j%8*105;yy=j//8*110;grid.alpha_composite(tile,(xx+(105-tile.width)//2,yy+88-tile.height));g.text((xx+3,yy+92),'track '+str(row[0]),fill=(0,0,0,255))
  grid.save(out/(key+'-'+side+'-parts.png'))
sheet.save(out/'original-composites.png')
