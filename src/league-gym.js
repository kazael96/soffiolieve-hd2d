/* Native242 owns the puzzle order; this adapter joins visual, collision and field tasks. */
(function(root){
 function create(options={}){
  const data=options.data||root.LEAGUE_GYM_DATA,state=options.state||(()=>root.NativeStory?.state),hero=options.hero||(()=>player),save=options.save||(()=>root.Journey?.save(true)),resetInput=options.resetInput||(()=>root.resetInput?.());
  const sound=options.sound||(id=>root.AudioEngine?.playSound(id)),stopSound=options.stopSound||(id=>root.AudioEngine?.stopSound(id)),active=()=>state()?.zone===121;
  const task=(options.taskFactory||root.LeagueGymTask.create)({data,state,save,sound,stopSound});
  const jump=(options.jumpFactory||root.LeagueGymJump.create)({data,state,hero,save,sound,resetInput});
  const visual=(options.visualFactory||root.LeagueGymRenderer.create)({data,task,assets:options.assets||root.OPENING_ASSETS,hero,height:()=>state()?.fieldHeight??0,...options.visualOptions});
  const railGate=line=>task.railEnabled(line);let installed=false;
  function install(){
   root.NativeRailGates??={};const old=root.NativeRailGates[121];
   if(old&&old!==railGate)throw Error('Un altro controllore possiede i passaggi della palestra');
   root.NativeRailGates[121]=railGate;installed=true;
  }
  async function command(name,args,values=args){
   if(!active())return false;
   if(name==='NativeOpcode406'){task.snapshot;return true;}
   if(!['NativeOpcode407','NativeOpcode408','NativeOpcode409','NativeOpcode410'].includes(name))return false;
   if(name==='NativeOpcode408'){if(task.busy)throw Error('Il drago è ancora in movimento');if(!await jump.begin(args[0])||!active())throw Error('Salto della palestra annullato');return true;}
   if(jump.busy)throw Error('Il salto del giocatore è ancora in corso');
   let completed;
   if(name==='NativeOpcode407')completed=await task.begin('button',args[0],args[1]);
   if(name==='NativeOpcode410')completed=await task.begin('arm',values[0],values[1]);
   if(name==='NativeOpcode409')completed=await task.begin('neck',values[0]);
   if(!completed||!active())throw Error('Animazione della palestra annullata');
   return true;
  }
  function enter(zone){if(zone===121){task.snapshot;jump.restore();return;}task.cancel();jump.cancel();}
  function tick(dt){if(!active())return;if(jump.busy)jump.tick(dt);else task.tick(dt);}
  function heightAt(x,z){const p=hero();return active()&&jump.busy&&Math.hypot(x-p.x,z-p.y)<.001?state().fieldHeight:null;}
  function blocked(x,z){if(!active())return null;if(task.busy||jump.busy)return true;const row=root.OpelucidChapter?.surfaceAt(121,x,z,state()?.fieldHeight??0);return !row||!!(row.flags&1);}
  function dispose(){task.cancel();jump.cancel();visual.release();if(installed&&root.NativeRailGates?.[121]===railGate)delete root.NativeRailGates[121];installed=false;}
  return {install,dispose,command,enter,tick,heightAt,blocked,task,jump,prepare:()=>visual.prepare(),release:()=>visual.release(),apply:renderer=>visual.apply(renderer),
   restore:()=>{if(active()){task.snapshot;jump.restore();}},sameLevel:n=>!active()||Math.abs((n.height??0)-(state()?.fieldHeight??0))<1.25,
   get busy(){return active()&&(task.busy||jump.busy);},get checkpointable(){return active()&&(task.busy||jump.busy);}};
 }
 const api={create};root.LeagueGymController=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
