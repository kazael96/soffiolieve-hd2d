"""Read-only export of additional IRBI party/summary and item graphics.

Original resource indices are retained; generic resource labels make no unproved
claim that a graphical index equals an item ID. Visual scoped assignments live
in a separate explicit map.
"""
from pathlib import Path
import argparse,hashlib,importlib.util,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10,ndspy.codeCompression
from PIL import Image,ImageDraw

def extract(rom,output):
 assert rom.idCode==b'IRBI'
 spec=importlib.util.spec_from_file_location('menu',Path(__file__).with_name('extract-menu.py'));menu=importlib.util.module_from_spec(spec);spec.loader.exec_module(menu)
 files=lambda name:[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName(name)).files]
 dest=output/'assets/party-details';dest.mkdir(parents=True,exist_ok=True)
 groups={};images={};checks=[]
 def group(label,archive,char,cer,anr,palette):
  f=files(archive);g={'source':{'archive':archive,'char':char,'cells':cer,'animation':anr,'palette':palette},'cells':[],'animations':menu.animations(f[anr])}
  for i,(im,box)in enumerate(menu.cells(f,char,cer,palette)):
   name=f'{label}-{i}.png';im.save(dest/name);g['cells'].append({'src':'assets/party-details/'+name,'origin':box[:2],'size':box[2:]})
  groups[label]=g
 # Scoped usable objects only. Full palette/ribbon research stays outside src.
 group('partyNavigationBlue','a/0/7/6',7,21,24,1)
 group('partyNavigationYellow','a/0/7/6',7,21,24,2)
 group('partySelection','a/0/7/6',11,23,26,6)
 group('summaryTabs','a/0/7/8',11,78,129,0)
 group('summaryMovePanels','a/0/7/8',15,81,132,0)
 f=files('a/0/7/6');atlas=menu.layer(f,12,18,6)
 for label,box in [('partyPink',(0,8,128,56)),('partyBlueRight',(128,16,256,64)),('partyTeal',(0,56,128,104)),('partyRed',(128,64,256,112)),('partyBlueLeft',(0,104,128,152)),('partyBlueRight2',(128,112,256,160)),('partyShadow',(0,152,128,200))]:
  im=atlas.crop(box);name=label+'.png';im.save(dest/name);images[label]={'src':'assets/party-details/'+name,'size':list(im.size),'source':{'archive':'a/0/7/6','char':12,'screen':18,'palette':6,'crop':list(box),'identification':'visual atlas component; state role not traced'}}
 f=files('a/0/8/8')
 for label,char,screen,palette in [('bagDescriptionPanel',33,35,34)]:
  im=menu.layer(f,char,screen,palette);name=label+'.png';im.save(dest/name);images[label]={'src':'assets/party-details/'+name,'size':list(im.size),'source':{'archive':'a/0/8/8','char':char,'screen':screen,'palette':palette,'identification':'archive component; native placement not traced'}}
 f=files('a/0/2/5');assert len(f)==1005 and f[0][:4]==b'RNAN'and f[1][:4]==b'RECN'
 # Native ARM9 table contains627 direct item-ID -> NCGR/NCLR uint16 pairs.
 # Shared graphics and palettes make the naive alternating-pairs formula fail.
 arm9=ndspy.codeCompression.decompress(rom.arm9);table=0x0209EAEC-rom.arm9RamAddress
 pairs=[struct.unpack_from('<HH',arm9,table+i*4)for i in range(627)]
 assert pairs[4]==(8,9)and pairs[17]==(24,25)and pairs[626]==(825,826)
 assert all(f[c][:4]==b'RGCN'and f[p][:4]==b'RLCN'for c,p in pairs)
 spec=importlib.util.spec_from_file_location('events',Path(__file__).with_name('extract-original-events.py'));events=importlib.util.module_from_spec(spec);spec.loader.exec_module(events)
 texts=files('a/0/0/2');names=events.messages(texts[54]);item_graphics={};sheet=Image.new('RGBA',(20*48,32*48),(238,238,238,255));draw=ImageDraw.Draw(sheet)
 for item in [3,4,17,22,25,26,27,28,30,155,442,621,626]:
  char,palette=pairs[item]
  frames=menu.cells(f,char,1,palette);im,box=frames[0];name=f'item-{item}.png';im.save(dest/name)
  item_graphics[str(item)]={'src':'assets/party-details/'+name,'origin':box[:2],'size':box[2:],'name':names[item]if item<len(names)else None,'source':{'archive':'a/0/2/5','char':char,'cells':1,'animation':0,'palette':palette,'mappingAddress':hex(0x0209EAEC+item*4)}}
  x=item%20*48;y=item//20*48;sheet.alpha_composite(im,(x+(48-im.width)//2,y));draw.text((x+2,y+31),str(item),fill='black')
 # Group contact sheets preserve PNG pixels; labels are research aids only.
 for section in ['party','summary']:
  records=[(key,cell)for key,g in groups.items()if key.startswith(section)for cell in g['cells']]
  sheet=Image.new('RGBA',(6*100,((len(records)+5)//6)*80),(235,235,235,255));draw=ImageDraw.Draw(sheet)
  for n,(key,cell)in enumerate(records):
   im=Image.open(output/cell['src']);x=n%6*100;y=n//6*80;sheet.alpha_composite(im,(x,y));draw.text((x,y+60),key,fill='black')
 data={'source':'Italian Black IRBI; additional original graphics, no complete native menu runtime claim','images':images,'groups':groups,'itemGraphics':item_graphics,'itemMap':item_graphics,'itemTable':{'address':'0x0209eaec','stride':4,'count':627,'pairs':pairs,'sha256':hashlib.sha256(arm9[table:table+627*4]).hexdigest(),'allResourceMagicValidated':True},'checks':{'groups':len(groups),'cells':sum(len(g['cells'])for g in groups.values()),'itemGraphics':len(item_graphics)},'revision':hashlib.sha256(b''.join(p.read_bytes()for p in sorted(dest.glob('*.png')))).hexdigest()[:12]}
 (output/'party-detail-assets.js').write_text('window.PARTY_DETAIL_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8',newline='\n');print(data['checks'])
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)
