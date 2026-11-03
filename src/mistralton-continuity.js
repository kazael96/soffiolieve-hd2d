/* Persistent physical itineraries across the chapter049 doors and joined fields. */
(function(root){
 let options={};const entryTrips=new WeakMap(),version=2,pairs=[[96,191],[331,194]],point=(x,y)=>({x,y});
 const sameField=(a,b)=>a===b||pairs.some(p=>p.includes(a)&&p.includes(b));
 const door=(zone,x,y,dx,dy,next=null,height=0)=>({zone,kind:'door',anchor:point(x,y),dx,dy,next,height});
 const edge=(zone,x,y,dx,dy,next=null)=>({zone,kind:'path',anchor:point(x,y),dx,dy,next,height:0});
 const arrival=(zone,x,y,destinationZone,targetUid,height=0)=>({zone,kind:'arrival',anchor:point(x,y),destinationZone,targetUid,height});
 const warehouseExit=()=>[door(193,-12.5,1.5,0,1,point(-10.5,-7.5)),door(192,-8.5,15.5,0,1,point(-619.5,-278.5))];
 const westbound=()=>[edge(96,-623.5,-346.5,-1,0,point(-624.5,-346.5)),door(331,-676.5,-412.5,0,-1,point(-8.5,43.5),1)];
 const caveExit=()=>door(195,59.5,-10.5,0,-1,point(-680.5,-441.5));
 const route7=(x=-665.5)=>edge(107,x,-463.5,0,-1,null);
 const itineraries={
  'cold-storage-front':()=>[arrival(96,-612.5,-285.5,191,0)],
  'cold-storage-interior':()=>[door(191,-619.5,-279.5,0,-1,point(-8.5,16.5)),arrival(192,-8.5,15.5,192,0)],
  'cold-storage-upper':()=>[arrival(192,-2.5,-10.5,192,1)],
  'cold-storage-backroom':()=>[door(192,-10.5,-8.5,0,-1,point(-12.5,2.5)),arrival(193,-12.5,1.5,193,3)],
  'clay-gym-square-komor':()=>[...warehouseExit(),arrival(191,-576.5,-346.5,96,11)],
  'clay-gym-square-rafan':()=>[...warehouseExit(),arrival(191,-571.5,-349.5,96,9)],
  'cold-storage-escort':()=>[door(193,-12.5,1.5,0,1)],
  'driftveil-gym':()=>[door(96,-571.5,-351.5,0,-1)],
  'plasma-route6-retreat':()=>[edge(96,-623.5,-346.5,-1,0)],
  'rafan-gym-return':()=>[edge(194,-624.5,-346.5,1,0,point(-623.5,-346.5)),door(96,-571.5,-351.5,0,-1)],
  'belle-chargestone':()=>[...westbound(),arrival(195,-7.5,29.5,195,0)],
  'komor-next-journey':()=>[...westbound(),caveExit(),route7(-664.5)],
  'belle-research-handoff':()=>[caveExit(),arrival(107,-682.5,-442.5,107,251)],
  'aralia-research-handoff':()=>[caveExit(),arrival(107,-683.5,-441.5,107,250)],
  'n-mistralton-airport':()=>[caveExit(),arrival(107,-707.5,-482.5,107,13)],
  'skyla-celestial-tower':()=>[route7()],
  'cedric-next-research':()=>[route7(-666.5)]
 };
 const nextEvents={
  'komor-next-journey':{zone:198,uid:2,label:'Komor prima del Monte Vite'},
  'skyla-celestial-tower':{zone:342,uid:0,label:'Anemone alla Torre Cielo'},
  'cedric-next-research':{zone:113,uid:2,label:'Rutilo a Mistralopoli'}
 };
 function configure(config){options={...options,...config};return api;}
 const activeZone=()=>options.native?.zone??root.NativeStory?.state?.zone;
 function blockedFor(zone,fallback=()=>false){return (x,y)=>{const blocked=options.blockedAt||root.MistraltonChapter?.blockedAt;if(blocked)return blocked(zone,x,y);return fallback(x,y);};}
 function walk(from,to,zone,fallback){
  const blocked=blockedFor(zone,fallback),lead={x:from.x,y:from.y},points=[];
  // Keep a saved fractional step on its current axis before re-running A*.
  if(Math.abs(from.x-Math.round(from.x-.5)-.5)>1e-6){lead.x=(from.direction===2?Math.floor(from.x-.5):Math.ceil(from.x-.5))+.5;}
  else if(Math.abs(from.y-Math.round(from.y-.5)-.5)>1e-6){lead.y=(from.direction===0?Math.floor(from.y-.5):Math.ceil(from.y-.5))+.5;}
  if(Math.hypot(lead.x-from.x,lead.y-from.y)>1e-6&&!blocked(lead.x,lead.y))points.push(lead);else Object.assign(lead,{x:from.x,y:from.y});
  return points.concat(root.FieldActorExits.route(lead,to,blocked));
 }
 function build(destination,leg,actor,fallback){const d=itineraries[destination]?.()[leg];if(!d)return null;
  const goal=d.kind==='door'&&Math.hypot(actor.x-d.anchor.x,actor.y-d.anchor.y)>.01?point(d.anchor.x-d.dx,d.anchor.y-d.dy):d.anchor,points=walk(actor,goal,d.zone,fallback),last=points.at(-1)||actor;
  // A partial route is a recoverable path error; never append a wall-crossing
  // final segment and pretend that the actor has reached a blocked doorway.
  if(Math.hypot(last.x-goal.x,last.y-goal.y)>.01)throw Error('Itinerario non percorribile: '+actor.name+' → '+destination+' ('+leg+')');
  if(d.kind==='door')points.push({...d.anchor});if(d.kind!=='arrival')points.push(point(d.anchor.x+d.dx*2.8,d.anchor.y+d.dy*2.8));
  return {kind:d.kind,points,anchor:{...d.anchor},clip:d.kind==='door'?[-d.dx,0,-d.dy,d.dx*d.anchor.x+d.dy*d.anchor.y+(d.dy<0?1.3:0)]:null,background:true,destination,itineraryVersion:version,chapter049:true,leg,...(d.kind==='arrival'?{destinationZone:d.destinationZone,targetUid:d.targetUid}:{})};
 }
 function planExit(actor,zone,blocked){let destination;
  if(zone===96&&actor.name==='Komor')destination=[11].includes(actor.uid)?'komor-next-journey':'cold-storage-front';
  else if(zone===96&&actor.name==='Rafan')destination='driftveil-gym';
  else if(zone===96&&actor.name==='Belle')destination='belle-chargestone';
  else if(zone===96&&(['Ghecis'].includes(actor.name)||[98,99,100,192].includes(actor.model)))destination='plasma-route6-retreat';
  else if(zone===191&&actor.name==='Komor')destination='cold-storage-interior';
  else if(zone===192&&actor.name==='Komor')destination=actor.uid===0?'cold-storage-upper':'cold-storage-backroom';
  else if(zone===193)destination=actor.name==='Komor'?'clay-gym-square-komor':actor.name==='Rafan'?'clay-gym-square-rafan':'cold-storage-escort';
  else if(zone===194&&actor.name==='Rafan')destination='rafan-gym-return';
  else if(zone===195&&actor.name==='Belle')destination='belle-research-handoff';
  else if(zone===195&&actor.name==='Aralia')destination='aralia-research-handoff';
  else if(zone===195&&actor.name==='N')destination='n-mistralton-airport';
  else if(zone===107&&actor.name==='Anemone')destination='skyla-celestial-tower';
  else if(zone===107&&actor.name==='Rutilo')destination='cedric-next-research';
  return destination?build(destination,0,actor,blocked):null;
 }
 function known(record){return !!record?.plan?.chapter049&&record.plan.itineraryVersion===version&&Object.hasOwn(itineraries,record.plan.destination)&&Number.isInteger(record.plan.leg)&&record.plan.leg>=0&&record.plan.leg<itineraries[record.plan.destination]().length;}
 function shouldTick(record){return !known(record)||sameField(record.zone,activeZone());}
 function canRetire(record){return known(record)?record.stage==='hold'&&record.index>=record.plan.points.length:undefined;}
 function nextLeg(record){if(!known(record))return null;const destination=record.plan.destination,index=record.plan.leg,all=itineraries[destination](),old=all[index],next=all[index+1];
  if(!next){const event=nextEvents[destination];if(!event)return null;
   const actor={...record.actor,fieldZone:337,exitProbe:false,script:2000};delete actor.exitClip;
   return {actor,zone:337,plan:{...record.plan,kind:'resident',points:[],clip:null,nextChapter:true,nextEvent:event,transferAuthorized:true},stage:'resident',index:0,opened:false,zero:0,sampleSequence:-1,target:null};
  }
  const start=old.kind==='path'?point(record.actor.x,record.actor.y):old.next;
  if([...options.departures?.records.values()||[]].some(r=>r!==record&&sameField(r.zone,next.zone)&&Math.hypot(r.actor.x-start.x,r.actor.y-start.y)<.7))return {deferred:true};
  const actor={...record.actor,...start,fieldZone:next.zone,height:old.kind==='path'?record.actor.height:next.height||0,exitProbe:true,script:2000};delete actor.exitClip;delete actor.noShadow;
  const plan=build(destination,index+1,actor);plan.transferAuthorized=true;
  return {actor,zone:next.zone,plan,index:0,stage:'walk',age:0,travel:0,opened:false,zero:0,sampleSequence:-1,target:null,unverified:0};
 }
 function restoreRecord(record,zone,progress={}){
  if(record.actor.name==='Komor'&&record.plan.destination==='cold-storage-front'&&record.plan.itineraryVersion!==version){
   const phase=progress.vars?.[16527]??options.native?.vars?.[16527]??1,destination=phase<=1?'cold-storage-front':phase===2?'clay-gym-square-komor':'komor-next-journey',leg=phase===2?2:0;
   record={...record,zone:phase===2?191:96,plan:build(destination,leg,record.actor),stage:'walk',index:0,opened:false,travel:0};
  }
  if(!record.plan.chapter049)return undefined;
  if(!known(record))return null;
  record.actor.script=2000;
  if(record.plan.nextChapter){const event=nextEvents[record.plan.destination];if(!event)return null;return {...record,zone:337,plan:{...record.plan,kind:'resident',points:[],clip:null,nextEvent:event,nextChapter:true},stage:'resident',index:0};}
  const leg=itineraries[record.plan.destination]()[record.plan.leg],progressAlong=leg.kind!=='arrival'?((record.actor.x-leg.anchor.x)*leg.dx+(record.actor.y-leg.anchor.y)*leg.dy):-1;
  if(leg.kind!=='arrival'&&progressAlong>=-.001&&(leg.kind==='path'||record.opened||record.stage==='hold'||record.plan.portalEntered===true)){
   const plan=build(record.plan.destination,record.plan.leg,{...record.actor,...leg.anchor});plan.transferAuthorized=record.plan.transferAuthorized===true;plan.portalEntered=leg.kind==='door';
   const end=point(leg.anchor.x+leg.dx*2.8,leg.anchor.y+leg.dy*2.8),done=Math.hypot(record.actor.x-end.x,record.actor.y-end.y)<.001;plan.points=[end];
   return {...record,plan,index:done?1:0,stage:done?'hold':'walk',opened:record.opened===true||plan.portalEntered,travel:0};
  }
  const plan=build(record.plan.destination,record.plan.leg,record.actor);plan.transferAuthorized=record.plan.transferAuthorized===true;
  const arrived=plan.kind==='arrival'&&Math.hypot(record.actor.x-plan.anchor.x,record.actor.y-plan.anchor.y)<.001;
  return {...record,plan,index:0,stage:arrived?'resident':'walk',opened:false,travel:0};
 }
 function migrate(){const controller=options.departures;if(!controller)return false;for(const [key,r]of controller.records){if(r.plan.chapter049)continue;const restored=restoreRecord(r,activeZone(),options.native);if(restored===null){controller.records.delete(key);continue;}if(restored){Object.assign(r,restored,{zero:0,sampleSequence:-1});r.actor.exitProbe=r.stage!=='resident';delete r.actor.exitClip;}}return true;}
 function carry(record){return known(record)||record?.actor?.name==='Komor'&&record?.plan?.destination==='cold-storage-front';}
 function canRestore(record){return known(record);}
 function coveredTransition(){for(const r of options.departures?.records.values()||[])if(known(r))r.plan.transferAuthorized=true;}
 function notifyArrival(record){if(record.stage==='resident'&&!record.arrivalNotified){record.arrivalNotified=true;options.recheck?.();}}
 function enterZone(zone=activeZone(),{covered=false}={}){const phase=options.native?.vars?.[16523]??0,source=zone===192&&phase===0?191:zone===193&&phase===2?192:null;if(source===null||!options.departures||!options.native)return false;
  const flag=zone===192?544:805;if(Array.isArray(options.native?.flags)&&!options.native.flags.includes(flag))return false;
  let started=entryTrips.get(options.native);if(!started){started=new Set();entryTrips.set(options.native,started);}const trip=zone+':'+phase;if(started.has(trip))return false;
  const current=options.departures.records.get('Komor');if(current&&!(current.stage==='resident'&&current.actor.fieldZone===source))return false;
  const uid=source===191?0:1,candidate=current?.actor||(options.native?.actors?.[source]||[]).find(n=>n.name==='Komor'&&n.uid===uid&&!n.hidden);if(!candidate)return false;
  const result=options.departures.depart({...candidate,fieldZone:source},source);if(result){started.add(trip);if(covered||options.isCovered?.()===true)options.departures.records.get('Komor').plan.transferAuthorized=true;}return result;
 }
 function tick(dt){dt=Math.min(.1,Math.max(0,dt));const controller=options.departures;if(!controller)return;enterZone();
  for(const r of controller.records.values()){
   if(!known(r))continue;r.actor.script=2000;if(r.stage==='resident'){notifyArrival(r);continue;}
   if(shouldTick(r)||!r.plan.transferAuthorized)continue;
   // The source field was explicitly covered, or this leg started after a real
   // occlusion proof. Advance a physical route off-map, never a fake GPU sample.
   if(r.stage==='walk'){const p=r.plan.points[r.index];if(p){const dx=p.x-r.actor.x,dy=p.y-r.actor.y,d=Math.hypot(dx,dy),step=Math.min(d,3.75*dt),next=point(r.actor.x+(d?dx/d*step:0),r.actor.y+(d?dy/d*step:0));if(d&&obstructed(r,next))continue;if(d){Object.assign(r.actor,next);r.actor.direction=Math.abs(dx)>Math.abs(dy)?dx>0?3:2:dy>0?1:0;r.travel+=step;}if(d<=step)r.index++;}else{r.stage=r.plan.kind==='arrival'?'resident':'hold';if(r.stage==='resident'){Object.assign(r.actor,{fieldZone:r.plan.destinationZone,uid:r.plan.targetUid,exitProbe:false,script:2000});notifyArrival(r);}}}
   if(r.stage==='hold'){const next=nextLeg(r);if(next?.deferred)continue;if(next){controller.finishPortal(r);Object.assign(r,next);}else{controller.finishPortal(r);controller.records.delete(r.key);r.resolve?.();}}
  }
 }
 function waitingFor(zone,names){return names.some(name=>{const r=options.departures?.records.get(name);return r&&(!sameField(r.plan.destinationZone??r.zone,zone)||r.stage!=='resident');});}
 function obstructed(record,p){if(!known(record))return false;return [...options.departures?.records.values()||[]].some(other=>other!==record&&sameField(other.zone,record.zone)&&Math.abs(other.actor.x-p.x)<.55&&Math.abs(other.actor.y-p.y)<.55);}
 function introduced(actor,actors){if(![96,191,192,193,194,195,107].includes(actor.fieldZone)||!['Komor','Rafan','Belle','Aralia','Anemone','Rutilo','N'].includes(actor.name))return actor;
  const record=options.departures?.records.get(actor.name);
  if(known(record)||!record&&actors.some(old=>old!==actor&&!old.hidden&&!old.continuityPending&&old.name===actor.name&&sameField(old.fieldZone,actor.fieldZone)))actor.continuityPending=true;
  return actor;
 }
 function visibleActors(actors){return actors.filter(actor=>{if(actor.continuitySuperseded)return false;const record=options.departures?.records.get(actor.name);
  // A future logical role can be populated by changeZone without ActorAdd.
  // Keep it out of Controller.visible until the physical itinerary arrives:
  // that controller's ordinary rejoin policy would otherwise abandon the
  // current door/field and chase the future role through a different grid.
  if(known(record)){
   if(record.stage==='rejoin'){record.stage='walk';record.target=null;}
   if(!(record.stage==='resident'&&record.plan.kind==='arrival'&&record.plan.destinationZone===actor.fieldZone&&record.plan.targetUid===actor.uid&&Math.hypot(record.actor.x-actor.x,record.actor.y-actor.y)<.001)){actor.continuityPending=true;return false;}
  }
  if(!actor.continuityPending)return true;
  if(record?.stage==='resident'&&record.plan.kind==='arrival'&&record.plan.destinationZone===actor.fieldZone&&record.plan.targetUid===actor.uid&&Math.hypot(record.actor.x-actor.x,record.actor.y-actor.y)<.001){delete actor.continuityPending;return true;}
  if(!record&&!actors.some(other=>other!==actor&&!other.hidden&&!other.continuityPending&&other.name===actor.name&&sameField(other.fieldZone,actor.fieldZone))){delete actor.continuityPending;return true;}
  return false;
 });}
 function prepareEvent(zone,scriptId,actors=[]){
  // Script384 adds role1 before deleting role0, without moving role0 on DS.
  // Stage that walk before ActorPauseAll, so an early player retains control.
  if(zone===192&&scriptId===2&&(options.native?.vars?.[16523]??0)===1){const old=actors.find(n=>n.name==='Komor'&&n.uid===0&&n.fieldZone===192&&!n.hidden),r=options.departures?.records.get('Komor');
   if(old){if(!r||r.stage==='resident'&&r.plan.destination!=='cold-storage-upper'){delete old.continuitySuperseded;options.departures.depart(old,192);}old.continuitySuperseded=true;}
   return !waitingFor(192,['Komor']);
  }
  if(zone===191&&scriptId===1)return !waitingFor(191,['Komor']);
  if(zone===96&&(options.native?.vars?.[16527]??0)===2)return !waitingFor(96,['Komor','Rafan']);
  if(zone===195&&(options.native?.vars?.[16539]??0)===1)return !waitingFor(195,['Belle']);
  return true;
 }
 const logicalOnlyDelete=actor=>actor?.continuitySuperseded===true;
 const escortMotions=new Set([2484,2492,2500,2508,2520,2536,2572,2580,2592,2604,2616,2624,2632,2680,2704]);
 function startExitMotion(actor,zone,movementAddress){const replaces=zone===193&&escortMotions.has(movementAddress)||zone===195&&(actor.name==='Aralia'&&movementAddress===3148||actor.name==='Belle'&&movementAddress===3132||actor.name==='N'&&movementAddress===3172)||zone===107&&actor.name==='Anemone'&&movementAddress===3240;
  if(!replaces||actor.uid===255)return false;if(!actor.continuitySuperseded){if(!options.departures?.depart(actor,zone))return false;actor.continuitySuperseded=true;actor.hidden=true;}return true;
 }
 const occupies=record=>!known(record)||sameField(record.actor.fieldZone,activeZone());
 const api={configure,planExit,migrate,tick,enterZone,carry,canRestore,restoreRecord,coveredTransition,nextLeg,shouldTick,canRetire,waitingFor,obstructed,introduced,visibleActors,prepareEvent,startExitMotion,logicalOnlyDelete,occupies,sameField,nextEvents};root.MistraltonContinuity=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
