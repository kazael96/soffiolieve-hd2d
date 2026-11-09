"""Add the native Boreduopoli second-clerk stock to the chapter catalogue."""
from pathlib import Path
import argparse, hashlib, importlib.util, json, struct
try:
    import ndspy.rom, ndspy.narc
except ModuleNotFoundError:
    from irbi_reader import install
    install()
    import ndspy.rom, ndspy.narc


def extend(rom_path, output):
    rom = ndspy.rom.NintendoDSRom.fromFile(rom_path)
    assert rom.idCode == b'IRBI'
    file = Path(output) / 'opelucid-data.js'
    data = json.loads(file.read_text(encoding='utf8').split('=', 1)[1].rstrip(';\n'))
    overlay = rom.loadArm9Overlays([21])[21]
    word = lambda address: struct.unpack_from('<I', overlay.data, address-overlay.ramAddress)[0]
    table, counts = word(0x021b38b8), word(0x021b38c0)
    index = 8+6
    pointer, count = word(table+index*4), overlay.data[counts-overlay.ramAddress+index]
    stock = list(struct.unpack_from('<'+'H'*count, overlay.data, pointer-overlay.ramAddress))
    assert stock == [13,10,15,146,137,138,139,140,141,142,143]
    spec = importlib.util.spec_from_file_location('events', Path(__file__).with_name('extract-original-events.py'))
    events = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(events)
    texts = ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files
    names, descriptions = events.messages(texts[54]), events.messages(texts[53])
    records = ndspy.narc.NARC(rom.getFileByName('a/0/2/4')).files
    data['market']['fixedStocks']['8'] = index
    data['market']['stocks'][str(index)] = stock
    data['market']['source']['fixed8'] = {'index':index,'pointer':hex(pointer),'count':count,
        'overlaySha256':hashlib.sha256(overlay.data).hexdigest()}
    for item in stock:
        key = str(item)
        data['itemNames'][key], data['itemDescriptions'][key] = names[item], descriptions[item]
        data['itemPrices'][key] = struct.unpack_from('<H', records[item])[0]*10
        data['itemPockets'][key] = (struct.unpack_from('<H', records[item],8)[0]>>7)&7
    file.write_text('window.OPELUCID_DATA='+json.dumps(data,separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf8')
    print('Boreduopoli stock8:',stock)


if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('rom');parser.add_argument('output',type=Path)
    args=parser.parse_args();extend(args.rom,args.output)
