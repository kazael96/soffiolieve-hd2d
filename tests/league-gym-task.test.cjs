const test=require('node:test'),assert=require('node:assert/strict');
const {create}=require('../src/league-gym-task.js'),data=require('./fixtures/drayden-native-task.json');
const {FieldEventVM}=require('../src/field-event-vm.js'),scripts=require('./fixtures/drayden-button-scripts.json');
function setup(native={zone:121}){const events=[],task=create({data,state:()=>native,sound:id=>events.push(['start',id]),stopSound:id=>events.push(['stop',id])});return{native,task,events};}
function finish(task,frames){for(let i=0;i<frames;i++)task.tick(1/30);}

test('native initializer uses three different dragon poses and the exported native track counts',()=>{
 const {task}=setup();assert.deepEqual(task.snapshot.dragons,[{neck:3,arms:[0,1]},{neck:1,arms:[1,1]},{neck:2,arms:[1,0]}]);
 assert.deepEqual([0,5,10].map(i=>task.visual(i)),[{track:0,frame:80,paused:true},{track:5,frame:80,paused:true},{track:2,frame:80,paused:true}]);
 assert.deepEqual(data.neckTransitionTracks,[[null,null,2,0],[null,null,6,4],[3,7,null,null],[1,5,null,null]]);
 assert.equal(data.models['lg-gym-16'].states[0].nativeFrames,27);
 assert.deepEqual(data.jump.heightOffsets,[.5,1,.5,0,-.5,-1,-1.5,-2]);
});

test('button407 completes its 27-frame pattern before arm410 and neck409, preserving collision until the neck finishes',async()=>{
 const {task,events}=setup(),button=task.begin('button',0,1);assert.equal(task.begin('button',0,1),button);
 assert.deepEqual(task.visual(4),{track:0,frame:0,paused:false});finish(task,26);assert.equal(task.busy,true);assert.equal(task.visual(4).frame,26);finish(task,1);assert.equal(await button,true);
 assert.deepEqual(task.visual(4),{track:0,frame:0,paused:true});
 const arm=task.begin('arm',0,1);assert.deepEqual(task.snapshot.dragons[0],{neck:3,arms:[0,0]});assert.equal(task.visual(2).track,0);finish(task,40);assert.equal(task.busy,true);finish(task,1);assert.equal(await arm,true);
 const neck=task.begin('neck',0);assert.equal(task.snapshot.dragons[0].neck,0);assert.equal(task.collisionState(0),3);assert.deepEqual(task.visual(0),{track:1,frame:0,paused:false});finish(task,80);assert.equal(task.collisionState(0),3);finish(task,1);assert.equal(await neck,true);assert.equal(task.collisionState(0),0);
 assert.deepEqual(events,[['start',1747],['stop',1747],['start',1788],['stop',1788],['start',1789],['start',1748],['stop',1748],['start',1753]]);
});

test('all native one-arm transitions select the original directional neck track rather than one generic animation',async()=>{
 const arms=[[0,0],[1,1],[1,0],[0,1]],expected=[[2,0],[4,6],[3,7],[5,1]];
 for(let initial=0;initial<4;initial++)for(let side=0;side<2;side++){
  const {task}=setup({zone:121,draydenPuzzle:{version:1,dragons:[0,1,2].map(()=>({neck:initial,arms:[...arms[initial]]}))}});
  const arm=task.begin('arm',1,side);finish(task,41);await arm;
  const neck=task.begin('neck',1);assert.equal(task.visual(5).track,expected[initial][side]);finish(task,81);await neck;
  const done=task.snapshot.dragons[1];assert.deepEqual(done.arms,arms[initial].map((n,i)=>i===side?1-n:n));
 }
});

test('every saved frame and fractional tick resumes to the same native pose at x1/x2/x4',async()=>{
 for(const kind of ['button','arm','neck'])for(const speed of [1,2,4]){
  const duration=kind==='button'?27:kind==='arm'?41:81;
  for(let frame=0;frame<duration;frame++){
   const current=setup();if(kind==='neck'){const a=current.task.begin('arm',0,1);finish(current.task,41);await a;}
   const original=current.task.begin(kind,0,kind==='neck'?0:1);current.task.tick((frame+.25)/30);
   const restored=setup(JSON.parse(JSON.stringify(current.native))),pending=restored.task.wait();
   assert.deepEqual(restored.task.visual(current.task.snapshot.task.instance),current.task.visual(current.task.snapshot.task.instance));
   while(current.task.busy)current.task.tick(speed/60);
   while(restored.task.busy)restored.task.tick(speed/60);
   assert.equal(await original,true);assert.equal(await pending,true);assert.deepEqual(restored.task.snapshot,current.task.snapshot);
  }
 }
});

