"""Export the original third badge receipt models using the audited receipt reader."""
from pathlib import Path
source=Path(__file__).with_name('extract-basic-badge.py').read_text(encoding='utf8')
source=source.replace("(4,'basicBadgeM'),(43,'basicBadgeF')","(5,'insectBadgeM'),(44,'insectBadgeF')")
source=source.replace('Medaglia Base','Medaglia Scarabeo').replace('Basic Badge receipt','Insect Badge receipt')
source=source.replace("receipt',4,43)","receipt',5,44)")
exec(compile(source,str(Path(__file__).with_name('extract-basic-badge.py')),'exec'))
