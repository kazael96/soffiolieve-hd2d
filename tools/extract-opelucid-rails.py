"""Native rail references for the051 maps; merge only when the chapter registers."""
from pathlib import Path
from irbi_reader import install
install()

source = Path(__file__).with_name('extract-pinwheel-rails.py').read_text(encoding='utf8')
selected = [16, 17, 113, 114, 115, 116, 117, 118, 119, *range(205, 214), *range(157, 166), 345, 346, 347, 254, 349, 348, 120, *range(122, 136)]
source = source.replace('for zone,header in assign[:2]:', 'for zone,header in assign:\n if zone not in ' + repr(selected) + ':continue')
source = source.replace("'pinwheel-rails.js'", "'opelucid-rails.js'").replace('window.PINWHEEL_RAILS=', 'window.OPELUCID_RAILS=')
exec(compile(source, str(Path(__file__).with_name('extract-pinwheel-rails.py')), 'exec'))
