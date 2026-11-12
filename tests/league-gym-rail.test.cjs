/* Real121 tables and field host; explicit waypoints isolate steering from story. */
const test=require('node:test'),assert=require('node:assert/strict'),{setup}=require('./helpers/league-field-host.cjs');
function place(c,line,front){const p=c.NativeRails.position(121,line,front),n=c.NativeStory.state;c.player={x:p.x-16,y:p.z-16};n.fieldHeight=p.height;n.draydenRailWalk={version:1,line,front,mode:'walk'};n.railCurrent={zone:121,line,front,height:p.height};}

test('native Up follows the original diagonal, curve and junction through three lines without Cartesian corner steering',async()=>{
 for(const speed of [1,2,4]){
  const c=await setup();place(c,1,0);const seen=new Set();let steps=0;
  while(steps++<1500){const r=c.NativeStory.state.draydenRailWalk;seen.add(r.line);if(r.line===3&&r.front>=1)break;assert.equal(c.LeagueGym.tryStep(0,-1,speed/60),true);c.LeagueGym.tick(speed/60);}
  assert.ok(steps<1500);assert.ok(seen.has(1)&&seen.has(2)&&seen.has(3));const r=c.NativeStory.state.draydenRailWalk,p=c.NativeRails.position(121,r.line,r.front);assert.ok(Math.abs(c.player.x-(p.x-16))<1e-7);assert.ok(Math.abs(c.player.y-(p.z-16))<1e-7);assert.equal(c.NativeStory.state.fieldHeight,p.height);
 }
});

test('the steering never grants an outgoing branch disabled by the native dragon pose',async()=>{
 const c=await setup(),n=c.NativeStory.state;place(c,30,0);const before={...c.player};assert.equal(c.LeagueGym.task.railEnabled(31),false);c.LeagueGym.tryStep(1,0,1/60);assert.deepEqual(c.player,before);
 c.LeagueGym.tryStep(-1,0,1/60);assert.ok(c.player.x<before.x);
 const arm=c.LeagueGym.task.begin('arm',0,0);c.LeagueGym.task.tick(41/30);await arm;const neck=c.LeagueGym.task.begin('neck',0);c.LeagueGym.task.tick(81/30);await neck;
 assert.equal(c.LeagueGym.task.railEnabled(30),false);const stopped={...c.player};c.LeagueGym.tryStep(-1,0,1/60);assert.deepEqual(c.player,stopped);assert.equal(n.zone,121);
});

test('an original163 ribbon exit returns onto the WB floor without globally opening other163 boundaries',async()=>{
 const c=await setup();place(c,14,2);let steps=0;
 while(c.NativeStory.state.draydenRailWalk&&steps++<120){c.LeagueGym.tryStep(-1,0,1/60);c.LeagueGym.tick(1/60);}
 assert.ok(steps<120);assert.equal(c.NativeStory.state.draydenRailWalk,undefined);assert.equal(c.blocked(c.player.x,c.player.y),false);
 assert.equal(c.OpelucidChapter.blockedAt(121,7.5,23.5),true,'Closed native connector remains blocked');
});

test('entry alignment is bounded, checkpointable and restorable without a scene-change teleport',async()=>{
 const c=await setup();place(c,1,2);delete c.NativeStory.state.draydenRailWalk;c.player.x+=.12;
 assert.equal(c.LeagueGym.tryStep(0,-1,1/60),true);assert.equal(c.LeagueGym.busy,true);assert.equal(c.LeagueGym.checkpointable,true);c.LeagueGym.tick(1/120);
 const n=c.NativeStory.state,record=structuredClone(n.draydenRailWalk),hero={...c.player};assert.equal(c.LeagueGymRail.validRecord(record,c.LEAGUE_RAILS[121]),true);assert.equal(c.LeagueGym.rail.restore(),true);assert.deepEqual(c.player,hero);
 let frames=0;while(c.LeagueGym.busy&&frames++<60)c.LeagueGym.tick(1/60);assert.ok(frames<60);assert.equal(n.draydenRailWalk.mode,'walk');
 n.zone=120;c.player={x:100,y:100};n.fieldHeight=0;c.LeagueGym.enter(120);assert.deepEqual(c.player,{x:100,y:100});assert.equal(n.draydenRailWalk,undefined);
});

