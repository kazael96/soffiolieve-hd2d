const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const Location=require('../src/battle-location.js');
test('all opening rooms select explicit environments, including the disrupted bedroom',()=>{
 for(const [scene,[id,label,zone]]of Object.entries(Location.rooms)){const p=Location.capture({scene},{},{x:2,y:3});assert.equal(p.id,id);assert.equal(p.label,label);assert.equal(p.zone,zone);assert.equal(p.terrain,'interior');}
 assert.equal(Location.capture({scene:'bedroom'},{roomMess:true},{x:2,y:3}).id,'bedroomMess');
 assert.throws(()=>Location.capture({scene:'cave'},{},{x:2,y:3}),/non definito/);
});
test('physical position selects town, route grass/path and the Quattroventi entrance and remains immutable',()=>{
 const state={scene:'town'},pos={x:0,y:0};const town=Location.capture(state,{},pos,'grass');assert.equal(town.id,'nuvema');
 pos.y=-30;assert.equal(Location.capture(state,{},pos,'grass').terrain,'grass');assert.equal(Location.capture(state,{},pos,'path').id,'route1');
 pos.y=-81;assert.equal(Location.capture(state,{},pos).id,'accumulaEntrance');state.scene='lab';assert.equal(town.id,'nuvema');assert.equal(town.y,0);assert.ok(Object.isFrozen(town));
 assert.throws(()=>Location.capture(state,{},{}),/non disponibile/);
});
test('grass comes from the original eight-byte permission cells',()=>{
 const g={x:0,z:-32,bytes:new Uint8Array(8200)},p={x:2.7,y:-30.2};g.bytes[8+(Math.floor(p.y-g.z)+16)*256+(Math.floor(p.x-g.x)+16)*8]=4;
 assert.equal(Location.tile([g],p),'grass');assert.equal(Location.tile([g],{x:2,y:-32}),'path');assert.equal(Location.tile([g],{x:50,y:50}),'path');
});
test('every captured place resolves to a catalog with original assets and complete floor/wall materials',()=>{
 const c={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/battle-environment-assets.js'),'utf8'),c);const a=c.window.BATTLE_ENVIRONMENT_ASSETS;
 for(const id of [...Object.keys(Location.rooms),'bedroomMess','route1','nuvema']){const p=a.environments[id];assert.ok(p,id);assert.ok(p.surfaces.floor||p.surfaces.ground);if(p.kind==='interior')assert.ok(p.surfaces.backWall);for(const key of [...Object.values(p.surfaces),...Object.values(p.decorations)]){const r=a.textures[key];assert.ok(r,key);assert.ok(r.existingAsset);assert.match(r.sha256,/^[a-f0-9]{64}$/);}}
});
