import copy
import importlib.util
from pathlib import Path
import struct
import sys
from types import SimpleNamespace
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, ROOT / 'tools' / file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


gym = load('league_gym', 'extract-league-gym.py')
geo = load('league_geography', 'export-league-scenes.py')


class LeagueGeometryTests(unittest.TestCase):
    def test_original_animation_header_keeps_native_duration_separate_from_converter(self):
        # Captured IRBI a/1/6/2:4 header through duration (not a complete animation).
        raw = bytes.fromhex('42 43 41 30 ff fe 01 00 c4 05 00 00 10 00 01 00 14 00 00 00 4a 4e 54 30 b0 05 00 00 00 01 28 00 08 00 10 00 7f 01 00 00 66 00 01 00 04 00 08 00 30 00 00 00 69 6e 33 31 5f 75 65 5f 72 6e 65 63 6b 00 00 00 4a 00 41 43 51 00 04 00')
        result = gym.native_track(raw)
        self.assertEqual((result['name'], result['nativeFrames'], result['format']), ('in31_ue_rneck', 81, 'BCA0'))
        with self.assertRaises((ValueError, struct.error, IndexError)):
            gym.native_track(raw[:48])
        with self.assertRaises(ValueError):
            gym.native_track(b'BTP0' + raw[4:])
        with self.assertRaises(ValueError):
            gym.native_track(raw[:-4] + bytes(4))

    def test_native_tables_are_bounded_and_unknown_overlay_is_rejected(self):
        overlay = SimpleNamespace(ramAddress=100, data=struct.pack('<4i', -1, 2, 3, -4))
        self.assertEqual(gym.rows(overlay, 100, 2, '<2i'), [[-1, 2], [3, -4]])
        for address, count in [(99, 1), (112, 2), (100, -1)]:
            with self.assertRaises(ValueError):
                gym.rows(overlay, address, count, '<I')
        with self.assertRaisesRegex(ValueError, 'Unreviewed Drayden overlay'):
            gym.reference(overlay, [])

    def test_converter_process_has_no_window_without_losing_flags(self):
        with mock.patch.object(gym.os, 'name', 'nt'), mock.patch.object(gym.subprocess, 'run') as run:
            gym.quiet_run(['convert'], creationflags=32)
            self.assertEqual(run.call_args.kwargs['creationflags'], 32 | 0x08000000)

    def fixture(self):
        zones = [*geo.SHARED, *[z for group in geo.FAMILIES.values() for z in group]]
        assets = {'scenes': {str(z): {'instances': [{'model': 'floor'}]} for z in zones},
                  'models': {'floor': {'groups': [{'texture': 'tile'}]}, 'alternate': {'groups': [{'texture': 'other'}]}},
                  'textures': {'tile': {}, 'other': {}}, 'sprites': {'180': ['leader.png'], '105': ['juniper.png']},
                  'variantScenes': {'355': {'winter': {'instances': [{'model': 'alternate'}]}}}}
        events = {'zones': {str(z): {'actors': [{'model': 162}] if z == 121 else [], 'script': z} for z in zones},
                  'scripts': {str(z): {'code': {'0': {'name': 'ActorNew', 'args': [1, 2, 3, 4, 105]}}} for z in zones}}
        return assets, events, {'214': {}}, {'geometry': {'dragon': {'groups': []}}, 'textures': {}}, bytes(365 * 48), bytes(10)

    def test_partition_preserves_shared_maps_and_closes_texture_sprite_dependencies(self):
        fixture = self.fixture()
        before = copy.deepcopy(fixture)
        scenes, parts = geo.partition(*fixture)
        self.assertEqual(len(scenes), 28)
        self.assertFalse(set(scenes) & geo.SHARED)
        self.assertEqual(len(parts), 6)
        self.assertEqual(set(parts['drayden']['sprites']), {'180', '105'})
        self.assertIn('dragon', parts['drayden']['models'])
        self.assertNotIn('dragon', parts['route10']['models'])
        self.assertEqual(set(parts['route10']['models']), {'floor', 'alternate'})
        self.assertEqual(set(parts['route10']['textures']), {'tile', 'other'})
        self.assertEqual(scenes[214]['railZone'], 214)
        self.assertEqual(fixture, before)

    def test_incomplete_scope_or_dependencies_fail_before_catalog_export(self):
        fixture = self.fixture()
        del fixture[0]['scenes']['364']
        with self.assertRaisesRegex(ValueError, 'scope mismatch'):
            geo.partition(*fixture)
        fixture = self.fixture()
        del fixture[0]['textures']['other']
        with self.assertRaises(KeyError):
            geo.partition(*fixture)


if __name__ == '__main__':
    unittest.main()
