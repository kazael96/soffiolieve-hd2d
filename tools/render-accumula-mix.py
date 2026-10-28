"""IRBI a/1/4/7:2: base 0xfc7f, piano 0x0300, drums 0x0080.
The original SSEQ clocks run for all stems, including muted layers.
"""
from pathlib import Path
import argparse,json,sys,struct,hashlib
p=argparse.ArgumentParser();p.add_argument('--work',type=Path,required=True);p.add_argument('--output',type=Path,required=True);p.add_argument('--rom',type=Path,required=True);a=p.parse_args()
sys.path[:0]=[str(a.work/'audio-tools/python-packages'),str(a.work/'audio-tools/DualRip-2.2.1'),str(a.work/'native-driver')]
import ndspy.rom,ndspy.narc
import numpy as np
import soundfile as sf
from dualrip.formats.sdat import SdatFile
from automated_sseq import render_sequence
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
record=ndspy.narc.NARC(r.getFileByName('a/1/4/7')).files[2]
assert struct.unpack_from('<H',record)[0]==1019
masks=struct.unpack_from('<9H',record,4);fade=struct.unpack_from('<H',record,22)[0]
assert masks[:3]==(0xfc7f,0x0300,0x0080) and fade==60
sdat=SdatFile(str(a.work/'audio/wb_sound_data.sdat'));clips=[];reference=None
for name,flag,mask in [('base',0,masks[0]),('piano',1,masks[1]),('drums',2,masks[2])]:
    # DualRip allocates sequential handles; SDK masks address the SSEQ logical
    # track numbers. Verify the OpenTrack prefix before translating that mask.
    blob=sdat.sequence(1019).blob
    assert blob[:3]==bytes.fromhex('feed03')
    logical=[0];at=3
    while blob[at]==0x93:logical.append(blob[at+1]);at+=5
    assert logical==[0,2,3,5,6,7,8,9]
    slot_mask=sum(1<<slot for slot,num in enumerate(logical) if mask&(1<<num))
    audio,marks=render_sequence(sdat,1019,[{'frame':0,'trackMask':(~slot_mask)&0xffffffff,'volume127':0}],max_seconds=180,volume_curve='scale')
    assert marks and np.any(audio!=0)
    if reference is None:reference=marks
    assert marks==reference
    audio=audio[:marks[1]];target=a.output/f'assets/field-audio/1019-{name}.flac'
    sf.write(str(target),audio,32768,format='FLAC',subtype='PCM_16')
    clips.append({'src':target.relative_to(a.output).as_posix(),'flag':flag,'trackMask':mask,'loop':[v/32768 for v in marks]})
    print(name,mask,len(audio),marks,flush=True)
file=a.output/'field-audio.js';catalog=json.loads(file.read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
catalog['1019']={**catalog['1019'],**clips[0],'duration':reference[1]/32768,'rate':32768,'layers':clips[1:],
    'fadeFrames':fade,'mixSource':{'archive':'a/1/4/7','member':2,'sha256':hashlib.sha256(record).hexdigest()}}
file.write_text('window.FIELD_AUDIO='+json.dumps(catalog,separators=(',',':'))+';\n',encoding='utf8')
