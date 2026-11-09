import hashlib
import importlib.util
import json
import re
import struct
from pathlib import Path
import tempfile
import unittest
from unittest import mock
import errno
import zipfile

spec = importlib.util.spec_from_file_location('build_site', Path(__file__).resolve().parents[1] / 'scripts/build-site.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class BuildTests(unittest.TestCase):
    def test_geographic_league_pack_keeps_direct_parent_images_and_explicit_material_patterns(self):
        with builder.build_staging() as folder:
            site = Path(folder)
            (site / 'assets').mkdir()
            for name, raw in [('gate.png', b'gate'), ('pressed.png', b'pressed')]:
                (site / 'assets' / name).write_bytes(raw)
            part = {'family': 'badgeGates', 'textures': {'gate': {'src': 'assets/gate.png'}}, 'extraImages': ['assets/pressed.png']}
            (site / 'league-badgeGates-assets.js').write_text('window.LEAGUE_PART_ASSETS=' + json.dumps(part) + ';', encoding='utf-8')
            manifest = {'families': {'badgeGates': {'src': 'league-badgeGates-assets.js', 'pack': 'assets/league-badgeGates-pack.bin'}}}
            (site / 'league-parts.js').write_text('window.LEAGUE_PARTS=' + json.dumps(manifest) + ';', encoding='utf-8')
            packs = builder.geographic_packs(site, 'league')
            self.assertEqual(packs['badgeGates']['images'], 2)
            raw = (site / packs['badgeGates']['pack']).read_bytes()
            count = struct.unpack_from('<I', raw, 4)[0]
            entries = json.loads(raw[8:8 + count])
            for name, (offset, size) in entries.items():
                self.assertEqual(raw[8 + count + offset:8 + count + offset + size], (site / name).read_bytes())

    def test_geographic_pack_rejects_manifest_escapes_and_missing_images(self):
        with builder.build_staging() as folder:
            site = Path(folder)
            with self.assertRaisesRegex(ValueError, 'prefix'):
                builder.geographic_packs(site, '../league')
            (site / 'assets').mkdir()
            (site / 'league-parts.js').write_text('window.LEAGUE_PARTS=' + json.dumps({'families': {'bad': {'src': '../foreign.js', 'pack': 'assets/league-bad-pack.bin'}}}) + ';', encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'path'):
                builder.geographic_packs(site, 'league')
            (site / 'league-parts.js').write_text('window.LEAGUE_PARTS=' + json.dumps({'families': {'bad': {'src': 'league-bad-assets.js', 'pack': 'assets/league-bad-pack.bin'}}}) + ';', encoding='utf-8')
            (site / 'league-bad-assets.js').write_text('window.LEAGUE_PART_ASSETS={"extraImages":["assets/missing.png"]};', encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'Missing pack image'):
                builder.geographic_packs(site, 'league')
            self.assertFalse((site / 'assets/league-bad-pack.bin').exists())

    def test_publish_renames_complete_tree_without_copying(self):
        with builder.build_staging() as folder:
            folder=Path(folder);site=folder/'staged';site.mkdir()
            (site/'asset.bin').write_bytes(b'original');target=folder/'published'
            with mock.patch.object(builder.shutil,'copytree',side_effect=AssertionError('Unnecessary full-tree copy')):
                self.assertEqual(builder.publish_staging(site,target),'rename')
            self.assertFalse(site.exists())
            self.assertEqual((target/'asset.bin').read_bytes(),b'original')

    def test_publish_rejects_existing_output_and_preserves_both_trees(self):
        with builder.build_staging() as folder:
            folder=Path(folder);site=folder/'staged';site.mkdir();target=folder/'verified';target.mkdir()
            (site/'asset.bin').write_bytes(b'candidate');(target/'asset.bin').write_bytes(b'verified')
            with self.assertRaisesRegex(ValueError,'already exists'):
                builder.publish_staging(site,target)
            self.assertEqual((target/'asset.bin').read_bytes(),b'verified')
            self.assertEqual((site/'asset.bin').read_bytes(),b'candidate')

    def test_publish_copies_only_across_volumes_without_sharing_mutable_files(self):
        with builder.build_staging() as folder:
            folder=Path(folder);site=folder/'staged';site.mkdir();(site/'asset.bin').write_bytes(b'payload');target=folder/'published'
            with mock.patch.object(Path,'rename',side_effect=OSError(errno.EXDEV,'Different volume')):
                self.assertEqual(builder.publish_staging(site,target),'copy')
            self.assertEqual((target/'asset.bin').read_bytes(),b'payload')
            (target/'asset.bin').write_bytes(b'edited')
            self.assertEqual((site/'asset.bin').read_bytes(),b'payload')

    def test_publish_does_not_mask_permission_failures_with_a_copy(self):
        with builder.build_staging() as folder:
            folder=Path(folder);site=folder/'staged';site.mkdir();target=folder/'published'
            with mock.patch.object(Path,'rename',side_effect=PermissionError(errno.EACCES,'Denied')),mock.patch.object(builder.shutil,'copytree',side_effect=AssertionError('Unexpected fallback')):
                with self.assertRaises(PermissionError):builder.publish_staging(site,target)
            self.assertTrue(site.is_dir());self.assertFalse(target.exists())

    def test_checksum_guard(self):
        with builder.build_staging() as folder:
            archive = Path(folder)/'bad.zip'
            archive.write_bytes(b'wrong release')
            with self.assertRaisesRegex(ValueError, 'SHA-256'):
                builder.build(archive,Path(folder)/'site')
            self.assertFalse((Path(folder)/'site').exists())

    def test_build_and_cache_version(self):
        with builder.build_staging() as folder:
            folder=Path(folder);archive=folder/'test.zip'
            with zipfile.ZipFile(archive,'w') as z:
                z.writestr('soffiolieve/assets/animated/800-front.png',b'test asset')
                z.writestr('soffiolieve/game.js','OLD RELEASE CODE')
                for name in re.findall(r'<script\s+src="([^"]+)"', (builder.ROOT/'src/index.html').read_text(encoding='utf8')):
                    if not (builder.ROOT/'src'/name).exists():z.writestr('soffiolieve/'+name,'/* base fixture */')
            original=builder.ARCHIVE_SHA256
            try:
                builder.ARCHIVE_SHA256=hashlib.sha256(archive.read_bytes()).hexdigest()
                target=folder/'site';builder.build(archive,target)
                self.assertEqual((target/'game.js').read_bytes(),(builder.ROOT/'src/game.js').read_bytes())
                manifest=json.loads((target/'build.json').read_text())
                html=(target/'index.html').read_text(encoding='utf-8')
                self.assertIn(f'app.js?v={manifest["revision"]}',html)
                self.assertIn(f'app.css?v={manifest["revision"]}',html)
                self.assertIn('game.js',manifest['startup']['scripts'])
                self.assertEqual(len(re.findall(r'<script src=',html)),1)
                pack=(target/'assets/field-pack.bin').read_bytes();self.assertEqual(pack[:4],b'SFP1');length=struct.unpack_from('<I',pack,4)[0];entries=json.loads(pack[8:8+length])
                for name,(offset,size) in entries.items():self.assertEqual(pack[8+length+offset:8+length+offset+size],(target/name).read_bytes())
                self.assertIn(f'data-build="{manifest["revision"]}"',html)
                self.assertEqual((target/'assets/animated/800-front.png').read_bytes(),b'test asset')
                for name, digest in manifest['files'].items():
                    self.assertEqual(hashlib.sha256((target/name).read_bytes()).hexdigest(),digest)
                for name, digest in manifest['assets'].items():
                    self.assertEqual(hashlib.sha256((target/name).read_bytes()).hexdigest(),digest)
                with self.assertRaisesRegex(ValueError,'already exists'):
                    builder.build(archive,target)
            finally:builder.ARCHIVE_SHA256=original

    def test_unsafe_archive(self):
        with builder.build_staging() as folder:
            folder=Path(folder);archive=folder/'unsafe.zip'
            with zipfile.ZipFile(archive,'w') as z:z.writestr('../escape','bad')
            original=builder.ARCHIVE_SHA256
            try:
                builder.ARCHIVE_SHA256=hashlib.sha256(archive.read_bytes()).hexdigest()
                with self.assertRaisesRegex(ValueError,'Unsafe archive'):
                    builder.build(archive,folder/'site')
                self.assertFalse((folder/'escape').exists())
            finally:builder.ARCHIVE_SHA256=original
