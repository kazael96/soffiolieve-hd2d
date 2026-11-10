const test=require('node:test'),assert=require('node:assert/strict');
const Save=require('../src/league-gym-save.js'),Task=require('../src/league-gym-task.js'),Jump=require('../src/league-gym-jump.js'),data=require('./fixtures/drayden-native-task.json');
const options={data,taskFactory:Task.create,jumpFactory:Jump.create},clean=n=>Save.normalize(n,options);

function storyHost(){
 const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),c={structuredClone,LEAGUE_GYM_DATA:data,LeagueGymTask:Task,LeagueGymJump:Jump,LEAGUE_SCENES:{121:{permissionGrids:[{x:0,z:32},{x:32,z:32}]},214:{permissionGrids:[{x:320,z:64}]}},LEAGUE_RAILS:{121:{},214:{}}};
 vm.createContext(c);for(const file of ['league-gym-save.js','story-state.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),c);return c;
}

test('the real story save accepts declared new scenes and their native rails without lowering legacy levels or XP',()=>{
 const c=storyHost(),s={...c.StoryState.fresh(),phase:'opelucid',scene:'zone214',starter:'Snivy',party:[{name:'Snivy',level:65,xp:500000}],player:{x:321,y:66},original:{zone:214,flags:[9],vars:{},railCurrent:{zone:214,line:3,height:12}}};
 const normalized=c.StoryState.normalize(s);assert.ok(normalized);assert.equal(normalized.party[0].level,65);assert.equal(normalized.party[0].xp,500000);
 assert.equal(normalized.player.x,321);assert.equal(normalized.original.railCurrent.line,3);
 assert.equal(c.StoryState.normalize({...s,scene:'zone145',original:{zone:145}}),null,'future/postgame metadata is not admitted');
});

test('the actual storage reader isolates a broken puzzle instead of replacing the entire game',()=>{
 const c=storyHost(),s={...c.StoryState.fresh(),phase:'opelucid',scene:'zone121',starter:'Snivy',party:[{name:'Snivy',level:43,xp:12345}],player:{x:20,y:9},original:{zone:121,flags:[9],vars:{1:3},draydenPuzzle:null,fieldHeight:12}};
 const saved=c.StoryState.read({getItem:()=>JSON.stringify(s)});assert.equal(saved.phase,'opelucid');assert.equal(saved.party[0].xp,12345);assert.equal(saved.original.vars[1],3);assert.equal(saved.player.x,11.5);assert.equal(saved.player.y,33.5);assert.equal(saved.original.fieldHeight,0);
});

test('valid task checkpoints retain every frame and resume through the native controller',async()=>{
 for(const kind of ['button','arm','neck'])for(const speed of [1,2,4]){
  const duration={button:27,arm:41,neck:81}[kind];
  for(let frame=0;frame<duration;frame++){
   const native={zone:121},task=Task.create({data,state:()=>native});
   if(kind==='neck'){const arm=task.begin('arm',0,1);task.tick(41/30);await arm;}
   const pending=task.begin(kind,0,kind==='neck'?0:1);task.tick((frame+.25)/30);
   const saved=structuredClone(native);assert.equal(clean(saved),undefined);assert.deepEqual(saved,native);
   const restored=Task.create({data,state:()=>saved}),wait=restored.wait();
   while(task.busy)task.tick(speed/60);while(restored.busy)restored.tick(speed/60);
   assert.equal(await pending,true);assert.equal(await wait,true);assert.deepEqual(saved,native);
  }
 }
});

test('valid hop checkpoints preserve all native samples and fractions',()=>{
 for(const direction of [2,3])for(let frame=0;frame<8;frame++){
  const n={zone:121,draydenJump:{version:1,direction,origin:[12.5,15,6],frame,fraction:.25}};
  const before=structuredClone(n);clean(n);assert.deepEqual(n,before);
 }
});

test('continuous button approaches survive load, while corrupt approaches recover without losing inventory',()=>{
 const n={zone:121,fieldHeight:1,extraItems:{1:4},draydenJump:{version:1,direction:2,origin:[32.5,6.5,1],frame:0,fraction:0,approach:{from:[32.99,6.79,1],progress:.4}}},before=structuredClone(n);clean(n);assert.deepEqual(n,before);
 for(const bad of [{from:[32.99,6.79,1],progress:Infinity},{from:[32.99,6.79,1],progress:1},{from:[99,99,1],progress:.4},{from:[32.99,6.79,2],progress:.4}]){const copy=structuredClone(before);copy.draydenJump.approach=bad;assert.deepEqual(clean(copy),{x:11.5,y:33.5});assert.equal(copy.draydenJump,undefined);assert.deepEqual(copy.extraItems,{1:4});}
});

test('corrupt records recover to the native entrance without touching other progress',()=>{
 for(const draydenPuzzle of [null,{}, {version:1,dragons:[{neck:8,arms:[0,1]}]}]){
  const n={zone:121,flags:[33],vars:{12:5},extraItems:{1:2},fieldHeight:12,railCurrent:{zone:121,line:47},draydenPuzzle};
  const untouched=structuredClone({flags:n.flags,vars:n.vars,extraItems:n.extraItems});
  assert.deepEqual(clean(n),{x:11.5,y:33.5});assert.equal(n.fieldHeight,0);assert.equal(n.railCurrent,undefined);
  assert.deepEqual({flags:n.flags,vars:n.vars,extraItems:n.extraItems},untouched);
  assert.equal(n.draydenPuzzleRecovered,true);assert.doesNotThrow(()=>Task.create({data,state:()=>n}).snapshot);
 }
 for(const bad of [null,{version:1,direction:2,origin:[Infinity,0,0],frame:0,fraction:0},{version:1,direction:2,origin:[0,0,0],frame:8,fraction:0}]){
  const n={zone:121,draydenJump:bad};assert.deepEqual(clean(n),{x:11.5,y:33.5});assert.equal(n.draydenJump,undefined);
 }
});

test('foreign-room tasks roll back safely and old saves gain no puzzle state',()=>{
 const old={zone:120,vars:{1:2}};clean(old);assert.deepEqual(old,{zone:120,vars:{1:2}});
 const n={zone:121},task=Task.create({data,state:()=>n});task.begin('arm',0,1);task.tick(.1);n.zone=146;
 const expected=Task.create({data,state:()=>({zone:121})}).snapshot;
 clean(n);assert.deepEqual(n.draydenPuzzle,expected);assert.equal(n.fieldHeight,undefined);
 n.draydenJump={version:1,direction:2,origin:[0,0,0],frame:1,fraction:0};clean(n);assert.equal(n.draydenJump,undefined);
});

test('a wrong native track cannot survive load as a permanently locked field task',()=>{
 const n={zone:121},task=Task.create({data,state:()=>n});task.begin('button',0,0);n.draydenPuzzle.task.track=99;
 assert.deepEqual(clean(n),{x:11.5,y:33.5});assert.equal(n.draydenPuzzle.task,undefined);
});
