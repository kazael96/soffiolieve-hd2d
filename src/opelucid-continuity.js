/* Chapter051 physical handoffs. Routes use native WB/GC support heights. */
(function(root){
 let options={},kit;
 const owns=z=>root.OpelucidChapter?.zones.includes(z),n=()=>options.native;
 const origin=z=>root.OpelucidChapter.globalZones.includes(z)?[784,752]:[16,16];
 function portal(z,index){const w=root.OPELUCID_EVENTS.zones[z].warps[index],o=origin(z);if(w.rail){const p=root.NativeRails.warp(z,w);return {w,x:p.x-o[0],y:p.z-o[1],height:p.height,dx:p.out.x,dy:p.out.z};}const [dx,dy]=({1:[0,1],2:[0,-1],3:[1,0],4:[-1,0]})[w.a];return {w,x:w.x/16+(w.width-1)/2-o[0],y:w.z/16+(w.height-1)/2-o[1],height:(w.y<<16>>16)/16,dx,dy};}
 function door(z,index){const p=portal(z,index),next=portal(p.w.zone,p.w.warp),sourceLanding=p.w.rail?root.NativeRails.landing(z,p.w):null,nextLanding=next.w.rail?root.NativeRails.landing(p.w.zone,next.w):null;return {...kit.door(z,p.x,p.y,p.dx,p.dy,{x:next.x+next.dx*.8,y:next.y+next.dy*.8},p.height),nativePortal:index,nextHeight:nextLanding?.rail.height??next.height,stagePoint:sourceLanding?{x:sourceLanding.x,y:sourceLanding.z,height:sourceLanding.rail.height}:{x:p.x-p.dx,y:p.y-p.dy,height:p.height},nextEntry:nextLanding?{x:nextLanding.x,y:nextLanding.z}:{x:next.x-next.dx,y:next.y-next.dy}};}
 const ascent=()=>[[205,0],[206,1],[207,1],[208,1],[209,1]].map(([z,i])=>door(z,i));
 function extend(value){kit=value;
  const mayor=root.OPELUCID_EVENTS.zones[123].actors.find(a=>a.id===0);
  kit.itineraries['drayden-home']=()=>[door(120,3),kit.arrival(123,mayor.x-15.5,mayor.z-15.5,123,0,mayor.y/65536)];
  const iris=root.OPELUCID_EVENTS.zones[123].actors.find(a=>a.id===1);
  // The native final guidance step already reaches the door plane. Do not
  // walk back out to its staging cell before continuing through the entrance.
  kit.itineraries['iris-home']=()=>[{...door(120,3),stagePoint:undefined},kit.arrival(123,iris.x-15.5,iris.z-15.5,123,1,iris.y/65536)];
  const gymGate=portal(120,2);
  kit.itineraries['drayden-gym']=()=>[door(123,0),{...kit.door(120,gymGate.x,gymGate.y,gymGate.dx,gymGate.dy,null,gymGate.height),nativePortal:2}];
  // Native121 actor4 runs the Gym leader entry; interior traversal belongs
  // to the following milestone. Keep the covered boundary handoff explicit.
  kit.nextEvents['drayden-gym']={zone:121,uid:4,label:'Aristide nella palestra di Boreduopoli'};
  const leagueGate=portal(132,1);
  kit.itineraries['nardo-league-road']=()=>[door(120,8),{...kit.door(132,leagueGate.x,leagueGate.y,leagueGate.dx,leagueGate.dy,null,leagueGate.height),nativePortal:1}];
  kit.nextEvents['nardo-league-road']={zone:144,uid:2,label:'Nardo alla Lega Pokémon'};
  kit.itineraries['nardo-after-surf']=()=>[...kit.mountain(),kit.icirrusDoor(202,3),kit.arrival(113,-602.5,-597.5,205,3,3)];
  // Outdoor113 and205 share matrix0. Crossing their boundary is a walk,
  // rather than retiring a visible body and spawning its next logical role.
  kit.itineraries['cedric-dragonspiral-approach']=()=>[kit.arrival(113,-602.5,-607.5,205,0,3)];
  kit.itineraries['brycen-dragonspiral']=()=>[{...kit.edge(113,-604.5,-594.5,0,-1),height:3},...ascent(),kit.arrival(210,3.5,-2.5,210,1,10)];
  kit.itineraries['komor-dragonspiral']=()=>[{...kit.edge(113,-605.5,-594.5,0,-1),height:3},...[[205,0],[206,1],[207,1]].map(([z,i])=>door(z,i)),kit.arrival(208,-11.5,-1.5,208,251,3)];
  kit.itineraries['komor-dragonspiral-upper']=()=>[door(208,1),door(209,1),kit.arrival(210,3.5,.5,210,0,10)];
  kit.itineraries['belle-dragonspiral']=()=>[kit.arrival(113,-602.5,-596.5,205,2,3)];
  kit.itineraries['n-dragonspiral-summit']=()=>[{...kit.edge(113,-604.5,-594.5,0,-1),height:3},...ascent(),door(210,1),door(211,1),door(212,1),kit.arrival(213,.5,-3.5,213,2)];
  for(const [key,uid,y]of [['komor',0,8.5],['brycen',1,9.5]])kit.itineraries[key+'-dragonspiral-top']=()=>[door(210,1),door(211,1),door(212,1),kit.arrival(213,.5,y,213,uid)];
  for(const [key,uid,x,y]of [['komor',1,-605.5,-596.5],['brycen',4,-604.5,-607.5]])kit.itineraries[key+'-dragonspiral-return']=()=>[...[[213,0],[212,0],[211,0],[210,0],[209,0],[208,0],[207,0],[206,0]].map(([z,i])=>door(z,i)),kit.arrival(205,x,y,205,uid,3)];
  for(const [key,uid]of [['cedric',1],['brycen',0]])kit.itineraries[key+'-tower-research']=()=>{const a=root.OPELUCID_EVENTS.zones[207].actors.find(a=>a.id===uid);return [door(205,0),door(206,1),kit.arrival(207,a.x-15.5,a.z-15.5,207,uid,a.y/65536)];};
  for(const [zone,uid]of [[16,11],[120,8]])kit.itineraries['nardo-flight-arrival-'+zone]=()=>{const a=root.OPELUCID_EVENTS.zones[zone].actors.find(a=>a.id===uid),o=origin(zone);return [kit.arrival(zone,a.x+.5-o[0],a.z+.5-o[1],zone,uid,a.y/65536)];};
 }
 function destination(actor,z){if(z===123&&actor.name==='Aristide')return 'drayden-gym';if(z===120&&actor.name==='Iris')return 'iris-home';if(z===120&&actor.name==='Aristide')return 'drayden-home';if(z===120&&actor.name==='Nardo')return actor.nativeFlightArrival?'nardo-flight-arrival-120':'nardo-league-road';if(z===16&&actor.name==='Nardo')return 'nardo-flight-arrival-16';if(z===205&&['Gasparago','Silvestro'].includes(actor.name))return (actor.name==='Gasparago'?'cedric':'brycen')+'-tower-research';if([210,213].includes(z)&&['Komor','Silvestro'].includes(actor.name))return (actor.name==='Komor'?'komor':'brycen')+'-dragonspiral-'+(z===210?'top':'return');if(z===208&&actor.name==='Komor')return 'komor-dragonspiral-upper';if(z!==113)return null;if(actor.name==='Silvestro')return 'brycen-dragonspiral';if(actor.name==='Komor')return 'komor-dragonspiral';if(actor.name==='Belle')return 'belle-dragonspiral';if(actor.name==='N')return 'n-dragonspiral-summit';return null;}
 function flyToNextEvent(body,source){
  const zone=source===158?16:source===16?120:null;if(body?.name!=='Nardo'||zone===null)throw Error('Destinazione narrativa di Volo non disponibile');
  const fly=root.MISTRALTON_FLY_DATA.headers[zone].fly,o=origin(zone),copy={...body,fieldZone:zone,x:fly[0]+.5-o[0],y:fly[2]+.5-o[1],height:fly[1],hidden:false,exitProbe:true,nativeFlightArrival:true};delete copy.jumpLift;delete copy.noShadow;
  // Validate the destination walk before replacing the covered source body.
  root.MistraltonContinuity.planExit(copy,zone);
  const old=options.departures.records.get('Nardo');options.departures.records.delete('Nardo');
  try{if(!options.departures.depart(copy,zone))throw Error('Arrivo di Nardo non avviato');options.departures.records.get('Nardo').plan.transferAuthorized=true;body.hidden=true;}
  catch(error){options.departures.records.delete('Nardo');if(old)options.departures.records.set('Nardo',old);throw error;}
 }
 function path(from,to,z){if(!owns(z))return null;if(Math.hypot(from.x-to.x,from.y-to.y)<1e-7&&Math.abs((from.height||0)-(to.height||0))<1e-7)return [];if(z===211)return root.NativeRailPaths.route(z,from,to);return root.IcirrusPaths.route(z,from,to,{chapter:root.OpelucidChapter,zones:root.OpelucidChapter.zones,unbounded:true});}
 function blocked(z,x,y){if(!owns(z))return null;const rail=root.NativeRails?.has(z)&&root.NativeRails.locate(z,x,y);if(rail)return false;return root.OpelucidChapter.blockedAt(z,x,y);}
 function ready(name,z,uid){const r=options.departures?.records.get(name);return r?r.stage==='resident'&&r.actor.fieldZone===z&&r.actor.uid===uid:n()?.opelucidArrivals?.[z+':'+uid]===name;}
 function arrived(r){if(!owns(r.actor.fieldZone)||r.plan.kind!=='arrival')return;const native=n();native.opelucidArrivals??={};native.opelucidArrivals[r.actor.fieldZone+':'+r.actor.uid]=r.actor.name;options.recheck?.();}
 function allowActor(actor){if(actor.fieldZone===123&&actor.name==='Iris'&&actor.uid===1)return ready('Iris',123,1);if(actor.fieldZone===123&&actor.name==='Aristide'&&actor.uid===0)return ready('Aristide',123,0);if(actor.fieldZone===165&&actor.name==='Komor'&&actor.uid===2)return actor.nativeSandArrival===true;if(actor.name==='Nardo'&&[[16,11],[120,8]].some(([z,id])=>actor.fieldZone===z&&actor.uid===id))return ready('Nardo',actor.fieldZone,actor.uid);if(actor.fieldZone===205&&actor.name==='Nardo'&&actor.uid===3)return ready('Nardo',205,3);if(actor.fieldZone===207&&[0,1].includes(actor.uid)&&['Gasparago','Silvestro'].includes(actor.name))return ready(actor.name,207,actor.uid);const work=n()?.vars[16551]||0;if(actor.fieldZone===205&&work<=1){const uid={Gasparago:0,Komor:1,Silvestro:4}[actor.name];if(uid!==undefined)return ready(actor.name,205,uid);}if(actor.fieldZone===205&&work===9&&!n()?.vars[16541]&&['Komor','Silvestro'].includes(actor.name))return ready(actor.name,205,actor.name==='Komor'?1:4);if(actor.fieldZone===210&&[0,1].includes(actor.uid))return work<8&&ready(actor.name,210,actor.uid);if(actor.fieldZone===213&&work<=8){const names={0:'Komor',1:'Silvestro',2:'N'};if(names[actor.uid])return ready(names[actor.uid],213,actor.uid);}return true;}
 function prepareEvent(z,script){if(z===123&&script===1)return ready('Aristide',123,0)&&ready('Iris',123,1);if(z===16&&script===12)return ready('Nardo',16,11);if(z===120&&script===1)return ready('Nardo',120,8);if(z===205&&script===1)return ready('Gasparago',205,0)&&ready('Belle',205,2);if(z===205&&script===4)return ready('Komor',205,1)&&ready('Silvestro',205,4)&&ready('Nardo',205,3);if(z===208&&script===1)return ready('Komor',208,251);if(z===210&&[1,2].includes(script))return ready('Komor',210,0)&&ready('Silvestro',210,1);if(z===213&&script===1)return ready('N',213,2)&&ready('Komor',213,0)&&ready('Silvestro',213,1);return true;}
 function startFriends(){const native=n();if(native?.vars[16551]!==8)return;for(const [name,uid]of [['Komor',0],['Silvestro',1]]){if(ready(name,213,uid))continue;const record=options.departures.records.get(name);if(record&&!(record.stage==='resident'&&record.actor.fieldZone===210))continue;const body=record?.actor||(options.actors?.()||[]).find(a=>a.name===name&&a.fieldZone===210&&!a.hidden)||(native.actors?.[210]||[]).find(a=>a.name===name&&!a.hidden);if(!body)continue;if(options.departures.depart(body,210)&&native.zone!==210)options.departures.records.get(name).plan.transferAuthorized=true;}}
 function startBelle(){const native=n();if(!native||native.vars[16535]!==4||native.belleDragonspiralDeparture)return;
  const body=(options.actors?.()||[]).find(a=>a.name==='Belle'&&a.fieldZone===113&&!a.hidden)||(native.actors?.[113]||[]).find(a=>a.name==='Belle'&&!a.hidden);if(!body)return;
  if(options.departures.depart(body,113)){native.belleDragonspiralDeparture=true;body.hidden=true;}
 }
 function tick(){startBelle();startFriends();root.MistraltonContinuity?.resumeNardoAfterSurf();for(const r of options.departures?.records.values()||[]){if(!owns(r.actor.fieldZone))continue;const target=r.plan.points[r.index],previous=r.index?r.plan.points[r.index-1]:r.plan.startPose;let wanted=r.actor.height||0;
  // A0.50 save may already have Cedric waiting at the old chapter boundary.
  // Re-route from that physical position; do not install his new role there.
  const boundary=r.plan.destination==='cedric-dragonspiral-approach'&&r.plan.targetUid===252||r.plan.destination==='n-dragonspiral-approach'&&r.plan.targetUid===253&&n()?.vars[16437]===790;
  if(r.stage==='resident'&&boundary&&r.plan.destinationZone===113){const plan=root.MistraltonContinuity.planExit(r.actor,113);plan.transferAuthorized=r.plan.transferAuthorized===true;Object.assign(r,{plan,index:0,stage:'walk',target:null,opened:false});r.actor.exitProbe=true;continue;}
  if(target?.height!==undefined&&previous?.height!==undefined){const dx=target.x-previous.x,dy=target.y-previous.y,length=dx*dx+dy*dy,f=length?Math.max(0,Math.min(1,((r.actor.x-previous.x)*dx+(r.actor.y-previous.y)*dy)/length)):1;wanted=previous.height+(target.height-previous.height)*f;}
  if(target&&previous&&(target.jumpLift!==undefined||previous.jumpLift!==undefined)){const dx=target.x-previous.x,dy=target.y-previous.y,length=dx*dx+dy*dy,f=length?Math.max(0,Math.min(1,((r.actor.x-previous.x)*dx+(r.actor.y-previous.y)*dy)/length)):1;r.actor.jumpLift=(previous.jumpLift||0)+((target.jumpLift||0)-(previous.jumpLift||0))*f;}else delete r.actor.jumpLift;
  const rail=root.NativeRails?.has(r.actor.fieldZone)&&root.NativeRails.locate(r.actor.fieldZone,r.actor.x,r.actor.y,{height:wanted}),surface=root.OpelucidChapter.surfaceAt(r.actor.fieldZone,r.actor.x,r.actor.y,wanted);r.actor.height=rail&&(!surface||Math.abs(rail.height-wanted)<Math.abs(surface.height-wanted))?rail.height:surface?.height??wanted;
 }}
 root.OpelucidContinuity={flyToNextEvent,extend,destination,path,blocked,prepareEvent,allowActor,arrived,tick,configure:v=>options=v,statusMessage:actor=>actor?.name==='Nardo'&&!n()?.vars[16541]&&(options.departures?.records.get('Nardo')?.plan.destination==='nardo-after-surf'||ready('Nardo',205,3))?{bank:206,message:7}:null,deferredEvent:z=>z===205&&n()?.vars[16551]===9&&!n()?.vars[16541]?4:null,replaceExitMotion:(actor,z,address)=>z===120&&actor.name==='Nardo'&&address===3456||z===123&&actor.name==='Aristide'&&address===560||z===120&&actor.name==='Aristide'&&address===3468||z===205&&(actor.name==='Gasparago'&&address===800||actor.name==='Silvestro'&&address===816)||z===113&&(actor.name==='Silvestro'&&address===1148||actor.name==='Komor'&&address===1160)||z===208&&actor.name==='Komor'&&address===124||z===213&&(actor.name==='Komor'&&address===1496||actor.name==='Silvestro'&&address===1524)};
})(typeof window==='undefined'?globalThis:window);
