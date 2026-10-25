"""Extract the six initial IRBI trainer parties from the user's local ROM."""
import argparse
import json
import hashlib
import struct
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
ai = narc('a/1/7/1')[4]
assert hashlib.sha256(ai).hexdigest() == '1445323f99bfae12e70184f3b76b4d902e0532c0f479a78c95e6475fa4183cbd', 'Unexpected initial-rival AI program'
# Its first 102 bytes are: damaging moves +1 on turn zero; non-damaging
# moves +1 with probability 1/2 at <=50% target HP, and again at <=25%.
names = {495:'Snivy', 498:'Tepig', 501:'Oshawott'}
natures = 'Hardy Lonely Brave Adamant Naughty Bold Docile Relaxed Impish Lax Timid Hasty Serious Jolly Naive Modest Mild Quiet Bashful Rash Calm Gentle Sassy Careful Quirky'.split()
result = {}
for trainer_id in (53, 54, 55, 59, 60, 61):
    header = headers[trainer_id]
    kind, trainer_class, style, count = struct.unpack_from('<4B', header)
    assert kind == 0 and style == 0 and count == 1
    difficulty, gender_ability, level, species, form = struct.unpack('<BBHHH', parties[trainer_id])
    assert form == 0 and species in names and gender_ability == 0x10
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
    result[trainer_id] = {'name':'Belle' if trainer_class == 38 else 'Komor',
                         'trainerClass':trainer_class,
                         'aiFlags':struct.unpack_from('<I',header,12)[0],
                         'moneyMultiplier':header[17], 'party':[mon]}
args.output.write_text('window.OPENING_TRAINERS='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf8',newline='\n')
print(json.dumps(result,indent=2))
