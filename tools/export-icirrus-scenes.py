"""Export small native descriptors; geometry remains deferred until arrival."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'src'
data = json.loads((root / 'icirrus-assets.js').read_text(encoding='utf8').split('=', 1)[1].rstrip(';\n'))
metadata = {zone: {key: value for key, value in scene.items() if key != 'instances'}
            for zone, scene in data['scenes'].items()}
assert len(metadata) == 27 and '114' not in metadata
(root / 'icirrus-scenes.js').write_text(
    '/* Native collision metadata; heavy geometry loads on arrival. */\nwindow.ICIRRUS_SCENES='
    + json.dumps(metadata, separators=(',', ':')) + ';\n', encoding='utf8')
print('Exported', len(metadata), 'deferred scene descriptors')
