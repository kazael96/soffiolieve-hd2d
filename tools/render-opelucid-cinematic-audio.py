"""Render native film cues with SDK pitch/pan/player-volume before PCM mixing."""
import argparse,hashlib,json,sys
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__)
for key in ['work','output','report-dir']:p.add_argument('--'+key,type=Path,required=True)
a=p.parse_args();work=a.work.resolve();sys.path[:0]=[str(work/'audio-tools/python-packages'),str(work/'audio-tools/DualRip-2.2.1'),str(work/'native-driver')]
import numpy as np
import soundfile as sf
from dualrip.formats.sdat import SdatFile
from automated_sseq import render_sequence
file=a.output/'opelucid-cinematics-data.js';text=file.read_text(encoding='utf8');data=json.loads(text.split('=',1)[1].strip().rstrip(';'));sdat_path=work/'audio/wb_sound_data.sdat';sdat=SdatFile(str(sdat_path));sdat_hash=hashlib.sha256(sdat_path.read_bytes()).hexdigest();rate=32768;a.report_dir.mkdir(parents=True,exist_ok=True);report={'source':'IRBI203:021beac8 -> ARM9 volume020062bc / pitch-pan02006268; original SSEQ/SBNK/SWAR and retained DS driver','sdatSha256':sdat_hash,'rate':rate,'movieTickRate':30,'films':{}}
for id in ['13','14']:
 film=data['films'][id];frames=film['frames'];total=round(frames*rate/30);mixed=np.zeros((total,2),dtype=np.int64);cues=[]
 for event in film['timeline']:
  if event['kind']!=1:continue
  sequence,volume,pan,pitch,player=event['args'][:5];assert sequence in [2044,2045,2046,2047] and 0<=volume<=127 and -128<=pan<=127 and -32768<=pitch<=32767 and player in [0,1]
  start=event['frame'];stop=min([e['frame']for e in film['timeline']if e['kind']==2 and e['frame']>=start and e['args'][0]==sequence]+[frames]);count=round((stop-start)*rate/30)
  controls=[{'frame':0,'playerVolume127':volume,'pan128':pan,'pitch64':pitch}];key={'sequence':sequence,'controls':controls,'count':count,'sdatSha256':sdat_hash};digest=hashlib.sha256(json.dumps(key,sort_keys=True).encode()).hexdigest();cache=a.report_dir/(id+'-'+str(sequence));audio_path=cache.with_suffix('.flac');metadata_path=cache.with_suffix('.json');prior=json.loads(metadata_path.read_text())if metadata_path.exists()else{}
  if prior.get('digest')==digest and audio_path.exists()and hashlib.sha256(audio_path.read_bytes()).hexdigest()==prior.get('sha256'):
   audio,sample_rate=sf.read(audio_path,dtype='int16',always_2d=True);assert sample_rate==rate;marks=prior['loopMarks']
  else:
   audio,marks=render_sequence(sdat,sequence,automation=controls,max_seconds=count/rate+1);sf.write(audio_path,audio,rate,format='FLAC',subtype='PCM_16');metadata_path.write_text(json.dumps({'digest':digest,'sha256':hashlib.sha256(audio_path.read_bytes()).hexdigest(),'loopMarks':marks})+'\n')
  assert len(audio)>0 and np.any(audio!=0)
  if marks:
   lo,hi=marks;assert 0<=lo<hi<=len(audio);intro=audio[:lo];loop=audio[lo:hi];repetitions=max(0,(count-len(intro)+len(loop)-1)//len(loop));audio=np.concatenate([intro,*([loop]*repetitions)])[:count]
  else:audio=audio[:count]
  offset=round(start*rate/30);mixed[offset:offset+len(audio)]+=audio.astype(np.int64);cues.append({'sequence':sequence,'startFrame':start,'stopFrame':stop,'nativePlayer':player,'controls':controls,'loopMarks':marks,'renderedFrames':len(audio),'pcmSha256':hashlib.sha256(audio.tobytes()).hexdigest()});print('film',id,'cue',sequence,'native',volume,pan,pitch,'samples',len(audio),flush=True)
 first=min(c['startFrame']for c in cues);assert not np.any(mixed[:round(first*rate/30)]);pcm=np.clip(mixed,-32768,32767).astype(np.int16);target=a.output/'assets/opelucid/cinematics'/id/'audio.flac';target.parent.mkdir(parents=True,exist_ok=True);sf.write(target,pcm,rate,format='FLAC',subtype='PCM_16');decoded,sample_rate=sf.read(target,dtype='int16',always_2d=True);assert sample_rate==rate and np.array_equal(decoded,pcm)
 record={'src':target.relative_to(a.output).as_posix(),'rate':rate,'duration':len(pcm)/rate,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'nativePitchAndVolumeBaked':True,'cues':cues};film['audio']=record;report['films'][id]={**record,'peak':int(np.abs(pcm.astype(np.int32)).max()),'clippedSamples':int(np.count_nonzero(np.abs(mixed)>32767)),'audibleComparison':False}
file.write_text('window.OPELUCID_CINEMATICS='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8',newline='\n');(a.report_dir/'report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8');print('Native movie audio complete; waveform checks only, no audible comparison',flush=True)
