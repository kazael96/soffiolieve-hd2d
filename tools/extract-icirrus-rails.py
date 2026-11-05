"""Native curved stairs of Celestial Tower, using the existing rail decoder."""
from pathlib import Path
import irbi_reader
irbi_reader.install()

source=Path(__file__).with_name('extract-pinwheel-rails.py').read_text(encoding='utf8')
source=source.replace('for zone,header in assign[:2]:','for zone,header in assign:\n if zone not in [338,339,340,341,342]:continue')
source=source.replace("'pinwheel-rails.js'","'icirrus-rails.js'").replace('window.PINWHEEL_RAILS=','window.ICIRRUS_RAILS=')
source=source.replace("+';\\n',encoding='utf8')", "+';Object.assign(PINWHEEL_RAILS,ICIRRUS_RAILS);\\n',encoding='utf8')")
exec(compile(source,str(Path(__file__).with_name('extract-pinwheel-rails.py')),'exec'))
