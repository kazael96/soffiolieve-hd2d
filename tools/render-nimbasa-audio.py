"""Original Route 4 seasonal, Nimbasa and bicycle SSEQ via the audited DS driver."""
from pathlib import Path
source=Path(__file__).with_name('render-pinwheel-audio.py').read_text(encoding='utf8')
source=source.replace('[1028,1038,1055,1062,1077,1127]','[1012,1029,1042,1043,1044,1045]')
exec(compile(source,str(Path(__file__).with_name('render-pinwheel-audio.py')),'exec'))
