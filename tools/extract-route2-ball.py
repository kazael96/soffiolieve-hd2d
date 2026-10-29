"""Extract IRBI's capture effect, Poké Ball cells and cell animation sequences.

Resources are verified against overlay 94's command table and BallAdd handler,
not the differing Pokémon Black 2 resource indices. No ROM is distributed.
"""
from pathlib import Path
import argparse
import hashlib
import json
import struct
import ndspy.rom
import ndspy.narc
import ndspy.lz10
from PIL import Image

COUNTS = {0:5,1:10,6:1,7:11,9:11,10:10,11:1,13:13,18:7,21:7,
          27:5,28:2,29:2,46:7,47:7,48:2,49:5,50:1,51:2,52:9,
          54:8,56:1,57:1,58:1,59:4,67:7,69:6,72:1,73:0,77:0}
SIZES = [[(8,8),(16,16),(32,32),(64,64)],
         [(16,8),(32,8),(32,16),(64,32)],
         [(8,16),(8,32),(16,32),(32,64)]]

def program(raw):
    count, entry = struct.unpack_from('<II', raw)
    assert count == 1 and entry == 60
    commands = []
    offset = entry
    while offset < len(raw):
        opcode, = struct.unpack_from('<H', raw, offset)
        if opcode not in COUNTS:
            raise ValueError(f'Unknown capture opcode {opcode} at {offset}')
        args = list(struct.unpack_from('<'+'i'*COUNTS[opcode], raw, offset+2))
        end = offset+2+4*len(args)
        commands.append({'at':offset,'op':opcode,'args':args,'end':end})
        offset = end
    boundaries = {c['at'] for c in commands}
    for c in commands:
        if c['op'] in (59,72):
            assert c['end']+c['args'][-1] in boundaries, c
    assert offset == len(raw)
    return commands

def extract(rom, output):
    if rom.idCode != b'IRBI':
        raise ValueError('Expected the Italian Pokémon Black IRBI ROM')
    archive = ndspy.narc.NARC(rom.getFileByName('a/0/9/5')).files
    def resource(index):
        raw = archive[index]
        return ndspy.lz10.decompress(raw) if raw[:1] == b'\x10' else raw
    expected = {129:'1e29bc9c2bb16f05bc1fbd0d53f48f5476ddfef8eb04c37a11dd66b099520390',130:'6caf8fd834a69cc4e1e68f65684f934e29358675e3c56694548399b6855155e6',137:'7adb2262ebe973375f21fc52c528b4022973b0013b8b32e115bd7b15c8447ecc',138:'423840bb37c101e404f8c914fe71a4d7202599649c6ebb0def786569ff401775'}
    for index, digest in expected.items():
        if hashlib.sha256(resource(index)).hexdigest() != digest:
            raise ValueError(f'Unexpected IRBI capture resource {index}')
    pal, char, cell, anim = [resource(i) for i in (136,135,129,130)]
    assert [bytes(b[:4]) for b in (pal,char,cell,anim)] == [b'RLCN',b'RGCN',b'RECN',b'RNAN']
    colors = [tuple(((value>>shift)&31)*255//31 for shift in (0,5,10))
              for value, in struct.iter_unpack('<H',pal[40:72])]
    raw = char[48:48+struct.unpack_from('<I',char,40)[0]]
    count,kind,offset,mapping = struct.unpack_from('<HHII',cell,24)
    start,size = 24+offset,16 if kind else 8
    oambase = start+count*size
    dest = output/'assets/capture'
    dest.mkdir(parents=True,exist_ok=True)
    paths = []
    for index in range(count):
        num,flags,off = struct.unpack_from('<HHI',cell,start+index*size)
        image = Image.new('RGBA',(128,128))
        for j in reversed(range(num)):
            a0,a1,a2 = struct.unpack_from('<HHH',cell,oambase+off+j*6)
            assert not a0&0x300, 'Unexpected affine/disabled cell'
            x,y = a1&511,a0&255
            x,y = x if x<256 else x-512,y if y<128 else y-256
            w,h = SIZES[a0>>14][a1>>14]
            tile,palette = (a2&1023)*(32<<mapping),(a2>>12)*16
            obj = Image.new('RGBA',(w,h)); pixels = obj.load()
            for yy in range(h):
                for xx in range(w):
                    pos = tile+((yy//8)*(w//8)+xx//8)*32+(yy%8)*4+(xx%8)//2
                    ci = (raw[pos]>>(4*(xx%2)))&15
                    pixels[xx,yy] = (*colors[palette+ci],255 if ci else 0)
            if a1&4096: obj = obj.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            if a1&8192: obj = obj.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
            image.alpha_composite(obj,(64+x,64+y))
        path = dest/f'greatball-{index}.png'
        image.save(path)
        paths.append(path.relative_to(output).as_posix())
    seq_count, frame_count, seq_off, frame_off, elem_off = struct.unpack_from('<HHIII',anim,24)
    sequences = []
    for index in range(seq_count):
        frames,loop,kind,mode,off = struct.unpack_from('<HHIII',anim,24+seq_off+index*16)
        assert kind == 0x10000, 'Expected cell-index animation'
        values = []
        for j in range(frames):
            elem,duration,padding = struct.unpack_from('<IHH',anim,24+frame_off+off+j*8)
            cell_index, = struct.unpack_from('<H',anim,24+elem_off+elem)
            assert cell_index < count and duration > 0
            values.append([cell_index,duration])
        sequences.append({'frames':values,'loop':loop,'mode':mode})
    effect = ndspy.narc.NARC(rom.getFileByName('a/0/6/7')).files[9]
    if hashlib.sha256(effect).hexdigest() != '721b4c13e2881f6c612c6a8ac3acfad6a9b7ca1d04d7e589c5e9440b4f62c35d':
        raise ValueError('Unexpected IRBI capture effect')
    overlay = rom.loadArm9Overlays([93])[93]
    catch_code = overlay.data[0x021cba34-overlay.ramAddress:0x021cbbf4-overlay.ramAddress]
    catch_hash = hashlib.sha256(catch_code).hexdigest()
    if catch_hash != '8ae492569c1d0d13c563c6a70c10141ab4a25f6335cca3474a9caa4b2e72fd86':
        raise ValueError('Unexpected IRBI capture calculation')
    result = {'captureRulesSource':{'overlay':93,'address':'0x021cba34','sha256':catch_hash},'id':570,'source':'IRBI a/0/6/7:9; a/0/9/5:129,130,135,136',
              'sha256':hashlib.sha256(effect).hexdigest(), 'cells':paths,
              'sequences':sequences,'commands':program(effect),
              'particleMap':{3:6,29:32,46:58,47:59,48:60,49:61},
              'origin':[64,64]}
    (output/'route2-ball.js').write_text('window.ROUTE2_BALL='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
    print(f'Extracted {count} cells, {seq_count} sequences, {len(result["commands"])} commands')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('rom',type=Path)
    parser.add_argument('output',type=Path)
    args = parser.parse_args()
    extract(ndspy.rom.NintendoDSRom.fromFile(args.rom),args.output)
