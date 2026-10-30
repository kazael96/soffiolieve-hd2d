"""Export IRBI's native rail paths and collision tiles for Castelia/Skyarrow."""
from pathlib import Path
import argparse,json,struct
import ndspy.rom,ndspy.narc,ndspy.codeCompression
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI'
arm=ndspy.codeCompression.decompress(r.arm9)
assign=[(v&2047,v>>11)for v, in struct.iter_unpack('<H',arm[0x209dfa6-r.arm9RamAddress:0x209dfa6-r.arm9RamAddress+40])]
assert assign[:2]==[(28,0),(249,11)]
f=ndspy.narc.NARC(r.getFileByName('a/0/7/9')).files;headers=ndspy.narc.NARC(r.getFileByName('a/1/0/9')).files;out={}
for zone,header in assign[:2]:
 file,camera=struct.unpack('<HH',headers[header]);b=f[file];magic,*off=struct.unpack_from('<4s6I',b);assert magic==b'RL\x05\0'
 points=list(struct.iter_unpack('<4I4I4i3iI48s',b[off[1]:off[2]]));lines=list(struct.iter_unpack('<6I48s',b[off[2]:off[3]]));curves=list(struct.iter_unpack('<I3i20B',b[off[4]:off[5]]))
 record={'header':header,'file':file,'camera':camera,'cameras':[{'kind':v[0],'params':v[1:]}for v in struct.iter_unpack('<I8i',b[off[3]:off[4]])],'tileWidth':struct.unpack_from('<i',b,off[0])[0]/65536,'chunkSpan':128 if zone==249 else 32,
 'points':[{'position':[v/65536 for v in p[12:15]],'lines':p[:4],'dirs':p[4:8],'widths':p[8:12]}for p in points],
 'lines':[{'a':l[0],'b':l[1],'direction':l[2],'curve':l[3],'camera':l[4],'length':l[5]}for l in lines],
 'curves':[{'kind':c[0],'center':[v/65536 for v in c[1:4]]}for c in curves]}
 b=f[len(f)//2+file];n=struct.unpack_from('<I',b)[0];assert n==len(lines);pos=4
 for line in record['lines']:
  width,length=struct.unpack_from('<HH',b,pos);pos+=4;assert length==line['length'];line['tiles']={'width':width,'length':length,'values':struct.unpack_from('<'+str(width*length)+'I',b,pos)};pos+=width*length*4
 assert pos==len(b);out[zone]=record
(a.output/'pinwheel-rails.js').write_text('/* IRBI ARM9 0209DFA6 and a/0/7/9, a/1/0/9. */\nwindow.PINWHEEL_RAILS='+json.dumps(out,separators=(',',':'))+';\n',encoding='utf8')
print('Exported native rails for',list(out))
