"""Extract N's actual IRBI special billboard gesture, animation set25/entry40."""
from pathlib import Path
import argparse,struct,json,hashlib
import irbi_reader
irbi_reader.install()
import ndspy.rom,ndspy.narc

def extract(rom,output):
    assert rom.idCode==b'IRBI'
    ov=rom.loadArm9Overlays([21])[21]
    fmt=struct.Struct('<HBBBBBBBBBBBbbbHHHHHH')
    row=fmt.unpack_from(ndspy.narc.NARC(rom.getFileByName('a/0/4/8')).files[0],4+103*fmt.size)
    assert row[8]==25
    ptr,count=struct.unpack_from('<II',ov.data,327760+row[8]*8)
    assert count==43
    address=struct.unpack_from('<I',ov.data,ptr-ov.ramAddress+40*4)[0]
    assert address==0x21d73b8
    offset=address-ov.ramAddress;steps=[]
    for i in range(64):
        frame,hold=struct.unpack_from('<HH',ov.data,offset+i*4)
        if frame==0x3fff:break
        assert frame<16 and hold>0
        steps.append([frame,hold])
    else:raise ValueError('Unterminated native gesture')
    assert steps==[[3,10],[12,5],[13,2],[15,10],[14,10],[13,1],[3,10]]
    record={'steps':steps,'overlay':21,'offset':offset,'address':hex(address),'model':103,'animationSet':25,'entry':40,'sha256':hashlib.sha256(ov.data[offset:offset+(len(steps)+1)*4]).hexdigest()}
    (output/'mistralton-gestures.js').write_text('window.MISTRALTON_GESTURES='+json.dumps({'N':record},separators=(',',':'))+';Object.assign(OPENING_GESTURES,MISTRALTON_GESTURES);\n',encoding='utf8')
    return record

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();print(json.dumps(extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)))
