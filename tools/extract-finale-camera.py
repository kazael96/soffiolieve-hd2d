"""Export the four native field-camera presets selected by IRBI command419."""
from pathlib import Path
import argparse
import hashlib
import json
import struct
from irbi_reader import NintendoDSRom,NARC,code_decompress

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('rom',type=Path)
    parser.add_argument('output',type=Path)
    args=parser.parse_args()
    rom=NintendoDSRom.fromFile(args.rom)
    if rom.idCode!=b'IRBI':raise ValueError('Expected Italian Black')
    arm=code_decompress(rom.arm9)
    pointer=struct.unpack_from('<I',arm,0x20a6b58-rom.arm9RamAddress+60*4)[0]
    name=arm[pointer-rom.arm9RamAddress:].split(b'\0',1)[0].decode('ascii')
    blob=bytes(NARC(rom.getFileByName(name)).files[0]);presets={}
    for identifier in range(28,32):
        raw=blob[identifier*44:(identifier+1)*44]
        if len(raw)!=44:raise ValueError('Truncated native field camera')
        presets[str(identifier)]={'rawWords':list(struct.unpack('<11i',raw)),'sourceSHA256':hashlib.sha256(raw).hexdigest(),'offset':identifier*44}
    data={'source':'IRBI OP419 -> overlay56:021f35a8/021f4190 -> field camera0218e07c/0218e160; initializer0218df9a opens NARC60/member0 packed44-byte records','archive':name,'archiveIndex':60,'member':0,'memberSHA256':hashlib.sha256(blob).hexdigest(),'presets':presets}
    args.output.write_text('window.FINALE_CAMERA_PRESETS='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8')
    print('Exported packed native field cameras28..31 from',name)
