/* IRBI21 downward input, native160/161 and NG basis; continuous HD-2D alignment.
 * The three no-hit boundary probes remain refusals, not invented destinations. */
(function(root){
 const rows=[[0,0,0,0],[0,1,2,3],[2,3,1,0],[1,0,3,2]],angles=[0,32768,16384,49152];
 function basis(zone,line,front,direction=1,{data=root.PINWHEEL_RAILS,rails=root.NativeRails}={}){
  const record=data?.[zone]?.lines[line];if(zone!==214||!record||!Number.isFinite(front)||front<0||front>=record.length||![0,1,2,3].includes(direction))return null;
  const step=1/4096,a=rails.position(zone,line,front,0),b=rails.position(zone,line,Math.min(record.length,front+step),0),v=[b.x-a.x,b.height-a.height,b.z-a.z],turn=angles[rows[record.direction]?.[direction]];
  const r=turn===0?v:turn===32768?v.map(n=>-n):turn===16384?[v[2],0,-v[0]]:turn===49152?[-v[2],0,v[0]]:null,size=r&&Math.hypot(...r);return size>1e-12?r.map(n=>n/size):null;
 }
 function coordinate(zone,body,at,{rails=root.NativeRails,data=root.PINWHEEL_RAILS}={}){
  const line=data?.[zone]?.lines[at?.line];if(!line)return null;
  function sample(front){const a=rails.position(zone,at.line,front,0),b=rails.position(zone,at.line,front,1),vx=b.x-a.x,vz=b.z-a.z,size=vx*vx+vz*vz;if(size<1e-12)return null;const side=((body.x+16-a.x)*vx+(body.y+16-a.z)*vz)/size,p=rails.position(zone,at.line,front,side);return {front,side,p,error:(p.x-16-body.x)**2+(p.z-16-body.y)**2+(p.height-body.height)**2};}
  let lo=at.front,hi=Math.min(line.length,lo+1);for(let i=0;i<28;i++){const a=lo+(hi-lo)/3,b=hi-(hi-lo)/3;if(sample(a).error<sample(b).error)hi=b;else lo=a;}const result=sample((lo+hi)/2);return result.error<.0001?result:null;
 }
 // Native actors use a point; the browser walker has a .18-tile body.
 // Keep the exact native landing, then visibly settle within that same free
 // cell only where its boundary would otherwise trap the wider body.
 function settlement(plan,{data=root.PINWHEEL_RAILS,rails=root.NativeRails}={}){
  const zone=214,l=plan.landing,hint={height:plan.to.height,line:l.line},foot=p=>[[-.18,-.18],[.18,.18],[-.18,.18],[.18,-.18]].every(([dx,dz])=>{const r=rails.locate(zone,p.x+dx,p.y+dz,hint);return r&&Math.abs(r.height-p.height)<1.25;});
  if(foot(plan.to))return null;const candidates=[];
  const point=(front,side)=>{const p=rails.position(zone,l.line,front,side);return {x:p.x-16,y:p.z-16,height:p.height};};
  for(const df of [.25,.5,.75])for(const ds of [0,.25,-.25]){const front=l.front+df,side=l.side+ds;if(front>=data[zone].lines[l.line].length)continue;const to=point(front,side),distance=Math.hypot(to.x-plan.to.x,to.y-plan.to.y,to.height-plan.to.height);if(!distance||!foot(to)||![0,.25,.5,.75,1].every(f=>{const p=point(l.front+df*f,l.side+ds*f);return !!rails.locate(zone,p.x,p.y,{height:p.height,line:l.line});}))continue;const horizontal=Math.hypot(to.x-plan.to.x,to.y-plan.to.y);candidates.push({line:l.line,front,side,to,duration:distance/3.5,direction:[(to.x-plan.to.x)/horizontal,(to.y-plan.to.y)/horizontal]});}
  candidates.sort((a,b)=>a.duration-b.duration);return candidates[0];
 }
 const duration=r=>r.plan.frames/30+(r.settle?.duration||0),finish=r=>r.settle?.to||r.plan.to,heading=r=>r.settle&&r.age>r.plan.frames/30?r.settle.direction:r.direction;
 function sample(r){const p=r.plan;if(!r.settle||r.age<=p.frames/30)return root.LeagueSlide.sample(p,Math.min(p.frames,Math.floor(r.age*30+1e-8)));const f=Math.min(1,(r.age-p.frames/30)/r.settle.duration),q=root.NativeRails.position(214,r.settle.line,p.landing.front+(r.settle.front-p.landing.front)*f,p.landing.side+(r.settle.side-p.landing.side)*f);return {x:q.x-16,y:q.z-16,height:q.height};}
 function candidate(body,dx,dy,{data=root.PINWHEEL_RAILS,rails=root.NativeRails,slide=root.LeagueSlide}={}){
  if(!body||![body.x,body.y,body.height,dx,dy].every(Number.isFinite)||dy<=0||Math.abs(dx)>dy)return null;
  const at=rails.surfaceAt(214,body.x,body.y,{height:body.height,line:body.line});if(!at||![160,161].includes(at.behavior)||at.flags&1)return null;
  const projected=coordinate(214,body,at,{data,rails});if(!projected)return null;const down=basis(214,at.line,projected.front,1,{data,rails});if(!down)return null;
  const next=rails.surfaceAt(214,body.x+down[0],body.y+down[2],{height:body.height,line:at.line});if(next&&!(next.flags&1))return null;
  const plan=slide.plan(214,{...body,direction:1},{data,rails,direction:[down[0],down[2]]});if(!plan)return null;const settle=settlement(plan,{data,rails});if(settle===undefined)return null;
  return {version:1,zone:214,sourceLine:at.line,sourceFront:projected.front,sourceSide:projected.side,direction:[down[0],down[2]],plan,settle,age:0,phase:'prepare'};
 }
 function validate(r,{data=root.PINWHEEL_RAILS,rails=root.NativeRails,slide=root.LeagueSlide}={}){
  if(!r||r.version!==1||r.zone!==214||!Number.isInteger(r.sourceLine)||!['prepare','slide'].includes(r.phase)||!Number.isFinite(r.age)||r.age<0||r.phase==='prepare'&&r.age!==0||!r.plan?.from)return false;
  const p=r.plan.from;if(![p.x,p.y,p.height].every(n=>Number.isFinite(n)&&Math.abs(n)<4096))return false;
  const checked=candidate({...p,line:r.sourceLine},0,1,{data,rails,slide});if(!checked||r.sourceLine!==checked.sourceLine||r.age>=duration(checked))return false;
  const equal=(a,b)=>typeof a==='number'&&typeof b==='number'?Math.abs(a-b)<1e-8:typeof a==='object'&&a&&typeof b==='object'&&b&&Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>equal(a[k],b[k]));
  return (checked.settle===null?r.settle==null:equal(r.settle,checked.settle))&&equal(r.plan,checked.plan)&&equal(r.direction,checked.direction)&&Math.abs(r.sourceFront-checked.sourceFront)<1e-8&&Math.abs(r.sourceSide-checked.sourceSide)<1e-8;
 }
 root.LeaguePlayerSlide={basis,coordinate,settlement,sample,finish,duration,heading,candidate,validate};
})(typeof window==='undefined'?globalThis:window);

