"""IRBI Cold Storage, Clay, Route 6, Chargestone and Mistralton reference assets."""
from pathlib import Path
source=Path(__file__).with_name('extract-castelia.py').read_text(encoding='utf8')
source=source.replace('selected=[28,29,30,31,32,33,34,35,38,40,41,51,56]','selected=[96,97,98,191,192,193,194,195,196,197,331,107,109]')
source=source.replace('castelia','mistralton').replace('CASTELIA','MISTRALTON').replace("f'ca-","f'mt-")
# The reviewed base reader already imports the Castelia command evidence.
source=source.replace("with_name('mistralton-opcodes.json')","with_name('castelia-opcodes.json')")
source=source.replace('import inspect',"table.update({k:v['spec'] for name in ['nimbasa','driftveil','mistralton'] for k,v in json.loads(Path(__file__).with_name(name+'-opcodes.json').read_text(encoding='utf8')).items()})\nimport inspect")
exec(compile(source,str(Path(__file__).with_name('extract-castelia.py')),'exec'))
