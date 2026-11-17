const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=path.resolve(__dirname,'../src');
function gate(){
 const c={OPENING_ASSETS:{models:{},textures:{},scenes:{}},OPENING_DATA:{},OPENING_SPRITES:{},ROM_SCENE:{models:{}}};c.window=c;vm.createContext(c);
 for(const file of ['accumula-assets.js','accumula-bootstrap.js','accumula-events.js','world3d.js'])vm.runInContext(fs.readFileSync(path.join(source,file),'utf8'),c,{filename:file});
 vm.runInContext('window.Renderer=VillageRenderer',c);
 const scene=c.OPENING_ASSETS.scenes.zone320,renderer=Object.assign(Object.create(c.Renderer.prototype),{scene});
 return {c,scene,renderer};
}
test('the Route 2 gate keeps feet on its native floor under the rear ceiling and along both doorways',()=>{
 const {c,scene,renderer}=gate(),mesh=c.OPENING_ASSETS.models['acc-map-514'];
 const floor=mesh.groups.find(g=>g.texture==='acc-map-514-gate_yuka02');
 assert.ok(floor.verts.length>0);for(let i=1;i<floor.verts.length;i+=11)assert.equal(floor.verts[i],-.125);
 assert.ok(mesh.groups.find(g=>g.texture==='acc-map-514-gate_ten01').verts.includes(5.5),'The native ceiling stays in the scene');
 assert.equal(scene.instances[0].model,'acc-map-514');
 for(const x of [-14.5,-13.5,-11.5,-7.5,-3.5,-1.5,-.5])for(const z of [-12.9,-12.5,-11.5,-11.1,-10.9,-10.5,-9.5,-8.5]){
  assert.equal(renderer.groundHeight(x,z),-.125,`Gate floor at ${x},${z}`);
  assert.equal(renderer.groundHeight(x,z,5.5),-.125,'An old saved ceiling elevation cannot become the floor');
 }
});
test('both native gate arrivals retain their doorway and move inward continuously at the same floor height',()=>{
 const {c,renderer}=gate(),warps=c.ACCUMULA_EVENTS.zones[320].warps;
 assert.equal(warps.length,2);
 for(const warp of warps){
  const x=Math.floor(warp.x/16)+.5-16,z=Math.floor(warp.z/16)+.5-16,dx=warp.a===3?-1:1;
  for(let step=0;step<=20;step++)assert.equal(renderer.groundHeight(x+dx*step/20,z),-.125,`Arrival from ${warp.zone}, frame ${step}`);
  for(const lateral of [-.9,0,.9])assert.equal(renderer.groundHeight(x+dx,z+lateral),-.125,'The three-tile doorway has one floor');
 }
});
