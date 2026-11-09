const test=require('node:test'),assert=require('node:assert/strict'),falls=require('../src/opelucid-npc-falls.js');
const record=kind=>({zone:161,index:1,stage:'walk',actor:{x:10.5,y:2.5,height:0},plan:{kind,leg:2,anchor:{x:10.5,y:2.5},points:[{x:10.5,y:2.5}]}});
for(const speed of [1,2,4])test('NPC native sink and landing clocks at ×'+speed,()=>{
 falls.configure({activeZone:()=>122});const r=record('fall');assert.equal(falls.canExit(r),false);for(let i=0;i<34;i++)falls.tick(r,1/30);assert.equal(r.plan.fallExit.frame,34);assert.equal(r.actor.jumpLift,-1.875);assert.equal(falls.canExit(r),true);assert.equal(r.stage,'hold');
 const next=record('arrival');next.plan.fallEntry=true;falls.enter(next);assert.equal(next.actor.jumpLift,250/16);for(let i=0;i<40/speed;i++)assert.equal(falls.tick(next,speed/30),true);assert.equal(next.plan.fallEntry.frame,40);assert.equal(next.actor.jumpLift,undefined);assert.equal(next.actor.noShadow,undefined);assert.equal(falls.tick(next,speed/30),false);
});
test('NPC drop waits for current resources and emits its original sounds once',async()=>{
 let ready;const pending=new Promise(resolve=>ready=resolve),sounds=[];falls.configure({activeZone:()=>161,prepare:()=>pending,sound:id=>sounds.push(id)});const r=record('arrival');r.plan.fallEntry=true;falls.enter(r);falls.tick(r,1/30);assert.equal(r.plan.fallEntry.frame,0);assert.equal(r.actor.npcFallPending,true);await Promise.resolve();ready();for(let i=0;i<12;i++)await Promise.resolve();for(let i=0;i<44;i++)falls.tick(r,1/30);assert.deepEqual(sounds,[1665,1666]);assert.equal(r.actor.npcFallPending,undefined);
});
test('restoring a fall preserves its curve without replaying the takeoff sound',async()=>{
 const sounds=[];falls.configure({activeZone:()=>122});const r=record('arrival');r.plan.fallEntry=true;falls.enter(r);for(let i=0;i<17;i++)falls.tick(r,1/30);const copy=JSON.parse(JSON.stringify(r)),lift=r.actor.jumpLift;delete copy.actor.jumpLift;assert.equal(falls.restore(copy,{kind:'arrival',fallEntry:true}),copy);assert.equal(copy.actor.jumpLift,lift);falls.configure({activeZone:()=>161,prepare:async()=>{},sound:id=>sounds.push(id)});falls.tick(copy,1/30);for(let i=0;i<12;i++)await Promise.resolve();await Promise.resolve();for(let i=0;i<45;i++)falls.tick(copy,1/30);assert.deepEqual(sounds,[1666]);
});
test('visible lower-camera head keeps submerging; no adapter claims a GPU result',()=>{
 falls.configure({activeZone:()=>122});const r=record('fall');for(let i=0;i<60;i++)falls.tick(r,1/30);assert.equal(r.plan.fallExit.frame,49);assert.equal(r.actor.jumpLift,-4);assert.equal(r.zero,undefined);assert.equal(r.zone,161);
});
test('damaged or unrelated saved fall phases are rejected',()=>{
 falls.configure({activeZone:()=>122});const r=record('fall');falls.tick(r,1/30);for(const frame of [-1,50,NaN]){const copy=structuredClone(r);copy.plan.fallExit.frame=frame;assert.equal(falls.restore(copy,{kind:'fall',anchor:r.plan.anchor}),null);}assert.equal(falls.restore(r,{kind:'door'}),null);
});
