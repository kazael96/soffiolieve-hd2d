import importlib.util,json,struct,unittest
from pathlib import Path
s=importlib.util.spec_from_file_location('basis',Path(__file__).resolve().parents[1]/'tools/native-material-basis.py');basis=importlib.util.module_from_spec(s);s.loader.exec_module(basis)
class NeutralDiffuse(unittest.TestCase):
 def test_empty_basis_keeps_source_bytes(self):
  self.assertEqual(basis.neutral_diffuse(b'unchanged',[]),(b'unchanged',[]));self.assertEqual(basis.mark_glb(b'unchanged',[]),b'unchanged')
 def test_invalid_model_rejected(self):
  with self.assertRaises(ValueError):basis.neutral_diffuse(b'bad',{'body'})
 def test_glb_metadata_preserves_binary_exactly(self):
  doc={'materials':[{'name':'body'}]};b=json.dumps(doc).encode();b+=b' '*((-len(b))%4);binary=struct.pack('<I4s4B',4,b'BIN\0',0,127,250,255);raw=struct.pack('<4sIIII',b'glTF',2,20+len(b)+len(binary),len(b),0x4e4f534a)+b+binary;out=basis.mark_glb(raw,['body']);size=struct.unpack_from('<I',out,12)[0];self.assertEqual(out[20+size:],binary);self.assertEqual(struct.unpack_from('<I',out,8)[0],len(out));self.assertEqual(json.loads(out[20:20+size])['extras']['nativeAnimatedDiffuseNeutral'],['body'])
  with self.assertRaises(ValueError):basis.mark_glb(out,['body'])
 def test_unknown_material_rejected(self):
  b=json.dumps({'materials':[{'name':'body'}]}).encode();b+=b' '*((-len(b))%4);raw=struct.pack('<4sIIII',b'glTF',2,20+len(b),len(b),0x4e4f534a)+b
  with self.assertRaises(ValueError):basis.mark_glb(raw,['eyes'])
if __name__=='__main__':unittest.main()
