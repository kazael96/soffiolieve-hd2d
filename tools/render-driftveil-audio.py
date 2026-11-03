"""Original Driftveil/drawbridge/N event SSEQ, through the retained DS driver."""
from pathlib import Path
source=Path(__file__).with_name('render-pinwheel-audio.py').read_text(encoding='utf8')
source=source.replace('[1028,1038,1055,1062,1077,1127]','[1030,1056,1091,1092]')
exec(compile(source,str(Path(__file__).with_name('render-pinwheel-audio.py')),'exec'))
