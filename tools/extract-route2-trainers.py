"""Extract the six initial IRBI trainer parties from the user's local ROM."""
import argparse
import json
import hashlib
import struct
import importlib.util
from pathlib import Path
import ndspy.narc
import ndspy.rom

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--rom', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
rom = ndspy.rom.NintendoDSRom.fromFile(args.rom)
if rom.idCode != b'IRBI':
    raise SystemExit('Expected Italian Pokemon Black (IRBI)')
def narc(name):
    return ndspy.narc.NARC(rom.getFileByName(name)).files
headers, parties, personal = narc('a/0/9/2'), narc('a/0/9/3'), narc('a/0/1/6')
spec = importlib.util.spec_from_file_location('field_messages', Path(__file__).with_name('extract-original-events.py'))
field_messages = importlib.util.module_from_spec(spec)
spec.loader.exec_module(field_messages)
trainer_texts = field_messages.messages(narc('a/0/0/2')[189])
message_table = list(struct.iter_unpack('<HH', narc('a/0/9/0')[0]))
message_offsets = narc('a/0/9/1')[0]
assert len(trainer_texts) == len(message_table) == 1762
ai = narc('a/1/7/1')[4]
assert hashlib.sha256(ai).hexdigest() == '1445323f99bfae12e70184f3b76b4d902e0532c0f479a78c95e6475fa4183cbd', 'Unexpected initial-rival AI program'
# Its first 102 bytes are: damaging moves +1 on turn zero; non-damaging
# moves +1 with probability 1/2 at <=50% target HP, and again at <=25%.
names = {495:'Snivy',498:'Tepig',501:'Oshawott',504:'Patrat',506:'Lillipup',509:'Purrloin'}
trainer_names=field_messages.messages(narc('a/0/0/2')[190])
natures = 'Hardy Lonely Brave Adamant Naughty Bold Docile Relaxed Impish Lax Timid Hasty Serious Jolly Naive Modest Mild Quiet Bashful Rash Calm Gentle Sassy Careful Quirky'.split()
result = {}
for trainer_id in (1,2,85,498,499,500):
    header = headers[trainer_id]
    kind, trainer_class, style, count = struct.unpack_from('<4B', header)
    assert kind == 0 and style == 0
    team=[]
    for member in range(count):
        difficulty, gender_ability, level, species, form = struct.unpack_from('<BBHHH', parties[trainer_id],member*8)
        assert form == 0 and species in names
        # Gen V TrainerUtil_LoadParty / NitroSDK MATH_Rand32. Record fields above
        # come from IRBI, not the differently numbered B2W2 trainer tables.
        # Reference: fuddlesworth/pokebw2 at 966de38c, src/system/tr_tool.c and
        # lib/nitro/include/nitro/math.h. Keep the 64-bit wraparound before scaling.
        seed = difficulty + level + species + trainer_id
        for _ in range(trainer_class):
            seed = (seed * 0x5d588b656c078965 + 0x269ec3) & ((1 << 64) - 1)
        pid = ((seed >> 48) << 8) + (0x78 if trainer_class == 38 else 0x88)
        iv = difficulty * 31 // 255
        p = personal[species]
        mon = {'name':names[species], 'level':level,
               'ivs':dict.fromkeys(('hp','atk','def','spe','spa','spd'),iv),
               'nature':natures[(pid >> 8) % 25],
               'gender':'F' if (pid & 255) < p[18] else 'M',
               'abilityId':p[24], 'happiness':255}
        team.append(mon)
    result[trainer_id] = {'name':'Belle' if trainer_class==38 else trainer_names[trainer_id],
                         'trainerClass':trainer_class,
                         'aiFlags':struct.unpack_from('<I',header,12)[0],
                         'moneyMultiplier':header[17], 'party':team,
                         'messages':{kind:trainer_texts[index] for index,(who,kind) in enumerate(message_table) if who==trainer_id}}
    first = struct.unpack_from('<H', message_offsets, trainer_id * 2)[0] // 4
    assert message_table[first][0] == trainer_id
    # Message kinds differ between rivals and route trainers.
args.output.write_text('window.ROUTE2_TRAINERS='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
print(json.dumps(result,indent=2))

header=narc('a/0/1/2')[0];eid=struct.unpack_from('<H',header,319*48+20)[0]&8191;e=narc('a/1/2/6')[eid]
slots=[]
for i,weight in enumerate([20,20,10,10,10,10,5,5,4,4,1,1]):
    species,lo,hi=struct.unpack_from('<HBB',e,8+i*4)
    slots.append({'name':names[species],'min':lo,'max':hi,'weight':weight})
pokemon={}
for sid,name in names.items():
    stats=struct.unpack_from('<6B2BBBH3H10BHHBBHHH',personal[sid]);growth=narc('a/0/1/7')[stats[17]]
    pokemon[name]={'yield':stats[28],'catchRate':stats[8],'growth':list(struct.unpack('<'+str(len(growth)//4)+'I',growth)),'evYield':{key:(stats[10]>>(2*i))&3 for i,key in enumerate(['hp','atk','def','spe','spa','spd'])}}
extra={'encounters':{'zone':319,'rate':e[0],'slots':slots},'pokemonData':pokemon,'phoneText':field_messages.messages(narc('a/0/0/2')[193]),'trainerNames':trainer_names}
args.output.with_name('route2-data.js').write_text('window.ROUTE2_DATA='+json.dumps(extra,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')

# Global-script routing in IRBI overlay10 02158BD0 / table02170098:
# 7000..7799 -> bank864. Each entry writes item and count to 800C/800D.
raw=narc('a/0/5/7')[864];items={}
for script in range(7267,7273):
    at=(script-7000)*4;entry=at+4+struct.unpack_from('<i',raw,at)[0]
    assert raw[entry:entry+6]==bytes.fromhex('2e0028000c80')
    item=struct.unpack_from('<H',raw,entry+6)[0];assert raw[entry+8:entry+12]==bytes.fromhex('28000d80')
    count=struct.unpack_from('<H',raw,entry+12)[0];items[script]={'id':item,'count':count}
extra['items']=items
args.output.with_name('route2-data.js').write_text('window.ROUTE2_DATA='+json.dumps(extra,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')

extra['itemNames']={str(i):field_messages.messages(narc('a/0/0/2')[54])[i] for i in [3,26,50]}
extra['itemDescriptions']={str(i):field_messages.messages(narc('a/0/0/2')[53])[i] for i in [3,26,50]}
args.output.with_name('route2-data.js').write_text('window.ROUTE2_DATA='+json.dumps(extra,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
