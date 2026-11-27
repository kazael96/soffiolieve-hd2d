"""Small real-input derivation/build tests; no raster, ROM read or full build.

Default: four frozen original test fixtures; SOFF_NATIVE572_ORIGINAL_SITE may
select another always-RAW-validated original site. A derived candidate is NOT original.
"""
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest import mock
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def module(name, file):
    spec = importlib.util.spec_from_file_location(name, file)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value


helper = module('native572_tail_test_helper', ROOT / 'scripts/native572_tail064.py')
builder = module('native572_tail_test_builder', ROOT / 'scripts/build-site.py')


def originals():
    selected = os.environ.get('SOFF_NATIVE572_ORIGINAL_SITE')
    site = Path(selected) if selected else ROOT / 'tests/fixtures/native572-original064'
    return {view: ((site / ('assets/animated/572-' + view + '.json')).read_bytes(),
                   (site / ('assets/animated/572-' + view + '.png')).read_bytes())
            for view in ['back', 'front']}


def populate(site, inputs):
    folder = site / 'assets/animated'
    folder.mkdir(parents=True, exist_ok=True)
    for view, (raw, png) in inputs.items():
        (folder / ('572-' + view + '.json')).write_bytes(raw)
        (folder / ('572-' + view + '.png')).write_bytes(png)


