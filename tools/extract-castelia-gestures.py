"""Verified IRBI billboard special animation for Ghecis, model100 / set26."""
import argparse,struct,json
from pathlib import Path
import ndspy.rom,ndspy.narc
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI';ov=r.loadArm9Overlays([21])[21]
fmt=struct.Struct('<HBBBBBBBBBBBbbbHHHHHH');record=fmt.unpack_from(ndspy.narc.NARC(r.getFileByName('a/0/4/8')).files[0],4+100*fmt.size);assert record[8]==26
ptr,count=struct.unpack_from('<II',ov.data,327760+26*8);assert count==41
at=struct.unpack_from('<I',ov.data,ptr-ov.ramAddress+40*4)[0]-ov.ramAddress;assert at==325080
steps=[[3,10],[12,5],[13,2],[15,10],[14,5],[13,2],[3,10]]
assert ov.data[at:at+32]==b''.join(struct.pack('<HH',*s)for s in [*steps,[16383,0]])
data={'Ghecis':{'steps':steps,'overlay':21,'offset':at,'model':100,'animationSet':26}}
(a.output/'castelia-gestures.js').write_text('window.CASTELIA_GESTURES='+json.dumps(data,separators=(',',':'))+';Object.assign(OPENING_GESTURES,CASTELIA_GESTURES);\n')
