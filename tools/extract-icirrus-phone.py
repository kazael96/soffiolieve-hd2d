"""Route7 call6. Native overlay174 selects text bank191 + call ID."""
import argparse
import importlib.util
import json
import struct
from pathlib import Path
from irbi_reader import NintendoDSRom, NARC, install
install()

parser = argparse.ArgumentParser()
parser.add_argument('rom', type=Path)
parser.add_argument('output', type=Path)
args = parser.parse_args()
rom = NintendoDSRom.fromFile(args.rom)
assert rom.idCode == b'IRBI'
call = NARC(rom.getFileByName('a/1/3/1')).files[68]
spec = importlib.util.spec_from_file_location('events', Path(__file__).with_name('extract-original-events.py'))
events = importlib.util.module_from_spec(spec)
spec.loader.exec_module(events)
data = {'source': 'IRBI a/1/3/1:68', 'id': 6, 'participants': list(call[:4]),
        'commands': list(struct.iter_unpack('<BBH', call[8:])),
        'textBank': 197, 'text': events.messages(NARC(rom.getFileByName('a/0/0/2')).files[197]),
        'textSource': {'overlay': 174, 'selector': '021b668a..021b669a', 'baseBank': 191}}
assert data['participants'] == [4, 0, 255, 255]
assert data['commands'] == [(1, 0, 0), (0, 0, 0)]
assert len(data['text']) == 1 and 'Percorso 7' in data['text'][0] and 'mamma' in data['text'][0]
(args.output / 'icirrus-phone.js').write_text('window.ICIRRUS_PHONE=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf8')
print('Call6: Mamma/Alcide, native bank197,', len(data['text']), 'message')
