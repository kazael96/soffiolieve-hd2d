import importlib.util
from pathlib import Path
import json
from types import SimpleNamespace
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('finale_audio', ROOT/'tools/render-finale-audio.py')
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


class OriginalSilence(unittest.TestCase):
    def fixture(self):
        text = (ROOT/'src/finale-silent-audio.js').read_text(encoding='utf8')
        record = json.JSONDecoder().raw_decode(text.split('=', 1)[1])[0]['1017']
        return bytes.fromhex('c700e186008151808110c17f803094050000ffff'), SimpleNamespace(offset=0, volume=65), record

    def test_only_exact_original_rest_only_sequence_is_accepted(self):
        blob, entry, record = self.fixture()
        result = exporter.verified_silence(1017, blob, entry, record, record['sdatSHA256'])
        self.assertEqual(result, record)
        self.assertIsNot(result, record)
        self.assertNotIn('src', result)

    def test_empty_corrupt_or_unrelated_sources_cannot_be_masked_as_silence(self):
        blob, entry, record = self.fixture()
        for identifier, raw, original, sdat in [(1016, blob, entry, record['sdatSHA256']), (1017, b'', entry, record['sdatSHA256']), (1017, blob[:-1]+b'\0', entry, record['sdatSHA256']), (1017, blob, SimpleNamespace(offset=1, volume=65), record['sdatSHA256']), (1017, blob, SimpleNamespace(offset=0, volume=0), record['sdatSHA256']), (1017, blob, entry, 'unverified')]:
            with self.assertRaisesRegex(ValueError, 'Unverified'):
                exporter.verified_silence(identifier, raw, original, record, sdat)


if __name__ == '__main__':
    unittest.main()
