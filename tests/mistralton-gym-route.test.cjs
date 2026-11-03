/* Source/controller checks; physical browser input and rendered pixels are separate. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src'),context={window:{}};
for(const file of ['mistralton-events.js','mistralton-gym-data.js','mistralton-assets.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const events=context.window.MISTRALTON_EVENTS,data=context.window.MISTRALTON_GYM_DATA,assets=context.window.MISTRALTON_ASSETS;
const {FieldEventVM}=require('../src/field-event-vm.js'),{createController}=require('../src/mistralton-gym.js'),{route}=require('../src/field-actor-exits.js'),NpcWalk=require('../src/npc-walk.js');
const source=fs.readFileSync(path.join(__dirname,'browser-qa.js'),'utf8'),gymCase=source.slice(source.indexOf("case049('qaGym049'"),source.indexOf("case049('qaArrival049'"));
const browserCalls=[...gymCase.matchAll(/await lift\((\d+),(\d+),(\d+),(\d+),(-?\d+),\{([^}]+)\}\)/g)].map(m=>({index:+m[1],x:+m[2],z:+m[3],dir:+m[4],height:+m[5],script:+m[6].match(/script:(\d+)/)[1],carried:!m[6].includes('carried:false'),eastOfButton:m[6].includes('eastOfButton:true')}));
function setup(){
 const state={zone:97,vars:{},flags:data.initialFlags.flatMap((v,i)=>v?[10+i]:[]),clayHeight:50,clayLifts:[...data.initialStates],clayActors:{},clayBarrier:0},player={x:1.5,y:9.5},actors=events.zones[97].actors.map(a=>({uid:a.id,model:a.model,fieldZone:97,x:a.x+.5-16,y:a.z+.5-16,height:a.id===0?-59:a.y/65536,gimmick:a.model===185})),calls=[],messages=[],entries=[];
 let controller,task,direction=0,done=true,error;
 const eventVM=new FieldEventVM(events,state,{async command(c,a,v){if(c.name==='NativeOpcode400')calls.push(v[0]);if(c.name==='MsgSystem')messages.push(v[0]);const result=controller.command(c.name,a,v);if(result!==false)return result;assert.ok(['ActorPauseAll','ActorUnlockAll','RTFinishSubEvents','SEPlay','SEWait','MsgSystem','InputWaitLast','MsgWinCloseAll'].includes(c.name),'Unexpected switch command '+c.name);return true;}});
 const catalog={models:{},textures:{},scenes:{zone97:{instances:[],permissionGrids:assets.scenes[97].permissionGrids},zone98:{instances:[]}}};
 controller=createController({data,state:()=>state,player:()=>player,actors:()=>actors,assets:catalog,events,direction:()=>direction,save(){},resetInput(){},audio(){},stopAudio(){},loadGLB:async()=>({animationSets:[]}),run(entry){entries.push(entry);done=false;error=null;task=eventVM.run(194,entry).then(()=>done=true,e=>{done=true;error=e;});return task;}});
 const occupied=(x,y)=>actors.some(n=>!n.gimmick&&controller.sameLevel(n)&&NpcWalk.occupies(n,x,y));
 function can(x,y){return !controller.blocked(x-.18,y-.18)&&!controller.blocked(x+.18,y+.18)&&!occupied(x,y);}
 function walk(x,z){const goal={x:x+.5-16,y:z+.5-16},points=route(player,goal,(x,y)=>controller.blocked(x,y)||occupied(x,y));assert.ok(points.length||Math.hypot(player.x-goal.x,player.y-goal.y)<.22,'No actual footpath '+[x,z,state.clayHeight]);assert.ok(!points.length||Math.hypot(points.at(-1).x-goal.x,points.at(-1).y-goal.y)<.1,'Disconnected footpath '+[x,z,state.clayHeight]);let samples=0;
  for(let i=0;i<points.length;i++){const p=points[i],previous=points[i-1],next=points[i+1];if(previous&&next&&(previous.x===p.x&&next.x===p.x||previous.y===p.y&&next.y===p.y))continue;
   for(let guard=0;Math.abs(player.x-p.x)>=.15||Math.abs(player.y-p.y)>=.15;guard++){assert.ok(guard<3000,'Input path stalled '+JSON.stringify({player,target:p,height:state.clayHeight}));const dx=p.x-player.x,dy=p.y-player.y;let x=player.x,y=player.y;if(Math.abs(dx)>.12)x+=Math.sign(dx)*Math.min(3.5/60,Math.abs(dx));else if(Math.abs(dy)>.12)y+=Math.sign(dy)*Math.min(3.5/60,Math.abs(dy));assert.ok(can(x,y),'Actual input collision '+JSON.stringify({player,target:p,next:{x,y},height:state.clayHeight}));player.x=x;player.y=y;samples++;}
  }assert.ok(Math.hypot(player.x-goal.x,player.y-goal.y)<.23,'Endpoint drift');return samples;
 }
 async function settle(speed=1){for(let i=0;i<3000&&(!done||controller.busy);i++){await Promise.resolve();controller.tick(speed/60);}await task;if(error)throw error;assert.equal(done,true);assert.equal(controller.busy,false);}
 function eastOfButton(x){for(let i=0;player.x<x+.5-16;i++){assert.ok(i<20);assert.ok(can(player.x+3.5/60,player.y));player.x+=3.5/60;}}
 return {state,player,actors,calls,messages,entries,controller,walk,eastOfButton,settle,setDirection:v=>direction=v,get done(){return done;}};
}
test('all26 native backgrounds bind twelve lift directions and two distinct main-return buttons',async()=>{
 assert.equal(events.zones[97].background.length,26);
 for(const b of events.zones[97].background.filter(b=>b.script<=13)){
  const s=setup(),index=Math.floor((b.script-2)/2),up=b.script%2===0,endpoint=data.lifts[index].heights.indexOf(up?Math.min(...data.lifts[index].heights):Math.max(...data.lifts[index].heights));
  s.state.clayLifts[index]=endpoint;s.state.flags=s.state.flags.filter(f=>f!==10+index);if(up)s.state.flags.push(10+index);s.state.clayHeight=b.y/16;s.player.x=b.x+.5-16;s.player.y=b.z+1.5-16;s.setDirection(0);
  assert.equal(s.controller.interact(),true);await s.settle();assert.deepEqual(s.entries,[b.script-1]);assert.deepEqual(s.calls,[index]);assert.deepEqual(s.messages,[]);assert.equal(s.controller.level(index),up?Math.max(...data.lifts[index].heights):Math.min(...data.lifts[index].heights));
 }
 const p=events.scripts[194],up=p.code[p.entries[15]],down=p.code[p.entries[16]];assert.equal(up.name,'ActorPauseAll');assert.equal(down.name,'ActorPauseAll');assert.deepEqual(Array.from(p.code[1446].args),[1]);assert.equal(p.code[1446].name,'NativeOpcode401');assert.deepEqual(Array.from(p.code[1456].args),[98,5,0,4,0]);assert.deepEqual(Array.from(p.code[1480].args),[8,2]);
});
test('the formerly selected left switch at18,25 correctly refuses to raise lift0 above50',async()=>{const s=setup();s.walk(18,25);s.setDirection(0);assert.equal(s.controller.interact(),true);await s.settle();assert.deepEqual(s.entries,[1]);assert.deepEqual(s.calls,[]);assert.deepEqual(s.messages,[7]);assert.equal(s.state.clayHeight,50);assert.equal(s.state.clayLifts[0],0);});
test('independent cache waypoints declare the Gym elevation required by the actual native warp',()=>{
 const cache=source.slice(source.indexOf("case049('qaCache049'"),source.indexOf("const presentation049=")),waypoints=JSON.parse(cache.match(/const waypoints=(\[\[.*?\]\]);/)[1]);assert.deepEqual(waypoints.find(p=>p[0]===98),[98,6,14,0]);assert.deepEqual(waypoints.find(p=>p[0]===97),[97,17,25,50]);assert.match(cache,/if\(height!==undefined\)NativeStory\.state\.clayHeight=height;await enter049\(zone,nx,nz\)/);
 const warp=events.scripts[196].code[87];assert.equal(warp.name,'NativeOpcode196');assert.deepEqual(Array.from(warp.args),[97,17,50,25,0]);const s=setup();s.state.zone=98;s.state.clayHeight=0;s.state.zone=97;s.controller.enter(97,s.state.clayHeight);assert.equal(s.controller.heroHeight(),0,'Bare changeZone must not silently replace an explicit height');s.state.clayHeight=warp.args[2];s.controller.enter(97,s.state.clayHeight);assert.equal(s.controller.heroHeight(),50);assert.equal(s.controller.blocked(1.5,9.5),false,'Native warp and cache waypoint both land on the main platform');
});
test('browser gym route presses native scripts with actual actor/body collisions at all speeds',async()=>{
 assert.equal(browserCalls.length,11,'Fixture route no longer has the eleven documented lift calls');
 assert.deepEqual(browserCalls.map(c=>c.script),[3,4,10,11,7,6,8,9,10,13,12]);
 for(const speed of [1,2,4]){
  const s=setup();let samples=0;
  for(const call of browserCalls){samples+=s.walk(call.x,call.z);if(call.eastOfButton)s.eastOfButton(call.x);s.setDirection(call.dir);const at=s.calls.length,pose={...s.player};assert.equal(s.controller.interact(),true,'Missing button '+JSON.stringify(call));for(let i=0;i<20&&!s.controller.busy&&!s.done;i++)await Promise.resolve();assert.equal(s.controller.busy,true,'Native button did not move '+JSON.stringify({call,messages:s.messages}));assert.equal(s.entries.at(-1),call.script-1);assert.equal(s.controller.ride.index,call.index);assert.equal(s.controller.ride.hero,call.carried);assert.equal(s.controller.interact(),true,'A while moving must be consumed');assert.equal(s.entries.at(-1),call.script-1);await s.settle(speed);assert.equal(s.calls.length,at+1);assert.equal(s.state.clayHeight,call.height);assert.deepEqual(s.player,pose,'Lift must not teleport horizontally');
   if(call.height===-59){samples+=s.walk(15,6);assert.equal(s.controller.actorHeight(s.actors[0]),-59);assert.equal(s.state.clayBarrier,1);}
  }
  samples+=s.walk(17,25);assert.ok(samples>500,'Route did not exercise continuous physical samples');assert.equal(s.state.clayHeight,50);assert.deepEqual(s.messages,[],'Correct route should not hit upper/lower limit messages');
 }
});
