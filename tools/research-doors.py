"""Local research of IRBI building bundles; never uploads any source bytes."""
from pathlib import Path
import sys,struct,json
ROOT=Path(__file__).resolve().parents[2]
sys.path[:0]=[str(ROOT/'audio-tools/python-packages')]
import ndspy.rom,ndspy.narc
rom=ndspy.rom.NintendoDSRom.fromFile(r'C:/Users/AlessandroCapoccetti/Downloads/Pokemon - Versione Nera (Italy) (NDSi Enhanced)/Pokemon - Versione Nera (Italy) (NDSi Enhanced).nds')
assert rom.idCode==b'IRBI'
ov=rom.loadArm9Overlays([21])[21]; off=0x21d3c70-ov.ramAddress
print('sound table', [struct.unpack_from('<5H',ov.data,off+i*10) for i in range(6)])
print('function table', [hex(x) for x in struct.unpack_from('<12I',ov.data,0x21d3c40-ov.ramAddress)])
for path,member in [('a/2/2/9',0),('a/2/3/0',6),('a/2/3/0',1),('a/2/3/0',5)]:
    files=ndspy.narc.NARC(rom.getFileByName(path)).files;b=files[member]
    n=b[2]//2; offsets=struct.unpack_from('<'+str(n*2)+'I',b,4)
    print(path,'fileID',rom.filenames.idOf(path),'member',member,'count',n,'len',len(b))
    for i in range(n):
        p=offsets[i];end=offsets[i+1] if i+1<n else offsets[n]
        data=b[p:end];model=offsets[n+i]
        print(i,'header',p,end,len(data),data[:80].hex(),'model',model,b[model:model+4])
    print('magic locations',[(magic.decode(),[i for i in range(len(b)) if b[i:i+4]==magic][:40]) for magic in [b'BCA0',b'BTA0',b'BMA0',b'BTP0',b'BVA0']])
