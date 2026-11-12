/* Bounded search on actual WB/ribbon permissions. This is not an input replay. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const sourceHash=bytes=>crypto.createHash('sha256').update(bytes.toString('utf8').replace(/\r\n/g,'\n')).digest('hex');
async function plan(c,{maxRegions=256,gridStep=.25,footRadius=.18}={}){
 const n=c.NativeStory.state,initial=structuredClone(n.draydenPuzzle),start={x:c.player.x,z:c.player.y,height:n.fieldHeight},triggers=c.ORIGINAL_EVENTS.zones[121].triggers.filter(t=>!t.rail&&t.script>=3&&t.script<=8),goal={x:11.5,z:-12.5,height:12};
 const poseKey=pose=>pose.dragons.map(d=>d.neck+':'+d.arms.join('')).join('/'),nodeKey=p=>p.rail?[p.rail.mode,p.rail.line,Math.round(p.rail.front*16),Math.round(p.x*16),Math.round(p.z*16)].join(','):[Math.round(p.x*16),Math.round(p.z*16),Math.round(p.height*32)].join(','),memberships=new Map(),regions=[];
 const setPose=pose=>{n.draydenPuzzle=structuredClone(pose);delete n.railCurrent;},surface=(x,z,h)=>c.OpelucidChapter.surfaceAt(121,x,z,h);
 const inside=p=>p.x>=-15.5&&p.x<=47.5&&p.z>=-15.5&&p.z<=47.5;
 function step(p,dx,dz){
  let height=p.height;
  for(let i=1;i<=4;i++){
   const x=p.x+dx*i/4,z=p.z+dz*i/4,rows=[[-footRadius,-footRadius],[footRadius,footRadius]].map(([a,b])=>surface(x+a,z+b,height));
   if(rows.some(r=>!r||(r.flags&1)))return null;
   n.fieldHeight=height;if(c.NativeStory.occupied(x,z))return null;
   const row=surface(x,z,height);if(!row||(row.flags&1))return null;height=row.height;
  }
  const out={x:p.x+dx,z:p.z+dz,height};return inside(out)?out:null;
 }
 function steer(p,dx,dz){
  const probe={zone:121,fieldHeight:p.height,...(p.rail?{draydenRailWalk:structuredClone(p.rail)}:{})},hero={x:p.x,y:p.z};
  const motion=c.LeagueGymRail.create({state:()=>probe,hero:()=>hero,rails:c.NativeRails,tables:()=>c.LEAGUE_RAILS[121],floor:(x,z,h)=>c.OpelucidChapter.rawSurfaceAt(121,x,z,h),speed:()=>1,occupied:(x,z)=>{n.fieldHeight=probe.fieldHeight;return c.NativeStory.occupied(x,z);}});
  if(!motion.tryStep(dx,dz,gridStep))return step(p,dx*gridStep,dz*gridStep);
  let frames=0;while(motion.busy&&frames++<60)motion.tick(gridStep);if(frames>=60)throw Error('Unbounded ribbon alignment');
  const out={x:hero.x,z:hero.y,height:probe.fieldHeight,...(probe.draydenRailWalk?{rail:structuredClone(probe.draydenRailWalk)}:{})};return inside(out)?out:null;
 }
 function reconstruct(records,key){const result=[];while(key){const row=records.get(key);result.push(row.point);key=row.parent;}return result.reverse();}
 const isolated=new Set(['ActorPauseAll','ActorUnlockAll','RTFinishSubEvents','EVCameraInit','EVCameraUnbind','EVCameraMoveTo','EVCameraWait','EVCameraMoveToDefault','EVCameraRebind','EVCameraEnd']);
 async function press(pose,point,entry){
  const native={zone:121,vars:{},flags:[],fieldHeight:point.height,draydenPuzzle:structuredClone(pose)},hero={x:point.x,y:point.z};
  const controller=c.LeagueGymController.create({data:c.LEAGUE_GYM_DATA,state:()=>native,hero:()=>hero,save(){},sound(){},stopSound(){},visualFactory:()=>({release(){},apply(){},prepare:async()=>true})});
  const machine=new c.FieldEventVM(c.ORIGINAL_EVENTS,native,{command:async(command,args,values)=>{
   if(isolated.has(command.name))return true;
   const pending=controller.command(command.name,args,values);let ticks=0;while(controller.busy&&ticks++<200)controller.tick(1/30);if(ticks>=200)throw Error('Unbounded native task');return await pending;
  }});
  await machine.run(242,entry);setPose(native.draydenPuzzle);
  const row=surface(hero.x,hero.y,native.fieldHeight);
  if(!row||(row.flags&1))throw Error('Native button has no supported landing: '+JSON.stringify({entry,point,hero,height:native.fieldHeight,pose:native.draydenPuzzle}));
  return {pose:structuredClone(native.draydenPuzzle),point:{x:hero.x,z:hero.y,height:row.height}};
 }
 const queue=[{pose:initial,point:start,actions:[]}];let cursor=0,totalNodes=0;
 while(cursor<queue.length){
  if(regions.length>=maxRegions)throw Error('Gym route region budget exhausted');
  const current=queue[cursor++],pk=poseKey(current.pose),known=memberships.get(pk)||new Map();if(known.has(nodeKey(current.point)))continue;
  setPose(current.pose);const points=[current.point],records=new Map([[nodeKey(current.point),{point:current.point,parent:null}]]),buttons=[];let at=0;
  while(at<points.length){
   if(points.length>18000)throw Error('Gym route spatial budget exhausted');
   const point=points[at++],key=nodeKey(point);known.set(key,regions.length);
   if(Math.hypot(point.x-goal.x,point.z-goal.z)<.1&&Math.abs(point.height-goal.height)<.1)return {result:'PASS',start,goal,regions:regions.length+1,nodes:totalNodes+points.length,actions:[...current.actions,{walk:reconstruct(records,key)}],scope:'Bounded native geometry search and original button VM; camera/audio/GPU isolated, not real input or story completion'};
   const button=triggers.find(t=>Math.abs(point.height-t.y/16)<=.25&&Math.floor(point.x+16)>=t.x&&Math.floor(point.x+16)<t.x+t.width&&Math.floor(point.z+16)>=t.z&&Math.floor(point.z+16)<t.z+t.height);
   if(button){buttons.push({point,trigger:button,walk:reconstruct(records,key)});continue;}
   for(const [dx,dz]of [[0,-1],[1,0],[0,1],[-1,0]]){const next=steer(point,dx,dz);if(!next)continue;const nk=nodeKey(next);if(!records.has(nk)){next.input=[dx,dz];records.set(nk,{point:next,parent:key});points.push(next);}}
  }
  memberships.set(pk,known);regions.push({pose:pk,seed:current.point,nodes:points.length,bounds:{x:[Math.min(...points.map(p=>p.x)),Math.max(...points.map(p=>p.x))],z:[Math.min(...points.map(p=>p.z)),Math.max(...points.map(p=>p.z))],h:[Math.min(...points.map(p=>p.height)),Math.max(...points.map(p=>p.height))]},points,buttons:buttons.map(b=>b.trigger.script-1)});totalNodes+=points.length;
  for(const button of buttons){const next=await press(current.pose,button.point,button.trigger.script-1);queue.push({...next,actions:[...current.actions,{walk:button.walk,entry:button.trigger.script-1,from:current.pose,to:next.pose,landing:next.point}]});}
 }
 return {result:'FAIL',start,goal,regions,totalNodes,scope:'No continuous route under the current native geometry/task adapter; do not alter permissions to force a pass'};
}
async function main(){
 if(process.argv[2])process.env.SOFFIOLIEVE_TEST_SITE=path.resolve(process.argv[2]);const c=await require('../tests/helpers/league-field-host.cjs').setup(),report=await plan(c);
 report.sourceHashFormat='sha256:utf8-lf';report.sources=Object.fromEntries(['league-events.js','league-rails.js','league-surface-data.js','league-gym-data.js'].map(file=>[file,sourceHash(fs.readFileSync(path.resolve(__dirname,'../src',file)))]));
 const out=path.resolve(process.argv[3]||path.join(__dirname,'../../../outputs/chapter052/gym-route-search.json'));fs.writeFileSync(out,JSON.stringify(report,null,2));console.log(report.result,'regions',Array.isArray(report.regions)?report.regions.length:report.regions,'nodes',report.nodes||report.totalNodes,'actions',report.actions?.length);if(report.result!=='PASS')process.exitCode=1;
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});module.exports={plan,sourceHash};
