"""Verified native IRBI voice/forms resources selected by overlay208."""
from pathlib import Path
import argparse,hashlib,importlib.util,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10

def sibling(name):
 spec=importlib.util.spec_from_file_location(name,Path(__file__).with_name(name+'.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m

def extract(rom,output):
 assert rom.idCode==b'IRBI';gfx=sibling('extract-menu');events=sibling('extract-original-events')
 def files(name):return[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName(name)).files]
 f=files('a/1/5/9');ovobj=rom.loadArm9Overlays([208])[208];ov=bytes(ovobj.data);base=ovobj.ramAddress;assert base==0x21bc140
 dest=output/'assets/dex-modes';dest.mkdir(parents=True,exist_ok=True);images={};groups={}
 for label,char,screen,palette,slot,bg in [('cryBackground',11,42,1,5,2),('formsUpperBackground',12,35,2,0,7)]:
  remap=list(f);b=bytearray(f[screen])
  for off in range(36,len(b),2):
   tile=struct.unpack_from('<H',b,off)[0];struct.pack_into('<H',b,off,(tile&0xfff)|(slot<<12))
  remap[screen]=bytes(b);im=gfx.layer(remap,char,screen,palette);name=label+'.png';im.save(dest/name)
  images[label]={'src':'assets/dex-modes/'+name,'size':list(im.size),'background':bg,'physicalScreen':'bottom'if bg<4 else'top','source':{'archive':'a/1/5/9','char':char,'screen':screen,'palette':palette,'sourcePaletteBank':slot,'loader':'overlay208:021c2718'if bg==2 else'overlay208:021c3db4','wrapper':'021bc8bc remaps all BG tile palette banks after palette-range transfer'}}
 # Shared backdrop helper021bc744: two twelve-byte resource records at
 #021c7ff0 and mode palette-byte tables021c7fe0/021c7fe8.
 for label,char,screen,palette,body,footer,bg in [('infoUpperCommon',12,36,2,0,1,6),('cryLowerCommon',11,41,1,2,2,0),('cryUpperCommon',12,36,2,2,1,4),('formsLowerCommon',11,32,1,4,4,3),('formsUpperCommon',12,36,2,4,1,4),('habitatUpperCommon',12,36,2,3,1,4)]:
  remap=list(f);b=bytearray(f[screen]);width=struct.unpack_from('<H',b,24)[0]//8
  for off in range(36,len(b),2):
   tile=struct.unpack_from('<H',b,off)[0];row=(off-36)//2//width;slot=footer if row>=21 else body;struct.pack_into('<H',b,off,(tile&0xfff)|(slot<<12))
  remap[screen]=bytes(b);im=gfx.layer(remap,char,screen,palette);name=label+'.png';im.save(dest/name)
  images[label]={'src':'assets/dex-modes/'+name,'size':list(im.size),'background':bg,'physicalScreen':'bottom'if bg<4 else'top','source':{'archive':'a/1/5/9','char':char,'screen':screen,'palette':palette,'bodySourcePaletteBank':body,'footerSourcePaletteBank':footer,'loader':'overlay208:021bc744,021c7ff0; voice021c272a/273c; forms021c3dca/3dde; habitat021bf9e6'}}
  if label=='infoUpperCommon':images[label]['source'].update({'loader':'overlay206:021b9f72..021ba014 loads alternate NSCR at tileOffset1024;021ba6c8 hides first two Info BGs but scrolls third toY=-256','nativeDestinationBodyBank':4,'nativeDestinationFooterBank':5})
 for mode,slot in enumerate([0,2,1,3,3]):
  remap=list(f);b=bytearray(f[37])
  for off in range(36,len(b),2):
   tile=struct.unpack_from('<H',b,off)[0];struct.pack_into('<H',b,off,(tile&0xfff)|(slot<<12))
  remap[37]=bytes(b);im=gfx.layer(remap,14,37,4);name=f'upperHeader{mode}.png';im.save(dest/name)
  images['upperHeader'+str(mode)]={'src':'assets/dex-modes/'+name,'size':list(im.size),'background':5,'physicalScreen':'top','source':{'archive':'a/1/5/9','char':14,'screen':37,'palette':4,'sourcePaletteBank':slot,'loader':'021be768;021be828 loads palette4 sourceBank table021c83f4[mode] into bank13'}}
 for label,char,cer,anr,palette in [('cryPanel',24,30,47,8),('formsPanels',10,26,43,1),('formsArrows',16,29,46,6)]:
  group={'source':{'archive':'a/1/5/9','char':char,'cells':cer,'animation':anr,'palette':palette},'cells':[],'animations':gfx.animations(f[anr])}
  for i,(im,box)in enumerate(gfx.cells(f,char,cer,palette)):
   name=f'{label}-{i}.png';im.save(dest/name);group['cells'].append({'src':'assets/dex-modes/'+name,'origin':box[:2],'size':box[2:]})
  groups[label]=group
 def ptr(address):return struct.unpack_from('<I',ov,address-base)[0]
 voice=ptr(0x21c2c84);assert voice==0x21c8604
 form=ptr(0x21c651c);assert form==0x21c86a0
 window=ptr(0x21c493c)
 banks=files('a/0/0/2')
 data={'source':'Italian Black IRBI overlay208 zukan_detail_voice.c / zukan_detail_form.c','images':images,'groups':groups,'labels':{'234':events.messages(banks[234]),'244':events.messages(banks[244])},'cry':{'background':'cryBackground','waveformWindow':{'background':3,'rect':[8,16,248,120],'source':'021c34fa..021c350a'},'nameWindow':{'background':6,'rect':[80,40,96,32],'centered':True,'source':'021c314c,021c3180'},'objectTable':{'address':hex(voice),'fields':['x','y','animation','priority','engine','charGroup','paletteGroup','animationGroup','flag'],'records':[list(ov[voice-base+i*9:voice-base+(i+1)*9])for i in range(7)]},'nativeSource':'021c2b44 loads cryPanel plus navigation resources; waveform code021c34dc onward'},'forms':{'background':'formsUpperBackground','objectTable':{'address':hex(form),'fields':['x','y','animation','priority','engine','charGroup','paletteGroup','animationGroup'],'records':[list(ov[form-base+i*8:form-base+(i+1)*8])for i in range(4)]},'windows':{'address':hex(window),'fields':['background','tileX','tileY','width','height','paletteBank','baseTile'],'records':[list(ov[window-base+i*7:window-base+(i+1)*7])for i in range(5)],'source':'021c47cc..021c485e'},'nativeSource':'021c615c sprite loader; source text234+244; 3D Pokemon rendered separately'},'provenance':{'overlay':208,'sha256':hashlib.sha256(ov).hexdigest(),'bgWrapper':'021bc8bc','lcd':'Main bottom/Sub top, retained from detail dispatcher'},'limits':['Waveform is procedural; its original pixel algorithm and sample timing are not yet ported','Form-page 3D Pokemon transforms, visibility and text-value selection require further tracing','Object-table byte fields preserve native records; animation refers to NANR index, not NCER cell']}
 data['revision']=hashlib.sha256(b''.join(p.read_bytes()for p in sorted(dest.glob('*.png')))).hexdigest()[:12]
 data['header']={'physicalScreen':'top','background':5,'modeImage':['upperHeader0','upperHeader1','upperHeader2','upperHeader3','upperHeader4'],'modeSourcePaletteBanks':[0,2,1,3,3],'labelsBank':234,'labelsStart':178,'textPositionInCharacterImage':[24,5],'source':'021be768 NCGR14/NSCR37;021be828..021be8ac dynamic palette+title printer; text rendered into NCGR char image then assigned native screen map','note':'Images preserve blank original header; add native font0 caption through the original character-image coordinates, rather than drawing arbitrary screen labels'}
 (output/'dex-modes-assets.js').write_text('window.DEX_MODES_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8',newline='\n')

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)
