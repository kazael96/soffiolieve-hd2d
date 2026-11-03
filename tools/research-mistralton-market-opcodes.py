"""Read the original shop opcode handlers and their literal data references."""
from pathlib import Path
import sys,struct,json
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'audio-tools/python-packages'))
from capstone import Cs,CS_ARCH_ARM,CS_MODE_THUMB
import ndspy.rom
r=ndspy.rom.NintendoDSRom.fromFile(sys.argv[1]);ovs=r.loadArm9Overlays([10,21]);table=ovs[10].data;decoder=Cs(CS_ARCH_ARM,CS_MODE_THUMB)
for op in [329,332,333,334]:
 address=struct.unpack_from('<I',table,0x1b4bc+op*4)[0]&~1;owner=next((o for o in ovs.values()if o.ramAddress<=address<o.ramAddress+len(o.data)),None);print('OP',op,hex(address))
 if not owner:continue
 for i in decoder.disasm(owner.data[address-owner.ramAddress:address-owner.ramAddress+(640 if op==329 else 160)],address):print(hex(i.address),i.mnemonic,i.op_str)
o=ovs[21]
for address in [0x21b37e0,0x21b38c4,0x21b3a14]:
 print('FUNCTION',hex(address))
 for i in decoder.disasm(o.data[address-o.ramAddress:address-o.ramAddress+1536],address):print(hex(i.address),i.mnemonic,i.op_str)
