/* Actual native meshes and contact floor; GPU composition is a separate check. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{setup}=require('./helpers/league-field-host.cjs');
test('Gym battles capture an immutable place and use its own native floor, walls and distant dragon scenery',async()=>{
 const c=await setup();for(const file of ['pinwheel-battles','opelucid-battles','league-battle-data','league-field','league-battles','battle-location'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file+'.js'),'utf8'),c);
 const n=c.NativeStory.state,place=c.BattleLocation.capture(c.Journey.state,n,c.player);assert.equal(place.id,'draydenGym');assert.equal(place.zone,121);assert.equal(Object.isFrozen(place),true);assert.equal(place.terrain,'interior');assert.equal(c.PinwheelBattles.has(place.id),true);
 await c.OpelucidBattles.prepare(place.id);const rows=c.PinwheelBattles.instances(place.id),arena=c.OPENING_ASSETS.models[rows.at(-1).model];assert.ok(rows.length>16);assert.equal(arena.groups[0].texture,'lg-map-615-in31_fl02');assert.ok(arena.groups[0].verts.every((v,i)=>i%11!==1||v===0));assert.ok(arena.groups.length>=7);assert.ok(c.OpelucidBattles.isGround(arena.groups[0].texture));
 let triangles=0;for(const row of rows.slice(0,-1))for(const group of c.OPENING_ASSETS.models[row.model].groups){assert.ok(c.OPENING_ASSETS.textures[group.texture]);triangles+=group.verts.length/33;for(let i=2;i<group.verts.length;i+=11)assert.ok(group.verts[i]<=-21+.00001,'Scenery must not cross into the fighters');}assert.ok(triangles>100);assert.equal(c.PinwheelBattles.ambient(place.id).length,0,'No wild Pokémon roam the original Gym');
 // Native upper-platform contact datum: entrance-relative decks previously
 // hung more than twelve units above both fighters in the rendered backdrop.
 assert.equal(c.LeagueBattles.contexts.draydenGym.height,12.002914428710938);let top=-Infinity;for(const row of rows.slice(0,-1))for(const group of c.OPENING_ASSETS.models[row.model].groups)for(let i=1;i<group.verts.length;i+=11)top=Math.max(top,group.verts[i]);assert.ok(top<2,'Puzzle decks must not float above the battle clearing');
 n.zone=120;assert.equal(place.zone,121);assert.equal(c.LEAGUE_FIELD.context(272),null,'Future ending places remain explicit work');
});
