"""Strict IRBI eighth-badge/Route10/Victory Road reference export.

Extraction does not install gameplay. Preserve existing command semantics;
only additional reviewed operand layouts come from league-opcodes.json.
"""
import os
from pathlib import Path
import subprocess


SELECTED = [120, 121, 123, 132, 136, 146, *range(214, 229), *range(355, 365)]


def build_source():
    previous = Path(__file__).with_name('extract-opelucid.py')
    namespace = {'__file__': str(previous)}
    prefix, marker, _tail = previous.read_text(encoding='utf-8').rpartition('exec(compile(source,')
    if not marker:
        raise ValueError('Reviewed parent exporter entry point changed')
    exec(compile(prefix, str(previous), 'exec'), namespace)
    source = namespace['source']
    old = 'selected=' + repr(namespace['selected'])
    if source.count(old) != 1:
        raise ValueError('Ambiguous parent zone inventory')
    source = source.replace(old, 'selected=' + repr(SELECTED))
    source = source.replace('opelucid', 'league').replace('OPELUCID', 'LEAGUE').replace('Opelucid', 'League')
    source = source.replace("f'op-", "f'lg-")
    inherited = "['nimbasa','driftveil','mistralton','icirrus','league']"
    if source.count(inherited) != 1:
        raise ValueError('Reviewed command table inheritance changed')
    source = source.replace(inherited, "['nimbasa','driftveil','mistralton','icirrus','opelucid','league']")
    return source.replace('subprocess.run(', '_quiet_run(')


def _quiet_run(*args, **kwargs):
    if os.name == 'nt':
        kwargs['creationflags'] = kwargs.get('creationflags', 0) | getattr(subprocess, 'CREATE_NO_WINDOW', 0x08000000)
    return subprocess.run(*args, **kwargs)


if __name__ == '__main__':
    # Geometry requires the full reviewed ndspy.texture/color package. The
    # small ROM-container adapter must not replace that installed package.
    exec(compile(build_source(), str(Path(__file__).with_name('extract-castelia.py')), 'exec'))
