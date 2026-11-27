/* Native source/actual Canvas geometry, separate from raster/command acceptance. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),png=require('./helpers/native-png.cjs'),{setup,measured,proposals,site}=require('./helpers/field-hm-rider-geometry.cjs');
for(const graphic of [501,502,507,508,515,516,531,580,581,594,613,623])test('original player waist stays on the authored native body point in every field phase: '+graphic,async()=>{
 for(const move of [...(graphic===623?[19]:[57]),...([580,581].includes(graphic)?[19]:[])])for(const sex of ['M','F']){const f=await setup(graphic,sex,move);try{for(const direction of [0,1,2,3])for(const phase of move===57?['board','swim','idle','land']:['depart','arrive','cruise'])for(let i=0;i<=64;i++){const row=measured(graphic,sex,direction,f.draw(direction,i/64,phase),f.cache);assert.ok(row.gap<1e-6,`${graphic}/${move}/${sex}/${direction}/${phase}/${i}: actual waist=${row.hero}, native support=${row.support}, gap=${row.gap}px`);}}finally{f.close();}}
});
test('every authored support is an actual opaque native torso pixel, not a head/neck/wing silhouette extremum',async()=>{
 for(const p of proposals){const f=await setup(p.graphic,'M',p.move||57);try{const data=f.cache[p.graphic+'-'+p.view].data,trackFrame=data.animations[p.track].frames[0],source=png(fs.readFileSync(path.join(site,`assets/animated/${p.graphic}-${p.view}.png`))),[x,y]=p.trackLocal,matches=[];
  for(const o of data.cells[trackFrame[0]]){if(x<o[0]||x>=o[0]+o[2]||y<o[1]||y>=o[1]+o[3])continue;const im=data.images[o[4]],u=x-o[0],v=y-o[1],sx=im[0]+Math.floor((o[5]?o[2]-u:u)*im[2]/o[2]),sy=im[1]+Math.floor((o[6]?o[3]-v:v)*im[3]/o[3]),i=(sy*source.width+sx)*4;matches.push([...source.pixels.subarray(i,i+4)]);}
  assert.ok(matches.some(r=>r.every((v,i)=>v===p.sourceRGBA[i])&&r[3]===255),`${p.graphic}/${p.view}: support does not match the reviewed native pixel`);assert.ok(f.c.FieldHMChoreography.anatomy(p.graphic)[p.view].body.includes(p.track));const q=f.c.FieldHMChoreography.riderAnchor(p.graphic,p.view==='back',[p.track,...p.trackLocal],data);assert.ok(Math.hypot(q.x-p.globalNative[0],q.y-p.globalNative[1])<1e-12);
 }finally{f.close();}}
});
test('native support applies track and parent transforms in the same order as the Nitro renderer',async()=>{
 const f=await setup(515);try{const data=f.cache['515-front'].data,pf=data.parent[0].frames[0],row=data.maps[pf[0]].find(r=>r[0]===5),tf=data.animations[5].frames[0];pf.splice(2,5,16384,2048,8192,-2,4);row[1]=7;row[2]=8;tf.splice(2,5,16384,8192,12288,5,6);const q=f.c.FieldHMChoreography.riderAnchor(515,false,[5,3,-2],data);assert.ok(Math.abs(q.x+42)<1e-12&&Math.abs(q.y-13)<1e-12,`Wrong native transform order: ${q.x},${q.y}`);
 }finally{f.close();}
});
