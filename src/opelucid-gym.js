/* The native scripts own puzzle order; the field host owns continuous movement. */
(function(root){
 function create(options={}){
  const state=options.state||(()=>root.NativeStory?.state),hero=options.hero||(()=>player),direction=options.direction||(()=>facing/3),face=options.face||(d=>{facing=d*3;}),save=options.save||(()=>root.Journey?.save(true)),resetInput=options.resetInput||(()=>root.resetInput?.()),active=()=>state()?.zone===114;
  const task=root.OpelucidGymTask.create({data:root.OPELUCID_GYM_DATA,state,save,sound:id=>root.AudioEngine?.playSound(id),stopSound:id=>root.AudioEngine?.stopSound(id)});
  const visual=root.OpelucidGymRenderer.create({task}),rails=root.OpelucidIceRails.create({puzzle:task,state,hero,save,resetInput});
  const surface=(x,z)=>root.OpelucidChapter?.surfaceAt(114,x,z,state()?.fieldHeight??0);
  function blocked(x,z){if(!active())return null;if(task.busy||rails.busy)return true;const row=surface(x,z);return !row||!!(row.flags&1);}
  const ice=root.MistraltonIce.createController({iceZone:114,slideKey:'brycenIceSlide',state,player:hero,direction,save,resetInput,grids:()=>root.OpelucidChapter.grids(114),canStart:()=>!task.busy&&!rails.busy&&!root.NativeStory?.locked,blocked:(x,z)=>blocked(x,z)||root.NativeStory?.occupied(x,z)});
  function triggerDirection(){const p=hero(),height=state()?.fieldHeight??0,route=root.OPELUCID_GYM_ROUTES.entries.find(r=>Math.floor(p.x+16)===r.tile[0]&&Math.floor(p.y+16)===r.tile[2]&&Math.abs(height-r.tile[1])<.25);if(route){face(route.direction);resetInput();}return route?.direction;}
  async function command(name,args,values=args){
   if(!active())return false;
   if(name==='NativeOpcode403'){await task.begin('switch',values[0]);return true;}
   if(name==='NativeOpcode404'){await task.begin('platform',values[0]);return true;}
   if(name==='NativeOpcode119'){triggerDirection();return true;} // IRBI21b1d80 searches directional trigger then turns the player.
   if(name==='NativeOpcode405'){const ride=rails.startGate(values[0],2,direction());if(ride)ice.reset();return true;} // Native405 rebinds movement and returns; the field task continues independently.
   return false;
  }
  function tick(dt,moved=false){task.tick(dt);if(!active()){if(rails.busy)rails.cancel();ice.enter(state()?.zone);return;}if(rails.busy){const p=hero(),x=p.x,z=p.y;rails.tick(dt);const dx=p.x-x,dz=p.y-z;if(Math.hypot(dx,dz)>1e-7)face(Math.abs(dx)>Math.abs(dz)?dx>0?3:2:dz>0?1:0);return;}
   const p=hero();for(const route of root.OPELUCID_GYM_ROUTES.automatic){const a=root.NativeRails.position(114,route.line,0);if(Math.hypot(p.x+16-a.x,p.y+16-a.z)<.5&&Math.abs((state().fieldHeight??0)-a.height)<.25&&moved){const started=rails.startAutomatic(route.line,direction());if(started){ice.reset();rails.tick(dt);return;}}}
   if(!task.busy)ice.tick(dt,moved);
  }
  function enter(zone){if(zone!==114){if(task.busy)task.cancel();if(rails.busy)rails.cancel();ice.enter(zone);return;}task.snapshot;rails.restore();ice.enter(zone);}
  return {prepare:()=>visual.prepare(),release:()=>visual.release(),apply:r=>visual.apply(r),command,tick,enter,restore:()=>{if(active()){rails.restore();ice.restore();}},blocked,task,rails,ice,heightAt:(x,z)=>active()&&rails.busy&&Math.hypot(x-hero().x,z-hero().y)<.001?state().fieldHeight:null,sameLevel:n=>!active()||Math.abs((n.height??0)-(state()?.fieldHeight??0))<1.25,get busy(){return active()&&(task.busy||rails.busy||ice.busy);},get checkpointable(){return active()&&(rails.busy||ice.busy);}};
 }
 const api={create};Object.defineProperties(api,Object.getOwnPropertyDescriptors(create()));root.OpelucidGym=api;
})(typeof window==='undefined'?globalThis:window);
