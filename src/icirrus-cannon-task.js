/* Native cannon task timing. Rendering/camera adapters are deliberately separate.
 * Coordinates: field X/Z minus16, native physical Y. One logical update/2VBlank.
 */
(function(root){
 function create({data=root.ICIRRUS_GYM_DATA,readState,hero,sound=()=>{},camera=()=>{},save=()=>{}}){
  const motion=root.IcirrusGymMotion.create(data),phases=['recoil','enter','windup','flight','settle','restore'],delta=[[0,-1],[0,1],[-1,0],[1,0]];
  let resolve=null,promise=null;
  const current=()=>readState().cannonRide;
  function emit(id){const r=current();if(!r.played.includes(id)){r.played.push(id);sound(id);}}
  function position(p){const h=hero();h.x=p[0];h.y=p[2];readState().cannonHeight=p[1];}
  function sample(settled=false){const r=current();position(motion.point(r.index,r.column,r.pathFrame,{settled}));}
  function serialize(){const r=current();if(r)save();}
  function cancel(){const r=current();if(r){if(valid(r)&&readState().zone===108)position(motion.point(r.index,r.column,0,{settled:true}));camera('cancel',r);delete readState().cannonRide;}resolve?.(false);resolve=null;promise=null;}
  function valid(r){
   return r&&Number.isInteger(r.index)&&r.index>=0&&r.index<10&&Number.isInteger(r.column)&&r.column>=0&&r.column<4&&data.routes[r.index][r.column].member>=0&&phases.includes(r.phase)&&Number.isInteger(r.animation)&&r.animation>=0&&r.animation<4&&Number.isInteger(r.animationFrame)&&r.animationFrame>=0&&r.animationFrame<145&&Number.isInteger(r.pathFrame)&&r.pathFrame>=0&&r.pathFrame<data.paths[data.routes[r.index][r.column].member].frames&&Number.isInteger(r.enterFrame)&&r.enterFrame>=0&&r.enterFrame<=20&&Number.isFinite(r.fraction)&&r.fraction>=0&&r.fraction<1&&Array.isArray(r.start)&&r.start.length===3&&r.start.every(Number.isFinite)&&r.start.every(v=>Math.abs(v)<512)&&Array.isArray(r.played)&&r.played.every(v=>data.sounds.includes(v));
  }
  function resume(){
   const r=current();if(!r)return false;
   if(!valid(r)){delete readState().cannonRide;camera('invalid',null);return false;}
   promise=new Promise(done=>resolve=done);camera('resume',r);
   if(['flight','settle'].includes(r.phase))sample();else if(r.phase==='restore')sample(true);
   return true;
  }
  function start(direction,dispatch={}){
   if(readState().zone!==108||current())return null;const h=hero(),found=motion.activation(h.x,h.y,direction,dispatch);if(!found)return null;
   const start=[h.x,readState().cannonHeight||0,h.y],column=found.column,orientation=data.orientations[found.index],cycle=data.directionCycle,animation=cycle[(cycle.indexOf(column)+orientation)%4];
   readState().cannonRide={index:found.index,column,animation,animationFrame:0,pathFrame:0,phase:'recoil',enterFrame:0,fraction:0,start,played:[]};
   promise=new Promise(done=>resolve=done);camera('save',current());serialize();return promise;
  }
  function update(){
   const r=current();if(!r)return;
   const route=data.routes[r.index][r.column],path=data.paths[route.member],profile=data.profiles[route.profile],end=data.materialAnimations[r.animation].frames-1;
   if(r.phase==='recoil'){
    r.animationFrame++;if(r.animationFrame===data.animationFrames.soundA[r.animation])emit(1688);
    if(r.animationFrame>=data.animationFrames.recoilStart[r.animation]){r.phase='enter';r.enterFrame=0;camera('entry',r);}
   }else if(r.phase==='enter'){
    r.enterFrame++;const f=Math.min(1,r.enterFrame/16),origin=data.origins[r.index];
    position([r.start[0]+(origin[0]-16-r.start[0])*f,r.start[1]+(origin[1]-r.start[1])*f,r.start[2]+(origin[2]-16-r.start[2])*f]);
    camera('entryTick',r);
    if(r.enterFrame===profile[2]){r.phase='windup';emit(1689);}
   }else if(r.phase==='windup'){
    r.animationFrame++;
    if(r.animationFrame>=data.animationFrames.flightStart[r.animation]){r.phase='flight';r.pathFrame=0;emit(1696);sample();camera('flight',r);}
   }else if(r.phase==='flight'){
    r.animationFrame=Math.min(end,r.animationFrame+1);r.pathFrame++;
    if(r.animationFrame===data.animationFrames.soundB[r.animation]){emit(1686);r.shakeFrame=0;}
    if(r.shakeFrame!==undefined)r.shakeFrame=Math.min(8,r.shakeFrame+1);
    sample();
    if(route.profile===11?r.pathFrame===70:r.pathFrame===path.frames-1-profile[4])emit(route.profile===11?1697:1687);
    camera('flightTick',r);
    if(r.pathFrame===path.frames-1)r.phase='settle';
   }else if(r.phase==='settle'){
    sample(true);r.phase='restore';camera('settle',r);
   }else if(r.phase==='restore'){
    camera('restore',r);delete readState().cannonRide;resolve?.(true);resolve=null;promise=null;save();return;
   }
   serialize();
  }
  function tick(seconds){
   const r=current();if(!r)return;if(!valid(r)){delete readState().cannonRide;camera('invalid',null);resolve?.(false);resolve=null;promise=null;return;}if(readState().zone!==108){cancel();return;}
   if(!Number.isFinite(seconds)||seconds<0)return;
   const frames=r.fraction+seconds*data.tickRate,count=Math.floor(frames+1e-8);r.fraction=Math.max(0,frames-count);
   for(let i=0;i<count&&current();i++)update();
  }
  function hidden(){const r=current();return !!r&&['windup','flight'].includes(r.phase)&&!r.played.includes(1686);}
  return {start,tick,resume,cancel,get busy(){return !!current();},get ride(){return current();},get hidden(){return hidden();},get promise(){return promise;}};
 }
 root.IcirrusCannonTask={create};
})(typeof window==='undefined'?globalThis:window);
