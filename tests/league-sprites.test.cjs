const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../src'),proof=JSON.parse(fs.readFileSync(path.join(root,'assets/animated/provenance-052.json'),'utf8')),c={};c.window=c;vm.runInNewContext(fs.readFileSync(path.join(root,'pokemon-anim.js'),'utf8'),c);
test('thirteen new native species retain both original composite atlases and decoded track data',()=>{
 assert.equal(proof.species.length,13);assert.equal(proof.records.length,52);assert.equal(proof.femaleVariants.length,0);
 for(const record of proof.records){const bytes=fs.readFileSync(path.join(root,'..',record.asset));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256,record.asset);}
});
test('all new original composites have finite supported parts and bounds throughout two animation loops on both sides',()=>{
 for(const id of proof.species)for(const side of ['front','back']){
  const data=JSON.parse(fs.readFileSync(path.join(root,'assets/animated',id+'-'+side+'.json'),'utf8')),duration=data.parent[0].frames.reduce((sum,f)=>sum+Math.max(1,f[1]),0);
  for(let tick=0;tick<duration*2;tick++){const parts=c.ROM_SPRITE_ANIM.parts(data,tick),bounds=c.ROM_SPRITE_ANIM.bounds(data,tick);assert.ok(parts.length,id+'/'+side+'/'+tick);assert.ok(bounds.every(Number.isFinite));assert.ok(bounds[2]>bounds[0]&&bounds[3]>bounds[1]);for(const part of parts){assert.ok(data.images[part.o[4]]);assert.ok(part.f.every(Number.isFinite));}}
 }
});
