"""Export animated native children of the explicit052 families, using invisible conversions."""
from pathlib import Path
import os
import subprocess
import importlib.util

_spec = importlib.util.spec_from_file_location('league_field_staging', Path(__file__).resolve().parents[1] / 'scripts/build-site.py')
_builder = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_builder)
build_staging = _builder.build_staging


def quiet_run(command, **kwargs):
    if os.name == 'nt':
        kwargs['creationflags'] = kwargs.get('creationflags', 0) | 0x08000000
    return subprocess.run(command, **kwargs)


def build_source():
    source = Path(__file__).with_name('extract-opelucid-field-models.py').read_text(encoding='utf-8')
    source = source.replace('opelucid', 'league').replace('OPELUCID', 'LEAGUE').replace('Opelucid', 'League').replace('IRBI051', 'IRBI052').replace('Native051', 'Native052')
    source = source.replace('op-prop-', 'lg-prop-').replace('op-field-', 'lg-field-').replace('scope op', 'scope lg').replace('scopes.op=', 'scopes.lg=')
    marker = "assert combined['models'] and combined['children']"
    if source.count(marker) != 1:
        raise ValueError('Reviewed child dependency validation changed')
    # Badge gates are animated parents themselves; they need no separate child.
    source = source.replace(marker, "assert combined['models']\nassert all(record['modelKey'] in combined['models'] for record in combined['children'].values())")
    marker = "source = source_path.read_text(encoding='utf8')"
    if source.count(marker) != 1:
        raise ValueError('Reviewed field exporter entry point changed')
    source = source.replace(marker, marker + "\nsource = source.replace('subprocess.run(', '_quiet_run(').replace('tempfile.TemporaryDirectory()', '_build_staging()')")
    marker = "scope = {'__name__': 'league_field_export', 'plans': [(archive, member, texture, member, ids)]}"
    if source.count(marker) != 1:
        raise ValueError('Reviewed field converter scope changed')
    return source.replace(marker, marker + "\n    scope['_quiet_run'] = quiet_run\n    scope['_build_staging'] = build_staging")


if __name__ == '__main__':
    exec(compile(build_source(), str(Path(__file__).with_name('extract-league-field-models.py')), 'exec'))