test('line16 switches from its A3 cell to the native WB ramp before the blocked rail endpoint',async()=>{
 const c=await setup();place(c,16,1.25);let frames=0;
 while(c.NativeStory.state.draydenRailWalk&&frames++<120){c.LeagueGym.tryStep(1,0,1/60);c.LeagueGym.tick(1/60);}
 assert.ok(frames<120,'Must leave the ribbon through its actual WB ramp');assert.equal(c.NativeStory.state.draydenRailWalk,undefined);assert.equal(c.blocked(c.player.x,c.player.y),false);
 const floor=c.OpelucidChapter.rawSurfaceAt(121,c.player.x,c.player.y,c.NativeStory.state.fieldHeight);assert.ok(Math.abs(c.NativeStory.state.fieldHeight-floor.height)<1e-6);
});

test('a corrupt rail checkpoint is isolated while native flags and inventory survive',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.extraItems={1:4};n.flags=[9];n.draydenRailWalk={version:1,line:999,front:Infinity,mode:'walk'};
 const recovery=c.LeagueGymRail.normalize(n);assert.equal(recovery.x,11.5);assert.equal(recovery.y,33.5);assert.equal(n.draydenRailWalk,undefined);assert.equal(n.extraItems[1],4);assert.deepEqual(n.flags,[9]);
});

test('the native WB114 ledge jumps right, refuses the reverse direction and restores its airborne checkpoint at every speed',async()=>{
 for(const speed of [1,2,4]){
  const c=await setup(),n=c.NativeStory.state;c.player={x:34.8,y:13.5};n.fieldHeight=0;delete n.draydenRailWalk;delete n.railCurrent;
  assert.equal(c.LeagueGym.tryStep(-1,0,speed/60),false);assert.equal(c.LeagueGym.tryStep(1,0,speed/60),true);assert.equal(c.LeagueGym.busy,true);assert.equal(n.draydenRailWalk.marker[2],114);
  let frames=0;while(c.LeagueGym.busy&&frames++<120){c.LeagueGym.tick(speed/60);if(c.LeagueGym.busy){assert.equal(c.LeagueGym.rail.restore(),true);assert.ok(c.player.jumpLift>=0);}}
  assert.ok(frames<120);assert.equal(c.player.x,36.5);assert.equal(c.player.y,13.5);assert.equal(c.player.jumpLift,undefined);assert.equal(n.draydenRailWalk,undefined);assert.equal(c.blocked(c.player.x,c.player.y),false);
 }
});

test('a native ledge cannot jump onto an occupied destination or be restored with a forged destination',async()=>{
 const c=await setup(),n={zone:121,fieldHeight:0},hero={x:34.8,y:13.5},options={state:()=>n,hero:()=>hero,rails:c.NativeRails,tables:()=>c.LEAGUE_RAILS[121],floor:(x,z,h)=>c.OpelucidChapter.rawSurfaceAt(121,x,z,h),speed:()=>3.5,save(){},resetInput(){}};
 const blocked=c.LeagueGymRail.create({...options,occupied:(x,z)=>Math.hypot(x-36.5,z-13.5)<.1});assert.equal(blocked.tryStep(1,0,1/60),false);assert.equal(n.draydenRailWalk,undefined);
 const motion=c.LeagueGymRail.create({...options,occupied:()=>false});assert.equal(motion.tryStep(1,0,1/60),true);n.draydenRailWalk.to[0]=37;assert.equal(motion.restore(),false);assert.equal(n.draydenRailWalk,undefined);assert.deepEqual(hero,{x:34.8,y:13.5});
});

test('the WB A3 entrance joins enabled line17 continuously before the trailing probe reaches its blocked cell',async()=>{
 const c=await setup(),n=c.NativeStory.state;c.player={x:28.18,y:6.5};n.fieldHeight=c.OpelucidChapter.rawSurfaceAt(121,28.18,6.5,0).height;delete n.draydenRailWalk;delete n.railCurrent;
 assert.equal(c.LeagueGym.tryStep(-1,0,1/60),true);assert.equal(c.LeagueGym.busy,true);assert.equal(n.draydenRailWalk.line,17);let frames=0;while(c.LeagueGym.busy&&frames++<60)c.LeagueGym.tick(1/60);assert.ok(frames<60);assert.equal(n.draydenRailWalk.mode,'walk');assert.equal(c.blocked(c.player.x,c.player.y),false);
});

