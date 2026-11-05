const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const c={window:{}};vm.createContext(c);for(const n of ['icirrus-gym-data','icirrus-gym-motion','icirrus-cannon-task'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',n+'.js'),'utf8'),c);
const D=c.window.ICIRRUS_GYM_DATA,delta=[[0,-1],[0,1],[-1,0],[1,0]],routes=[];
for(let index=0;index<10;index++)for(let direction=0;direction<4;direction++){const column=D.nativeDirectionToColumn[direction];if(D.routes[index][column].member>=0)routes.push({index,direction,column});}
function fixture(route,snapshot){
 const origin=D.anchors[route.index],state=snapshot?structuredClone(snapshot.state):{zone:108,cannonHeight:origin[1]},hero=snapshot?structuredClone(snapshot.hero):{x:origin[0]-16-delta[route.direction][0]*2+.5,y:origin[2]-16-delta[route.direction][1]*2+.5},sounds=[],events=[];
 const task=c.window.IcirrusCannonTask.create({data:D,readState:()=>state,hero:()=>hero,sound:id=>sounds.push(id),camera:(kind,ride)=>events.push({kind,ride:ride?JSON.parse(JSON.stringify(ride)):null,position:[hero.x,state.cannonHeight,hero.y]})});
 return {task,state,hero,sounds,events};
}
for(const speed of [1,2,4])test('all14 cannon tasks consume every native path point and finish at ×'+speed,async()=>{
 for(const route of routes){const f=fixture(route),promise=f.task.start(route.direction);assert.ok(promise);assert.equal(f.task.start(route.direction),null,'No concurrent flight');let updates=0;
  while(f.task.busy&&updates++<2000)f.task.tick(speed/60);
  assert.equal(await promise,true);assert.equal(f.task.busy,false);assert.equal(f.task.hidden,false);assert.equal(f.state.cannonRide,undefined);
  const r=D.routes[route.index][route.column],points=f.events.filter(e=>e.kind==='flight'||e.kind==='flightTick'),native=D.paths[r.member];assert.equal(points.length,native.frames,r.member);
  for(let frame=0;frame<points.length;frame++)assert.equal(points[frame].ride.pathFrame,frame,'No skipped/duplicated path frame');
  const end=[r.destination[0]+.5-16,r.destination[1],r.destination[2]+.5-16];assert.deepEqual([f.hero.x,f.state.cannonHeight,f.hero.y],end);
  assert.deepEqual([...f.sounds].sort((a,b)=>a-b),[1686,1688,1689,1696,r.profile===11?1697:1687].sort((a,b)=>a-b));assert.equal(new Set(f.sounds).size,f.sounds.length);
  assert.equal(f.events.filter(e=>e.kind==='entryTick').length,20);assert.equal(f.events.at(-1).kind,'restore');
 }
});
test('checkpoints in each task phase resume without replaying sounds or losing the landing',async()=>{
 const route=routes.find(r=>D.routes[r.index][r.column].member===21);
 for(const phase of ['recoil','enter','windup','flight','settle','restore']){
  const before=fixture(route);before.task.start(route.direction);for(let i=0;i<1000&&before.state.cannonRide.phase!==phase;i++)before.task.tick(1/30);
  assert.equal(before.state.cannonRide.phase,phase);const snapshot={state:before.state,hero:before.hero},previousSounds=[...before.state.cannonRide.played],resumed=fixture(route,snapshot);assert.equal(resumed.task.resume(),true);const promise=resumed.task.promise;
  for(let i=0;i<1000&&resumed.task.busy;i++)resumed.task.tick(1/30);
  assert.equal(await promise,true);assert.equal(resumed.state.cannonHeight,10);for(const id of previousSounds)assert.ok(!resumed.sounds.includes(id),'Already consumed sound '+id);
 }
});
test('route21 preserves its final10.25 sample before the native reset to10',()=>{
 const route=routes.find(r=>D.routes[r.index][r.column].member===21),f=fixture(route);f.task.start(route.direction);
 for(let i=0;i<1000&&f.task.ride.phase!=='settle';i++)f.task.tick(1/30);
 assert.equal(f.state.cannonHeight,10.25);f.task.tick(1/30);assert.equal(f.state.cannonHeight,10);assert.equal(f.task.ride.phase,'restore');f.task.tick(1/30);assert.equal(f.task.busy,false);
});
test('zone changes release the task without moving the hero back into the old Gym',async()=>{
 const f=fixture(routes[0]),promise=f.task.start(routes[0].direction);f.task.tick(.5);f.state.zone=107;f.hero.x=-600;f.hero.y=-300;f.task.tick(1/30);assert.equal(await promise,false);assert.deepEqual([f.hero.x,f.hero.y],[-600,-300]);assert.equal(f.task.busy,false);
});
test('corrupt saved tasks and invalid input do not leave a permanent field lock',()=>{
 for(const ride of [{index:99},{index:0,column:0,phase:'flight',fraction:Infinity}]){const f=fixture(routes[0]);f.state.cannonRide=ride;assert.equal(f.task.resume(),false);assert.equal(f.task.busy,false);}
 const f=fixture(routes[0]);assert.equal(f.task.start(-1),null);assert.equal(f.task.start(routes[0].direction,{frontBlocked:true}),null);f.state.zone=107;assert.equal(f.task.start(routes[0].direction),null);
});
