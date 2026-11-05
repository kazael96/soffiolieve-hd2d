const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{create}=require('../src/opelucid-gym-task.js');
const raw=fs.readFileSync(path.join(__dirname,'../src/opelucid-gym-data.js'),'utf8'),data=JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,''));
function setup(native={zone:114}){const sounds=[],stops=[];let saves=0;const task=create({data,state:()=>native,sound:id=>sounds.push(id),stopSound:id=>stops.push(id),save:()=>saves++});return {task,native,sounds,stops,get saves(){return saves;}};}
for(const speed of [1,2,4])test('native switch/platform sequencing at ×'+speed+' flips the save bit only after the sixty platform ticks',async()=>{
 const f=setup();let pressed=false,turned=false;const press=f.task.begin('switch',0).then(v=>pressed=v);while(f.task.busy)f.task.tick(speed/60);assert.equal(await press,true);assert.equal(pressed,true);assert.deepEqual(f.task.snapshot.states,[0,0,0]);assert.deepEqual(f.task.snapshot.switches,[1,0,0]);assert.equal(f.sounds.length,0);
 const turn=f.task.begin('platform',0).then(v=>turned=v);for(let i=0;i<120/speed-1;i++)f.task.tick(speed/60);assert.equal(turned,false);assert.deepEqual(f.task.snapshot.states,[0,0,0]);f.task.tick(speed/60);await turn;assert.equal(turned,true);assert.deepEqual(f.task.snapshot.states,[1,0,0]);assert.deepEqual(f.sounds,[1744,1776]);f.task.tick(10);assert.deepEqual(f.task.snapshot.states,[1,0,0]);assert.deepEqual(f.sounds,[1744,1776]);
});
test('unmatched native switch track still consumes its ten native ticks without mutating the platform bit',async()=>{
 assert.equal(data.models.switch.states[0].animation,null);assert.equal(data.models.switch.states[0].nativeFrames,10);const f=setup();let done=false;const p=f.task.begin('switch',2).then(v=>done=v);f.task.tick(9/30);assert.equal(done,false);assert.equal(f.task.visual(5).frame,9);f.task.tick(1/30);await p;assert.equal(done,true);assert.deepEqual(f.task.snapshot.states,[0,0,0]);assert.equal(f.task.visual(5).state,1);
});
test('mid-platform checkpoint resumes without replaying start sound or applying the transition twice',async()=>{
 const f=setup();const old=f.task.begin('platform',1);f.task.tick(.75);const checkpoint=JSON.parse(JSON.stringify(f.native));f.task.cancel();assert.equal(await old,false);const restored=setup(checkpoint),p=restored.task.begin('platform',1);assert.deepEqual(restored.sounds,[]);while(restored.task.busy)restored.task.tick(1/60);assert.equal(await p,true);assert.deepEqual(restored.task.snapshot.states,[0,1,0]);assert.deepEqual(restored.sounds,[1776]);
 const again=setup(JSON.parse(JSON.stringify(restored.native)));again.task.tick(10);assert.deepEqual(again.task.snapshot.states,[0,1,0]);assert.equal(again.task.busy,false);assert.deepEqual(again.sounds,[]);
});
test('repeat inputs join the active task; leaving the gym settles it without toggling a bit',async()=>{
 const f=setup(),a=f.task.begin('platform',2),b=f.task.begin('platform',2);assert.equal(a,b);assert.throws(()=>f.task.begin('switch',1),/già/);f.task.tick(.2);f.native.zone=113;f.task.tick(1/60);assert.equal(await a,false);assert.equal(await b,false);assert.deepEqual(f.task.snapshot.states,[0,0,0]);assert.deepEqual(f.stops,[1744]);assert.deepEqual(f.sounds,[1744]);
});
test('native eight ramp gates follow the three stored bits and required movement mode',()=>{
 const f=setup(),allowed=()=>Array.from({length:8},(_,i)=>i).filter(i=>f.task.gate(i,2));assert.deepEqual(allowed(),[0,2,4,5]);f.native.brycenPuzzle.states=[1,0,1];assert.deepEqual(allowed(),[1,2,6,7]);for(const i of [-1,8,1.5,NaN])assert.equal(f.task.gate(i,2),false);assert.equal(f.task.gate(1,1),false);
});
test('invalid checkpoint data is rejected rather than silently clearing the puzzle',()=>{
 const f=setup({zone:114,brycenPuzzle:{version:1,states:[0,2,0],switches:[0,0,0]}});assert.throws(()=>f.task.snapshot,/non valido/);const g=setup();g.task.snapshot;g.native.brycenPuzzle.task={kind:'platform',index:0,start:0,frame:60,fraction:0};assert.throws(()=>g.task.snapshot,/non valida/);
});
test('other regions do not create a gym record or activate its ramp gates',()=>{
 const f=setup({zone:389});f.task.tick(.5);assert.equal(f.native.brycenPuzzle,undefined);assert.equal(f.task.gate(0,2),false);assert.equal(f.task.busy,false);assert.equal(f.task.visual(0),null);
});
