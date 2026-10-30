import importlib.util
import json
from pathlib import Path
import struct
import tempfile
import unittest

class StartupPackTest(unittest.TestCase):
    def test_numbered_chapter_catalogues_are_packed_without_changing_png_bytes(self):
        spec=importlib.util.spec_from_file_location('builder',Path(__file__).parents[1]/'scripts/build-site.py')
        builder=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        with tempfile.TemporaryDirectory() as folder:
            site=Path(folder)
            (site/'assets').mkdir()
            original=b'original PNG payload\x00\xff'
            (site/'assets/route3.png').write_bytes(original)
            (site/'route3-assets.js').write_text('window.ROUTE3_ASSETS='+json.dumps({'sprites':{'7':['assets/route3.png']}})+';',encoding='utf8')
            result=builder.startup_pack(site)
            self.assertEqual(result['images'],1)
            raw=(site/'assets/field-pack.bin').read_bytes()
            length=struct.unpack_from('<I',raw,4)[0]
            index=json.loads(raw[8:8+length])
            self.assertEqual(index['assets/route3.png'],[0,len(original)])
            self.assertEqual(raw[8+length:],original)
