"""IRBI Nimbasa story, Route 5, Driftveil bridge and city arrival."""
from pathlib import Path
source=Path(__file__).with_name('extract-castelia.py').read_text(encoding='utf8')
source=source.replace('selected=[28,29,30,31,32,33,34,35,38,40,41,51,56]','selected=[62,63,64,77,91,329,330,253,96,99]')
source=source.replace('if zone in [28,41]:continue','if zone in [62]:continue')
source=source.replace('castelia-assets','driftveil-assets').replace('castelia-events','driftveil-events').replace('CASTELIA_ASSETS','DRIFTVEIL_ASSETS').replace('CASTELIA_EVENTS','DRIFTVEIL_EVENTS').replace('assets/castelia','assets/driftveil').replace("f'ca-","f'dv-")
source=source.replace('Converting Castelia zone','Converting Nimbasa/Driftveil zone')
source=source.replace('import inspect',"table.update({k:v['spec'] for k,v in json.loads(Path(__file__).with_name('nimbasa-opcodes.json').read_text(encoding='utf8')).items()})\ntable.update({k:v['spec'] for k,v in json.loads(Path(__file__).with_name('driftveil-opcodes.json').read_text(encoding='utf8')).items()})\nimport inspect")
exec(compile(source,str(Path(__file__).with_name('extract-castelia.py')),'exec'))
