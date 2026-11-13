"""Bake native overlay203 movie sound handles, controls and BGM fades with the DS driver."""
import argparse
import hashlib
import json
from pathlib import Path
import sys


def signed(value):
    return value - 4294967296 if value >= 2147483648 else value


def sample_span(start, stop, rate=32768):
    return round(stop*rate/30)-round(start*rate/30)


def plan(film):
    """Explicit sound-player0/1/2 replacement, stop and native movie30Hz cues."""
    events = [{**e, 'args': [signed(v) for v in e['args']]} for e in film['timeline']]
    result = []
    for index, event in enumerate(events):
        kind, start, args = event['kind'], event['frame'], event['args']
        if kind not in [1, 6]:
            continue
        sequence, controls, stop = args[0], [], film['frames']
        if kind == 1:
            volume, pan, pitch, player = args[1:5]
            if not 0 <= volume <= 127 or not -128 <= pan <= 127 or not -32768 <= pitch <= 32767 or player not in [0, 1, 2]:
                raise ValueError('Unreviewed native movie sound control')
            controls = [{'frame': 0, 'playerVolume127': volume, 'pan128': pan, 'pitch64': pitch}]
            for later in events[index+1:]:
                other = later['args']
                replace = later['kind'] == 1 and other[4] == player
                ended = later['kind'] == 2 and (other[1] == player or other[1] == -1 and other[0] == sequence)
                if replace or ended:
                    stop = later['frame']
                    break
        else:
            player = 'music'
            for later in events[index+1:]:
                if later['kind'] == 6:
                    stop = later['frame']
                    break
                if later['kind'] == 8:
                    direction, duration = later['args'][:2]
                    if direction != 1 or duration < 1:
                        raise ValueError('Unreviewed native BGM fade')
                    fade = later['frame'] - start
                    controls.extend({'frame': fade+frame, 'playerVolume127': max(0,127-(127*frame)//duration)} for frame in range(duration+1))
                    stop = min(stop, later['frame']+duration)
                    break
        if stop < start:
            raise ValueError('Unordered native movie cue')
        result.append({'sequence': sequence, 'start': start, 'stop': stop, 'player': player, 'controls': controls})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ['work', 'output', 'report-dir']:
        parser.add_argument('--'+key, type=Path, required=True)
    parser.add_argument('--stone',action='store_true',help='Render native overlay64 task575 rather than overlay203 movies')
    args = parser.parse_args()
    work = args.work.resolve()
    sys.path[:0] = [str(work/'audio-tools/python-packages'),str(work/'audio-tools/DualRip-2.2.1'),str(work/'native-driver')]
    import numpy as np
    import soundfile as sf
    from dualrip.formats.sdat import SdatFile
    from automated_sseq import AutomatedRenderer, BankResolver
    file = args.output/('finale-stone-data.js' if args.stone else 'finale-cinematics-data.js')
    data = json.loads(file.read_text(encoding='utf-8').split('=',1)[1].strip().rstrip(';'))
    films=data['films'] if not args.stone else {'stone':data}
    if args.stone:
        data['timeline']=[{'frame':cue['frame'],'kind':1,'args':[cue['id'],127,0,0,0]}for cue in data['sounds']]
    sdat_path = work/'audio/wb_sound_data.sdat'
    sdat, rate = SdatFile(str(sdat_path)), 32768
    source_sha = hashlib.sha256(sdat_path.read_bytes()).hexdigest()
    args.report_dir.mkdir(parents=True,exist_ok=True)
    report = {'source':'IRBI overlay203 021beac8/021bed04/021bed1c; SDK sequence-player replacement and original retained DS driver','sdatSHA256':source_sha,'rate':rate,'movieHz':30,'audibleComparison':False,'films':{}}
    if args.stone:report['source']='IRBI overlay64:021f372c task575 stop/replacement cues at0/108/131/250; original retained DS driver'
    for identifier, film in films.items():
        total = round(film['frames']*rate/30)
        mixed = np.zeros((total,2),dtype=np.int64)
        cues = []
        for cue in plan(film):
            count = sample_span(cue['start'],cue['stop'],rate)
            key = {**cue,'count':count,'sdatSHA256':source_sha,'policy':'native-player-replace-v1'}
            digest = hashlib.sha256(json.dumps(key,sort_keys=True).encode()).hexdigest()
            cache = args.report_dir/(digest+'.flac')
            metadata = cache.with_suffix('.json')
            prior = json.loads(metadata.read_text()) if metadata.exists() else {}
            if cache.exists() and prior.get('digest') == digest and hashlib.sha256(cache.read_bytes()).hexdigest() == prior.get('sha256'):
                audio, sample_rate = sf.read(cache,dtype='int16',always_2d=True)
                if sample_rate != rate or len(audio) != count:
                    raise ValueError('Invalid cached native cue')
            elif count:
                arc = sdat.sequence(cue['sequence'])
                entry = arc.entries[0]
                bank, waves = sdat.bank(BankResolver(sdat,arc).resolve(entry))
                renderer = AutomatedRenderer(arc.blob,entry.offset,bank,waves,entry.volume,rate,player_prio=entry.cpr or 0,loop_passes=100000,automation=cue['controls'],fps=30)
                blocks = []
                while not renderer.finished and renderer.total < count:
                    block = renderer.step()
                    if block is not None:
                        blocks.append(block)
                audio = np.concatenate(blocks)[:count] if blocks else np.empty((0,2),np.int16)
                if len(audio) < count:
                    audio = np.pad(audio,((0,count-len(audio)),(0,0)))
                sf.write(cache,audio,rate,format='FLAC',subtype='PCM_16')
                metadata.write_text(json.dumps({'digest':digest,'sha256':hashlib.sha256(cache.read_bytes()).hexdigest()})+'\n',encoding='utf-8')
            else:
                audio = np.empty((0,2),np.int16)
            at = round(cue['start']*rate/30)
            mixed[at:at+len(audio)] += audio.astype(np.int64)
            cues.append({**cue,'samples':len(audio),'pcmSHA256':hashlib.sha256(audio.tobytes()).hexdigest()})
            print('film',identifier,'sequence',cue['sequence'],'player',cue['player'],'frames',cue['start'],cue['stop'],flush=True)
        pcm = np.clip(mixed,-32768,32767).astype(np.int16)
        if not np.any(pcm):
            raise ValueError('Empty native movie mix')
        target = args.output/'assets/finale/stone/audio.flac' if args.stone else args.output/'assets/finale/cinematics'/identifier/'audio.flac'
        sf.write(target,pcm,rate,format='FLAC',subtype='PCM_16')
        decoded, sample_rate = sf.read(target,dtype='int16',always_2d=True)
        if sample_rate != rate or not np.array_equal(decoded,pcm):
            raise ValueError('Native movie PCM round-trip mismatch')
        record = {'src':target.relative_to(args.output).as_posix(),'rate':rate,'duration':len(pcm)/rate,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'nativePitchAndVolumeBaked':True,'nativeHandleReplacement':True}
        film['audio'] = record
        report['films'][identifier] = {**record,'cues':cues,'clippedSamples':int(np.count_nonzero(np.abs(mixed)>32767))}
        file.write_text(('window.FINALE_STONE=' if args.stone else 'window.FINALE_CINEMATICS=')+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8')
        (args.report_dir/'report.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(('Native Light Stone soundtrack' if args.stone else 'Five native movie soundtracks')+' complete; numerical verification only',flush=True)


if __name__ == '__main__':
    main()
