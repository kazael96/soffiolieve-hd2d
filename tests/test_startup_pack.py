import importlib.util
import json
from pathlib import Path
import struct
import tempfile
import unittest

class StartupPackTest(unittest.TestCase):
    def builder(self):
        spec=importlib.util.spec_from_file_location('builder',Path(__file__).parents[1]/'scripts/build-site.py')
        builder=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        return builder

    def test_geographic_packs_are_separate_and_include_dynamic_extra_images(self):
        builder=self.builder()
        with builder.build_staging() as folder:
            site=Path(folder);(site/'assets').mkdir()
            families={}
            for name in ['brycen','dragonspiral']:
                part={'src':f'opelucid-{name}-assets.js','pack':f'assets/opelucid-{name}-pack.bin'}
                families[name]=part
                (site/f'assets/{name}.png').write_bytes(name.encode())
                payload={'extraImages':[f'assets/{name}.png'], 'textures':{'repeat':{'src':f'assets/{name}.png?v=1'}}}
                (site/part['src']).write_text('window.OPELUCID_PART_ASSETS='+json.dumps(payload)+';',encoding='utf8')
            (site/'opelucid-parts.js').write_text('window.OPELUCID_PARTS='+json.dumps({'families':families})+';',encoding='utf8')
            result=builder.geographic_packs(site)
            self.assertEqual(set(result),set(families))
            for name,part in result.items():
                self.assertEqual(part['images'],1)
                raw=(site/part['pack']).read_bytes();length=struct.unpack_from('<I',raw,4)[0]
                self.assertEqual(set(json.loads(raw[8:8+length])),{f'assets/{name}.png'})
                self.assertEqual(raw[8+length:],name.encode())

    def test_geographic_pack_rejects_missing_images_and_escaping_output(self):
        builder=self.builder()
        with builder.build_staging() as folder:
            site=Path(folder);(site/'assets').mkdir()
            part={'src':'opelucid-brycen-assets.js','pack':'assets/opelucid-brycen-pack.bin'}
            manifest={'families':{'brycen':part}}
            def write():
                (site/'opelucid-parts.js').write_text('window.OPELUCID_PARTS='+json.dumps(manifest)+';',encoding='utf8')
            write()
            with self.assertRaisesRegex(ValueError,'Missing pack catalogue'):builder.geographic_packs(site)
            (site/part['src']).write_text('window.OPELUCID_PART_ASSETS={"extraImages":["assets/missing.png"]};',encoding='utf8')
            with self.assertRaisesRegex(ValueError,'Missing pack image'):builder.geographic_packs(site)
            self.assertFalse((site/part['pack']).exists())
            part['pack']='../escape.bin';write()
            with self.assertRaisesRegex(ValueError,'Invalid geographic pack path'):builder.geographic_packs(site)

    def test_finale_families_keep_original_bytes_in_separate_lazy_packs(self):
        builder=self.builder()
        with builder.build_staging() as folder:
            site=Path(folder);(site/'assets').mkdir()
            name='castleMiddle';image=b'original final chapter image bytes'
            part={'src':'finale-castleMiddle-assets.js','pack':'assets/finale-castleMiddle-pack.bin'}
            (site/'assets/native.png').write_bytes(image)
            (site/part['src']).write_text('window.FINALE_PART_ASSETS='+json.dumps({'textures':{'native':{'src':'assets/native.png'}}})+';',encoding='utf8')
            (site/'finale-parts.js').write_text('window.FINALE_PARTS='+json.dumps({'families':{name:part}})+';',encoding='utf8')
            result=builder.geographic_packs(site,'finale');self.assertEqual(result[name]['images'],1)
            raw=(site/part['pack']).read_bytes();length=struct.unpack_from('<I',raw,4)[0]
            self.assertEqual(json.loads(raw[8:8+length]),{'assets/native.png':[0,len(image)]})
            self.assertEqual(raw[8+length:],image)

    def test_numbered_chapter_catalogues_are_packed_without_changing_png_bytes(self):
        spec=importlib.util.spec_from_file_location('builder',Path(__file__).parents[1]/'scripts/build-site.py')
        builder=importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        with builder.build_staging() as folder:
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
