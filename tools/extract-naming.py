"""Export IRBI's original Italian name-entry module resources (overlay194)."""
from pathlib import Path
import argparse,hashlib,importlib.util,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10
from PIL import Image

def sibling(name):
 spec=importlib.util.spec_from_file_location(name,Path(__file__).with_name(name+'.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
def extract(rom,output):
 assert rom.idCode==b'IRBI'
 gfx=sibling('extract-menu');events=sibling('extract-original-events')
 def files(p):return [ndspy.lz10.decompress(b)if b[:1]==b'\x10' else b for b in ndspy.narc.NARC(rom.getFileByName(p)).files]
 ov=bytes(rom.loadArm9Overlays([194])[194].data);base=0x21f1340
 assert struct.unpack_from('<3I',ov,0x21f5480-base)==(0x21f1341,0x21f1645,0x21f158d)
 f=files('a/1/1/8');assert len(f)==11
 dest=output/'assets/naming';dest.mkdir(parents=True,exist_ok=True);images={}
 for label,screen in [('top',0),('lowerBackground',3),('buttons',4),('alphabetKeys',5),('qwertyKeys',10)]:
  im=gfx.layer(f,1,screen,2);name=label+'.png';im.save(dest/name);images[label]={'src':'assets/naming/'+name,'size':list(im.size),'source':{'archive':'a/1/1/8','char':1,'screen':screen,'palette':2}}
 sprites={'source':{'archive':'a/1/1/8','char':8,'cells':7,'animation':6,'palette':9},'cells':[],'animations':gfx.animations(f[6])}
 for i,(im,box)in enumerate(gfx.cells(f,8,7,9)):
  name=f'cursor-{i}.png';im.save(dest/name);sprites['cells'].append({'src':'assets/naming/'+name,'origin':box[:2],'size':box[2:]})
 tables=files('a/1/1/9');pages=[]
 for i in range(5):
  b=tables[i];cols,rows=struct.unpack_from('<HH',b);assert len(b)==4+cols*rows*2;codes=list(struct.unpack_from('<'+'H'*(cols*rows),b,4));pages.append({'member':i,'columns':cols,'rows':rows,'codes':codes,'characters':[''.join(chr(c)for c in codes[r*cols:(r+1)*cols])for r in range(rows)]})
 banks=ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files
 labels=events.messages(banks[81]);fonts=files('a/0/2/3');font=fonts[0];glyph,widths,off=struct.unpack_from('<3I',font,0x20);mapping={}
 while off and off+12<len(font):
  first,last,kind,_,nxt=struct.unpack_from('<4HI',font,off);at=off+12
  if kind==0:
   start=struct.unpack_from('<H',font,at)[0];mapping.update({chr(c):start+c-first for c in range(first,last+1)})
  elif kind==1:mapping.update({chr(c):struct.unpack_from('<H',font,at+(c-first)*2)[0]for c in range(first,last+1)})
  elif kind==2:
   count=struct.unpack_from('<H',font,at)[0];mapping.update({chr(c):g for c,g in struct.iter_unpack('<HH',font[at+2:at+2+count*4])})
  else:raise ValueError('Unknown font map')
  off=nxt
 chars=sorted(set(''.join(chr(c)for c in range(32,256))+''.join(labels)+''.join(chr(c)for p in pages for c in p['codes'])));chars=[c for c in chars if c in mapping and mapping[c]!=65535];rows=(len(chars)+15)//16;atlas=Image.new('RGBA',(192,rows*30));metrics={};colors=gfx.pal(fonts[5])
 for i,ch in enumerate(chars):
  cell=font[glyph+8+mapping[ch]*48:glyph+8+(mapping[ch]+1)*48];left,w,advance=cell[:3];metrics[ch]=[i%16*12,i//16*15,left,advance]
  for variant,ink in enumerate([1,15]):
   for y in range(15):
    for x in range(12):
     pos=y*12+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
     if ci in(1,2):atlas.putpixel((i%16*12+x,i//16*15+y+variant*rows*15),(*colors[ink if ci==1 else 2],255))
 atlas.save(dest/'font.png')
 data={'source':'IRBI overlay194 descriptor021f5480; graphics NARC118 a/1/1/8; character tables NARC119 a/1/1/9; text81','images':images,'sprites':sprites,'pages':pages,'labels':events.messages(banks[81]),'alphabetGeometry':{'x':24,'y':40,'columnStep':16,'rowStep':24,'keyWidth':15,'keyHeight':23,'basis':'Original tilemap5 pixel rectangles; native hitbox tolerance not certified'},'buttons':[{'action':a,'rect':r}for a,r in [('upper',[24,162,22,20]),('lower',[48,162,22,20]),('symbols',[72,162,22,20]),('qwerty',[96,162,22,20]),('delete',[120,162,54,20]),('confirm',[176,162,54,20])]],'limits':['QWERTY stagger/hitboxes and page-switch transitions require runtime tracing','Codes U+246D etc are original font glyphs, not Unicode emoji substitutions','Native input limit10 comes from CallPokeNameInput task021c5a1a; no extra Cancel button in source bitmap'],'revision':hashlib.sha256(b''.join(p.read_bytes()for p in sorted(dest.glob('*.png')))).hexdigest()[:12]}
 data['font']={'src':'assets/naming/font.png','height':15,'variantOffset':rows*15,'glyphs':metrics}
 images['nameHeader']={**images['top'],'physicalScreen':'bottom','background':0}
 images['upperBackground']={**images['lowerBackground'],'physicalScreen':'top','background':5}
 images['top']['legacyAliasOf']='nameHeader';images['lowerBackground']['legacyAliasOf']='upperBackground'
 for label,bg in [('buttons',2),('alphabetKeys',1),('qwertyKeys',1)]:images[label].update({'physicalScreen':'bottom','background':bg})
 data['screenLayout']={'mainEngine':'bottom','subEngine':'top','powerSwapBit15':0,'source':'overlay194:021f13d0→021f49e4→021f4a2e; ARM9:020435bc','legacyNames':'images.top is the bottom nameHeader; images.lowerBackground is the upperBackground'}
 data['native']={'inputCommand':'overlay21:021b6200','task':'overlay21:021c5990','descriptor':'overlay194:021f5480','pageLoader':'overlay194:021f4c20','characterLookup':'overlay194:021f4ca4','alphabetClassifier':'overlay194:021f2e68','qwertyClassifier':'overlay194:021f2e8c','startFocusOk':'overlay194:021f3638','selectPage':'overlay194:021f3a4a'}
 data['nameField']={'window':[64,16,192,16],'slotStartForLimit10':64,'slotStep':14,'slotY':37,'pokemonIconCenter':[30,20],'source':'overlay194:021f1d28..021f1e44;021f3f54..021f4032'}
 data['actions']={'1':'character','2':'upper','3':'lower','4':'symbols','5':'qwerty','6':'delete','7':'confirm','8':'shift','9':'space'}
 data['qwertySpecialKeys']=[{'row':0,'col':10,'action':6},{'row':1,'col':9,'action':7},{'row':2,'col':0,'action':8},{'row':2,'col':9,'action':8},{'row':3,'col':4,'action':9}]
 data['qwertyThirdRow']={'nativeColumns':[1,2,3,4,5,6,7,8],'sourceColumns':[0,1,2,3,4,5,6,7],'note':'Original placeholder U+203B entries are function keys, never inserted'}
 data['hotkeys']={'A':'activate selected key','START':'move focus to OK, without confirming','SELECT':'cycle page actions2..5','B':'Delete action6, including when empty; does not exit'}
 data['result']={'changed':1,'unchangedOrEmpty':0,'source':'overlay194:021f4424..021f44a4 and overlay21:021c5a6c..021c5a8c'}
 data['prompt']={'initiallyPrinted':True,'bank':81,'message':1,'background':4,'physicalScreen':'top','window':[8,152,240,32],'source':'overlay194:021f1532..021f154c,021f3bd0..021f3c10','visibility':'Initial prompt persists on TOP during typing; invalid-name messages8/9 replace it, restored on subsequent input via021f46d6..021f4732. It does not overlap bottom-screen keyboard buttons.'}
 data['limits']=['Native hitbox tolerance, transitions and repeat timing not certified','Codes U+246D etc are original font glyphs, not Unicode emoji substitutions','Native input limit10 comes from CallPokeNameInput task021c5a1a; no extra Cancel button in source bitmap']
 (output/'naming-assets.js').write_text('window.NAMING_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)
