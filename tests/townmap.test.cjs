const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const c={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../src/townmap-assets.js'),'utf8'),c);global.TOWNMAP_ASSETS=c.window.TOWNMAP_ASSETS;
const map=require('../src/townmap.js'),data=global.TOWNMAP_ASSETS;
test('IRBI town map retains the original 61 places, map assets and opening coordinates',()=>{
 assert.equal(data.places.length,61);assert.equal(data.cells.length,25);assert.equal(data.animations.length,19);
 for(const [zone,name,x,y] of [[389,'Soffiolieve',232,158],[317,'Percorso 1',232,148],[397,'Quattroventi',232,138]]){
  const p=data.places.find(p=>p.zone===zone);assert.equal(p.name,name);assert.equal(p.params[2],x);assert.equal(p.params[3],y);assert.equal(map.hit(data.places,x,y).zone,zone);
 }
 assert.match(data.places[0].description,/brezza marina/);
 for(const file of ['map','info',...data.cells.map((_,i)=>'cell-'+i)])assert.ok(fs.existsSync(path.join(__dirname,'../src/assets/townmap',file+'.png')),file);
 for(const a of data.animations)for(const f of a.frames){assert.ok(f[0]>=0&&f[0]<data.cells.length);assert.ok(f[1]>0);}
});
test('map touch geometry remains correct through zoom and bounded panning',()=>{
 for(const zoom of [1,2])for(const p of data.places){const [x,y]=p.params.slice(2,4),view=map.viewFor(x,y,zoom),screen=map.screen(x,y,view),world=map.world(...screen,view);assert.deepEqual(world,[x,y]);assert.ok(view.x>=-128&&view.x<=128&&view.y>=-72&&view.y<=96);}
 assert.equal(map.hit(data.places,-100,-100),null);
 const town=data.places[0];assert.equal(map.capsuleDistance(232,148,town),Infinity,'Original native capsule has no rounded end cap');
 assert.equal(map.capsuleDistance(232,154,town),0);assert.equal(map.capsuleDistance(240,158,town),8);
 const route=data.places.find(p=>p.zone===317);assert.equal(map.capsuleDistance(232,148,route),0);assert.equal(map.capsuleDistance(241,148,route),9);
});
test('native player marker has the six-frame bob and loops without losing duration',()=>{
 assert.deepEqual(Array.from(map.frame(6,0)),[8,8,0,0]);assert.deepEqual(Array.from(map.frame(6,24)),[8,8,0,-3]);assert.deepEqual(Array.from(map.frame(6,48)),[8,8,0,0]);
 assert.equal(map.frame(0,1000)[0],data.animations[0].frames.at(-1)[0]);
});
