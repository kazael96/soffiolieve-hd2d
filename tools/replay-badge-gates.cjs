/* Actual game.frame/input and native WB maze routes. DOM, audio/GPU and script
 * wall waits are isolated; the real browser proves their presentation. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),health=require('../tests/qa-input-health.js');
async function replay(speed=1,fps=60){
 const {setup,drain}=require('../tests/helpers/league-field-host.cjs'),c=await setup(),n=c.NativeStory.state,entries=[],trail=[],source=fs.readFileSync(path.join(__dirname,'../src/game.js'),'utf8');n.badges=[0,1,2,3,4,5,6,7];n.flags=n.flags.filter(f=>f<136||f>143);await drain(c,c.NativeStory.changeZone(356,15,20));
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/game-speed.js'),'utf8'),c);c.GameSpeed.set(speed);c.GameSpeed.wait=async()=>{};c.testSpeed=speed;
 let held={},clock=1,frames=0,pending;const run=c.NativeStory.vm.run;c.NativeStory.vm.run=function(bank,entry,...args){const task=run.call(this,bank,entry,...args);if(bank>=712&&bank<=726&&entry===1){entries.push([bank,entry]);pending=task;}return task;};
 c.controls={state:()=>held};c.requestAnimationFrame=()=>{};c.drawWorld=()=>{};c.drawArena=()=>{};c.canvas=c.$('world');c.t=0;c.last=clock;c.renderer.status=()=>{};
 const start=source.indexOf('function frame(now)'),end=source.indexOf('refresh();requestAnimationFrame(frame);',start);assert.ok(start>=0&&end>start);vm.runInContext(source.slice(start,end),c,{filename:'game.js:actual-gate-frame'});
 async function frame(key){held=key?{[key]:true}:{};clock+=1000/fps;c.frame(clock);frames++;await Promise.resolve();const row={zone:n.zone,x:c.player.x,y:c.player.y,height:n.fieldHeight,held:key,locked:c.NativeStory.locked};trail.push(row);if(trail.length>10)trail.shift();if(c.$('world').dataset.eventError)throw Error(c.$('world').dataset.eventError);}
 for(let zone=356;zone<=363;zone++){
  assert.equal(n.zone,zone);const goal={x:-.5,y:-7.5},raw=c.FieldActorExits.route(c.player,goal,(x,z)=>c.blocked(x,z)||c.NativeStory.occupied(x,z)),route=raw.filter((p,i)=>!raw[i-1]||!raw[i+1]||!(raw[i-1].x===p.x&&raw[i+1].x===p.x||raw[i-1].y===p.y&&raw[i+1].y===p.y));assert.ok(raw.length&&Math.hypot(raw.at(-1).x-goal.x,raw.at(-1).y-goal.y)<.01);const before=frames;
  for(const p of route){const target={x:p.x,z:p.y,height:0,nativeCell:[Math.floor(p.x+16),Math.floor(p.y+16)]};while(!health.nativeReached(c.player,target,{height:n.fieldHeight,blocked:c.blocked})){
   if(c.NativeStory.locked||n.zone!==zone)break;if(frames-before>40*fps)throw Error('Gate input stalled '+JSON.stringify({speed,fps,zone,target,trail}));const dx=p.x-c.player.x,dz=p.y-c.player.y,key=Math.abs(dx)>Math.abs(dz)?dx>0?'ArrowRight':'ArrowLeft':dz>0?'ArrowDown':'ArrowUp';await frame(health.corridorKey(c.player,p,key,c.blocked,c.NativeStory.occupied));
  }if(c.NativeStory.locked||n.zone!==zone)break;}
  held={};await drain(c,pending||Promise.resolve(),0,'play',()=>!c.NativeStory.locked);assert.ok(pending,'Native footstep did not start the badge script');pending=null;assert.equal(n.zone,zone+1);assert.ok(n.flags.includes(136+zone-356));assert.equal(c.renderer.storyCameraHeight,undefined);
 }
 assert.equal(entries.length,8);return {result:'PASS',speed,fps,frames,entries,zone:n.zone,scope:'Actual game.frame native maze input; prepared badges, script clock/DOM/GPU/audio isolated'};
}
module.exports={replay};
