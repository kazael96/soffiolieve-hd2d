"""IRBI progression through Mistralton: native parties, encounters and level35 data."""
from pathlib import Path
try:
 import ndspy.rom
except ModuleNotFoundError:
 from irbi_reader import install
 install()
code=Path(__file__).with_name('extract-driftveil-data.py').read_text(encoding='utf8').rpartition('exec(compile(source,')[0]
namespace={'__file__':str(Path(__file__).with_name('extract-driftveil-data.py'))}
exec(compile(code,'driftveil-reader-transform','exec'),namespace)
source=namespace['source']
def replace(old,new):
 global source
 assert old in source,old
 source=source.replace(old,new)
replace('driftveil-events.js','mistralton-events.js')
replace("['training-data.js','pinwheel-data.js','castelia-data.js','nimbasa-data.js']","['training-data.js','pinwheel-data.js','castelia-data.js','nimbasa-data.js','driftveil-data.js']")
replace("a.output/'nimbasa-data.js'","a.output/'driftveil-data.js'")
replace('[63,64,329]','[97,191,192,193,331,195,196,197]')
replace('for zone in [329,253]:','for zone in [191,331,195,196,197]:')
replace('[63,64,77,329,253,96,99]','[96,97,98,191,192,193,194,195,196,197,331,107,109]')
replace('<=30','<=35')
replace("'levelCap':30","'levelCap':35,'capSteps':[{'badge':4,'level':31},{'badge':5,'level':35}]")
replace('(399,71)]','(399,71),(405,77),(421,96),(334,6),(338,10),(345,17),(364,36),(348,20),(354,26),(400,72),(401,73),(343,15),(347,19),(360,32),(382,54),(385,57)]')
replace('399:521}','399:521,405:523,421:19,334:258,338:241,345:240,364:201,348:218,354:216,400:86,401:360,343:113,347:219,360:115,382:503,385:507}')
replace("a.output/'driftveil-data.js').write_text","a.output/'mistralton-data.js').write_text")
replace('window.DRIFTVEIL_DATA=','window.MISTRALTON_DATA=')
replace("(a.output/'mistralton-data.js').write_text",'''# Native shop stock selection, overlay21 func021b37e0: normal stock255
# uses badge-index map; fixed stock N uses table entry N+6.
overlay=r.loadArm9Overlays([21])[21]
word=lambda address:struct.unpack_from('<I',overlay.data,address-overlay.ramAddress)[0]
stock_pointer=word(0x021b38b8);stock_count=word(0x021b38c0);badge_pointer=word(0x021b38b4)
stocks={}
for index in range(13):
 pointer=word(stock_pointer+index*4);count=overlay.data[stock_count-overlay.ramAddress+index]
 stocks[index]=list(struct.unpack_from('<'+'H'*count,overlay.data,pointer-overlay.ramAddress))
data['market']={'badgeStock':list(overlay.data[badge_pointer-overlay.ramAddress:badge_pointer-overlay.ramAddress+9]),'stocks':stocks,'fixedStocks':{i:i+6 for i in range(7)},'texts':ev.messages(narc('a/0/0/3')[424]),'source':{'overlay':21,'selector':'021b37e0','stockPointers':'021de088','stockCounts':'021d94ca'}}
# Expose price/name/pocket data for every item already reachable or sold here.
shop_ids={12}|{iid for stock in stocks.values() for iid in stock}
for iid in shop_ids:
 data['itemNames'][iid]=itemnames[iid];data['itemDescriptions'][iid]=descriptions[iid]
data['itemPrices']={iid:struct.unpack_from('<H',narc('a/0/2/4')[int(iid)])[0]*10 for iid in data['itemNames']}
command_table=json.loads(Path(__file__).with_name('irbi-field-commands.json').read_text())
for chapter_name in ['route3','pinwheel','castelia','nimbasa','driftveil','mistralton']:
 command_table.update({k:v['spec'] for k,v in json.loads(Path(__file__).with_name(chapter_name+'-opcodes.json').read_text()).items()})
command_table['6']={'name':'NativeOpcode6','args':['u16']}
data['receiptProgram']=ev.program(narc('a/0/5/7')[862],[14],command_table)
# Seasonal forms share battle data, not their original graphic. Preserve the form
# through evolution; base species with form0 is the spring presentation.
data['visualForms']={}
for base,target,first in [('Deerling','Sawsbuck',701),('Sawsbuck',None,704)]:
 for form,season in enumerate(['Summer','Autumn','Winter'],1):
  name=base+'-'+season
  data['progression'][name]={**data['progression'][base],'form':form,'dexName':base}
  data['pokemonData'][name]=dict(data['pokemonData'][base])
  data['compatibility'][name]=list(data['compatibility'][base])
  data['evolutions'][name]=[{**e,'target':target+'-'+season} if target and e['target']==target else dict(e) for e in data['evolutions'][base]]
  data['visualForms'][name]={'species':data['progression'][base]['id'],'form':form,'graphic':first+form-1,'base':base}
  if base in data['obtainable']:data['obtainable'].append(name)
data['genderGraphics']={'Unfezant':{'F':'521-female'},'Frillish':{'F':'592-female'}}
data['hiddenPowerCompatibility']={name:bool(int.from_bytes(personal[row['id']][40:56],'little')>>9&1) for name,row in data['progression'].items()}
data['itemPockets']={iid:(struct.unpack_from('<H',narc('a/0/2/4')[int(iid)],8)[0]>>7)&7 for iid in data['itemNames']}
(a.output/'mistralton-data.js').write_text''')
exec(compile(source,str(Path(__file__).with_name('extract-pinwheel-data.py')),'exec'))
