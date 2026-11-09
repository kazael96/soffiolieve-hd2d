const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {create}=require('../src/opelucid-gym-renderer.js'),makeTask=require('../src/opelucid-gym-task.js').create,root=path.resolve(__dirname,'../src');
const raw=fs.readFileSync(path.join(root,'opelucid-gym-data.js'),'utf8'),data=JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,''));
function actualEngine(){
 const c={TextDecoder,URL,DataView,Uint8Array,location:{href:'http://native.invalid/'},RuntimeAssets:{bytes:async file=>{const b=fs.readFileSync(path.join(root,new URL(file,'http://native.invalid/').pathname.slice(1)));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);},image:async url=>{const b=fs.readFileSync(path.join(root,new URL(url).pathname.slice(1)));return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};}}};c.window=c;vm.createContext(c);for(const name of ['starter-scene','field-models'])vm.runInContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),c);return c;
}
function setup(options={}){const native={zone:114},task=makeTask({data,state:()=>native}),assets={models:{},textures:data.textures,scenes:{zone114:{zone:114,instances:[]}}};return {assets,task,native,view:create({data,assets,task,resource:file=>file,...options})};}

test('six mechanisms use actual native GLBs, finite vertex buffers and the correct state frames',async()=>{
 const engine=actualEngine(),f=setup({loadGLB:engine.StarterScene.loadGLB,geometry:engine.FieldModels.geometry});assert.equal(await f.view.prepare(),true);f.view.install();assert.equal(f.assets.scenes.zone114.instances.length,6);assert.deepEqual(f.view.instances.map(i=>i.y),[0,3,6,0,3,6]);
 let writes=0,buffers=0;const renderer={scene:f.assets.scenes.zone114,resourceEpoch:1,models:{},gl:{createBuffer:()=>++buffers,bindBuffer(){},bufferData(target,values){assert.ok(values.length>0);assert.ok(values.every(Number.isFinite));writes++;},deleteBuffer(){}}};
 f.view.apply(renderer);assert.equal(Object.keys(renderer.models).length,6);const initialWrites=writes,initialBuffers=buffers;f.view.apply(renderer);assert.equal(writes,initialWrites);
 for(const index of [0,1,2]){const before=JSON.stringify(renderer.models[f.view.instances[index].model].map(g=>g.verts)),action=f.task.begin('platform',index);f.task.tick(1);f.view.apply(renderer);const during=JSON.stringify(renderer.models[f.view.instances[index].model].map(g=>g.verts));assert.notEqual(during,before);f.task.tick(1);await action;f.view.apply(renderer);assert.equal(f.task.snapshot.states[index],1);}
 assert.equal(buffers,initialBuffers);assert.ok(writes>initialWrites);for(const groups of Object.values(renderer.models))for(const group of groups)assert.ok(f.assets.textures[group.texture]);
 renderer.resourceEpoch++;f.view.apply(renderer);assert.ok(writes>initialWrites);f.view.release();assert.equal(f.view.ready,false);assert.equal(f.assets.scenes.zone114.instances.length,0);assert.deepEqual(f.assets.models,{});assert.deepEqual(renderer.models,{});assert.equal(renderer.brycenFrames.size,0);
});

test('cancelled preparation cannot reinstall mechanisms; a later preparation can retry',async()=>{
 let fail=true,release;const f=setup({loadGLB:()=>fail?Promise.reject(Error('missing GLB')):new Promise(done=>release=done)});
 await assert.rejects(f.view.prepare(),/missing GLB/);assert.equal(f.view.ready,false);assert.equal(f.assets.scenes.zone114.instances.length,0);
 const pending=[];fail=false;const g=setup({loadGLB:()=>new Promise(done=>pending.push(done))}),old=g.view.prepare();g.view.release();for(const done of pending)done({doc:{}});assert.equal(await old,false);assert.equal(g.view.ready,false);assert.equal(g.assets.scenes.zone114.instances.length,0);
});
