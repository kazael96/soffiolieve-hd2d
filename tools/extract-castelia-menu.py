"""Original party icons and gift-item icons for the Castelia chapter."""
from pathlib import Path
source=Path(__file__).with_name('extract-route3-menu.py').read_text(encoding='utf8')
source=source.replace('[(519,0),(522,0),(524,0),(527,0),(532,1),(535,2)]','[(512,1),(514,0),(516,0),(557,0)]')
source=source.replace('[14,18,21,150,373]',"[82,84,85,188,223,228,255,397,403,591]")
source=source.replace("'route3-menu.js'","'castelia-menu.js'").replace('ROUTE3_MENU','CASTELIA_MENU')
exec(compile(source,str(Path(__file__).with_name('extract-route3-menu.py')),'exec'))
