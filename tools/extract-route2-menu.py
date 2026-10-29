"""Export Purrloin's original menu icon, using palette 0 verified against its native colours."""
from pathlib import Path
import argparse,importlib.util,json
import ndspy.rom,ndspy.narc,ndspy.lz10
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
sp=importlib.util.spec_from_file_location('menu',Path(__file__).with_name('extract-menu.py'));m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m)
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
f=ndspy.narc.NARC(r.getFileByName('a/0/0/7')).files;f=[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in f]
group={'source':{'archive':'a/0/0/7','char':1025,'cells':2,'palette':0,'paletteSlot':0},'cells':[],'animations':m.animations(f[1])}
for i,(im,box)in enumerate(m.cells(f,1025,2,0)):
 name=f'assets/menu/pokemon-509-{i}.png';im.save(a.output/name);group['cells'].append({'src':name,'origin':box[:2],'size':box[2:]})
(a.output/'route2-menu.js').write_text('window.ROUTE2_MENU='+json.dumps({'icons':{'509':group}},separators=(',',':'))+';Object.assign(MENU_ASSETS.pokemonIcons,ROUTE2_MENU.icons);\n',encoding='utf8')
