const {test}=require('node:test'),assert=require('node:assert/strict');
const {Controller}=require('../src/field-actor-exits.js');
const actor=()=>({name:'Belle',uid:4,model:134,fieldZone:398,x:-9.5,y:2.5,height:0,frame:3,direction:1});
test('reload halfway through a door passage rebuilds its visual door handle before walking',async()=>{
 let sequence=0;const c=new Controller({sample:()=>({visible:true,sequence:++sequence})});c.depart(actor(),398);
 for(let i=0;i<100;i++){c.tick(1/30);await Promise.resolve();const r=c.records.get('Belle');if(r.opened&&r.actor.y>4)break;}
 const saved=JSON.parse(JSON.stringify(c.save()));assert.equal(saved[0].opened,true);assert.equal(saved[0].stage,'walk');let opens=0;
 const loaded=new Controller({sample:()=>({visible:true,sequence:++sequence}),portal:async()=>{opens++;return 42}});loaded.restore(saved,398);
 const before=loaded.records.get('Belle').actor.y;for(let i=0;i<30;i++){loaded.tick(1/30);await Promise.resolve();}
 assert.equal(opens,1,'a saved logical open flag cannot replace the new renderer door handle');assert.ok(loaded.records.get('Belle').actor.y>before);
});
test('damaged departure records are isolated rather than freezing the whole loaded game',()=>{
 const good={key:'Belle',actor:actor(),zone:398,plan:{kind:'door',anchor:{x:-9.5,y:3.5},points:[{x:-9.5,y:3.5},{x:-9.5,y:6.3}],clip:[0,0,-1,3.5]},index:0,stage:'walk',opened:false};
 const bad=[{...good,plan:{kind:'path',points:null}},{...good,plan:{kind:'path',points:[null]}},{...good,plan:{kind:'door',points:[],anchor:null}},{...good,index:-1},{...good,index:99999},{...good,stage:'unknown'},{...good,actor:{...actor(),name:null}},{...good,plan:{kind:'unknown',points:[]}}];
 for(const row of bad){const c=new Controller();assert.doesNotThrow(()=>{c.restore([row],398);c.visible([],{});c.tick(1/30);});assert.equal(c.records.size,0,'invalid saved record must be ignored');}
 assert.doesNotThrow(()=>new Controller().restore({not:'an array'},398));
 const c=new Controller();c.restore([bad[0],good],398);assert.equal(c.records.size,1,'one damaged row must not discard a valid traveller');
});
test('an adopted resident survives a reload while its next logical actor is temporarily absent',()=>{
 let sequence=0;const c=new Controller({sample:()=>({visible:false,sequence:++sequence})}),a={...actor(),name:'Komor',fieldZone:317};c.preserve([a],[],{sameField:true});c.visible([{...a,x:a.x+3}],{x:0,y:0});c.tick(1/30);assert.equal(c.records.get('Komor').stage,'rejoin');
 const loaded=new Controller({sample:()=>({visible:false,sequence:++sequence})});loaded.restore(JSON.parse(JSON.stringify(c.save())),317);for(let i=0;i<300;i++)loaded.tick(1/30);assert.equal(loaded.records.size,1,'waiting for the next logical actor is not an exit');assert.equal(loaded.retired.length,0);
 const end={...a,x:a.x+3};for(let i=0;i<120;i++){loaded.visible([end],{x:0,y:0});loaded.tick(1/30);}assert.equal(loaded.records.size,0);assert.equal(loaded.visible([end],{x:0,y:0})[0],end);
});
test('door snapshots resume from every passage phase without losing clipping or position',async()=>{
 let sequence=0;const source=new Controller({sample:()=>({visible:true,sequence:++sequence})});source.depart(actor(),398);const snapshots=[];
 for(let i=0;i<80;i++){source.tick(1/30);await Promise.resolve();if(i%4===0)snapshots.push(JSON.parse(JSON.stringify(source.save())));}
 for(const saved of snapshots){const c=new Controller({sample:()=>({visible:true,sequence:++sequence})});c.restore(saved,398);assert.equal(c.records.get('Belle').actor.y,saved[0].actor.y);for(let i=0;i<150;i++){c.tick(1/30);await Promise.resolve();}const r=c.records.get('Belle');assert.equal(r.stage,'hold');assert.ok(Math.abs(r.actor.y-6.3)<1e-8);assert.deepEqual(r.actor.exitClip,[0,0,-1,3.5]);}
 assert.equal(snapshots.length,20);
});
test('saved visual identities and counters cannot be replaced by damaged bookkeeping',()=>{
 const row={key:'wrong-key',actor:actor(),zone:398,plan:{kind:'resident',points:[],clip:null},index:0,stage:'resident',age:'bad',travel:null,handle:123,error:'old error',resolve:'not a function'};
 const c=new Controller();c.restore([row,{...row,key:'another-key'}],398);assert.equal(c.records.size,1);const r=c.records.get('Belle');assert.equal(r.age,0);assert.equal(r.travel,0);assert.equal(r.handle,undefined);assert.equal(r.error,undefined);assert.equal(r.resolve,undefined);assert.doesNotThrow(()=>c.clear());
});
