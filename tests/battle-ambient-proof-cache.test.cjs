const {test}=require('node:test'),assert=require('node:assert/strict'),A=require('./ambient-audit.js');
function fixture(){
 let calls=0,failures=0,mutateDuring=false;const deps={audit(){},draw(){},frame(){},alphaBounds(){},imageBounds(){},canvas:{size:256,foot:192,body:64},banks:[{key:'509-front',species:'Purrloin',bank:{ready:true,data:{parent:[{frames:[[0,300]]}],animations:[{frames:[[0,108]]}],maps:[[0]],cells:[],images:[]},image:{src:'original-atlas.png',width:128,height:128},bounds:[0,0,80,80],groundBounds:[0,0,80,80]}}]};
 const cache=A.createNativeProofCache({dependencies:()=>deps,audit:async()=>{calls++;if(failures){failures--;throw Error('injected bank pixel failure');}if(mutateDuring)deps.canvas.foot++;return[{species:'Purrloin',poses:21600,clipped:0,empty:0,belowGround:0}];}});
 return{deps,cache,get calls(){return calls;},fail(){failures++;},mutateDuring(){mutateDuring=true;}};
}
test('the complete 21600-tick native proof is audited once across grass/path and single/double, with its donor recorded',async()=>{
 const f=fixture(),donor={case:'single',terrain:'grass',viewport:[390,844]},first=await f.cache.measure('route2',donor);assert.equal(first.cycleProofReused,false);assert.equal(first.nativePoses,21600);
 const repeated=[];for(const row of [{case:'single',terrain:'path'},{case:'double',terrain:'grass'},{case:'double',terrain:'path'}])repeated.push(await f.cache.measure('route2',row));
 assert.equal(f.calls,1,'identical complete native cycles must not be redrawn for every terrain or fighter layout');
 for(const proof of repeated){assert.equal(proof.cycleProofReused,true);assert.deepEqual(proof.cycleProofDonor,donor);assert.equal(proof.nativePoses,21600);assert.equal(proof.cycles[0].poses,21600);}
 await f.cache.measure('dreamyard',donor);assert.equal(f.calls,2,'each physical diorama id supplies its own full proof');
});
test('data replacement, in-place edits, atlas/image changes and decoder changes invalidate the native proof',async()=>{
 for(const mutate of [d=>d.banks[0].bank.data=structuredClone(d.banks[0].bank.data),d=>d.banks[0].bank.data.parent[0].frames[0][1]++,d=>d.banks[0].bank.image={...d.banks[0].bank.image},d=>d.banks[0].bank.image.src='replaced-atlas.png',d=>d.banks[0].bank.atlas={},d=>d.draw=()=>{},d=>d.frame=()=>{},d=>d.alphaBounds=()=>{},d=>d.imageBounds=()=>{},d=>d.audit=()=>{},d=>d.canvas.size++,d=>d.canvas.body++,d=>d.canvas.foot++,d=>d.banks[0].bank.groundBounds[3]++]){
  const f=fixture();await f.cache.measure('route2','donor');mutate(f.deps);const proof=await f.cache.measure('route2','replacement');assert.equal(f.calls,2);assert.equal(proof.cycleProofReused,false);assert.equal(proof.cycleProofDonor,'replacement');
 }
});
test('canonical data keys preserve the same proof and consumers cannot mutate cached evidence',async()=>{
 const f=fixture(),proof=await f.cache.measure('route2',{case:'first'});const original=f.deps.banks[0].bank.data,entries=Object.entries(original).reverse();for(const key of Object.keys(original))delete original[key];Object.assign(original,Object.fromEntries(entries));proof.cycles[0].poses=0;proof.cycleProofDonor.case='corrupted';const reused=await f.cache.measure('route2','later');assert.equal(f.calls,1);assert.equal(reused.nativePoses,21600);assert.equal(reused.cycles[0].poses,21600);assert.equal(reused.cycleProofDonor.case,'first');
});
test('bank usage clocks and the current ambient pose do not invalidate intrinsic full-cycle pixels',async()=>{
 const f=fixture();await f.cache.measure('route2','full-cycle donor');
 f.deps.banks[0].bank.used=999;f.deps.banks[0].bank.pending=false;f.deps.banks[0].actor={bounds:[10,20,30,40],frame:21601,visibility:{ratio:.9},world:[4,.02,-17.5]};f.deps.currentTick=21601;f.deps.viewport=[390,844];
 const reused=await f.cache.measure('route2','different current pose');assert.equal(f.calls,1);assert.equal(reused.cycleProofReused,true);assert.equal(reused.nativePoses,21600);assert.equal(reused.cycleProofDonor,'full-cycle donor');
});
test('unready or missing native banks invalidate a prior proof and must be audited again after recovery',async()=>{
 for(const breakBank of [d=>d.banks[0].bank.ready=false,d=>d.banks[0].bank.error='bank unavailable',d=>d.banks[0].bank.image=null]){
  const f=fixture();await f.cache.measure('route2','old pass');const before={...f.deps.banks[0].bank};breakBank(f.deps);await assert.rejects(f.cache.measure('route2','broken'),/not ready/);assert.equal(f.calls,1);for(const key of Object.keys(f.deps.banks[0].bank))delete f.deps.banks[0].bank[key];Object.assign(f.deps.banks[0].bank,before);const recovered=await f.cache.measure('route2','recovered');assert.equal(f.calls,2);assert.equal(recovered.cycleProofReused,false);
 }
});
test('failed pixel audits, invalid native results and dependencies changed during scanning never become reusable passes',async()=>{
 const f=fixture();f.fail();await assert.rejects(f.cache.measure('route2','failed'),/injected/);const proof=await f.cache.measure('route2','retry');assert.equal(f.calls,2);assert.equal(proof.cycleProofReused,false);assert.equal(proof.cycleProofDonor,'retry');assert.equal((await f.cache.measure('route2','later')).cycleProofReused,true);
 for(const bad of [[],[{poses:0}],[{poses:21600,clipped:1}],[{poses:21600,empty:1}],[{poses:21600,belowGround:1}]]){let n=0;const d=fixture().deps,cache=A.createNativeProofCache({dependencies:()=>d,audit:()=>{n++;return bad;}});await assert.rejects(cache.measure('route2','bad'),/native|cycle|proof/i);await assert.rejects(cache.measure('route2','bad retry'),/native|cycle|proof/i);assert.equal(n,2);}
 const changing=fixture();changing.mutateDuring();await assert.rejects(changing.cache.measure('route2','changed'),/dependenc|changed/i);
});
