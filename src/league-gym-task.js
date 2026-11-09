/* IRBI overlay46: button407, arm410, neck409. Field jump408 is a separate task. */
(function(root){
 function create({data=root.LEAGUE_GYM_DATA,state=()=>root.NativeStory?.state,sound=()=>{},stopSound=()=>{},save=()=>{}}={}){
  if(data?.zone!==121||data.tickRate!==30||data.initialStates?.length!==3)throw Error('Dati della palestra di Aristide non disponibili');
  let joined=null;
  const validIndex=i=>Number.isInteger(i)&&i>=0&&i<3,bit=x=>x===0||x===1;
  const poseFromArms=arms=>arms[0]?(arms[1]?1:2):(arms[1]?3:0);
  function track(instance,index){const descriptor=data.descriptors[instance],model=data.models['lg-gym-'+descriptor.model],row=model.states[index];if(!row?.nativeFrames)throw Error('Traccia originale del drago non disponibile');return row;}
  function plan(r,kind,index,side){
   const dragon=r.dragons[index];
   if(kind==='button')return {instance:index*5+(side?4:3),track:0,start:0,target:0};
   if(kind==='arm'){const start=dragon.arms[side],target=1-start;return {instance:index*5+side+1,track:target,start,target};}
   const start=dragon.neck,target=poseFromArms(dragon.arms),animation=data.neckTransitionTracks[start]?.[target];
   if(!Number.isInteger(animation))throw Error('Transizione del drago non consentita');
   return {instance:index*5,track:animation,start,target};
  }
  function record(){
   const n=state();if(!n)return null;
   if(n.draydenPuzzle===undefined){if(n.zone!==121)return null;n.draydenPuzzle={version:1,dragons:data.initialStates.map(([neck,left,right])=>({neck,arms:[left,right]}))};}
   const r=n.draydenPuzzle;
   if(r.version!==1||!Array.isArray(r.dragons)||r.dragons.length!==3||r.dragons.some(d=>!Number.isInteger(d.neck)||d.neck<0||d.neck>3||!Array.isArray(d.arms)||d.arms.length!==2||!d.arms.every(bit)))throw Error('Stato della palestra di Aristide non valido');
   const t=r.task;
   if(t){
    if(!['button','arm','neck'].includes(t.kind)||!validIndex(t.index)||!bit(t.side)||!Number.isInteger(t.frame)||t.frame<0||!Number.isFinite(t.fraction)||t.fraction<0||t.fraction>=1)throw Error('Animazione della palestra di Aristide non valida');
    const d=r.dragons[t.index];
    if(t.kind==='arm'&&(!bit(t.start)||t.target!==1-t.start||d.arms[t.side]!==t.target)||t.kind==='neck'&&(d.neck!==t.target||poseFromArms(d.arms)!==t.target))throw Error('Checkpoint del drago incoerente');
    const prior={dragons:r.dragons.map(d=>({neck:d.neck,arms:[...d.arms]}))};
    if(t.kind==='arm')prior.dragons[t.index].arms[t.side]=t.start;
    if(t.kind==='neck')prior.dragons[t.index].neck=t.start;
    const expected=plan(prior,t.kind,t.index,t.side);
    if(['instance','track','start','target'].some(k=>expected[k]!==t[k])||t.frame>=track(t.instance,t.track).nativeFrames)throw Error('Checkpoint del drago incoerente');
   }
   return r;
  }
  function settle(value){const old=joined;joined=null;old?.resolve(value);}
  function wait(){const task=record()?.task;if(!task)return Promise.resolve(false);if(joined?.task===task)return joined.promise;if(joined)settle(false);let resolve;const promise=new Promise(done=>resolve=done);joined={task,promise,resolve};return promise;}
  function begin(kind,index,side=0){
   if(!['button','arm','neck'].includes(kind)||!validIndex(index)||!bit(side))throw Error('Comando della palestra di Aristide non valido');
   if(state()?.zone!==121)return Promise.resolve(false);
   const r=record();if(r.task){if(r.task.kind!==kind||r.task.index!==index||r.task.side!==side)throw Error('Un drago è già in movimento');return wait();}
   const spec=plan(r,kind,index,side);track(spec.instance,spec.track);
   r.task={kind,index,side,...spec,frame:0,fraction:0};
   if(kind==='arm')r.dragons[index].arms[side]=spec.target;
   if(kind==='neck')r.dragons[index].neck=spec.target;
   sound(data.sounds[kind]);save();return wait();
  }
  function tick(dt){
   if(!Number.isFinite(dt)||dt<0)return;const r=record(),t=r?.task;
   if(joined&&joined.task!==t)settle(false);if(!t||state()?.zone!==121)return;
   t.fraction+=dt*data.tickRate;const steps=Math.floor(t.fraction+1e-8);t.fraction=Math.max(0,t.fraction-steps);t.frame+=steps;
   if(t.frame<track(t.instance,t.track).nativeFrames)return;
   stopSound(data.sounds[t.kind]);if(t.kind!=='button')sound(data.sounds[t.kind]+(t.kind==='neck'?5:1));
   delete r.task;settle(true);save();
  }
  function visual(instance){
   const r=record();if(!r||!Number.isInteger(instance)||instance<0||instance>=16)return null;
   const t=r.task;if(t?.instance===instance)return {track:t.track,frame:t.frame,paused:false};
   if(instance===15)return {track:0,frame:0,paused:true};
   const dragon=r.dragons[Math.floor(instance/5)],part=instance%5;
   if(part>=3)return {track:0,frame:0,paused:true};
   const animation=part===0?data.idleNeckTracks[dragon.neck]:dragon.arms[part-1];
   return {track:animation,frame:track(instance,animation).nativeFrames-1,paused:true};
  }
  function collisionState(index){const r=record();if(!r||!validIndex(index))return null;const t=r.task,neck=t?.kind==='neck'&&t.index===index?t.start:r.dragons[index].neck;return neck;}
  function railEnabled(line){
   if(!Number.isInteger(line)||line<0)return false;
   for(let index=0;index<3;index++){
    const neck=collisionState(index);if(neck===null)return true;const row=data.collisionStateRows[index*4+neck],position=row.indexOf(line);
    if(position>=0)return neck!==1&&position<2;
   }
   return true;
  }
  function cancel(){const r=record(),t=r?.task;if(t){if(t.kind==='arm')r.dragons[t.index].arms[t.side]=t.start;if(t.kind==='neck')r.dragons[t.index].neck=t.start;delete r.task;stopSound(data.sounds[t.kind]);save();}settle(false);}
  return {begin,wait,tick,visual,cancel,collisionState,railEnabled,get busy(){return !!record()?.task;},get snapshot(){const r=record();return r?JSON.parse(JSON.stringify(r)):null;}};
 }
 const api={create};root.LeagueGymTask=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
