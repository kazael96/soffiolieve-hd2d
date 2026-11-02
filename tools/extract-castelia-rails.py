"""Add the native Castelia central plaza rail map to the existing rail geometry."""
from pathlib import Path
source=Path(__file__).with_name('extract-pinwheel-rails.py').read_text(encoding='utf8')
source=source.replace('for zone,header in assign[:2]:','for zone,header in assign:\n if zone!=30:continue')
source=source.replace("'pinwheel-rails.js'","'castelia-rails.js'").replace('window.PINWHEEL_RAILS=','window.CASTELIA_RAILS=')
exec(compile(source,str(Path(__file__).with_name('extract-pinwheel-rails.py')),'exec'))
