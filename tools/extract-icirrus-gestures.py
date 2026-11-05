"""Extract the billboard special gesture used by Alder at Twist Mountain."""
from pathlib import Path
import argparse, struct, json, hashlib
import irbi_reader
irbi_reader.install()
import ndspy.rom, ndspy.narc

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('rom',type=Path);p.add_argument('output',type=Path)
a=p.parse_args();r=ndspy.rom.NintendoDSRom.fromFile(a.rom)
assert r.idCode==b'IRBI'
ov=r.loadArm9Overlays([21])[21];fmt=struct.Struct('<HBBBBBBBBBBBbbbHHHHHH')
def extract(model,entry):
    row=fmt.unpack_from(ndspy.narc.NARC(r.getFileByName('a/0/4/8')).files[0],4+model*fmt.size)
    ptr,count=struct.unpack_from('<II',ov.data,327760+row[8]*8)
    assert count>entry
    address=struct.unpack_from('<I',ov.data,ptr-ov.ramAddress+entry*4)[0]
    offset=address-ov.ramAddress;steps=[]
    for i in range(64):
        frame,hold=struct.unpack_from('<HH',ov.data,offset+i*4)
        if frame==0x3fff:break
        assert frame<64 and hold>0
        steps.append([frame,hold])
    else:raise ValueError('Unterminated native gesture')
    return {'steps':steps,'overlay':21,'offset':offset,'address':hex(address),'model':model,'animationSet':row[8],'entry':entry,'sha256':hashlib.sha256(ov.data[offset:offset+(len(steps)+1)*4]).hexdigest()}
records={'Nardo':extract(97,40),'N':extract(103,40)}
records['N']['variants']={'182':extract(103,41),'183':extract(103,42)}
(a.output/'icirrus-gestures.js').write_text('window.ICIRRUS_GESTURES='+json.dumps(records,separators=(',',':'))+';Object.assign(OPENING_GESTURES,ICIRRUS_GESTURES);\n',encoding='utf8')
print(json.dumps({name:{'entry':v['entry'],'variants':v.get('variants',{})}for name,v in records.items()}))
