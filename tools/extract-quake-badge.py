"""Export Rafan's native male/female fifth-badge receipt as a scoped extension.

The output deliberately does not edit field-effect-assets.js.  Load the generated
mistralton-badge-assets.js after that catalog to install the two native effects.
The shared badge background and its audited alpha curve remain shared resources.
"""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
import struct
import subprocess

try:
    import ndspy.rom
    import ndspy.narc
except ModuleNotFoundError:
    from irbi_reader import install
    install()
    import ndspy.rom
    import ndspy.narc


INSTALLER = """;
(function(root){
  const extension=root.MISTRALTON_BADGE_ASSETS;
  function install(target=root.FIELD_EFFECT_ASSETS){
    if(!target?.models?.badgeBackground)throw Error('Native badge background unavailable');
    if(target.hashes?.['16']!==extension.backgroundSha256)throw Error('Native badge background mismatch');
    for(const key of ['models','materialAlpha','effects','hashes'])Object.assign(target[key]??={},extension[key]);
    return target;
  }
  root.MistraltonBadgeAssets={install};
  if(root.FIELD_EFFECT_ASSETS)install();
})(typeof window!=='undefined'?window:globalThis);
"""


def export(rom, output, apicula, work_dir, *, badge='quake'):
    variants = {
        'quake': ([(7, 'quakeBadgeM'), (46, 'quakeBadgeF')], 'Medaglia Sisma', 'MISTRALTON_BADGE_ASSETS', 'MistraltonBadgeAssets', 'mistralton-badge-assets.js'),
        'jet': ([(8, 'jetBadgeM'), (47, 'jetBadgeF')], 'Medaglia Jet', 'ICIRRUS_BADGE_ASSETS', 'IcirrusBadgeAssets', 'icirrus-badge-assets.js'),
        'freeze': ([(9, 'freezeBadgeM'), (48, 'freezeBadgeF')], 'Medaglia Stalattite', 'OPELUCID_BADGE_ASSETS', 'OpelucidBadgeAssets', 'opelucid-badge-assets.js'),
    }
    effects, label, global_name, api_name, catalog_name = variants[badge]
    rom = ndspy.rom.NintendoDSRom.fromFile(rom)
    if rom.idCode != b'IRBI':
        raise ValueError('Expected Italian Pokemon Black IRBI ROM')
    models = ndspy.narc.NARC(rom.getFileByName('a/1/1/5')).files
    descriptors = ndspy.narc.NARC(rom.getFileByName('a/1/1/7')).files
    data = {
        'source': 'IRBI a/1/1/7:' + ','.join(str(i) for i, _ in effects) + ' + a/1/1/5; native ' + badge + ' badge receipt',
        'backgroundSha256': hashlib.sha256(models[16]).hexdigest(),
        'models': {}, 'materialAlpha': {}, 'effects': {}, 'hashes': {},
    }
    report = {'effects': [], 'files': {}}
    for identifier, name in effects:
        descriptor = struct.unpack('<18H', descriptors[identifier])
        if descriptor[4] != 16 or descriptor[8:12] != (18, 19, 20, 65535):
            raise ValueError('Unexpected badge background or animation descriptor')
        indices = [descriptor[5], descriptor[12], descriptor[13]]
        stage = work_dir / name
        stage.mkdir(parents=True, exist_ok=True)
        inputs = []
        for member in indices:
            file = stage / f'{member}.bin'
            file.write_bytes(models[member])
            inputs.append(str(file.resolve()))
            data['hashes'][str(member)] = hashlib.sha256(models[member]).hexdigest()
        converted = stage / 'converted'
        result = subprocess.run([
            str(apicula.resolve()), 'convert', *inputs, '-o', str(converted.resolve()),
            '-f', 'glb', '--all-animations', '--overwrite',
        ], check=True, capture_output=True, text=True)
        (stage / 'apicula.stdout.txt').write_text(result.stdout, encoding='utf8')
        (stage / 'apicula.stderr.txt').write_text(result.stderr, encoding='utf8')
        destination = output / 'assets/field-effects' / name
        destination.mkdir(parents=True, exist_ok=True)
        for file in converted.iterdir():
            if file.is_file():
                shutil.copyfile(file, destination / file.name)
                report['files'][(destination / file.name).relative_to(output).as_posix()] = hashlib.sha256(file.read_bytes()).hexdigest()
        glbs = sorted(destination.glob('*.glb'))
        if len(glbs) != 1:
            raise ValueError(f'Expected one native badge GLB, got {len(glbs)}')
        raw = glbs[0].read_bytes()
        if raw[:4] != b'glTF':
            raise ValueError('Invalid converted GLB')
        doc = json.loads(raw[20:20 + struct.unpack_from('<I', raw, 12)[0]])
        missing = [image['uri'] for image in doc.get('images', [])
                   if 'uri' in image and not (destination / image['uri']).is_file()]
        if missing or not doc.get('animations'):
            raise ValueError(f'Missing native badge animation or textures: {missing}')
        data['models'][name] = {'url': glbs[0].relative_to(output).as_posix(), 'sourceMembers': indices, 'frames': 361}
        data['materialAlpha'][name] = {}
        data['effects'][str(identifier)] = {
            'descriptor': descriptor, 'background': 'badgeBackground', 'item': name,
            'frames': 361, 'particles': False,
            'descriptorSha256': hashlib.sha256(descriptors[identifier]).hexdigest(),
            'label': label,
            'adaptation': 'Original models, joint animation and shared background alpha; visibility/pattern and SPL15 are not reconstructed',
        }
        report['effects'].append({'id': identifier, 'item': name, 'members': indices,
                                  'animations': [a.get('name') for a in doc['animations']],
                                  'images': len(doc.get('images', []))})
    output.mkdir(parents=True, exist_ok=True)
    installer = INSTALLER.replace('MISTRALTON_BADGE_ASSETS', global_name).replace('MistraltonBadgeAssets', api_name)
    (output / catalog_name).write_text(
        'window.' + global_name + '=' + json.dumps(data, separators=(',', ':')) + installer,
        encoding='utf8', newline='\n')
    work_dir.mkdir(parents=True, exist_ok=True)
    (work_dir / 'extraction-report.json').write_text(json.dumps(report, indent=2), encoding='utf8')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('rom', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--apicula', type=Path, required=True)
    parser.add_argument('--work-dir', type=Path, required=True)
    arguments = parser.parse_args()
    report = export(arguments.rom, arguments.output, arguments.apicula, arguments.work_dir)
    print('Exported native Quake Badge effects 7/46; files:', len(report['files']))
