/* Native cannon geometry/task with an HD-2D camera adapter. */
(function(root){
 function create(options={}){
  const D=options.data||root.ICIRRUS_GYM_DATA,state=options.state||(()=>root.NativeStory?.state),hero=options.hero||(()=>player),assets=options.assets||root.OPENING_ASSETS;
  const sound=options.sound||(id=>root.AudioEngine?.playSound(id)),save=options.save||(()=>root.Journey?.save(true));
  let installed=false,model=null,loading=null,lastZone=null;const instances=[];
  const active=()=>state()?.zone===108;
  function camera(kind,r){
   if(!r)return;if(kind==='save')r.cameraBase={pitch:Math.round(Math.asin(.423)*65536/(2*Math.PI)),yaw:0,distance:65};
   if(kind==='restore'||kind==='cancel'||kind==='invalid'){delete state().cannonCamera;return;}
   const route=D.routes[r.index][r.column],profile=D.profiles[route.profile],base=r.cameraBase||{pitch:4556,yaw:0,distance:65},p=hero();
   const entry=r.phase==='recoil'?0:r.phase==='enter'?r.enterFrame:profile[2];
   let pitch=root.IcirrusGymMotion.angle(base.pitch,profile[0],entry,profile[2]),yaw=root.IcirrusGymMotion.angle(base.yaw,profile[1],entry,profile[2]),distance=base.distance,target=[p.x,state().cannonHeight||0,p.y+1.5];
   if(r.phase==='flight'&&r.pathFrame<profile[3]&&r.shakeFrame>=8){
    if(!r.followEye){r.followEye=root.IcirrusGymMotion.create(D).orbit(pitch,yaw,distance,target);r.followStart=[...target];r.followFrame=r.pathFrame;}
    const elapsed=r.pathFrame-r.followFrame,duration=profile[3]-r.followFrame;
    target=target.map((v,i)=>root.IcirrusGymMotion.scalar(Math.round(r.followStart[i]*65536),Math.round(v*65536),elapsed,duration)/65536);
    const vector=r.followEye.map((v,i)=>v-target[i]);distance=Math.hypot(...vector);pitch=Math.round(Math.asin(vector[1]/distance)*65536/(2*Math.PI))&65535;yaw=Math.round(Math.atan2(vector[0],vector[2])*65536/(2*Math.PI))&65535;
   }
   if(['flight','settle','restore'].includes(r.phase)&&r.pathFrame>=profile[3]){
    r.returnBase??={...(state().cannonCamera||{pitch,yaw,distance})};const elapsed=r.pathFrame-profile[3];
    pitch=root.IcirrusGymMotion.angle(r.returnBase.pitch,base.pitch,elapsed,profile[4]);yaw=root.IcirrusGymMotion.angle(r.returnBase.yaw,base.yaw,elapsed,profile[4]);distance=root.IcirrusGymMotion.scalar(Math.round(r.returnBase.distance*65536),Math.round(base.distance*65536),elapsed,profile[4])/65536;
   }
   state().cannonCamera={target,pitch,yaw,distance,shake:r.shakeFrame===undefined||r.shakeFrame>=8?0:Math.sin(r.shakeFrame*Math.PI/2)*.12};
  }
  const task=root.IcirrusCannonTask.create({data:D,readState:state,hero,sound,camera,save});
  function install(){if(installed||!assets?.scenes.zone108)return;Object.assign(assets.models,D.geometry);Object.assign(assets.textures,D.textures);
   D.origins.forEach((p,index)=>{const key=D.model.key+'-'+index;assets.models[key]=D.geometry[D.model.key];const ins={model:key,x:p[0]-16,y:p[1],z:p[2]-16,rotation:D.orientations[index]*Math.PI/2,cannon:index};instances.push(ins);assets.scenes.zone108.instances.push(ins);});installed=true;
  }
  function prepare(){install();if(loading)return loading;loading=Promise.resolve().then(async()=>{model=await(options.loadGLB||root.StarterScene.loadGLB)(D.model.url);return true;}).catch(error=>{loading=null;throw error;});return loading;}
  function surface(x,z,h=state()?.cannonHeight||0){return root.IcirrusChapter?.surfaceAt(108,x,z,h);}
  function tryStep(dx,dz){if(!active())return false;if(task.busy)return true;
   const direction=Math.abs(dx)>Math.abs(dz)?dx>0?3:2:dz>0?1:0,p=hero(),[ux,uz]=[[0,-1],[0,1],[-1,0],[1,0]][direction],front=surface(p.x+ux,p.y+uz),here=surface(p.x,p.y);
   // Native0218af10 requires the solid front cell of a cannon.
   // The dispatch veto differs from the ordinary walking collision bit.
   const frontBlocked=!front||!(front.flags&1)||root.NativeStory?.occupied(p.x+ux,p.y+uz);
   const found=root.IcirrusGymMotion.create(D).activation(p.x,p.y,direction,{frontBlocked});if(found&&root.IcirrusContinuity?.cannonRide(found.index))return true;const started=task.start(direction,{frontBlocked});if(!started)return false;
   options.resetInput?.();if(!options.resetInput&&typeof resetInput==='function')resetInput();
   void started.then(()=>{if(active())state().fieldHeight=state().cannonHeight;});return true;
  }
  function blocked(x,z){if(!active())return null;if(task.busy)return true;const p=hero(),from=surface(p.x,p.y),to=surface(x,z);if(!to||to.flags&1)return true;
   const dx=Math.floor(x+16)-Math.floor(p.x+16),dz=Math.floor(z+16)-Math.floor(p.y+16);
   return !!(dx&&root.IcirrusGymMotion.edgeBlocked(from?.behavior,to.behavior,dx>0?3:2)||dz&&root.IcirrusGymMotion.edgeBlocked(from?.behavior,to.behavior,dz>0?1:0));
  }
  function tick(dt){if(!state())return;if(lastZone!==state().zone){if(task.busy&&state().zone!==108)task.cancel();lastZone=state().zone;}task.tick(dt);if(active()&&!task.busy){const p=hero(),h=surface(p.x,p.y);if(h)state().cannonHeight=state().fieldHeight=h.height;}}
  function enter(zone){lastZone=zone;if(zone!==108){if(task.busy)task.cancel();delete state().cannonCamera;return;}state().cannonHeight=state().fieldHeight??0;task.resume();}
  function restore(){if(active())return task.resume();return false;}
  function apply(renderer){if(renderer.scene.zone!==108||!model)return;for(const ins of instances){const index=ins.cannon,r=task.ride?.index===index?task.ride:root.IcirrusContinuity?.cannonRide(index),animation=r?.index===index?r.animation:0,frame=r?.index===index?r.animationFrame:0,sig=[renderer.resourceEpoch,animation,frame].join(':');renderer.cannonFrames??=new Map();if(renderer.cannonFrames.get(ins.model)===sig&&renderer.models[ins.model])continue;
    const metadata={materialAlpha:Object.fromEntries(Object.entries(D.materialAnimations[animation].materials).map(([key,value])=>[key,value.alpha]))},groups=root.FieldModels.geometry(model,metadata,animation,frame,16),gl=renderer.gl,old=renderer.models[ins.model]||[];
    renderer.models[ins.model]=groups.map((group,i)=>{const image=model.doc.images?.[model.doc.textures?.[group.textureIndex]?.source],stem=image?.uri?.split('/').pop().replace(/\.png$/,''),buf=old[i]?.buf||gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(group.verts),gl.DYNAMIC_DRAW);return {...group,buf,texture:D.model.key+'-'+stem,count:group.verts.length/11};});for(const group of old.slice(groups.length))gl.deleteBuffer(group.buf);renderer.cannonFrames.set(ins.model,sig);
   }if(renderer.canvas)renderer.canvas.dataset.cannons=JSON.stringify({height:state().cannonHeight,ride:task.ride||null,hidden:task.hidden,camera:state().cannonCamera||null});
  }
  function applyCamera(renderer){if(!active()||!state().cannonCamera)return ()=>{};const old={center:renderer.center,elevation:renderer.elevation,yaw:renderer.yaw,cameraPitch:renderer.cameraPitch,cameraDistance:renderer.cameraDistance},p=hero(),c=state().cannonCamera;
   const absent=Object.keys(old).filter(key=>!Object.hasOwn(renderer,key));renderer.center=[c.target[0],c.target[2]];renderer.elevation=c.target[1]+c.shake;renderer.cameraDistance=c.distance;renderer.yaw=c.yaw*Math.PI*2/65536;renderer.cameraPitch=[Math.sin(c.pitch*Math.PI*2/65536),Math.cos(c.pitch*Math.PI*2/65536)];
   return ()=>{Object.assign(renderer,old);for(const key of absent)delete renderer[key];};
  }
  return {prepare,install,enter,restore,tick,tryStep,blocked,apply,applyCamera,heroHeight:fallback=>active()?state().cannonHeight??fallback:fallback,cameraHeight:fallback=>active()?state().cannonHeight??fallback:fallback,sameLevel:n=>!active()||Math.abs((n.height||0)-(state().cannonHeight||0))<1.5,get hidden(){return active()&&task.hidden;},get busy(){return task.busy;},task};
 }
 const api={create};if(root.ICIRRUS_GYM_DATA)Object.defineProperties(api,Object.getOwnPropertyDescriptors(create()));root.IcirrusGym=api;
})(typeof window==='undefined'?globalThis:window);
