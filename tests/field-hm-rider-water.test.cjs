/* Existing unprojected staging margins plus real billboard-height water guard. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{setup,measured}=require('./helpers/field-hm-rider-geometry.cjs');
for(const graphic of [501,502,507,508,515,516,531,580,581,594,613])test('the real waist retains water clearance through all swimming gestures: '+graphic,async()=>{
 for(const sex of ['M','F']){const f=await setup(graphic,sex);try{for(const direction of [0,1,2,3])for(const phase of ['board','swim','idle','land'])for(let i=0;i<=64;i++){
  const draw=f.draw(direction,i/64,phase),row=measured(graphic,sex,direction,draw,f.cache),up=(384-row.hero[1])/64,sample=f.lastSample(),unprojected=up+sample.bob,physical=draw.actor.height+2*f.renderer.cameraPitch[1]+up*f.renderer.cameraPitch[1];
  assert.ok(unprojected>.15,`${graphic}/${sex}/${direction}/${phase}/${i}: unprojected clearance=${unprojected}`);if(phase==='swim'&&i===0)assert.ok(unprojected>.25,`${graphic}/${sex}/${direction}: neutral unprojected clearance=${unprojected}`);
  assert.ok(physical>.1,`${graphic}/${sex}/${direction}/${phase}/${i}: actual billboard waist height=${physical} above water0`);
 }}finally{f.close();}}
});