/* Resource preparation owns one operation; checkpoints retain the original plan. */
(function(root){
 const api=root.LeaguePlayerSlide;
 function create(options){
  const {state,hero,save=()=>{},resetInput=()=>{},face=()=>{},prepare=async()=>{},audio=()=>null,onError=()=>{},canStart=()=>true,canLand=()=>true}=options,effects=options.effects||root.LeagueSlideEffects?.create();
  let current=null,serial=0,pending=null,track=null,ready=false,lastError=null;
  const active=()=>state()?.zone===214;
  function record(){return active()?state().playerSlide||null:null;}
  function stop(){track?.stop();track=null;}
  function frame(r){return Math.min(r.plan.frames,Math.floor(r.age*30+1e-8));}
  function pose(r){const p=api.sample(r);Object.assign(hero(),{x:p.x,y:p.y});state().fieldHeight=p.height;delete state().railCurrent;const direction=api.heading(r);face(Math.abs(direction[0])>Math.abs(direction[1])?direction[0]>0?3:2:direction[1]>0?1:0);}
  function warm(r){
   if(pending&&current===r)return pending;
   const token=++serial;current=r;ready=false;lastError=null;stop();track=r.age+1e-8<r.plan.frames/30?audio():null;const sound=track;
   const operation=Promise.resolve().then(()=>prepare(effects?.resources()||[],sound));
   const request=operation.then(()=>{if(token!==serial||record()!==r||!active()){sound?.stop();return false;}ready=true;r.phase='slide';pose(r);sound?.sync(r.age*30);save();return true;}).catch(error=>{if(token!==serial||record()!==r)return false;lastError=error;onError(error,()=>retry());return false;}).finally(()=>{if(pending===request)pending=null;});
   pending=request;return request;
  }
  function retry(){const r=record();return r&&!ready&&!pending?warm(r):pending||Promise.resolve(false);}
  function restore(){
   const r=record();if(!r){cancel();return false;}
   if(!api.validate(r))throw Error('Checkpoint della scivolata non valido');
   effects?.clear();pose(r);resetInput();void warm(r);return true;
  }
  function cancel(){serial++;pending=null;current=null;ready=false;lastError=null;stop();effects?.clear();if(state()?.playerSlide)delete state().playerSlide;resetInput();}
  function tryStep(dx,dy){
   if(!active())return false;if(record())return true;if(!canStart())return false;
   const p=hero(),r=api.candidate({...p,height:state().fieldHeight??0,line:state().railCurrent?.line},dx,dy);if(!r||!canLand(api.finish(r))||r.settle&&!canLand(r.plan.to))return false;
   state().playerSlide=r;resetInput();save();void warm(r);return true;
  }
  function tick(dt){
   if(root.document?.hidden){pauseAudio();return;}if(!Number.isFinite(dt)||dt<=0)return;effects?.tick(dt);
   const r=record();if(!r){if(current)cancel();return;}if(current!==r){restore();return;}if(!ready)return;
   const before=frame(r);r.age+=dt;const after=frame(r),p=r.plan;
   for(let i=before+1;i<=after;i++){const nativeFrame=i-p.approachFrames;if(nativeFrame>0&&nativeFrame<p.nativeFrames&&nativeFrame%2===0)effects?.emit(root.LeagueSlide.sample(p,i-1),Math.max(0,r.age-i/30));}
   pose(r);if(r.age+1e-8>=p.frames/30)stop();else track?.sync(r.age*30);
   if(r.age+1e-8>=api.duration(r)){const end=api.finish(r),at=root.NativeRails.locate(214,end.x,end.y,{height:end.height,line:p.landing.line});Object.assign(state(),{fieldHeight:end.height,railCurrent:{zone:214,...(at||p.landing),height:end.height}});delete state().playerSlide;current=null;ready=false;stop();resetInput();save();}
  }
  function pauseAudio(){track?.pause?.();}
  function hidden(){if(root.document?.hidden)pauseAudio();}
  function dispose(){cancel();root.document?.removeEventListener?.('visibilitychange',hidden);}
  root.document?.addEventListener?.('visibilitychange',hidden);
  return {tryStep,tick,restore,retry,cancel,dispose,pauseAudio,enter:()=>record()?restore():cancel(),visuals:()=>effects?.visuals()||[],heightAt:(x,z)=>record()&&Math.hypot(x-hero().x,z-hero().y)<.001?state().fieldHeight:null,actor:()=>{const r=record();if(!r)return null;const [x,z]=api.heading(r),direction=Math.abs(x)>Math.abs(z)?x>0?3:2:z>0?1:0;return {direction,frame:direction*3+[0,1,0,2][Math.floor(r.age*30/2)%4]};},get busy(){return !!record();},get checkpointable(){return !!record();},get error(){return lastError;},get pending(){return pending;},get prepared(){return ready;}};
 }
 api.create=create;
})(typeof window==='undefined'?globalThis:window);

/* Normalize a persisted plan from its original supported source, never midair. */
(function(root){
 root.LeaguePlayerSlide.normalize=function(n){
  const r=n?.playerSlide;if(r===undefined)return null;
  if(n.zone!==214){delete n.playerSlide;return null;}
  if(root.LeaguePlayerSlide.validate(r)){const p=root.LeaguePlayerSlide.sample(r);n.fieldHeight=p.height;delete n.railCurrent;return {x:p.x,y:p.y};}
  // Covered-load recovery uses the actual native entrance ribbon. Other
  // captured rooms, flags, inventory and party are left to their own validators.
  const p=root.NativeRails.position(214,0,5.5,0);delete n.playerSlide;delete n.railCurrent;n.fieldHeight=p.height;n.playerSlideRecovered=true;return {x:p.x-16,y:p.z-16};
 };
})(typeof window==='undefined'?globalThis:window);
