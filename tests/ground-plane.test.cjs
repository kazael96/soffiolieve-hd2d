const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('explicit native ground plane prevents decorative roof triangles from lifting characters',()=>{const c={window:{},OPENING_ASSETS:{models:{map:{groups:[{verts:[0,3.5625,0,0,0,0,0,0,0,0,0, 2,3.5625,0,0,0,0,0,0,0,0,0, 0,3.5625,2,0,0,0,0,0,0,0,0]}]}}},ROM_SCENE:{models:{}}};vm.createContext(c);vm.runInContext(fs.readFileSync(require.resolve('../src/world3d.js'),'utf8')+';window.R=VillageRenderer;',c);const r=Object.assign(Object.create(c.window.R.prototype),{scene:{instances:[{model:'map',x:0,y:0,z:0}]}});assert.equal(r.groundHeight(.5,.5),3.5625);r.scene.groundPlane=0;assert.equal(r.groundHeight(.5,.5),0);assert.equal(r.groundHeight(.5,.5,12),0);delete r.scene.groundPlane;assert.equal(r.groundHeight(.5,.5),3.5625,'Other maps retain geometric floors');});

// Native Dreamyard source-provider regressions; no Game, GL or actual HM command.
{
const path=require('node:path');
const src=path.resolve(__dirname,'../src'),candidate=src;
function setup(root=candidate){
 const c={OPENING_ASSETS:{models:{},textures:{},scenes:{}},OPENING_DATA:{},OPENING_SPRITES:{},ROM_SCENE:{models:{}}};c.window=c;vm.createContext(c);
 for(const f of ['striaton-assets.js','striaton-data.js','striaton-events.js'])vm.runInContext(fs.readFileSync(path.join(src,f),'utf8'),c,{filename:f});
 for(const f of ['striaton-bootstrap.js','world3d.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c,{filename:f});
 vm.runInContext('window.R=VillageRenderer',c);const scene=c.OPENING_ASSETS.scenes.zone152;
 return {c,scene,r:Object.assign(Object.create(c.R.prototype),{scene})};
}
function nativeActor(c,id){const n=c.STRIATON_EVENTS.zones[152].actors.find(n=>n.id===id);return {raw:n,x:n.x+.5-16,z:n.z+.5-16,height:n.y/65536};}
function blocked(scene,x,z){const g=scene.permissionGrids.find(g=>x>=g.x-16&&x<g.x+16&&z>=g.z-16&&z<g.z+16),gx=Math.floor(x-g.x)+16,gz=Math.floor(z-g.z)+16;return !!(g.bytes[8+(gz*32+gx)*8+2]&1);}
function nativeCell(scene,x,z){const g=scene.permissionGrids.find(g=>x>=g.x-16&&x<g.x+16&&z>=g.z-16&&z<g.z+16),gx=Math.floor(x-g.x)+16,gz=Math.floor(z-g.z)+16,i=gz*32+gx,at=4+i*8;assert.deepEqual(Array.from(g.bytes.slice(0,4)),[32,0,32,0]);assert.equal(g.bytes.length,4+32*32*8);return {at,envAt:8+i*8,raw:Array.from(g.bytes.slice(at,at+8))};}
test('RED on original: legal north approach uses tree native0 floor, never upper wall3.125',()=>{
 const {c,scene,r}=setup(),tree=nativeActor(c,8);assert.equal(tree.raw.model,108);assert.equal(tree.raw.script,10004);assert.equal(tree.raw.y,0);assert.deepEqual([tree.x,tree.z],[7.5,10.5]);
 assert.equal(blocked(scene,7.5,9.5),false);assert.equal(blocked(scene,7.5,11.5),false);
 const cell=nativeCell(scene,7.5,9.5);assert.equal(cell.at,6588);assert.equal(cell.envAt,cell.at+4,'Runtime8 is environment start, not an8byte permission header');assert.deepEqual(cell.raw,[0,0,0,0,0,0,128,0]);
 assert.equal(r.groundHeight(7.5,9.5),tree.height,'Old mesh-highest returns3.125 at this actual legal approach');
 assert.equal(r.groundHeight(7.5,9.5,3.125),tree.height,'A stale saved or caller height must not select the wall');
 assert.equal(r.groundHeight(tree.x,tree.z),tree.height);assert.equal(r.groundHeight(7.5,11.5),tree.height);
});
test('native item seeds4 and original high geometry remain; neither proves walkable floor4',()=>{
 const {c,scene,r}=setup();assert.equal(scene.groundPlane,undefined);
 for(const id of [4,5]){const n=nativeActor(c,id);assert.equal(n.raw.y,262144);assert.equal(n.height,4);assert.equal(n.raw.model,110);assert.equal(n.raw.type,0);assert.equal(n.raw.movement,0);assert.equal(c.STRIATON_DATA.items[n.raw.script].count,1);assert.equal(blocked(scene,n.x,n.z),false);assert.equal(r.groundHeight(n.x,n.z),n.height,'Preserve existing geometry used by native item seed'+id);assert.deepEqual(nativeCell(scene,n.x,n.z).raw.slice(0,4),[0,0,0,0],'Seed height4 does not encode this tile terrain');}
 assert.equal(c.STRIATON_DATA.items[7027].id,17);assert.equal(c.STRIATON_DATA.items[7028].id,79);
 const groups=c.STRIATON_ASSETS.models['acc-map-280'].groups;
 assert.equal(groups[10].texture,'acc-map-280-kaidan');assert.ok(groups[10].verts.includes(4));
 assert.equal(scene.groundExcludedGroups?.['acc-map-280'],undefined,'Other native map/stair resolver remains unchanged');
});
test('only arch6 and shadow27 leave ground query; other low and high geometry and rendering remain exact',()=>{
 const {c,scene,r}=setup(),model=c.STRIATON_ASSETS.models['acc-map-279'];
 assert.deepEqual(Array.from(scene.groundExcludedGroups?.['acc-map-279']||[]),[6,27]);
 assert.equal(model.groups[27].texture,'acc-map-279-kage');assert.equal(model.groups[27].verts.length,119*33);
 const identities=[[3,'tika',4],[7,'yuka7',8],[9,'yuka6',10],[14,'yuka8',16],[12,'yuka5',15],[18,'yuka3',24],[24,'yuka4',44],[25,'grass01ax',35]];
 for(const [i,suffix,triangles]of identities){assert.equal(model.groups[i].texture,'acc-map-279-'+suffix);assert.equal(model.groups[i].verts.length,triangles*33);}
 const snapshot=JSON.stringify(model);assert.equal(model.groups[6].texture,'acc-map-279-heiana');assert.ok(model.groups[6].verts.includes(3.125));r.groundHeight(7.5,9.5);assert.equal(JSON.stringify(model),snapshot,'No render mesh or native vertex is removed/painted');
 const unscoped=Object.assign(Object.create(c.R.prototype),{scene:{...scene,groundExcludedGroups:undefined}});assert.equal(unscoped.groundHeight(7.5,9.5),3.125,'Absent metadata keeps original geometric behavior');
 // Intrinsic centroids of the FIRST original projected face in each retained
 // low group; no selected winner/parameter search or fitted test coordinates.
 for(const [i]of identities.filter(([i])=>[3,7,9,14].includes(i))){const v=model.groups[i].verts,x=(v[0]+v[11]+v[22])/3,z=(v[2]+v[13]+v[24])/3;assert.equal(r.groundHeight(x,z),unscoped.groundHeight(x,z),'Retain original low-group sample'+i);}
 for(const i of [12,18,24]){const v=model.groups[i].verts;for(let at=1;at<v.length;at+=11)assert.ok(v[at]>=3.5,'Every retained raised vertex dominates excluded max3.125');}
});
test('both original Cut retreat lanes use fixed controller steps through full95percent retreat',()=>{
 const {scene,r}=setup();for(const {startZ,vz}of [{startZ:9.5,vz:1},{startZ:11.5,vz:-1}])for(const step of [0,.25,.5,.75,.95]){const x=7.5,z=startZ-vz*step;
  assert.equal(blocked(scene,x,z),false);assert.equal(r.groundHeight(x,z),0,`Original Cut retreat ${startZ} minus ${vz} times ${step}`);
  assert.deepEqual(nativeCell(scene,x,z).raw.slice(0,4),[0,0,0,0]);
  for(const offset of [-.18,.18])assert.equal(blocked(scene,x+offset,z+offset),false,'Original canRetreat corner-permission samples');
 }
});
test('actual public HM placement retains shared floor and original sprite/shadow offsets for both approaches',()=>{
 const {c,r}=setup();vm.runInContext(fs.readFileSync(path.join(src,'field-hm-world.js'),'utf8'),c,{filename:'field-hm-world.js'});
 const pitch=[Math.sin(62*Math.PI/180),Math.cos(62*Math.PI/180)];let previous;
 for(const z of [9.5,11.5]){const ground=r.groundHeight(7.5,z),p=c.FieldHMWorld.placement({x:7.5,z,height:ground},pitch,0,0);
  assert.equal(ground,0);assert.equal(p.groundHeight,ground);assert.equal(p.height,-2*pitch[1]);assert.equal(p.groundZ,z);assert.equal(p.groundX,7.5);assert.equal(p.groundHeight+.035,.035,'Original shadow bias remains unchanged');
  if(previous)assert.equal(p.height,previous.height,'Front/back baseline differs only by native placement, not a roof floor');previous=p;
 }
 // UNIT provider/placement only: no actual Game hero, action, draw, sound or ACK.
});
}
