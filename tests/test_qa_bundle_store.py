import hashlib
import importlib.util
from pathlib import Path
import stat
import shutil
import unittest
import uuid
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('qa_bundle_store', Path(__file__).parents[1]/'scripts/qa_bundle_store.py')
store_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(store_module)


class BundleStoreTests(unittest.TestCase):
    def setUp(self):
        temp_parent = Path(__file__).parents[1].resolve()/'test-results'
        temp_parent.mkdir(exist_ok=True)
        if temp_parent.is_symlink() or temp_parent.resolve() != temp_parent:
            raise ValueError('Test workspace must not traverse links')
        # Python3.13 mkdir(mode=0700), used by mkdtemp on Windows, installs an
        # owner-only ACL that excludes a restricted execution token. Inherit
        # the verified workspace ACL instead, as ordinary QA directories do.
        self.root = temp_parent/('bundle-store064-'+uuid.uuid4().hex)
        self.root.mkdir()
        if self.root.parent != temp_parent:
            raise ValueError('Temporary cleanup must stay inside the test workspace')
        self.store = self.root/'store'
        self.destination = self.root/'overlay-app.js'
        self.payload = b'/* transport */\nconst nativeText="\xc3\xa8";\n'

    def tearDown(self):
        for path in self.root.rglob('*'):
            if path.is_file():
                path.chmod(stat.S_IREAD | stat.S_IWRITE)
        if self.root.resolve().parent != self.root.parent:
            raise ValueError('Refusing cleanup through a linked workspace')
        shutil.rmtree(self.root)

    def test_first_publication_preserves_exact_bytes_and_shared_identity(self):
        proof = store_module.publish_bundle(self.payload, self.destination, self.store)
        blob = Path(proof['blob'])
        self.assertTrue(proof['created'])
        self.assertEqual(self.destination.read_bytes(), self.payload)
        self.assertEqual(proof['sha256'], hashlib.sha256(self.payload).hexdigest())
        self.assertTrue(self.destination.samefile(blob))
        self.assertFalse(blob.stat().st_mode & stat.S_IWRITE)

    def test_reuse_adds_path_without_another_payload_copy(self):
        first = store_module.publish_bundle(self.payload, self.destination, self.store)
        second_path = self.root/'second-app.js'
        second = store_module.publish_bundle(self.payload, second_path, self.store)
        self.assertFalse(second['created'])
        self.assertEqual(first['blob'], second['blob'])
        self.assertTrue(second_path.samefile(self.destination))
        self.assertEqual(len(list(self.store.iterdir())), 1)

    def test_changed_payload_gets_separate_immutable_content(self):
        first = store_module.publish_bundle(self.payload, self.destination, self.store)
        second = store_module.publish_bundle(self.payload+b'changed', self.root/'new.js', self.store)
        self.assertNotEqual(first['blob'], second['blob'])
        self.assertEqual(self.destination.read_bytes(), self.payload)

    def test_existing_fixture_is_never_replaced(self):
        self.destination.write_bytes(b'historical evidence')
        with self.assertRaises(FileExistsError):
            store_module.publish_bundle(self.payload, self.destination, self.store)
        self.assertEqual(self.destination.read_bytes(), b'historical evidence')

    def test_corrupt_cache_is_preserved_and_refused(self):
        self.store.mkdir()
        blob = self.store/(hashlib.sha256(self.payload).hexdigest()+'.js')
        blob.write_bytes(b'incomplete older write')
        blob.chmod(stat.S_IREAD)
        with self.assertRaisesRegex(ValueError, 'content verification'):
            store_module.publish_bundle(self.payload, self.destination, self.store)
        self.assertFalse(self.destination.exists())
        self.assertEqual(blob.read_bytes(), b'incomplete older write')

    def test_link_error_is_not_hidden_by_copying_another_payload(self):
        with patch.object(store_module.os, 'link', side_effect=OSError('no hard-link support')):
            with self.assertRaisesRegex(OSError, 'no hard-link'):
                store_module.publish_bundle(self.payload, self.destination, self.store)
        self.assertFalse(self.destination.exists())
        self.assertEqual(len(list(self.store.iterdir())), 1)


if __name__ == '__main__':
    unittest.main()
