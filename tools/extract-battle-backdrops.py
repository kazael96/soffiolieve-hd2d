"""Extract IRBI battle fields and stages used by the opening, not invented scenery."""
from pathlib import Path
import argparse,json,struct,subprocess
import ndspy.rom,ndspy.narc
from nitro_geometry import flatten_glb

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('rom',type=Path);p.add_argument('apicula',type=Path)
p.add_argument('output',type=Path);p.add_argument('work',type=Path);args=p.parse_args()
r=ndspy.rom.NintendoDSRom.fromFile(args.rom)
assert r.idCode==b'IRBI','Expected Italian Pokémon Black'
def narc(path):return ndspy.narc.NARC(r.getFileByName(path)).files
resources=narc('a/0/1/1');tables=narc('a/1/5/2');headers=narc('a/0/1/2')[0]
assert list(map(len,tables))==[684,1280,1700]
dest=args.output/'assets/battle-fields';dest.mkdir(parents=True,exist_ok=True)
args.work.mkdir(parents=True,exist_ok=True)
models={};textures={};scenes={}
def model(member):
    key='battle-'+str(member)
    if key not in models:
        folder=args.work/key;folder.mkdir(exist_ok=True);file=folder/'model.nsbmd';file.write_bytes(resources[member])
        subprocess.run([str(args.apicula.resolve()),'convert','-f=glb',str(file),'-o',str(folder),'--overwrite'],capture_output=True,check=True)
        geometry,images=flatten_glb(next(folder.glob('*.glb')),key,dest,'assets/battle-fields',units=1)
        models[key]=geometry;textures.update(images)
    return key
for name,zone,terrain in [('room',391,4),('route',317,5)]:
    # Map tile class 0 -> terrain 4 (floor); class 4 -> terrain 5 (grass).
    # BW has 17 terrain entries per field/stage row (BW2 has 20).
    bg=(struct.unpack_from('<H',headers,zone*48+30)[0]>>5)&31
    field=tables[0][bg*36+2+terrain];stage=tables[0][bg*36+19+terrain]
    field_member=struct.unpack_from('<I',tables[1],field*64)[0]
    stage_member=struct.unpack_from('<I',tables[2],stage*68+4)[0]
    scenes[name]={'field':model(field_member),'stage':model(stage_member),
                  'zone':zone,'background':bg,'terrain':terrain,'fieldId':field,'stageId':stage}
payload={'models':models,'textures':textures,'scenes':scenes,'source':'IRBI a/1/5/2 + a/0/1/1'}
(args.output/'battle-fields.js').write_text('window.BATTLE_FIELDS='+json.dumps(payload,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
print(json.dumps(scenes,indent=2))
