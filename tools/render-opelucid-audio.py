"""Extend the verified native audio exporter; optionally prepare just Gym114."""
from pathlib import Path
import argparse

previous=Path(__file__).with_name('render-icirrus-audio.py')
text=previous.read_text(encoding='utf8').split('p=argparse.ArgumentParser()')[0]
text=text.replace('icirrus','opelucid').replace('ICIRRUS','OPELUCID').replace('Icirrus','Opelucid')
text=text.replace("old=read(root/'src/mistralton-data.js')","old=read(root/'src/icirrus-data.js')")
namespace={'__file__':str(previous)}
exec(compile(text,str(previous),'exec'),namespace)
source=namespace['source'].replace("previous = catalog(output/'mistralton-audio.js')","previous = catalog(output/'mistralton-audio.js')\n    prior_chapter = catalog(output/'icirrus-audio.js')")
source=source.replace("retained = {**previous.get('music', {}),","retained = {**prior_chapter.get('music', {}), **prior_chapter.get('sounds', {}), **previous.get('music', {}),")
source=source.replace('sustained=identifier in [1738,1741,1754]','sustained=identifier in [1738,1741,1754,1744]')
scope={'__name__':'opelucid_audio_export','__file__':str(Path(__file__).with_name('render-mistralton-audio.py'))}
exec(compile(source,scope['__file__'],'exec'),scope)
handlers={1743:['IRBI program228 switch SEPlay'],1744:['overlay45:021f39aa/platform start'],1776:['overlay45:021f39da–021f39e2/platform stop/finish']}
handlers[1665]=['IRBI583 independent actor fall: overlay21:021c7652']
handlers[1650]=['IRBI417/effect17: overlay21:021da10c sound table, frame24']
handlers[1952]=['IRBI193 sand sink: overlay21:021bfee6..021bfeea']
native_cries=set(namespace['cries'])
for bank,program in namespace['events']['scripts'].items():
 for pc,command in program['code'].items():
  if command['name']=='PVPlay' and 0<command['args'][0]<=649:native_cries.add(command['args'][0])
  if command['name'] in ['SEPlay','MEPlay']:handlers.setdefault(command['args'][0],[]).append(f'IRBI bank{bank}:PC{pc}/{command["name"]}')
p=argparse.ArgumentParser(description=__doc__)
for key in ['work','output','reference','report-dir']:p.add_argument('--'+key,type=Path,required=True)
p.add_argument('--gym-only',action='store_true');a=p.parse_args()
scope.update(MUSIC=[1062]if a.gym_only else sorted(namespace['music']),SOUNDS=[1743,1744,1776]if a.gym_only else sorted(handlers),SOUND_HANDLERS=handlers,CRIES=[]if a.gym_only else sorted(native_cries))
report=scope['export'](a.work.resolve(),a.output.resolve(),a.reference.resolve(),a.report_dir.resolve())
print('Verified051 native audio:',len(report['music']),'music,',len(report['sounds']),'effects,',len(report['cries']),'cries; gym-only=',a.gym_only)
