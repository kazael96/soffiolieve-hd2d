/* Physical continuation of the049 itineraries, through native portals/cannons. */
(function(root){
 let options={},kit=null;const tasks=new WeakMap(),directions=[[0,-1],[0,1],[-1,0],[1,0]],gymRoute=[[0,0],[1,2],[1,3],[2,2],[3,0],[4,3],[4,2],[5,1],[6,3],[7,0],[8,2]];
 const data=()=>root.ICIRRUS_EVENTS,zone=()=>options.native?.zone,records=()=>options.departures?.records;
 const global=z=>root.IcirrusChapter.globalZones.includes(z),origin=z=>global(z)?[784,752]:[16,16];
 function portal(z,index){const w=data().zones[z].warps[index],o=origin(z);if(w.rail){const p=root.NativeRails.warp(z,w);return {w,x:p.x-o[0],y:p.z-o[1],height:p.height,dx:p.out.x,dy:p.out.z};}const [dx,dy]=({1:[0,1],2:[0,-1],3:[1,0],4:[-1,0]})[w.a];return {w,x:w.x/16+(w.width-1)/2-o[0],y:w.z/16+(w.height-1)/2-o[1],height:(w.y<<16>>16)/16,dx,dy};}
 function door(z,index){const p=portal(z,index),next=portal(p.w.zone,p.w.warp);const sourceLanding=p.w.rail?root.NativeRails.landing(z,p.w):null,nextLanding=next.w.rail?root.NativeRails.landing(p.w.zone,next.w):null;return {...kit.door(z,p.x,p.y,p.dx,p.dy,{x:next.x+next.dx*.8,y:next.y+next.dy*.8},p.height),nativePortal:index,nextHeight:nextLanding?.rail.height??next.height,...(sourceLanding?{stagePoint:{x:sourceLanding.x,y:sourceLanding.z,height:sourceLanding.rail.height}}:{stagePoint:{x:p.x-p.dx,y:p.y-p.dy,height:p.height}}),nextEntry:nextLanding?{x:nextLanding.x,y:nextLanding.z}:{x:next.x-next.dx,y:next.y-next.dy}};}
 function tower(up){const rows=up?[[337,0],[338,1],[339,1],[340,1],[341,1]]:[[342,0],[341,0],[340,0],[339,0],[338,0]];return rows.map(([z,i])=>door(z,i));}
 function north(){const a=root.ICIRRUS_SCENES[337].permissionGrids,b=root.ICIRRUS_SCENES[198].permissionGrids,min=Math.min(...a.map(g=>g.z))-16;let best=null;
  for(let x=-710.5;x< -620;x++){const top={x,y:min+.5},bottom={x,y:min-.5};if(blocked(337,x,top.y)===false&&blocked(198,x,bottom.y)===false&&(!best||Math.abs(x+641.5)<Math.abs(best.x+641.5)))best=top;}
  if(!best)throw Error('Corridoio nativo Percorso7/Monte Vite non disponibile');return kit.edge(337,best.x,best.y,0,-1);
 }
 function mountain(){const path=root.FieldSeason?.current()===3?[[200,1],[199,14],[201,7]]:[[200,1],[199,1],[200,4],[199,4],[200,6],[201,0],[199,6],[201,2],[199,8],[201,4],[202,1],[199,10]];return [door(198,0),...path.map(([z,i])=>door(z,i))];}
 function cannonLegs(){return gymRoute.map(([index,direction])=>{const a=root.ICIRRUS_GYM_DATA.anchors[index],[dx,dy]=directions[direction];return {zone:108,kind:'cannon',anchor:{x:a[0]-15.5-dx*2,y:a[2]-15.5-dy*2},cannon:index,cannonDirection:direction,height:a[1]};});}
 function extend(value){kit=value;const old={...kit.itineraries};
  kit.itineraries['skyla-celestial-tower']=()=>[...old['skyla-celestial-tower'](),...tower(true),kit.arrival(342,.5,-1.5,342,0,7)];
  kit.itineraries['komor-next-journey']=()=>[...old['komor-next-journey'](),north(),kit.arrival(198,-639.5,-536.5,198,2)];
  kit.itineraries['cedric-next-research']=()=>[...old['cedric-next-research'](),north(),...mountain(),door(202,3),kit.arrival(113,-608.5,-543.5,113,2,-.25)];
  // The last Tower descent emerges at the Route7 door; continue south on foot.
  kit.itineraries['skyla-gym-return']=()=>[...tower(false),kit.edge(337,-665.5,-464.5,0,1),door(107,2),...cannonLegs(),kit.arrival(108,-.5,-10.5,108,1,10)];
  kit.itineraries['komor-twist-exit']=()=>[...mountain(),kit.arrival(202,38.5,-1.5,202,2)];
  kit.itineraries['komor-icirrus-wait']=()=>[door(202,3),kit.arrival(113,-611.5,-580.5,113,0,3)];
  kit.itineraries['nardo-after-surf']=()=>[door(198,0)];
  kit.itineraries['n-dragonspiral-approach']=()=>[kit.edge(107,-665.5,-463.5,0,-1),north(),...mountain(),door(202,3),kit.arrival(113,-604.5,-591.5,113,253)];
  kit.itineraries['cedric-dragonspiral-approach']=()=>[kit.arrival(113,-603.5,-591.5,113,252)];
  root.OpelucidContinuity?.extend({...kit,mountain,icirrusDoor:door});
 }
 function blocked(z,x,y){const extra=root.OpelucidContinuity?.blocked(z,x,y);if(extra!==null&&extra!==undefined)return extra;if(!root.IcirrusChapter?.zones.includes(z))return null;
  if(root.NativeRails?.has(z)&&root.NativeRails.locate(z,x,y))return false;
  return root.IcirrusChapter.blockedAt(z,x,y);
 }
 function path(from,to,z,blocked){
  const extra=root.OpelucidContinuity?.path(from,to,z);if(extra)return extra;
  if(!root.IcirrusChapter?.zones.includes(z))return null;const spatial=root.IcirrusPaths?.route(z,from,to);if(spatial)return spatial;
  const prefix=from.incomingPortal?[{...from.incomingPortal}]:[],start=prefix.at(-1)||from,candidates=[];
  const gx=Math.round(to.x-.5)+.5,gy=Math.round(to.y-.5)+.5;
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const p={x:gx+dx,y:gy+dy};if(blocked(p.x,p.y)||Math.hypot(p.x-to.x,p.y-to.y)>1.6)continue;let clear=true;for(let i=0;i<=10;i++)if(blocked(p.x+(to.x-p.x)*i/10,p.y+(to.y-p.y)*i/10)){clear=false;break;}if(clear)candidates.push(p);}
  candidates.sort((a,b)=>Math.hypot(a.x-to.x,a.y-to.y)-Math.hypot(b.x-to.x,b.y-to.y));
  for(const goal of candidates){const route=root.FieldActorExits.route(start,goal,blocked),last=route.at(-1)||start;if(Math.hypot(last.x-goal.x,last.y-goal.y)<.01)return [...prefix,...route,{...to}];}
  return [...prefix,...root.FieldActorExits.route(start,to,blocked)];
 }
 function destination(actor,z){const extra=root.OpelucidContinuity?.destination(actor,z);if(extra)return extra;if(z===107&&actor.name==='N')return 'n-dragonspiral-approach';if(z===113&&actor.name==='Gasparago')return 'cedric-dragonspiral-approach';if(z===342&&actor.name==='Anemone')return 'skyla-gym-return';if(z===198&&actor.name==='Komor')return 'komor-twist-exit';if(z===198&&actor.name==='Nardo')return 'nardo-after-surf';if(z===202&&actor.name==='Komor')return 'komor-icirrus-wait';return null;}
 function arrived(r){root.OpelucidContinuity?.arrived(r);const name=r.plan.destination;if(!['skyla-celestial-tower','skyla-gym-return','cedric-next-research','komor-next-journey','komor-twist-exit','komor-icirrus-wait'].includes(name))return;const flag=name==='skyla-celestial-tower'?676:name==='cedric-next-research'?579:name==='komor-twist-exit'?678:null;if(flag!==null&&options.native.flags.includes(flag))options.native.flags=options.native.flags.filter(f=>f!==flag);Promise.resolve().then(()=>root.NativeStory?.syncActors());}
 function prepareEvent(z,script){if(root.OpelucidContinuity?.prepareEvent(z,script)===false)return false;if(z===113&&script===1)return !options.native.flags.includes(579)&&!root.MistraltonContinuity.waitingFor(z,['Gasparago']);if(z===198&&script===2)return !root.MistraltonContinuity.waitingFor(z,['Komor']);if(z===202&&script===1)return !root.MistraltonContinuity.waitingFor(z,['Komor']);return true;}
 function cannon(r){const previous=tasks.get(r);if(previous?.plan===r.plan)return previous.task;let task;const state=new Proxy({zone:108},{get:(target,key)=>key==='cannonRide'?r.plan.cannonRide:key==='cannonHeight'?r.actor.height:target[key],set:(target,key,value)=>{if(key==='cannonRide')r.plan.cannonRide=value;else if(key==='cannonHeight')r.actor.height=value;else target[key]=value;return true;},deleteProperty:(target,key)=>{if(key==='cannonRide')delete r.plan.cannonRide;else delete target[key];return true;}});
  task=root.IcirrusCannonTask.create({readState:()=>state,hero:()=>r.actor,sound:id=>{if(zone()===108)root.AudioEngine?.playSound(id);},save:()=>{},camera:()=>{}});tasks.set(r,{plan:r.plan,task});if(r.plan.cannonRide)task.resume();else task.start(r.plan.cannonDirection);return task;
 }
 function tick(dt){root.OpelucidContinuity?.tick(dt);for(const r of records()?.values()||[]){
  if(root.IcirrusChapter.zones.includes(r.actor.fieldZone)&&r.plan.kind!=='cannon'){const target=r.plan.points[r.index],previous=r.index?r.plan.points[r.index-1]:r.plan.startPose;let wanted=r.actor.height;if(target?.height!==undefined&&previous?.height!==undefined){const dx=target.x-previous.x,dy=target.y-previous.y,length=dx*dx+dy*dy,f=length?Math.max(0,Math.min(1,((r.actor.x-previous.x)*dx+(r.actor.y-previous.y)*dy)/length)):1;wanted=previous.height+(target.height-previous.height)*f;}const rail=root.NativeRails?.has(r.actor.fieldZone)&&root.NativeRails.locate(r.actor.fieldZone,r.actor.x,r.actor.y,{height:wanted}),surface=root.IcirrusChapter.surfaceAt(r.actor.fieldZone,r.actor.x,r.actor.y,wanted);r.actor.height=rail&&(!surface||Math.abs(rail.height-wanted)<Math.abs(surface.height-wanted))?rail.height:surface?.height??wanted;}
  if(r.plan.nextChapter&&kit.itineraries[r.plan.destination]?.().length>r.plan.leg+1){const next=root.MistraltonContinuity.nextLeg(r);if(next&&!next.deferred)Object.assign(r,next);}
  if(r.plan.kind!=='cannon'||r.stage!=='hold')continue;const task=cannon(r);task.tick(dt);r.actor.cannonHidden=task.hidden;
  if(!task.busy){r.plan.cannonComplete=true;const next=root.MistraltonContinuity.nextLeg(r);if(next&&!next.deferred){Object.assign(r,next);delete r.actor.cannonHidden;}}
 }}
 function enterZone(z,{covered=false}={}){
  const n=options.native;if(!n||z===202||!covered||!n.vars[16571]||n.icirrusKomorDeparture)return;
  const current=records()?.get('Komor');if(current?.plan.destination==='komor-icirrus-wait'){n.icirrusKomorDeparture=true;return;}
  const actor=n.actors?.[202]?.find(a=>a.name==='Komor'&&a.uid===2&&!a.hidden);if(!actor||current&&current.stage!=='resident')return;
  if(current)records().delete('Komor');if(options.departures.depart({...actor},202)){const r=records().get('Komor');r.plan.transferAuthorized=true;n.icirrusKomorDeparture=true;if(!n.flags.includes(678))n.flags.push(678);}
 }
 function restoreRecord(r){
  if(r.plan.kind!=='cannon'||!r.plan.cannonRide){if(r.plan.nativeTravelVersion===1&&kit.itineraries[r.plan.destination]&&r.plan.points.every(p=>p.height===undefined||Number.isFinite(p.height)&&Math.abs(p.height)<512))return r;return undefined;}
  const definition=kit.itineraries[r.plan.destination]?.()[r.plan.leg];if(definition?.kind!=='cannon'||definition.cannon!==r.plan.cannon||definition.cannonDirection!==r.plan.cannonDirection)return null;
  const shadow={zone:108,cannonRide:structuredClone(r.plan.cannonRide),cannonHeight:r.actor.height},body={...r.actor},task=root.IcirrusCannonTask.create({readState:()=>shadow,hero:()=>body});
  const column=root.ICIRRUS_GYM_DATA.nativeDirectionToColumn[definition.cannonDirection],valid=shadow.cannonRide.index===definition.cannon&&shadow.cannonRide.column===column&&task.resume();
  if(!valid){delete r.plan.cannonRide;delete r.plan.entryCorridor;Object.assign(r.actor,{x:definition.anchor.x,y:definition.anchor.y,height:definition.height,cannonHidden:false});return {...r,index:0,stage:'hold'};}
  r.actor.cannonHidden=['windup','flight'].includes(r.plan.cannonRide.phase)&&!r.plan.cannonRide.played.includes(1686);return {...r,stage:'hold'};
 }
 root.IcirrusContinuity={enterZone,replaceExitMotion:(actor,z,address)=>root.OpelucidContinuity?.replaceExitMotion(actor,z,address)||z===342&&actor.name==='Anemone'&&address===616,extend,blocked,path,destination,arrived,prepareEvent,tick,restoreRecord,configure:v=>{options=v;root.OpelucidContinuity?.configure(v);},cannonRide:index=>[...records()?.values()||[]].find(r=>r.plan.cannon===index&&r.plan.cannonRide)?.plan.cannonRide||null};
})(typeof window==='undefined'?globalThis:window);
