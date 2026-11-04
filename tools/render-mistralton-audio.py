"""Export chapter049 field music, native lift/crystal effects and21 native cries.

Existing verified native clips are reused byte-for-byte.  Missing SSEQ clips are
rendered with the retained original DS driver.  Shared catalogs are never edited.
"""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
import struct
import sys
import wave

MUSIC = [1030, 1031, 1046, 1047, 1048, 1049, 1060, 1063, 1078, 1079]
SOUNDS = [1370, 1698, 1699, 1738, 1739, 1741, 1742, 1754]
SOUND_HANDLERS = {1738:['overlay43:021f3ad6','overlay43:021f3ccc','overlay43:021f3f94','overlay44:021f372e'],
                  1739:['overlay43:021f3b14','overlay43:021f3d08','overlay43:021f3f66','overlay44:021f3758'],
                  1741:['overlay43:021f3f2a','overlay43:021f4022'],
                  1754:['overlay43:021f3cc8','overlay44:021f372a'],
                  1370:['overlay51:021f39da/021f39dc'],1742:['overlay51:021f3914/021f3916'],1699:['overlay51:021f3962/021f3916'],1698:['overlay21:021c8eb4/021c8eb6']}
CRIES = [508,521,529,530,549,555,564,566,575,581,582,583,585,586,588,590,592,595,597,599,602]


def catalog(path):
    return json.JSONDecoder().raw_decode(path.read_text(encoding='utf8').split('=', 1)[1])[0]


