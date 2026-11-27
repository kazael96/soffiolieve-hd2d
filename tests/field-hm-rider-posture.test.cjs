/* Authored native landmarks and real wait/recall state; not aesthetic approval. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{setup,proposals}=require('./helpers/field-hm-rider-geometry.cjs');
for(const graphic of[501,502,531,613])test('native wait/recall blends the reviewed head and forearm posture without changing the save record: '+graphic,async()=>{
 for(const sex of['M','F']){const f=await setup(graphic,sex);try{for(const view of['front','back'])for(const phase of['wait','move','recall'])for(const u of[0,.125,.25,.5,.75,.875,1]){
  const direction=view==='back'?0:1,r={zone:113,phase,wait:u*16,travel:phase==='recall'?1:phase==='move'?u:0,landing:phase==='recall',cells:1,direction,from:{x:0,y:0,height:0},to:{x:0,y:-1,height:0}};f.c.NativeStory.state.surfMotion=r;const saved=JSON.stringify(r),a=f.draw(direction,u,phase==='recall'?'land':'board').body.pose,w=phase==='wait'?u*u*(3-2*u):phase==='recall'?1-u*u*(3-2*u):1;assert.ok(Number.isFinite(a.surfPosture)&&Math.abs(a.surfPosture-w)<1e-12,`${graphic}/${sex}/${view}/${phase}/${u}: native posture clock differs`);
  const expected=proposals.find(p=>p.graphic===graphic&&p.view===view).headNativeShift,data=f.cache[graphic+'-'+view].data,head=f.c.FieldHMChoreography.anatomy(graphic)[view].head.find(t=>data.maps[data.parent[0].frames[0][0]].some(r=>r[0]===t)),actual=f.c.FieldHMChoreography.part(head,view==='back',a,data);assert.ok(Math.abs(actual.x-expected[0]*w)<1e-10&&Math.abs(actual.y-expected[1]*w)<1e-10,`${graphic}/${view}: head no longer follows the independently reviewed native posture`);
  if(graphic===613&&view==='front'){const arm=f.c.FieldHMChoreography.part(6,false,a,data);assert.ok(Math.abs(arm.y-3*w)<1e-12,'Cubchoo near paw must follow its propulsive shoulder pose, not conceal the near eye');}
  assert.equal(JSON.stringify(r),saved,'A presentation field leaked into the native/saveable motion record');
 }}finally{f.close();}}
});
test('the four Surf posture adaptations leave the same native parts unchanged for other field moves',async()=>{
 for(const graphic of[501,502,531,613]){const f=await setup(graphic);try{for(const view of['front','back']){const data=f.cache[graphic+'-'+view].data,a={...f.draw(view,.5,'swim').body.pose,head:0,arms:0};for(const move of[15,19]){const map=f.c.FieldHMChoreography.anatomy(graphic)[view];for(const track of[map.head[0],...(graphic===613&&view==='front'?[6]:[])]){const part=f.c.FieldHMChoreography.part(track,view==='back',{...a,fieldMove:move},data);assert.equal(part.x,0);assert.equal(part.y,0);}}}}finally{f.close();}}
});
