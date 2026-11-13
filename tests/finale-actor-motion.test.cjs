const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/finale-field-host.cjs');
test('Castle278 resolves both native selectors after init and restores the correct pose on reentry',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 for(const [phase,graphic]of [[0,214],[4,213],[5,222],[0,214]]){
  n.vars[16566]=phase;n.flags=n.flags.filter(f=>![660,661].includes(f));
  await drain(c,c.NativeStory.changeZone(278,1,1));
  for(const [id,model,raw]of [[4,212,163],[5,graphic,162]]){
   const actor=c.npcs.find(a=>a.uid===id);assert.equal(actor.model,model,'Phase '+phase+' actor '+id);assert.equal(actor.sourceModel,raw);
   assert.equal(actor.name,'Original'+model);assert.equal(actor.worldWidth,4);assert.equal(actor.worldHeight,4);
   const allowed=model===222?[7,8,9,10,11]:[0,1,2,3];
   for(let frame=0;frame<300;frame++)assert.ok(allowed.includes(c.FinaleActorMotion.visual(actor,frame/30).frame),'Service cell must not render');
  }
 }
 assert.equal(c.FinaleActorMotion.model(121,162,n.vars),162,'Earlier gym retains its own selector');
 assert.equal(c.FinaleActorMotion.visual({fieldZone:213,model:213},0),null,'Earlier tower retains its own flight controller');
});
test('native Castle dragon position preserves explicit height2 during the final Poké Ball release',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16566]=5;n.flags=n.flags.filter(f=>f!==660);await drain(c,c.NativeStory.changeZone(278,1,1));
 const m=c.NativeStory.vm;m.data.scripts[9011]={entries:[0],code:{0:{op:109,name:'ActorSetGPos',args:[5,16,2,7,1],end:12},12:{op:2,name:'VMHalt',args:[],end:14}}};await drain(c,m.run(9011,0));const a=c.npcs.find(a=>a.uid===5);assert.equal(a.height,2);assert.deepEqual([a.x,a.y],[.5,-8.5]);assert.equal(a.model,222);assert.equal(a.worldWidth,4);
});