class Native572DerivationTests(unittest.TestCase):
    def test_production_qa_and_pages_build_the_same_partitioned_assets(self):
        # A working local flagged build is insufficient when CI or Pages would
        # silently deploy the original unpartitioned native banks instead.
        expected = 'run: python3 scripts/build-site.py site.zip _site --native572-tail-partition064'
        windows_expected = 'run: python scripts/build-site.py site.zip _site --native572-tail-partition064'
        for name in ['qa.yml', 'pages.yml']:
            with self.subTest(workflow=name):
                text = (ROOT / '.github/workflows' / name).read_text(encoding='utf-8')
                commands = [line.strip() for line in text.splitlines() if 'run:' in line and 'scripts/build-site.py' in line]
                self.assertEqual(commands, [expected, windows_expected, expected] if name == 'qa.yml' else [expected])
                if name == 'qa.yml':
                    expected_jobs = {'regression': [expected], 'native541-windows': [windows_expected],
                                     'native541-linux': [expected]}
                    current_job, actual_jobs = None, {}
                    for line in text.splitlines():
                        if line.startswith('  ') and not line.startswith('   ') and line.rstrip().endswith(':'):
                            current_job = line.strip()[:-1]
                        if 'run:' in line and 'scripts/build-site.py' in line:
                            self.assertIn(current_job, expected_jobs)
                            actual_jobs.setdefault(current_job, []).append(line.strip())
                    self.assertEqual(actual_jobs, expected_jobs)

    def test_exact_prefix_inverse_all_oam_and_png_bytes(self):
        for view, (raw, png) in originals().items():
            with self.subTest(view=view):
                out, record = helper.derive(view, raw, png)
                original, derived = json.loads(raw), json.loads(out)
                r = helper.REFERENCES[view]
                self.assertEqual(helper.validate_inverse(view, derived, original), original)
                self.assertEqual(derived['cells'][:r['cells']], original['cells'])
                self.assertEqual(derived['animations'][:r['tracks']], original['animations'])
                self.assertEqual(derived['maps'][:2], original['maps'])
                self.assertEqual(derived['images'], original['images'])
                self.assertEqual(derived['parent'], original['parent'])
                self.assertEqual(derived['cells'][-2] + derived['cells'][-1], original['cells'][r['cell']])
                self.assertEqual(record['derivedJSONRawSHA256'], hashlib.sha256(out).hexdigest())
                self.assertEqual(record['originalNativeJSONRawSHA256'], hashlib.sha256(raw).hexdigest())
                self.assertEqual(record['originalNativePNGRawSHA256'], hashlib.sha256(png).hexdigest())
                self.assertNotEqual(record['derivedJSONRawSHA256'], record['originalNativeJSONRawSHA256'])
                self.assertEqual(helper.derive(view, raw, png)[0], out)

    def test_raw_native_guards_reject_json_png_and_view_substitution(self):
        data = originals()
        for view, (raw, png) in data.items():
            with self.subTest(view=view):
                with self.assertRaisesRegex(ValueError, 'JSON RAW mismatch'):
                    helper.derive(view, raw + b' ', png)
                with self.assertRaisesRegex(ValueError, 'PNG RAW mismatch'):
                    helper.derive(view, raw, png + b'x')
                other = 'front' if view == 'back' else 'back'
                with self.assertRaisesRegex(ValueError, 'JSON RAW mismatch'):
                    helper.derive(view, *data[other])

    def test_inverse_rejects_suffix_native_map_oam_and_extra_fields(self):
        for view, (raw, png) in originals().items():
            out, _ = helper.derive(view, raw, png)
            original, derived = json.loads(raw), json.loads(out)
            for mutation in ['suffix', 'native', 'map', 'extra', 'bool']:
                with self.subTest(view=view, mutation=mutation):
                    value = copy.deepcopy(derived)
                    if mutation == 'suffix': value['cells'][-1][0][0] += 1
                    elif mutation == 'native': value['images'][0][0] += 1
                    elif mutation == 'map': value['maps'][2][0][1] += 1
                    elif mutation == 'extra': value['unlisted'] = True
                    else: value['animations'][-1]['loop'] = False
                    with self.assertRaisesRegex(ValueError, 'Derived suffix/map or native prefix changed'):
                        helper.validate_inverse(view, value, original)

    def test_site_provenance_two_view_prevalidation_no_reencode(self):
        inputs = originals()
        with tempfile.TemporaryDirectory() as folder:
            site = Path(folder); populate(site, inputs)
            result = helper.derive_site(site)
            proof = json.loads((site / helper.PROVENANCE).read_text(encoding='utf-8'))
            self.assertEqual(set(result['assets']), {helper.PROVENANCE, 'assets/animated/572-back.json', 'assets/animated/572-front.json'})
            self.assertEqual([r['kind'] for r in proof['records']], [helper.REFERENCES[v]['kind'] for v in ['back', 'front']])
            for view, (_, png) in inputs.items():
                self.assertEqual((site / ('assets/animated/572-' + view + '.png')).read_bytes(), png)
            for name, digest in result['assets'].items():
                self.assertEqual(helper.sha((site / name).read_bytes()), digest)
            with self.assertRaisesRegex(ValueError, 'already exists'):
                helper.derive_site(site)
        for fault in ['missing', 'corrupt']:
            with self.subTest(fault=fault), tempfile.TemporaryDirectory() as folder:
                site = Path(folder); populate(site, inputs)
                front = site / 'assets/animated/572-front.json'
                if fault == 'missing': front.unlink()
                else: front.write_bytes(inputs['front'][0] + b' ')
                with self.assertRaises((ValueError, FileNotFoundError)):
                    helper.derive_site(site)
                self.assertEqual((site / 'assets/animated/572-back.json').read_bytes(), inputs['back'][0])
                self.assertFalse((site / helper.PROVENANCE).exists())

    def test_normal_builder_flag_on_off_minimal_real_snapshot(self):
        inputs = originals()
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder); source = root / 'src'; source.mkdir()
            (source / 'index.html').write_text('<html lang="it"><script src="game.js"></script></html>', encoding='utf-8', newline='\n')
            (source / 'game.js').write_text('window.MINIMAL_BUILD_ONLY=true;\n', encoding='utf-8', newline='\n')
            (source / 'menu-assets.js').write_text('window.MENU_ASSETS={"pokemonIcons":{}};\n', encoding='utf-8', newline='\n')
            (source / 'pokedex-assets.js').write_text('window.POKEDEX_ASSETS={"font":{}};\n', encoding='utf-8', newline='\n')
            for name in ['battle-ui', 'battle-party']:
                p = source / ('assets/' + name); p.mkdir(parents=True)
                (p / 'provenance.json').write_text('{}\n', encoding='utf-8', newline='\n')
            archive = root / 'base.zip'
            with zipfile.ZipFile(archive, 'w') as z:
                z.writestr('soffiolieve/assets/animated/800-front.png', b'BUILDER_COMPLETENESS_SENTINEL_NOT_A_RASTER')
                for view, (raw, png) in inputs.items():
                    z.writestr('soffiolieve/assets/animated/572-' + view + '.json', raw)
                    z.writestr('soffiolieve/assets/animated/572-' + view + '.png', png)
            digest = helper.sha(archive.read_bytes())
            with mock.patch.object(builder, 'ROOT', root), mock.patch.object(builder, 'ARCHIVE_SHA256', digest):
                builder.build(archive, root / 'off')
                builder.build(archive, root / 'on', native572_tail_partition=True)
            off, on = root / 'off', root / 'on'
            before = json.loads((off / 'build.json').read_text(encoding='utf-8'))
            after = json.loads((on / 'build.json').read_text(encoding='utf-8'))
            self.assertNotIn('native572TailPartition', before)
            self.assertIn('native572TailPartition', after)
            self.assertNotEqual(before['revision'], after['revision'])
            self.assertEqual(before['files']['app.js'], after['files']['app.js'])
            for view, (raw, png) in inputs.items():
                name = 'assets/animated/572-' + view + '.json'
                self.assertEqual((off / name).read_bytes(), raw)
                self.assertEqual((on / name).read_bytes(), helper.derive(view, raw, png)[0])
                self.assertEqual((on / name.replace('.json', '.png')).read_bytes(), png)
            self.assertEqual(set(after['assets']) - set(before['assets']), set(after['native572TailPartition']['assets']))
            for name, digest in after['assets'].items():
                self.assertEqual(helper.sha((on / name).read_bytes()), digest)
            self.assertEqual((off / 'assets/field-pack.bin').read_bytes(), (on / 'assets/field-pack.bin').read_bytes())
            self.assertEqual((off / 'assets/battle-ui-pack.bin').read_bytes(), (on / 'assets/battle-ui-pack.bin').read_bytes())
            # Use the ACTUAL selected runtime, not a fabricated marker/proof.
            runtime_minccino = (ROOT / 'src/minccino-moves.js').read_text(encoding='utf-8')
            self.assertIn('private-native-tail-SPA163/v1', runtime_minccino)
            (source / 'minccino-moves.js').write_text(runtime_minccino, encoding='utf-8', newline='\n')
            with mock.patch.object(builder, 'ROOT', root), mock.patch.object(builder, 'ARCHIVE_SHA256', helper.sha(archive.read_bytes())):
                with mock.patch.object(builder.hashlib, 'file_digest', wraps=builder.hashlib.file_digest) as archive_hash, mock.patch.object(builder, 'build_staging', wraps=builder.build_staging) as staging:
                    with self.assertRaisesRegex(ValueError, 'Native M3 tail requires --native572-tail-partition064'):
                        builder.build(archive, root / 'tail-without-flag')
                    archive_hash.assert_not_called()
                    staging.assert_not_called()
                self.assertFalse((root / 'tail-without-flag').exists())
                builder.build(archive, root / 'tail-with-flag', native572_tail_partition=True)
            tail = json.loads((root / 'tail-with-flag/build.json').read_text(encoding='utf-8'))
            self.assertIn('native572TailPartition', tail)
            for view, (raw, png) in inputs.items():
                self.assertEqual((root / ('tail-with-flag/assets/animated/572-' + view + '.json')).read_bytes(), helper.derive(view, raw, png)[0])
                self.assertEqual((root / ('tail-with-flag/assets/animated/572-' + view + '.png')).read_bytes(), png)
            # The real builder must fail a flagged missing/corrupt input, no skip.
            for fault in ['missing', 'corrupt']:
                bad = root / (fault + '.zip')
                with zipfile.ZipFile(archive) as z, zipfile.ZipFile(bad, 'w') as w:
                    for name in z.namelist():
                        raw = z.read(name)
                        if name.endswith('572-front.json'):
                            if fault == 'missing': continue
                            raw += b' '
                        w.writestr(name, raw)
                with mock.patch.object(builder, 'ROOT', root), mock.patch.object(builder, 'ARCHIVE_SHA256', helper.sha(bad.read_bytes())):
                    with self.assertRaises((ValueError, FileNotFoundError)):
                        builder.build(bad, root / ('failed-' + fault), native572_tail_partition=True)
                self.assertFalse((root / ('failed-' + fault)).exists())


if __name__ == '__main__':
    unittest.main()
