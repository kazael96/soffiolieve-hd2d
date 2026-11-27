"""Install a complete verified17-model native conversion; preserve native hashes.

Technical installation remains visually pending until its browser evidence is
read. ROM/raw archive members are never copied into the published source.
"""
import argparse,hashlib,json
from pathlib import Path
sha=lambda raw:hashlib.sha256(raw).hexdigest()
def install(source,proof_path):
    source=source.resolve();proof_path=proof_path.resolve();proof=json.loads(proof_path.read_text())
    assert proof['result']=='NATIVE_REEXPORT_PROOF_PASS_PENDING_VISUAL_REVIEW'and not proof['partial']and proof['gameCode']=='IRBI'
    rows=proof['rows'];assert len(rows)==17 and len({r['model']for r in rows})==17
    catalog=source/'trio-badge-assets.js';text=catalog.read_text(encoding='utf8');prefix='window.TRIO_BADGE_ASSETS=';assert text.startswith(prefix)
    data,end=json.JSONDecoder().raw_decode(text[len(prefix):]);tail=text[len(prefix)+end:];rigid=data['nativeAnimationProof']['rigidSkinning'];changes=[];writes=[]
    for row in rows:
        assert row['nativeBCASamplesExactlyEqual']>0 and row['hierarchyMaterialsTexturesIndicesWeightsIdentical']and row['maximumAbsInverseBind']<1e6
        destination=(source/row['url']).resolve();assert destination.is_relative_to(source)and row['url'].startswith('assets/field-effects/')
        old=destination.read_bytes();new=(proof_path.parent/'converted'/row['url']).read_bytes();assert sha(old)==row['beforeGLBSHA256']and sha(new)==row['afterGLBSHA256']
        entry=rigid[row['model']];assert entry['GLBSHA256']==row['beforeGLBSHA256']
        entry.setdefault('originalExportGLBSHA256',entry['GLBSHA256']);entry['GLBSHA256']=row['afterGLBSHA256']
        changes.append({k:row[k]for k in ['model','sourceMembers','nativeMembers','conversionBind','beforeGLBSHA256','afterGLBSHA256','nativeBCASamplesExactlyEqual','maximumAbsInverseBind']});writes.append((destination,new))
    data['nativeAnimationProof']['conversionBindBasis']={'status':'NATIVE_CONVERSION_VERIFIED_VISUAL_PENDING','method':'Original native BMD geometry with unit conversion bind for originally zero-scale rigid nodes; all original BCA samples, PAT/BVA, hierarchy, materials, textures, indices and weights preserved. No dequantization guess or generic replacement.','privateProofSHA256':sha(proof_path.read_bytes()),'romSHA256':proof['romSHA256'],'converterSHA256':proof['converter']['sha256'],'exportToolSHA256':proof['exportToolSHA256'],'rows':changes,'retainedNativePATandBVA':proof['retainedNativePATandBVA']}
    for path,raw in writes:path.write_bytes(raw)
    catalog.write_text(prefix+json.dumps(data,separators=(',',':'))+tail,encoding='utf8',newline='')
    result={'result':'INSTALLED17_NATIVE_RECEIPT_BINDS_VISUAL_PENDING','source':str(source),'privateProofSHA256':sha(proof_path.read_bytes()),'catalogSHA256':sha(catalog.read_bytes()),'models':len(writes),'nativeROMAndRawPreserved':True}
    (proof_path.parent/'installed.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--source',type=Path,required=True);p.add_argument('--proof',type=Path,required=True);a=p.parse_args();install(a.source,a.proof)
