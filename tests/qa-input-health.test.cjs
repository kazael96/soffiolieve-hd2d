const {test}=require('node:test'),assert=require('node:assert/strict'),health=require('./qa-input-health.js');
test('input benchmark accepts normal and slow supported frame cadence',()=>{
 const clock=health.create();for(const dt of [16.7,33.4,100,250,999,1000])clock.sample({dt,held:'ArrowUp'});clock.assert();
});
test('a held input across a stalled frame invalidates the replay and retains its cause',()=>{
 const clock=health.create(),error=clock.sample({dt:10103.3,held:'ArrowUp'});
 assert.equal(error.code,'QA_INPUT_FRAME_STALL');assert.equal(error.details.key,'ArrowUp');
 assert.throws(()=>clock.assert(),e=>e===error);assert.equal(clock.sample({dt:16.7,held:null}),error);
});
test('resource and narrative waits without an active input do not invalidate the benchmark',()=>{
 const clock=health.create();clock.sample({dt:18000,held:null});clock.sample({dt:18000,held:'ArrowUp',locked:true});clock.assert();
 clock.sample({dt:14000,held:'ArrowDown',locked:false});assert.throws(()=>clock.assert(),{code:'QA_INPUT_FRAME_STALL'});
});
