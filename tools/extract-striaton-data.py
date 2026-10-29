"""Extract IRBI chapter trainers, species progression, encounters and machine compatibility."""
from pathlib import Path
import argparse,struct,json,importlib.util
import ndspy.rom,ndspy.narc
p=argparse.ArgumentParser();p.add_argument('rom',type=Path);p.add_argument('output',type=Path);a=p.parse_args()
r=ndspy.rom.NintendoDSRom.fromFile(a.rom);assert r.idCode==b'IRBI';cache={}
def narc(p):
 if p not in cache:cache[p]=ndspy.narc.NARC(r.getFileByName(p)).files
 return cache[p]
sp=importlib.util.spec_from_file_location('ev',Path(__file__).with_name('extract-original-events.py'));ev=importlib.util.module_from_spec(sp);sp.loader.exec_module(ev)
names={495:'Snivy',498:'Tepig',501:'Oshawott',504:'Patrat',506:'Lillipup',509:'Purrloin',511:'Pansage',513:'Pansear',515:'Panpour',517:'Munna',518:'Musharna'}
texts=narc('a/0/0/2');trainer_texts=ev.messages(texts[189]);trainer_names=ev.messages(texts[190]);message_table=list(struct.iter_unpack('<HH',narc('a/0/9/0')[0]));personal=narc('a/0/1/6');result={}
natures='Hardy Lonely Brave Adamant Naughty Bold Docile Relaxed Impish Lax Timid Hasty Serious Jolly Naive Modest Mild Quiet Bashful Rash Calm Gentle Sassy Careful Quirky'.split()
for tid in [7,8,9,10,11,12,13,287,288,289,293,308]:
 header=narc('a/0/9/2')[tid];kind,tc,style,count=header[:4];raw=narc('a/0/9/3')[tid];stride=8+(8 if kind&1 else 0)+(2 if kind&2 else 0);assert len(raw)==count*stride,(tid,kind,len(raw),count)
 team=[]
 for i in range(count):
  at=i*stride;difficulty,ga,level,species,form=struct.unpack_from('<BBHHH',raw,at);at+=8;assert species in names and form==0
  item=struct.unpack_from('<H',raw,at)[0] if kind&2 else 0;at+=2 if kind&2 else 0
  moves=list(struct.unpack_from('<4H',raw,at)) if kind&1 else None
  seed=difficulty+level+species+tid
  for _ in range(tc):seed=(seed*0x5d588b656c078965+0x269ec3)&((1<<64)-1)
  pid=((seed>>48)<<8)+(0x78 if tc==38 else 0x88)
  m={'name':names[species],'level':level,'ivs':dict.fromkeys(['hp','atk','def','spe','spa','spd'],difficulty*31//255),'nature':natures[(pid>>8)%25],'gender':'F' if (pid&255)<personal[species][18] else 'M','abilityId':personal[species][24],'happiness':255}
  if moves:m['moves']=[x for x in moves if x]
  if item:m['heldItem']=item
  team.append(m)
 result[tid]={'name':'Komor' if tid in [287,288,289] else trainer_names[tid],'trainerClass':tc,'aiFlags':struct.unpack_from('<I',header,12)[0],'moneyMultiplier':header[17],'party':team,'messages':{k:trainer_texts[i] for i,(who,k) in enumerate(message_table) if who==tid},'items':list(struct.unpack_from('<4H',header,4))}
 print(tid,result[tid]['name'],team)
mondata={};compat={}
for sid,name in names.items():
 stats=struct.unpack_from('<6B2BBBH3H10BHHBBHHH',personal[sid]);growth=narc('a/0/1/7')[stats[17]]
 mondata[name]={'yield':stats[28],'catchRate':stats[8],'growth':list(struct.unpack('<'+str(len(growth)//4)+'I',growth)),'evYield':{k:(stats[10]>>(2*i))&3 for i,k in enumerate(['hp','atk','def','spe','spa','spd'])}}
 bits=int.from_bytes(personal[sid][40:56],'little');compat[name]=[item for item,bit in [(410,82),(420,95)] if bits>>bit&1]
v=struct.unpack_from('<24H',narc('a/0/1/2')[0],152*48);eid=v[10]&8191;raw=narc('a/1/2/6')[eid];slots=[]
for i,weight in enumerate([20,20,10,10,10,10,5,5,4,4,1,1]):
 sid,lo,hi=struct.unpack_from('<HBB',raw,8+i*4);slots.append({'name':names[sid],'min':lo,'max':hi,'weight':weight})
itemnames=ev.messages(texts[54]);descriptions=ev.messages(texts[53]);items={};raw=narc('a/0/5/7')[864]
for script in range(7026,7033):
 at=(script-7000)*4;entry=at+4+struct.unpack_from('<i',raw,at)[0];assert raw[entry:entry+6]==bytes.fromhex('2e0028000c80');items[script]={'id':struct.unpack_from('<H',raw,entry+6)[0],'count':struct.unpack_from('<H',raw,entry+12)[0]}
ids=sorted({27,30,155,410,420,437,89,13}|{i['id'] for i in items.values()})
data={'source':'IRBI','pokemonData':mondata,'compatibility':compat,'encounters':{'zone':152,'rate':raw[0] if False else narc('a/1/2/6')[eid][0],'slots':slots},'items':items,'itemNames':{i:itemnames[i] for i in ids},'itemDescriptions':{i:descriptions[i] for i in ids},'trainers':result}
(a.output/'striaton-data.js').write_text('window.STRIATON_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('encounters',data['encounters'],'items',items,'machines',compat)
