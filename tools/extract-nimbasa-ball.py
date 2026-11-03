"""Ultra Ball uses the shared IRBI cells with native characters/palette 133/134."""
from pathlib import Path
source=Path(__file__).with_name('extract-route2-ball.py').read_text(encoding='utf8')
source=source.replace('(136,135,129,130)','(134,133,129,130)').replace('129,130,135,136','129,130,133,134')
source=source.replace('greatball','ultraball').replace('route2-ball.js','nimbasa-ball.js').replace('ROUTE2_BALL','NIMBASA_BALL')
exec(compile(source,str(Path(__file__).with_name('extract-route2-ball.py')),'exec'))
