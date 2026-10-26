"""Export verified IRBI summary layers; native overlay131 references retained."""
from pathlib import Path
import argparse,importlib.util,json,struct
import ndspy.rom,ndspy.narc,ndspy.lz10

def extract(rom,output):
 assert rom.idCode==b'IRBI'
 spec=importlib.util.spec_from_file_location('menu',Path(__file__).with_name('extract-menu.py'));menu=importlib.util.module_from_spec(spec);spec.loader.exec_module(menu)
 f=[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName('a/0/7/8')).files]
 dest=output/'assets/summary-details';dest.mkdir(parents=True,exist_ok=True)
 layers={}
 for key,char,screen,palette in [('mainGrid',8,70,0),('subGrid',10,71,1),('infoMain',8,63,0),('infoSub',10,64,1),('infoHeader',9,65,1),('ribbonMain',8,66,0),('ribbonSub',10,67,1),('ribbonSubSelected',10,68,1),('ribbonHeader',9,69,1),('movesMain',8,72,0),('movesSub',10,73,1),('movesSubSelected',10,74,1),('movesHeader',9,75,1),('movesHeaderSelected',9,76,1)]:
  im=menu.layer(f,char,screen,palette).crop((0,0,256,192));im.save(dest/(key+'.png'))
  layers[key]={'src':'assets/summary-details/'+key+'.png','size':[256,192],'source':{'archive':'a/0/7/8','char':char,'screen':screen,'palette':palette},'engine':'main'if palette==0 else'sub'}
 ov=rom.loadArm9Overlays([131])[131];address=0x021dc178
 raw=ov.data[address-ov.ramAddress:address-ov.ramAddress+40]
 windows=[{'x':raw[n]*8,'y':raw[n+1]*8,'width':raw[n+2]*8,'height':raw[n+3]*8,'bg':1}for n in range(0,40,4)]
 data={'source':'IRBI overlay131 p_status, p_sta_info, p_sta_ribbon, p_sta_skill','layers':layers,'native':{'base':hex(ov.ramAddress),'loader':'0x021d4864','infoLoader':'0x021d7a4c','infoDraw':'0x021d7bac','ribbonLoader':'0x021d8774','movesLoader':'0x021d9870','infoWindowTable':hex(address),'infoMainWindows':windows,'infoSubWindow':{'bg':4,'x':32,'y':40,'width':192,'height':160},'lcdAssignmentVerified':False,'engineMapping':'BG0..3 MAIN; BG4..7 SUB','infoSpecialMain':'movesMain reused when state field0x38 nonzero; predicate meaning not fully traced','composition':'grid BG3/7, page BG2/6, header BG5 first24px, text BG1/4'},'checks':{'layers':len(layers),'nativeWindowRows':len(windows)}}
 def rects(address,count,bg):
  raw=ov.data[address-ov.ramAddress:address-ov.ramAddress+count*4]
  return [{'x':raw[n]*8,'y':raw[n+1]*8,'width':raw[n+2]*8,'height':raw[n+3]*8,'bg':bg}for n in range(0,len(raw),4)]
 data['native'].update({'lcdAssignmentVerified':True,'physicalTop':'sub','physicalBottom':'main','lcdProof':{'address':'0x021d4636','register':'0x04000304','mask':'0xffff7fff','operation':'POWCNT1 &= 0x7fff'},'font':{'archive':'a/0/2/3','member':0,'constructor':'0x021d50ea','reuse':'POKEDEX_ASSETS.font / assets/pokedex/font.png'},'pageDispatch':{'0':{'name':'Info','constructor':'0x021d7b38','bottom':'infoMain','top':'infoSub','topHeader':'infoHeader'},'1':{'name':'Mosse','constructor':'0x021d9b2c','bottom':'movesMain','top':'movesSub','topHeader':'movesHeader','topContent':'stats and ability'},'2':{'name':'Fiocchi','constructor':'0x021d8e40','bottom':'ribbonMain','top':'ribbonSub','topHeader':'ribbonHeader'},'3':{'name':'Move learning variant','constructor':'0x021da594'}},'statsWindowTable':'0x021dc1b2','statsSubWindows':rects(0x021dc1b2,13,4),'bottomButtons':[]})
 raw=ov.data[0x021dc004-ov.ramAddress:0x021dc004-ov.ramAddress+32]
 roles=['Info','Mosse','Fiocchi','toggle page setting','previous Pokemon','next Pokemon','close','back']
 anchors=[0,40,80,124,144,168,200,232]
 for i in range(8):
  y1,y2,x1,x2=raw[i*4:i*4+4];x2=x2 or 256
  data['native']['bottomButtons'].append({'id':i,'role':roles[i],'hitbox':[x1,y1,x2-x1,y2-y1],'anchor':[anchors[i],172 if i==3 else 168],'table':'0x021dc004'})
 data['native']['infoText']=[{'window':w,'message':msg,'x':x,'y':y,'kind':kind}for w,msg,x,y,kind in [(0,8,1,1,'label'),(0,9,22,1,'regional number formatted'),(1,10,1,1,'label'),(1,None,65,1,'species name bank70'),(2,12,1,1,'label'),(3,13,1,1,'label'),(3,14,65,1,'OT formatted'),(4,15,1,1,'label'),(4,16,65,1,'trainer ID formatted'),(5,17,1,1,'label'),(6,18,1,1,'experience formatted'),(7,19,1,1,'label'),(8,20,1,1,'label'),(8,21,33,1,'experience to next level formatted')]]
 data['native']['statsText']=[{'window':i,'message':msg,'x':25 if i==0 else 1,'y':1,'valueRight':89 if i==0 else 105}for i,msg in [(0,110),(2,111),(3,112),(4,113),(5,114),(6,115)]]
 data['native']['statsText'].append({'window':7,'message':116,'x':5,'y':1,'abilityName':{'bank':182,'x':65,'y':1},'abilityDescription':{'bank':183,'x':5,'y':17}})
 data['native']['infoTypeAnchors']=[[96,48],[130,48]]
 spec=importlib.util.spec_from_file_location('events',Path(__file__).with_name('extract-original-events.py'));events=importlib.util.module_from_spec(spec);spec.loader.exec_module(events)
 texts=ndspy.narc.NARC(rom.getFileByName('a/0/0/2')).files
 data['messages']={str(bank):events.messages(texts[bank])for bank in [89,90,91,92,158,182,183,188,202]}
 data['native']['memoBanks']={'templatesNatureCharacteristic':188,'locations':89,'specialLocations':90,'originPeople':91,'originRegions':92,'loader':'0x021d7aa6'}
 data['native']['portrait']={'constructor':'0x021d77b0','api':'0x02017270','positionFx12':[216*4096,72*4096,0],'position':[216,72,0],'orientations':[0,1],'pixelProjectionFullyVerified':False}
 data['native']['memoLayout']={'window':'infoSubWindow','nature':{'bank':188,'message':'natureID (0..24)','x':1,'y':1,'source':'0x021d8298..82d4'},'encounter':{'bank':188,'message':'native-selected template25..52 or83..86','x':1,'y':17,'normalOwnedNonEgg':25,'foreignOwnerIncrement':1},'characteristic':{'bank':188,'x':1,'y':'17+16*encounterTextLineCount','message':'53+highestIVStatIndex*5+(highestIV%5)','ivOrder':['hp','attack','defense','speed','spAttack','spDefense'],'tieBreak':'start=personality%6; scan six stats cyclically, replace only if strictly greater','source':'0x021d852e..85d8'},'lineHeight':16,'textColorControls':'{ff00:2} emphasis; {ff00:0} restore; retain original template punctuation'}
 data['native']['moveDetailsText']=[{'window':8,'message':149,'x':1,'y':1,'role':'category'},{'window':9,'message':147,'x':1,'y':1,'valueX':81,'valueY':1,'placeholderMessage':154,'placeholderX':87,'role':'power'},{'window':10,'message':148,'x':1,'y':1,'valueX':81,'valueY':1,'placeholderMessage':154,'placeholderX':87,'role':'accuracy'},{'window':11,'bank':202,'index':'moveID','x':1,'y':1,'role':'description'}]
 groups={}
 g={'source':{'archive':'a/0/7/8','char':11,'cells':78,'animation':129,'palette':3},'cells':[],'animations':menu.animations(f[129])}
 for i,(im,box)in enumerate(menu.cells(f,11,78,3)):
  name=f'tabs-{i}.png';im.save(dest/name);g['cells'].append({'src':'assets/summary-details/'+name,'origin':box[:2],'size':box[2:]})
 g['roles']={'Info':{'normal':0,'selected':3,'disabled':6,'anchor':[0,168]},'Mosse':{'normal':1,'selected':4,'disabled':7,'anchor':[40,168]},'Fiocchi':{'normal':2,'selected':5,'disabled':8,'anchor':[80,168]}}
 groups['tabs']=g;data['groups']=groups
 g={'source':{'archive':'a/0/7/8','char':15,'cells':81,'animation':132,'palette':5,'nativePaletteBase':11},'cells':[],'animations':menu.animations(f[132])}
 for i,(im,box)in enumerate(menu.cells(f,15,81,5)):
  name=f'movePanels-{i}.png';im.save(dest/name);g['cells'].append({'src':'assets/summary-details/'+name,'origin':box[:2],'size':box[2:]})
 groups['movePanels']=g
 data['native']['moveRows']={'source':'0x021db5f0,0x021db6c4;table0x021dc1a8','anchors':[[8,16],[8,48],[8,80],[8,112]],'hitboxSize':[136,32],'textWindowOffset':[40,0],'textWindowSize':[88,32],'name':{'bank':203,'x':3,'y':2},'ppLabel':{'bank':158,'message':135,'x':13,'y':17},'currentPP':{'right':57,'y':17},'slash':{'bank':158,'message':117,'x':57,'y':17},'maxPP':{'x':61,'y':17},'typeAnchorOffset':[26,9],'font':0,'textColorPacked':'0x440','selectedCell':5,'normalCells':[0,1,2,3],'palette':5}
 data['native']['infoText'][1]['x']=65
 data['native']['commonHeader']={'engine':'main','window':[152,0,104,32],'nicknameLocal':[25,1],'genderLocal':[89,1],'levelLocal':[9,17],'source':'0x021d687c;0x021d6c18'}
 common=[ndspy.lz10.decompress(b)if b[:1]==b'\x10'else b for b in ndspy.narc.NARC(rom.getFileByName('a/0/8/3')).files]
 cc=menu.cells(common,20,23,19);gg={'source':{'archive':'a/0/8/3','char':20,'cells':23,'animation':26,'palette':19},'cells':[],'roles':{'off':0,'on':1,'pressedOff':2,'pressedOn':3},'anchor':[124,172],'hitbox':[120,168,24,24]}
 for i,ni in enumerate([6,7,20,21]):
  im,box=cc[ni];name=f'toggle-{ni}.png';im.save(dest/name);gg['cells'].append({'src':'assets/summary-details/'+name,'origin':box[:2],'size':box[2:],'nativeCell':ni})
 groups['toggle']=gg
 data['native']['bottomButtons'][3]['role']='register/unregister current page in shortcut menu'
 gg['semantics']={'action':'register current page in shortcut menu','shortcutIDs':{'Info':7,'Mosse':8,'Fiocchi':9},'state':'root[0x60+4*page]','load':'0x021d428a ->0x02012bf8 ->0x0200c44c','save':'0x021d4384..4390 ->0x02012be0 ->0x0200c418','consumer':'overlay10 event_shortcut_menu.c:0x0215fe32 /0x0216018c','doesNotFlipPortrait':True}
 (output/'summary-detail-assets.js').write_text('window.SUMMARY_DETAIL_ASSETS='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8');print(data['checks'])
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args();extract(ndspy.rom.NintendoDSRom.fromFile(a.rom),a.output)
