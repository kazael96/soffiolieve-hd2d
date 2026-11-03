"""Original icons for the new level30 roster and chapter rewards."""
from pathlib import Path
try:
 import ndspy.rom
except ModuleNotFoundError:
 from irbi_reader import install
 install()
source=Path(__file__).with_name('extract-route3-menu.py').read_text(encoding='utf8')
source=source.replace('[(519,0),(522,0),(524,0),(527,0),(532,1),(535,2)]','[(523,0),(545,0),(552,1),(561,0),(572,0),(573,0),(574,0),(580,0),(587,0)]')
source=source.replace('[14,18,21,150,373]','[9,52,57,399,578]')
source=source.replace('route3-menu.js','driftveil-menu.js').replace('ROUTE3_MENU','DRIFTVEIL_MENU')
exec(compile(source,str(Path(__file__).with_name('extract-route3-menu.py')),'exec'))
