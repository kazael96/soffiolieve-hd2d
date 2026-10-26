"""Scoped original Italian Black Pokédex search resources; no runtime changes."""
from pathlib import Path
import argparse, importlib.util, json, struct, hashlib
import ndspy.rom, ndspy.narc, ndspy.lz10

def load(name,path):
 s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m

def extract(rom,out):
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
 scoped={}
 for sid in [495,498,501,504,506]:
  p=personal[sid];scoped[str(sid)]={'name':names[sid],'initial':search[1][sid],'shape':search[2][sid],'color':p[33],'types':list(p[6:8]),'heightDm':struct.unpack_from('<H',p,36)[0],'weightHg':struct.unpack_from('<H',p,38)[0]}
 windows=[]
 for i in range(16):
  bg,x,y,w,h,pal=struct.unpack_from('<6B',a,0x21c0800-0x21bc140+6*i);windows.append({'id':i,'BG':bg,'rect':[8*x,8*y,8*w,8*h],'palette':pal})
 orders=[]
 for enum,file in enumerate(sortfiles):
  order=struct.unpack('<'+'H'*(len(search[file])//2),search[file]);orders.append({'id':enum,'label':text[25+enum],'sourceMember':file,'scopedOrder':[sid for sid in order if sid in [495,498,501,504,506]],'requiresCaught':enum>=2})
 data={'source':'Italian Black IRBI overlay209/210/212','images':images,'messages':text,'windows':windows,'font':{'archive':'a/0/2/3','member':0,'existingAtlas':'POKEDEX_ASSETS.font'},'species':scoped,'sortModes':orders,'criteria':{'bytes':['scope','order','initial','typeA','typeB','color','shape'],'unset':255,'scope':{'national':0,'unova':1},'initialLetters':'ABCDEFGHIJKLMNOPQRSTUVWXYZ','typeLabels':text[31:48],'typeIds':[16,5,13,1,11,14,7,4,12,3,15,0,8,2,9,10,6],'colorLabels':text[96:106],'shapeRange':[1,14],'requiresSeen':True,'requiresCaughtWhen':'order >= 2 OR typeA != 255 OR typeB != 255','twoTypes':'unordered exact pair; a single requested type matches either personal type','preserveNativeSortOrder':True},'listCommands':{'search':{'cell':0,'highlightedCell':4,'anchor':[36,180],'touchRect':[0,168,72,24],'key':'START','nativeEvent':8},'dexMode':{'cell':1,'highlightedCell':5,'anchor':[104,180],'touchRect':[72,168,64,24],'key':'SELECT','nativeEvent':9,'action':'Toggle Unima/National if unlocked; disabled in search results','isOrderCommand':False}},'provenance':{'buttons':'overlay209 actor table0x021BE8F0; touch table0x021BE9E0; input0x021BE558','dexModeAction':'overlay209 0x021BCF1A -> 0x0200CA70 and 0x0200CA5C','searchLoader':'overlay210 0x021BC4DC..0x021BC5C0','dynamicScreens':'overlay210 0x021BC984..0x021BCAEC','textWindows':'overlay210 0x021BE268 table0x021C0800','messages':'overlay210 0x021BC844 bank277','searchEngine':'overlay212 0x021C9368..0x021C9648 NARC98 a/0/9/8','sortTable':'overlay212 0x021C9868, loader0x021C973C','caughtGate':'overlay212 0x021C9482..0x021C94A6'},'limitations':['Background maps are original native resources. Animated object positions and option-grid hitboxes in overlay210 are not yet fully traced.','Physical LCD assignment follows shared Pokédex engine configuration; no independent search LCD setter traced.','Scoped species are the existing five. Form-sensitive ordering outside this scope is not exported.']}
 data['initialControls']=[]
 for i,role in enumerate(['order','name','types','color','shape','startSearch','reset','shortcut','close','back']):
  row=list(a[0x21c0a60-0x21bc140+12*i:0x21c0a60-0x21bc140+12*(i+1)]);y0,y1,x0,x1=row[8:12]
  data['initialControls'].append({'role':role,'index':i,'touchRect':[x0,y0,x1-x0+1,y1-y0+1],'nativeRecord':row})
 data['listCommands'].update({'shortcut':{'anchor':[188,172],'touchRect':[184,168,24,24],'saveShortcutId':15,'cells':[6,7],'action':'Register list in shortcut menu'},'close':{'anchor':[208,168],'touchRect':[208,168,24,24]},'back':{'anchor':[232,168],'touchRect':[232,168,24,24]}})
 data['provenance']['searchInitialControls']='overlay210 table0x021C0A60; constructor0x021BFDC6 -> 0x02025C50; 10 records of12 bytes'
 data['provenance']['listShortcut']='overlay209 0x021BD254 -> 0x02012BF8/0x02012BE0 with ID15'
 data['criteria']['searchShortcutId']=16
 (out/'dex-search-assets.js').write_text('window.DEX_SEARCH_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
 print('Exported',len(images),'images;',len(text),'messages;',len(scoped),'species; sort member IDs',sortfiles)
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom');p.add_argument('--output',default=str(Path(__file__).resolve().parents[1]/'src'));a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),Path(a.output))


