"""Disassemble native handlers for unsupported chapter051 commands, read-only."""
import argparse
import hashlib
import struct
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'audio-tools/python-packages'))
from capstone import Cs, CS_ARCH_ARM, CS_MODE_THUMB
from irbi_reader import NintendoDSRom, code_decompress

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('rom', type=Path)
parser.add_argument('opcodes', type=int, nargs='*')
parser.add_argument('--address', type=lambda s: int(s, 0), action='append', default=[])
parser.add_argument('--bytes', type=lambda s: int(s, 0), default=384)
args = parser.parse_args()
rom = NintendoDSRom.fromFile(args.rom)
assert rom.idCode == b'IRBI'
overlays = rom.loadArm9Overlays([10, 21])
regions = [(f'overlay{key}', value.ramAddress, value.data) for key, value in overlays.items()]
regions.append(('arm9', rom.arm9RamAddress, code_decompress(rom.arm9)))
for name, base, data in regions:
    print(name, hex(base), hashlib.sha256(data).hexdigest())
targets = [('OP' + str(opcode), struct.unpack_from('<I', overlays[10].data, 0x1b4bc + opcode * 4)[0] & ~1) for opcode in args.opcodes]
targets += [('FUNCTION', address & ~1) for address in args.address]
decoder = Cs(CS_ARCH_ARM, CS_MODE_THUMB)
for label, address in targets:
    owner = next(((name, base, data) for name, base, data in regions if base <= address < base + len(data)), None)
    if owner is None:
        raise ValueError(f'Handler outside reviewed regions: {address:#x}')
    name, base, data = owner
    print(label, hex(address), name)
    for instruction in decoder.disasm(data[address - base:address - base + args.bytes], address):
        print(hex(instruction.address), instruction.mnemonic, instruction.op_str)
