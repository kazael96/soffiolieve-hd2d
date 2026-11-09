"""Export the three native icon palette candidates for visual review only."""
import argparse
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root.parent / 'audio-tools/python-packages'))
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('rom', type=Path)
parser.add_argument('output', type=Path)
args = parser.parse_args()


def read(name):
    raw = (root / 'src' / f'{name}-data.js').read_text(encoding='utf8')
    return json.loads(raw.split('=', 1)[1].rstrip(';\n'))


old = {row['id'] for row in read('icirrus')['progression'].values()}
ids = sorted({row['id'] for row in read('opelucid')['progression'].values()} - old)
original = Path(__file__).with_name('extract-route3-menu.py')
source = original.read_text(encoding='utf8')
marker = '[(519,0),(522,0),(524,0),(527,0),(532,1),(535,2)]'
assert marker in source
for palette in range(3):
    target = args.output / f'p{palette}'
    (target / 'assets/menu').mkdir(parents=True, exist_ok=True)
    (target / 'assets/party-details').mkdir(parents=True, exist_ok=True)
    variant = source.replace(marker, repr([(sid, palette) for sid in ids])).replace('[14,18,21,150,373]', '[]')
    sys.argv = [str(original), str(args.rom), str(target)]
    exec(compile(variant, str(original), 'exec'), {'__file__': str(original)})
print('Native palette candidates:', len(ids), 'species x3; not a native LUT implementation')
