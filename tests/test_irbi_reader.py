import importlib.util
from pathlib import Path
import struct
import unittest

spec = importlib.util.spec_from_file_location('irbi_reader', Path(__file__).parents[1]/'tools/irbi_reader.py')
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)


class ReaderTests(unittest.TestCase):
    def test_forward_and_backwards_lz_overlap(self):
        self.assertEqual(reader.lz10(b'\x10\x14\0\0\x20AA\xf0\x01'), b'A'*20)
        compressed = b'\0\xf0AA\x20' + b'\x0d\0\0\x08' + struct.pack('<I', 7)
        self.assertEqual(reader.code_decompress(compressed), b'A'*20)
        self.assertEqual(reader.code_decompress(b'prefix'+compressed), b'prefix'+b'A'*20)
        with self.assertRaises(ValueError): reader.lz10(b'\x10\x14\0\0\x80\xf0\x01')

    def test_narc_members_and_invalid_ranges(self):
        fat = b'BTAF'+struct.pack('<IHH4I', 28, 2, 0, 0, 3, 3, 7)
        names = b'BTNF'+struct.pack('<I', 8)
        image = b'GMIF'+struct.pack('<I', 15)+b'oneTWO!'
        raw = b'NARC\xff\xfe\0\x01'+struct.pack('<IHH', 16+len(fat+names+image), 16, 3)+fat+names+image
        self.assertEqual(reader.NARC(raw).files, [b'one', b'TWO!'])
        bad = bytearray(raw);struct.pack_into('<I', bad, 40, 1000)
        with self.assertRaises(ValueError): reader.NARC(bad)

    def test_nds_directory_tree_reads_only_the_selected_member(self):
        names = struct.pack('<IHHIHHIHH', 24, 0, 3, 29, 0, 0xf000, 34, 0, 0xf001)
        names += b'\x81a\x01\xf0\0\x810\x02\xf0\0\x04test\0'
        raw = bytearray(0x270);raw[12:16] = b'IRBI'
        struct.pack_into('<4I', raw, 64, 0x200, len(names), 0x240, 8)
        raw[0x200:0x200+len(names)] = names
        struct.pack_into('<II', raw, 0x240, 0x260, 0x267);raw[0x260:0x267] = b'payload'
        rom = reader.NintendoDSRom(raw)
        self.assertEqual(rom.idCode, b'IRBI')
        self.assertEqual(rom.getFileByName('a/0/test'), b'payload')
        with self.assertRaises(KeyError): rom.getFileByName('a/0/absent')
