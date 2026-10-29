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
names={i:name for i,name in enumerate(ev.messages(narc('a/0/0/2')[70])) if 0<i<=649}
texts=narc('a/0/0/2');trainer_texts=ev.messages(texts[189]);trainer_names=ev.messages(texts[190]);message_table=list(struct.iter_unpack('<HH',narc('a/0/9/0')[0]));personal=narc('a/0/1/6');result={}
natures='Hardy Lonely Brave Adamant Naughty Bold Docile Relaxed Impish Lax Timid Hasty Serious Jolly Naive Modest Mild Quiet Bashful Rash Calm Gentle Sassy Careful Quirky'.split()
chapter=json.loads((a.output/'route3-events.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'));programs=chapter['scripts'];entities=[dict(d,zone=int(z)) for z,d in chapter['zones'].items()];tids={c['args'][0] for p in programs.values() for c in p['code'].values() if c['name']=='CallTrainerBattle'};tids.update(c['args'][i] for p in programs.values() for c in p['code'].values() if c['name']=='NativeOpcode134' for i in range(3));tids.update(a['script']-3000 for z in entities if z['zone'] in [321,322,324] for a in z['actors'] if 3000<=a['script']<4000)
for tid in sorted(tids):
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
 result[tid]={'name':'Komor' if tid in [56,57,58] else trainer_names[tid],'trainerClass':tc,'battleStyle':style,'aiFlags':struct.unpack_from('<I',header,12)[0],'moneyMultiplier':header[17],'party':team,'messages':{k:trainer_texts[i] for i,(who,k) in enumerate(message_table) if who==tid},'items':list(struct.unpack_from('<4H',header,4))}
 print(tid,result[tid]['name'],team)
mondata={};compat={}
selected={495,498,501,504,506,509,511,513,515,517,518,519,522,524,527}|{next(sid for sid,name in names.items() if name==p['name']) for t in result.values() for p in t['party']}
for sid in sorted(selected):
 name=names[sid]
 stats=struct.unpack_from('<6B2BBBH3H10BHHBBHHH',personal[sid]);growth=narc('a/0/1/7')[stats[17]]
 mondata[name]={'yield':stats[28],'catchRate':stats[8],'growth':list(struct.unpack('<'+str(len(growth)//4)+'I',growth)),'evYield':{k:(stats[10]>>(2*i))&3 for i,k in enumerate(['hp','atk','def','spe','spa','spd'])}}
 bits=int.from_bytes(personal[sid][40:56],'little');compat[name]=[item for item,bit in [(373,45),(410,82),(420,95)] if bits>>bit&1]
encounters={}
for zone in [321,324]:
 v=struct.unpack_from('<24H',narc('a/0/1/2')[0],zone*48);eid=v[10]&8191;raw=narc('a/1/2/6')[eid];slots=[]
 for i,weight in enumerate([20,20,10,10,10,10,5,5,4,4,1,1]):
  sid,lo,hi=struct.unpack_from('<HBB',raw,8+i*4);slots.append({'name':names[sid],'min':lo,'max':hi,'weight':weight})
 encounters[zone]={'rate':raw[0],'slots':slots}
 if zone==321:
  dark=[]
  for i,weight in enumerate([20,20,10,10,10,10,5,5,4,4,1,1]):
   sid,lo,hi=struct.unpack_from('<HBB',raw,56+i*4);dark.append({'name':names[sid],'min':lo,'max':hi,'weight':weight})
  encounters[zone]['dark']={'rate':raw[1],'slots':dark}
items={};raw=narc('a/0/5/7')[864]
for z in entities:
 if z['zone'] not in [321,324]:continue
 for actor in z['actors']:
  script=actor['script']
  if not 7000<=script<8000:continue
  at=(script-7000)*4;entry=at+4+struct.unpack_from('<i',raw,at)[0]
  assert raw[entry:entry+6]==bytes.fromhex('2e0028000c80'),script
  items[script]={'id':struct.unpack_from('<H',raw,entry+6)[0],'count':struct.unpack_from('<H',raw,entry+12)[0]}
itemnames=ev.messages(texts[54]);descriptions=ev.messages(texts[53]);ids={14,18,21,27,30,150,155,373}|{i['id'] for i in items.values()}
data={'source':'IRBI','compatibility':compat,'pokemonData':mondata,'encounters':encounters,'items':items,'itemNames':{i:itemnames[i] for i in ids},'itemDescriptions':{i:descriptions[i] for i in ids},'trainers':result}
(a.output/'route3-data.js').write_text('window.ROUTE3_DATA='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print('encounters',encounters,'items',items)