test('turning near a native branching point finishes the current ribbon before taking the requested outgoing line',async()=>{
 for(const speed of [1,2,4]){const c=await setup();place(c,17,1.8);let frames=0;while(c.NativeStory.state.draydenRailWalk.line!==7&&frames++<60){c.LeagueGym.tryStep(0,-1,speed/60);c.LeagueGym.tick(speed/60);}assert.ok(frames<60);assert.equal(c.NativeStory.state.draydenRailWalk.line,7);assert.equal(c.player.x,26.5);assert.ok(c.player.y<=6.5);}
});

test('the final A3 cell of line13 permits its original sideways WB exit without walking outside the map',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.draydenPuzzle.dragons[1]={neck:0,arms:[0,0]};place(c,13,6.5);let frames=0;while(n.draydenRailWalk&&frames++<120){c.LeagueGym.tryStep(-1,0,1/60);c.LeagueGym.tick(1/60);}assert.ok(frames<120);assert.equal(n.draydenRailWalk,undefined);assert.ok(c.player.x<26);assert.equal(c.player.y,-15);assert.equal(c.blocked(c.player.x,c.player.y),false);assert.ok(Math.abs(n.fieldHeight-6)<.01);
});

test('the original raised button is approached continuously instead of teleporting two units upward',async()=>{
 const c=await setup(),n=c.NativeStory.state;c.player={x:21.18,y:6.5};n.fieldHeight=c.OpelucidChapter.rawSurfaceAt(121,21.18,6.5,-1).height;delete n.draydenRailWalk;delete n.railCurrent;const start={...c.player};
 assert.equal(c.LeagueGym.tryStep(-1,0,1/60),true);assert.equal(n.draydenRailWalk.buttonStep,true);assert.deepEqual(c.player,start);let previous=n.fieldHeight,frames=0;
 while(c.LeagueGym.busy&&frames++<120){c.LeagueGym.tick(1/60);assert.ok(n.fieldHeight>=previous);assert.ok(n.fieldHeight-previous<.1);previous=n.fieldHeight;if(c.LeagueGym.busy)assert.equal(c.LeagueGym.rail.restore(),true);}
 assert.ok(frames<120);assert.equal(c.player.x,20.5);assert.equal(c.player.y,6.5);assert.ok(Math.abs(n.fieldHeight-1)<.01);assert.equal(n.railCurrent,undefined);
});

test('a button triggered at a tile edge aligns visibly before the unchanged native hop, with checkpoint and audio timing preserved',async()=>{
 const c=await setup(),n=c.NativeStory.state,sounds=[];c.player={x:32.99,y:6.79};n.fieldHeight=c.OpelucidChapter.rawSurfaceAt(121,c.player.x,c.player.y,1).height;
 const jump=c.LeagueGymJump.create({data:c.LEAGUE_GYM_DATA,state:()=>n,hero:()=>c.player,sound:id=>sounds.push(id)}),pending=jump.begin(2),start={...c.player};
 assert.deepEqual(c.player,start);assert.equal(sounds.length,0);assert.equal(n.draydenJump.origin[0],32.5);assert.equal(n.draydenJump.origin[1],6.5);let ticks=0;
 while(n.draydenJump.approach&&ticks++<60){const previous={...c.player};jump.tick(1/60);assert.ok(Math.hypot(c.player.x-previous.x,c.player.y-previous.y)<=3.5/60+1e-8);if(n.draydenJump.approach){const copy=structuredClone(n);c.LeagueGymSave.normalize(copy);assert.deepEqual(copy.draydenJump,n.draydenJump);assert.equal(jump.restore(),true);}}
 assert.ok(ticks<60);assert.deepEqual(sounds,[c.LEAGUE_GYM_DATA.jump.sounds[0]]);for(let i=0;i<8;i++)jump.tick(1/30);assert.equal(await pending,true);assert.equal(c.player.x,31.5);assert.equal(c.player.y,6.5);assert.equal(c.blocked(c.player.x-.1,c.player.y),false);assert.deepEqual(sounds,Array.from(c.LEAGUE_GYM_DATA.jump.sounds));
});
