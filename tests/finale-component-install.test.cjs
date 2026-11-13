/* Real component factories installed by the actual field host. No pixels or audio. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {environment}=require('./helpers/league-field-host.cjs');
for(const [name,begin]of [
 ['FinaleCloseup',api=>api.open(2)],
 ['FinaleStone',api=>api.play({x:0,y:0,height:0})],
 ['FinaleBallRelease',api=>api.flight({x:0,y:0,height:0},{x:1,y:1,height:1},1,20)]
])test(name+' host installation retains live active/snapshot state during preparation and cancellation',async()=>{
 const c=environment({finale:true,finaleComponents:true,hostSource:process.env.FINALE_INSTALL_HOST,sourceRoot:path.resolve(__dirname,'../src')}),api=c[name];
 c.renderer.resourceGate=()=>new Promise(()=>{});assert.equal(api.active,false);assert.equal(api.snapshot,null);assert.equal(typeof api.create,'function');
 const task=begin(api),settled=task.catch(error=>error);
 try{assert.equal(api.active,true,'The host froze the component getter at installation');assert.ok(api.snapshot);assert.equal(api.snapshot.frame,0);}
 finally{api.cancel();await settled;}
 assert.equal(api.active,false);assert.equal(api.snapshot,null);
});