test('impossible/reentrant tasks and corrupt checkpoints fail explicitly; cancellation restores a coherent prior pose',async()=>{
 const {task,native}=setup();assert.throws(()=>task.begin('neck',0),/non consentita/);
 assert.throws(()=>task.begin('arm',3,0),/non valido/);assert.throws(()=>task.begin('arm',0,2),/non valido/);
 const arm=task.begin('arm',0,1);assert.throws(()=>task.begin('button',0,1),/già in movimento/);task.tick(.1);task.cancel();assert.equal(await arm,false);assert.deepEqual(task.snapshot.dragons[0],{neck:3,arms:[0,1]});
 const again=task.begin('arm',0,1);finish(task,41);await again;const neck=task.begin('neck',0);task.cancel();assert.equal(await neck,false);assert.equal(task.snapshot.dragons[0].neck,3);
 const bad=JSON.parse(JSON.stringify(native));bad.draydenPuzzle.dragons[0].arms[0]=2;assert.throws(()=>setup(bad).task.snapshot,/non valido/);
 const active=task.begin('neck',0),snapshot=JSON.parse(JSON.stringify(native));snapshot.draydenPuzzle.task.track=7;assert.throws(()=>setup(snapshot).task.snapshot,/incoerente/);task.cancel();await active;
});

test('leaving the room pauses a resumable task and does not advance the wrong scene',async()=>{
 const {task,native}=setup(),pending=task.begin('button',2,0);task.tick(.1);const before=task.snapshot;native.zone=136;task.tick(20);assert.deepEqual(task.snapshot,before);assert.equal(await task.begin('arm',0,0),false);native.zone=121;finish(task,27);assert.equal(await pending,true);
});

test('all six original button programs resolve their own dragon, side and neck transition through the actual VM',async()=>{
 const expected=[[0,1,0,1],[0,0,1,5],[1,0,3,4],[1,1,2,6],[2,0,0,3],[2,1,1,7]];
 for(let entry=2;entry<8;entry++){
  const native={zone:121,vars:{},flags:[]},{task}=setup(native),calls=[];
  const isolated=new Set(['ActorPauseAll','ActorUnlockAll','RTFinishSubEvents','EVCameraInit','EVCameraUnbind','EVCameraMoveTo','EVCameraWait','EVCameraMoveToDefault','EVCameraRebind','EVCameraEnd','NativeOpcode408']);
  const machine=new FieldEventVM(scripts,native,{command:async(command,args,values)=>{
   const kind={NativeOpcode407:'button',NativeOpcode410:'arm',NativeOpcode409:'neck'}[command.name];
   if(!kind)return isolated.has(command.name);
   const promise=task.begin(kind,values[0],values[1]??0);calls.push([kind,values[0],values[1]??0,task.snapshot.task.track]);
   finish(task,kind==='button'?27:kind==='arm'?41:81);return await promise;
  }});
  await machine.run(242,entry);const [index,side,neck,animation]=expected[entry-2];
  assert.deepEqual(calls,[['button',index,side,0],['arm',index,side,side===0?1-data.initialStates[index][1]:1-data.initialStates[index][2]],['neck',index,0,animation]]);
  assert.equal(task.snapshot.dragons[index].neck,neck);assert.equal(machine.running,false);assert.equal(task.busy,false);
 }
});

test('native collision rows allow only the two current neck ribbons and change after animation completion',async()=>{
 for(let neck=0;neck<4;neck++){
  const arms=[[0,0],[1,1],[1,0],[0,1]][neck],{task}=setup({zone:121,draydenPuzzle:{version:1,dragons:[0,1,2].map(()=>({neck,arms:[...arms]}))}});
  for(let index=0;index<3;index++)for(const [position,line]of data.collisionStateRows[index*4+neck].entries())assert.equal(task.railEnabled(line),neck!==1&&position<2);
  assert.equal(task.railEnabled(0),true);assert.equal(task.railEnabled(-1),false);
 }
 const {task}=setup();assert.equal(task.railEnabled(30),true);assert.equal(task.railEnabled(32),false);
 const arm=task.begin('arm',0,1);finish(task,41);await arm;const pending=task.begin('neck',0);finish(task,80);
 assert.equal(task.railEnabled(30),true);assert.equal(task.railEnabled(32),false);finish(task,1);await pending;
 assert.equal(task.railEnabled(30),false);assert.equal(task.railEnabled(32),true);
});
