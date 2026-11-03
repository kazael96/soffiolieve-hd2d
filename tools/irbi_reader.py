"""Small read-only Nintendo DS container adapter for the IRBI export tools.

No third-party installation or permission changes. Only the subset used by
the native Pokédex exporters is implemented. Binary signatures and the
previously verified overlay SHA-256 remain checked by the calling exporter.
"""
import struct
import sys
import types
from pathlib import Path


def lz10(data):
    if data[0] != 0x10:
        raise ValueError('Expected LZ10')
    size = int.from_bytes(data[1:4], 'little')
    out = bytearray(); pos = 4
    while len(out) < size:
        flags = data[pos]; pos += 1
        for bit in range(7, -1, -1):
            if len(out) >= size: break
            if flags & (1 << bit):
                a, b = data[pos:pos+2]; pos += 2
                distance = ((a & 15) << 8 | b) + 1
                if distance > len(out): raise ValueError('Invalid LZ10 distance')
                for _ in range((a >> 4) + 3):
                    out.append(out[-distance])
                    if len(out) == size: break
            else:
                out.append(data[pos]); pos += 1
    return bytes(out)


def code_decompress(data):
    data = bytes(data)
    trailer = b''
    if data[-12:-8] == b'\x21\x06\xc0\xde':
        data, trailer = data[:-12], data[-12:]
    if len(data) < 8: return data + trailer
    extra = struct.unpack_from('<I', data, len(data)-4)[0]
    header = data[-5]; compressed = int.from_bytes(data[-8:-5], 'little')
    if not extra or not 8 <= header <= len(data) or compressed < header or compressed > len(data):
        return data + trailer
    start = len(data) - compressed; source = data[start:len(data)-header]
    out = bytearray(compressed + extra); pos = len(source); dest = len(out)
    while dest:
        if not pos: raise ValueError('Truncated backwards LZ')
        pos -= 1; flags = source[pos]
        for bit in range(7, -1, -1):
            if not dest: break
            if flags & (1 << bit):
                if pos < 2: raise ValueError('Truncated backwards LZ pair')
                pos -= 1; a = source[pos]; pos -= 1; b = source[pos]
                distance = ((a & 15) << 8 | b) + 3
                if distance > len(out)-dest:
                    if len(out)-dest < 2: raise ValueError('Invalid backwards LZ distance')
                    distance = 2
                for _ in range((a >> 4) + 3):
                    if not dest: break
                    dest -= 1; out[dest] = out[dest+distance]
            else:
                if not pos: raise ValueError('Truncated backwards LZ literal')
                pos -= 1; dest -= 1; out[dest] = source[pos]
    return data[:start] + bytes(out) + trailer


class NARC:
    def __init__(self, raw):
        if raw[:4] != b'NARC': raise ValueError('Expected NARC')
        pos = struct.unpack_from('<H', raw, 12)[0]; entries = None; payload = None
        while pos < len(raw):
            magic = raw[pos:pos+4]; size = struct.unpack_from('<I', raw, pos+4)[0]
            if size < 8 or pos+size > len(raw): raise ValueError('Invalid NARC block')
            if magic == b'BTAF':
                count = struct.unpack_from('<H', raw, pos+8)[0]
                entries = [struct.unpack_from('<II', raw, pos+12+i*8) for i in range(count)]
            if magic == b'GMIF': payload = raw[pos+8:pos+size]
            pos += size
        if entries is None or payload is None: raise ValueError('Incomplete NARC')
        if any(a > b or b > len(payload) for a, b in entries): raise ValueError('Invalid NARC file range')
        self.files = [payload[a:b] for a, b in entries]


class NintendoDSRom:
    @classmethod
    def fromFile(cls, path): return cls(Path(path).read_bytes())

    def __init__(self, raw):
        self.raw = raw; self.idCode = raw[12:16]
        arm, _, self.arm9RamAddress, length = struct.unpack_from('<4I', raw, 32)
        self.arm9 = raw[arm:arm+length]
        fnt_offset, fnt_size, fat_offset, fat_size = struct.unpack_from('<4I', raw, 64)
        fnt = raw[fnt_offset:fnt_offset+fnt_size]
        fat = list(struct.iter_unpack('<II', raw[fat_offset:fat_offset+fat_size]))
        self.files = [raw[a:b] for a, b in fat]; self.names = {}
        def directory(did, prefix):
            offset, first, _ = struct.unpack_from('<IHH', fnt, (did & 4095)*8)
            while fnt[offset]:
                token = fnt[offset]; offset += 1; length = token & 127
                name = fnt[offset:offset+length].decode('ascii'); offset += length
                if token & 128:
                    child = struct.unpack_from('<H', fnt, offset)[0]; offset += 2
                    directory(child, prefix+name+'/')
                else:
                    self.names[prefix+name] = first; first += 1
        directory(0xf000, '')

    def getFileByName(self, name): return self.files[self.names[name]]

    def loadArm9Overlays(self, ids=None):
        offset, size = struct.unpack_from('<II', self.raw, 80); out = {}
        for row in struct.iter_unpack('<8I', self.raw[offset:offset+size]):
            identifier, address, length, _, _, _, file, flags = row
            if ids is not None and identifier not in ids: continue
            raw = self.files[file]
            out[identifier] = types.SimpleNamespace(ramAddress=address, data=code_decompress(raw) if flags & 0x1000000 else raw)
        return out


def install():
    """Provide the explicitly supported interfaces to the retained exporters."""
    package = types.ModuleType('ndspy'); package.__path__ = []
    modules = {'rom': {'NintendoDSRom': NintendoDSRom}, 'narc': {'NARC': NARC},
               'lz10': {'decompress': lz10}, 'codeCompression': {'decompress': code_decompress}}
    sys.modules['ndspy'] = package
    for name, values in modules.items():
        module = types.ModuleType('ndspy.'+name); vars(module).update(values)
        setattr(package, name, module); sys.modules['ndspy.'+name] = module
