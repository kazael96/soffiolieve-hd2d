"""Record scoped IRBI first-ending functions with explicit overlay and ISA ownership."""
from pathlib import Path
import argparse
import hashlib
import json
import struct
from capstone import Cs, CS_ARCH_ARM, CS_MODE_ARM, CS_MODE_THUMB
from irbi_reader import NintendoDSRom, code_decompress


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rom', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    rom = NintendoDSRom.fromFile(args.rom)
    arm = code_decompress(rom.arm9)
    overlays = rom.loadArm9Overlays([10, 21, 56])
    sources = {'arm9': (arm, rom.arm9RamAddress)}
    sources.update({f'overlay{i}': (overlay.data, overlay.ramAddress) for i, overlay in overlays.items()})
    ranges = [
        ('overlay56', CS_MODE_THUMB, 0x21f35a0, 0x21f380c),
        ('overlay56', CS_MODE_THUMB, 0x21f380c, 0x21f39f0),
        ('overlay56', CS_MODE_THUMB, 0x21f3cac, 0x21f3f20),
        ('overlay56', CS_MODE_THUMB, 0x21f3f20, 0x21f4144),
        ('arm9', CS_MODE_THUMB, 0x2011510, 0x2011900),
        ('arm9', CS_MODE_THUMB, 0x2011b8c, 0x2011d40),
        ('arm9', CS_MODE_ARM, 0x20489a4, 0x2048c00),
        ('overlay21', CS_MODE_THUMB, 0x218c190, 0x218c410),
        ('overlay21', CS_MODE_THUMB, 0x218bbac, 0x218bc28),
        ('overlay21', CS_MODE_THUMB, 0x218bf90, 0x218c190),
        ('overlay21', CS_MODE_THUMB, 0x218c554, 0x218c610),
        ('overlay21', CS_MODE_THUMB, 0x218e060, 0x218e0b4),
        ('overlay21', CS_MODE_THUMB, 0x218e160, 0x218e350),
        ('overlay21', CS_MODE_THUMB, 0x21b54f4, 0x21b5580),
        ('overlay21', CS_MODE_THUMB, 0x218df18, 0x218e060),
        ('overlay21', CS_MODE_THUMB, 0x2188b40, 0x2188b9c),
        ('overlay56', CS_MODE_THUMB, 0x21f411c, 0x21f4138),
    ]
    proof = {'sources': {key: {'base': hex(base), 'sha256': hashlib.sha256(data).hexdigest()} for key, (data, base) in sources.items()}, 'ranges': []}
    output = []
    for owner, mode, start, end in ranges:
        data, base = sources[owner]
        if not base <= start < end <= base + len(data):
            raise ValueError(f'Range outside explicit {owner}: {start:x}')
        isa = 'ARM' if mode == CS_MODE_ARM else 'Thumb'
        output.append(f'RANGE {owner} {isa} {start:#x} {end:#x}')
        proof['ranges'].append({'owner': owner, 'isa': isa, 'start': hex(start), 'end': hex(end)})
        for ins in Cs(CS_ARCH_ARM, mode).disasm(data[start-base:end-base], start):
            note = ''
            if ins.mnemonic == 'ldr' and '[pc' in ins.op_str:
                offset = int(ins.op_str.split('#')[-1].split(']')[0], 0) if '#' in ins.op_str else 0
                literal = ins.address + 8 + offset if mode == CS_MODE_ARM else ((ins.address + 4) & ~3) + offset
                if base <= literal <= base + len(data) - 4:
                    note = f' ; literal {literal:#x}={struct.unpack_from("<I", data, literal-base)[0]:#x}'
            output.append(f'{ins.address:#x} {ins.mnemonic} {ins.op_str}{note}')
    data, base = sources['overlay56']
    proof['tables'] = {}
    for name, start, length in [('heroDestination', 0x21f41e8, 48), ('roomSounds', 0x21f4284, 72)]:
        raw = data[start-base:start-base+length]
        if len(raw) != length:
            raise ValueError('Truncated native table ' + name)
        proof['tables'][name] = {'address': hex(start), 'rawHex': raw.hex(), 'u16': list(struct.unpack('<'+'H'*(length//2), raw))}
    raw = data[0x21f4138-base:0x21f4224-base]
    proof['tables']['entranceStateWords']={'address':'0x21f4138','u32':list(struct.unpack('<'+'I'*(len(raw)//4),raw))}
    data,base=sources['overlay21']
    raw=data[0x21d3c48-base:0x21d3c48-base+36]
    proof['tables']['fieldModeCallbacks']={'address':'0x21d3c48','u32':list(struct.unpack('<9I',raw))}
    data,base=sources['arm9']
    raw=data[0x20a1db0-base:0x20a1db0-base+16]
    proof['tables']['entrancePerspective']={'address':'0x20a1db0','i16':list(struct.unpack('<8h',raw)),'aspectFx12':0x1555,'near':1,'far':1024}
    args.output.mkdir(parents=True, exist_ok=True)
    (args.output/'native-functions.txt').write_text('\n'.join(output)+'\n', encoding='utf8')
    (args.output/'source-proof.json').write_text(json.dumps(proof, indent=2)+'\n', encoding='utf8')
    print(f'Recorded{len(ranges)} explicit function ranges and{len(proof["tables"])} original tables; no runtime behavior inferred automatically.')


if __name__ == '__main__':
    main()
