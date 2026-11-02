"""Render newly used field sounds with the original DS driver."""
from pathlib import Path
source=Path(__file__).with_name('render-pinwheel-audio.py').read_text(encoding='utf8')
source=source.replace('[1028,1038,1055,1062,1077,1127]','[1306,1737,1734,1735,1621]')
exec(compile(source,str(Path(__file__).with_name('render-pinwheel-audio.py')),'exec'))
