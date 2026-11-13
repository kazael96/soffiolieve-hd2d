"""Export the verified first-ending save-preparation program, not postgame content.

This is a data export. Runtime integration, transactional save/recovery and the
credits/END sequence must be verified separately before claiming completion.
"""
from pathlib import Path
import argparse,hashlib,importlib.util,json,struct
from irbi_reader import NintendoDSRom,NARC


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--rom',type=Path,required=True);p.add_argument('--output',type=Path,required=True);a=p.parse_args()
    r=NintendoDSRom.fromFile(a.rom)
    if r.idCode!=b'IRBI':raise ValueError('Italian Black IRBI required')
    o=r.loadArm9Overlays([10])[10];mapping=[struct.unpack_from('<5H',o.data,0x2170098-o.ramAddress+i*10) for i in range(46)]
    row=next(row for row in mapping if row[0]<=9601<=row[1])
    if row!=(9600,9699,866,3,158):raise ValueError('Native first-ending common script mapping changed')
    for opcode,address in [(220,0x215accc),(228,0x215af84)]:
        if struct.unpack_from('<I',o.data,0x1b4bc+opcode*4)[0]!=(address|1):raise ValueError('Native ending handler changed')
    spec=importlib.util.spec_from_file_location('ending_events',Path(__file__).with_name('extract-original-events.py'));evt=importlib.util.module_from_spec(spec);spec.loader.exec_module(evt)
    table=json.loads(Path(__file__).with_name('irbi-field-commands.json').read_text(encoding='utf8'))
    for chapter in ['route3','pinwheel','castelia','nimbasa','driftveil','mistralton','icirrus','opelucid','league']:
        data=json.loads(Path(__file__).with_name(chapter+'-opcodes.json').read_text(encoding='utf8'));table.update({k:v.get('spec',v) for k,v in data.items()})
    table['220']={'name':'NativeOpcode220','args':['u16']*5}
    table['228']={'name':'NativeOpcode228','args':['u16']}
    raw=NARC(r.getFileByName('a/0/5/7')).files[866];sha=hashlib.sha256(raw).hexdigest()
    if sha!='6d7de82b6fe0a81856cd19e9ce2c2652a2635e2c5258f2a8f269c3f9ab878c0b':raise ValueError('Native completion program changed')
    messages=NARC(r.getFileByName('a/0/0/2')).files
    data={'source':{'scriptArchive':'a/0/5/7','bank':866,'entry':1,'globalScript':9601,'mapping':list(row),'mappingAddress':'overlay10:02170098','scriptSHA256':sha,'overlay10SHA256':hashlib.sha256(o.data).hexdigest(),'operandProof':{'220':'0215accc: five2159a10 reads','228':'0215af84: one2159a10 read'}},'program':evt.program(raw,[1],table),'saveMessages':evt.messages(messages[36]),'saveMessageSource':{'bank':36,'sha256':hashlib.sha256(messages[36]).hexdigest()},'limits':['Data export only; no native342 runtime, save success, graphics or postgame access certified.']}
    if data['program']['supportedEntries']!=[1]:raise ValueError('Unexpected common-script entry scope')
    a.output.mkdir(parents=True,exist_ok=True);(a.output/'finale-completion-data.js').write_text('window.FINALE_COMPLETION='+json.dumps(data,separators=(',',':'),ensure_ascii=False)+';\n',encoding='utf8')
    print(json.dumps({'bank':866,'entry':1,'instructions':len(data['program']['code']),'runtimeIntegrated':False}))


if __name__=='__main__':main()
