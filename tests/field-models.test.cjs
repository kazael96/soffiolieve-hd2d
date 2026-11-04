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
 assert.equal(changes,8);assert.equal(samples,60);
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

function chapterDoors(c){for(const file of ['mistralton-assets.js','mistralton-doors.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});c.MistraltonDoors.install();}
test('native Rafan door resolves its exact building child and does not alias repeated bundle IDs',()=>{
 const c=environment();assert.equal(Object.keys(c.FIELD_MODEL_ASSETS.models).length,8);chapterDoors(c);
 const targets=c.FieldModels.targets(c.MISTRALTON_ASSETS.scenes[96],c.FIELD_MODEL_ASSETS),door=targets.find(t=>t.record.class===1&&Math.abs(t.x+572)<=2&&Math.abs(t.z+352)<=3);
 assert.ok(door,'Ghecis script must open the actual Gym building door');assert.equal(door.record.source.member,8);assert.ok(door.record.model.includes('bundle8'));
 const scope=c.FIELD_MODEL_ASSETS.scopes.mt;assert.notEqual(scope.models['True-8-259'].key,scope.models['True-9-259'].key);assert.notEqual(scope.models['True-8-259'].model,scope.models['True-9-259'].model);
 assert.equal(c.FieldModels.targets({instances:[{model:'mt-prop-False-8-51',x:0,y:0,z:0,rotation:0}]},c.FIELD_MODEL_ASSETS).length,0,'indoor reused ID must not become outdoor Gym');
});
test('chapter doors load on scene entry, keep existing models cached and recover only missing resources',async()=>{
 const c=environment(),calls=[],original=c.StarterScene.loadGLB;c.StarterScene.loadGLB=async url=>{calls.push(url);return original(url);};
 const renderer={scene:c.OPENING_ASSETS.scenes.home,gl:{},upload:()=>({})},control=new c.FieldModels.Controller(renderer,c.FIELD_MODEL_ASSETS);await control.ready;assert.equal(calls.length,8);
 chapterDoors(c);assert.equal(calls.length,8,'chapter catalog registration must not preload new models');renderer.scene=c.MISTRALTON_ASSETS.scenes[96];let fail=true;const first=control.records().find(t=>t.record.key.startsWith('mt-door-')).record.model;
 c.StarterScene.loadGLB=async url=>{calls.push(url);if(fail&&url===first)throw Error('temporary chapter door failure');return original(url);};
 await assert.rejects(control.prepareScene(),/temporary chapter door/);const cached=control.loaded.size;assert.ok(cached>8);fail=false;const count=calls.length;await control.prepareScene();assert.equal(calls.length,count+1,'successful chapter and opening models must not reload');assert.equal(renderer.modelsRecovering,false);
 const handle=control.create(1,-572,-352);await control.play(handle,0);control.tick(8/30);await control.wait(handle);control.release(handle);assert.equal(control.handles.size,0);
});
test('new native door joint and texture-transform animations retain finite geometry and changing frames',async()=>{
 const c=environment();chapterDoors(c);let samples=0,changed=0;
 for(const record of Object.values(c.MISTRALTON_DOOR_ASSETS.models)){const model=await c.StarterScene.loadGLB(record.model);assert.equal(model.animationSets.length,2);for(const a of Object.values(record.animations)){const first=c.FieldModels.geometry(model,record,a.index,0),last=c.FieldModels.geometry(model,record,a.index,a.frames-1);assert.ok(first.length&&last.length);for(const groups of [first,last])for(const group of groups)assert.ok(group.verts.every(Number.isFinite));if(JSON.stringify(first)!==JSON.stringify(last))changed++;samples+=2;}}
 assert.equal(samples,28);assert.equal(changed,14);
});
