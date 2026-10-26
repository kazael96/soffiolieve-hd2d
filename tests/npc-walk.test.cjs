const test=require('node:test'),assert=require('node:assert/strict'),walk=require('../src/npc-walk.js');
function actor(code=3,width=2,height=1){const n={x:.5,y:.5,direction:code===5?2:1};n.wander=walk.create({movement:code,width,height},n);return n;}
const pose=(n,dir,frame)=>{n.direction=dir;n.frame=frame;};
test('original wandering stays within event bounds and directional masks',()=>{
 for(const [code,width,height] of [[3,2,0],[3,0,3],[3,2,1],[4,0,1],[5,2,0]]){
  const n=actor(code,width,height),positions=new Set();let seed=17;
  for(let i=0;i<6000;i++){
   walk.update(n,{start:true,blocked:()=>false,pose,random:()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;}});
   assert.ok(Math.abs(n.x-.5)<=width);assert.ok(Math.abs(n.y-.5)<=height);positions.add(n.x+','+n.y);
   if(code===4)assert.ok(n.direction<2);if(code===5&&i>1)assert.ok(n.direction>=2);
  }
  assert.ok(positions.size>8,'Ambient actor actually walks');
 }
});
test('a paused actor finishes its step, reserves both cells and does not start another',()=>{
 const n=actor();let frames=0;
 while(n.wander.phase!==4&&frames++<80)walk.update(n,{start:true,blocked:()=>false,pose,random:()=>.9});
 assert.equal(n.wander.phase,4);const from={...n.wander.from},to={...n.wander.to};
 assert.ok(walk.occupies(n,from.x,from.y));assert.ok(walk.occupies(n,to.x,to.y));
 const saved=JSON.parse(JSON.stringify(n));
 for(let i=0;i<100;i++)for(const a of [n,saved])walk.update(a,{start:false,blocked:()=>false,pose,random:()=>.9});
 assert.equal(n.x,to.x);assert.equal(n.y,to.y);assert.deepEqual(n,saved);assert.equal(n.wander.phase,0);
 assert.equal(walk.occupies(n,from.x,from.y),false);
});
test('collisions stop a step after the actor turns and fixed actors remain fixed',()=>{
 const n=actor();for(let i=0;i<200;i++)walk.update(n,{start:true,blocked:()=>true,pose,random:()=>.9});
 assert.equal(n.x,.5);assert.equal(n.y,.5);assert.equal(n.direction,3);
 assert.equal(walk.create({movement:15},{x:1,y:2}),null);
});

