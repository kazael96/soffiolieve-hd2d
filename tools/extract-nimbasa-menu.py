"""Original Route 4 species and item menu cells; palettes reviewed separately."""
from pathlib import Path
source=Path(__file__).with_name('extract-route3-menu.py').read_text(encoding='utf8')
source=source.replace('[(519,0),(522,0),(524,0),(527,0),(532,1),(535,2)]','[(550,1),(554,0),(559,0),(568,1)]')
source=source.replace('[14,18,21,150,373]','[2,19,60,158,355,368,450]')
source=source.replace('route3-menu.js','nimbasa-menu.js').replace('ROUTE3_MENU','NIMBASA_MENU')
exec(compile(source,str(Path(__file__).with_name('extract-route3-menu.py')),'exec'))
