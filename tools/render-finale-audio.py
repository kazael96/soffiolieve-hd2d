"""Render original IRBI finale SSEQ tracks without changing earlier audio catalogs."""
from pathlib import Path
import argparse
import hashlib
import importlib.util
import json
import sys


def verified_silence(identifier, blob, entry, record, sdat_sha):
    if identifier != 1017 or record.get('nativeSilence') is not True or hashlib.sha256(blob).hexdigest() != record.get('nativeSequenceSHA256') or sdat_sha != record.get('sdatSHA256') or entry.offset != 0 or entry.volume != 65:
        raise ValueError('Unverified native silent sequence')
    return dict(record)


def build_source():
    reviewed = Path(__file__).with_name('render-league-audio.py')
    spec = importlib.util.spec_from_file_location('reviewed_league_audio', reviewed)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    source = module.build_source().replace('league-audio.js', 'finale-audio.js').replace('LEAGUE_AUDIO', 'FINALE_AUDIO').replace('LeagueAudio', 'FinaleAudio')
    # Native room142 effect1856 starts at90 and stops at610. Keep enough
    # source capture for this17.33s interval even if its SSEQ has no loop mark.
    source = source.replace('max_seconds=180 if identifier in MUSIC else 12', 'max_seconds=180 if identifier in MUSIC else 60')
    source = source.replace('sustained=identifier in [1748,1788,1773,1774]', 'sustained=identifier in [1856,1862]')
    source = source.replace('12 if sustained else None', '60 if sustained else None')
    return source


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for key in ['work', 'output', 'reference', 'report-dir']:
        parser.add_argument('--'+key, type=Path, required=True)
    parser.add_argument('--music', type=int, nargs='*', default=[])
    parser.add_argument('--sounds', type=int, nargs='*', default=[])
    args = parser.parse_args()
    if set(args.music) & set(args.sounds) or any(not 1000 <= value <= 2500 for value in args.music + args.sounds):
        raise ValueError('Invalid native sequence inventory')
    output = args.output.resolve()
    existing_path = output/'finale-audio.js'
    previous = json.JSONDecoder().raw_decode(existing_path.read_text(encoding='utf8').split('=', 1)[1])[0] if existing_path.exists() else {}
    scope = {'__name__': 'finale_audio_export', '__file__': str(Path(__file__).with_name('render-mistralton-audio.py'))}
    exec(compile(build_source(), scope['__file__'], 'exec'), scope)
    handlers={value: ['IRBI overlay21:021bb65c native object-emote kind'+str({1656:0,1840:1,1841:2}[value]) if value in [1656,1840,1841] else 'IRBI overlay64:021f3872 native597 ball trajectory' if value==1382 else 'IRBI finale native programs or overlay56:021f4284 sound table; selection follows the invoking task'] for value in args.sounds}
    report = {'status': 'PASS', 'music': [], 'sounds': [], 'failures': []}
    args.report_dir.mkdir(parents=True, exist_ok=True)
    silent_source = Path(__file__).parent.parent/'src/finale-silent-audio.js'
    silent_records = json.JSONDecoder().raw_decode(silent_source.read_text(encoding='utf8').split('=', 1)[1])[0]
    # Persist each verified track. A bad independent source must remain FAIL,
    # while the next attempt can reuse every completed, hash-checked render.
    for group, identifiers in [('music', args.music), ('sounds', args.sounds)]:
        for identifier in sorted(set(identifiers)):
            scope.update(MUSIC=[identifier] if group=='music' else [], SOUNDS=[identifier] if group=='sounds' else [], CRIES=[], SOUND_HANDLERS=handlers)
            try:
                if group=='music' and str(identifier) in silent_records:
                    work=args.work.resolve()
                    sys.path[:0]=[str(work/'audio-tools/python-packages'),str(work/'audio-tools/DualRip-2.2.1')]
                    from dualrip.formats.sdat import SdatFile
                    sdat_path=work/'audio/wb_sound_data.sdat'
                    arc=SdatFile(str(sdat_path)).sequence(identifier)
                    record=verified_silence(identifier,arc.blob,arc.entries[0],silent_records[str(identifier)],hashlib.sha256(sdat_path.read_bytes()).hexdigest())
                    if not existing_path.exists():
                        raise ValueError('Render a sounding track first to initialize the scoped native catalog')
                    source=existing_path.read_text(encoding='utf8')
                    prior,length=json.JSONDecoder().raw_decode(source.split('=',1)[1])
                    data={**prior,'music':{str(identifier):record},'sounds':{},'cries':{}}
                    proof={'music':[{'id':identifier,'method':'verified original rest-only SSEQ; no PCM','nativeSequenceSHA256':record['nativeSequenceSHA256']}],'sounds':[]}
                    print('music',identifier,'verified original rest-only SSEQ; no PCM',flush=True)
                else:
                    proof=scope['export'](args.work.resolve(), output, args.reference.resolve(), (args.report_dir/str(identifier)).resolve())
                    source = existing_path.read_text(encoding='utf8')
                    data, length = json.JSONDecoder().raw_decode(source.split('=', 1)[1])
                for key in ['music', 'sounds', 'cries']:
                    data[key] = {**previous.get(key, {}), **data.get(key, {})}
                suffix = source.split('=', 1)[1][length:]
                existing_path.write_text('window.FINALE_AUDIO='+json.dumps(data, separators=(',', ':'))+suffix, encoding='utf8', newline='\n')
                previous = data
                report[group].extend(proof[group])
            except Exception as error:
                report['status']='FAIL'
                report['failures'].append({'id': identifier, 'group': group, 'error': str(error)})
                print('FAIL', group, identifier, str(error), flush=True)
            (args.report_dir/'native-audio-report.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf8')
    print('Preserved', len(previous.get('cries', {})), 'previously verified native cries.')
    if report['failures']:
        raise ValueError(f"{len(report['failures'])} original sequences failed; see native-audio-report.json")


if __name__ == '__main__':
    main()
