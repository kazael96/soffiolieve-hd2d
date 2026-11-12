"""Add the native Boreduopoli second-clerk stock to the chapter catalogue."""
from pathlib import Path
import argparse, hashlib, importlib.util, json, struct
try:
    import ndspy.rom, ndspy.narc
except ModuleNotFoundError:
    from irbi_reader import install
    install()
    import ndspy.rom, ndspy.narc


def extend_stock(rom_path, output, catalog='opelucid', stock_id=8, expected=None):
    rom = ndspy.rom.NintendoDSRom.fromFile(rom_path)
    assert rom.idCode == b'IRBI'
    if catalog not in ['opelucid', 'league'] or stock_id not in [8, 9]:
        raise ValueError('Unreviewed shop catalogue')
    file = Path(output) / (catalog+'-data.js')
    data = json.loads(file.read_text(encoding='utf8').split('=', 1)[1].rstrip(';\n'))
    overlay = rom.loadArm9Overlays([21])[21]
    word = lambda address: struct.unpack_from('<I', overlay.data, address-overlay.ramAddress)[0]
    table, counts = word(0x021b38b8), word(0x021b38c0)
    index = stock_id+6
    pointer, count = word(table+index*4), overlay.data[counts-overlay.ramAddress+index]
    stock = list(struct.unpack_from('<'+'H'*count, overlay.data, pointer-overlay.ramAddress))
    if expected is not None and stock != expected:
        raise ValueError('Native shop table changed')
    spec = importlib.util.spec_from_file_location('events', Path(__file__).with_name('extract-original-events.py'))
    events = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(events)
    texts = ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files
    names, descriptions = events.messages(texts[54]), events.messages(texts[53])
    records = ndspy.narc.NARC(rom.getFileByName('a/0/2/4')).files
    data['market']['fixedStocks'][str(stock_id)] = index
    data['market']['stocks'][str(index)] = stock
    data['market']['source']['fixed'+str(stock_id)] = {'index':index,'pointer':hex(pointer),'count':count,
        'overlaySha256':hashlib.sha256(overlay.data).hexdigest()}
    for item in stock:
        key = str(item)
        data['itemNames'][key], data['itemDescriptions'][key] = names[item], descriptions[item]
        data['itemPrices'][key] = struct.unpack_from('<H', records[item])[0]*10
        data['itemPockets'][key] = (struct.unpack_from('<H', records[item],8)[0]>>7)&7
    file.write_text('window.'+catalog.upper()+'_DATA='+json.dumps(data,separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf8')
    print(catalog+' stock'+str(stock_id)+':',stock)
    return stock


def extend(rom_path, output):
    return extend_stock(rom_path, output, expected=[13,10,15,146,137,138,139,140,141,142,143])


if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('rom');parser.add_argument('output',type=Path)
    args=parser.parse_args();extend(args.rom,args.output)
