"""Extract IRBI movements186..190 object-emote resources, never generic text substitutes."""
import argparse, hashlib, json, shutil, struct, subprocess
from pathlib import Path
from irbi_reader import NintendoDSRom, NARC

def main():
    p=argparse.ArgumentParser(description=__doc__)
    for key in ['rom','output','work','apicula']:
        p.add_argument('--'+key,type=Path,required=True)
    a=p.parse_args();rom=NintendoDSRom.fromFile(a.rom)
    if rom.idCode!=b'IRBI':raise ValueError('Expected IRBI')
    overlay=rom.loadArm9Overlays([21])[21];data,base=overlay.data,overlay.ramAddress
    members=struct.unpack_from('<4I',data,0x21d9958-base)
    if members!=(50,51,52,53):raise ValueError('Native emote model table changed')
    archive=NARC(rom.getFileByName('a/0/7/5'));records={}
    for kind,member in enumerate(members):
        folder=a.work/str(kind);folder.mkdir(parents=True,exist_ok=True)
        raw=archive.files[member];source=folder/'model.bmd';source.write_bytes(raw)
        subprocess.run([str(a.apicula.resolve()),'convert',str(source.resolve()),'-o',str((folder/'converted').resolve()),'-f','glb','--overwrite'],check=True,capture_output=True)
        models=list((folder/'converted').glob('*.glb'))
        if len(models)!=1:raise ValueError('Expected one native emote model')
        blob=models[0].read_bytes();doc=json.loads(blob[20:20+struct.unpack_from('<I',blob,12)[0]])
        accessor=doc['accessors'][doc['meshes'][0]['primitives'][0]['attributes']['POSITION']]
        if accessor['min']!=[-8,0,0] or accessor['max']!=[8,16,0]:raise ValueError('Unreviewed native emote geometry')
        if len(doc['images'])!=1:raise ValueError('Unreviewed native emote texture count')
        image=folder/'converted'/doc['images'][0]['uri'];png=image.read_bytes()
        if struct.unpack_from('>II',png,16)!=(16,16):raise ValueError('Unreviewed native emote bitmap')
        target=a.output/'assets/finale/emotes'/str(kind);target.mkdir(parents=True,exist_ok=True)
        # Keep converted original geometry alongside its bitmap as provenance.
        for file in (folder/'converted').iterdir():
            if file.is_file():shutil.copyfile(file,target/file.name)
        records[kind]={'member':member,'model':(target/models[0].name).relative_to(a.output).as_posix(),'src':(target/image.name).relative_to(a.output).as_posix(),'sourceSHA256':hashlib.sha256(raw).hexdigest(),'pngSHA256':hashlib.sha256(png).hexdigest(),'worldSize':[1,1],'sound':[1656,1840,1841,None][kind]}
    result={'source':{'rom':'IRBI','overlay':21,'overlaySHA256':hashlib.sha256(data).hexdigest(),'archive':'a/0/7/5','modelTable':'021d9958','constructor':'021bb4c0','update':'021bb6ec','sound':'021bb65c'},'models':records,'movements':{186:0,187:0,188:1,189:2,190:3},'offset':22/16,'bounce':[6/16,10/16,12/16,12/16,10/16,6/16,0],'hold':30,'frames':37,'adaptation':'Native quad and texture, native30Hz vertical camera-space bounce and hold; HD-2D billboard presentation'}
    a.output.mkdir(parents=True,exist_ok=True);(a.output/'native-object-emotes-data.js').write_text('window.NATIVE_OBJECT_EMOTES='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8')
    print('Extracted4 native emote models/bitmaps and movement186..190 timing into '+str(a.output))

if __name__=='__main__':main()
