"""Export the reviewed native rail format for the explicit chapter052 scope."""
from pathlib import Path
import runpy
from irbi_reader import install

install()
selected = runpy.run_path(str(Path(__file__).with_name('extract-league.py')))['SELECTED']
source = Path(__file__).with_name('extract-pinwheel-rails.py').read_text(encoding='utf-8')
marker = 'for zone,header in assign[:2]:'
if source.count(marker) != 1:
    raise ValueError('Reviewed rail exporter entry point changed')
source = source.replace(marker, 'for zone,header in assign:\n if zone not in ' + repr(selected) + ':continue')
source = source.replace("'pinwheel-rails.js'", "'league-rails.js'").replace('window.PINWHEEL_RAILS=', 'window.LEAGUE_RAILS=')
exec(compile(source, str(Path(__file__).with_name('extract-pinwheel-rails.py')), 'exec'))
