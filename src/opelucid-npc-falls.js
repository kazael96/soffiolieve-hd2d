/* Persistent NPC sand handoffs. 34 native sink ticks and the583 40-tick curve.
 * Extra submersion is an HD-2D adaptation when the lower camera still sees the
 * head: the ordinary GPU occlusion proof remains required before handoff.
 * A world-height floor cut keeps submerged pixels inside the sand, including
 * when a low cutaway camera sees beyond the room's decorative side wall.
 */
(function(root){
 let options={};const prepared=new WeakMap();
 const watched=r=>options.activeZone?.()===r.zone;
 function ensure(r,kind){
  if(!watched(r))return true;const key=r.plan.leg+':'+kind+':'+(options.generation?.()??0);let row=prepared.get(r);
  if(row?.key!==key){row={key,ready:false};prepared.set(r,row);const plan=r.plan;Promise.resolve().then(()=>options.prepare?.(r.actor,kind==='entry'?[1665,1666]:[1952])).then(()=>{if(r.plan===plan){row.key=r.plan.leg+':'+kind+':'+(options.generation?.()??0);row.ready=true;}},error=>{if(r.plan===plan)row.error=error;});}
  if(row.error)throw row.error;return row.ready;
 }
 function signal(r,id,key){const phase=r.plan[key];if(phase[id])return;phase[id]=true;if(watched(r))options.sound?.(id);}
 function floorClip(r){r.actor.exitClip=[0,1,0,-(r.actor.height??0)];}
 function apply(r,kind){const phase=r.plan[kind==='entry'?'fallEntry':'fallExit'];if(kind==='entry'){
   delete r.actor.exitClip;
   if(phase.frame>=40){delete r.actor.jumpLift;delete r.actor.noShadow;delete r.actor.npcFallPending;return;}
   r.actor.jumpLift=(250-250*(phase.frame/40)**2)/16;r.actor.noShadow=true;
  }else{floorClip(r);r.actor.jumpLift=-1.875*Math.min(1,phase.frame/34)-2.125*Math.max(0,Math.min(1,(phase.frame-37)/12));r.actor.noShadow=true;}
 }
 function enter(r){if(!r.plan.fallEntry)return;r.plan.fallEntry={frame:0,fraction:0};r.actor.npcFallPending=true;apply(r,'entry');}
 function tick(r,dt){if(!Number.isFinite(dt)||dt<0)throw Error('Tempo della caduta non valido');const entry=r.plan.fallEntry,exiting=r.plan.kind==='fall'&&r.index>=r.plan.points.length;
  if(entry&&entry.frame<40){if(!ensure(r,'entry')){r.actor.npcFallPending=true;return true;}delete r.actor.npcFallPending;signal(r,1665,'fallEntry');entry.fraction+=dt*30;while(entry.fraction+1e-8>=1&&entry.frame<40){entry.fraction=Math.max(0,entry.fraction-1);entry.frame++;}if(entry.frame===40)entry.fraction=0;apply(r,'entry');if(entry.frame===40)signal(r,1666,'fallEntry');return true;}
  if(!exiting)return false;r.stage='hold';r.plan.fallExit??={frame:0,fraction:0};floorClip(r);if(!ensure(r,'exit'))return true;signal(r,1952,'fallExit');const phase=r.plan.fallExit;phase.fraction+=dt*30;while(phase.fraction+1e-8>=1&&phase.frame<49){phase.fraction=Math.max(0,phase.fraction-1);phase.frame++;}if(phase.frame===49)phase.fraction=0;apply(r,'exit');return phase.frame<34;
 }
 function canExit(r){return r.plan.kind!=='fall'||r.plan.fallExit?.frame>=34;}
 function restore(r,definition){
  if(!r.plan.fallEntry&&!r.plan.fallExit&&r.plan.kind!=='fall')return undefined;
  if(!definition||definition.kind!==r.plan.kind||!!definition.fallEntry!==!!r.plan.fallEntry)return null;
  for(const [key,max]of [['fallEntry',40],['fallExit',49]]){const p=r.plan[key];if(!p)continue;if(!Number.isInteger(p.frame)||p.frame<0||p.frame>max||!Number.isFinite(p.fraction)||p.fraction<0||p.fraction>=1.000001)return null;}
  if(r.plan.fallExit&&(r.index!==r.plan.points.length||Math.hypot(r.actor.x-definition.anchor.x,r.actor.y-definition.anchor.y)>.001))return null;
  if(r.plan.fallExit)apply(r,'exit');else if(r.plan.fallEntry){apply(r,'entry');if(r.plan.fallEntry.frame<40)r.actor.npcFallPending=true;}
  return r;
 }
 root.OpelucidNpcFalls={blocks:r=>!(r.plan.kind==='fall'&&r.plan.fallExit?.frame>=34),configure:v=>options=v,tick,enter,restore,canExit};
 if(typeof module!=='undefined')module.exports=root.OpelucidNpcFalls;
})(typeof window!=='undefined'?window:globalThis);
