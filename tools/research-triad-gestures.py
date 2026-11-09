"""Inspect the native model182 animation sequences without changing gameplay."""
import argparse,struct,json
from pathlib import Path
from irbi_reader import NintendoDSRom,NARC
p=argparse.ArgumentParser(description=__doc__);p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
r=NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI';ov=r.loadArm9Overlays([21])[21]
fmt=struct.Struct('<HBBBBBBBBBBBbbbHHHHHH');row=fmt.unpack_from(NARC(r.getFileByName('a/0/4/8')).files[0],4+182*fmt.size)
ptr,count=struct.unpack_from('<II',ov.data,327760+row[8]*8);records=[]
for entry in range(40,count):
 address=struct.unpack_from('<I',ov.data,ptr-ov.ramAddress+entry*4)[0];at=address-ov.ramAddress;steps=[]
 for i in range(128):
  frame,hold=struct.unpack_from('<HH',ov.data,at+i*4)
  if frame==0x3fff:break
  steps.append([frame,hold])
 else:raise ValueError('Unterminated gesture')
 records.append({'entry':entry,'address':hex(address),'steps':steps})
result={'model':182,'animationSet':row[8],'count':count,'sequences':records};a.output.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
