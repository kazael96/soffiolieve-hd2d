"""Reuse verified original PCM after matching every SWAV against the native SDAT."""
import argparse
import hashlib
import json
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read_catalog(path):
    text = path.read_text(encoding='utf-8')
    offset = text.index('=') + 1
    data, end = json.JSONDecoder().raw_decode(text[offset:].lstrip())
    start = offset + len(text[offset:]) - len(text[offset:].lstrip())
    return data, text[:start], text[start + end:]


def export(reference, sdat, report):
    previous = {p['id'] for p in read_catalog(ROOT / 'src/opelucid-data.js')[0]['progression'].values()}
    ids = sorted({p['id'] for p in read_catalog(ROOT / 'src/league-data.js')[0]['progression'].values()} - previous)
    assert len(ids) == 13
    file = ROOT / 'src/league-audio.js'
    audio, prefix, suffix = read_catalog(file)
    raw = sdat.read_bytes()
    digest = lambda b: hashlib.sha256(b).hexdigest()
    if digest(raw) != audio['sdatSha256']:
        raise ValueError('Wrong original SDAT')
    catalog = json.loads((reference / 'assets/audio-catalog.json').read_text(encoding='utf-8'))['cries']
    records = []
    for sid in ids:
        record = catalog[str(sid)]
        source = raw[record['sdatOffset']:record['sdatOffset'] + record['sourceBytes']]
        if digest(source) != record['sourceSha256']:
            raise ValueError(f'SWAV mismatch {sid}')
        relative = Path(record['file'])
        if relative.is_absolute() or '..' in relative.parts or relative.suffix != '.wav':
            raise ValueError('Unsafe cry asset')
        data = (reference / relative).read_bytes()
        with wave.open(str(reference / relative), 'rb') as wav:
            if (wav.getnchannels(), wav.getsampwidth(), wav.getframerate(), wav.getnframes()) != (1, 2, record['sampleRate'], record['samples']):
                raise ValueError(f'PCM format mismatch {sid}')
            if not any(wav.readframes(wav.getnframes())):
                raise ValueError(f'Silent cry {sid}')
        target = ROOT / 'src' / relative
        if target.exists() and target.read_bytes() != data:
            raise ValueError(f'Existing asset differs {sid}')
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        audio['cries'][str(sid)] = {**record, 'wavSha256': digest(data)}
        records.append({'id': sid, 'sourceSha256': record['sourceSha256'], 'wavSha256': digest(data), 'samples': record['samples'], 'nativeSpeed': record['nativeSpeed'], 'baseVolume': record['baseVolume']})
    file.write_text(prefix + json.dumps(audio, ensure_ascii=False, separators=(',', ':')) + suffix, encoding='utf-8')
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps({'sdatSha256': digest(raw), 'method': 'original verified SWAV/PCM reuse; no audible comparison', 'cries': records}, indent=2) + '\n', encoding='utf-8')
    print(f'Verified and exported {len(records)} original cries')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ['reference', 'sdat', 'report']:
        parser.add_argument('--' + name, type=Path, required=True)
    args = parser.parse_args()
    export(args.reference, args.sdat, args.report)
