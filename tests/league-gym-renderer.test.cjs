const test=require('node:test'),assert=require('node:assert/strict'),native=require('./fixtures/drayden-native-task.json');
const {create}=require('../src/league-gym-renderer.js'),taskFactory=require('../src/league-gym-task.js').create;
function setup(overrides={}){
 const data=JSON.parse(JSON.stringify(native)),state={zone:121},task=taskFactory({data,state:()=>state});
 data.instances=data.descriptors.map((d,i)=>({index:i,worldOrigin:[i,0,i],rotationRaw:i===0?32768:0}));
 data.geometry={};data.textures={};for(const [key,model]of Object.entries(data.models)){
  data.geometry[key]={groups:[]};data.textures[key+'-image']={};
  for(const [i,row]of model.states.entries())Object.assign(row,{url:key+'/'+i+'.glb',convertedAnimations:row.format==='BCA0'?1:0,lastFrames60:[row.nativeFrames-1]});
 }
 data.models['lg-gym-16'].states[0].materialTextures={button:[{frame:0,textureKey:'button-rest'},{frame:13,textureKey:'button-pressed'},{frame:26,textureKey:'button-rest'}]};Object.assign(data.textures,{'button-rest':{},'button-pressed':{}});
 const assets={models:{},textures:data.textures,scenes:{zone121:{zone:121,instances:[]}}},writes=[],deleted=[];let buffers=0;
 const renderer={scene:assets.scenes.zone121,resourceEpoch:1,models:{},gl:{createBuffer:()=>++buffers,bindBuffer(){},bufferData(target,v){writes.push(v);},deleteBuffer:b=>deleted.push(b)}};
 const view=create({data,assets,task,resource:f=>f,loadGLB:async()=>({doc:{images:[{uri:'image.png'}],textures:[{source:0}]}}),geometry:()=>[{material:'button',textureIndex:0,verts:Array(33).fill(1)}],...overrides});
 return {view,task,assets,renderer,data,writes,deleted,get buffers(){return buffers;}};
}
test('sixteen independent instances retain native rotation, reuse GPU buffers, switch button palettes and release owned resources',async()=>{
 const f=setup();assert.equal(await f.view.prepare(),true);f.view.install();assert.equal(f.assets.scenes.zone121.instances.length,16);assert.equal(f.view.instances[0].rotation,Math.PI);
 f.view.apply(f.renderer);assert.equal(f.buffers,16);const writes=f.writes.length;f.view.apply(f.renderer);assert.equal(f.writes.length,writes);
 const button=f.task.begin('button',0,1);f.task.tick(13/30);f.view.apply(f.renderer);assert.equal(f.renderer.models['lg-gym-instance4'][0].texture,'button-pressed');f.task.tick(13/30);f.view.apply(f.renderer);assert.equal(f.renderer.models['lg-gym-instance4'][0].texture,'button-rest');f.task.tick(1/30);await button;assert.equal(f.buffers,16);
 f.renderer.resourceEpoch++;f.view.apply(f.renderer);assert.ok(f.writes.length>writes);f.view.release();assert.equal(f.assets.scenes.zone121.instances.length,0);assert.equal(Object.keys(f.assets.models).length,0);assert.equal(Object.keys(f.renderer.models).length,0);assert.equal(f.deleted.length,16);
});
test('the wider HD-2D camera retains upper supports across the native cutaway boundary instead of leaving visible NPCs suspended',async()=>{
 const hero={x:0,y:14};let height=4;const f=setup({hero:()=>hero,height:()=>height});await f.view.prepare();
 for(const [h,z]of [[4,14],[4.001,14],[4,13.999],[4,14]]){
  height=h;hero.y=z;f.view.apply(f.renderer);assert.equal(f.buffers,16);for(let i=0;i<16;i++)assert.equal(f.renderer.models['lg-gym-instance'+i].length,1);
 }
 assert.equal(f.deleted.length,0);f.view.release();assert.equal(f.deleted.length,16);
});

test('failed/cancelled preparation never installs an incomplete room and a new preparation can recover',async()=>{
 let fail=true;const f=setup({loadGLB:async()=>{if(fail)throw Error('unavailable');return {doc:{}};}});await assert.rejects(f.view.prepare(),/unavailable/);assert.equal(f.view.ready,false);assert.equal(f.assets.scenes.zone121.instances.length,0);fail=false;assert.equal(await f.view.prepare(),true);f.view.release();
 const pending=[],g=setup({loadGLB:()=>new Promise(done=>pending.push(done))}),old=g.view.prepare();g.view.release();for(const done of pending)done({doc:{}});assert.equal(await old,false);assert.equal(g.view.ready,false);assert.equal(g.assets.scenes.zone121.instances.length,0);
});
test('release preserves a GPU model replaced by a different resource owner',async()=>{
 const f=setup();await f.view.prepare();f.view.apply(f.renderer);const replacement=[{buf:'foreign'}];f.renderer.models['lg-gym-instance0']=replacement;f.view.release();assert.equal(f.renderer.models['lg-gym-instance0'],replacement);assert.equal(f.deleted.length,15);assert.ok(!f.deleted.includes('foreign'));
});
