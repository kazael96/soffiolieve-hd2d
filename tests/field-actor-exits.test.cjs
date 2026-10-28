const {test}=require('node:test'),assert=require('node:assert/strict');
const {Controller,route,plan}=require('../src/field-actor-exits.js');
const actor=(name='Belle')=>({name,uid:3,model:134,fieldZone:389,x:-2.5,y:5.5,height:0,frame:0,direction:0,flip:false});

test('generic city men sharing the father sprite remain separate visible identities',()=>{
 const c=new Controller(),a={...actor('Padre'),fieldZone:397,uid:9},b={...actor('Padre'),fieldZone:397,uid:27,x:4.5};
 assert.equal(c.visible([a,b],{x:0,y:0}).length,2);
 c.depart(a,397);assert.equal(c.visible([b],{x:0,y:0}).length,2);
 const saved=c.save(),loaded=new Controller();loaded.restore(JSON.parse(JSON.stringify(saved)),397);assert.equal(loaded.visible([b],{x:0,y:0}).length,2);
});
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
test('Aralia returns to the laboratory door in the background, never retires halfway there',async()=>{let sequence=0,opened=0;const c=new Controller({sample:()=>({sequence:++sequence,visible:false}),portal:async()=>{opened++;return 7}}),n={...actor('Aralia'),model:105,fieldZone:317,x:4.5,y:-30.5};c.depart(n,317);const r=c.records.get('Aralia');assert.equal(r.plan.destination,'lab');assert.equal(r.plan.background,true);assert.deepEqual(r.plan.anchor,{x:-6.5,y:-11.5});await c.wait(n);for(let i=0;i<20;i++)c.tick(1/30);assert.equal(c.records.size,1,'offscreen walking alone cannot remove Aralia');for(let i=0;i<1200&&c.records.size;i++){c.tick(1/30);await Promise.resolve();}assert.equal(opened,1);assert.equal(c.records.size,0);assert.ok(c.retired[0].y<-11.5);});
test('old northbound or stranded Aralia saves are redirected from their exact position',()=>{const c=new Controller(),n={...actor('Aralia'),model:105,fieldZone:317,x:4.5,y:-82.5};c.restore([{key:'Aralia',actor:n,zone:317,plan:{kind:'path',points:[],clip:null},stage:'hold',index:50,opened:false,travel:60,age:40}],317);const r=c.records.get('Aralia');assert.equal(r.actor.x,n.x);assert.equal(r.actor.y,n.y);assert.equal(r.stage,'walk');assert.equal(r.plan.destination,'lab');assert.equal(r.index,0);assert.equal(r.zero,0);});
test('long outdoor routes search toward the destination without scanning thousands of irrelevant cells',()=>{let checks=0;const p=route({x:4.5,y:5.5},{x:4.5,y:-82.5},()=>{checks++;return false});assert.equal(p.length,88);assert.deepEqual(p.at(-1),{x:4.5,y:-82.5});assert.ok(checks<400,'bounded useful work for a straight route: '+checks);});
