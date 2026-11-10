import importlib.util
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
spec = importlib.util.spec_from_file_location('slide_effects', ROOT / 'tools/extract-league-slide-effects.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SlidePaletteTests(unittest.TestCase):
    def test_native_aliases_share_a_nonempty_span(self):
        result = module.palette_ranges([('a', 0), ('b', 0), ('c', 0), ('d', 0)], 556, 16, 572)
        self.assertEqual(result, {name: (556, 572) for name in 'abcd'})

    def test_next_distinct_offset_bounds_each_palette(self):
        result = module.palette_ranges([('last', 2), ('first', 0), ('alias', 0), ('middle', 1)], 64, 24, 88)
        self.assertEqual(result, {'last': (80, 88), 'first': (64, 72), 'alias': (64, 72), 'middle': (72, 80)})

    def test_invalid_offsets_lengths_and_duplicate_names_are_rejected(self):
        for entries, start, length, total in [([('a', 2)], 64, 16, 80), ([('a', -1)], 64, 16, 80), ([('a', 0)], 64, 24, 80), ([('a', 0)], 64, 0, 80), ([('a', 0), ('a', 1)], 64, 16, 80), ([('a', 0.5)], 64, 16, 80)]:
            with self.subTest(entries=entries, length=length):
                with self.assertRaises(ValueError):
                    module.palette_ranges(entries, start, length, total)


if __name__ == '__main__':
    unittest.main()
