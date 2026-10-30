const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('every field effect referenced by the new native programs has exported receipt resources',()=>{
 const c={};c.window=c;vm.createContext(c);for(const file of ['pinwheel-events','field-effect-assets'])vm.runInContext(fs.readFileSync('src/'+file+'.js','utf8'),c);
 const ids=new Set(Object.values(c.PINWHEEL_EVENTS.scripts).flatMap(b=>Object.values(b.code).filter(i=>i.name==='PlayFieldEffect').map(i=>i.args[0])));assert.deepEqual([...ids].sort((a,b)=>a-b),[4,43]);
 for(const id of ids){const e=c.FIELD_EFFECT_ASSETS.effects[id];assert.ok(e,'missing native field effect '+id);assert.equal(e.descriptor[5],id===4?29:152);assert.equal(e.label,'Medaglia Base');for(const name of [e.background,e.item]){const m=c.FIELD_EFFECT_ASSETS.models[name];assert.ok(m&&fs.existsSync('src/'+m.url));assert.ok(m.frames>0);}}
});
test('special forest actors are native grass, while the museum skull has its own model',()=>{
 const c={};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('src/pinwheel-assets.js','utf8'),c);const a=c.PINWHEEL_ASSETS;
 assert.equal(a.specialActors[8198].resource,2);assert.equal(a.specialActors[8199].resource,3);
 for(const key of Object.values(a.specialActors).map(v=>v.model))assert.ok(a.models[key].groups.length);
 for(const [key,m]of Object.entries(a.models))for(const g of m.groups){assert.ok(g.verts.every(Number.isFinite),key);assert.equal(g.verts.length%33,0,key);assert.equal(typeof g.doubleSided,'boolean',key);if(g.texture)assert.ok(a.textures[g.texture],key);}
});
