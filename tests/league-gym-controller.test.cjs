const test=require('node:test'),assert=require('node:assert/strict'),data=require('./fixtures/drayden-native-task.json'),scripts=require('./fixtures/drayden-button-scripts.json');
const {FieldEventVM}=require('../src/field-event-vm.js'),taskFactory=require('../src/league-gym-task.js').create,jumpFactory=require('../src/league-gym-jump.js').create,{create}=require('../src/league-gym.js');
function setup(){const native={zone:121,vars:{},flags:[],fieldHeight:6},hero={x:12.5,y:15},calls=[];const controller=create({data,state:()=>native,hero:()=>hero,taskFactory,jumpFactory,save(){},sound(){},stopSound(){},visualFactory:()=>({prepare:async()=>true,release:()=>calls.push('release'),apply(){}})});return{native,hero,controller,calls};}
test('real VM button programs execute hop, pattern, arm and neck sequentially with no pending task',async()=>{
 for(let entry=2;entry<8;entry++){
  const f=setup(),commands=[];const machine=new FieldEventVM(scripts,f.native,{command:async(command,args,values)=>{
   if(/^NativeOpcode40[7-9]$|^NativeOpcode410$/.test(command.name)){
    commands.push(command.name);const pending=f.controller.command(command.name,args,values);let frames=0;
    while(f.controller.busy&&frames++<100)f.controller.tick(1/30);
    assert.ok(frames<=81);return await pending;
   }
   return new Set(['ActorPauseAll','ActorUnlockAll','RTFinishSubEvents','EVCameraInit','EVCameraUnbind','EVCameraMoveTo','EVCameraWait','EVCameraMoveToDefault','EVCameraRebind','EVCameraEnd']).has(command.name);
  }});
  await machine.run(242,entry);assert.deepEqual(commands,['NativeOpcode408','NativeOpcode407','NativeOpcode410','NativeOpcode409']);assert.equal(f.controller.busy,false);assert.equal(f.hero.x,12.5+(entry%2===0?1:-1));assert.equal(f.hero.y,15);assert.equal(f.native.fieldHeight,4);f.controller.dispose();
 }
});
test('unknown/native commands from another zone remain unhandled and leaving a scene cannot mutate its hero',async()=>{
 const f=setup();assert.equal(await f.controller.command('NativeOpcode139',[274]),false);const pending=f.controller.command('NativeOpcode408',[2]);f.controller.tick(.1);assert.equal(f.controller.heightAt(f.hero.x,f.hero.y),6.5);assert.equal(f.controller.heightAt(-100,-100),null);
 f.native.zone=136;Object.assign(f.hero,{x:90,y:80});f.native.fieldHeight=20;f.controller.enter(136);await assert.rejects(pending,/annullato/);assert.deepEqual(f.hero,{x:90,y:80});assert.equal(f.native.fieldHeight,20);assert.equal(await f.controller.command('NativeOpcode406',[]),false);assert.equal(f.controller.busy,false);f.controller.dispose();
});
test('rail gate installation is owned, idempotent and preserves unrelated zones',()=>{
 const before=globalThis.NativeRailGates;globalThis.NativeRailGates={28:()=>false};const f=setup(),g=setup();
 try{f.controller.install();f.controller.install();assert.equal(globalThis.NativeRailGates[28](),false);assert.equal(globalThis.NativeRailGates[121](30),true);assert.equal(globalThis.NativeRailGates[121](32),false);assert.throws(()=>g.controller.install(),/altro controllore/);f.controller.dispose();assert.equal(globalThis.NativeRailGates[121],undefined);assert.equal(globalThis.NativeRailGates[28](),false);}finally{f.controller.dispose();g.controller.dispose();if(before===undefined)delete globalThis.NativeRailGates;else globalThis.NativeRailGates=before;}
});
