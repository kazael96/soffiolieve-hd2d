import importlib.util
from pathlib import Path
import struct
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('trainer_music', ROOT / 'tools/extract-trainer-intro-music.py')
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)


class TrainerMusicTable(unittest.TestCase):
    def fixture(self, rows):
        base = 0x2029000
        raw = bytearray(0x2000)
        pointer = base + 0x1000
        struct.pack_into('<III', raw, 0x2029dcc-base, pointer, pointer+2, 1114)
        for i, row in enumerate(rows):
            struct.pack_into('<HH', raw, pointer-base+i*4, *row)
        return raw, base

    def test_native_lookup_stops_at_sentinel_and_keeps_default(self):
        raw, base = self.fixture([(70,1117),(71,1117),(105,0),(2,1114)])
        result = reader.read_table(raw, base)
        self.assertEqual(result['classMusic'], {'70':1117,'71':1117})
        self.assertEqual(result['fallback'],1114)

    def test_corrupt_rows_missing_sentinel_and_external_pointers_are_rejected(self):
        for rows in [[(70,1117),(70,1117)],[(70,999)],[(106,1117)]]:
            raw,base=self.fixture(rows)
            with self.assertRaises(ValueError): reader.read_table(raw,base)
        raw,base=self.fixture([(105,0)])
        struct.pack_into('<II',raw,0x2029dcc-base,base+len(raw)+4,base+len(raw)+6)
        with self.assertRaisesRegex(ValueError,'outside ARM9'): reader.read_table(raw,base)


if __name__ == '__main__':
    unittest.main()
