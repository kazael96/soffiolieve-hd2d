"""Read native Gen V ball-modifier handlers; no ROM bytes are published."""
from pathlib import Path
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'audio-tools/python-packages'))
from capstone import Cs,CS_ARCH_ARM,CS_MODE_THUMB
import ndspy.rom,ndspy.codeCompression
r=ndspy.rom.NintendoDSRom.fromFile(sys.argv[1]);o=r.loadArm9Overlays([93])[93];decoder=Cs(CS_ARCH_ARM,CS_MODE_THUMB)
for address,size in [(0x021cbc48,352),(0x021cbe38,448)]:
 print('FUNCTION',hex(address))
 for i in decoder.disasm(o.data[address-o.ramAddress:address-o.ramAddress+size],address):print(hex(i.address),i.mnemonic,i.op_str)
arm=ndspy.codeCompression.decompress(r.arm9)
for address in [0x020113f0]:
 print('ARM9',hex(address))
 for i in decoder.disasm(arm[address-r.arm9RamAddress:address-r.arm9RamAddress+208],address):print(hex(i.address),i.mnemonic,i.op_str)
