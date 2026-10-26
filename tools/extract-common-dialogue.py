"""Original shared/field dialogue frame resources and native geometry, IRBI."""
from pathlib import Path
import argparse,importlib.util,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10,ndspy.codeCompression
from PIL import Image

def extract(rom,output):
 assert rom.idCode==b'IRBI'
 spec=importlib.util.spec_from_file_location('menu',Path(__file__).with_name('extract-menu.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
 f=[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName('a/0/0/5')).files]
 dest=output/'assets/common-dialogue';dest.mkdir(parents=True,exist_ok=True);images={}
 def frame(label,char,palette,width,height,clearCenter=False):
  tiles=[(0 if x==0 else 2 if x==width-1 else 1)if y==0 else(6 if x==0 else 8 if x==width-1 else 7)if y==height-1 else(3 if x==0 else 5 if x==width-1 else 4)for y in range(height)for x in range(width)]
  if char==10:
   # Field border uses an18-tile source with non-contiguous corners/edges.
   lookup=[0,1,5,6,7,11,12,14,17];tiles=[lookup[t]for t in tiles]
  nscr=bytearray(36+len(tiles)*2);struct.pack_into('<HH',nscr,24,width*8,height*8)
  for i,t in enumerate(tiles):struct.pack_into('<H',nscr,36+i*2,t)
  im=m.layer(f+[nscr],char,len(f),palette)
  if clearCenter:im.paste((255,255,255,255),(8,8,im.width-8,im.height-8))
  im.save(dest/(label+'.png'));images[label]={'src':'assets/common-dialogue/'+label+'.png','size':list(im.size),'source':{'archive':'a/0/0/5','char':char,'palette':palette,'tiles':[[0,1,5],[6,None,11],[12,14,17]]if char==10 else[[0,1,2],[3,4,5],[6,7,8]]},'slice':[8,8,8,8],'interiorFilledWhite':clearCenter}
 frame('style0Atlas',9,3,3,3);frame('style1Atlas',11,0,3,3);frame('fieldAtlas',10,3,3,3,True)
 frame('partyPrompt',9,3,16,6,True);frame('fieldDialogue',10,3,32,6,True)
 fonts=ndspy.narc.NARC(rom.getFileByName('a/0/2/3')).files;colors=m.pal(fonts[5])
 arm=ndspy.codeCompression.decompress(rom.arm9);off=0x0209e84c-rom.arm9RamAddress;raw=arm[off:off+32];im=Image.new('RGBA',(8,8));p=im.load()
 for y in range(8):
  for x in range(8):
   ci=(raw[y*4+x//2]>>(4*(x%2)))&15;p[x,y]=(*colors[ci],255 if ci!=15 else 0)
 im.save(dest/'advanceArrow.png');images['advanceArrow']={'src':'assets/common-dialogue/advanceArrow.png','size':[8,8],'source':{'arm9':'0x0209e84c','length':32,'format':'8x8 4bpp','loader':'0x02020d48','palette':'a/0/2/3:5'},'backgroundIndex15MadeTransparent':True}
 ov=rom.loadArm9Overlays([21])[21];b=bytes(ov.data);loc=((0x02192702+4)&~3)+0x58;table=struct.unpack_from('<I',b,loc-ov.ramAddress)[0];offsets=list(struct.unpack_from('<3H',b,table-ov.ramAddress))
 data={'source':'IRBI ARM9 common frame API + overlay21 field_msgbg.c +overlay91 party','images':images,'native':{'font':{'archive':'a/0/2/3','member':0,'paletteMember':5,'reuse':'POKEDEX_ASSETS.font','normalPacked':'0x440','foregroundIndex':1,'shadowIndex':2,'transparentIndex':0,'windowFillIndex':15,'foregroundRgb':colors[1],'shadowRgb':colors[2],'windowFillRgb':colors[15]},'commonStyles':{'0':{'char':9,'palette':3},'1':{'char':11,'palette':0}},'commonStyleTable':'0x0209e848/0x0209e84a','commonLoader':'0x0201f53c','commonBorder':'0x0201f5a8','borderOutsideTextWindow':True,'partyPrompt':{'interior':[16,152,112,32],'outer':[8,144,128,48],'bg':0,'style':0,'source':'0x021bb65e +0x021bb954'},'fieldDialogue':{'interior':[8,152,240,32],'outer':[0,144,256,48],'bgText':2,'bgBorder':1,'char':10,'palette':3,'font0':True,'source':'0x021b0356 ->0x02190ea0/0x02190ed4; 0x021928e8/0x02192904','windowFill':'0x02192a42 uses0xff ->4bppindex15'},'advanceArrow':{'bitmapLoader':'0x02020d48','fieldAnimation':'0x021927c0','anchorFormula':'window local(width-8,height-8-offsets[phase])','offsets':offsets,'framesPerPhase':4,'loopPhases':3,'fieldBitmapIdentityFullyTraced':False,'note':'shared native bitmap verified; field-specific buffer provenance not fully traced, movement verified'}}}
 (output/'common-dialogue-assets.js').write_text('window.COMMON_DIALOGUE_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8');print('common dialogue',len(images),'arrow offsets',offsets)
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)
