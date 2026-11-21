"""Conversion safeguards; synthetic binary only, no original ROM fixture."""
import importlib.util,struct,sys,unittest
from pathlib import Path
TOOLS=Path(__file__).resolve().parents[1]/'tools';sys.path.insert(0,str(TOOLS))
def load(name,file):
    spec=importlib.util.spec_from_file_location(name,TOOLS/file);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
native=load('receipt_rebind_tested','rebind-native-receipts.py')
reuse=load('receipt_case_reuse_tested','reuse-native-receipt-case.py')

def synthetic_bmd():
    b=bytearray(512);b[:4]=b'BMD0';struct.pack_into('<I',b,16,24);b[24:28]=b'MDL0'
    def dictionary(start,rows):
        b[start+1]=len(rows);struct.pack_into('<H',b,start+6,8);entry=start+8;struct.pack_into('<HH',b,entry,4,4+4*len(rows))
        for i,(name,value)in enumerate(rows):
            struct.pack_into('<I',b,entry+4+i*4,value);at=entry+4+4*len(rows)+i*16;b[at:at+len(name)]=name.encode()
    dictionary(32,[('test',104)])
    dictionary(192,[('LL',128),('RR',168)])
    for start in [320,360]:struct.pack_into('<H',b,start,2)
    return bytes(b)

class ReceiptBindBasis(unittest.TestCase):
    def test_changes_only_explicit_native_scale_and_inverse_scale(self):
        original=synthetic_bmd();snapshot=bytes(original);fixed,changes=native.unit_conversion_bind(original,['LL','RR'])
        self.assertEqual(original,snapshot);self.assertEqual(len(fixed),len(original));self.assertEqual([r['node']for r in changes],['LL','RR'])
        allowed={i for start in [336,376]for i in range(start,start+24)}
        self.assertTrue(all(a==b or i in allowed for i,(a,b)in enumerate(zip(original,fixed))))
        for start in [336,376]:self.assertEqual(struct.unpack_from('<6i',fixed,start),(4096,)*6)
    def test_nonzero_or_unknown_scale_refused_without_mutation(self):
        original=bytearray(synthetic_bmd());struct.pack_into('<i',original,336,1);snapshot=bytes(original)
        with self.assertRaises(AssertionError):native.unit_conversion_bind(original,['LL','RR'])
        self.assertEqual(bytes(original),snapshot)
    def test_missing_native_node_refused(self):
        with self.assertRaises(AssertionError):native.unit_conversion_bind(synthetic_bmd(),['LL','not-a-native-node'])
    def test_default_unit_scale_cannot_be_silently_overwritten(self):
        raw=bytearray(synthetic_bmd());struct.pack_into('<H',raw,320,6)
        with self.assertRaises(AssertionError):native.unit_conversion_bind(raw,['LL','RR'])
    def test_wrong_container_signature_refused(self):
        raw=bytearray(synthetic_bmd());raw[:4]=b'BCA0'
        with self.assertRaises(AssertionError):native.unit_conversion_bind(raw,['LL','RR'])

def triangle_fixture(*,indices=(0,1,2),uv=0,owners=(1,1,1),blended=False):
    binary=bytearray();accessors=[];views=[]
    def add(kind,component,values,fmt,normalized=False):
        at=len(binary);count=len(values);flat=[v for row in values for v in row];binary.extend(struct.pack('<'+fmt*len(flat),*flat));index=len(accessors)
        views.append({'byteOffset':at,'byteLength':len(binary)-at});a={'type':kind,'componentType':component,'count':count,'bufferView':index}
        if normalized:a['normalized']=True
        accessors.append(a);return index
    p=add('VEC3',5126,[(0,0,0),(1,0,0),(0,1,0)],'f');t=add('VEC2',5126,[(uv,0),(1,0),(0,1)],'f')
    j=add('VEC4',5121,[(owner,0,0,0)for owner in owners],'B');w=add('VEC4',5121,[(128,127,0,0)if blended else(255,0,0,0)]*3,'B',True);i=add('SCALAR',5123,[(x,)for x in indices],'H')
    doc={'accessors':accessors,'bufferViews':views,'meshes':[{'primitives':[{'indices':i,'attributes':{'POSITION':p,'TEXCOORD_0':t,'JOINTS_0':j,'WEIGHTS_0':w}}]}]}
    return doc,bytes(binary)

class ExactNativeComponentReuse(unittest.TestCase):
    def test_equal_typed_attributes_and_rotated_same_winding_match(self):
        d,b=triangle_fixture();vertices,triangles=reuse.piece(d,b);rd,rb=triangle_fixture(indices=(1,2,0));_,rotated=reuse.piece(rd,rb)
        self.assertEqual(len(vertices),3);self.assertEqual(sum(triangles.values()),1);self.assertEqual(triangles,rotated)
    def test_reversed_winding_cannot_match_a_native_component(self):
        d,b=triangle_fixture();_,normal=reuse.piece(d,b);rd,rb=triangle_fixture(indices=(0,2,1));_,reversed_triangles=reuse.piece(rd,rb)
        self.assertNotEqual(normal,reversed_triangles)
    def test_similar_positions_with_different_uv_cannot_match(self):
        d,b=triangle_fixture();_,normal=reuse.piece(d,b);rd,rb=triangle_fixture(uv=.00001);_,altered=reuse.piece(rd,rb)
        self.assertNotEqual(normal,altered)
    def test_cross_bone_triangle_refused(self):
        d,b=triangle_fixture(owners=(1,2,1))
        with self.assertRaises(AssertionError):reuse.piece(d,b)
    def test_blended_weights_cannot_be_silently_treated_as_rigid(self):
        d,b=triangle_fixture(blended=True)
        with self.assertRaises(AssertionError):reuse.piece(d,b)

if __name__=='__main__':unittest.main()
