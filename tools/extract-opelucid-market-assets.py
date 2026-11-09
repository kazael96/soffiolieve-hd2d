"""Original Timer/Quick Ball cells, item icons and Tubeline Mail paper."""
from pathlib import Path
import argparse, hashlib, importlib.util, json, shutil, struct
try:
    import ndspy.rom, ndspy.narc, ndspy.lz10, ndspy.codeCompression
except ModuleNotFoundError:
    from irbi_reader import install
    install()
    import ndspy.rom, ndspy.narc, ndspy.lz10, ndspy.codeCompression


def read(file):
    return json.loads(file.read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))


def extract(rom_path, output, work):
    output,work=Path(output),Path(work);work.mkdir(parents=True,exist_ok=True)
    rom=ndspy.rom.NintendoDSRom.fromFile(rom_path);assert rom.idCode==b'IRBI'
    balls=read(output/'mistralton-ball.js')
    overlay=rom.loadArm9Overlays([93])[93]
    assert struct.unpack_from('<I',overlay.data,0x021cbd94-overlay.ramAddress)[0]==1229
    balls['ballModifierSource'].update({'Timer':'021cbd2e','Quick':'021cbd82','elapsedCounterOffset':16,'timerStepQ12':1229})
    original=Path(__file__).with_name('extract-route2-ball.py')
    for item,name,char,palette in [(10,'timerball',149,150),(15,'quickball',159,160)]:
        source=original.read_text(encoding='utf8').replace('(136,135,129,130)',repr((palette,char,129,130))).replace('129,130,135,136',f'129,130,{char},{palette}').replace('greatball',name)
        context={'__file__':str(original),'__name__':'market_cells'};exec(compile(source,str(original),'exec'),context)
        context['extract'](rom,work)
        record=read(work/'route2-ball.js')
        balls['balls'][str(item)]={k:record[k]for k in ['source','cells','origin','sequences']}
        for file in record['cells']:
            target=output/file;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(work/file,target)
    (output/'mistralton-ball.js').write_text('window.MISTRALTON_BALL='+json.dumps(balls,separators=(',',':'))+';\n',encoding='utf8')
    spec=importlib.util.spec_from_file_location('menu',Path(__file__).with_name('extract-menu.py'));gfx=importlib.util.module_from_spec(spec);spec.loader.exec_module(gfx)
    files=lambda name:[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName(name)).files]
    arm=ndspy.codeCompression.decompress(rom.arm9);icons=files('a/0/2/5')
    menu_file=output/'opelucid-menu.js';menu=json.loads(menu_file.read_text(encoding='utf8').split('=',1)[1].split(';Object.assign',1)[0])
    for item in [10,15,146]:
        char,palette=struct.unpack_from('<HH',arm,0x0209eaec-rom.arm9RamAddress+item*4)
        image,box=gfx.cells(icons,char,1,palette)[0];file=f'assets/party-details/item-{item}.png';image.save(output/file)
        menu['items'][str(item)]={'src':file,'origin':box[:2],'size':box[2:],'source':{'archive':'a/0/2/5','char':char,'palette':palette,'cells':1}}
    menu_file.write_text('window.OPELUCID_MENU='+json.dumps(menu,separators=(',',':'))+';Object.assign(MENU_ASSETS.pokemonIcons,OPELUCID_MENU.icons);Object.assign(PARTY_DETAIL_ASSETS.itemMap,OPELUCID_MENU.items);\n',encoding='utf8')
    mail_file=output/'mistralton-mail-data.js';mail=read(mail_file);paper=files('a/1/5/5');image=gfx.layer(paper,21,33,9)
    file='assets/mistralton/mail/paper-146.png';image.save(output/file);data=read(output/'opelucid-data.js')
    mail['items']['146']={'name':data['itemNames']['146'],'description':data['itemDescriptions']['146'],'paper':{'src':file,'size':list(image.size),'clip':[0,0,256,192],'baseColor':list(gfx.pal(paper[9])[0]),'sha256':hashlib.sha256((output/file).read_bytes()).hexdigest(),'source':{'archive':'a/1/5/5','nativeArchiveId':155,'type':9,'char':21,'screen':33,'palette':9}}}
    mail_file.write_text('window.MISTRALTON_MAIL_DATA='+json.dumps(mail,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
    print('Extracted native balls10/15, three item icons and Mail146 paper')


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('rom');p.add_argument('output',type=Path);p.add_argument('work',type=Path);a=p.parse_args();extract(a.rom,a.output,a.work)
