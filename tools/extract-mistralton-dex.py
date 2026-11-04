"""Reuse the verified original scoped Pokédex exporter for level35's roster."""
from pathlib import Path
source=Path(__file__).with_name('extract-driftveil-dex.py').read_text(encoding='utf8').replace('driftveil-data.js','mistralton-data.js')
exec(compile(source,str(Path(__file__).with_name('extract-driftveil-dex.py')),'exec'))
