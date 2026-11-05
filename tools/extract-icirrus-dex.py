"""Original native Dex resources for the050 roster; preserves previous species."""
from pathlib import Path
import sys

root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root.parent/'audio-tools/python-packages'))
source=Path(__file__).with_name('extract-driftveil-dex.py').read_text(encoding='utf8').replace('driftveil-data.js','icirrus-data.js')
exec(compile(source,str(Path(__file__).with_name('extract-driftveil-dex.py')),'exec'))
