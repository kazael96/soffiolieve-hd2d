"""Deterministic native-OAM partition for the two Minccino572 views.

Only generated build staging is writable. RAW native references are immutable;
the appended JSON has its own type/hash and never masquerades as ROM output.
"""
import copy
import hashlib
import json
from pathlib import Path
import struct

PROVENANCE = 'assets/animated/572-tail-partition064.provenance.json'
REFERENCES = {
    'back': {
        'jsonSHA256': '20b3fdd73888941c8db3065bfc767418a5b6f035e1920d09ce9e842555a4ea05',
        'pngSHA256': '6c353c250af5711ad4bd49117867fd692932ef1cec47013d58edd2cac7c00063',
        'cell': 7, 'track': 7, 'cells': 12, 'tracks': 24,
        'mobileImages': [19], 'staticImages': [20, 21, 22, 23],
        'kind': 'native572-back-cell7-oam-partition/v1',
        'pilotSHA256': 'a17c6446e73e4763da11ddc5493756808dd49d5481362622e29e54d48c525d74',
    },
    'front': {
        'jsonSHA256': 'fca062a9388a440881ff23f66519b438a5c1f12f4f6e35e49449b0399aa31767',
        'pngSHA256': '578893250125ee8ed35b7094369aa36f3ea1f40bb1f5f6b1f658ee997c902bd6',
        'cell': 12, 'track': 10, 'cells': 14, 'tracks': 24,
        'mobileImages': [20, 21], 'staticImages': [22, 23],
        'kind': 'native572-front-cell12-oam-partition/v1',
        'pilotSHA256': '2f8a09eabe2c378df3c43dbd58422d5d2bde3f088292f35d33fc51024d6ed5ed',
    },
}


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def encoded(data):
    return (json.dumps(data, ensure_ascii=True, separators=(',', ':'), allow_nan=False) + '\n').encode('utf-8')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def partition(view, original):
    """The exact two pilot recipes, no coordinates/art/clock modifications."""
    r = REFERENCES[view]
    require(list(original) == ['cells', 'images', 'animations', 'maps', 'parent'], 'Native JSON fields changed')
    require([len(original[k]) for k in ['cells', 'animations', 'maps']] == [r['cells'], r['tracks'], 2], 'Native counts changed')
    cell = original['cells'][r['cell']]
    images = r['mobileImages'] + r['staticImages']
    require([o[4] for o in cell] == images, 'Native OAM order changed')
    require(sum(row[0] == r['track'] for row in original['maps'][0]) == 1, 'Native track row is not unique')
    n = len(r['mobileImages'])
    if view == 'back':
        require(cell[0][1] + cell[0][3] == -6 and all(o[1] >= -6 for o in cell[1:]), 'BACK partition boundary changed')
    else:
        require(all(o[1] + o[3] == 2 for o in cell[:n]) and all(o[1] == 2 for o in cell[n:]), 'FRONT partition boundary changed')
    data = copy.deepcopy(original)
    data['cells'].extend(copy.deepcopy([cell[:n], cell[n:]]))
    for cel in [r['cells'], r['cells'] + 1]:
        data['animations'].append({'loop': 0, 'mode': 2, 'frames': [[cel, 1, 0, 4096, 4096, 0, 0]]})
    rows = []
    for row in original['maps'][0]:
        rows.extend([[r['tracks'], *row[1:]], [r['tracks'] + 1, *row[1:]]] if row[0] == r['track'] else [copy.deepcopy(row)])
    data['maps'].append(rows)
    require(data['cells'][r['cells']] + data['cells'][r['cells'] + 1] == cell, 'Partition loses or changes OAM')
    return data


def validate_inverse(view, data, original):
    r = REFERENCES[view]
    expected = partition(view, original)
    require(data == expected and encoded(data) == encoded(expected), 'Derived suffix/map or native prefix changed')
    inverse = copy.deepcopy(data)
    inverse['cells'] = inverse['cells'][:r['cells']]
    inverse['animations'] = inverse['animations'][:r['tracks']]
    inverse['maps'] = inverse['maps'][:2]
    require(inverse == original and encoded(inverse) == encoded(original), 'Strict native structural inverse failed')
    return inverse


def derive(view, raw, png):
    r = REFERENCES[view]
    require(sha(raw) == r['jsonSHA256'], 'Original native JSON RAW mismatch: ' + view)
    require(sha(png) == r['pngSHA256'], 'Original native PNG RAW mismatch: ' + view)
    require(png[:8] == b'\x89PNG\r\n\x1a\n' and struct.unpack('>II', png[16:24]) == (512, 256), 'Native atlas dimensions changed')
    original = json.loads(raw.decode('utf-8', errors='strict'))
    data = partition(view, original)
    validate_inverse(view, data, original)
    result = encoded(data)
    record = {
        'kind': r['kind'], 'relative': 'assets/animated/572-' + view + '.json',
        'originalNativeJSONRawSHA256': r['jsonSHA256'], 'originalNativePNGRawSHA256': r['pngSHA256'],
        'derivedJSONRawSHA256': sha(result), 'derivedBytes': len(result),
        'originalStructuralSHA256': sha(encoded(original)), 'derivedStructuralSHA256': sha(encoded(data)),
        'pilotSHA256': r['pilotSHA256'],
        'appendedCells': [r['cells'], r['cells'] + 1], 'appendedTracks': [r['tracks'], r['tracks'] + 1], 'appendedMap': 2,
        'mobileImages': r['mobileImages'], 'staticImages': r['staticImages'],
        'strictStructuralInverse': True, 'nativeDefaultMaps01Unchanged': True,
        'nativeImagesParentTracksAndCellsPrefixUnchanged': True, 'atlasBytesUnchanged': True,
    }
    return result, record


def derive_site(site):
    """Called once inside a fresh normal builder staging, before packs/hash."""
    site = Path(site)
    provenance = site / PROVENANCE
    require(not provenance.exists(), 'Derived provenance already exists; fresh native staging required')
    pending = []
    for view in ['back', 'front']:
        file = site / ('assets/animated/572-' + view + '.json')
        png = file.with_suffix('.png')
        require(file.is_file() and png.is_file() and not file.is_symlink() and not png.is_symlink(), 'Missing/nonregular original native inputs: ' + view)
        raw, image = file.read_bytes(), png.read_bytes()
        derived, record = derive(view, raw, image)
        pending.append((file, raw, png, image, derived, record))
    proof = {
        'schema': 1, 'kind': 'native572-two-view-oam-partition/build-v1',
        'generatorSHA256': sha(Path(__file__).read_bytes()),
        'serialization': 'UTF-8 compact JSON, original key order, LF terminal newline',
        'records': [z[5] for z in pending],
        'scope': 'Native OAM partition only; no new atlas, art, score, timing or motion approval',
    }
    # Validate BOTH views before any mutation of exclusively owned staging.
    for file, raw, png, image, derived, record in pending:
        require(file.read_bytes() == raw and png.read_bytes() == image, 'Native staging input changed before write')
    for file, raw, png, image, derived, record in pending:
        file.write_bytes(derived)
        require(file.read_bytes() == derived and png.read_bytes() == image, 'Derived write or native PNG preservation failed')
    provenance.write_bytes(encoded(proof))
    assets = {z[5]['relative']: sha(z[4]) for z in pending}
    assets[PROVENANCE] = sha(provenance.read_bytes())
    return {'provenance': PROVENANCE, 'assets': assets, 'views': [z[5]['kind'] for z in pending]}
