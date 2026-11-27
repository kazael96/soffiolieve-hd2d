import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value
overlay = module('classic_overlay', ROOT/'scripts/qa_classic_bundle.py')
builder = module('site_builder_for_overlay_test', ROOT/'scripts/build-site.py')

class BundleOverlayTests(unittest.TestCase):
    def actual_bundle(self):
        parent=ROOT/'test-results'
        parent.mkdir(exist_ok=True)
        self.assertTrue(parent.resolve().is_relative_to(ROOT.resolve()))
        with tempfile.TemporaryDirectory(prefix='qa-bundle064-',dir=parent) as directory:
            p=Path(directory)
            self.assertTrue(p.resolve().is_relative_to(parent.resolve()))
            (p/'index.html').write_text('<script src="first.js"></script><script src="game.js"></script><script src="last.js"></script>',encoding='utf8')
            for name,source in [('first.js','const shared="à\\n\\\"";'),('game.js','function combatant(){return "old";}'),('last.js','window.finalValue=shared;')]:
                (p/name).write_text(source,encoding='utf8')
            builder.bundle_entries(p)
            return (p/'app.js').read_text(encoding='utf8')
    def test_real_builder_transport_replaces_loaded_entry_and_preserves_order(self):
        original=self.actual_bundle()
        changed,proof=overlay.rewrite(original,{'game.js':'function combatant(){return "new";}'})
        rows,end=json.JSONDecoder().raw_decode(changed,len(overlay.PREFIX))
        old,_=json.JSONDecoder().raw_decode(original,len(overlay.PREFIX))
        self.assertEqual([r[0] for r in rows],['first.js','game.js','last.js'])
        self.assertEqual(rows[0],old[0]);self.assertEqual(rows[2],old[2])
        self.assertEqual(rows[1][1],'function combatant(){return "new";}')
        self.assertEqual(changed[end:],overlay.SUFFIX)
        self.assertTrue(proof['replacements'][0]['changed'])
    def test_no_replacement_keeps_every_transport_byte(self):
        original=self.actual_bundle();changed,_=overlay.rewrite(original,{})
        self.assertEqual(changed,original)
    def test_unknown_entry_fails_instead_of_claiming_unused_overlay(self):
        with self.assertRaisesRegex(ValueError,'not in transported'):
            overlay.rewrite(self.actual_bundle(),{'not-loaded.js':'window.fake=true;'})
    def test_quotes_unicode_and_sourceurl_like_text_remain_exact_source(self):
        source='const literal="é );{const tag=document.createElement(\\\"script\\\"); }";\n//# sourceURL=literal'
        changed,_=overlay.rewrite(self.actual_bundle(),{'game.js':source})
        rows,_=json.JSONDecoder().raw_decode(changed,len(overlay.PREFIX))
        self.assertEqual(rows[1][1],source)
    def test_unknown_suffix_or_duplicate_entries_fail(self):
        original=self.actual_bundle()
        with self.assertRaisesRegex(ValueError,'suffix'):
            overlay.rewrite(original+'window.extra=true;',{})
        duplicate=overlay.PREFIX+json.dumps([['game.js','a'],['game.js','b']])+overlay.SUFFIX
        with self.assertRaisesRegex(ValueError,'Duplicate'):
            overlay.rewrite(duplicate,{})

if __name__=='__main__':unittest.main()
