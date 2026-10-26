"""Extract Route 1's IRBI encounter rate and verify the original rate algorithm."""
from pathlib import Path
import argparse, hashlib, json, struct
import ndspy.rom, ndspy.narc

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('rom',type=Path);parser.add_argument('output',type=Path)
args=parser.parse_args()
rom=ndspy.rom.NintendoDSRom.fromFile(args.rom)
if rom.idCode != b'IRBI':raise ValueError('Expected IRBI')
overlay=rom.loadArm9Overlays([21])[21]
regions=[(0x021aa2e0,0x021aa32a,'7cb21d01a9af8d16d01a72b7a83118809ca55446edc373049c6eae8c3a5df4b8'),
         (0x021aa5e0,0x021aa5f8,'7c12d93d3504d1bc85b916efdd5fc4264ca4d545947d2f2ae27ca84126406ec3'),
         (0x021aa5f8,0x021aa67c,'084cc8475d291f2edd6e7077e9aeaf945377743abc0bcda860f860d994dbfe65')]
for start,end,digest in regions:
    actual=hashlib.sha256(overlay.data[start-overlay.ramAddress:end-overlay.ramAddress]).hexdigest()
    if actual != digest:raise ValueError(f'Unexpected IRBI encounter function at {start:#x}')
header=ndspy.narc.NARC(rom.getFileByName('a/0/1/2')).files[0]
member=struct.unpack_from('<H',header,317*48+20)[0]&8191
record=ndspy.narc.NARC(rom.getFileByName('a/1/2/6')).files[member]
result={'zone':317,'rate':record[0],'source':f'IRBI a/1/2/6:{member}',
        'sha256':hashlib.sha256(record).hexdigest(),
        'code':[{'start':hex(start),'end':hex(end),'sha256':digest} for start,end,digest in regions]}
args.output.write_text('window.OPENING_ENCOUNTER_RULES='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
print(result['source'],'rate',result['rate'])
