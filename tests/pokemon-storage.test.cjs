const test=require('node:test'),assert=require('node:assert/strict'),PC=require('../src/pokemon-storage.js');
const mon=(id,hp=20)=>({name:'Snivy',nickname:'Test '+id,personality:id,hp,status:'psn',level:39,xp:50000,pp:[{id:33,left:0,ups:2}],heldItem:0,ivs:{hp:31},met:{zone:113,date:'2026-11-04T12:00:00Z',level:20}});
function setup(party=[mon(1),mon(2)]){const state={party,storage:PC.fresh()},pc=PC.create(state,{toBox:p=>({...p,pp:p.pp.map(m=>({...m,left:56}))}),toParty:p=>({...p,hp:100,status:''}),isMail:id=>id===137});return {state,pc};}
const slot=(box,slot)=>({box,slot}),party=slot=>({party:true,slot});
test('Box storage starts at8, preserves30 indexed slots and expands only at native triggers',()=>{
 const {state,pc}=setup();assert.equal(pc.enter().unlocked,8);for(let i=0;i<8;i++)state.storage.boxes[i][29]=mon(i+10);assert.equal(pc.enter().unlocked,16);assert.equal(pc.enter().unlocked,16);for(let i=8;i<16;i++)state.storage.boxes[i][29]=mon(i+10);assert.equal(pc.enter().unlocked,24);assert.equal(pc.enter().unlocked,24);assert.equal(state.storage.boxes[0][0],null);assert.equal(state.storage.boxes[0][29].personality,10);
});
test('deposit and withdrawal preserve identity while applying only native storage recovery',()=>{
 const {state,pc}=setup(),before=structuredClone(state.party[0]);assert.deepEqual(pc.move(party(0),slot(0,17)),{ok:true});assert.equal(state.party.length,1);const boxed=pc.get(slot(0,17));assert.deepEqual(boxed,{...before,pp:[{id:33,left:56,ups:2}]});assert.deepEqual(pc.move(slot(0,17),party(1)),{ok:true});assert.equal(state.party[1].personality,before.personality);assert.equal(state.party[1].hp,100);assert.equal(state.party[1].status,'');assert.equal(state.party[0].status,'psn');assert.equal(pc.get(slot(0,17)),null);
});
test('last usable Pokemon and Mail checks reject deposit without any mutation',()=>{
 for(const rest of [[mon(2,0)],[{...mon(2),egg:true}],[]]){const {state,pc}=setup([mon(1),...rest]),before=JSON.stringify(state);assert.equal(pc.move(party(0),slot(0,0)).reason,'last');assert.equal(JSON.stringify(state),before);}
 const {state,pc}=setup();state.party[0].heldItem=137;state.party[0].mail={body:'hello'};const before=JSON.stringify(state);assert.equal(pc.move(party(0),slot(0,0)).reason,'mail');assert.equal(pc.release(party(0)).reason,'mail');assert.equal(JSON.stringify(state),before);
});
test('box-party swaps recover incoming Pokemon and remain atomic when conversion fails',()=>{
 const {state,pc}=setup([mon(1)]);state.storage.boxes[2][9]=mon(3,0);assert.equal(pc.move(slot(2,9),party(0)).ok,true);assert.equal(state.party[0].personality,3);assert.equal(state.party[0].hp,100);assert.equal(state.storage.boxes[2][9].personality,1);
 const broken=PC.create(state,{toBox(){throw Error('conversion');},toParty:p=>p}),before=JSON.stringify(state);assert.throws(()=>broken.move(party(0),slot(2,9)),/conversion/);assert.equal(JSON.stringify(state),before);
});
test('capture searches open boxes before expanding and never creates a seventh party member',()=>{
 const {state,pc}=setup(Array.from({length:6},(_,i)=>mon(i)));state.storage.current=7;state.storage.boxes[7].fill(mon(20));assert.deepEqual(pc.capture(mon(100)),{ok:true,box:0,slot:0});assert.equal(state.party.length,6);assert.equal(state.storage.unlocked,8);
 for(let b=0;b<8;b++)state.storage.boxes[b].fill(mon(20));assert.deepEqual(pc.capture(mon(101)),{ok:true,box:8,slot:0});assert.equal(state.storage.unlocked,16);
 for(const b of state.storage.boxes)b.fill(mon(20));const before=JSON.stringify(state);assert.equal(pc.capture(mon(102)).reason,'full');assert.equal(JSON.stringify(state),before);assert.equal(pc.full,true);
});
test('moving within a box or party retains damage and moves rather than healing',()=>{
 const {state,pc}=setup();const before=structuredClone(state.party[0]);assert.equal(pc.move(party(0),party(1)).ok,true);assert.deepEqual(state.party[1],before);state.storage.boxes[3][11]=mon(12,0);assert.equal(pc.move(slot(3,11),slot(5,7)).ok,true);assert.equal(pc.get(slot(5,7)).hp,0);assert.equal(pc.get(slot(3,11)),null);
});
test('normalization isolates malformed slots without compressing valid records or hiding occupied boxes',()=>{
 const raw=PC.fresh();raw.boxes[23][29]=mon(9);raw.boxes[0][1]={bad:true};const clean=PC.normalize(raw,p=>p.name?structuredClone(p):null);assert.equal(clean.unlocked,24);assert.equal(clean.boxes[23][29].personality,9);assert.equal(clean.boxes[0][1],null);assert.equal(clean.boxes.length,24);assert.ok(clean.boxes.every(b=>b.length===30));assert.notEqual(clean.boxes[23][29],raw.boxes[23][29]);
});
test('release rejects eggs/last conscious member and does not return held items implicitly',()=>{
 const {state,pc}=setup([mon(1),mon(2,0)]);assert.equal(pc.release(party(0)).reason,'last');state.storage.boxes[0][0]={...mon(3),egg:true};assert.equal(pc.release(slot(0,0)).reason,'egg');state.storage.boxes[0][1]={...mon(4),heldItem:17};assert.equal(pc.release(slot(0,1)).ok,true);assert.equal(pc.get(slot(0,1)),null);
});
test('swapping the last usable member with a boxed egg is rejected atomically',()=>{
 const {state,pc}=setup([mon(1)]);state.storage.boxes[0][4]={...mon(9),egg:true};const before=JSON.stringify(state);assert.equal(pc.move(slot(0,4),party(0)).reason,'last');assert.equal(JSON.stringify(state),before);
});
test('invalid/locked destinations and host lock reject mutations',()=>{
 const {state,pc}=setup(),before=JSON.stringify(state);for(const at of [slot(8,0),slot(0,30),party(6),slot(-1,0)])assert.equal(pc.move(party(0),at).reason,'location');assert.equal(JSON.stringify(state),before);const locked=PC.create(state,{allowed:()=>false});assert.equal(locked.capture(mon(3)).reason,'busy');assert.equal(locked.release(party(0)).reason,'busy');assert.equal(locked.move(party(0),slot(0,0)).reason,'busy');assert.equal(JSON.stringify(state),before);
});
