import importlib.util
import hashlib
from pathlib import Path
import struct
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'tools'))
spec = importlib.util.spec_from_file_location('native_texture_srt', ROOT/'tools/native-texture-srt.py')
srt = importlib.util.module_from_spec(spec)
spec.loader.exec_module(srt)


class NativeTextureChannels(unittest.TestCase):
    def test_native_castle_film_keeps_nonunit_scale_and_scaled_translation(self):
        raw=(ROOT/'tests/fixtures/castle-film-native-srt.bin').read_bytes()
        doc={'materials':[{'name':'n_drill'},{'name':'sky02'}]}
        tracks=srt.maya_matrix_tracks([raw],doc,{'n_drill':(32,32),'sky02':(128,128)})
        self.assertEqual(tracks['n_drill']['frames'][0],[1.5,0,0,0,.75,0,0,.25,1])
        self.assertEqual(tracks['sky02']['frames'][0],[3,0,0,0,1,0,0,0,1])
        native=srt.decode(raw)
        self.assertEqual(native['nativeFrames'],1615)
        self.assertGreater(tracks['n_drill']['frames'][-1][6],300)
        self.assertLess(tracks['sky02']['frames'][-1][6],-6)

    def test_native_maya_rotation_keeps_texture_center_and_aspect(self):
        data={'nativeSha256':'fixture','texMtxMode':0,'materials':{'swirl':[[4096,4096,4096,0,0,0]]}}
        with patch.object(srt,'decode',return_value=data):
            matrix=srt.maya_matrix_tracks([b'BTA0'],{'materials':[{'name':'swirl'}]},{'swirl':(64,32)})['swirl']['frames'][0]
        self.assertEqual(matrix,[0,-1,0,1,0,0,0,1,1])
        self.assertEqual([matrix[0]*.5+matrix[3]*.5+matrix[6],matrix[1]*.5+matrix[4]*.5+matrix[7]],[.5,.5])

    def test_actual_marshal_light_track_has_native_fx12_translation_and_an_explicit_last_frame(self):
        raw=(ROOT/'tests/fixtures/marshal-native-srt.bin').read_bytes()
        self.assertEqual(hashlib.sha256(raw).hexdigest(),'3ea2935e3c2e76aceb891e5f752faf19d21fa7ba430d69fe67fbf6056d4ce8f7')
        data=srt.decode(raw)
        self.assertEqual(data['nativeFrames'],21)
        self.assertEqual(data['texMtxMode'],0)
        self.assertEqual(len(data['materials']),6)
        light=data['materials']['c09_03_light_2']
        self.assertTrue(all(frame==[4096,4096,0,4096,2458,0] for frame in light[:20]))
        self.assertEqual(light[20],[4096,4096,0,4096,0,0])
        doc={'materials':[{'name':'c09_03_light_2'},{'name':'ring_anime'}]}
        tracks=srt.translation_tracks([raw],1,doc)['0']
        self.assertEqual(set(tracks),{'c09_03_light_2','ring_anime'})
        self.assertEqual(tracks['c09_03_light_2']['frames'][0],[-2458/4096,0])
        self.assertEqual(tracks['ring_anime']['frames'][0],[-.5,0])
        self.assertEqual(tracks['ring_anime']['frames'][20],[0,0])

    def test_signed_fx12_constants_and_dense16_32_arrays(self):
        self.assertEqual(srt.sample(b'', 0, srt.CONSTANT, 0xfffff000, 0), -4096)
        for flag, fmt in [(srt.FX16, 'h'), (0, 'i')]:
            raw = struct.pack('<3'+fmt, -4096, 2458, 0)
            self.assertEqual([srt.sample(raw, 0, flag, 0, i) for i in range(3)], [-4096, 2458, 0])

    def test_native_sparse_step2_and4_use_signed_integer_interpolation_and_tail_samples(self):
        raw = struct.pack('<4h', -4096, 4096, 8192, 12288)
        self.assertEqual([srt.sample(raw, 0, srt.FX16|srt.STEP2|4, 0, i) for i in range(6)], [-4096, 0, 4096, 6144, 8192, 12288])
        raw = struct.pack('<5i', -4096, 4096, 8192, 9000, 10000)
        self.assertEqual([srt.sample(raw, 0, srt.STEP4|4, 0, i) for i in range(8)], [-4096, -2048, 0, 2048, 4096, 8192, 9000, 10000])

    def test_rotation_pairs_keep_native_signed_components_without_angle_invention(self):
        raw = struct.pack('<4h', -4096, 0, 0, 4096)
        self.assertEqual(srt.sample(raw, 0, srt.STEP2|2, 0, 1, rotation=True), (-2048, 2048))
        self.assertEqual(srt.sample(b'', 0, srt.CONSTANT, 0x10000000, 0, rotation=True), (0, 4096))

    def test_truncated_reserved_and_invalid_channels_fail_explicitly(self):
        for raw, info, frame, rotation in [(b'', 0, 0, False), (b'\0'*4, srt.STEP2|srt.STEP4, 0, False), (b'\0'*4, srt.FX16, 0, True), (b'\0'*4, 0, -1, False)]:
            with self.assertRaises(ValueError):
                srt.sample(raw, 0, info, 0, frame, rotation=rotation)


if __name__ == '__main__':
    unittest.main()
