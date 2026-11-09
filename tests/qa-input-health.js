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
 const api={create,waypointKey};root.QAInputHealth=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
