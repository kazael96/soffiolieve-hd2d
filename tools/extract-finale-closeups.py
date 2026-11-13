"""Export original IRBI overlay82 BG2/BG3 closeups and native eye/mouth tiles."""
import argparse, hashlib, importlib.util, json, struct
from pathlib import Path
from irbi_reader import NintendoDSRom, NARC, lz10, code_decompress


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--rom', type=Path, required=True)
    p.add_argument('--output', type=Path, required=True)
    a = p.parse_args()
    rom = NintendoDSRom.fromFile(a.rom)
    if rom.idCode != b'IRBI':
        raise ValueError('Expected Italian Black IRBI')
    overlays = rom.loadArm9Overlays([10, 82])
    o = overlays[82]
    if hashlib.sha256(o.data).hexdigest() != '24ec77a51fb9643b4f7ed0a3558328683ed19eafcf3d6f32d29dbc8f4072f8a7':
        raise ValueError('Original closeup overlay changed')
    # OP467 explicitly loads82 before calling021f5140. Do not infer ownership
    # from an address shared by many overlays.
    if struct.unpack_from('<I', overlays[10].data, 0x2164864-overlays[10].ramAddress)[0] != 82:
        raise ValueError('Native closeup overlay loader changed')
    arm = code_decompress(rom.arm9)
    ptr = struct.unpack_from('<I', arm, 0x20a6b58-rom.arm9RamAddress+187*4)[0]
    archive = arm[ptr-rom.arm9RamAddress:].split(b'\0')[0].decode()
    if archive != 'a/1/8/7':
        raise ValueError('Native closeup archive changed')
    files = [lz10(b) if b[:1] == b'\x10' else b for b in NARC(rom.getFileByName(archive)).files]
    if len(files) != 12:
        raise ValueError('Native closeup archive length changed')
    spec = importlib.util.spec_from_file_location('native_gfx', Path(__file__).with_name('extract-menu.py'))
    gfx = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(gfx)
    table = lambda addr, count: [list(struct.unpack_from('<HH', o.data, addr-o.ramAddress+i*4)) for i in range(count)]
    mouth, eyes = table(0x21f57b0, 4), table(0x21f57c0, 5)
    if mouth != [[1,3],[2,3],[1,3],[0,3]] or eyes != [[0,2],[1,2],[2,2],[1,2],[0,2]]:
        raise ValueError('Native face animation tables changed')
    data = {'source': {'overlay':82,'overlaySHA256':hashlib.sha256(o.data).hexdigest(), 'loader':'overlay10:0216483a..0216484a', 'archive':archive},
            'width':256, 'height':192, 'images':{}, 'modes':{},
            'mouth':{'sequence':mouth,'at':[112,88,32,16],'nativeTileBase':388,'nativeDestination':366},
            'eyes':{'sequence':eyes,'at':[104,64,48,16],'nativeTileBase':352,'nativeDestination':269},
            'blinkDelay':[80,99], 'blendFrames':30,
            'limits':['Original BG images and tile updates; browser layout and full command timing require separate runtime/GPU verification.']}
    dest = a.output/'assets/finale/closeups'
    dest.mkdir(parents=True, exist_ok=True)

    def save(key, im):
        file = dest/(key+'.png')
        im.save(file)
        data['images'][key] = {'src':'assets/finale/closeups/'+file.name, 'size':list(im.size), 'sha256':hashlib.sha256(file.read_bytes()).hexdigest()}
        return key

    for mode in range(3):
        bg = save(f'background{mode}', gfx.layer(files,4+mode,8+mode,mode))
        body = save(f'body{mode}', gfx.layer(files,7,11,mode).crop((0,0,256,192)))
        data['modes'][mode] = {'background':bg,'body':body,'palette':mode,'character':4+mode,'screen':8+mode,'overlayCharacter':7,'overlayScreen':11}
        for feature, width, base, destination, box in [('eyes',6,352,269,(104,64,152,80)),('mouth',4,388,366,(112,88,144,104))]:
            keys = []
            for frame in range(3):
                modified = bytearray(files[11])
                # overlay82:021f5720 writes these native tile indices into
                # two rows of BG3; rendering the patched map preserves flips,
                # transparency and the exact coordinates without redrawing.
                for row in range(2):
                    for column in range(width):
                        struct.pack_into('<H',modified,36+2*(destination+row*32+column),base+frame*width*2+row*width+column)
                patched = files.copy()
                patched[11] = bytes(modified)
                keys.append(save(f'{feature}{mode}-{frame}',gfx.layer(patched,7,11,mode).crop(box)))
            data['modes'][mode][feature] = keys
    (a.output/'finale-closeups-data.js').write_text('window.FINALE_CLOSEUPS='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
    print(json.dumps({'images':len(data['images']),'modes':3,'source':data['source']}))


if __name__ == '__main__':
    main()
