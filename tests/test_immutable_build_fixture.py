"""Storage contracts for the genuine, full-source builder regression fixture."""
from contextlib import contextmanager
import os
from pathlib import Path
import shutil
import stat
from types import SimpleNamespace
import unittest
from unittest import mock
import uuid

from helpers.immutable_build_fixture import (
    immutable_build_fixture, _readonly, _unlink_generated_file,
)


class ImmutableBuildFixtureTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(__file__).resolve().parents[1] / '.build-tmp' / ('fixture-contract-' + uuid.uuid4().hex)
        self.root.mkdir(parents=True)
        self.source = self.root / 'src'
        self.source.mkdir()
        self.reference = self.root / 'reference'
        self.reference.mkdir()
        self.stages = []

        @contextmanager
        def staging():
            folder = self.root / ('stage-' + uuid.uuid4().hex)
            folder.mkdir()
            self.stages.append(folder)
            try:
                yield folder
            finally:
                # Intentionally the ordinary builder cleanup, without chmod.
                # The helper has to unlink any readonly generated entries first.
                shutil.rmtree(folder)

        self.builder = SimpleNamespace(ROOT=self.root, build_staging=staging)

    def tearDown(self):
        # Only this test's named, resolved, private directory is eligible.
        expected = Path(__file__).resolve().parents[1] / '.build-tmp'
        self.assertEqual(self.root.resolve().parent, expected.resolve())
        self.assertTrue(self.root.name.startswith('fixture-contract-'))
        for folder, _, files in os.walk(self.root):
            for name in files:
                entry = Path(folder) / name
                if _readonly(entry):
                    _unlink_generated_file(entry)
        shutil.rmtree(self.root)

    def file(self, root, relative, data, readonly=False):
        result = root / relative
        result.parent.mkdir(parents=True, exist_ok=True)
        result.write_bytes(data)
        if readonly:
            result.chmod(stat.S_IRUSR | stat.S_IRGRP | stat.S_IROTH)
        return result

    def test_identical_readonly_peer_shares_only_generated_storage(self):
        source = self.file(self.source, 'assets/sprite.png', b'native pixels')
        peer = self.file(self.reference, 'assets/sprite.png', b'native pixels', True)
        with immutable_build_fixture(self.builder, self.reference) as receipt:
            with self.builder.build_staging() as stage:
                output = stage / 'sprite.png'
                self.assertEqual(shutil.copyfile(source, output), str(output))
                self.assertTrue(os.path.samefile(peer, output))
                self.assertFalse(os.path.samefile(source, output))
                self.assertTrue(_readonly(output))
                source.write_bytes(b'edited source')
                self.assertEqual(output.read_bytes(), b'native pixels')
            self.assertFalse(stage.exists())
            self.assertEqual(receipt['linkedCopies'], 1)
        self.assertTrue(_readonly(peer))
        self.assertEqual(peer.read_bytes(), b'native pixels')

    def test_same_size_different_bytes_and_writable_peers_are_independent(self):
        for name, src_data, ref_data, readonly in [
                ('different.js', b'NEW!', b'OLD!', True),
                ('mutable.css', b'same', b'same', False)]:
            source = self.file(self.source, name, src_data)
            peer = self.file(self.reference, name, ref_data, readonly)
            with immutable_build_fixture(self.builder, self.reference) as receipt:
                with self.builder.build_staging() as stage:
                    output = stage / name
                    shutil.copyfile(source, output)
                    self.assertFalse(os.path.samefile(peer, output))
                    self.assertFalse(os.path.samefile(source, output))
                    self.assertEqual(output.read_bytes(), src_data)
                    output.write_bytes(b'output edit')
                    self.assertEqual(source.read_bytes(), src_data)
                    self.assertEqual(peer.read_bytes(), ref_data)
                self.assertEqual(receipt['linkedCopies'], 0)

    def test_computed_pack_bytes_are_compared_then_changed_write_detaches(self):
        peer = self.file(self.reference, 'assets/field-pack.bin', b'SFP1computed', True)
        with immutable_build_fixture(self.builder, self.reference) as receipt:
            with self.builder.build_staging() as stage:
                output = stage / 'site/assets/field-pack.bin'
                output.parent.mkdir(parents=True)
                self.assertEqual(output.write_bytes(b'SFP1computed'), 12)
                self.assertTrue(os.path.samefile(peer, output))
                self.assertEqual(output.write_bytes(b'SFP1changed!'), 12)
                self.assertFalse(os.path.samefile(peer, output))
                self.assertEqual(output.read_bytes(), b'SFP1changed!')
                self.assertEqual(peer.read_bytes(), b'SFP1computed')
                self.assertTrue(_readonly(peer))
            self.assertEqual(receipt['linkedPacks'], 1)
            self.assertEqual(receipt['detachedWrites'], 1)

    def test_changed_source_copy_detaches_previous_peer(self):
        source = self.file(self.source, 'game.js', b'original')
        peer = self.file(self.reference, 'game.js', b'original', True)
        with immutable_build_fixture(self.builder, self.reference) as receipt:
            with self.builder.build_staging() as stage:
                output = stage / 'game.js'
                shutil.copyfile(source, output)
                self.assertTrue(os.path.samefile(peer, output))
                source.write_bytes(b'revised!')
                shutil.copyfile(source, output)
                self.assertEqual(output.read_bytes(), b'revised!')
                self.assertFalse(os.path.samefile(peer, output))
                self.assertEqual(peer.read_bytes(), b'original')
            self.assertEqual(receipt['detachedWrites'], 1)

    def test_nested_publish_cleans_readonly_names_before_each_original_cleanup(self):
        source = self.file(self.source, 'assets/a.png', b'image')
        peer = self.file(self.reference, 'assets/a.png', b'image', True)
        with immutable_build_fixture(self.builder, self.reference):
            with self.builder.build_staging() as outer:
                with self.builder.build_staging() as inner:
                    site = inner / 'site'
                    site.mkdir()
                    shutil.copyfile(source, site / 'a.png')
                    # Preserve the real regression's deliberately non-native ZIP asset.
                    self.file(site, 'assets/animated/800-front.png', b'test asset')
                    site.rename(outer / 'site')
                self.assertFalse(inner.exists())
                self.assertEqual((outer / 'site/assets/animated/800-front.png').read_bytes(), b'test asset')
                self.assertTrue(os.path.samefile(peer, outer / 'site/a.png'))
            self.assertFalse(outer.exists())
        self.assertTrue(peer.exists())
        self.assertTrue(_readonly(peer))

    def test_exception_restores_library_functions_and_cleans_generated_links(self):
        source = self.file(self.source, 'a.js', b'code')
        peer = self.file(self.reference, 'a.js', b'code', True)
        original = (self.builder.build_staging, shutil.copyfile, Path.write_bytes)
        with self.assertRaisesRegex(RuntimeError, 'intentional interruption'):
            with immutable_build_fixture(self.builder, self.reference):
                with self.builder.build_staging() as stage:
                    shutil.copyfile(source, stage / 'a.js')
                    raise RuntimeError('intentional interruption')
        self.assertEqual((self.builder.build_staging, shutil.copyfile, Path.write_bytes), original)
        self.assertTrue(all(not stage.exists() for stage in self.stages))
        self.assertTrue(_readonly(peer))
        self.assertEqual(peer.read_bytes(), b'code')

    def test_missing_site_environment_leaves_original_behavior_and_functions(self):
        original = (self.builder.build_staging, shutil.copyfile, Path.write_bytes)
        with mock.patch.dict(os.environ, {}, clear=True):
            with immutable_build_fixture(self.builder) as receipt:
                self.assertFalse(receipt['enabled'])
                self.assertEqual((self.builder.build_staging, shutil.copyfile, Path.write_bytes), original)
        self.assertEqual((self.builder.build_staging, shutil.copyfile, Path.write_bytes), original)

    def test_destination_outside_owned_stage_is_not_shared_or_removed(self):
        source = self.file(self.source, 'a.js', b'code')
        peer = self.file(self.reference, 'a.js', b'code', True)
        outside = self.root / 'ordinary-output.js'
        with immutable_build_fixture(self.builder, self.reference):
            with self.builder.build_staging():
                shutil.copyfile(source, outside)
                self.assertFalse(os.path.samefile(peer, outside))
        self.assertEqual(outside.read_bytes(), b'code')

    def test_source_reference_inode_alias_is_rejected_without_attribute_changes(self):
        source = self.file(self.source, 'a.js', b'code')
        peer = self.reference / 'a.js'
        os.link(source, peer)
        peer.chmod(stat.S_IRUSR | stat.S_IRGRP | stat.S_IROTH)
        with immutable_build_fixture(self.builder, self.reference):
            with self.builder.build_staging() as stage:
                with self.assertRaisesRegex(ValueError, 'source shares'):
                    shutil.copyfile(source, stage / 'a.js')
        self.assertTrue(_readonly(source))
        self.assertTrue(_readonly(peer))
        self.assertEqual(source.read_bytes(), b'code')

    def test_source_directory_cannot_be_reference(self):
        with self.assertRaisesRegex(ValueError, 'editable source'):
            with immutable_build_fixture(self.builder, self.source):
                self.fail('Unsafe reference unexpectedly accepted')


if __name__ == '__main__':
    unittest.main()
