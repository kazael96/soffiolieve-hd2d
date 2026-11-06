/* Chapter051 physical handoffs. Routes use native WB/GC support heights. */
(function(root){
 let options={},kit;
 const owns=z=>root.OpelucidChapter?.zones.includes(z),n=()=>options.native;
 const origin=z=>root.OpelucidChapter.globalZones.includes(z)?[784,752]:[16,16];
 function portal(z,index){const w=root.OPELUCID_EVENTS.zones[z].warps[index],o=origin(z);if(w.rail){const p=root.NativeRails.warp(z,w);return {w,x:p.x-o[0],y:p.z-o[1],height:p.height,dx:p.out.x,dy:p.out.z};}const [dx,dy]=({1:[0,1],2:[0,-1],3:[1,0],4:[-1,0]})[w.a];return {w,x:w.x/16+(w.width-1)/2-o[0],y:w.z/16+(w.height-1)/2-o[1],height:(w.y<<16>>16)/16,dx,dy};}
 function door(z,index){const p=portal(z,index),next=portal(p.w.zone,p.w.warp),sourceLanding=p.w.rail?root.NativeRails.landing(z,p.w):null,nextLanding=next.w.rail?root.NativeRails.landing(p.w.zone,next.w):null;return {...kit.door(z,p.x,p.y,p.dx,p.dy,{x:next.x+next.dx*.8,y:next.y+next.dy*.8},p.height),nativePortal:index,nextHeight:nextLanding?.rail.height??next.height,stagePoint:sourceLanding?{x:sourceLanding.x,y:sourceLanding.z,height:sourceLanding.rail.height}:{x:p.x-p.dx,y:p.y-p.dy,height:p.height},nextEntry:nextLanding?{x:nextLanding.x,y:nextLanding.z}:{x:next.x-next.dx,y:next.y-next.dy}};}
 const ascent=()=>[[205,0],[206,1],[207,1],[208,1],[209,1]].map(([z,i])=>door(z,i));
 function extend(value){kit=value;
  // Outdoor113 and205 share matrix0. Crossing their boundary is a walk,
  // rather than retiring a visible body and spawning its next logical role.
  kit.itineraries['cedric-dragonspiral-approach']=()=>[kit.arrival(113,-602.5,-607.5,205,0,3)];
  kit.itineraries['brycen-dragonspiral']=()=>[{...kit.edge(113,-604.5,-594.5,0,-1),height:3},...ascent(),kit.arrival(210,3.5,-2.5,210,1,10)];
  kit.itineraries['komor-dragonspiral']=()=>[{...kit.edge(113,-605.5,-594.5,0,-1),height:3},...[[205,0],[206,1],[207,1]].map(([z,i])=>door(z,i)),kit.arrival(208,-11.5,-1.5,208,251,3)];
  kit.itineraries['komor-dragonspiral-upper']=()=>[door(208,1),door(209,1),kit.arrival(210,3.5,.5,210,0,10)];
  kit.itineraries['belle-dragonspiral']=()=>[kit.arrival(113,-602.5,-596.5,205,2,3)];
  kit.itineraries['n-dragonspiral-summit']=()=>[{...kit.edge(113,-604.5,-594.5,0,-1),height:3},...ascent(),door(210,1),door(211,1),door(212,1),kit.arrival(213,.5,-3.5,213,2)];
 }
 function destination(actor,z){if(z===208&&actor.name==='Komor')return 'komor-dragonspiral-upper';if(z!==113)return null;if(actor.name==='Silvestro')return 'brycen-dragonspiral';if(actor.name==='Komor')return 'komor-dragonspiral';if(actor.name==='Belle')return 'belle-dragonspiral';if(actor.name==='N')return 'n-dragonspiral-summit';return null;}
 function path(from,to,z){if(!owns(z))return null;if(z===211)return root.NativeRailPaths.route(z,from,to);return root.IcirrusPaths.route(z,from,to,{chapter:root.OpelucidChapter,zones:root.OpelucidChapter.zones,unbounded:true});}
 function blocked(z,x,y){if(!owns(z))return null;const rail=root.NativeRails?.has(z)&&root.NativeRails.locate(z,x,y);if(rail)return false;return root.OpelucidChapter.blockedAt(z,x,y);}
 function ready(name,z,uid){const r=options.departures?.records.get(name);return r?r.stage==='resident'&&r.actor.fieldZone===z&&r.actor.uid===uid:n()?.opelucidArrivals?.[z+':'+uid]===name;}
 function arrived(r){if(!owns(r.actor.fieldZone)||r.plan.kind!=='arrival')return;const native=n();native.opelucidArrivals??={};native.opelucidArrivals[r.actor.fieldZone+':'+r.actor.uid]=r.actor.name;options.recheck?.();}
 function allowActor(actor){if(actor.fieldZone===205&&(n()?.vars[16551]||0)<=1){const uid={Rutilo:0,Komor:1,Silvestro:4}[actor.name];if(uid!==undefined)return ready(actor.name,205,uid);}if(actor.fieldZone===210&&[0,1].includes(actor.uid))return ready(actor.name,210,actor.uid);if(actor.fieldZone===213&&actor.uid===2&&(n()?.vars[16551]||0)<=8)return ready('N',213,2);return true;}
 function prepareEvent(z,script){if(z===205&&script===1)return ready('Rutilo',205,0)&&ready('Belle',205,2);if(z===208&&script===1)return ready('Komor',208,251);if(z===210&&[1,2].includes(script))return ready('Komor',210,0)&&ready('Silvestro',210,1);if(z===213&&script===1)return ready('N',213,2);return true;}
 function startBelle(){const native=n();if(!native||native.vars[16535]!==4||native.belleDragonspiralDeparture)return;
  const body=(options.actors?.()||[]).find(a=>a.name==='Belle'&&a.fieldZone===113&&!a.hidden)||(native.actors?.[113]||[]).find(a=>a.name==='Belle'&&!a.hidden);if(!body)return;
  if(options.departures.depart(body,113)){native.belleDragonspiralDeparture=true;body.hidden=true;}
 }
 function tick(){startBelle();for(const r of options.departures?.records.values()||[]){if(!owns(r.actor.fieldZone))continue;const target=r.plan.points[r.index],previous=r.index?r.plan.points[r.index-1]:r.plan.startPose;let wanted=r.actor.height||0;
  // A0.50 save may already have Cedric waiting at the old chapter boundary.
  // Re-route from that physical position; do not install his new role there.
  const boundary=r.plan.destination==='cedric-dragonspiral-approach'&&r.plan.targetUid===252||r.plan.destination==='n-dragonspiral-approach'&&r.plan.targetUid===253&&n()?.vars[16437]===790;
  if(r.stage==='resident'&&boundary&&r.plan.destinationZone===113){const plan=root.MistraltonContinuity.planExit(r.actor,113);plan.transferAuthorized=r.plan.transferAuthorized===true;Object.assign(r,{plan,index:0,stage:'walk',target:null,opened:false});r.actor.exitProbe=true;continue;}
  if(target?.height!==undefined&&previous?.height!==undefined){const dx=target.x-previous.x,dy=target.y-previous.y,length=dx*dx+dy*dy,f=length?Math.max(0,Math.min(1,((r.actor.x-previous.x)*dx+(r.actor.y-previous.y)*dy)/length)):1;wanted=previous.height+(target.height-previous.height)*f;}
  if(target&&previous&&(target.jumpLift!==undefined||previous.jumpLift!==undefined)){const dx=target.x-previous.x,dy=target.y-previous.y,length=dx*dx+dy*dy,f=length?Math.max(0,Math.min(1,((r.actor.x-previous.x)*dx+(r.actor.y-previous.y)*dy)/length)):1;r.actor.jumpLift=(previous.jumpLift||0)+((target.jumpLift||0)-(previous.jumpLift||0))*f;}else delete r.actor.jumpLift;
  const rail=root.NativeRails?.has(r.actor.fieldZone)&&root.NativeRails.locate(r.actor.fieldZone,r.actor.x,r.actor.y,{height:wanted}),surface=root.OpelucidChapter.surfaceAt(r.actor.fieldZone,r.actor.x,r.actor.y,wanted);r.actor.height=rail&&(!surface||Math.abs(rail.height-wanted)<Math.abs(surface.height-wanted))?rail.height:surface?.height??wanted;
 }}
 root.OpelucidContinuity={extend,destination,path,blocked,prepareEvent,allowActor,arrived,tick,configure:v=>options=v,replaceExitMotion:(actor,z,address)=>z===113&&(actor.name==='Silvestro'&&address===1148||actor.name==='Komor'&&address===1160)||z===208&&actor.name==='Komor'&&address===124};
})(typeof window==='undefined'?globalThis:window);
