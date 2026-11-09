/* Validate persisted native tasks with their actual controllers, without playing them. */
(function(root){
 function normalize(n,options={}){
  if(!n)return;
  const data=options.data||root.LEAGUE_GYM_DATA,taskFactory=options.taskFactory||root.LeagueGymTask?.create,jumpFactory=options.jumpFactory||root.LeagueGymJump?.create;
  if(n.draydenPuzzle===undefined&&n.draydenJump===undefined)return;
  if(!data||!taskFactory||!jumpFactory)throw Error('Validazione della palestra di Aristide non disponibile');
  let recovered=false;
  if(n.draydenPuzzle!==undefined){
   const probe={zone:121,draydenPuzzle:n.draydenPuzzle};
   try{
    const task=taskFactory({data,state:()=>probe});task.snapshot;
    // Leaving a room cannot leave an orphaned task waiting for a discarded VM.
    if(n.zone!==121&&probe.draydenPuzzle.task)task.cancel();
    n.draydenPuzzle=task.snapshot;
   }catch{
    n.draydenPuzzle={version:1,dragons:data.initialStates.map(([neck,left,right])=>({neck,arms:[left,right]}))};recovered=true;
   }
  }
  if(n.draydenJump!==undefined){
   try{
    const r=n.draydenJump;
    if(n.zone!==121||!r||!Array.isArray(r.origin)||!r.origin.every(v=>Number.isFinite(v)&&Math.abs(v)<4096))throw Error('Salto fuori contesto');
    const probe={zone:121,draydenJump:r};jumpFactory({data,state:()=>probe}).busy;
    n.draydenJump={version:1,direction:r.direction,origin:[...r.origin],frame:r.frame,fraction:r.fraction};
   }catch{delete n.draydenJump;recovered=n.zone===121||recovered;}
  }
  if(n.draydenPuzzle?.task&&n.draydenJump){delete n.draydenPuzzle.task;delete n.draydenJump;recovered=true;}
  if(recovered){n.draydenPuzzleRecovered=true;if(n.zone===121){delete n.railCurrent;delete n.draydenJump;n.fieldHeight=0;return {x:11.5,y:33.5};}}
 }
 const api={normalize};root.LeagueGymSave=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
