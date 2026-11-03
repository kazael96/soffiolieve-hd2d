const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){const state={zone:63,vars:{},flags:[116,117]},c={console,player:{x:0,y:0},facing:0,NativeStory:{state},Journey:{save:()=>{}},AudioEngine:{playSound:()=>{}},resetInput(){}};c.window=c;vm.createContext(c);for(const file of ['starter-scene','driftveil-gym-data','driftveil-gym'])vm.runInContext(fs.readFileSync('src/'+file+'.js','utf8'),c);return c;}
function station(c,id){const [x,z]=c.DRIFTVEIL_GYM_DATA.stations[id];c.player.x=x-15.5;c.player.y=z-15.5;}
function ride(c,to){assert.equal(c.DriftveilGym.interact(),true);assert.equal(c.DriftveilGym.busy,true);assert.equal(c.DriftveilGym.interact(),false);let moved=false,last={...c.player};for(let i=0;i<300&&c.DriftveilGym.busy;i++){c.DriftveilGym.tick(.1);assert.ok(Number.isFinite(c.player.x)&&Number.isFinite(c.player.y));if(Math.hypot(c.player.x-last.x,c.player.y-last.y)>.01)moved=true;last={...c.player};}assert.equal(c.DriftveilGym.busy,false);assert.ok(moved);const [x,z]=c.DRIFTVEIL_GYM_DATA.stations[to];assert.ok(Math.hypot(c.player.x-(x-15.5),c.player.y-(z-15.5))<1e-5);}
test('original carts and switches connect entrance, both trainer platforms, leader and return',()=>{
 const c=setup(),g=c.DriftveilGym;
 station(c,0);ride(c,1);g.activate(0);ride(c,2);
 station(c,3);assert.equal(g.interact(),false);g.activate(1);ride(c,4);
 station(c,5);assert.equal(g.interact(),false);g.activate(2);ride(c,6);
 station(c,7);assert.equal(g.interact(),false);g.activate(3);ride(c,8);
 assert.deepEqual(Array.from(c.NativeStory.state.rollerSwitches),[1,1,1,1]);assert.deepEqual([0,1,2,3].map(i=>c.NativeStory.state.vars[16395+i]),[1,1,1,1]);assert.equal(g.heroHeight(2),2);
});
test('a scene change cancels a cart without moving the player into the old gym',()=>{
 const c=setup();station(c,0);assert.equal(c.DriftveilGym.interact(),true);c.NativeStory.state.zone=64;c.player.x=40;c.player.y=5;c.DriftveilGym.tick(.1);assert.equal(c.DriftveilGym.busy,false);assert.deepEqual({...c.player},{x:40,y:5});
});
test('a cart left at the other platform returns continuously before the player boards',()=>{
 const c=setup();c.NativeStory.state.rollerFrames=[0,0,0,0];station(c,0);const before={...c.player};assert.equal(c.DriftveilGym.interact(),true);for(let i=0;i<10;i++){c.DriftveilGym.tick(.1);assert.deepEqual({...c.player},before,'Player moved before the returning cart arrived');}for(let i=0;i<150&&c.DriftveilGym.busy;i++)c.DriftveilGym.tick(.1);assert.equal(c.DriftveilGym.busy,false);const p=c.DRIFTVEIL_GYM_DATA.stations[1];assert.ok(Math.hypot(c.player.x-p[0]+15.5,c.player.y-p[1]+15.5)<1e-5);
});
test('only the native switch indices may change roller-coaster routes',()=>{
 const c=setup();for(const id of [-1,4,100])assert.throws(()=>c.DriftveilGym.activate(id));assert.equal(c.NativeStory.state.rollerSwitches,undefined);
});
test('the two cart guards must be battled before boarding their route',()=>{
 for(const [from,sw,flag]of [[3,1,116],[5,2,117]]){const c=setup(),events=[];c.NativeStory.state.flags=c.NativeStory.state.flags.filter(f=>f!==flag);c.NativeStory.run=async entry=>events.push(entry);c.DriftveilGym.activate(sw);station(c,from);assert.equal(c.DriftveilGym.interact(),true);assert.deepEqual(events,[7]);assert.equal(c.DriftveilGym.busy,false);}
});
