"""Export Castelia trainers, gifts and legal progression using the IRBI tables."""
from pathlib import Path
# Reuse the audited binary readers; only the chapter selection changes.
source=Path(__file__).with_name('extract-pinwheel-data.py').read_text(encoding='utf8')
source=source.replace("'pinwheel-events.js'","'castelia-events.js'")
source=source.replace("[18,19,154,155]","[29,31,51]")
source=source.replace("for zone in [154,155]:","for zone in []:")
source=source.replace('changed=True\nwhile changed:',"obtainable|={row['id'] for row in json.loads((a.output/'pinwheel-data.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\\n'))['progression'].values() if row['obtainable']}\nchanged=True\nwhile changed:")
source=source.replace("if method and ((method==4 and param<=25)or method in [1,2,3]):","if method and ((method==4 and param<=25)or method in [1,2,3] or method==8 and param in [82,84,85]):")
source=source.replace("(619,93)]","(619,93),(403,75),(397,69)]")
source=source.replace("not in [154,155]","not in [29,30,31,32,33,34,35,38,40,51,56]")
source=source.replace("14,18,21,27,30,81,91,150,155,217,373,394,413,619,471,579","14,18,21,27,30,81,82,84,85,91,150,155,188,217,373,394,403,413,619,471,579,591")
source=source.replace("data={'source'", "ids|={c['args'][1] for p in programs.values() for c in p['code'].values() if c['name'] in ['WorkSet','WorkSetConst'] and c['args'][0]==32768 and 0<c['args'][1]<639}\ndata={'source'")
source=source.replace("619:249}","619:249,403:522,397:148}")
source=source.replace("(a.output/'pinwheel-data.js').write_text","(a.output/'castelia-data.js').write_text").replace('window.PINWHEEL_DATA=','window.CASTELIA_DATA=')
exec(compile(source,str(Path(__file__).with_name('extract-pinwheel-data.py')),'exec'))
