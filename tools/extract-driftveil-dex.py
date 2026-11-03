"""Extend every scoped native Pokédex resource to the entire level30 roster."""
from pathlib import Path
import argparse,json,importlib.util
try:
 import ndspy.rom
except ModuleNotFoundError:
 from irbi_reader import install
 install()
 import ndspy.rom
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
r=ndspy.rom.NintendoDSRom.fromFile(a.rom)
# Verify the independently decoded overlay against the previously exported ROM.
import hashlib
old=json.loads((a.output/'pokedex-assets.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
assert hashlib.sha256(r.loadArm9Overlays([206])[206].data).hexdigest()==old['hash'],'Native overlay decoding differs from the verified export'
d=json.loads((a.output/'driftveil-data.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'));ids=sorted({p['id']for p in d['progression'].values()})
for name in ['extract-pokedex','extract-dex-search','extract-dex-effects']:
 s=importlib.util.spec_from_file_location(name,Path(__file__).with_name(name+'.py'));module=importlib.util.module_from_spec(s);s.loader.exec_module(module);module.extract(r,a.output,ids)
print('Updated native dex resources for',len(ids),'distinct species')
