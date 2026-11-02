"""Small collision/scene descriptors for saved games; geometry stays lazy."""
import json
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'src'
data=json.loads((p/'castelia-assets.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
metadata={z:{k:v for k,v in scene.items() if k!='instances'} for z,scene in data['scenes'].items()}
(p/'castelia-scenes.js').write_text('/* Collision and native scene metadata only; geometry loads on arrival. */\nwindow.CASTELIA_SCENES='+json.dumps(metadata,separators=(',',':'))+';\n',encoding='utf8')
