"""Native TM/HM move references for field text only, not machine availability."""
import argparse
import hashlib
import json
import struct
from pathlib import Path
from irbi_reader import NintendoDSRom, code_decompress

p=argparse.ArgumentParser(description=__doc__);p.add_argument('rom',type=Path);p.add_argument('output',type=Path);args=p.parse_args()
r=NintendoDSRom.fromFile(args.rom);assert r.idCode==b'IRBI'
arm=code_decompress(r.arm9);needle=struct.pack('<10H',468,337,473,347,46,92,258,339,474,237);offset=arm.find(needle)
assert offset>=0 and arm.find(needle,offset+1)<0
moves=struct.unpack_from('<101H',arm,offset);assert moves[92:98]==(15,19,57,70,127,291)
by_item={**{328+i:moves[i] for i in range(92)},**{420+i:moves[92+i] for i in range(6)},**{618+i:moves[98+i] for i in range(3)}}
data={'source':'IRBI ARM9 TM/HM table; opcode80 calls2021230 then201eec4','offset':offset,'sha256':hashlib.sha256(arm[offset:offset+202]).hexdigest(),'moves':by_item,'purpose':'Field word formatting only; does not grant items, moves or compatibility'}
args.output.write_text('window.NATIVE_MACHINE_TEXT='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
print('Native text references:',len(by_item),'items at',hex(r.arm9RamAddress+offset))
