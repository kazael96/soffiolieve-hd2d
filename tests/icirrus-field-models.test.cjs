const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src');
function environment(){
 const c={window:null,console,Promise,Map,WeakMap,StarterScene:{loadGLB:async()=>({doc:{textures:[]},images:[],animationSets:[]})}};c.window=c;vm.createContext(c);
 for(const name of ['field-model-assets','field-models','icirrus-assets','icirrus-field-models'])vm.runInContext(fs.readFileSync(path.join(root,name+'.js'),'utf8'),c);
 c.IcirrusFieldModels.install();return c;
}
test('native Tower bell resolves class8 in the050 scope and consumes its full246-frame track',async()=>{
 const c=environment(),scene=c.ICIRRUS_ASSETS.scenes[342],record=c.ICIRRUS_FIELD_MODELS.models['True-22-290'];
 assert.equal(record.class,8);assert.equal(record.kind,11);assert.equal(Object.keys(record.animations).length,1);assert.equal(record.animations[0].frames,246);
 const renderer={scene,gl:{},upload:()=>({})},controller=new c.FieldModels.Controller(renderer,c.FIELD_MODEL_ASSETS);await controller.ready;
 const target=controller.find(8,0,-9);assert.ok(target,'Native BMCreate class8 at cell16,7 must find the bell');assert.equal(target.record,record);
 const handle=controller.create(8,0,-9);await controller.play(handle,0);let finished=false;const wait=controller.wait(handle).then(()=>finished=true);
 controller.tick(245/30);await Promise.resolve();assert.equal(target.frame,245);assert.equal(finished,false);
 controller.tick(1/30);await wait;assert.equal(target.playing,false);assert.equal(finished,true);controller.release(handle);assert.equal(controller.handles.size,0);
});
test('scope installation preserves bundle-specific doors and all child links',()=>{
 const c=environment(),d=c.ICIRRUS_FIELD_MODELS;assert.equal(Object.keys(d.models).length,6);assert.equal(Object.keys(d.children).length,7);
 for(const [key,record]of Object.entries(d.models))assert.equal(c.FIELD_MODEL_ASSETS.models['ic:'+key],record);
 for(const child of Object.values(d.children))assert.ok(d.models[child.modelKey]);
 const before=Object.keys(c.FIELD_MODEL_ASSETS.models).length;c.IcirrusFieldModels.install();assert.equal(Object.keys(c.FIELD_MODEL_ASSETS.models).length,before);
});
