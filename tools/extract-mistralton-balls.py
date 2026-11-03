"""Reachable market balls6/8/12/13, original IRBI NCGR/NCLR and shared cells."""
from pathlib import Path
import sys,json,struct
try:import ndspy.rom
except ModuleNotFoundError:
 from irbi_reader import install
 install()
import ndspy.codeCompression
template=Path(__file__).with_name('extract-route2-ball.py').read_text(encoding='utf8');output=Path(sys.argv[2]);records={}
for iid,name,char,pal in [(12,'premierball',153,154),(6,'netball',141,142),(8,'nestball',145,146),(13,'duskball',155,156)]:
 source=template.replace('(136,135,129,130)',repr((pal,char,129,130))).replace('129,130,135,136',f'129,130,{char},{pal}')
 source=source.replace('greatball',name).replace('route2-ball.js','mistralton-ball.js').replace('ROUTE2_BALL','MISTRALTON_BALL')
 exec(compile(source,str(Path(__file__).with_name('extract-route2-ball.py')),'exec'))
 records[iid]=json.loads((output/'mistralton-ball.js').read_text().split('=',1)[1].rstrip(';\n'))
data=records[12]
data['balls']={iid:{k:record[k] for k in ['source','cells','origin','sequences']} for iid,record in records.items()}
r=ndspy.rom.NintendoDSRom.fromFile(sys.argv[1]);arm=ndspy.codeCompression.decompress(r.arm9);table=struct.unpack_from('<I',arm,0x020113fc-r.arm9RamAddress)[0]
data['timePeriods']=[list(arm[table-r.arm9RamAddress+s*24:table-r.arm9RamAddress+(s+1)*24])for s in range(4)]
data['ballModifierSource']={'overlay':93,'function':'021cbc48','Net':'021cbc8c','Nest':'021cbcce','Dusk':'021cbd44','timeTable':hex(table),'timeFunction':'020113f0'}
(output/'mistralton-ball.js').write_text('window.MISTRALTON_BALL='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
