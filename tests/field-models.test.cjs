const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src');
function environment(){
 const c={console,URL,TextDecoder,setTimeout,clearTimeout,AbortController,DataView,Uint8Array,Float32Array,Math,Map,WeakMap,Promise,location:{href:'http://localhost/'}};c.window=c;
 c.fetch=async url=>{const data=fs.readFileSync(path.join(root,new URL(url,c.location.href).pathname));return {ok:true,arrayBuffer:async()=>data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength)};};
 c.Image=class{set src(url){const data=fs.readFileSync(path.join(root,new URL(url,c.location.href).pathname));this.width=data.readUInt32BE(16);this.height=data.readUInt32BE(20);queueMicrotask(()=>this.onload());}};
 vm.createContext(c);for(const file of ['runtime-assets.js','starter-scene.js','field-model-assets.js','field-models.js','opening-assets.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});return c;
}
test('all original field models retain distinct animation sets, finite skinning and native alpha',async()=>{
 const c=environment();let samples=0,changes=0;
 for(const record of Object.values(c.FIELD_MODEL_ASSETS.models)){
  const model=await c.StarterScene.loadGLB(record.model);
  assert.equal(model.animationSets.length,Object.keys(record.animations).length);
  for(const animation of Object.values(record.animations))for(const frame of [0,1,Math.floor(animation.frames/2),animation.frames-1]){
   const groups=c.FieldModels.geometry(model,record,animation.index,frame);assert.ok(groups.length);for(const g of groups){assert.ok(g.verts.length%33===0);assert.ok(g.verts.every(Number.isFinite));assert.ok(g.alpha>=0&&g.alpha<=1);}samples++;
  }
  const first=c.FieldModels.geometry(model,record,0,0),last=c.FieldModels.geometry(model,record,0,record.animations[0].frames-1);
  if(JSON.stringify(first)!==JSON.stringify(last))changes++;
  if(record.class===8)assert.ok(last.filter(g=>record.materialAlpha[g.material]).every(g=>g.alpha===0),'Original smoke materials end transparent');
 }
 assert.equal(changes,6);assert.equal(samples,44);
});
test('building children retain original offsets and rotation, smoke stays a separate model',()=>{
 const c=environment(),assets=c.FIELD_MODEL_ASSETS,scene={instances:[{model:'prop6',x:10,y:2,z:20,rotation:Math.PI/2},{model:'in-prop-140',x:5,y:-4.5,z:1,rotation:0}]};
 const targets=c.FieldModels.targets(scene,assets);assert.equal(targets.length,2);assert.equal(targets[0].record.class,1);assert.ok(Math.abs(targets[0].x-11)<1e-9);assert.ok(Math.abs(targets[0].z-19.5)<1e-9);assert.equal(targets[0].y,2);assert.equal(targets[1].record.class,8);assert.equal(targets[1].child,false);
});
test('native waits complete on the last tick and releasing restores the static model',async()=>{
 const c=environment(),scene={instances:[{model:'prop5',x:0,y:0,z:0,rotation:0}]};
 const renderer={scene,gl:{},upload:()=>({})},audio=[];const control=new c.FieldModels.Controller(renderer,c.FIELD_MODEL_ASSETS,id=>audio.push(id));await control.ready;
 const handle=control.create(1,0,1.25);assert.throws(()=>control.create(8,0,0),/unavailable/);
 await control.play(handle,0);let done=false;control.wait(handle).then(()=>done=true);control.tick(7/30);await Promise.resolve();assert.equal(done,false);assert.equal(control.records()[0].frame,7);
 control.tick(1/30);await Promise.resolve();assert.equal(done,true);control.release(handle);assert.equal(control.records()[0].frame,undefined);assert.equal(control.handles.size,0);assert.deepEqual(audio,[1669]);
 const second=control.create(1,0,1.25);await control.play(second,1);control.tick(8/30);await control.wait(second);assert.deepEqual(audio,[1669,1670]);
});

test('indoor furniture IDs never select outdoor building door children',()=>{
 const c=environment(),scene={instances:[5,6,93,164,165].map(id=>({model:'in-prop-'+id,x:0,y:0,z:0,rotation:0}))};
 assert.equal(c.FieldModels.targets(scene,c.FIELD_MODEL_ASSETS).length,0);
});
