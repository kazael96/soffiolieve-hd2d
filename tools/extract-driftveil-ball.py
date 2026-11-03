"""Repeat Ball: original IRBI character/palette 147/148 and shared cells."""
from pathlib import Path
try:
 import ndspy.rom
except ModuleNotFoundError:
 from irbi_reader import install
 install()
source=Path(__file__).with_name('extract-route2-ball.py').read_text(encoding='utf8')
source=source.replace('(136,135,129,130)','(148,147,129,130)').replace('129,130,135,136','129,130,147,148')
source=source.replace('greatball','repeatball').replace('route2-ball.js','driftveil-ball.js').replace('ROUTE2_BALL','DRIFTVEIL_BALL')
exec(compile(source,str(Path(__file__).with_name('extract-route2-ball.py')),'exec'))
