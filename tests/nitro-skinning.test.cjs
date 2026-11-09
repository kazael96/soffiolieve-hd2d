const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {batches}=require('../src/nitro-skinning.js'),src=path.resolve(__dirname,'../src'),raw=fs.readFileSync(path.join(src,'opelucid-cinematics-data.js'),'utf8'),films=JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,'')).films;
function read(file){const raw=fs.readFileSync(file),size=raw.readUInt32LE(12),doc=JSON.parse(raw.subarray(20,20+size)),data=raw.subarray(28+size);return {doc,accessor(id){const a=doc.accessors[id],v=doc.bufferViews[a.bufferView],count={VEC4:4,SCALAR:1,VEC3:3}[a.type],bytes={5121:1,5123:2,5125:4,5126:4}[a.componentType],get={5121:'readUInt8',5123:'readUInt16LE',5125:'readUInt32LE',5126:'readFloatLE'}[a.componentType],denom=a.normalized?{5121:255,5123:65535,5125:4294967295}[a.componentType]:1;return Array.from({length:a.count},(_,i)=>Array.from({length:count},(_,k)=>data[get]((v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||bytes*count)+k*bytes)/denom));}};}
test('both real29-joint dragons fit mobile palettes without dropping triangles or changing weighted poses',()=>{
 let split=0;for(const film of Object.values(films)){const {doc,accessor}=read(path.join(src,film.models.dragon.url));assert.equal(Math.max(...doc.skins.map(s=>s.joints.length)),29);
  for(const mesh of doc.meshes)for(const p of mesh.primitives){const indices=accessor(p.indices).flat(),joints=accessor(p.attributes.JOINTS_0),weights=accessor(p.attributes.WEIGHTS_0),parts=batches(indices,joints,weights);if(parts.length>1)split++;
   assert.deepEqual(parts.flatMap(p=>p.indices),indices);
   for(const part of parts){assert.ok(part.palette.length<=24);const map=new Map(part.palette.map((id,i)=>[id,i])),palette=part.palette.map(id=>[id*.17,Math.sin(id),id*id*.01]);
    for(const vertex of part.indices)for(let axis=0;axis<3;axis++){let original=0,remapped=0;for(let k=0;k<4;k++){const w=weights[vertex][k];if(!w)continue;const id=joints[vertex][k],vector=[id*.17,Math.sin(id),id*id*.01];original+=vector[axis]*w;remapped+=palette[map.get(id)][axis]*w;}assert.ok(Math.abs(original-remapped)<1e-12);}
   }
  }
 }assert.ok(split>0,'Black dragon must exercise real palette partitioning');
});
test('a triangle that cannot fit fails explicitly; unused joint slots never consume the palette',()=>{
 assert.throws(()=>batches([0,1,2],[[0,1,2,3],[4,5,6,7],[8,9,10,11]],Array.from({length:3},()=>[.25,.25,.25,.25]),8),/triangolo/);
 assert.deepEqual(batches([0,0,0],[[28,65535,65535,65535]],[[1,0,0,0]])[0].palette,[28]);
});
test('native Tower films retain their independent complete cameras and projection parameters',()=>{
 for(const [id,frames]of [[13,552],[14,551]]){const f=films[id];assert.equal(f.frames,frames);assert.equal(f.camera.length,frames);assert.ok(f.camera.every(row=>row.length===6&&row.every(Number.isFinite)));assert.ok(f.perspective.near>0&&f.perspective.far>1000);assert.equal(f.source.cameraMember,id===13?203:211);}
});