def export(work, output, reference, report_dir):
    sys.path[:0] = [str(work/'audio-tools/python-packages'), str(work/'audio-tools/DualRip-2.2.1'), str(work/'native-driver')]
    import numpy as np
    import soundfile as sf
    from dualrip.formats.sdat import SdatFile
    from automated_sseq import render_sequence
    sdat_path = work/'audio/wb_sound_data.sdat'
    sdat = SdatFile(str(sdat_path))
    raw_sdat = sdat_path.read_bytes()
    old_music = catalog(reference/'field-audio.js')
    existing = catalog(output/'mistralton-audio.js') if (output/'mistralton-audio.js').exists() else {}
    retained = {**existing.get('music', {}), **existing.get('sounds', {})}
    old_cries = json.loads((reference/'assets/audio-catalog.json').read_text(encoding='utf8'))['cries']
    result = {'source': 'IRBI wb_sound_data.sdat; native SSEQ/DS driver and original SWAV PCM',
              'sdatSha256': hashlib.sha256(raw_sdat).hexdigest(), 'music': {}, 'sounds': {}, 'cries': {}}
    report = {'music': [], 'sounds': [], 'cries': []}
    for identifier in [*MUSIC, *SOUNDS]:
        key = str(identifier)
        target = output/f'assets/field-audio/{identifier}.flac'
        target.parent.mkdir(parents=True, exist_ok=True)
        if key in retained and (output/retained[key]['src']).is_file():
            record = retained[key]
            method = 'reused scoped native render'
        elif key in old_music and (reference/old_music[key]['src']).is_file():
            record = old_music[key]
            shutil.copyfile(reference/record['src'], target)
            method = 'reused verified native render'
        else:
            audio, marks = render_sequence(sdat, identifier, max_seconds=180 if identifier in MUSIC else 12)
            if not len(audio) or not np.any(audio != 0):
                raise ValueError(f'Empty native sequence {identifier}')
            if marks:
                if not 0 <= marks[0] < marks[1] <= len(audio):
                    raise ValueError(f'Invalid native loop {identifier}: {marks}')
                audio = audio[:marks[1]]
            sf.write(str(target), audio, 32768, format='FLAC', subtype='PCM_16')
            record = {'src': target.relative_to(output).as_posix(), 'name': f'IRBI_SSEQ_{identifier}',
                      'duration': len(audio)/32768, 'rate': 32768,
                      'loop': [x/32768 for x in marks] if marks else None}
            method = 'retained native DS driver render'
        audio, rate = sf.read(str(target), dtype='int16', always_2d=True)
        if rate != record['rate'] or len(audio) != round(record['duration']*rate) or not np.any(audio != 0):
            raise ValueError(f'Native sequence verification failed {identifier}')
        if record['loop'] and not 0 <= record['loop'][0] < record['loop'][1] <= len(audio)/rate + 1/rate:
            raise ValueError(f'Native loop exceeds decoded clip {identifier}')
        record = {**record, 'sha256': hashlib.sha256(target.read_bytes()).hexdigest()}
        group = 'music' if identifier in MUSIC else 'sounds'
        if identifier in SOUNDS:
            sustained=identifier in [1738,1741,1754]
            record.update({'sustain':sustained,'captureLimitSeconds':12 if sustained else None,
                           'nativeHandlers':SOUND_HANDLERS[identifier]})
        result[group][key] = record
        report[group].append({'id': identifier, 'method': method, 'frames': len(audio),
                                'rate': rate, 'peak': int(np.abs(audio.astype(np.int32)).max()),
                                'loop': record['loop'], 'sha256': record['sha256'],
                                **({'sustain':record['sustain'],'captureLimitSeconds':record['captureLimitSeconds'],
                                    'nativeHandlers':record['nativeHandlers']}if identifier in SOUNDS else {})})
        print(group, identifier, record['duration'], method, flush=True)
    for identifier in CRIES:
        key = str(identifier)
        record = old_cries[key]
        source = raw_sdat[record['sdatOffset']:record['sdatOffset']+record['sourceBytes']]
        if hashlib.sha256(source).hexdigest() != record['sourceSha256']:
            raise ValueError(f'Original SWAV source mismatch {identifier}')
        target = output/record['file']
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(reference/record['file'], target)
        with wave.open(str(target), 'rb') as wav:
            if wav.getnchannels() != 1 or wav.getsampwidth() != 2 or wav.getframerate() != record['sampleRate'] or wav.getnframes() != record['samples']:
                raise ValueError(f'Original cry WAV mismatch {identifier}')
            pcm = wav.readframes(wav.getnframes())
        if not any(pcm):
            raise ValueError(f'Silent original cry {identifier}')
        result['cries'][key] = {**record, 'wavSha256': hashlib.sha256(target.read_bytes()).hexdigest()}
        report['cries'].append({'id': identifier, 'samples': record['samples'], 'rate': record['sampleRate'],
                                'nativeSpeed': record['nativeSpeed'], 'baseVolume': record['baseVolume'],
                                'sourceSha256': record['sourceSha256'], 'wavSha256': result['cries'][key]['wavSha256']})
    output.mkdir(parents=True, exist_ok=True)
    installer = """;
(function(root){
 function install(field=root.FIELD_AUDIO,cries=root.ROM_AUDIO_CATALOG?.cries){
  if(!field||!cries)throw Error('Native audio catalogs unavailable');
  Object.assign(field,root.MISTRALTON_AUDIO.music,root.MISTRALTON_AUDIO.sounds);Object.assign(cries,root.MISTRALTON_AUDIO.cries);return true;
 }
 root.MistraltonAudio={install};
 if(root.FIELD_AUDIO&&root.ROM_AUDIO_CATALOG?.cries)install();
})(typeof window!=='undefined'?window:globalThis);
"""
    (output/'mistralton-audio.js').write_text('window.MISTRALTON_AUDIO='+json.dumps(result,separators=(',', ':'))+installer,encoding='utf8',newline='\n')
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir/'native-audio-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--work', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--reference', type=Path, required=True)
    parser.add_argument('--report-dir', type=Path, required=True)
    args = parser.parse_args()
    report = export(args.work, args.output, args.reference, args.report_dir)
    print('Verified', len(report['music']), 'native music clips,',len(report['sounds']),'native lift/crystal effects and', len(report['cries']), 'native cries')
