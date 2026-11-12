/* Real native geometry; first-ending battle places must never fall through to Route1. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{setup}=require('./helpers/finale-field-host.cjs');
test('four Elite rooms and the throne acquire distinct immutable native battle contexts',async()=>{
 const c=await setup();for(const file of ['pinwheel-battles','opelucid-battles','league-battle-data','league-field','league-battles','finale-battles','battle-location']){const p=path.join(__dirname,'../src',file+'.js');if(fs.existsSync(p))vm.runInContext(fs.readFileSync(p,'utf8'),c);}
 const ids=new Set();for(const zone of [140,141,142,143,278]){
  const n=c.NativeStory.state;n.zone=zone;const place=c.BattleLocation.capture(c.Journey.state,n,{x:-.5,y:-6.5});
  assert.equal(place.zone,zone);assert.equal(place.terrain,'interior');assert.ok(Object.isFrozen(place));assert.ok(c.PinwheelBattles.has(place.id),'Explicit place: '+zone);ids.add(place.id);
  await c.OpelucidBattles.prepare(place.id);const rows=c.PinwheelBattles.instances(place.id),floor=c.OPENING_ASSETS.models[rows.at(-1).model];
  assert.ok(rows.length>1);assert.equal(floor.groups[0].texture,c.FinaleBattles.contexts[place.id].floor);assert.ok(c.OpelucidBattles.isGround(floor.groups[0].texture));assert.ok(floor.groups[0].verts.every((v,i)=>i%11!==1||v===0),'Arena contact plane is zero');
  let triangles=0;for(const row of rows.slice(0,-1))for(const group of c.OPENING_ASSETS.models[row.model].groups){assert.ok(c.OPENING_ASSETS.textures[group.texture]);triangles+=group.verts.length/33;for(let i=2;i<group.verts.length;i+=11)assert.ok(group.verts[i]<=-21+.00001,'Native scenery stays behind combatants');}
  assert.ok(triangles>25,'Native room landmarks retained');assert.equal(c.PinwheelBattles.ambient(place.id).length,0,'No invented wild species in Elite rooms or throne');n.zone=136;assert.equal(place.zone,zone);
 }
 assert.equal(ids.size,5);for(const zone of [136,137,138,139,144,146,264,272,277])assert.equal(c.FINALE_FIELD.context(zone),null,'Noncombat or postgame place '+zone);
});
