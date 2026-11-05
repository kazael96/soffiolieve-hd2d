/* IRBI overlay45 task timing/state. Rendering and native ice movement are adapters. */
(function(root){
 function create({data=root.OPELUCID_GYM_DATA,state=()=>root.NativeStory?.state,sound=()=>{},stopSound=()=>{},save=()=>{}}={}){
  if(!data||data.zone!==114||data.tickRate!==30)throw Error('Dati della palestra di Silvestro non disponibili');
  let joined=null,resolve=null;
  const validIndex=i=>Number.isInteger(i)&&i>=0&&i<3;
  function duration(t){const kind=t.kind==='switch'?'switch':data.instances[t.index].kind;return data.models[kind].states[t.start].nativeFrames;}
  function record(){
   const n=state();if(!n)return null;
   if(n.brycenPuzzle===undefined){if(n.zone!==114)return null;n.brycenPuzzle={version:1,states:[...data.initialStates],switches:[...data.initialStates]};}
   const r=n.brycenPuzzle;if(r.version!==1||!['states','switches'].every(k=>Array.isArray(r[k])&&r[k].length===3&&r[k].every(v=>v===0||v===1)))throw Error('Stato della palestra di Silvestro non valido');
   const t=r.task;if(t&&(!['switch','platform'].includes(t.kind)||!validIndex(t.index)||(t.start!==0&&t.start!==1)||r.states[t.index]!==t.start||!Number.isInteger(t.frame)||t.frame<0||t.frame>=duration(t)||!Number.isFinite(t.fraction)||t.fraction<0||t.fraction>=1))throw Error('Animazione della palestra di Silvestro non valida');
   return r;
  }
  function settle(value){const done=resolve;resolve=null;joined=null;done?.(value);}
  function wait(){const r=record();if(!r?.task)return Promise.resolve(false);if(joined?.task===r.task)return joined.promise;if(joined)settle(false);let done;const promise=new Promise(resolve=>done=resolve);joined={task:r.task,promise};resolve=done;return promise;}
  function begin(kind,index){
   if(!['switch','platform'].includes(kind))throw Error('Comando della palestra non valido');if(!validIndex(index)||state()?.zone!==114)return Promise.resolve(false);
   const r=record();if(r.task){if(r.task.kind!==kind||r.task.index!==index)throw Error('Un meccanismo della palestra è già in movimento');return wait();}
   r.task={kind,index,start:r.states[index],frame:0,fraction:0};if(kind==='platform')sound(data.sounds.start);save();return wait();
  }
  function tick(dt){
   if(!Number.isFinite(dt)||dt<0)return;const r=record(),t=r?.task;
   if(joined&&joined.task!==t)settle(false);if(!t)return;
   if(state().zone!==114){delete r.task;stopSound(data.sounds.start);settle(false);save();return;}
   t.fraction+=dt*data.tickRate;const steps=Math.floor(t.fraction+1e-8);t.fraction=Math.max(0,t.fraction-steps);
   t.frame+=steps;if(t.frame<duration(t))return;
   if(t.kind==='switch')r.switches[t.index]=1-t.start;
   else {r.states[t.index]=1-t.start;sound(data.sounds.finish);}
   delete r.task;settle(true);save();
  }
  function visual(instance){
   const r=record();if(!r||!Number.isInteger(instance)||instance<0||instance>=6)return null;
   const index=instance%3,kind=instance<3?'platform':'switch',t=r.task,active=t?.kind===kind&&t.index===index;
   const which=active?t.start:kind==='platform'?r.states[index]:r.switches[index];
   return {state:which,frame:active?t.frame:0,paused:!active};
  }
  function gate(index,mode){const r=record(),rule=data.rampStateRules[index];return state()?.zone===114&&mode===data.nativeRampMode&&Number.isInteger(index)&&index>=0&&index<8&&!!rule&&!!r&&r.states[rule[0]]===rule[1];}
  function cancel(){const r=record();if(r?.task)delete r.task;stopSound(data.sounds.start);settle(false);save();}
  function reset(){cancel();const n=state();if(n)n.brycenPuzzle={version:1,states:[...data.initialStates],switches:[...data.initialStates]};save();}
  return {begin,wait,tick,visual,gate,cancel,reset,get busy(){return !!record()?.task;},get snapshot(){const r=record();return r?JSON.parse(JSON.stringify(r)):null;}};
 }
 const api={create};root.OpelucidGymTask=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
