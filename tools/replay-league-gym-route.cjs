/* Actual game.frame + OriginalStory, with isolated DOM/GPU/audio and QA clock.
 * A diagnostic replay, not a browser or battle certification. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
async function replay(reference,speed=1,{fixedCadence=false,sparse=false,frameSeconds=1/60}={}){
 const c=await require('../tests/helpers/league-field-host.cjs').setup(),n=c.NativeStory.state,entries=[],trail=[];
 const original=c.NativeStory.vm.run.bind(c.NativeStory.vm);c.NativeStory.vm.run=(bank,entry)=>{entries.push({bank,entry});return original(bank,entry);};
 const src=path.resolve(__dirname,'../src'),game=fs.readFileSync(path.join(src,'game.js'),'utf8'),start=game.indexOf('function frame(now)'),end=game.indexOf('refresh();requestAnimationFrame(frame);',start);
 assert.ok(start>=0&&end>start);vm.runInContext(fs.readFileSync(path.join(src,'game-speed.js'),'utf8'),c);c.GameSpeed.set(speed);c.GameSpeed.wait=async()=>{}; // Script delays isolated; physical/camera task ticks remain real.
 let held={},clock=1,frames=0;c.controls={state:()=>held};c.requestAnimationFrame=()=>{};c.drawWorld=()=>{};c.drawArena=()=>{};c.canvas=c.$('world');c.t=0;c.last=clock;c.renderer.status=()=>{};
 vm.runInContext(game.slice(start,end),c,{filename:'game.js:actual-frame'});
 async function frame(input,dt=1/60){held=input;clock+=dt*1000;c.frame(clock);frames++;await Promise.resolve();c.tickAudio?.();if(c.renderer.loadingError)throw c.renderer.loadingError;if(c.$('world').dataset.eventError)throw Error(c.$('world').dataset.eventError);trail.push({x:c.player.x,z:c.player.y,height:n.fieldHeight,rail:structuredClone(n.draydenRailWalk),locked:c.NativeStory.locked});if(trail.length>12)trail.shift();}
 const key=([dx,dz])=>dx?dx>0?'ArrowRight':'ArrowLeft':dz>0?'ArrowDown':'ArrowUp';
 const health=require('../tests/qa-input-health.js'),tolerance=fixedCadence?.12:.07;
 for(const [phase,action]of reference.actions.entries()){
  const before=entries.length;let event=false;
  let previous=0;const points=sparse?action.walk.flatMap((p,i,rows)=>{if(i!==0&&i!==rows.length-1&&JSON.stringify(rows[i+1]?.input)===JSON.stringify(p.input))return[];const out=health.nativeWaypoint({...p,pathDistance:(i-previous)*.25},{tables:c.LEAGUE_RAILS[121],position:(line,front)=>c.NativeRails.position(121,line,front),floor:(x,z,h)=>c.OpelucidChapter.rawSurfaceAt(121,x,z,h)});previous=i;return[out];}):action.walk;
  for(let index=1;index<points.length;index++){
   const target=points[index],budget=160+Math.ceil((target.pathDistance||0)*120/(3.5*speed));let attempts=0;
   while(!health.nativeReached(c.player,target,{height:n.fieldHeight,blocked:c.blocked,current:n.draydenRailWalk,tables:c.LEAGUE_RAILS[121],tolerance})||c.LeagueGym.busy){
    if(action.entry!==undefined&&entries.length>before){event=true;break;}
    if(++attempts>budget)throw Error('Navigation stalled '+JSON.stringify({phase,index,target,trail}));
    let input=target.input;
    const current=n.draydenRailWalk;
    if((!c.LeagueGym.rail.owned&&!target.rail)||current?.mode==='exit'||!current&&target.rail?.mode==='exit'){const dx=target.x-c.player.x,dz=target.z-c.player.y;input=Math.abs(dx)>Math.abs(dz)?[Math.sign(dx),0]:[0,Math.sign(dz)];}
    else if(current?.mode==='walk'&&target.rail?.mode==='walk'&&current.line===target.rail.line){const d=c.LEAGUE_RAILS[121].lines[current.line].direction,forward={1:[0,-1],2:[1,0],3:[0,1],4:[-1,0]}[d],sign=Math.sign(target.rail.front-current.front);if(sign)input=forward.map(v=>v*sign);}
    const distance=Math.hypot(c.player.x-target.x,c.player.y-target.z),dt=fixedCadence?frameSeconds:Math.min(1/60,Math.max(.0002,distance/3.5/speed));let wanted=health.railKey(c.player,{x:target.x,y:target.z,rail:target.rail},key(input),current,c.LEAGUE_RAILS[121]);if(!current||current.mode==='exit')wanted=health.corridorKey(c.player,{x:target.x,y:target.z},wanted,c.blocked,c.NativeStory.occupied);
    await frame(c.NativeStory.locked?{}:{[wanted]:true},dt);
   }
   if(event)break;
  }
  if(action.entry!==undefined){
   let ticks=0;while((entries.length===before||c.NativeStory.locked||c.NativeStory.vm.running)&&ticks++<3000)await frame({});
   assert.ok(ticks<3000,'Native event did not release input');assert.deepEqual(entries[before],{bank:242,entry:action.entry});
   assert.ok(Math.hypot(c.player.x-action.landing.x,c.player.y-action.landing.z)<.6,'Native landing drift');
  }
 }
 assert.equal(Math.floor(c.player.x+16),Math.floor(reference.goal.x+16));assert.equal(Math.floor(c.player.y+16),Math.floor(reference.goal.z+16));assert.ok(Math.abs(n.fieldHeight-reference.goal.height)<.01);assert.equal(c.facing,0);const boss=c.NativeStory.visualActors().find(a=>a.uid===4&&a.model===180);assert.ok(boss);assert.equal(Math.floor(boss.x+16),Math.floor(c.player.x+16));assert.equal(Math.floor(boss.y+16),Math.floor(c.player.y+16)-1);
 return {result:'PASS',speed,frames,entries,fixedCadence,sparse,frameSeconds,hero:{...c.player},height:n.fieldHeight,scope:'Actual game.frame and OriginalStory; prepared victories; DOM/GPU/audio output and script wall waits isolated, not browser or battles'};
}
async function main(){process.env.SOFFIOLIEVE_TEST_SITE=path.resolve(process.argv[2]);const reference=JSON.parse(fs.readFileSync(process.argv[3],'utf8')),out=process.argv[4];let report;try{report=await replay(reference,Number(process.argv[5]||1));}catch(e){report={result:'FAIL',error:String(e.stack||e)};process.exitCode=1;}fs.writeFileSync(out,JSON.stringify(report,null,2));console.log(report.result,report.error||report.frames);}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});module.exports={replay};
