"""IRBI chapter051 progression reference; export alone enables no game content."""
from pathlib import Path

previous = Path(__file__).with_name('extract-icirrus-data.py')
namespace = {'__file__': str(previous)}
code = previous.read_text(encoding='utf8').rpartition('exec(compile(source,')[0]
exec(compile(code, str(previous), 'exec'), namespace)
source = namespace['source']


def replace(old, new):
    global source
    assert old in source, old
    source = source.replace(old, new)


selected = [16, 17, 113, 114, 115, 116, 117, 118, 119, *range(205, 214),
            *range(157, 166), 345, 346, 347, 254, 349, 348, 120, *range(122, 136)]
grounds = [113, 157, 158, *range(160, 166), *range(205, 214), 345, 346, 348]
old_encounters = [6, 96, 155, 317, 321, 324, 326, 331, 337, 339, 340, 341, 200, 201, 202, 203, 113]
replace('icirrus-events.js', 'opelucid-events.js')
replace("  if moves:m['moves']=[x for x in moves if x]", "  if native_personal[18]==255:m['gender']='N' # Personal genderless overrides the PID threshold.\n  if moves:m['moves']=[x for x in moves if x]")
replace("a.output/'mistralton-data.js'", "a.output/'icirrus-data.js'")
replace("'driftveil-data.js','mistralton-data.js']", "'driftveil-data.js','mistralton-data.js','icirrus-data.js']")
replace('[108,337,339,340,341,200,201,202,203]', repr([114, *grounds]))
replace('[107,108,109,110,111,112,337,338,339,340,341,342,343,344,198,199,200,201,202,203,204,113,115,116,117,118,119]', repr(selected))
replace('for zone in [6,96,155,317,321,324,326,331,337,339,340,341,200,201,202,203,113]:', 'for zone in ' + repr(sorted(set(old_encounters + grounds))) + ':')
replace('zone in [337,339,340,341,200,201,202,203,113]', 'zone in ' + repr(grounds))
replace('<=39', '<=43')
replace("'levelCap':39,'capSteps':[{'badge':4,'level':31},{'badge':5,'level':35},{'badge':6,'level':39}]", "'levelCap':43,'capSteps':[{'badge':4,'level':31},{'badge':5,'level':35},{'badge':6,'level':39},{'badge':7,'level':43}]")
replace("'mistralton','icirrus']", "'mistralton','icirrus','opelucid']")
replace("a.output/'icirrus-data.js').write_text", "a.output/'opelucid-data.js').write_text")
replace('window.ICIRRUS_DATA=', 'window.OPELUCID_DATA=')
replace("data['genderGraphics']={'Unfezant':{'F':'521-female'},'Frillish':{'F':'592-female'}}", "data['genderGraphics']={'Unfezant':{'F':'521-female'},'Frillish':{'F':'592-female'},'Jellicent':{'F':'593-female'}}")
replace("print('IRBI050:'", "print('IRBI051:'")
marker = "(a.output/'opelucid-data.js').write_text"
assert marker in source
source = source.replace(marker, """# New native pickups/rewards may contain machines absent from the prior map.
# Their mapping and compatibility come from ARM9/personal records, not names.
new_machine_ids=sorted(item for item in ids if item in native_by_item and item not in data['machines'])
data['machines'].update({item:native_by_item[item] for item in new_machine_ids})
for name,record in data['progression'].items():
    personal_id=665 if name=='Basculin-Blue-Striped' else record['id']
    bits=int.from_bytes(personal[personal_id][40:56],'little')
    def compatibility_bit(item):
        if 328<=item<=419:return item-328
        if 420<=item<=425:return 95+item-420
        if 618<=item<=620:return 92+item-618
        raise ValueError('Unexpected machine item '+str(item))
    data['compatibility'][name]=[item for item in data['machines'] if bits>>compatibility_bit(item)&1]
data['referenceNewMachineItems']=new_machine_ids
data['chapterScope']={'zones':""" + repr(selected) + """,'levelCap':43,'nextGym':133,'note':'Catalog reference only; sources require actual event/service integration'}
""" + marker, 1)
exec(compile(source, str(Path(__file__).with_name('extract-pinwheel-data.py')), 'exec'))

# Extend the inherited shop table for native Center122 fixed stock8.
from importlib import util as _util
_spec=_util.spec_from_file_location("opelucid_market",Path(__file__).with_name("extend-opelucid-market.py"))
_market=_util.module_from_spec(_spec);_spec.loader.exec_module(_market)
_market.extend(a.rom,a.output)
