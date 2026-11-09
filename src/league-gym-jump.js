/* IRBI46:021f3a3c/021f3ddc: eight-frame lateral hop, including native height offsets. */
(function(root){
 function create({data=root.LEAGUE_GYM_DATA,state=()=>root.NativeStory?.state,hero=()=>player,sound=()=>{},save=()=>{},resetInput=()=>{}}={}){
  if(data?.zone!==121||data.jump?.frames!==8||data.jump.heightOffsets?.length!==8)throw Error('Salto originale della palestra non disponibile');
  let joined=null;
  function record(){
   const t=state()?.draydenJump;if(!t)return null;
   if(t.version!==1||![2,3].includes(t.direction)||!Array.isArray(t.origin)||t.origin.length!==3||!t.origin.every(Number.isFinite)||!Number.isInteger(t.frame)||t.frame<0||t.frame>=8||!Number.isFinite(t.fraction)||t.fraction<0||t.fraction>=1)throw Error('Checkpoint del salto di Aristide non valido');
   return t;
  }
  function pose(t){const [x,z,height]=t.origin,p=hero();p.x=x+(t.direction===2?-1:1)*data.jump.xStep*t.frame;p.y=z;state().fieldHeight=height+(t.frame?data.jump.heightOffsets[t.frame-1]:0);}
  function settle(value){const old=joined;joined=null;old?.resolve(value);}
  function wait(){const task=record();if(!task)return Promise.resolve(false);if(joined?.task===task)return joined.promise;if(joined)settle(false);let resolve;const promise=new Promise(done=>resolve=done);joined={task,promise,resolve};return promise;}
  function begin(direction){
   if(![2,3].includes(direction))throw Error('Direzione del salto di Aristide non valida');
   if(state()?.zone!==121)return Promise.resolve(false);
   const old=record();if(old){if(old.direction!==direction)throw Error('Un salto è già in corso');return wait();}
   const p=hero(),height=state().fieldHeight??0;
   if(![p.x,p.y,height].every(Number.isFinite))throw Error('Posizione iniziale del salto non valida');
   state().draydenJump={version:1,direction,origin:[p.x,p.y,height],frame:0,fraction:0};resetInput();sound(data.jump.sounds[0]);save();return wait();
  }
  function tick(dt){
   if(!Number.isFinite(dt)||dt<0)return;const t=record();if(joined&&joined.task!==t)settle(false);if(!t||state()?.zone!==121)return;
   t.fraction+=dt*data.tickRate;const steps=Math.floor(t.fraction+1e-8);t.fraction=Math.max(0,t.fraction-steps);t.frame=Math.min(8,t.frame+steps);pose(t);
   if(t.frame<8)return;delete state().draydenJump;sound(data.jump.sounds[1]);resetInput();settle(true);save();
  }
  function restore(){const t=record();if(t&&state()?.zone===121){pose(t);resetInput();return true;}return false;}
  function cancel(){const t=record();if(t){if(state()?.zone===121){const [x,z,height]=t.origin;Object.assign(hero(),{x,y:z});state().fieldHeight=height;}delete state().draydenJump;resetInput();save();}settle(false);}
  return {begin,wait,tick,restore,cancel,get busy(){return !!record();}};
 }
 const api={create};root.LeagueGymJump=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
