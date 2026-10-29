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
 let sample=null;const n=actor('N'),c=new Controller({sample:()=>sample});c.depart(n,317);for(let i=0;i<20;i++)c.tick(1/30);
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
 const c=new Controller(),n=actor('N');c.depart(n,317);const next={...n,x:n.x+2};c.visible([next],{x:0,y:0});assert.equal([...c.records.values()][0].stage,'rejoin');c.depart(next,317);next.hidden=true;c.visible([],{x:0,y:0});c.tick(1/30);assert.equal(c.records.size,1);assert.notEqual([...c.records.values()][0].stage,'rejoin');assert.equal(c.retired.length,0);
});
test('routing respects blocked cells; the consumed gift and covered scenes do not invent walking people',()=>{
 const blocked=(x,y)=>x===1.5&&y===.5,path=route({x:.5,y:.5},{x:2.5,y:.5},blocked);assert.ok(path.length>2);assert.ok(path.every(p=>!blocked(p.x,p.y)));
 const c=new Controller();assert.equal(c.depart({...actor(),model:208},391),false);assert.equal(c.depart(actor(),389,{covered:true}),false);assert.equal(c.records.size,0);
});
test('Aralia reaches the next event in front of the Center and remains visible there',async()=>{let sequence=0,opened=0;const c=new Controller({sample:()=>({sequence:++sequence,visible:false}),portal:async()=>{opened++}}),n={...actor('Aralia'),model:105,fieldZone:317,x:4.5,y:-30.5};c.depart(n,317);const r=c.records.get('Aralia');assert.equal(r.plan.destination,'center-front');assert.equal(r.plan.background,true);assert.deepEqual(r.plan.anchor,{x:12.5,y:-93.5});await c.wait(n);for(let i=0;i<1400;i++)c.tick(1/30);assert.equal(opened,0);assert.equal(c.records.size,1,'arrival never retires, even if offscreen');assert.equal(r.stage,'resident');assert.equal(r.actor.fieldZone,397);assert.equal(r.actor.uid,6);assert.equal(r.actor.x,12.5);assert.equal(r.actor.y,-93.5);assert.equal(c.retired.length,0);const next={...r.actor,script:8};assert.equal(c.visible([next],{x:4.5,y:-90.5})[0],next);assert.equal(c.records.size,0);});

test('old laboratory-bound or stranded Aralia saves keep their exact position and head to the Center',()=>{for(const oldPlan of [{kind:'path',points:[],clip:null},{kind:'door',destination:'lab',points:[],clip:[1,0,0,2]}]){const c=new Controller(),n={...actor('Aralia'),model:105,fieldZone:317,x:4.5,y:-82.5};c.restore([{key:'Aralia',actor:n,zone:317,plan:oldPlan,stage:'hold',index:50,opened:true,travel:60,age:40}],317);const r=c.records.get('Aralia');assert.equal(r.actor.x,n.x);assert.equal(r.actor.y,n.y);assert.equal(r.stage,'walk');assert.equal(r.plan.destination,'center-front');assert.equal(r.index,0);assert.equal(r.zero,0);assert.equal(r.actor.exitClip,undefined);}});

test('friends travel to comparison positions, then to the plaza or Center rather than sharing a generic exit',()=>{for(const [name,uid,expected,x,y]of [['Komor',250,'route-comparison',8.5,-71.5],['Belle',240,'route-comparison',6.5,-75.5],['Komor',3,'plaza',1.5,-93.5],['Belle',4,'center-interior',12.5,-94.5]]){const p=plan({...actor(name),uid},317,()=>false);assert.equal(p.destination,expected);assert.equal(p.anchor.x,x);assert.equal(p.anchor.y,y);assert.ok(p.background);}});

test('Belle waits to the side of the Center when Aralia occupies the doorway, without locking the event',async()=>{let occupied=true;const c=new Controller({sample:()=>({visible:true,sequence:1}),obstructed:(r,p)=>occupied&&Math.abs(p.x-12.5)<.65&&Math.abs(p.y+93.5)<.65}),n={...actor('Belle'),uid:4,x:10.5,y:-93.5};c.depart(n,317);await c.wait(n);for(let i=0;i<100;i++)c.tick(1/30);const r=c.records.get('Belle');assert.equal(r.stage,'walk');assert.ok(r.actor.x<=11.875);assert.ok(Math.abs(r.actor.y+93.5)<.01);occupied=false;for(let i=0;i<300;i++){c.tick(1/30);await Promise.resolve();}assert.equal(r.stage,'hold');assert.ok(r.actor.y<-94.5);});

test('old friend saves adopt the next event from current story progress and resume an unfinished trip',()=>{for(const name of ['Komor','Belle']){const c=new Controller(),a={...actor(name),uid:name==='Komor'?250:240,x:6.5,y:-66.5};c.restore([{key:name,actor:a,zone:317,plan:{kind:'resident',points:[],clip:null},stage:'resident',index:0}],317,{vars:{16508:2},flags:[515]});const r=c.records.get(name);assert.equal(r.actor.x,a.x);assert.equal(r.actor.y,a.y);assert.equal(r.plan.destination,name==='Komor'?'plaza':'center-interior');c.tick(1/30);const saved=JSON.parse(JSON.stringify(c.save())),again=new Controller();again.restore(saved,397,{vars:{16508:2},flags:[515]});assert.equal(again.records.get(name).actor.x,r.actor.x);assert.equal(again.records.get(name).actor.y,r.actor.y);assert.equal(again.records.get(name).index,r.index);}});

test('handoffs follow walkable cells rather than cutting directly through obstacles',()=>{const blocked=(x,y)=>x===1.5&&y===.5,c=new Controller({blocked}),n={...actor('Komor'),x:.5,y:.5};c.preserve([n],[],{sameField:true});const target={...n,x:2.5};for(let i=0;i<100;i++){c.visible([target],{x:0,y:0});c.tick(1/30);const r=c.records.get('Komor');if(r)assert.ok(!blocked(r.actor.x,r.actor.y));}assert.equal(c.records.size,0);});

test('long outdoor routes search toward the destination without scanning thousands of irrelevant cells',()=>{let checks=0;const p=route({x:4.5,y:5.5},{x:4.5,y:-82.5},()=>{checks++;return false});assert.equal(p.length,88);assert.deepEqual(p.at(-1),{x:4.5,y:-82.5});assert.ok(checks<400,'bounded useful work for a straight route: '+checks);});
