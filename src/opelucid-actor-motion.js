/* Original dragon billboard frames, with HD-2D idle/flight state selection. */
(function(root){
 function sample(program,tick){
  const steps=program.steps,total=steps.reduce((sum,s)=>sum+s[1],0),before=program.loop===null?total:steps.slice(0,program.loop).reduce((sum,s)=>sum+s[1],0);let at=Math.max(0,Number.isFinite(tick)?tick:0);
  if(at>=total)at=program.loop===null?total-1:before+(at-before)%(total-before);
  for(const [frame,hold]of steps){if(at<hold)return frame;at-=hold;}return steps.at(-1)[0];
 }
 function visual(actor,time){const data=root.OPELUCID_FIELD_MOTION?.actors?.[actor.model];if(!data)return null;const elapsed=Math.max(0,time-(actor.nativeAnimationStart||0))*30,program=data.programs[actor.nativeDragonFlight?2:0];return {frame:sample(program,elapsed),worldWidth:data.widthPx/16,worldHeight:data.heightPx/16};}
 const api={sample,visual};root.OpelucidActorMotion=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
