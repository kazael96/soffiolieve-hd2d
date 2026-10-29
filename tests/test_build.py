import hashlib
import importlib.util
import json
import re
import struct
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('build_site', Path(__file__).resolve().parents[1] / 'scripts/build-site.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class BuildTests(unittest.TestCase):
    def test_checksum_guard(self):
        with tempfile.TemporaryDirectory() as folder:
            archive = Path(folder)/'bad.zip'
            archive.write_bytes(b'wrong release')
            with self.assertRaisesRegex(ValueError, 'SHA-256'):
                builder.build(archive,Path(folder)/'site')
            self.assertFalse((Path(folder)/'site').exists())

    def test_build_and_cache_version(self):
        with tempfile.TemporaryDirectory() as folder:
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
        with tempfile.TemporaryDirectory() as folder:
            folder=Path(folder);archive=folder/'unsafe.zip'
            with zipfile.ZipFile(archive,'w') as z:z.writestr('../escape','bad')
            original=builder.ARCHIVE_SHA256
            try:
                builder.ARCHIVE_SHA256=hashlib.sha256(archive.read_bytes()).hexdigest()
                with self.assertRaisesRegex(ValueError,'Unsafe archive'):
                    builder.build(archive,folder/'site')
                self.assertFalse((folder/'escape').exists())
            finally:builder.ARCHIVE_SHA256=original
