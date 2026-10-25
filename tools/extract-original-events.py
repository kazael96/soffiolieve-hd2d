"""Extract the selected Italian Black field programs without rewriting their text.

Requires ndspy. Only the user-supplied IRBI ROM is read; no executable or ROM is
included in the output. Command signatures live beside this tool for review.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import ndspy.narc
import ndspy.rom

SELECTED = {
    317: list(range(9)), 389: [*range(14),15,16], 390: [0, 1, 4],
    391: list(range(9)), 392: list(range(5)), 393: [0], 394: [0, 1],
    395: [0], 396: [0, 9, 10, 4, 5, 6, 7, 8, 12],
}
FORMATS = {'u8': 'B', 'u16': 'H', 'u32': 'I', 'any': 'H', 'var': 'H'}


def messages(data):
    sections, count = struct.unpack_from('<HH', data)
    if sections != 1:
        raise ValueError('Expected one message language')
    section = struct.unpack_from('<I', data, 12)[0]
    result = []
    for i in range(count):
        offset, length, _attributes = struct.unpack_from('<IHH', data, section + 4 + 8 * i)
        chars = list(struct.unpack_from(f'<{length}H', data, section + offset))
        key = chars[-1] ^ 0xffff
        for at in reversed(range(len(chars))):
            chars[at] ^= key
            key = ((key >> 3) | (key << 13)) & 0xffff
        if chars[0] == 0xf100:
            bits = count_bits = 0
            decoded = []
            ended = False
            for word in chars[1:]:
                bits |= word << count_bits
                count_bits += 16
                while count_bits >= 9:
                    char = bits & 0x1ff
                    bits >>= 9
                    count_bits -= 9
                    if char == 0x1ff:
                        ended = True
                        break
                    decoded.append(char)
                if ended:
                    break
            if not ended:
                raise ValueError('Truncated compressed message')
            chars = decoded + [0xffff]
        if chars[-1] != 0xffff:
            raise ValueError('Message terminator missing')
        text = []
        pos = 0
        while pos < len(chars) - 1:
            char = chars[pos]
            if char == 0xf000:
                kind, argc = chars[pos + 1:pos + 3]
                args = chars[pos + 3:pos + 3 + argc]
                if len(args) != argc:
                    raise ValueError('Truncated message control')
                text.append(f'{{{kind:04x}' + (':' + ','.join(map(str, args)) if args else '') + '}')
                pos += 3 + argc
                continue
            text.append('\\n' if char == 0xfffe else chr(char))
            pos += 1
        result.append(''.join(text))
    return result


def program(data, selected, table):
    entries = []
    pos = 0
    while struct.unpack_from('<H', data, pos)[0] != 0xfd13:
        entries.append(pos + 4 + struct.unpack_from('<i', data, pos)[0])
        pos += 4
    queue = [entries[i] for i in selected]
    code, movements = {}, {}
    while queue:
        pos = queue.pop()
        while str(pos) not in code:
            start = pos
            opcode = struct.unpack_from('<H', data, pos)[0]
            spec = table.get(str(opcode))
            if spec is None:
                raise ValueError(f'Unsupported instruction {opcode:#x} at {start:#x}')
            name = re.sub(r'^s[0-9A-F]{4}_', '', spec['name'])
            pos += 2
            args, ends = [], []
            for kind in spec['args']:
                fmt = '<' + FORMATS[kind]
                args.append(struct.unpack_from(fmt, data, pos)[0])
                pos += struct.calcsize(fmt)
                ends.append(pos)
            reference = {'VMCall': 0, 'VMJump': 0, 'VMJumpIf': 1, 'VMCallIf': 1}.get(name)
            if reference is not None:
                raw = args[reference]
                args[reference] = ends[reference] + (raw if raw < 2**31 else raw - 2**32)
                queue.append(args[reference])
            if name == 'ActorCmdExec':
                args[1] = ends[1] + (args[1] if args[1] < 2**31 else args[1] - 2**32)
                at, sequence = args[1], []
                while True:
                    action, repeats = struct.unpack_from('<HH', data, at)
                    sequence.append([action, repeats])
                    at += 4
                    if action == 254:
                        break
                movements[str(args[1])] = sequence
            code[str(start)] = {'op': opcode, 'name': name, 'args': args, 'end': pos}
            if name in ('VMHalt', 'VMReturn', 'VMJump', 'RTEndGlobal'):
                break
    return {'entries': entries, 'supportedEntries': selected, 'code': code, 'movements': movements,
            'sourceSha256': hashlib.sha256(data).hexdigest()}


def entities(data):
    pos = 8
    result = {'background': [], 'actors': [], 'warps': [], 'triggers': []}
    layouts = [
        ('background', '<4H3i', ['script', 'condition', 'direction', 'rail', 'x', 'y', 'z']),
        ('actors', '<12HIHHi', ['id', 'model', 'movement', 'type', 'flag', 'script', 'direction',
                              'p0', 'p1', 'p2', 'width', 'height', 'rail', 'x', 'z', 'y']),
        ('warps', '<HHBBH6H', ['zone', 'warp', 'a', 'transition', 'rail', 'x', 'y', 'z', 'width', 'height', 'b']),
        ('triggers', '<5H4HhH', ['script', 'value', 'var', 'type', 'rail', 'x', 'z', 'width', 'height', 'y', 'a']),
    ]
    for count, (key, fmt, names) in zip(data[4:8], layouts):
        for _ in range(count):
            record = dict(zip(names, struct.unpack_from(fmt, data, pos)))
            if record['rail']:
                raise ValueError('Rail entity outside selected grid-map format')
            result[key].append(record)
            pos += struct.calcsize(fmt)
    if pos != 4 + struct.unpack_from('<I', data)[0]:
        raise ValueError('Entity table length mismatch')
    return result


def extract(rom_path):
    rom = ndspy.rom.NintendoDSRom.fromFile(rom_path)
    if rom.idCode != b'IRBI':
        raise ValueError('Expected Italian Pokemon Black (IRBI)')
    # The published BW command reference incorrectly gives 0x17d one argument.
    # Verify the actual handler: it reads no operand and calls the capture demo.
    overlays=rom.loadArm9Overlays([10,21,93])
    for overlay,start,end,expected in [
        (21,0x21b4fdc,0x21b500a,'b03ff7e103aae5d1c04cc7f0e0f8a02bbc4c29b90e57887d379b2ffe39f29027'),
        (10,0x216e84c,0x216e990,'fa868a628eac4700d414c5b9db5b1708da1ebe6b2bb69bdeddeb2598c23437c3'),
        (93,0x21e90e8,0x21e94b4,'dd0dd39ed27074a4d8b343dd2e5b213864ed3586268a275f3dc23da8929b8d06'),
    ]:
        native=overlays[overlay]
        actual=hashlib.sha256(native.data[start-native.ramAddress:end-native.ramAddress]).hexdigest()
        if actual!=expected:raise ValueError(f'Unexpected IRBI capture program in overlay {overlay}')
    def narc(path):
        return ndspy.narc.NARC(rom.getFileByName(path)).files
    headers = narc('a/0/1/2')[0]
    scripts, text, events = narc('a/0/5/7'), narc('a/0/0/3'), narc('a/1/2/5')
    table = json.loads(Path(__file__).with_name('irbi-field-commands.json').read_text())
    result = {'source': 'IRBI', 'zones': {}, 'scripts': {}, 'texts': {}}
    for zone, selected in SELECTED.items():
        values = struct.unpack_from('<BBHHHHH4HHHHHHHHHiii', headers, 48 * zone)
        script, bank, event = values[4], values[6], values[12]
        init=[];triggers=[];raw=scripts[script+1];pos=0
        while struct.unpack_from('<H',raw,pos)[0]:
            mode,entry=struct.unpack_from('<HI',raw,pos);pos+=6
            if mode==1:
                q=pos+entry
                while struct.unpack_from('<H',raw,q)[0]:
                    var,value,event_id=struct.unpack_from('<HHH',raw,q);q+=6
                    triggers.append({'var':var,'value':value,'entry':event_id-1})
            else:init.append({'mode':mode,'entry':entry-1})
        result['zones'][str(zone)] = {'zone': zone, 'script': script, 'text': bank, 'music':values[7], 'init':init, 'onEnter':triggers, **entities(events[event])}
        result['scripts'][str(script)] = program(scripts[script], selected, table)
        result['texts'][str(bank)] = messages(text[bank])
    result['scripts']['862'] = program(scripts[862], [0, 5], table)
    result['texts']['283'] = messages(text[283])
    result['phoneTexts'] = messages(narc('a/0/0/2')[192])
    system=narc('a/0/0/2')
    result['progressTexts']={str(bank):messages(system[bank]) for bank in [15,204]}
    items=messages(system[54])
    result['itemNames']={str(item):items[item] for item in [4,17,442,621,626]}
    result['pocketNames']=messages(system[55])
    # IRBI overlay93, BtlvCore_CmdCaptureDemo at 0x021e90e8: Pound,
    # gauge set to maxHP/6, Leer, Defense-down, demonstration text, ball.
    # This is a scripted presentation in the original too, not a normal turn.
    battle_moves,battle_effects=messages(system[13]),messages(system[14])
    result['captureTutorial']={'hpDivisor':6,'playerMove':1,'enemyMove':43,
        'player':{'name':'Minccino','level':7,'moves':[1,45]},
        'enemy':{'name':'Patrat','level':2,'moves':[33,43]},
        'messages':{'playerMove':battle_moves[3],'enemyMove':battle_moves[130],
                    'defenseDown':battle_effects[93],'advice':messages(system[20])[0],
                    'ball':messages(system[20])[1],'caught':messages(system[15])[65]}}
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('rom', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    payload = extract(args.rom)
    args.output.write_text('window.ORIGINAL_EVENTS=' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8', newline='\n')
    print(f'Extracted {sum(len(s["code"]) for s in payload["scripts"].values())} original instructions in {len(payload["zones"])} zones')
