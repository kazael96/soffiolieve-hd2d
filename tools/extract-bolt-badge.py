"""Original fourth badge receipt, reusing the audited Gen V badge adaptation."""
from pathlib import Path
import uuid
try:
 import ndspy.rom
except ModuleNotFoundError:
 from irbi_reader import install
 install()
class LocalStage:
 def __enter__(self):
  self.path=Path('test-results/extraction')/('bolt-'+uuid.uuid4().hex)
  self.path.mkdir(parents=True)
  return self.path
 def __exit__(self,*args):
  pass
source=Path(__file__).with_name('extract-basic-badge.py').read_text(encoding='utf8')
source=source.replace("(4,'basicBadgeM'),(43,'basicBadgeF')","(6,'boltBadgeM'),(45,'boltBadgeF')")
source=source.replace('Medaglia Base','Medaglia Volt').replace('Basic Badge receipt','Bolt Badge receipt')
source=source.replace("receipt',4,43)","receipt',6,45)")
source=source.replace('tempfile.TemporaryDirectory()','LocalStage()')
exec(compile(source,str(Path(__file__).with_name('extract-basic-badge.py')),'exec'))
