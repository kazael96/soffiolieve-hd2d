"""IRBI Master Ball131/132 and Luxury Ball151/152, original shared cells."""
from pathlib import Path
import argparse, importlib.util, json, shutil
from irbi_reader import install
install()
import ndspy.rom


def extract(rom_path, output, work):
    output,work=Path(output),Path(work);work.mkdir(parents=True,exist_ok=True)
    rom=ndspy.rom.NintendoDSRom.fromFile(rom_path)
    if rom.idCode!=b'IRBI':raise ValueError('Expected Italian Black IRBI')
    original=Path(__file__).with_name('extract-route2-ball.py')
    catalog=output/'mistralton-ball.js';data=json.loads(catalog.read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
    reports=[]
    for item,name,char,palette in [(1,'masterball',131,132),(11,'luxuryball',151,152)]:
        source=original.read_text(encoding='utf8').replace('(136,135,129,130)',repr((palette,char,129,130))).replace('129,130,135,136',f'129,130,{char},{palette}').replace('greatball',name)
        scope={'__file__':str(original),'__name__':'league_ball_cells'}
        exec(compile(source,str(original),'exec'),scope);scope['extract'](rom,work)
        record=json.loads((work/'route2-ball.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
        data['balls'][str(item)]={k:record[k]for k in ['source','cells','origin','sequences']}
        for file in record['cells']:
            target=output/file;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(work/file,target)
        reports.append({'ball':item,'cells':len(record['cells']),'source':record['source']})
    catalog.write_text('window.MISTRALTON_BALL='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
    return reports


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('rom');p.add_argument('output',type=Path);p.add_argument('work',type=Path)
    a=p.parse_args();print(extract(a.rom,a.output,a.work))
