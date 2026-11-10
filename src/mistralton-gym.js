/* Clay Gym: IRBI overlay43/44 lift tables, original GLB/BTA/BCA assets.
 * World X/Z use native tiles minus16; height is native16.16 in tile units.
 * Commands await completion; rendering, carried actors and camera share height.
 */
(function(root){
 function createController(options={}){
  const D=options.data||root.MISTRALTON_GYM_DATA,state=options.state||(()=>root.NativeStory?.state),hero=options.player||(()=>player),actors=options.actors||(()=>root.NativeStory?.visualActors?.()||[]),save=options.save||(()=>root.Journey?.save(true)),run=options.run||(entry=>root.NativeStory?.run(entry)),direction=options.direction||(()=>facing/3),resetInput=options.resetInput||(()=>{if(typeof root.resetInput==='function')root.resetInput();}),loaded=new Map(),instances=[];
  let task=null,installed=false,ride=null,mainHeight=50,anteHeight=0;const resumedSounds=new Set(),audio=options.audio||((id,opts)=>root.AudioEngine?.playSound?.(id,opts)),sound=(id,opts)=>{void audio(id,opts);},stopAudio=options.stopAudio||(id=>root.AudioEngine?.stopSound?.(id)),barrierEnd=()=>D.models.barrier.frames?.[0]||300;
  const active=()=>[97,98].includes(state()?.zone),finite=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const floorBounds=D.floorBounds,stateMin=Math.floor(floorBounds.min),floorCells=new Map(D.floorSurface.cells),floorPlanes=D.floorSurface.planes,deepEndpoint=Math.min(...D.lifts[5].heights);
  // WB524 uses original Q12 normals/offsets. Keep its fixed-point division,
  // including the signed rounding, rather than flattening the native ramp.
  function floorHeightAt(x,z){
   if(!Number.isFinite(x)||!Number.isFinite(z))return null;const f=D.floorSurface,nx=x-f.offsetX,nz=z-f.offsetZ,gx=Math.floor(nx),gz=Math.floor(nz);
   if(gx<0||gz<0||gx>=f.width||gz>=f.depth)return null;const index=floorCells.get(gz*f.width+gx);if(index===undefined)return null;
   const [a,b,c,offset]=floorPlanes[index],qx=Math.round((nx-f.width/2)*65536),qz=Math.round((nz-f.depth/2)*65536),mul=(n,q)=>Math.floor((n*q+2048)/4096),numerator=-(offset+mul(a,qx)+mul(-c,qz));
   return Number(((BigInt(numerator)*4294967296n/BigInt(b))+524288n)>>20n)/65536;
  }
  function onFloor(h){return finite(h,stateMin,deepEndpoint+.05);}
  function floorPositionHeight(x,z,h){if(!onFloor(h))return h;for(let i=0;i<D.lifts.length;i++)if(Math.abs(level(i)-h)<.65&&inRect(x,z,D.lifts[i]))return level(i);return floorHeightAt(x,z)??h;}
  function record(){const n=state();if(!n)return null;if(!Array.isArray(n.clayLifts)||n.clayLifts.length!==6||n.clayLifts.some(v=>v!==0&&v!==1))n.clayLifts=[...D.initialStates];if(!finite(n.clayHeight,stateMin,55))n.clayHeight=n.zone===98?0:50;n.clayActors??={};return n;}
  const level=index=>D.lifts[index].heights[record()?.clayLifts[index]||0];
  function height(){if(!active())return undefined;const n=record();if(n.zone===97&&!ride){const p=hero();n.clayHeight=floorPositionHeight(p.x,p.y,n.clayHeight);}return n.clayHeight;}
  function inRect(x,z,r,pad=0){return x+16>=r.x+pad&&x+16<r.x+r.width-pad&&z+16>=r.z+pad&&z+16<r.z+r.depth-pad;}
  function actorHeight(n,fallback=n?.height??0){if(state()?.zone!==97||n?.fieldZone!==undefined&&n.fieldZone!==97)return fallback;if(ride?.carried.includes(n.uid))return ride.current;if(n.uid===0&&(n.model===89||n.name==='Rafan')){const p=D.floorSurface.leader;return floorHeightAt(n.x??p.x,n.y??p.z)??fallback;}const h=record().clayActors[n.uid];return finite(h,stateMin,55)?h:fallback;}
  function sameLevel(n){return state()?.zone!==97||Math.abs(actorHeight(n)-height())<1.5;}
  function install(){if(installed)return;const assets=options.assets||root.OPENING_ASSETS;if(!assets)return;Object.assign(assets.models,D.geometry);Object.assign(assets.textures,D.textures);
   function add(kind,id,p,zone){const model=D.models[kind].model+'-'+id;assets.models[model]=D.geometry[D.models[kind].model];const ins={model,gymModel:kind,gymId:id,x:p[0]-16,y:p[1],z:p[2]-16,rotation:0,zone};instances.push(ins);const scene=assets.scenes['zone'+zone]||assets.scenes[zone];if(scene&&!scene.instances.some(v=>v.model===model))scene.instances.push(ins);}
   D.origins.forEach((p,i)=>add('lift',i,p,97));add('main',0,D.mainOrigin,97);add('barrier',0,D.barrierOrigin,97);add('lift','ante',D.antechamberOrigin,98);installed=true;
  }
  function prepare(){install();if(task)return task;task=Promise.all(Object.entries(D.models).map(async([key,m])=>{if(!loaded.has(key))loaded.set(key,await (options.loadGLB||root.StarterScene.loadGLB)(m.url));})).then(()=>true).catch(error=>{task=null;throw error;});return task;}
  function enter(zone,entryHeight){if(ride&&ride.zone!==zone){ride.resolve?.(false);ride=null;stopAudio(1738);stopAudio(1754);}if(zone!==97)stopAudio(1741);const n=record();if(!n)return;if(zone===97){n.clayHeight=finite(entryHeight,stateMin,55)?entryHeight:50;mainHeight=50;}else if(zone===98){n.clayHeight=finite(entryHeight,-5,0)?entryHeight:0;anteHeight=n.clayHeight;}else{delete n.clayRide;return;}
   // Field map initialization clears native temporary flags. Rebuild the six
   // switch mirrors from persistent physical endpoints before scripts can read them.
   n.flags=[...n.flags.filter(v=>v<10||v>15),...D.lifts.flatMap((lift,i)=>level(i)===Math.min(...lift.heights)?[10+i]:[])];
   restore();height();}
  function resumeSound(id,offset){if(!finite(offset,.000001,11.9))return;const key=id+':'+offset;if(resumedSounds.has(key))return;resumedSounds.add(key);sound(id,{offset});}
  function restore(){const n=record();if(!n)return false;if(n.zone===97&&n.clayBarrier&&finite(n.clayBarrierFrame,.000001,barrierEnd()-.000001))resumeSound(1741,n.clayBarrierFrame/D.tickRate);const r=n.clayRide;if(!r)return false;
   if(![97,98].includes(r.zone)||r.zone!==n.zone||!['lift','main','ante'].includes(r.kind)||!finite(r.from,stateMin,55)||!finite(r.to,stateMin,55)||!finite(r.current,stateMin,55)||!finite(r.elapsed,0,1000)||!finite(r.speed,.1,20)||!Number.isInteger(r.index)||r.index<0||r.index>5||!['moving','barrier'].includes(r.phase)||r.phase==='barrier'&&!finite(r.pause,0,100/D.tickRate)||!Array.isArray(r.carried)||r.carried.some(id=>!Number.isInteger(id)||id<0||id>65535)){if(r.kind==='lift'&&Number.isInteger(r.index)&&D.lifts[r.index]&&r.hero!==false){n.clayHeight=level(r.index);for(const id of Array.isArray(r.carried)?r.carried:[])if(Number.isInteger(id))n.clayActors[id]=n.clayHeight;}delete n.clayRide;return false;}
   ride={...r,hero:r.hero!==false,carried:[...r.carried],resolve:null};if(ride.hero)n.clayHeight=r.current;if(r.kind==='main')mainHeight=r.current;if(r.kind==='ante')anteHeight=r.current;if(r.phase==='moving'){const age=finite(r.motorAge,0,12)?r.motorAge:r.kind==='lift'&&r.index===5&&r.from===50&&r.current<-40?r.elapsed-6-100/D.tickRate:r.elapsed;resumeSound(r.kind==='main'&&r.from===55||r.kind==='ante'&&r.from===-5?1754:1738,age);}return true;
  }
  function persist(){if(ride){const {resolve,...r}=ride;record().clayRide={...r,carried:[...r.carried]};}else delete record().clayRide;}
  function start(kind,index,from,to,speed){if(ride)return ride.promise||Promise.resolve(false);const n=record();if(!n)return Promise.resolve(false);resetInput();
   const platform=kind==='lift'?D.lifts[index]:null,p=hero(),carryHero=!platform||Math.abs(n.clayHeight-from)<1.5&&inRect(p.x,p.y,platform),carried=platform?actors().filter(a=>a.uid!==undefined&&Math.abs(actorHeight(a)-from)<1.5&&inRect(a.x,a.y,platform)).map(a=>a.uid):[];
   let resolve;const promise=new Promise(done=>resolve=done);ride={kind,index,zone:n.zone,from,to,current:from,speed,elapsed:0,motorAge:0,phase:'moving',hero:carryHero,carried,resolve};Object.defineProperty(ride,'promise',{value:promise,enumerable:false});if(carryHero)n.clayHeight=from;persist();save();sound(kind==='main'&&from===55||kind==='ante'&&from===-5?1754:1738);return promise;
  }
  function moveLift(index){if(!Number.isInteger(index)||index<0||index>5)throw Error('Elevatore di Rafan non valido: '+index);const n=record(),from=level(index),to=D.lifts[index].heights[1-n.clayLifts[index]];return start('lift',index,from,to,index===5?D.deepLiftSpeed:D.liftSpeed);}
  function advanceBarrier(dt){const n=record();if(!n||!n.clayBarrier||!finite(n.clayBarrierFrame,0,barrierEnd())||n.clayBarrierFrame>=barrierEnd())return;n.clayBarrierFrame=Math.min(barrierEnd(),n.clayBarrierFrame+dt*D.tickRate);if(n.clayBarrierFrame>=barrierEnd()){stopAudio(1741);save();}}
  function tick(dt){if(!finite(dt,0,60))return;const n=record();if(!n)return;if(!ride){if(n.zone===97){height();for(const actor of actors())if(actor.uid===0&&(actor.model===89||actor.name==='Rafan'))actor.height=actorHeight(actor);advanceBarrier(dt);}return;}const r=ride;if(n.zone!==r.zone){r.resolve?.(false);ride=null;delete n.clayRide;for(const id of [1738,1741,1754])stopAudio(id);return;}
   let remaining=dt,barrierTime=n.clayBarrier?dt:0;r.elapsed+=dt;if(r.phase==='moving')r.motorAge=(r.motorAge||0)+dt;
   while(remaining>1e-9){
    if(r.phase==='barrier'){const used=Math.min(remaining,Math.max(0,100/D.tickRate-r.pause));r.pause+=used;remaining-=used;if(r.pause+1e-8<100/D.tickRate)break;r.phase='moving';r.speed=D.liftSpeed;r.motorAge=remaining;sound(1738);}
    const sign=Math.sign(r.to-r.current),step=Math.min(Math.abs(r.to-r.current),remaining*r.speed),next=r.current+sign*step;
    if(r.kind==='lift'&&r.index===5&&sign<0&&!n.clayBarrier&&next<=-40){const used=(r.current+40)/r.speed;r.current=-40;r.phase='barrier';r.pause=0;r.motorAge=0;remaining-=used;n.clayBarrier=1;n.clayBarrierFrame=0;barrierTime=remaining;stopAudio(1738);sound(1739);sound(1741);}
    else{r.current=next;remaining=0;}
   }
   if(r.hero)n.clayHeight=r.current;if(r.kind==='main')mainHeight=r.current;if(r.kind==='ante')anteHeight=r.current;
   for(const id of r.carried){n.clayActors[id]=r.current;const actor=actors().find(a=>a.uid===id);if(actor)actor.height=r.current;}
   advanceBarrier(barrierTime);
   if(Math.abs(r.current-r.to)<1e-7&&r.phase==='moving'){if(r.kind==='lift'){n.clayLifts[r.index]=1-n.clayLifts[r.index];if(Array.isArray(n.flags)){const flag=10+r.index;n.flags=n.flags.filter(v=>v!==flag);if(r.to===Math.min(...D.lifts[r.index].heights))n.flags.push(flag);}}const done=r.resolve;ride=null;delete n.clayRide;resetInput();save();stopAudio(1738);stopAudio(1754);if(r.kind==='lift'||r.kind==='main'&&r.from===55||r.kind==='ante'&&r.from===-5)sound(1739);done?.(true);}else persist();
  }
  function blocked(x,z){if(state()?.zone!==97)return null;const h=height();if(ride)return true;
   function walkable(x,z){if(D.bridges.some(r=>Math.abs(r.height-h)<.65&&inRect(x,z,r)))return true;if(D.lifts.some((r,i)=>Math.abs(level(i)-h)<.65&&inRect(x,z,r)))return true;
    if(onFloor(h))return floorHeightAt(x,z)!==null;return false;}
   return [[-.12,-.12],[-.12,.12],[.12,-.12],[.12,.12]].some(([dx,dz])=>!walkable(x+dx,z+dz));
  }
  function interact(){if(state()?.zone!==97)return false;if(ride)return true;const n=record(),p=hero(),dir=direction(),[dx,dz]=[[0,-1],[0,1],[-1,0],[1,0]][dir]||[0,-1],background=(options.events||root.MISTRALTON_EVENTS)?.zones[97]?.background||[];
   const b=background.filter(b=>Math.abs(b.y/16-n.clayHeight)<1.5).map(b=>({b,x:b.x+.5-16,z:b.z+.5-16})).map(v=>({...v,along:(v.x-p.x)*dx+(v.z-p.y)*dz,lateral:Math.abs((v.x-p.x)*dz-(v.z-p.y)*dx)})).filter(v=>v.along>.05&&v.along<1.9&&v.lateral<.9).sort((a,b)=>a.along-b.along)[0];
   if(!b)return false;resetInput();void run(b.b.script-1);return true;
  }
  function command(name,args=[],values=args){if(!active())return false;const n=record(),zone=n.zone,ready=fn=>prepare().then(()=>state()?.zone===zone?fn():true).then(()=>true);switch(name){
   case 'NativeOpcode394':return ready(()=>{n.clayLifts=[...D.initialStates];n.clayHeight=mainHeight=55;});
   case 'NativeOpcode395':return ready(()=>{n.clayHeight=anteHeight=-5;});
   case 'NativeOpcode400':return ready(()=>moveLift(values[0]));
   case 'NativeOpcode401':return ready(()=>start('main',0,values[0]?50:55,values[0]?55:50,D.mainSpeed));
   case 'NativeOpcode402':return ready(()=>start('ante',0,values[0]?0:-5,values[0]?-5:0,D.mainSpeed));
   case 'NativeOpcode437':n.clayCamera=2;return true;
   case 'NativeOpcode438':n.clayCamera=3;return true;
   default:return false;
  }}
  function apply(renderer){if(!installed||![97,98].includes(renderer.scene.zone))return;const n=record();for(const ins of instances){if(ins.zone!==renderer.scene.zone)continue;const model=loaded.get(ins.gymModel);if(!model)continue;let animation=0,frame=0;
    if(ins.gymModel==='lift'){if(ins.gymId==='ante'){ins.y=anteHeight;animation=ride?.kind==='ante'&&ride.to<ride.from?0:1;frame=ride?.kind==='ante'?ride.elapsed*D.tickRate:0;}else{ins.y=ride?.kind==='lift'&&ride.index===ins.gymId?ride.current:level(ins.gymId);animation=n.clayLifts[ins.gymId]^D.texturePolarity[ins.gymId];frame=ride?.kind==='lift'&&ride.index===ins.gymId?ride.elapsed*D.tickRate:0;}}
    if(ins.gymModel==='main'){ins.y=mainHeight;animation=ride?.kind==='main'&&ride.to>ride.from?1:0;frame=ride?.kind==='main'?ride.elapsed*D.tickRate:0;}
    if(ins.gymModel==='barrier')frame=n.clayBarrier?(n.clayBarrierFrame??Infinity):0;
    const end=Math.max(1,...(model.animationSets[animation]||[]).map(t=>(t.times.at(-1)||0)*60));frame=Math.min(end,Math.floor(frame));const sig=[renderer.resourceEpoch,animation,frame].join(':');renderer.clayGymFrames??=new Map();if(renderer.clayGymFrames.get(ins.model)===sig&&renderer.models[ins.model])continue;
    const groups=root.FieldModels.geometry(model,{},animation,frame,16),gl=renderer.gl,old=renderer.models[ins.model]||[];renderer.models[ins.model]=groups.map((g,i)=>{const im=model.doc.images?.[model.doc.textures?.[g.textureIndex]?.source],stem=im?.uri?.split('/').pop().replace(/\.png$/,''),buf=old[i]?.buf||gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.verts),gl.DYNAMIC_DRAW);return {...g,buf,texture:D.models[ins.gymModel].model+'-'+stem,count:g.verts.length/11};});for(const g of old.slice(groups.length))gl.deleteBuffer(g.buf);renderer.clayGymFrames.set(ins.model,sig);
   }if(renderer.canvas)renderer.canvas.dataset.clayGym=JSON.stringify({height:height(),lifts:n.clayLifts,ride:n.clayRide||null,barrier:!!n.clayBarrier});
  }
  function reset(){ride?.resolve?.(false);ride=null;for(const id of [1738,1741,1754])stopAudio(id);const n=record();if(n){n.clayLifts=[...D.initialStates];n.clayActors={};n.clayHeight=n.zone===98?0:50;if(n.clayBarrier)n.clayBarrierFrame=barrierEnd();if(Array.isArray(n.flags))n.flags=[...n.flags.filter(v=>v<10||v>15),...D.initialFlags.flatMap((v,i)=>v?[10+i]:[])];delete n.clayRide;}mainHeight=50;anteHeight=0;}
  return {prepare,enter,restore,reset,tick,blocked,interact,command,apply,actorHeight,sameLevel,moveLift,level,floorHeightAt,floorBounds,heroHeight:fallback=>height()??fallback,cameraHeight:fallback=>height()??fallback,get busy(){return !!ride;},get ride(){return ride;}};
 }
 const api={createController};if(root.MISTRALTON_GYM_DATA)Object.defineProperties(api,Object.getOwnPropertyDescriptors(createController()));root.MistraltonGym=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
