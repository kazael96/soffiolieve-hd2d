"""Original050 field music, scripted/cannon/bell effects and24 new cries."""
from pathlib import Path
import argparse
import json

root=Path(__file__).resolve().parents[1]
def read(path):return json.JSONDecoder().raw_decode(path.read_text(encoding='utf8').split('=',1)[1])[0]
events=read(root/'src/icirrus-events.js');old=read(root/'src/mistralton-data.js');current=read(root/'src/icirrus-data.js')
old_ids={r['id']for r in old['progression'].values()}
cries=sorted({r['id']for r in current['progression'].values()}-old_ids)
music={z['music']for z in events['zones'].values()}|{1013,1047,1048,1049}
handlers={i:[f'overlay41:{pc}']for i,pc in [(1688,'021f3910'),(1689,'021f3a1a'),(1696,'021f3a54'),(1686,'021f3a9a'),(1687,'021f3d34'),(1697,'021f3d4a')]}
handlers[1374]=['overlay10:021618a8/native field jump ascent (SEQ_SE_DANSA)']
for bank,program in events['scripts'].items():
 for pc,command in program['code'].items():
  name=command['name'];args=command['args']
  if name=='BGMPlay' and args[0]!=1001:music.add(args[0])
  if name in ['SEPlay','MEPlay']:handlers.setdefault(args[0],[]).append(f'IRBI bank{bank}:PC{pc}/{name}')
source=Path(__file__).with_name('render-mistralton-audio.py').read_text(encoding='utf8')
source=source.replace('mistralton-audio.js','icirrus-audio.js').replace('MISTRALTON_AUDIO','ICIRRUS_AUDIO').replace('MistraltonAudio','IcirrusAudio')
source=source.replace("old_music = catalog(reference/'field-audio.js')", "old_music = catalog(output/'field-audio.js')")
source=source.replace("elif key in old_music and (reference/old_music[key]['src']).is_file():", "elif key in old_music and ((output/old_music[key]['src']).is_file() or (reference/old_music[key]['src']).is_file()):")
source=source.replace("shutil.copyfile(reference/record['src'], target)", "native_source=output/record['src'] if (output/record['src']).is_file() else reference/record['src']\n            if native_source.resolve()!=target.resolve():shutil.copyfile(native_source,target)")
source=source.replace("report = {'music': [], 'sounds': [], 'cries': []}", """report = {'music': [], 'sounds': [], 'cries': []}
    report_dir.mkdir(parents=True,exist_ok=True)
    checkpoint=report_dir/'native-audio-checkpoint.json'
    if checkpoint.is_file():
        previous_render=json.loads(checkpoint.read_text(encoding='utf8'))
        for group in ['music','sounds']:
            for key,record in previous_render.get(group,{}).items():
                file=output/record['src']
                if file.is_file() and hashlib.sha256(file.read_bytes()).hexdigest()==record.get('sha256'):retained[key]=record""")
needle="        if rate != record['rate'] or len(audio) != round(record['duration']*rate) or not np.any(audio != 0):"
assert needle in source
source=source.replace(needle,"""        # Legacy field catalogs rounded duration to milliseconds. Retain the
        # original samples and expose their exact duration in this new catalog.
        if method.startswith('reused') and abs(len(audio)-record['duration']*rate)<=rate*.000501:
            record={**record,'duration':len(audio)/rate}
"""+needle)
source=source.replace("result[group][key] = record", "result[group][key] = record\n        checkpoint.write_text(json.dumps(result,separators=(',',':')),encoding='utf8')")
needle="retained = {**existing.get('music', {}), **existing.get('sounds', {})}"
assert needle in source
source=source.replace(needle,"""previous = catalog(output/'mistralton-audio.js')
    retained = {**previous.get('music', {}), **previous.get('sounds', {}), **existing.get('music', {}), **existing.get('sounds', {})}""")
scope={'__name__':'icirrus_audio_export','__file__':str(Path(__file__).with_name('render-mistralton-audio.py'))}
exec(compile(source,scope['__file__'],'exec'),scope)
scope.update(MUSIC=sorted(music),SOUNDS=sorted(handlers),SOUND_HANDLERS=handlers,CRIES=cries)
p=argparse.ArgumentParser()
for key in ['work','output','reference','report-dir']:p.add_argument('--'+key,type=Path,required=True)
a=p.parse_args();report=scope['export'](a.work.resolve(),a.output.resolve(),a.reference.resolve(),a.report_dir.resolve())
print('Verified050 native audio:',len(report['music']),'music,',len(report['sounds']),'effects,',len(report['cries']),'cries')
