"""Verify every original SWAV and PCM for the ten new first-ending species."""
from pathlib import Path
previous=Path(__file__).with_name('extract-league-cries.py')
source=previous.read_text(encoding='utf8')
source=source.replace("'src/opelucid-data.js'","'src/__previous-data.js'").replace("'src/league-data.js'","'src/finale-data.js'").replace("'src/__previous-data.js'","'src/league-data.js'")
source=source.replace("'src/league-audio.js'","'src/finale-audio.js'").replace('len(ids) == 13','len(ids) == 10')
exec(compile(source,str(previous),'exec'))
