"""Reuse the verified WB/GC sampler tables; never substitute mesh heights for NG."""
from pathlib import Path

source = Path(__file__).with_name('extract-opelucid-surfaces.py').read_text(encoding='utf-8')
source = source.replace('opelucid', 'league').replace('OPELUCID', 'LEAGUE').replace('op-', 'lg-').replace('Native051', 'Native052')
marker = "assets, prior = read('league-assets.js'), read('native-surface-data.js')"
if source.count(marker) != 1:
    raise ValueError('Reviewed surface exporter inputs changed')
source = source.replace(marker, "assets = read('league-assets.js')\nshared = Path(__file__).resolve().parents[1] / 'src/native-surface-data.js'\nprior = json.loads(shared.read_text(encoding='utf-8').split('=', 1)[1].rstrip(';\\n'))")
exec(compile(source, str(Path(__file__).with_name('extract-opelucid-surfaces.py')), 'exec'))
