const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src');
function environment(base=true){const c={};c.window=c;vm.createContext(c);if(base)vm.runInContext(fs.readFileSync(path.join(root,'field-effect-assets.js'),'utf8'),c);return c;}
const extension=fs.readFileSync(path.join(root,'mistralton-badge-assets.js'),'utf8');
test('Rafan receipt preserves previous effects and uses both original fifth-badge descriptors',()=>{
 const c=environment(),base=c.FIELD_EFFECT_ASSETS,previous=base.effects[6],background=base.models.badgeBackground,alpha=base.materialAlpha.badgeBackground;
 vm.runInContext(extension,c);assert.equal(c.FIELD_EFFECT_ASSETS,base);assert.equal(base.effects[6],previous);assert.equal(base.models.badgeBackground,background);assert.equal(base.materialAlpha.badgeBackground,alpha);
 for(const [id,name,members]of [[7,'quakeBadgeM',[41,42,43]],[46,'quakeBadgeF',[164,165,166]]]){
  const effect=base.effects[id],model=base.models[name];assert.equal(effect.label,'Medaglia Sisma');assert.equal(effect.background,'badgeBackground');assert.equal(effect.item,name);assert.equal(effect.frames,361);assert.equal(effect.particles,false);assert.deepEqual(Array.from(model.sourceMembers),members);assert.equal(effect.descriptor[5],members[0]);assert.equal(effect.descriptor[12],members[1]);assert.equal(effect.descriptor[13],members[2]);
  const file=path.join(root,model.url),raw=fs.readFileSync(file);assert.equal(raw.toString('ascii',0,4),'glTF');assert.equal(raw.readUInt32LE(8),raw.length);const doc=JSON.parse(raw.subarray(20,20+raw.readUInt32LE(12)));assert.ok(doc.animations.length);assert.ok(doc.meshes.length);for(const image of doc.images||[])if(image.uri)assert.ok(fs.existsSync(path.join(path.dirname(file),image.uri)),image.uri);
 }
 c.MistraltonBadgeAssets.install();assert.equal(base.effects[6],previous);assert.equal(Object.keys(base.effects).filter(id=>[7,46].includes(+id)).length,2);
});
test('badge extension can be loaded before the base and rejects an incompatible background',()=>{
 const c=environment(false);vm.runInContext(extension,c);assert.throws(()=>c.MistraltonBadgeAssets.install(),/background unavailable/);
 const base={models:{badgeBackground:{}},hashes:{16:'wrong'},effects:{},materialAlpha:{}};assert.throws(()=>c.MistraltonBadgeAssets.install(base),/background mismatch/);assert.deepEqual(base.effects,{});assert.deepEqual(base.materialAlpha,{});
});
