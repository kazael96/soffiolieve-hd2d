"""Route 4 and Nimbasa arrival; reuse the audited IRBI map/event readers."""
from pathlib import Path
source=Path(__file__).with_name('extract-castelia.py').read_text(encoding='utf8')
source=source.replace('selected=[28,29,30,31,32,33,34,35,38,40,41,51,56]','selected=[326,327,328,90,62,65]')
source=source.replace('if zone in [28,41]:continue','if zone in []:continue')
source=source.replace('castelia-assets','nimbasa-assets').replace('castelia-events','nimbasa-events')
source=source.replace('CASTELIA_ASSETS','NIMBASA_ASSETS').replace('CASTELIA_EVENTS','NIMBASA_EVENTS')
source=source.replace('assets/castelia','assets/nimbasa').replace("f'ca-", "f'nb-")
source=source.replace('Converting Castelia zone','Converting Route4/Nimbasa zone')
source=source.replace('import inspect',"table.update({k:v['spec'] for k,v in json.loads(Path(__file__).with_name('nimbasa-opcodes.json').read_text(encoding='utf8')).items()})\nimport inspect")
exec(compile(source,str(Path(__file__).with_name('extract-castelia.py')),'exec'))
