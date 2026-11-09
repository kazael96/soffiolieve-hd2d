"""Verify IRBI vector movements172-180 and dragon billboard programs."""
import argparse,hashlib,json,struct
from pathlib import Path
from irbi_reader import NintendoDSRom,NARC
p=argparse.ArgumentParser(description=__doc__);p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
r=NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI';o=r.loadArm9Overlays([21])[21]
def half(at):return struct.unpack_from('<H',o.data,at-o.ramAddress)[0]
def word(at):return struct.unpack_from('<I',o.data,at-o.ramAddress)[0]
records={}
for code in range(172,181):
 table=0x21d41c4+(code-171)*12;handler=word(table)&~1
 assert word(table+4)==0x21990f1 and word(table+8)==0x2197e5d
 assert half(handler+4)==0x4d0a and half(handler+22)==0x2004 and half(handler+26)==0x200a
 assert half(handler+32)&0xff00==0x2200 and half(handler+34)&0xff00==0x2300
 pointer=word(handler+48);vector=list(struct.unpack_from('<3i',o.data,pointer-o.ramAddress))
 records[code]={'handler':hex(handler),'table':hex(table),'vectorAddress':hex(pointer),'vectorQ12':vector,'vectorTilePerTick':[v/65536 for v in vector],'direction':half(handler+34)&255,'mode':half(handler+32)&255,'ticks':4,'nativeFlags':10}
actors={};fmt=struct.Struct('<HBBBBBBBBBBBbbbHHHHHH');raw=NARC(r.getFileByName('a/0/4/8')).files[0]
for model in [211,213]:
 row=fmt.unpack_from(raw,4+model*fmt.size);pointer,count=struct.unpack_from('<II',o.data,327760+row[8]*8);programs=[]
 assert row[8]==18 and count==4
 for entry in range(count):
  address=word(pointer+entry*4);steps=[];loop=None
  for i in range(64):
   frame,hold=struct.unpack_from('<HH',o.data,address-o.ramAddress+i*4)
   if frame in [0x3fff,0x3ffc]:
    if frame==0x3ffc:loop=hold;assert loop<len(steps)
    break
   assert frame<15 and hold>0;steps.append([frame,hold])
  else:raise ValueError('Unterminated native billboard animation')
  programs.append({'address':hex(address),'steps':steps,'loop':loop})
 bitmap=(a.output.parent/'assets/opelucid'/('actor-'+str(model)+'-0.png')).read_bytes();assert bitmap[:8]==b'\x89PNG\r\n\x1a\n';width,height=struct.unpack_from('>2I',bitmap,16);assert width==height==64
 actors[model]={'animationSet':row[8],'programs':programs,'widthPx':width,'heightPx':height}
script=NARC(r.getFileByName('a/0/5/7')).files[426];assert struct.unpack_from('<HH',script,825)==(323,9694) and struct.unpack_from('<HH',script,867)==(323,9694)
data={'source':'IRBI overlay21 movement table/generic0219902c/tick021990f0/offset02163e7c','overlaySha256':hashlib.sha256(o.data).hexdigest(),'movements':records,'actors':actors,'camera':{'zone':213,'pitchTurn16':9694,'source':'IRBI script426:825/867 EVCameraMoveTo'},'adaptation':'Native vectors, ticks and billboard programs; continuous field updates run at30Hz. Raw mode and direction values retained; no emulated DS animation binding claim.'}
a.output.write_text('window.OPELUCID_FIELD_MOTION='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8',newline='\n');print('Verified9 vector movements and8 native billboard programs')
