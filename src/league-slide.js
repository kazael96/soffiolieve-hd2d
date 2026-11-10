/* IRBI overlay63, 021f365c: native lower-ribbon projection, side+2,
 * passable-side search and half-tile steps at30Hz. Geometry uses the existing
 * HD-2D floating rail evaluator; this is not bit-exact DS fixed-point emulation.
 * The currently integrated scope is the214 demonstration, not every field slide. */
(function(root){
 const sub=(a,b)=>a.map((v,i)=>v-b[i]),add=(a,b)=>a.map((v,i)=>v+b[i]),mul=(a,f)=>a.map(v=>v*f),dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],length=a=>Math.hypot(...a);
 // 021b825c rounds signed native16-unit distances, half away from zero.
 const cell=n=>Math.sign(n)*Math.floor((Math.floor(Math.abs(n)*16+1e-8)+8)/16);
 function plan(zone,body,{data=root.PINWHEEL_RAILS,rails=root.NativeRails}={}){
  const table=data?.[zone],dir=[[0,-1],[0,1],[-1,0],[1,0]][body?.direction];
  if(zone!==214||!table||!rails||!dir||![body.x,body.y,body.height].every(Number.isFinite)||body.height<=-.625)return null;
  const position=(line,front,side)=>{const p=rails.position(zone,line,front,side);return [p.x-16,p.height,p.z-16];},start=[body.x,body.height,body.y],from=add(start,[dir[0],0,dir[1]]),reach=(body.height+.625)*4731/4096,ray=[dir[0]*reach,-body.height-.625,dir[1]*reach],candidates=[];
  for(const [id,line]of table.lines.entries()){
   const a=table.points[line.a].position.map((v,i)=>v-(i===1?0:16)),b=table.points[line.b].position.map((v,i)=>v-(i===1?0:16)),axis=sub(b,a),normal=cross(axis,cross(axis,[0,1,0])),den=dot(normal,ray);if(Math.abs(den)<1e-10)continue;
   const f=dot(normal,sub(a,from))/den;if(f<=1e-7||f>1)continue;const hit=add(from,mul(ray,f)),kind=table.curves[line.curve]?.kind;
   if(![0,1,2].includes(kind))throw Error('Tipo di percorso della scivolata non disponibile');
   // 021b9eac samples consecutive whole front coordinates for curved rails;
   // 021b9d68 projects a straight rail in one segment. Both allow width+1.
   const segments=kind?Array.from({length:Math.max(0,line.length-1)},(_,i)=>[i,i+1,position(id,i,0),position(id,i+1,0)]):[[0,line.length,a,b]];
   for(const [lo,hi,p,q]of segments){
    const vector=sub(q,p),size=dot(vector,vector);if(size<1e-12)continue;const along=dot(sub(hit,p),vector)/size;if(along<0||along>1)continue;
    const on=add(p,mul(vector,along)),offset=sub(hit,on),sideDistance=Math.hypot(offset[0],offset[2]),front=kind?hi:cell(lo+(hi-lo)*along);
    if(front<0||front>=line.tiles.length||sideDistance>rails.halfWidth(zone,id,front)+1)continue;
    const sign=cross(sub(p,q),sub(hit,q))[1]<0?-1:1,side=cell(sideDistance)*sign,point=position(id,front,side),distance=length(sub(point,from));
    if(distance>1e-6)candidates.push({line:id,front,side,distance});break;
   }
  }
  // Original021b7968 selects the closest accepted projection before the task
  // searches inward; a blocked nearest destination never selects a farther one.
  candidates.sort((a,b)=>a.distance-b.distance);const projected=candidates[0];if(!projected)return null;
  const line=table.lines[projected.line],cap=Math.floor(rails.halfWidth(zone,projected.line,projected.front)),free=side=>{if(side<-cap||side>cap)return false;const value=line.tiles.values[projected.front*line.tiles.width+side+Math.floor(line.tiles.width/2)];return Number.isInteger(value)&&!((value>>>16)&1);};let landing=free(projected.side)?{...projected}:null;
  // 021f37d2 tests the original projection. 021f37e6 adds two, then the
  // loop PRE-decrements and retains every free point up to the first wall.
  // It does not stop at the first free point or skip a blocked gap.
  for(let side=Math.min(cap,projected.side+2)-1;side>=-cap;side--){if(!free(side))break;landing={line:projected.line,front:projected.front,side};}
  if(!landing)return null;landing={line:landing.line,front:landing.front,side:landing.side};const to=position(landing.line,landing.front,landing.side),slideDistance=length(sub(to,from));if(slideDistance<1e-6)return null;
  const nativeFrames=Math.ceil(slideDistance/.5);
  // Original task offsets the ray origin one tile forward. HD-2D reaches
  // that edge in two visible half-steps instead of moving the body instantly.
  return {zone,from:{x:start[0],y:start[2],height:start[1]},approach:{x:from[0],y:from[2],height:from[1]},to:{x:to[0],y:to[2],height:to[1]},landing,distance:length(sub(to,start)),slideDistance,nativeFrames,approachFrames:2,frames:nativeFrames+2,sound:1773};
 }
 function sample(plan,frame){const edge=frame<=plan.approachFrames,from=edge?plan.from:plan.approach,to=edge?plan.approach:plan.to,f=edge?frame/plan.approachFrames:frame>=plan.frames?1:Math.min(1,(frame-plan.approachFrames)*.5/plan.slideDistance);return Object.fromEntries(['x','y','height'].map(k=>[k,from[k]+(to[k]-from[k])*f]));}
 function create(options={}){
  const effects=options.effects||root.LeagueSlideEffects?.create();
  const state=options.state||(()=>root.NativeStory?.state),pose=options.pose||(()=>{}),sound=options.sound||(id=>root.AudioEngine?.playSound(id)),stop=options.stop||(id=>root.AudioEngine?.stopSound(id)),path=options.path||root.LEAGUE_SLIDE_PATH;let current=null,completedBody=null,arrivedBody=null,returnPromise=null;
  function finish(ok){const task=current;if(!task)return;current=null;
   if(ok){task.body.railHeight=task.body.height;if(task.kind==='slide'){completedBody=task.body;if(task.body.railOriginal)task.body.railOriginal={...task.body.railOriginal,x:task.plan.landing.line,z:task.plan.landing.front,y:task.plan.landing.side&65535};}else{arrivedBody=task.body;task.body.railOriginal={...path.targetRecord};task.body.direction=path.targetRecord.direction;}}
   pose(task.body,task.body.direction,0);delete task.body.nativeSlide;if(task.kind==='slide')stop(task.plan.sound);task.resolve(ok);
  }
  function start(body){
   if(current){if(current.body===body)return current.promise;throw Error('Una scivolata e gia in corso');}
   const p=plan(state()?.zone,body,options);if(!p)return Promise.resolve(false);let resolve;const promise=new Promise(done=>resolve=done);current={kind:'slide',body,plan:p,age:0,frame:0,promise,resolve};completedBody=arrivedBody=null;returnPromise=null;body.nativeSlide=true;void sound(p.sound);return promise;
  }
  function returnToRole(body){
   if(returnPromise)return returnPromise;
   if(body!==completedBody||state()?.zone!==214||!path||path.version!==1||path.actor!==body.uid||Math.hypot(body.x-path.from.x,body.y-path.from.y,body.height-path.from.height)>.001)throw Error('Raccordo fisico della discesa non disponibile');
   const points=[{x:body.x,y:body.y,height:body.height},...path.points.map(p=>({x:p[0],y:p[1],height:p[2]}))],sizes=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y,p.height-points[i].height));let resolve;
   returnPromise=new Promise(done=>resolve=done);current={kind:'return',body,plan:{zone:214},points,sizes,distance:sizes.reduce((a,b)=>a+b,0),age:0,promise:returnPromise,resolve};body.nativeSlide=true;return returnPromise;
  }
  function tick(dt){effects?.tick(dt);const task=current;if(!task)return;if(state()?.zone!==task.plan.zone){finish(false);effects?.clear();return;}if(!Number.isFinite(dt)||dt<=0)return;task.age+=dt;
   if(task.kind==='return'){let left=Math.min(task.distance,task.age*3.5),at=0;while(at<task.sizes.length-1&&left>task.sizes[at])left-=task.sizes[at++];const a=task.points[at],b=task.points[at+1],f=task.sizes[at]>1e-8?Math.min(1,left/task.sizes[at]):1;for(const key of ['x','y','height'])task.body[key]=a[key]+(b[key]-a[key])*f;const dx=b.x-a.x,dy=b.y-a.y;if(Math.hypot(dx,dy)>1e-8)task.body.direction=Math.abs(dx)>Math.abs(dy)?dx>0?3:2:dy>0?1:0;pose(task.body,task.body.direction,[0,1,0,2][Math.floor(task.age*15)%4]);if(task.age*3.5>=task.distance)finish(true);return;}
   const frame=Math.min(task.plan.frames,Math.floor(task.age*30+1e-8));if(frame===task.frame)return;const p=task.plan;
   for(let i=task.frame+1;i<=frame;i++){const nativeFrame=i-p.approachFrames;if(nativeFrame>0&&nativeFrame<p.nativeFrames&&nativeFrame%2===0)effects?.emit(sample(p,i-1),Math.max(0,task.age-i/30));}
   task.frame=frame;Object.assign(task.body,sample(p,frame));pose(task.body,task.body.direction,[0,1,0,2][Math.floor(frame/2)%4]);if(frame===p.frames)finish(true);
  }
  function adopt(previous,actors){const n=state(),body=arrivedBody;if(!body||!path||n.zone!==214||!n.flags?.includes(path.sourceFlag)||n.flags.includes(path.targetFlag)||!previous.includes(body))return false;const index=actors.findIndex(a=>a.uid===path.targetUid&&a.model===body.model);if(index<0)throw Error('Ruolo di arrivo della discesa mancante');const next=actors[index];if(Math.hypot(body.x-next.x,body.y-next.y,body.height-next.height)>.001)throw Error('Ruolo di arrivo fuori dalla posizione fisica');Object.assign(body,{uid:next.uid,script:next.script,direction:next.direction,railOriginal:next.railOriginal||body.railOriginal,railHeight:body.height,wander:next.wander});actors[index]=body;completedBody=arrivedBody=null;returnPromise=null;return true;}
  function reset(){finish(false);effects?.clear();completedBody=arrivedBody=null;returnPromise=null;}
  return {start,tick,returnToRole,adopt,reset,resources:()=>effects?.resources()||[],visuals:()=>effects?.visuals()||[],get completedBody(){return completedBody;},get returnPromise(){return returnPromise;},get busy(){return !!current;},get body(){return current?.body;}};
 }

 const api={plan,create};root.LeagueSlide=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
