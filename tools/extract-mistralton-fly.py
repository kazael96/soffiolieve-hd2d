"""Decode native IRBI Fly permissions, landings and the eight reached Town Map flags."""
from pathlib import Path
import argparse, hashlib, json, struct
try:
 import ndspy.rom, ndspy.narc
except ModuleNotFoundError:
 from irbi_reader import install
 install()
 import ndspy.rom, ndspy.narc
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
r=ndspy.rom.NintendoDSRom(a.rom.read_bytes());assert r.idCode==b'IRBI'
headers=ndspy.narc.NARC(r.getFileByName('a/0/1/2')).files[0]
town=ndspy.narc.NARC(r.getFileByName('a/0/8/6')).files[0]
places=json.loads((a.output/'townmap-assets.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))['places']
names={p['zone']:p['name'] for p in places};cities=[389,397,6,16,28,62,96,107]
rows={z:struct.unpack_from('<27H',town,i*54) for i,z in enumerate(struct.unpack_from('<H',town,j*54)[0] for j in range(len(town)//54))}
data={'source':{'rom':'IRBI','headers':'a/0/1/2:0, 48-byte records; u16 flags@30 bit13, signed xyz@36','townMap':'a/0/8/6:0, 54-byte records; fly@24, visited flag@30','headerSha256':hashlib.sha256(headers).hexdigest(),'townMapSha256':hashlib.sha256(town).hexdigest()},'headers':{},'destinations':[]}
for z in range(len(headers)//48):
 b=headers[z*48:(z+1)*48];flags=struct.unpack_from('<H',b,30)[0]
 data['headers'][z]={'flags':flags,'parent':struct.unpack_from('<H',b,24)[0],'fly':list(struct.unpack_from('<iii',b,36))}
for z in cities:
 row=rows[z];assert row[12]==1 and row[15]==2480+cities.index(z)
 data['destinations'].append({'zone':z,'name':names[z],'flag':row[15],'fly':data['headers'][z]['fly'],'override':list(row[13:15])})
(a.output/'mistralton-fly-data.js').write_text('window.MISTRALTON_FLY_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
print('Decoded',len(data['headers']),'native headers and',len(cities),'Fly destinations')
