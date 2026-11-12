/* Isolated QA instrumentation. Never loaded by the published game. */
(function(root){
 function create({maxGapMs=1000}={}){
  if(!Number.isFinite(maxGapMs)||maxGapMs<=0)throw Error('Invalid QA input frame budget');
  let failure=null;
  return {
   sample({dt,held,locked=false}){
    if(!failure&&held&&!locked&&Number.isFinite(dt)&&dt>maxGapMs){
     failure=Error('QA input bench stalled while holding '+held+': '+Math.round(dt)+'ms between frames; replay is not valid collision evidence');
     failure.code='QA_INPUT_FRAME_STALL';
     failure.details={gapMs:dt,key:held,maxGapMs};
    }
    return failure;
   },
   assert(){if(failure)throw failure;}
  };
 }
 function waypointKey(p,goal,preferred,{strict=false,locked=false}={}){
  if(locked)return null;if(strict)return preferred;
  const dx=goal.x-p.x,dy=goal.y-p.y;
  if(Math.abs(dx)>.12)return dx>0?'ArrowRight':'ArrowLeft';
  if(Math.abs(dy)>.12)return dy>0?'ArrowDown':'ArrowUp';
  return null;
 }
 function corridorKey(p,goal,key,blocked,occupied=()=>false){
  const axis={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]}[key];if(!axis||typeof blocked!=='function')return key;
  const look=Math.min(.22,Math.abs(axis[0]?goal.x-p.x:goal.y-p.y)),x=p.x+axis[0]*look,y=p.y+axis[1]*look;
  // A free centre with a blocked body corner means the driver is too close
  // to a side wall. Correct that lateral drift before continuing the lane.
  // A blocked centre can be a native ledge: keep its prescribed direction.
  if(occupied(x,y)||!blocked(x,y)&&(blocked(x-.18,y-.18)||blocked(x+.18,y+.18))){
   const delta=axis[0]?goal.y-p.y:goal.x-p.x;if(Math.abs(delta)>.001)return axis[0]?delta>0?'ArrowDown':'ArrowUp':delta>0?'ArrowRight':'ArrowLeft';
  }
  return key;
 }
 function railKey(p,goal,preferred,current,tables){
  if(current?.mode!=='walk'||goal.rail?.mode!=='walk')return preferred;
  const reverse={ArrowUp:'ArrowDown',ArrowDown:'ArrowUp',ArrowLeft:'ArrowRight',ArrowRight:'ArrowLeft'};
  if(current.line===goal.rail.line){const delta=goal.rail.front-current.front,key={1:'ArrowUp',2:'ArrowRight',3:'ArrowDown',4:'ArrowLeft'}[tables.lines[current.line].direction];return delta<0?reverse[key]:delta>0?key:preferred;}
  const axis={ArrowRight:[1,0],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowUp:[0,-1]}[preferred];
  return axis&&(goal.x-p.x)*axis[0]+(goal.y-p.y)*axis[1]<-.02?reverse[preferred]:preferred;
 }
 function nativeWaypoint(p,{tables,position,floor}){
  if(p.rail?.mode==='walk'){
   const line=tables.lines[p.rail.line],front=p.rail.front<.35?0:line.length-p.rail.front<.35?line.length:null;if(front===null)return p;
   const at=position(p.rail.line,front);return {...p,x:at.x-16,z:at.z-16,junction:true,rail:{...p.rail,front}};
  }
  if(!Number.isFinite(p.height))return p;
  const x=Math.floor(p.x+16)-15.5,z=Math.floor(p.z+16)-15.5,q=floor(x,z,p.height);
  if(!q||q.flags&1||q.behavior===163||Math.abs(q.height-p.height)>1.8||![[-.18,-.18],[.18,.18]].every(([a,b])=>{const v=floor(x+a,z+b,q.height);return v&&!(v.flags&1)&&Math.abs(v.height-q.height)<1.8;}))return p;
  // The quarter-cell search path is a geometric witness. Use the original
  // free WB cell centre as a rendered-input target, rather than demanding
  // sub-frame precision at its inner edge. Permissions remain unchanged.
  return {...p,x,z,height:q.height,rail:undefined,nativeCell:[Math.floor(x+16),Math.floor(z+16)]};
 }
 function nativeReached(p,target,{height,blocked,current,tables,tolerance=.12}={}){
  if(target.nativeCell)return Math.floor(p.x+16)===target.nativeCell[0]&&Math.floor(p.y+16)===target.nativeCell[1]&&Math.abs(height-target.height)<.65&&[[-.18,-.18],[.18,.18],[-.18,.18],[.18,-.18]].every(([a,b])=>!blocked(p.x+a,p.y+b));
  if(target.junction&&current?.mode==='walk'){
   const goal=tables.lines[target.rail.line],line=tables.lines[current.line],node=target.rail.front===0?goal.a:goal.b;
   if((line.a===node||line.b===node)&&Math.abs(height-target.height)<.65)return Math.hypot(p.x-target.x,p.y-target.z)<.3;
  }
  return Math.hypot(p.x-target.x,p.y-target.z)<tolerance;
 }
 const api={create,waypointKey,corridorKey,railKey,nativeWaypoint,nativeReached};root.QAInputHealth=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
