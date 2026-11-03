"""IRBI Route 5 / Driftveil arrival, native encounters and level-30 policy.

Reuse the reviewed Nimbasa reader, preserving its form and ability-slot fixes.
Bridge shadows have no ordinary grass table: do not manufacture one.
"""
from pathlib import Path
try:
 import ndspy.rom
except ModuleNotFoundError:
 from irbi_reader import install
 install()
source=Path(__file__).with_name('extract-nimbasa-data.py').read_text(encoding='utf8')
# Apply the existing reader transformations without executing that reader yet.
source=source.split('exec(compile(source,')[0]
namespace={'__file__':str(Path(__file__).with_name('extract-nimbasa-data.py'))}
exec(compile(source,'nimbasa-reader-transform','exec'),namespace)
source=namespace['source']
source=source.replace('nimbasa-events.js','driftveil-events.js').replace('castelia-data.js','nimbasa-data.js')
source=source.replace('[326]','[63,64,329]').replace('for zone in [63,64,329]:','for zone in [329,253]:')
source=source.replace('groups[\'normal\'][\'rate\']',"groups.get('normal',{}).get('rate',0)")
source=source.replace('groups[\'normal\'][\'slots\']',"groups.get('normal',{}).get('slots',[])")
source=source.replace('[326,327,328,90,62,65]','[63,64,77,329,253,96,99]')
source=source.replace('<=25','<=30').replace("'levelCap':25","'levelCap':30")
source=source.replace('selected=obtainable|',"selected={p['id'] for old_file in ['training-data.js','pinwheel-data.js','castelia-data.js','nimbasa-data.js'] for p in json.loads((a.output/old_file).read_text(encoding='utf8').split('=',1)[1].rstrip(';\\n'))['progression'].values()}|obtainable|")
source=source.replace('(368,40)]','(368,40),(399,71)]').replace('368:259}','368:259,399:521}')
source=source.replace('nimbasa-data.js\').write_text','driftveil-data.js\').write_text').replace('window.NIMBASA_DATA=','window.DRIFTVEIL_DATA=')
exec(compile(source,str(Path(__file__).with_name('extract-pinwheel-data.py')),'exec'))
