"""Export the actual animated child doors used by the chapter049 buildings.

Keep bundle-specific IDs:259 exists in both8 and9 and must never alias by ID.
"""
from pathlib import Path
import argparse, json, shutil
import irbi_reader
irbi_reader.install()
import ndspy.rom

def extract(rom, output, work, apicula):
    source=Path(__file__).with_name('extract-field-models.py').read_text(encoding='utf8')
    source=source.replace("(b'BCA0',b'BMA0')","(b'BCA0',b'BMA0',b'BTA0')")
    start=source.index('    for path,member,texture_path,texture_member,ids in [')
    end=source.index('        bundle=ndspy.narc.NARC',start)
    source=source[:start]+'    for path,member,texture_path,texture_member,ids in plans:\n'+source[end:]
    combined={'source':'IRBI a/2/2/9 bundles5/8/9, a/1/7/6; scoped native building children','models':{},'children':{}}
    for member,ids in [(5,[93]),(8,[257,259,261,264]),(9,[259,287])]:
        scope={ '__name__':'mistralton_door_export', 'plans':[('a/2/2/9',member,'a/1/7/6',member,ids)]}
        exec(compile(source,str(Path(__file__).with_name('extract-field-models.py')),'exec'),scope)
        folder=work/('bundle'+str(member));folder.mkdir(parents=True,exist_ok=True)
        result=scope['extract'](rom,folder,apicula)
        for mid,r in result['models'].items():
            name=f'True-{member}-{mid}';r['key']=f'mt-door-{member}-{mid}'
            destination=output/'assets/mistralton/doors'/f'bundle{member}'/Path(r['model']).parent.name
            destination.parent.mkdir(parents=True,exist_ok=True)
            shutil.copytree(folder/Path(r['model']).parent,destination,dirs_exist_ok=True)
            r['model']=(destination/Path(r['model']).name).relative_to(output).as_posix()
            combined['models'][name]=r
        for pid,r in result['children'].items():
            r['modelKey']=f'True-{member}-{r["model"]}'
            combined['children'][f'True-{member}-{pid}']=r
    payload=json.dumps(combined,ensure_ascii=True,separators=(',',':'))
    (output/'mistralton-doors.js').write_text('window.MISTRALTON_DOOR_ASSETS='+payload+';\n'+'''(()=>{let installed=false;window.MistraltonDoors={install(){if(installed)return;const a=FIELD_MODEL_ASSETS,d=MISTRALTON_DOOR_ASSETS;a.scopes??={};a.scopes.mt=d;for(const [key,r]of Object.entries(d.models))a.models['mt:'+key]=r;installed=true;}};})();\n''',encoding='utf8')
    return combined

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    for key in ['rom','output','work','apicula']:p.add_argument('--'+key,type=Path,required=True)
    a=p.parse_args();r=extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output.resolve(),a.work.resolve(),a.apicula.resolve())
    print('Native chapter049 doors:',len(r['models']),'models;',len(r['children']),'building children')
