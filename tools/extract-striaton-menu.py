"""Export original new-chapter menu icons and item graphics."""
from pathlib import Path
import argparse,importlib.util,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10,ndspy.codeCompression
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();r=ndspy.rom.NintendoDSRom.fromFile(a.rom)
sp=importlib.util.spec_from_file_location('menu',Path(__file__).with_name('extract-menu.py'));m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
def files(path):return [ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(r.getFileByName(path)).files]
f=files('a/0/0/7');icons={}
for sid,pi in [(511,1),(513,0),(515,0),(517,0),(518,0)]:
 patched=list(f);patched[0]=bytearray(f[0]);patched[0][40:72]=f[0][40+pi*32:72+pi*32];g={'cells':[],'animations':m.animations(f[1]),'source':{'archive':'a/0/0/7','char':sid*2+7,'palette':0,'paletteSlot':pi}}
 for i,(im,box)in enumerate(m.cells(patched,sid*2+7,2,0)):
  name=f'assets/menu/pokemon-{sid}-{i}.png';im.save(a.output/name);g['cells'].append({'src':name,'origin':box[:2],'size':box[2:]})
 icons[sid]=g
f=files('a/0/2/5');arm=ndspy.codeCompression.decompress(r.arm9);items={}
for iid in [22,25,27,28,30,58,79,155,410,420,437]:
 ch,pal=struct.unpack_from('<HH',arm,0x0209eaec-r.arm9RamAddress+iid*4);im,box=m.cells(f,ch,1,pal)[0];name=f'assets/party-details/item-{iid}.png';im.save(a.output/name);items[iid]={'src':name,'origin':box[:2],'size':box[2:],'source':{'archive':'a/0/2/5','char':ch,'palette':pal,'cells':1}}
(a.output/'striaton-menu.js').write_text('window.STRIATON_MENU='+json.dumps({'icons':icons,'items':items},separators=(',',':'))+';Object.assign(MENU_ASSETS.pokemonIcons,STRIATON_MENU.icons);Object.assign(PARTY_DETAIL_ASSETS.itemMap,STRIATON_MENU.items);\n',encoding='utf-8')
