"""Scoped native animated doors and Tower bell used by the050 scene instances."""
from pathlib import Path
import argparse
import json
import re
import shutil
import struct
import irbi_reader
irbi_reader.install()
import ndspy.rom
import ndspy.narc

p=argparse.ArgumentParser()
for key in ['rom','output','work','apicula']:p.add_argument('--'+key,type=Path,required=True)
a=p.parse_args();r=ndspy.rom.NintendoDSRom.fromFile(a.rom)
assets=json.loads((a.output/'icirrus-assets.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
used={}
for scene in assets['scenes'].values():
 for instance in scene['instances']:
  match=re.fullmatch(r'ic-prop-(True|False)-(\d+)-(\d+)',instance['model'])
  if match:used.setdefault((match[1]=='True',int(match[2])),set()).add(int(match[3]))
source=Path(__file__).with_name('extract-field-models.py').read_text(encoding='utf8')
start=source.index('    for path,member,texture_path,texture_member,ids in [')
end=source.index('        bundle=ndspy.narc.NARC',start)
source=source[:start]+'    for path,member,texture_path,texture_member,ids in plans:\n'+source[end:]
source=source.replace("(b'BCA0',b'BMA0')","(b'BCA0',b'BMA0',b'BTA0')")
combined={'source':'IRBI050 native building children and Tower bell; scope ic','models':{},'children':{}}
for (outdoor,member),used_ids in sorted(used.items()):
 archive='a/2/2/9'if outdoor else'a/2/3/0';texture='a/1/7/6'if outdoor else'a/1/7/7'
 bundle=ndspy.narc.NARC(r.getFileByName(archive)).files[member]
 count=bundle[2]//2;offsets=struct.unpack_from('<'+'I'*(count*2),bundle,4)
 headers={struct.unpack_from('<H',bundle,at)[0]:at for at in offsets[:count]}
 candidates=set(used_ids)
 for parent in used_ids:
  if parent in headers:candidates.add(struct.unpack_from('<H',bundle,headers[parent]+4)[0])
 ids=[]
 for mid in sorted(candidates):
  if mid not in headers:continue
  at=headers[mid];kind=struct.unpack_from('<H',bundle,at+2)[0];mode,unknown,per_set,sets=struct.unpack_from('<4B',bundle,at+16)
  if mode==2 and per_set*sets and kind in [1,2,11]:ids.append(mid)
 if not ids:continue
 name=f'{outdoor}-{member}';folder=a.work/name;folder.mkdir(parents=True,exist_ok=True)
 scope={'__name__':'icirrus_field_export','plans':[(archive,member,texture,member,ids)]}
 exec(compile(source,str(Path(__file__).with_name('extract-field-models.py')),'exec'),scope)
 result=scope['extract'](r,folder,a.apicula.resolve())
 for mid,record in result['models'].items():
  key=f'{name}-{mid}';record['key']='ic-field-'+key
  dest=a.output/'assets/icirrus/field-models'/name/Path(record['model']).parent.name
  dest.parent.mkdir(parents=True,exist_ok=True);shutil.copytree(folder/Path(record['model']).parent,dest,dirs_exist_ok=True)
  record['model']=(dest/Path(record['model']).name).relative_to(a.output).as_posix();combined['models'][key]=record
 for parent,record in result['children'].items():
  record['modelKey']=f'{name}-{record["model"]}';combined['children'][f'{name}-{parent}']=record
assert 'True-22-290'in combined['models'] and combined['models']['True-22-290']['animations']['0']['frames']==246
payload=json.dumps(combined,separators=(',',':'))
(a.output/'icirrus-field-models.js').write_text('window.ICIRRUS_FIELD_MODELS='+payload+';\n'+'''(()=>{let installed=false;window.IcirrusFieldModels={install(){if(installed)return;const a=FIELD_MODEL_ASSETS,d=ICIRRUS_FIELD_MODELS;a.scopes??={};a.scopes.ic=d;for(const [key,r]of Object.entries(d.models))a.models['ic:'+key]=r;installed=true;}};})();\n''',encoding='utf8')
print('Scoped050 field models:',len(combined['models']),'models;',len(combined['children']),'children')
