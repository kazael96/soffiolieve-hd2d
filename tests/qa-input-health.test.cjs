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

test('a waypoint crossed during a slow rendered frame steers back instead of holding its old direction forever',()=>{
 for(const [axis,sign,preferred]of [['x',1,'ArrowRight'],['x',-1,'ArrowLeft'],['y',1,'ArrowDown'],['y',-1,'ArrowUp']]){
  const p={x:0,y:0},goal={x:0,y:0};goal[axis]=sign;
  // The second frame crosses the .16 arrival window before the driver reads
  // the new pose. Normal cadence resumes and must reach the original goal.
  for(const dt of [.1,.12,...Array(100).fill(1/60)]){const key=health.waypointKey(p,goal,preferred),delta={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]}[key]||[0,0];p.x+=delta[0]*7*dt;p.y+=delta[1]*7*dt;}
  assert.ok(Math.hypot(p.x-goal.x,p.y-goal.y)<.16,JSON.stringify({axis,sign,p,goal}));
 }
 assert.equal(health.waypointKey({x:2,y:0},{x:1,y:0},'ArrowRight',{locked:true}),null);
 assert.equal(health.waypointKey({x:2,y:0},{x:1,y:0},'ArrowRight',{strict:true}),'ArrowRight','Native ramp approaches retain their prescribed direction');
});
