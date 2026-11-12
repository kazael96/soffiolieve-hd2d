const test=require('node:test'),assert=require('node:assert/strict'),data=require('./fixtures/drayden-native-task.json'),{create}=require('../src/league-gym-jump.js');
function setup(native={zone:121,fieldHeight:6},hero={x:12.5,y:15}){const sounds=[],task=create({data,state:()=>native,hero:()=>hero,sound:id=>sounds.push(id)});return {native,hero,task,sounds};}
test('native408 hops one tile laterally and lands two height units lower over the eight original samples',async()=>{
 for(const direction of [2,3]){
  const {task,native,hero,sounds}=setup(),pending=task.begin(direction);assert.equal(task.begin(direction),pending);
  for(let i=0;i<8;i++){task.tick(1/30);assert.equal(hero.x,12.5+(direction===2?-1:1)*(i+1)/8);assert.equal(hero.y,15);assert.equal(native.fieldHeight,6+[.5,1,.5,0,-.5,-1,-1.5,-2][i]);}
  assert.equal(await pending,true);assert.equal(task.busy,false);assert.deepEqual(sounds,[1374,1747]);
 }
});
test('fractional saved hops resume every sample at all speed settings without resetting height or sliding along z',async()=>{
 for(const direction of [2,3])for(let frame=0;frame<8;frame++)for(const speed of [1,2,4]){
  const a=setup(),pending=a.task.begin(direction);a.task.tick((frame+.25)/30);
  const b=setup(JSON.parse(JSON.stringify(a.native)),{x:-999,y:-999});assert.equal(b.task.restore(),true);assert.deepEqual(b.hero,a.hero);assert.equal(b.native.fieldHeight,a.native.fieldHeight);const resumed=b.task.wait();
  for(let step=0;step<20&&a.task.busy;step++)a.task.tick(speed/60);
  for(let step=0;step<20&&b.task.busy;step++)b.task.tick(speed/60);
  assert.equal(a.task.busy,false);assert.equal(b.task.busy,false);assert.equal(await pending,true);assert.equal(await resumed,true);assert.deepEqual(b.hero,a.hero);assert.deepEqual(b.native,a.native);
 }
});
test('invalid checkpoint/reentrant direction fail closed, and cancellation rolls back the full original pose',async()=>{
 const {task,native,hero}=setup();assert.throws(()=>task.begin(0),/Direzione/);const pending=task.begin(2);task.tick(.1);assert.throws(()=>task.begin(3),/già in corso/);task.cancel();assert.equal(await pending,false);assert.deepEqual(hero,{x:12.5,y:15});assert.equal(native.fieldHeight,6);
 native.draydenJump={version:1,direction:3,origin:[1,2,3],frame:8,fraction:0};assert.throws(()=>task.restore(),/non valido/);
});
test('cancelling a stale hop after scene change cannot teleport the hero or replace the new scene height',async()=>{
 const {task,native,hero}=setup(),pending=task.begin(2);task.tick(.1);native.zone=136;Object.assign(hero,{x:90,y:80});native.fieldHeight=20;task.cancel();assert.equal(await pending,false);assert.deepEqual(hero,{x:90,y:80});assert.equal(native.fieldHeight,20);
});
