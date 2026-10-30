"""Scoped original Italian Black Pokédex search resources; no runtime changes."""
from pathlib import Path
import argparse, importlib.util, json, struct, hashlib
import ndspy.rom, ndspy.narc, ndspy.lz10

def load(name,path):
 s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m

def extract(rom,out,species_ids=None):
 assert rom.idCode==b'IRBI'
 menu=load('menu',Path(__file__).with_name('extract-menu.py'));events=load('events',Path(__file__).with_name('extract-original-events.py'))
 def files(path):return [ndspy.lz10.decompress(b) if b[:1]==b'\x10' else b for b in ndspy.narc.NARC(rom.getFileByName(path)).files]
 f=files('a/1/5/9');ov=rom.loadArm9Overlays([210,212]);a=bytes(ov[210].data);b=bytes(ov[212].data)
 assert ov[210].ramAddress==0x21bc140 and ov[212].ramAddress==0x21c8d80
 sortfiles=list(struct.unpack_from('<6I',b,0x21c9868-0x21c8d80));assert sortfiles==[4,5,8,9,6,7]
 dest=out/'assets/dex-search';dest.mkdir(parents=True,exist_ok=True);images={}
 for label,c,s,p,bg in [('mainBase',79,95,73,2),('subBase',80,94,74,4),('subGrid',80,96,74,6),('criteriaLabels',81,92,73,3),('criteriaValues',81,93,73,0),('orderChoice',81,89,73,3),('nameChoice',81,88,73,3),('typeChoice',81,90,73,3),('colorChoice',81,86,73,3),('shapeChoice',81,87,73,3),('searchMessage',81,91,73,0)]:
  im=menu.layer(f,c,s,p).crop((0,0,256,192));im.save(dest/(label+'.png'))
  images[label]={'src':'assets/dex-search/'+label+'.png','size':[256,192],'source':{'archive':'a/1/5/9','char':c,'screen':s,'palette':p,'BG':bg}}
 text=events.messages(files('a/0/0/2')[277]);search=files('a/0/9/8');personal=files('a/0/1/6');names=events.messages(files('a/0/0/2')[70])
 species_ids=species_ids or [495,498,501,504,506]
 scoped={}
 for sid in species_ids:
  p=personal[sid];scoped[str(sid)]={'name':names[sid],'initial':search[1][sid],'shape':search[2][sid],'color':p[33],'types':list(p[6:8]),'heightDm':struct.unpack_from('<H',p,36)[0],'weightHg':struct.unpack_from('<H',p,38)[0]}
 windows=[]
 for i in range(16):
  bg,x,y,w,h,pal=struct.unpack_from('<6B',a,0x21c0800-0x21bc140+6*i);windows.append({'id':i,'BG':bg,'rect':[8*x,8*y,8*w,8*h],'palette':pal})
 orders=[]
 for enum,file in enumerate(sortfiles):
  order=struct.unpack('<'+'H'*(len(search[file])//2),search[file]);orders.append({'id':enum,'label':text[25+enum],'sourceMember':file,'scopedOrder':[sid for sid in order if sid in species_ids],'requiresCaught':enum>=2})
 data={'source':'Italian Black IRBI overlay209/210/212','images':images,'messages':text,'windows':windows,'font':{'archive':'a/0/2/3','member':0,'existingAtlas':'POKEDEX_ASSETS.font'},'species':scoped,'sortModes':orders,'criteria':{'bytes':['scope','order','initial','typeA','typeB','color','shape'],'unset':255,'scope':{'national':0,'unova':1},'initialLetters':'ABCDEFGHIJKLMNOPQRSTUVWXYZ','typeLabels':text[31:48],'typeIds':[16,5,13,1,11,14,7,4,12,3,15,0,8,2,9,10,6],'colorLabels':text[96:106],'shapeRange':[1,14],'requiresSeen':True,'requiresCaughtWhen':'order >= 2 OR typeA != 255 OR typeB != 255','twoTypes':'unordered exact pair; a single requested type matches either personal type','preserveNativeSortOrder':True},'listCommands':{'search':{'cell':0,'highlightedCell':4,'anchor':[36,180],'touchRect':[0,168,72,24],'key':'START','nativeEvent':8},'dexMode':{'cell':1,'highlightedCell':5,'anchor':[104,180],'touchRect':[72,168,64,24],'key':'SELECT','nativeEvent':9,'action':'Toggle Unima/National if unlocked; disabled in search results','isOrderCommand':False}},'provenance':{'buttons':'overlay209 actor table0x021BE8F0; touch table0x021BE9E0; input0x021BE558','dexModeAction':'overlay209 0x021BCF1A -> 0x0200CA70 and 0x0200CA5C','searchLoader':'overlay210 0x021BC4DC..0x021BC5C0','dynamicScreens':'overlay210 0x021BC984..0x021BCAEC','textWindows':'overlay210 0x021BE268 table0x021C0800','messages':'overlay210 0x021BC844 bank277','searchEngine':'overlay212 0x021C9368..0x021C9648 NARC98 a/0/9/8','sortTable':'overlay212 0x021C9868, loader0x021C973C','caughtGate':'overlay212 0x021C9482..0x021C94A6'},'limitations':['Background maps are original native resources. Animated object positions and option-grid hitboxes in overlay210 are not yet fully traced.','Physical LCD assignment follows shared Pokédex engine configuration; no independent search LCD setter traced.','Scoped species follow the exported training roster. Form-sensitive ordering outside this scope is not exported.']}
 data['initialControls']=[]
 for i,role in enumerate(['order','name','types','color','shape','startSearch','reset','shortcut','close','back']):
  row=list(a[0x21c0a60-0x21bc140+12*i:0x21c0a60-0x21bc140+12*(i+1)]);y0,y1,x0,x1=row[8:12]
  data['initialControls'].append({'role':role,'index':i,'touchRect':[x0,y0,x1-x0+1,y1-y0+1],'nativeRecord':row})
 data['listCommands'].update({'shortcut':{'anchor':[188,172],'touchRect':[184,168,24,24],'saveShortcutId':15,'cells':[6,7],'action':'Register list in shortcut menu'},'close':{'anchor':[208,168],'touchRect':[208,168,24,24]},'back':{'anchor':[232,168],'touchRect':[232,168,24,24]}})
 data['provenance']['searchInitialControls']='overlay210 table0x021C0A60; constructor0x021BFDC6 -> 0x02025C50; 10 records of12 bytes'
 data['provenance']['listShortcut']='overlay209 0x021BD254 -> 0x02012BF8/0x02012BE0 with ID15'
 data['criteria']['searchShortcutId']=16
 # Native frame_list submenus, not a generic grid.
 from PIL import Image
 data['criteria']['shapeRange']=[0,13]
 data['submenus']={};data['groups']={}
 for key,addr,count,background,msgStart in [('order',0x21c0b20,6,'orderChoice',25),('initial',0x21c0b70,26,'nameChoice',51),('types',0x21c0b48,17,'typeChoice',31),('color',0x21c0b98,10,'colorChoice',96),('shape',0x21c0bc0,14,'shapeChoice',None)]:
  cfg=list(a[addr-0x21bc140:addr-0x21bc140+40]);ptr=struct.unpack_from('<I',a,addr-0x21bc140+28)[0];controls=[]
  for i in range(20):
   row=list(a[ptr-0x21bc140+8*i:ptr-0x21bc140+8*(i+1)])
   if row[0]==255:break
   y0,y1,x0,x1=row[:4];action=struct.unpack('<I',bytes(row[4:]))[0]
   controls.append({'index':i,'rect':[x0,y0,x1-x0+1,y1-y0+1],'nativeAction':action,'role':{0:'selectVisibleRow',1:'dragScroll',4:'pageUp',5:'pageDown',8:'selectVisibleRowAndReturn'}[action]})
  data['submenus'][key]={'configAddress':hex(addr),'nativeConfig':cfg,'count':count,'background':background,'rowSize':[cfg[4]*8,cfg[5]*8],'rowX':cfg[2]*8,'rowY':cfg[3]*8,'mainBG':cfg[0],'subBG':cfg[1],'visibleSelectableRows':cfg[25],'textWindowLocal':[cfg[6]*8,cfg[7]*8,cfg[8]*8,cfg[9]*8],'controlsAddress':hex(ptr),'controls':controls,'messageIds':list(range(msgStart,msgStart+count))if msgStart is not None else [],'selectReturnsImmediately':key=='order','toggleExistingSelectionOff':key!='order','sourceRowScreen':98 if key=='shape'else 97,'rowText':None if key=='shape'else{'font':0,'packed':'0x39e0','align':'center','centerX':196,'localY':4},'subRowRule':'Previous entries before main first: subY = 192 + (entryIndex - mainFirstIndex) * rowHeight; clip to 0..191'}
 for label,screen,height in [('optionRow',97,24),('shapeRow',98,40)]:
  for state,slot in [('normal',1),('pulseA',2),('pulseB',3)]:
   ff=list(f);scr=bytearray(f[screen])
   for pos in range(36,len(scr),2):
    val=struct.unpack_from('<H',scr,pos)[0];struct.pack_into('<H',scr,pos,(val&4095)|(slot<<12))
   ff[screen]=scr;im=menu.layer(ff,81,screen,73).crop((0,0,128,height));name=label+'-'+state;im.save(dest/(name+'.png'));images[name]={'src':'assets/dex-search/'+name+'.png','size':[128,height],'source':{'archive':'a/1/5/9','char':81,'screen':screen,'palette':73,'paletteSlot':slot}}
 for label,char,cer,palette,anr in [('shapes',82,85,76,101),('optionObjects',78,84,75,100)]:
  group={'source':{'archive':'a/1/5/9','char':char,'cells':cer,'palette':palette,'animation':anr},'cells':[],'animations':menu.animations(f[anr])}
  for i,(im,box)in enumerate(menu.cells(f,char,cer,palette)):
   name=label+'-'+str(i);im.save(dest/(name+'.png'));group['cells'].append({'src':'assets/dex-search/'+name+'.png','origin':box[:2],'size':box[2:]})
  data['groups'][label]=group
 data['submenus']['shape']['sprite']={'group':'shapes','cellEqualsCriterionValue':True,'anchorX':204,'anchorLocalY':20,'native':'overlay210 0x021BFA8C'}
 data['rowSelectionMark']={'group':'optionObjects','cell':2,'anchorX':140,'anchorLocalYFormula':'rowHeight / 2','native':'overlay210 0x021BF6B0 (24px rows), 0x021BF914 (40px rows)'}
 data['scrollObjects']={'group':'optionObjects','thumbCell':0,'trackCell':1,'thumbAnchorX':252,'thumbAnchorYRange':[12,156],'trackAnchor':[252,84],'nativeActorTable':'overlay210 0x021C08AC records0/1'}
 for key,helpId,labelId in [('order',4,12),('initial',5,13),('types',6,14),('color',8,15),('shape',7,16)]:
  v=data['submenus'][key];v['helpMessageId']=helpId;v['labelMessageId']=labelId;v['leftTitle']={'window':12,'center':[64,64],'align':'center','nativeColorPacked':'0x3c40'};v['leftValue']={'window':13,'center':[64,88],'align':'center','nativeColorPacked':'0x3c40'}
 data['submenus']['shape']['leftValue']={'spriteGroup':'shapes','anchor':[64,104],'visibleWhenCriterionSet':True,'native':'overlay210 0x021BF518..0x021BF550'}
 data['criteria']['typeSelectionInteraction']='Single native list: click absent type adds it; click selected type removes it; if two types exist, a third replaces older slot and shifts current second to first.'
 data['pulse']={'sourcePalette':73,'slots':[2,3],'nativeRoutine':'0x0202E9C0','periodFrames':64,'phaseIncrement':1024,'phaseWrap':65536,'blendFx12':'(cosFx12(phase) + 4096) / 2','colorRule':'per RGB555 component: a + (((b-a)*blendFx12)>>12)','normalSlot':1,'nativePaletteLoad':'overlay210 0x021C0186 -> 0x021B794C -> 0x0202E92C'}
 # Original ARM9 FX_SinCosTable odd entries (cosine), 64 native phases.
 import importlib
 compression=importlib.import_module('ndspy.codeCompression')
 arm=compression.decompress(rom.arm9)
 # Shared palette manager 0x0202E9EC loads its exact interleaved LUT pointer.
 lut=struct.unpack_from('<I',arm,0x0202EA80-rom.arm9RamAddress)[0]
 blends=[]
 for phase in range(0,65536,1024):
  value=struct.unpack_from('<h',arm,lut-rom.arm9RamAddress+((phase>>4)*2+1)*2)[0]
  blends.append((value+4096)//2)
 assert len(blends)==64 and blends[0]==4096 and blends[32]==0
 data['pulse']['blendSamplesPhaseZero']=blends
 data['pulse']['sineCosineLutAddress']=hex(lut)
 # Font0 raster, original NCLR73 slot1 fg14/shadow15. Add all actual search glyphs.
 font=files('a/0/2/3')[0];glyph,widths,off=struct.unpack_from('<3I',font,0x20);mapping={}
 while off and off+12<len(font):
  first,last,kind,_,nxt=struct.unpack_from('<4HI',font,off);at=off+12
  if kind==0:
   start=struct.unpack_from('<H',font,at)[0];mapping.update({chr(c):start+c-first for c in range(first,last+1)})
  elif kind==1:mapping.update({chr(c):struct.unpack_from('<H',font,at+(c-first)*2)[0]for c in range(first,last+1)})
  elif kind==2:
   count=struct.unpack_from('<H',font,at)[0];mapping.update({chr(c):g for c,g in struct.iter_unpack('<HH',font[at+2:at+2+count*4])})
  off=nxt
 chars=[c for c in sorted(set(''.join(text)+''.join(chr(c)for c in range(32,256))))if c in mapping and mapping[c]!=65535];rows=(len(chars)+15)//16;atlas=Image.new('RGBA',(192,rows*15));metrics={};pal=menu.pal(f[73])[16:32]
 for i,ch in enumerate(chars):
  cell=font[glyph+8+mapping[ch]*48:glyph+8+(mapping[ch]+1)*48];left,w,advance=cell[:3];metrics[ch]=[i%16*12,i//16*15,left,advance]
  for y in range(15):
   for x in range(12):
    pos=y*12+x;ci=(cell[3+pos//4]>>(6-(pos%4)*2))&3
    if ci in(1,2):atlas.putpixel((i%16*12+x,i//16*15+y),(*pal[14 if ci==1 else 15],255))
 atlas.save(dest/'font-options.png');data['optionFont']={'src':'assets/dex-search/font-options.png','height':15,'glyphs':metrics,'colors':{'foreground':pal[14],'shadow':pal[15]},'source':{'font':'a/0/2/3:0','palette':'a/1/5/9:73','slot':1,'packed':'0x39e0','nativeLiteral':'0x021BEBA8'}}
 data['provenance']['submenus']='overlay210 0x021C0134..0x021C0444, overlay67 frame_list 0x021B7654..0x021B9244'
 data['limitations'][0]='Native submenu vertical rows, control rectangles, text alignment, glyphs, shape sprites and selection palette endpoints are exported. Exact touch-drag inertia and page-transition easing are not ported.'
 data['helpLayout']={'window':1,'BG':7,'physicalScreen':'top','rect':[8,24,240,24],'textOrigin':[8,28],'packed':'0x440','wrap':False,'clipWidth':240,'textPriority':0,'rowBG':5,'rowPriority':2,'drawAfterRows':True,'native':'overlay210 0x021BE7F8..0x021BE82E;windowtable0x021C0800; BG7template0x021C0694 priority0,BG5template0x021C06D4 priority2','note':'Long Italian help may extend over left side of row background. It is above row BG; do not wrap to112px or let row background erase it.'}
 (out/'dex-search-assets.js').write_text('window.DEX_SEARCH_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
 print('Exported',len(images),'images;',len(text),'messages;',len(scoped),'species; sort member IDs',sortfiles)
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom');p.add_argument('--output',default=str(Path(__file__).resolve().parents[1]/'src'));p.add_argument('--training',type=Path);a=p.parse_args()
 d=json.loads(a.training.read_text(encoding='utf8').split('window.TRAINING_DATA=',1)[1].strip().removesuffix(';')) if a.training else None
 extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),Path(a.output),sorted(p['id'] for p in d['progression'].values()) if d else None)
