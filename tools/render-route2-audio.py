"""Render new original SSEQ music with the project's existing DS sound driver."""
from pathlib import Path
import argparse,json,sys
p=argparse.ArgumentParser();p.add_argument('--work',type=Path,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
sys.path[:0]=[str(a.work/'audio-tools/python-packages'),str(a.work/'audio-tools/DualRip-2.2.1'),str(a.work/'native-driver')]
import numpy as np
import soundfile as sf
from dualrip.formats.sdat import SdatFile
from automated_sseq import render_sequence
sdat=SdatFile(str(a.work/'audio/wb_sound_data.sdat'))
catalog_path=a.output/'field-audio.js';catalog=json.loads(catalog_path.read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
for sid in [1026,1088]:
    if str(sid) in catalog:continue
    audio,marks=render_sequence(sdat,sid,max_seconds=180)
    assert len(audio) and np.any(audio!=0),sid
    if marks:
        assert 0<=marks[0]<marks[1]<=len(audio)
        audio=audio[:marks[1]]
    target=a.output/f'assets/field-audio/{sid}.flac';target.parent.mkdir(parents=True,exist_ok=True)
    sf.write(str(target),audio,32768,format='FLAC',subtype='PCM_16')
    catalog[str(sid)]={'src':target.relative_to(a.output).as_posix(),'name':f'IRBI_SSEQ_{sid}','duration':len(audio)/32768,'rate':32768,'loop':[x/32768 for x in marks] if marks else None}
    catalog_path.write_text('window.FIELD_AUDIO='+json.dumps(catalog,separators=(',',':'))+';\n',encoding='utf8')
    print(sid,len(audio)/32768,marks,flush=True)
