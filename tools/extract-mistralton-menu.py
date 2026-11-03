"""Original 0.49 menu icons; explicit palettes reviewed in palette-proof.png."""
from pathlib import Path
try:
 import ndspy.rom
except ModuleNotFoundError:
 from irbi_reader import install
 install()
source=Path(__file__).with_name('extract-route3-menu.py').read_text(encoding='utf8')
# Palette slots selected from the native three-palette icon bank.
slots=[(508,2),(521,0),(529,0),(530,0),(549,1),(555,0),(564,2),(566,0),(575,0),(581,0),(582,0),(583,0),(585,1),(586,1),(588,0),(590,0),(592,0),(595,0),(597,1),(599,0),(602,0)]
slots += [(701,1),(702,0),(703,2),(704,1),(705,0),(706,1)]
source=source.replace('[(519,0),(522,0),(524,0),(527,0),(532,1),(535,2)]',repr(slots)).replace('[14,18,21,150,373]','[6,8,12,13,20,76,77,78,92,137,138,139,140,141,142,143,144,145,231,334,338,343,345,347,348,354,360,364,400,401,405,421,540]')
source=source.replace('231,334,338,343,345,347,348,354,360,364,400','231,334,338,343,345,347,348,354,360,364,382,385,400')
source=source.replace('route3-menu.js','mistralton-menu.js').replace('ROUTE3_MENU','MISTRALTON_MENU')
exec(compile(source,str(Path(__file__).with_name('extract-route3-menu.py')),'exec'))
