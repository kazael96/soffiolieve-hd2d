"""Extract only native initial actor flags relevant to the first-ending maps."""
from pathlib import Path
import argparse,json,struct,hashlib
from irbi_reader import NintendoDSRom,NARC
root=Path(__file__).resolve().parents[1]
def extract(rom_path,output):
 rom=NintendoDSRom.fromFile(rom_path);assert rom.idCode==b'IRBI';raw=NARC(rom.getFileByName('a/0/5/7')).files[866]
 commands=list(struct.iter_unpack('<HH',raw[36:524]));assert len(commands)==122 and all(op==35 for op,_ in commands)
 text=(root/'src/finale-events.js').read_text(encoding='utf8');events=json.loads(text.split('=',1)[1].rstrip(';\n'))
 actors={a['flag']for zone in events['zones'].values()for a in zone['actors']if a['flag']};initial=sorted(actors&{flag for _,flag in commands})
 assert initial==[599,600,601,617,660,661,803]
 data={'source':'IRBI common866 contiguous FlagSet run36..524 intersected with first-ending actor flags; not whole common866 execution','bankSHA256':hashlib.sha256(raw).hexdigest(),'start':36,'end':524,'initialActorFlags':initial}
 output.write_text('window.FINALE_INITIAL_STATE='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8');print('Native initial actor flags:',initial)
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('rom',type=Path);parser.add_argument('output',type=Path);args=parser.parse_args();extract(args.rom,args.output)
