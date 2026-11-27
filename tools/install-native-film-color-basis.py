"""Install three directly verified native movie diffuse conversions."""
import argparse,hashlib,json,struct
from pathlib import Path
SHA=lambda b:hashlib.sha256(b).hexdigest()
def install(root,proof_path):
 proof=json.loads(proof_path.read_text());rows=proof.get('rows',[])
 if proof.get('gameCode')!='IRBI' or {(r.get('film'),r.get('part'))for r in rows}!={(7,'part0'),(10,'part1'),(11,'part1')}or len(rows)!=3:raise ValueError('Expected three direct IRBI conversion proofs')
 catalog_path=root/'src/finale-cinematics-data.js';text=catalog_path.read_text();prefix,raw=text.split('=',1);catalog=json.loads(raw.strip().removesuffix(';'));pending=[]
 for row in rows:
  model=catalog['films'][str(row['film'])]['models'][row['part']];current=root/'src'/model['url'];new=proof_path.parent/'converted'/row['url'];data=new.read_bytes()
  if not row.get('allNonColorAccessorsAndBCAIdentical')or not row.get('materialsTexturesHierarchyIdentical'):raise ValueError('Incomplete invariant proof')
  if row['url']!=model['url']or SHA(current.read_bytes())!=row['beforeGLBSHA256']or model['sha256']!=row['beforeGLBSHA256']or SHA(data)!=row['afterGLBSHA256']:raise ValueError('Source or destination hash mismatch')
  doc=json.loads(data[20:20+struct.unpack_from('<I',data,12)[0]]);names=set(catalog['films'][str(row['film'])]['materialColor'][row['part']])
  if set(doc.get('extras',{}).get('nativeAnimatedDiffuseNeutral',[]))!=names:raise ValueError('Unmarked or mismatched neutral basis')
  pending.append((current,data));model['sha256']=row['afterGLBSHA256']
 for file,data in pending:file.write_bytes(data)
 encoded=prefix+'='+json.dumps(catalog,separators=(',',':'),ensure_ascii=False)+';\n';catalog_path.write_text(encoded,encoding='utf-8')
 return {'result':'INSTALLED_NATIVE_DIFFUSE_BASIS_PENDING_INTEGRATED_REPLAY','proofSHA256':SHA(proof_path.read_bytes()),'catalogSHA256':SHA(catalog_path.read_bytes()),'models':[{'url':r['url'],'before':r['beforeGLBSHA256'],'after':r['afterGLBSHA256']}for r in rows]}
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--root',type=Path,required=True);p.add_argument('--proof',type=Path,required=True);p.add_argument('--receipt',type=Path,required=True);a=p.parse_args();result=install(a.root,a.proof);a.receipt.write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
