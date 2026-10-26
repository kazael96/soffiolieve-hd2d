"""Export IRBI's captured-Pokemon registration screen and scoped Pokedex data."""
from pathlib import Path
import argparse, hashlib, importlib.util, json, struct
import ndspy.rom, ndspy.narc, ndspy.lz10
from PIL import Image

def unpack(b):return ndspy.lz10.decompress(b) if b[:1]==b'\x10' else b
def palette(b):return [tuple(((c>>s)&31)*255//31 for s in (0,5,10)) for c, in struct.iter_unpack('<H',b[40:40+struct.unpack_from('<I',b,32)[0]])]
def pixels(raw,w,h,colors):
    image=Image.new('RGBA',(w,h));p=image.load()
    for y in range(h):
        for x in range(w):
            pos=((y//8)*(w//8)+x//8)*32+(y%8)*4+(x%8)//2;ci=(raw[pos]>>(4*(x%2)))&15
            p[x,y]=(*colors[ci],255 if ci else 0)
    return image

def extract(rom,output):
    assert rom.idCode==b'IRBI','Expected Italian Pokemon Black IRBI'
    narc=lambda name:[unpack(b) for b in ndspy.narc.NARC(rom.getFileByName(name)).files]
    files=narc('a/1/5/9');fonts=narc('a/0/2/3');foot=narc('a/1/6/7');ui=narc('a/0/8/3');personal=narc('a/0/1/6')
    ov=bytes(rom.loadArm9Overlays([206])[206].data);base=0x21b9ce0
    assert struct.unpack_from('<7I',ov,0x21bc034-base)==(159,98,23,0,0,0,0)
    assert struct.unpack_from('<5H',ov,0x21bc0c4-base)==(234,260,245,268,236)
    spec=importlib.util.spec_from_file_location('events',Path(__file__).with_name('extract-original-events.py'));events=importlib.util.module_from_spec(spec);spec.loader.exec_module(events)
    banks=narc('a/0/0/2');texts={i:events.messages(banks[i]) for i in [70,81,234,260,245,268,236]}
    dest=output/'assets/pokedex';dest.mkdir(parents=True,exist_ok=True)
    colors=palette(files[9]);raw=files[25][48:48+struct.unpack_from('<I',files[25],40)[0]]
    background=Image.new('RGBA',(256,192))
    for index in (31,40):
        image=Image.new('RGBA',(256,192));p=image.load()
        for y in range(192):
            for x in range(256):
                t,=struct.unpack_from('<H',files[index],36+((y//8)*32+x//8)*2);xx=7-x%8 if t&1024 else x%8;yy=7-y%8 if t&2048 else y%8;pos=(t&1023)*32+yy*4+xx//2;ci=(raw[pos]>>(4*(xx%2)))&15
                if ci:p[x,y]=(*colors[(t>>12)*16+ci],255)
        background.alpha_composite(image)
    background.save(dest/'entry.png')
    # The caught mark is copied from the same 32-tile-wide character sheet.
    sheet=pixels(raw,256,64,colors[:16]);sheet.crop((8,0,40,24)).save(dest/'caught.png')
    records={};regional=struct.unpack('<650H',personal[-1])
    type_pals=[0,0,1,1,0,0,2,1,0,0,1,2,0,1,1,2,0]
    for sid in [495,498,501,504,506]:
        types=list(dict.fromkeys(personal[sid][6:8]));name=texts[70][sid]
        records[name]={'id':sid,'number':regional[sid],'category':texts[260][sid],'height':texts[245][sid],'weight':texts[268][sid],'description':texts[236][sid],'types':types}
        # Native NCER has two 16x8 OAMs: tile 1 at (-8,-8), tile 0 at (-8,0), 128-byte mapping.
        b=foot[sid+5];raw_foot=b[48:48+struct.unpack_from('<I',b,40)[0]];im=Image.new('RGBA',(16,16));colors_foot=palette(foot[0])[:16]
        assert struct.unpack_from('<3H',foot[4],56)==(0x4000,0x1f8,0) and struct.unpack_from('<3H',foot[4],62)==(0x40f8,0x1f8,1)
        im.alpha_composite(pixels(raw_foot[128:],16,8,colors_foot),(0,0));im.alpha_composite(pixels(raw_foot,16,8,colors_foot),(0,8));im.save(dest/f'foot-{sid}.png')
        for t in types:
            b=ui[34+t];pixels(b[48:48+struct.unpack_from('<I',b,40)[0]],32,16,palette(ui[33])[type_pals[t]*16:][:16]).save(dest/f'type-{t}.png')
    labels={'registration':texts[234][144],'height':texts[234][10],'weight':texts[234][11],'nickname':texts[234][175],'namePrompt':texts[81][1]}
    unknown={key:texts[bank][0] for key,bank in [('category',260),('height',245),('weight',268),('description',236)]}
    # Pokemon's NFTR embeds left bearing, width and advance before each 2bpp cell.
    font=fonts[0];glyph,widths,off=struct.unpack_from('<3I',font,0x20);mapping={}
    while off and off+12<len(font):
        first,last,kind,_,nxt=struct.unpack_from('<4HI',font,off);data=off+12
        if kind==0:
            start=struct.unpack_from('<H',font,data)[0];mapping.update({chr(c):start+c-first for c in range(first,last+1)})
        elif kind==1:mapping.update({chr(c):struct.unpack_from('<H',font,data+(c-first)*2)[0] for c in range(first,last+1)})
        elif kind==2:
            count=struct.unpack_from('<H',font,data)[0];mapping.update({chr(c):g for c,g in struct.iter_unpack('<HH',font[data+2:data+2+count*4])})
        else:raise ValueError('Unknown font map')
        off=nxt
    assert font[glyph:glyph+8]==bytes([12,15,48,0,16,13,2,0])
    chars=sorted(set(''.join(chr(c) for c in range(32,256))+''.join(labels.values())+''.join(str(v) for r in records.values() for v in r.values())+''.join(unknown.values())))
    chars=[c for c in chars if c in mapping and mapping[c]!=65535];metrics={};pal=palette(fonts[5]);atlas=Image.new('RGBA',(16*12,((len(chars)+15)//16)*15*2))
    rows=(len(chars)+15)//16
    for i,ch in enumerate(chars):
        cell=font[glyph+8+mapping[ch]*48:glyph+8+(mapping[ch]+1)*48];left,w,advance=cell[:3];assert advance<=16
        metrics[ch]=[i%16*12,i//16*15,left,advance]
        for variant,ink in enumerate([1,15]):
            for y in range(15):
                for x in range(12):
                    pos=y*12+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
                    if ci in (1,2):atlas.putpixel((i%16*12+x,i//16*15+y+variant*rows*15),(*pal[ink if ci==1 else 2],255))
    atlas.save(dest/'font.png')
    data={'source':'IRBI overlay206, a/1/5/9, a/0/2/3, a/1/6/7, a/0/8/3','hash':hashlib.sha256(ov).hexdigest(),'revision':hashlib.sha256(b''.join(p.read_bytes() for p in sorted(dest.glob('*.png')))).hexdigest()[:12],'species':records,'labels':labels,'unknown':unknown,'font':{'height':15,'variantOffset':rows*15,'glyphs':metrics}}
    (output/'pokedex-assets.js').write_text('window.POKEDEX_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8',newline='\n')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)
