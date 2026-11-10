/* Native RL point/line steering. WB163 is a mode boundary, not a free shortcut. */
(function(root){
 function validRecord(r,data){
  const finite=p=>Array.isArray(p)&&p.length===3&&p.every(v=>Number.isFinite(v)&&Math.abs(v)<4096),line=data?.lines[r?.line];
  return !!(r&&r.version===1&&Number.isInteger(r.line)&&r.line>=0&&line&&Number.isFinite(r.front)&&r.front>=0&&r.front<=line.length&&['align','walk','exit','ledge'].includes(r.mode)&&
   (r.mode!=='align'||finite(r.from)&&finite(r.to)&&Number.isFinite(r.progress)&&r.progress>=0&&r.progress<1&&Math.hypot(r.to[0]-r.from[0],r.to[1]-r.from[1])<=.8)&&
   (!r.buttonStep||r.mode==='align'&&Math.abs(r.to[2]-r.from[2]-2)<.01)&&
   (r.mode!=='ledge'||finite(r.from)&&finite(r.to)&&finite(r.marker)&&[114,115,116,117].includes(r.marker[2])&&Number.isFinite(r.progress)&&r.progress>=0&&r.progress<1&&Math.hypot(r.to[0]-r.from[0],r.to[1]-r.from[1])<=2.7)&&
   (r.mode!=='exit'||Number.isFinite(r.distance)&&r.distance>=0&&r.distance<=2));
 }
 function normalize(n){
  if(!n?.draydenRailWalk)return null;
  if(n.zone!==121){delete n.draydenRailWalk;return null;}
  if(validRecord(n.draydenRailWalk,root.LEAGUE_RAILS?.[121])&&!n.draydenJump&&!n.draydenPuzzle?.task)return null;
  delete n.draydenRailWalk;delete n.railCurrent;n.fieldHeight=0;n.draydenRailRecovered=true;return {x:11.5,y:33.5};
 }
 function create({state=()=>root.NativeStory?.state,hero=()=>player,rails=root.NativeRails,tables=()=>root.PINWHEEL_RAILS?.[121],floor=(x,z,h)=>root.OpelucidChapter?.rawSurfaceAt(121,x,z,h),occupied=(x,z)=>root.NativeStory?.occupied(x,z),speed=()=>typeof keys!=='undefined'&&keys.Shift?6.5:3.5,resetInput=()=>root.resetInput?.(),save=()=>root.Journey?.save(true)}={}){
  const active=()=>state()?.zone===121;
  const valid=r=>validRecord(r,tables());
  function record(){const r=state()?.draydenRailWalk;if(!r)return null;if(!valid(r))throw Error('Posizione sui binari di Aristide non valida');return r;}
  const enabled=line=>root.NativeRailGates?.[121]?.(line)!==false;
  function point(line,front){const p=rails.position(121,line,front);return {x:p.x-16,z:p.z-16,height:p.height};}
  function pose(r){return point(r.line,r.front);}
  function apply(p,r){const n=state();Object.assign(hero(),{x:p.x,y:p.z});n.fieldHeight=p.height;n.railCurrent={zone:121,line:r.line,front:r.front,side:0,height:p.height};}
  function project(at,x,z){
   let lo=at.front,hi=Math.min(tables().lines[at.line].length,lo+1);
   const distance=f=>{const p=point(at.line,f);return (p.x-x)**2+(p.z-z)**2;};
   for(let i=0;i<20;i++){const a=lo+(hi-lo)/3,b=hi-(hi-lo)/3;if(distance(a)<distance(b))hi=b;else lo=a;}
   const front=(lo+hi)/2,p=point(at.line,front);return {front,p};
  }
  function bind(at,x,z){
   const n=state(),p=hero(),projected=project(at,x,z),distance=Math.hypot(projected.p.x-p.x,projected.p.z-p.y);
   if(distance>.8||occupied(projected.p.x,projected.p.z))return false;
   const r=n.draydenRailWalk={version:1,line:at.line,front:projected.front,mode:distance>.001?'align':'walk'};
   if(r.mode==='align'){r.from=[p.x,p.y,n.fieldHeight??0];r.to=[projected.p.x,projected.p.z,projected.p.height];r.progress=0;}else apply(projected.p,r);
   return true;
  }
  function tick(dt){const r=record();if(!active()||!r||!['align','ledge'].includes(r.mode)||!Number.isFinite(dt)||dt<0)return;
   if(r.mode==='ledge'){
    r.progress=Math.min(1,r.progress+dt*3.5/Math.max(.001,Math.hypot(r.to[0]-r.from[0],r.to[1]-r.from[1])));
    const p=r.from.map((v,i)=>v+(r.to[i]-v)*r.progress);Object.assign(hero(),{x:p[0],y:p[1],jumpLift:Math.sin(Math.PI*r.progress)*.65});state().fieldHeight=p[2];delete state().railCurrent;
    if(r.progress===1){delete state().draydenRailWalk;delete hero().jumpLift;save();}return;
   }
   r.progress=Math.min(1,r.progress+dt*speed()/Math.max(.001,Math.hypot(r.to[0]-r.from[0],r.to[1]-r.from[1],r.buttonStep?r.to[2]-r.from[2]:0)));
   const p=r.from.map((v,i)=>v+(r.to[i]-v)*r.progress);apply({x:p[0],z:p[1],height:p[2]},r);if(r.buttonStep)delete state().railCurrent;
   if(r.progress===1){if(r.buttonStep){delete state().draydenRailWalk;save();}else{r.mode='walk';delete r.from;delete r.to;delete r.progress;}}
  }
  // IRBI21 021a5c8c..021a5ccc accepts a blocked ledge only in its
  // encoded direction: 74 up,75 down,73 left,72 right. The airborne
  // interpolation is the same continuous HD-2D adaptation as Tower211.
  const ledgeDirection={116:[0,-1],117:[0,1],115:[-1,0],114:[1,0]};
  function nativeButton(x,z,h){return root.ORIGINAL_EVENTS?.zones?.[121]?.triggers.some(t=>!t.rail&&t.script>=3&&t.script<=8&&Math.abs(t.y/16-h)<.01&&Math.floor(x+16)===t.x&&Math.floor(z+16)===t.z);}
  function buttonStepValid(r){const target=floor(r.to[0],r.to[1],r.to[2]);return nativeButton(...r.to)&&target&&!(target.flags&1)&&Math.abs(target.height-r.to[2])<.01&&[0,.25,.5,.75,1].every(f=>{const x=r.from[0]+(r.to[0]-r.from[0])*f,z=r.from[1]+(r.to[1]-r.from[1])*f,q=floor(x,z,r.from[2]);return q&&!(q.flags&1)&&!occupied(x,z);});}
  function tryButtonStep(dx,dz,distance){
   const p=hero(),m=Math.hypot(dx,dz),x=p.x+dx/m*(distance+.18),z=p.y+dz/m*(distance+.18),h=state().fieldHeight??0,q=floor(x,z,h);
   if(!q||q.flags&1||Math.abs(q.height-h-2)>.01||!nativeButton(x,z,q.height))return false;
   const to=[Math.floor(x+16)-15.5,Math.floor(z+16)-15.5,q.height],r={version:1,line:0,front:0,mode:'align',buttonStep:true,from:[p.x,p.y,h],to,progress:0};
   if(!valid(r)||!buttonStepValid(r))return false;state().draydenRailWalk=r;delete state().railCurrent;resetInput();save();return true;
  }
  function ledgeValid(r){
   const [dx,dz]=ledgeDirection[r.marker[2]],q=floor(r.marker[0],r.marker[1],r.from[2]),source=floor(r.from[0],r.from[1],r.from[2]),landing=floor(r.to[0],r.to[1],r.to[2]),vx=r.marker[0]-r.from[0],vz=r.marker[1]-r.from[1];
   return q?.behavior===r.marker[2]&&!!(q.flags&1)&&source&&!(source.flags&1)&&Math.abs(source.height-r.from[2])<.01&&vx*dx+vz*dz>.5&&vx*dx+vz*dz<1.3&&Math.abs(vx*dz-vz*dx)<.35&&landing&&!(landing.flags&1)&&Math.abs(landing.height-r.to[2])<.01&&Math.abs(r.to[0]-r.marker[0]-dx)<.001&&Math.abs(r.to[1]-r.marker[1]-dz)<.001&&
    [0,.5,1].every(f=>{const x=r.from[0]+(r.to[0]-r.from[0])*f,z=r.from[1]+(r.to[1]-r.from[1])*f;return !occupied(x,z);});
  }
  function tryLedge(dx,dz,distance){
   const p=hero(),length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length,x=p.x+ux*(distance+.18),z=p.y+uz*(distance+.18),q=floor(x,z,state().fieldHeight??0),direction=ledgeDirection[q?.behavior];
   if(!direction||!(q.flags&1)||ux*direction[0]+uz*direction[1]<.99)return false;
   const marker=[Math.floor(x+16)-15.5,Math.floor(z+16)-15.5,q.behavior],to=[marker[0]+direction[0],marker[1]+direction[1]],landing=floor(to[0],to[1],state().fieldHeight??0);
   if(!landing||landing.flags&1||Math.abs(landing.height-(state().fieldHeight??0))>1.8)return false;
   const r={version:1,line:0,front:0,mode:'ledge',from:[p.x,p.y,state().fieldHeight??0],to:[...to,landing.height],marker,progress:0};
   if(!valid(r)||!ledgeValid(r)||![[-.18,-.18],[.18,.18]].every(([a,b])=>{const v=floor(to[0]+a,to[1]+b,landing.height);return v&&!(v.flags&1);}))return false;
   state().draydenRailWalk=r;delete state().railCurrent;resetInput();save();return true;
  }
  function boundaryEntry(dx,dz,distance){
   const p=hero(),m=Math.hypot(dx,dz),ux=dx/m,uz=dz/m,h=state().fieldHeight??0,edge=floor(p.x+ux*(distance+.18),p.y+uz*(distance+.18),h);
   if(edge?.behavior!==163||edge.flags&1)return false;
   for(const d of [.25,.5,.75]){
    const x=p.x+ux*d,z=p.y+uz*d,at=rails.surfaceAt?.(121,x,z,{height:h});if(at?.behavior!==163||!enabled(at.line))continue;
    if(![.25,.5,.75,1].every(f=>{const q=floor(p.x+ux*d*f,p.y+uz*d*f,h);return q&&!(q.flags&1)&&Math.abs(q.height-h)<1.8&&!occupied(p.x+ux*d*f,p.y+uz*d*f);}))continue;
    if(bind(at,x,z))return true;
   }
   return false;
  }
  function exit(r,dx,dz,distance){
   const p=hero(),len=Math.hypot(dx,dz),x=p.x+dx/len*distance,z=p.y+dz/len*distance,raw=floor(x,z,state().fieldHeight??0);
   if(!raw||(raw.flags&1)||Math.abs(raw.height-(state().fieldHeight??0))>1.8||occupied(x,z))return true;
   const at=rails.locate(121,x,z,{height:raw.height});
   if(r.mode==='exit'&&at&&at.line!==r.line&&Math.hypot(point(at.line,at.front).x-x,point(at.line,at.front).z-z)<.6)return bind(at,x,z)||true;
   const origin=pose(r),radius=Math.hypot(x-origin.x,z-origin.z);if(radius>2)return true;
   r.mode='exit';r.distance=radius;
   Object.assign(p,{x,y:z});state().fieldHeight=raw.height;delete state().railCurrent;
   // Keep ownership until the HD-2D body has cleared the boundary. Releasing
   // on the first centre sample strands the trailing collision probe on A3.
   if(raw.behavior!==163&&[[-.18,-.18],[.18,.18]].every(([a,b])=>{const q=floor(x+a,z+b,raw.height);return q&&!(q.flags&1)&&q.behavior!==163;}))delete state().draydenRailWalk;
   return true;
  }
  function tryStep(dx,dz,dt=1/60){
   if(!active()||!tables()||!Number.isFinite(dt)||dt<=0||!(dx||dz))return false;
   const direction=Math.abs(dx)>Math.abs(dz)?dx>0?2:4:dz>0?3:1,distance=speed()*dt,n=state();if(!Number.isFinite(distance)||distance<=0)return false;let r=record();
   if(r?.mode==='align'||r?.mode==='ledge')return true;
   if(r?.mode==='exit')return exit(r,dx,dz,distance);
   if(r&&Math.hypot(pose(r).x-hero().x,pose(r).z-hero().y)>.25){delete n.draydenRailWalk;r=null;}
   if(!r){
    const p=hero(),at=rails.locate(121,p.x,p.y,{height:n.fieldHeight??0})||rails.locate(121,p.x+dx/Math.hypot(dx,dz)*distance,p.y+dz/Math.hypot(dx,dz)*distance,{height:n.fieldHeight??0});
    if(!at)return boundaryEntry(dx,dz,distance)||tryLedge(dx,dz,distance)||tryButtonStep(dx,dz,distance);return bind(at,p.x,p.y);
   }
   let remaining=distance;
   for(let turns=0;remaining>1e-8&&turns<8;turns++){
    const data=tables(),line=data.lines[r.line],forward=line.direction,backward=forward===1?3:forward===3?1:forward===2?4:2;
    let sign=direction===forward?1:direction===backward?-1:0;
    // A continuous frame can end a fraction before a native grid junction.
    // Accept the turn while finishing that short approach on the same line;
    // never cut across the world-space corner or choose a disabled branch.
    if(!sign){for(const [end,front]of [[line.a,0],[line.b,line.length]]){const node=data.points[end];if(Math.abs(r.front-front)<=.35&&node.dirs.some((d,i)=>d===direction&&node.lines[i]!==65535&&node.lines[i]!==r.line&&enabled(node.lines[i]))){sign=front===0?-1:1;break;}}}
    const endpoint=r.front<1e-7?line.a:r.front>line.length-1e-7?line.b:null;
    if(endpoint!==null){
     const node=data.points[endpoint],slot=node.dirs.findIndex((d,i)=>d===direction&&node.lines[i]!==65535&&enabled(node.lines[i]));
     if(slot>=0&&node.lines[slot]!==r.line){r.line=node.lines[slot];const next=data.lines[r.line];r.front=next.a===endpoint?0:next.length;continue;}
     const goingOut=r.front<1e-7&&sign<0||r.front>line.length-1e-7&&sign>0;
     if(goingOut||!sign)return exit(r,dx,dz,remaining);
    }
    if(!sign){const at=Math.min(line.tiles.length-1,Math.floor(r.front)),cell=line.tiles.values[at*line.tiles.width+Math.floor(line.tiles.width/2)];return (cell&255)===163?exit(r,dx,dz,remaining):true;}
    const travel=Math.min(.125,remaining,sign>0?line.length-r.front:r.front),front=r.front+sign*travel,p=point(r.line,front),tile=Math.max(0,Math.min(line.tiles.length-1,Math.floor(front))),cell=line.tiles.values[tile*line.tiles.width+Math.floor(line.tiles.width/2)];
    if(!enabled(r.line))return true;
    if(cell&0x10000){
     // IRBI21 021a6f72..021a6fac: current A3 + blocked next rail
     // probes the WB destination before changing movement mode. A3 may
     // precede the endpoint; waiting for that endpoint traps line16.
     const currentTile=Math.min(line.tiles.length-1,Math.floor(r.front)),currentCell=line.tiles.values[currentTile*line.tiles.width+Math.floor(line.tiles.width/2)];
     if((currentCell&255)===163)return exit(r,dx,dz,remaining);
     return true;
    }
    if(occupied(p.x,p.z))return true;
    r.front=front;apply(p,r);remaining-=travel;
    if(travel>1e-9&&(front===0||front===line.length)){const node=data.points[front===0?line.a:line.b];if(node.lines.filter(id=>id!==65535&&enabled(id)).length>2)return true;}
    if(travel<1e-9)return true;
   }
   return true;
  }
  function cancel(){if(state()?.draydenRailWalk?.mode==='ledge')delete hero().jumpLift;if(state())delete state().draydenRailWalk;}
  function restore(){const r=record();if(!active()||!r)return false;const p=hero(),expected=r.mode==='align'?r.from:pose(r);
   if(r.mode==='align'||r.mode==='ledge'){const q=r.from.map((v,i)=>v+(r.to[i]-v)*r.progress);if(Math.hypot(p.x-q[0],p.y-q[1])>.25||r.mode==='ledge'&&!ledgeValid(r)||r.buttonStep&&!buttonStepValid(r)){cancel();return false;}if(r.mode==='ledge')p.jumpLift=Math.sin(Math.PI*r.progress)*.65;}
   else if(r.mode==='walk'&&Math.hypot(p.x-expected.x,p.y-expected.z)>.25){cancel();return false;}
   resetInput();return true;
  }
  return {tryStep,tick,cancel,restore,valid,get busy(){return active()&&['align','ledge'].includes(record()?.mode);},get owned(){return active()&&!!record();}};
 }
 const api={create,normalize,validRecord};root.LeagueGymRail=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
