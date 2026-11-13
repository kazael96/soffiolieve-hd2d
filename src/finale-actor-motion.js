/* IRBI556 selector work16416/16417 and original overlay21 sprite programs.
 * HD-2D displays the native front-facing standing loop for each dragon pose;
 * unused green service cells are not directional walking frames.
 * Earlier Tower graphics and flights remain owned by OpelucidActorMotion.
 */
(function(root){
 const catalog=root.FINALE_SELECTOR_SPRITES;
 function model(zone,raw,vars){
  if(zone!==278||![162,163].includes(raw))return raw;
  const selected=vars[raw===162?16416:16417];
  if(catalog.programs[selected])return selected;
  // Resource preparation can precede the map initializer under opaque cover.
  return raw===163?212:vars[16566]===4?213:vars[16566]===5?222:214;
 }
 function visual(actor,time){
  if(actor.fieldZone!==278)return null;
  const entry=catalog.programs[actor.model];if(!entry)return null;
  const program=entry.programs[entry.animationSet===22?1:0],steps=program.steps;
  const total=steps.reduce((sum,s)=>sum+s[1],0),before=program.loop===null?total:steps.slice(0,program.loop).reduce((sum,s)=>sum+s[1],0);
  let tick=Math.max(0,time-(actor.nativeAnimationStart||0))*30;
  if(tick>=total)tick=program.loop===null?total-1:before+(tick-before)%(total-before);
  let frame=steps.at(-1)[0];for(const step of steps){if(tick<step[1]){frame=step[0];break;}tick-=step[1];}
  const size=catalog.metrics[actor.model];
  return {frame,flip:false,worldWidth:size.width/16,worldHeight:size.height/16};
 }
 const isDragon=actor=>actor?.fieldZone===278&&Object.hasOwn(catalog.programs,actor.model);
 root.FinaleActorMotion={model,visual,isDragon};
})(typeof window==='undefined'?globalThis:window);
