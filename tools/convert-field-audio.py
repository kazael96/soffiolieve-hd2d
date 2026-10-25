"""Package DualRip SSEQ renders as lossless field audio, retaining sample-accurate loops."""
import argparse,csv,json,struct,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--input',type=Path,nargs='+',required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
dest=a.output/'assets/field-audio';dest.mkdir(parents=True,exist_ok=True);catalog={}
for root in a.input:
 for record in csv.DictReader((root/'manifest.csv').open()):
  id=int(record['index'])
  if id in [1024,1923]:continue
  if record['status'] not in ['ok','loop']:raise ValueError(record)
  source=next(root.glob(str(id)+'_*.wav'));raw=source.read_bytes();offset=12;rate=None;loop=None
  while offset+8<=len(raw):
   kind,size=struct.unpack_from('<4sI',raw,offset);body=raw[offset+8:offset+8+size]
   if kind==b'fmt ':rate=struct.unpack_from('<I',body,4)[0]
   if kind==b'smpl' and len(body)>=60 and struct.unpack_from('<I',body,28)[0]:loop=list(struct.unpack_from('<II',body,44))
   offset+=8+size+(size&1)
  output=dest/(str(id)+'.flac');subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(source),'-c:a','flac',str(output)],check=True)
  catalog[str(id)]={'src':output.relative_to(a.output).as_posix(),'name':record['name'],'duration':float(record['duration_s']),'rate':rate,'loop':[loop[0]/rate,(loop[1]+1)/rate] if loop else None}
(a.output/'field-audio.js').write_text('window.FIELD_AUDIO='+json.dumps(catalog,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
print('Packaged',len(catalog),'original field sounds')
