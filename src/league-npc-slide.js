/* Persistent native214 slides for travelling NPCs. The departure controller
 * still owns the physical body, door visibility and narrative arrival. */
(function(root){
 let options={};const entries=new Map(),copy=v=>JSON.parse(JSON.stringify(v));
 const watched=r=>options.activeZone?.()===r.zone;
 const definition=r=>options.definition?.(r);
 const near=(a,b,t=.002)=>Math.hypot(a.x-b.x,a.y-b.y,(a.height??0)-(b.height??0))<=t;
 const equal=(a,b)=>typeof a==='number'&&typeof b==='number'?Math.abs(a-b)<1e-8:a&&b&&typeof a==='object'&&typeof b==='object'?Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>equal(a[k],b[k])):a===b;
 function canonical(r){const d=definition(r);if(r.zone!==214||d?.kind!=='slide'||!root.LeaguePlayerSlide?.validate(d.nativeSlide))throw Error('Scivolata del viaggio non disponibile');return d.nativeSlide;}
 function info(r){let e=entries.get(r);if(!e){e={effects:options.effects?.()||root.LeagueSlideEffects?.create(),ready:false,disposed:false};entries.set(r,e);}return e;}
 function stop(e){e.track?.stop();e.track=null;}
 function dispose(e){e.disposed=true;stop(e);e.effects?.clear();}
 function warm(r,e){const key=r.plan,epoch=options.generation?.()??0;if(e.owner===key&&e.epoch===epoch)return e.ready;
  stop(e);e.owner=key;e.epoch=epoch;e.ready=false;e.error=null;
  const s=r.plan.slideRecord;e.track=s.age<s.plan.frames/30?options.audio?.():null;const track=e.track;
  e.pending=Promise.resolve().then(()=>options.prepare?.(r.actor,[1773])).then(()=>track?.prepare?.()).then(()=>{if(e.disposed||r.plan!==key||e.owner!==key){track?.stop();return;}e.epoch=options.generation?.()??0;e.ready=true;}).catch(error=>{if(!e.disposed&&r.plan===key){e.error=error;stop(e);options.onError?.(error,retryAll);}});return false;
 }
 function retry(r){const e=entries.get(r);if(!e||e.disposed||r.plan.kind!=='slide')return Promise.resolve(false);if(e.pending&&!e.error)return e.pending.then(()=>e.ready);e.owner=null;e.error=null;warm(r,e);return e.pending.then(()=>e.ready);}
 function retryAll(){return Promise.all([...entries].filter(([r])=>watched(r)&&r.plan.kind==='slide'&&!r.plan.slideDone).map(([r])=>retry(r))).then(rows=>rows.every(Boolean));}
 function pose(r){const s=r.plan.slideRecord,p=root.LeaguePlayerSlide.sample(s),h=root.LeaguePlayerSlide.heading(s),dir=Math.abs(h[0])>Math.abs(h[1])?h[0]>0?3:2:h[1]>0?1:0;
  r.actor.nativeSlide=true;Object.assign(r.actor,p);options.pose?.(r.actor,dir,[0,1,0,2][Math.floor(s.age*15)%4]);
 }
 function tick(r,dt){if(r.plan?.kind!=='slide'||r.index<r.plan.points.length||r.plan.slideDone)return false;
  if(!Number.isFinite(dt)||dt<0)throw Error('Tempo della scivolata NPC non valido');
  if(!r.plan.slideRecord){const expected=canonical(r);if(!near(r.actor,expected.plan.from))throw Error('NPC fuori dal punto fisico della discesa');r.plan.slideRecord=copy(expected);}
  const s=r.plan.slideRecord,e=info(r),visible=watched(r);
  if(visible){if(!warm(r,e))return true;}else e.track?.pause?.();
  const end=root.LeaguePlayerSlide.finish(s);
  // Reserve the destination before leaving the edge; a player already there
  // retains control and can clear it while the NPC waits at its real source.
  if(s.age===0&&options.obstructed?.(r,end))return true;
  const before=Math.min(s.plan.frames,Math.floor(s.age*30+1e-8));s.phase='slide';s.age=Math.min(root.LeaguePlayerSlide.duration(s),s.age+Math.min(.1,dt));
  const after=Math.min(s.plan.frames,Math.floor(s.age*30+1e-8));
  if(visible)for(let f=before+1;f<=after;f++){const native=f-s.plan.approachFrames;if(native>0&&native<s.plan.nativeFrames&&native%2===0)e.effects?.emit(root.LeagueSlide.sample(s.plan,f-1),Math.max(0,s.age-f/30));}
  pose(r);if(visible&&s.age<s.plan.frames/30)e.track?.sync?.(s.age*30);else stop(e);
  if(s.age+1e-8>=root.LeaguePlayerSlide.duration(s)){Object.assign(r.actor,end,{railHeight:end.height});delete r.actor.nativeSlide;r.plan.slideDone=true;delete r.plan.slideRecord;r.stage='hold';stop(e);}
  return true;
 }
 function restore(r,d,rebuild){if(d?.kind!=='slide')return undefined;if(r.zone!==214||!root.LeaguePlayerSlide.validate(d.nativeSlide))return null;
  const actor={...r.actor,...d.start};delete actor.incomingPortal;const base=rebuild(actor),s=r.plan.slideRecord,done=r.plan.slideDone===true;base.transferAuthorized=r.plan.transferAuthorized===true;
  if(s){if(done||r.index!==base.points.length||!root.LeaguePlayerSlide.validate(s)||!['plan','direction','sourceLine','sourceFront','sourceSide'].every(k=>equal(s[k],d.nativeSlide[k]))||!near(r.actor,root.LeaguePlayerSlide.sample(s)))return null;
   return {...r,plan:{...base,slideRecord:copy(s)},index:base.points.length,stage:'walk',actor:{...r.actor,nativeSlide:true}};
  }
  if(done){if(r.index!==base.points.length||!near(r.actor,root.LeaguePlayerSlide.finish(d.nativeSlide)))return null;return {...r,plan:{...base,slideDone:true},index:base.points.length,stage:'hold'};}
  if(r.index>base.points.length)return null;const b=base.points[r.index]||d.nativeSlide.plan.from,a=r.index?base.points[r.index-1]:(base.startPose||d.start),dx=b.x-a.x,dy=b.y-a.y,size=dx*dx+dy*dy,f=size?Math.max(0,Math.min(1,((r.actor.x-a.x)*dx+(r.actor.y-a.y)*dy)/size)):1;
  if(!near(r.actor,{x:a.x+dx*f,y:a.y+dy*f,height:(a.height??0)+((b.height??0)-(a.height??0))*f},.02))return null;
  return {...r,plan:base,stage:'walk'};
 }
 function tickEffects(dt){for(const [r,e]of entries){e.effects?.tick(dt);if(!watched(r)){e.effects?.clear();e.track?.pause?.();}if(![...options.records?.values?.()||[]].includes(r)){dispose(e);entries.delete(r);}else if(r.plan.kind!=='slide'&&!e.effects?.visuals().length){dispose(e);entries.delete(r);}}}
 function reserved(x,y,height){return [...options.records?.values?.()||[]].some(r=>r.zone===options.activeZone?.()&&r.plan.kind==='slide'&&!r.plan.slideDone&&r.index>=r.plan.points.length&&(()=>{const s=r.plan.slideRecord||definition(r)?.nativeSlide;if(!s)return false;const p=root.LeaguePlayerSlide.finish(s);return Math.abs(p.x-x)<.55&&Math.abs(p.y-y)<.55&&Math.abs(p.height-height)<1.25;})());}
 const api={configure:v=>{for(const e of entries.values())dispose(e);entries.clear();options=v;},tick,restore,retry,retryAll,tickEffects,reserved,sliding:r=>!!r.plan?.slideRecord,ownsHeight:r=>r.plan?.kind==='slide'&&(!!r.plan.slideRecord||r.plan.slideDone===true),canRetire:r=>r.plan?.kind==='slide'?r.plan.slideDone===true:undefined,visuals:()=>[...entries].filter(([r])=>watched(r)).flatMap(([,e])=>e.effects?.visuals()||[]),pauseAudio:()=>{for(const e of entries.values())e.track?.pause?.();}};
 root.LeagueNpcSlides=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
