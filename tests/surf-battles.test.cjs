const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');const {environment}=require('./check-story-runtime.cjs');process.argv[2]=old;
test('nine native water contexts have explicit floor geometry and native catchable ambient species',async()=>{
 const c=environment({icirrus:true,sourceRoot:path.resolve(__dirname,'../src')});await c.IcirrusChapter.ensure();await c.SurfField.prepareAssets();
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/nimbasa-assets.js'),'utf8'),c);
 Object.assign(c.OPENING_ASSETS.models,c.NIMBASA_ASSETS.models);Object.assign(c.OPENING_ASSETS.textures,c.NIMBASA_ASSETS.textures);Object.assign(c.OPENING_ASSETS.scenes.zone326,c.NIMBASA_ASSETS.scenes[326]);
 c.PinwheelBattles={contexts:{},instances:()=>null,ambient:()=>null};vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/surf-battles.js'),'utf8'),c);
 assert.equal(Object.keys(c.SurfBattles.contexts).length,9);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/battle-location.js'),'utf8'),c);c.NativeStory.state.surf=true;
 for(const [id,context]of Object.entries(c.SurfBattles.contexts)){
  c.NativeStory.state.zone=context.zone;const captured=c.BattleLocation.capture(c.Journey.state,c.NativeStory.state,{x:1,y:2},'path');assert.equal(captured.id,id);assert.equal(captured.terrain,'water');assert.equal(Object.isFrozen(captured),true);
  await c.SurfBattles.prepare(id);const rows=c.SurfBattles.instances(id),floor=rows.at(-1),model=c.OPENING_ASSETS.models[floor.model];assert.equal(model.groups[0].texture,context.floor);assert.ok(rows.length>1,id+' native scenery');assert.equal(c.SurfBattles.isGround(context.floor),true,id+' water classification');
  const allowed=new Set(c.SURF_FIELD_ASSETS.encounters[context.zone].seasons[new Date().getMonth()%4].slots.map(s=>s.name));for(const pokemon of c.SurfBattles.ambient(id)){assert.ok(allowed.has(pokemon.species));assert.ok(pokemon.z<=-19);}
 }
});
