const {test}=require('node:test'),assert=require('node:assert/strict');
const {Controller,route,plan}=require('../src/field-actor-exits.js');
const actor=(name='Belle')=>({name,uid:3,model:134,fieldZone:389,x:-2.5,y:5.5,height:0,frame:0,direction:0,flip:false});
test('a visible outdoor departure survives logical deletion and never retires on a missing GPU result',()=>{
 const n=actor('Komor'),c=new Controller();c.depart(n,317);n.hidden=true;
 for(let i=0;i<100;i++)c.tick(1/30);
 assert.equal(c.visible([],{x:0,y:0}).length,1);assert.equal(c.retired.length,0);const body=[...c.records.values()][0].actor;assert.equal(c.occupied(body.x,body.y),true);
 const saved=c.save(),loaded=new Controller();loaded.restore(JSON.parse(JSON.stringify(saved)),317);assert.equal(loaded.visible([],{x:0,y:0}).length,1);
});
test('two distinct invisible rendered frames retire an outdoor actor; visible frames reset the proof',()=>{
 let sample=null;const n=actor('Komor'),c=new Controller({sample:()=>sample});c.depart(n,317);for(let i=0;i<20;i++)c.tick(1/30);
 sample={sequence:1,visible:false};c.tick(1/30);c.tick(1/30);assert.equal(c.records.size,1);
 sample={sequence:2,visible:true};c.tick(1/30);sample={sequence:3,visible:false};c.tick(1/30);assert.equal(c.records.size,1);
 sample={sequence:4,visible:false};c.tick(1/30);assert.equal(c.records.size,0);assert.equal(c.retired[0].reason,'rendered-invisible');
});
test('stairs and doors cross a portal and wait for actual invisibility, without alpha fades',async()=>{
 let sequence=0,hidden=false;const c=new Controller({sample:()=>({sequence:++sequence,visible:!hidden})});const n={...actor('Komor'),fieldZone:391,x:-6.5,y:-13.5};c.depart(n,391);let done=false;c.wait(n).then(()=>done=true);
 for(let i=0;i<100;i++){c.tick(1/30);await Promise.resolve();}const r=[...c.records.values()][0];assert.equal(r.stage,'hold');assert.equal(r.actor.height,-2.5);assert.deepEqual(r.actor.exitClip,[0,1,0,-.04]);assert.equal(done,false);assert.equal(r.actor.alpha,undefined);
 hidden=true;c.tick(1/30);c.tick(1/30);await Promise.resolve();assert.equal(done,true);assert.equal(c.records.size,0);
 const p=plan({...actor(),x:-9.5,y:-5.5},390,()=>false);assert.equal(p.kind,'door');assert.ok(p.points.at(-1).y>-5.5);
});
test('adjoining outdoor map rebuilds retain visible residents and adopt a returning identity smoothly',()=>{
 const c=new Controller(),n=actor('Mamma');c.preserve([n],[],{sameField:true});assert.equal(c.visible([],{x:0,y:0}).length,1);
 const returning={...n,x:n.x+2};c.visible([returning],{x:0,y:0});assert.equal(c.records.size,1);
 const d=new Controller();d.depart(actor('Komor'),317);const future={...actor('Komor'),x:0,y:0};const before=d.visible([future],{x:0,y:0})[0];const x=before.x;d.tick(1/30);assert.ok(Math.abs(before.x-x)<=.25);assert.equal(d.visible([future],{x:0,y:0}).length,1);
});
test('save/restore preserves a portal cut and never restores an old invisibility certificate',()=>{
 const n={...actor('Komor'),fieldZone:391,x:-6.5,y:-13.5},c=new Controller();c.depart(n,391);const r=[...c.records.values()][0];r.stage='hold';r.opened=true;r.actor.height=-2.5;r.zero=2;
 const restored=new Controller();restored.restore(JSON.parse(JSON.stringify(c.save())),391);const next=[...restored.records.values()][0];assert.deepEqual(next.actor.exitClip,r.plan.clip);assert.equal(next.zero,0);assert.equal(next.actor.noShadow,true);
});
test('deleting an adopted identity converts it back into a departure, never a visible handoff to a hidden target',()=>{
 const c=new Controller(),n=actor('Komor');c.depart(n,317);const next={...n,x:n.x+2};c.visible([next],{x:0,y:0});assert.equal([...c.records.values()][0].stage,'rejoin');c.depart(next,317);next.hidden=true;c.visible([],{x:0,y:0});c.tick(1/30);assert.equal(c.records.size,1);assert.notEqual([...c.records.values()][0].stage,'rejoin');assert.equal(c.retired.length,0);
});
test('routing respects blocked cells; the consumed gift and covered scenes do not invent walking people',()=>{
 const blocked=(x,y)=>x===1.5&&y===.5,path=route({x:.5,y:.5},{x:2.5,y:.5},blocked);assert.ok(path.length>2);assert.ok(path.every(p=>!blocked(p.x,p.y)));
 const c=new Controller();assert.equal(c.depart({...actor(),model:208},391),false);assert.equal(c.depart(actor(),389,{covered:true}),false);assert.equal(c.records.size,0);
});
