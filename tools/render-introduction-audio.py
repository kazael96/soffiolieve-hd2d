"""Render the ROM-verified professor introduction cue; never infer IDs by name."""
from pathlib import Path
import argparse, hashlib, json, struct, sys


def prove(rom):
    from irbi_reader import NintendoDSRom
    r = NintendoDSRom.fromFile(rom)
    if r.idCode != b'IRBI': raise ValueError('Expected IRBI')
    o = r.loadArm9Overlays([204])[204]
    b, base = bytes(o.data), o.ramAddress
    sha = hashlib.sha256(b).hexdigest()
    if base != 0x21bd940 or sha != '10ae49c0fdda35189d0b4925942cc627a7f441791b4366f2eb304b549336d008':
        raise ValueError('Unreviewed native introduction overlay')
    u = lambda a: struct.unpack_from('<I', b, a-base)[0]
    row = lambda a: list(struct.unpack_from('<6I', b, a-base))
    assert u(0x21bef9c) == 0x21c09b8
    assert u(0x21c09b8) == 0x21bff20 and u(0x21c09bc) == 0x21c0148
    assert row(0x21bff38) == [19, 1, 44, 0, 0, 1]
    assert u(0x21c08d8+19*4) == 0x21be34d
    assert row(0x21c01c0) == [12, 1009, 0, 0, 0, 1]
    assert u(0x21c08d8+12*4) == 0x21be2a5
    assert row(0x21c01f0) == [30, 6, 0, 1, 0, 0]
    assert row(0x21c0208) == [30, 7, 0, 1, 0, 0]
    assert row(0x21c05f8) == [30, 26, 0, 1, 0, 0]
    return {'overlay':204,'overlaySha256':sha,'scenarioTable':'021c09b8',
        'messageBankRow':{'address':'021bff38','words':row(0x21bff38)},
        'musicRow':{'address':'021c01c0','words':row(0x21c01c0)},
        'dispatch':'021c08d8[tag12] ->021be2a4: ldr r0,[r2]; bl02005d90',
        'textDispatch':'021c08d8[tag19] ->021be34c ->021bf104 ->02045ab8',
        'phase':'Scenario1 music1009 precedes bank44 messages6/7 and remains through26; no further BGM command in that range.',
        'notProven':'1008 appears in preload ID list021bfc44; no playback phase inferred.',
        'primaryResearch':'https://github.com/Project-Holon/aletheia/blob/main/src/game/ov204/intro_cmd.c',
        'primaryResearchUse':'Handler meanings researched; all cue rows and pointers verified against local IRBI bytes. No third-party source copied.'}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--rom',type=Path,required=True)
    p.add_argument('--work',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--report-dir',type=Path,required=True)
    a=p.parse_args();proof=prove(a.rom)
    work=a.work.resolve();sys.path[:0]=[str(work/'audio-tools/python-packages'),str(work/'audio-tools/DualRip-2.2.1'),str(work/'native-driver')]
    import numpy as np
    import soundfile as sf
    from dualrip.formats.sdat import SdatFile
    from automated_sseq import render_sequence
    sdat_path=work/'audio/wb_sound_data.sdat'
    sdat_sha=hashlib.sha256(sdat_path.read_bytes()).hexdigest()
    if sdat_sha!='062073d5e29bc953979d75f1ba4f5f26d53cb3fd41130660fe1bca6041189e13':raise ValueError('Unreviewed SDAT')
    sdat=SdatFile(str(sdat_path));arc=sdat.sequence(1009);entry=arc.entries[0]
    if entry.volume!=90 or hashlib.sha256(arc.blob).hexdigest()!='72543eb28a864464d730d2f266f661ab183a20e4766ce9ea859540985969e20a':raise ValueError('SSEQ record mismatch')
    audio,marks=render_sequence(sdat,1009,max_seconds=180)
    if not len(audio) or not np.any(audio!=0):raise ValueError('Empty intro PCM')
    if not marks or not 0<=marks[0]<marks[1]<=len(audio):raise ValueError('Missing/out-of-bounds native loop')
    audio=audio[:marks[1]];target=a.output/'assets/introduction-audio/1009.flac';target.parent.mkdir(parents=True,exist_ok=True)
    sf.write(str(target),audio,32768,format='FLAC',subtype='PCM_16')
    decoded,rate=sf.read(str(target),dtype='int16',always_2d=True)
    if rate!=32768 or not np.array_equal(decoded,audio):raise ValueError('Lossless PCM roundtrip failed')
    record={'src':'assets/introduction-audio/1009.flac','name':'IRBI_SSEQ_1009','duration':len(audio)/rate,'rate':rate,'loop':[x/rate for x in marks], 'sha256':hashlib.sha256(target.read_bytes()).hexdigest(), 'nativeVolume127':90,'nativeVolumeAppliedToPCM':True}
    catalog={'source':'IRBI overlay204 verified professor scenario; original SSEQ1009 and DS bank','sdatSha256':sdat_sha,'music':{'1009':record},'proof':proof}
    source='window.INTRODUCTION_AUDIO='+json.dumps(catalog,separators=(',',':'))+';\n'
    source+='(function(root){function install(field=root.FIELD_AUDIO){if(!field)throw Error("Native field audio catalog unavailable");Object.assign(field,root.INTRODUCTION_AUDIO.music);return true;}root.IntroductionAudio={install};if(root.FIELD_AUDIO)install();})(typeof window!=="undefined"?window:globalThis);\n'
    (a.output/'introduction-audio.js').write_text(source,encoding='utf8',newline='\n')
    report={'status':'PASS','proof':proof,'record':record,'frames':len(audio),'channels':audio.shape[1],'peak':int(np.abs(audio.astype(np.int32)).max()),'pcmRoundtripExact':True,'nativeSSEQPayloadSHA256':hashlib.sha256(arc.blob).hexdigest(),'sdatSHA256':sdat_sha,'audibleComparison':False,'noPCControl':True,'noGPUUsed':True}
    a.report_dir.mkdir(parents=True,exist_ok=True);(a.report_dir/'verified-introduction-audio.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
    print(json.dumps({'status':'PASS','cue':1009,'duration':record['duration'],'loop':record['loop'],'peak':report['peak']}),flush=True)


if __name__=='__main__':main()

