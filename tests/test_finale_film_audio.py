import importlib.util
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('film_audio',Path(__file__).resolve().parents[1]/'tools/render-finale-film-audio.py')
audio=importlib.util.module_from_spec(spec)
spec.loader.exec_module(audio)


def event(kind,frame,args):
    return {'kind':kind,'frame':frame,'args':args+[0]*(8-len(args))}


class NativeMovieAudio(unittest.TestCase):
    def test_new_sequence_replaces_only_its_own_native_player(self):
        film={'frames':20,'timeline':[event(1,0,[2000,127,0,0,0]),event(1,2,[2001,90,0,0,1]),event(1,3,[2002,100,0,0,0])]}
        cues=audio.plan(film)
        self.assertEqual([c['stop'] for c in cues],[3,20,20])
        self.assertEqual([c['player'] for c in cues],[0,1,0])

    def test_stop_by_player_or_sequence_does_not_stop_an_unrelated_voice(self):
        film={'frames':20,'timeline':[event(1,0,[2000,127,0,0,0]),event(1,2,[2001,90,0,0,1]),event(2,5,[2000,-1]),event(2,7,[0,1])]}
        self.assertEqual([c['stop']for c in audio.plan(film)],[5,7])

    def test_native_signed_pitch_pan_and_bgm_fade_are_retained(self):
        film={'frames':100,'timeline':[event(6,0,[1104]),event(1,5,[2011,70,4294967246,4294966796,2]),event(8,80,[1,15])]}
        music,sound=audio.plan(film)
        self.assertEqual(music['stop'],95)
        self.assertEqual(music['controls'][0],{'frame':80,'playerVolume127':127})
        self.assertEqual(music['controls'][-1],{'frame':95,'playerVolume127':0})
        self.assertEqual(sound['controls'],[{'frame':0,'playerVolume127':70,'pan128':-50,'pitch64':-500}])

    def test_absolute_sample_edges_do_not_overrun_mix_by_one_sample(self):
        # Separate rounding of duration and start caused the real film9 failure.
        self.assertEqual(sum(audio.sample_span(i,i+1)for i in range(1361)),round(1361*32768/30))
        for start in range(30):
            for end in range(start,90):
                self.assertEqual(round(start*32768/30)+audio.sample_span(start,end),round(end*32768/30))

    def test_unreviewed_player_and_invalid_fade_fail_instead_of_becoming_silent(self):
        for timeline in [[event(1,0,[2000,128,0,0,0])],[event(1,0,[2000,127,0,0,9])],[event(6,0,[1104]),event(8,5,[3,10])]]:
            with self.assertRaises(ValueError):audio.plan({'frames':20,'timeline':timeline})


if __name__=='__main__':unittest.main()
