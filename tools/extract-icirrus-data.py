"""Native IRBI data through Skyla and Icirrus arrival; extraction is not gameplay.

Keep the previous chapter reader, with checked transformations. Ground phenomena
and fishing records are retained as reference, never promoted to new catch sources.
"""
from pathlib import Path
import sys

repo = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(repo.parent / 'audio-tools/python-packages'))
previous = Path(__file__).with_name('extract-mistralton-data.py')
code = previous.read_text(encoding='utf8').rpartition('exec(compile(source,')[0]
namespace = {'__file__': str(previous)}
exec(compile(code, str(previous), 'exec'), namespace)
source = namespace['source']

def replace(old, new):
    global source
    assert old in source, old
    source = source.replace(old, new)

replace('mistralton-events.js', 'icirrus-events.js')
replace("'nimbasa-data.js','driftveil-data.js']", "'nimbasa-data.js','driftveil-data.js','mistralton-data.js']")
replace("a.output/'driftveil-data.js'", "a.output/'mistralton-data.js'")
replace('[97,191,192,193,331,195,196,197]', '[108,337,339,340,341,200,201,202,203]')
replace('[96,97,98,191,192,193,194,195,196,197,331,107,109]', '[107,108,109,110,111,112,337,338,339,340,341,342,343,344,198,199,200,201,202,203,204,113,115,116,117,118,119]')
replace('<=35', '<=39')
replace("'levelCap':35,'capSteps':[{'badge':4,'level':31},{'badge':5,'level':35}]", "'levelCap':39,'capSteps':[{'badge':4,'level':31},{'badge':5,'level':35},{'badge':6,'level':39}]")
replace('param in [82,84,85]', 'param in [82,83,84,85]')
replace('for index in range(13):', 'for index in range(14):')
replace('for i in range(7)', 'for i in range(8)')
replace('ids|={2,158,450}', 'ids|={2,157,158,450}')
replace("'driftveil','mistralton']", "'driftveil','mistralton','icirrus']")
machines = [(389,61,512),(422,97,57),(367,39,332),(384,56,451),
            (408,80,404),(388,60,261),(392,64,421),(417,89,164),
            (418,90,430),(358,30,280),(341,13,59),(352,24,87),(365,37,126)]
replace('(385,57)]', '(385,57),' + ','.join(repr((i,b)) for i,b,m in machines) + ']')
replace('385:507}', '385:507,' + ','.join(f'{i}:{m}' for i,b,m in machines) + '}')
replace('for zone in [191,331,195,196,197]:', 'for zone in [337,339,340,341,200,201,202,203,113]:')
start = source.index('encounters={};wild=set()')
end = source.index('\nevolutions={};', start)
source = source[:start] + '''encounters={};wild=set();encounter_sources={}
# 232-byte native records, four seasonal records where the archive has928 bytes.
# Bits10..15 carry the form; the species index is the low10 bits.
for zone in [6,96,155,317,321,324,326,331,337,339,340,341,200,201,202,203,113]:
 v=struct.unpack_from('<24H',narc('a/0/1/2')[0],zone*48)
 index=v[10]&8191
 if index==8191:continue
 raw=narc('a/1/2/6')[index];assert len(raw) in [232,928],(zone,len(raw))
 seasons=[]
 for season in range(4):
  record=raw[(season if len(raw)==928 else 0)*232:][:232];groups={}
  for kind,offset,rate_index,weights in [('normal',8,0,[20,20,10,10,10,10,5,5,4,4,1,1]),('dark',56,1,[20,20,10,10,10,10,5,5,4,4,1,1]),('shaking',104,2,[20,20,10,10,10,10,5,5,4,4,1,1]),('surf',152,3,[60,30,5,4,1]),('rippleSurf',172,4,[60,30,5,4,1]),('fishing',192,5,[60,30,5,4,1]),('rippleFishing',212,6,[60,30,5,4,1])]:
   if not record[rate_index]:continue
   slots=[]
   for i,weight in enumerate(weights):
    encoded,lo,hi=struct.unpack_from('<HBB',record,offset+i*4);sid=encoded&1023;form=encoded>>10
    assert sid in names and 1<=lo<=hi<=100,(zone,kind,sid,lo,hi)
    name='Basculin-Blue-Striped' if sid==550 and form==1 else names[sid]
    slots.append({'name':name,'id':sid,'form':form,'sourceRawSpecies':encoded,'min':lo,'max':hi,'weight':weight})
    # Previous ordinary water is reachable with Surf. New ground includes only
    # actual encounters, not a rustling/ripple/fishing feature not implemented.
    if kind in ['normal','dark','surf'] and (zone in [337,339,340,341,200,201,202,203,113] or kind=='surf'):
     wild.add(sid);encounter_sources.setdefault(name,[]).append({'zone':zone,'season':season,'kind':kind})
   groups[kind]={'rate':record[rate_index],'slots':slots}
  seasons.append(groups)
 encounters[zone]={'table':index,'recordBytes':len(raw),'seasons':seasons,'rate':seasons[0].get('normal',{}).get('rate',0),'slots':seasons[0].get('normal',{}).get('slots',[]),**{k:v for k,v in seasons[0].items() if k!='normal'}}
''' + source[end:]
replace("data['visualForms']={}", "data['encounterSources']=encounter_sources\ndata['referenceOnlyEncounterKinds']=['shaking','rippleSurf','fishing','rippleFishing']\ndata['visualForms']={}")
replace("(a.output/'mistralton-data.js').write_text", "(a.output/'icirrus-data.js').write_text")
replace('window.MISTRALTON_DATA=', 'window.ICIRRUS_DATA=')
replace("(a.output/'icirrus-data.js').write_text", """# Validate the complete exported machine map against the decompressed ARM9.
from irbi_reader import code_decompress
arm=code_decompress(r.arm9)
needle=struct.pack('<10H',468,337,473,347,46,92,258,339,474,237)
table_offset=arm.find(needle)
assert table_offset>=0 and arm.find(needle,table_offset+1)<0
native_moves=struct.unpack_from('<101H',arm,table_offset)
assert native_moves[92:98]==(15,19,57,70,127,291)
native_by_item={**{328+i:native_moves[i] for i in range(92)},**{420+i:native_moves[92+i] for i in range(6)},**{618+i:native_moves[98+i] for i in range(3)}}
assert all(native_by_item[item]==move for item,move in data['machines'].items()),[(item,move,native_by_item[item]) for item,move in data['machines'].items() if native_by_item[item]!=move]
data['machineSource']={'arm9Offset':table_offset,'ramAddress':hex(r.arm9RamAddress+table_offset),'ordering':'TM01..92,HM01..06,TM93..95','compatibilityOrdering':'TM01..95,HM01..06'}
(a.output/'icirrus-data.js').write_text""")
replace(" print(tid,result[tid]['name'],team)", " # Trainer records are preserved in the generated catalog, not printed.")
replace("print('obtainable',data['obtainable'],'items',items,'new machines',[itemnames[i] for i in ids if i in [394,413,619]]);print('wild',encounters)", "print('IRBI050:',len(data['trainers']),'trainers,',len(data['progression']),'species/forms,',len(data['encounters']),'seasonal encounter tables,',len(data['machines']),'machines')")
exec(compile(source, str(Path(__file__).with_name('extract-pinwheel-data.py')), 'exec'))
