"""Disassemble explicit owner:start:end IRBI ranges, with source hashes."""
import argparse, hashlib, struct
from pathlib import Path
from capstone import Cs, CS_ARCH_ARM, CS_MODE_THUMB, CS_MODE_ARM
from irbi_reader import NintendoDSRom, code_decompress

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--rom', type=Path, required=True)
    p.add_argument('--output', type=Path, required=True)
    p.add_argument('ranges', nargs='+', help='arm9|overlayNUMBER:thumb|arm:START:END')
    a = p.parse_args()
    rom = NintendoDSRom.fromFile(a.rom)
    if rom.idCode != b'IRBI':
        raise ValueError('Expected Italian Pokemon Black IRBI')
    sources = {'arm9': (code_decompress(rom.arm9), rom.arm9RamAddress)}
    lines = []
    for spec in a.ranges:
        owner, isa, start, end = spec.split(':')
        start, end = int(start, 0), int(end, 0)
        if owner not in sources:
            if not owner.startswith('overlay'):
                raise ValueError('Explicit overlay owner required')
            number = int(owner[7:])
            overlay = rom.loadArm9Overlays([number])[number]
            sources[owner] = (overlay.data, overlay.ramAddress)
        data, base = sources[owner]
        if not base <= start < end <= base + len(data):
            raise ValueError('Range outside '+owner)
        mode = {'thumb': CS_MODE_THUMB, 'arm': CS_MODE_ARM}[isa]
        lines.append(f'RANGE {spec} SOURCE {base:#x} SHA256 {hashlib.sha256(data).hexdigest()}')
        for i in Cs(CS_ARCH_ARM, mode).disasm(data[start-base:end-base], start):
            note = ''
            if i.mnemonic == 'ldr' and '[pc' in i.op_str:
                offset = int(i.op_str.split('#')[-1].split(']')[0], 0) if '#' in i.op_str else 0
                address = i.address + 8 + offset if mode == CS_MODE_ARM else ((i.address+4)&~3)+offset
                if base <= address <= base+len(data)-4:
                    note = f' ; literal {address:#x}={struct.unpack_from("<I", data, address-base)[0]:#x}'
            lines.append(f'{i.address:#x} {i.mnemonic} {i.op_str}{note}')
    a.output.parent.mkdir(parents=True, exist_ok=True)
    a.output.write_text('\n'.join(lines)+'\n', encoding='utf8')
    print(f'Recorded {len(a.ranges)} owner-qualified ranges in {a.output}')

if __name__ == '__main__':
    main()
