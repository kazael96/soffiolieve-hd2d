"""Extract the IRBI seventh-badge chapter for review before runtime integration.

Retain the preceding reviewed reader and command signatures. Unknown commands
must fail extraction until their operands are verified from the native handler.
"""
from pathlib import Path

previous = Path(__file__).with_name('extract-icirrus.py')
namespace = {'__file__': str(previous)}
code = previous.read_text(encoding='utf8').rpartition('exec(compile(source,')[0]
exec(compile(code, str(previous), 'exec'), namespace)
source = namespace['source']
old = namespace['selected']
# Gym121 belongs to the next milestone. Castle166..190 are not automatically
# included merely because they share the same place-name as its main story.
selected = [16, 17, 113, 114, 115, 116, 117, 118, 119,
            *range(205, 214), *range(157, 166), 345, 346, 347, 254, 349, 348,
            120, *range(122, 136)]
assert 'selected=' + repr(old) in source
source = source.replace('selected=' + repr(old), 'selected=' + repr(selected))
source = source.replace('icirrus', 'opelucid').replace('ICIRRUS', 'OPELUCID').replace('Icirrus', 'Opelucid')
source = source.replace("f'ic-", "f'op-")
source = source.replace("['nimbasa','driftveil','mistralton','opelucid']", "['nimbasa','driftveil','mistralton','icirrus','opelucid']")
# Collect the first unsupported instruction of each program in one inspection,
# but refuse to export a partial event catalog if any program is undecoded.
source = source.replace('zones={};scripts={};texts={};', 'failures=[];zones={};scripts={};texts={};')
failure = "except Exception as error:raise ValueError(f'Zone {zone}: {error}') from error"
assert failure in source
source = source.replace(failure, "except Exception as error:failures.append({'zone':zone,'script':v[4],'error':str(error)})")
marker = "write('opelucid-events.js','OPELUCID_EVENTS',{'source':'IRBI','zones':zones,'scripts':scripts,'texts':texts})"
assert marker in source
guard = """(a.output/'unsupported-commands.json').write_text(json.dumps(failures,indent=2),encoding='utf8')
if failures:
    print(json.dumps(failures,ensure_ascii=False,indent=2))
    raise SystemExit('Event extraction incomplete; no partial catalog exported')
"""
source = source.replace(marker, guard + marker, 1)
exec(compile(source, str(Path(__file__).with_name('extract-castelia.py')), 'exec'))
