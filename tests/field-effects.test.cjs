const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src');
function environment(){const c={console,Math,Map,WeakMap,URL,TextDecoder,DataView,Uint8Array,Float32Array};c.window=c;vm.createContext(c);for(const file of ['starter-scene.js','particle-spl.js','field-effect-assets.js','field-effects.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});return c;}
test('receipt effects retain native descriptors, models, particles and blocking semantics',()=>{
 const c=environment(),assets=c.FIELD_EFFECT_ASSETS;assert.equal(assets.verification.blocking,true);assert.equal(assets.effects[50].descriptor[5],180);assert.equal(assets.effects[51].descriptor[5],181);
 for(const [id,e]of Object.entries(assets.effects).filter(([id])=>[50,51].includes(+id))){
  assert.equal(c.FieldEffects.duration(e,assets),71);assert.ok(fs.existsSync(path.join(root,assets.models[e.item].url)));
  const source=fs.readFileSync(path.join(root,assets.models[e.item].url));const doc=JSON.parse(source.subarray(20,20+source.readUInt32LE(12)));assert.ok(doc.animations.length);assert.equal(assets.materialAlpha[e.item].lambert3.at(-1),0);
  const all=[];for(let frame=0;frame<71;frame++)all.push(...c.FieldEffects.particles(e,assets,frame,768,576));assert.ok(all.length>100);for(const p of all)for(const k of ['x','y','size','alpha','angle'])assert.ok(Number.isFinite(p[k]),id+':'+k);
  assert.ok(c.FieldEffects.particles(e,assets,40,768,576).length===0);assert.equal(assets.particles.textures[0].name,'particle-8-0.png');
 }
});
test('zero-radius SPL emission retains a random radial velocity instead of collapsing into a vertical line',()=>{
 const c=environment(),emitter=c.FIELD_EFFECT_ASSETS.particles.emitters[0];const a=c.ParticleSPL.motion(emitter,0,50),b=c.ParticleSPL.motion(emitter,0,51);assert.equal(Math.hypot(...a.p),0);assert.ok(Math.abs(a.v[0])+Math.abs(a.v[2])>0.05);assert.notDeepEqual(Array.from(a.v),Array.from(b.v));
});

test('Tris badge receipt has original 361-frame model and native background alpha',()=>{const c=environment(),a=c.FIELD_EFFECT_ASSETS,e=a.effects[2];assert.equal(e.descriptor[5],17);assert.equal(c.FieldEffects.duration(e,a),361);assert.equal(a.materialAlpha.badgeBackground.alpha_sq.length,361);for(const name of [e.background,e.item])assert.ok(fs.existsSync(path.join(root,a.models[name].url)));assert.equal(c.FieldEffects.particles(e,a,50,768,576).length,0);});
