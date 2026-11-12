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

test('a driver corrects its lateral drift before a narrow lane, while retaining native ledge input',()=>{
 const p={x:24.1802,y:11.158365},goal={x:17.75,y:11.25},wall=(x,y)=>x<24&&y<11;
 assert.equal(health.corridorKey(p,goal,'ArrowLeft',wall),'ArrowDown');
 assert.equal(health.corridorKey({...p,y:11.28},goal,'ArrowLeft',wall),'ArrowLeft');
 assert.equal(health.corridorKey(p,goal,'ArrowLeft',()=>true),'ArrowLeft','Do not steer around a genuine blocked ledge centre');
 assert.equal(health.corridorKey({x:11.158365,y:24.1802},{x:11.25,y:17.75},'ArrowUp',(x,y)=>y<24&&x<11),'ArrowRight');
 assert.equal(health.corridorKey({x:18.6167,y:23.7},{x:18.75,y:23.75},'ArrowRight',x=>x>=19),'ArrowRight','The probe cannot look beyond the current corner waypoint');
 assert.equal(health.corridorKey({x:37.1167,y:4.0167},{x:24.5,y:4.5},'ArrowLeft',()=>false,(x,y)=>Math.abs(x-36.5)<.6&&Math.abs(y-3.5)<.6),'ArrowDown','The rendered driver also respects the actual NPC body at a corner');
});

test('multiple physical chunks in one rendered frame can cross a ribbon waypoint and the driver reverses back to it',()=>{
 const goal={x:31.5,y:13.5,rail:{line:4,front:3,mode:'walk'}},tables={lines:{4:{direction:1},55:{direction:1}}};
 assert.equal(health.railKey({x:31.5,y:13.26},goal,'ArrowUp',{mode:'walk',line:55,front:.24},tables),'ArrowDown');
 assert.equal(health.railKey({x:23,y:22},goal,'ArrowUp',{mode:'walk',line:1,front:2},tables),'ArrowUp');
 assert.equal(health.railKey({x:31.5,y:13.26},goal,'ArrowUp',{mode:'walk',line:4,front:3.2},tables),'ArrowDown');
});
