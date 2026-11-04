/* IRBI Chargestone: overlay51 physical crystal actors + overlay21 original BCA.
 * Map behavior50 is the only magnet. Browser positions interpolate the original
 * 16/8/4 native-frame steps; collision always follows the current physical body.
 */
(function(root){
 function createController(options={}){
  const D=options.data||root.MISTRALTON_PUZZLE_DATA,state=options.state||(()=>root.NativeStory?.state),hero=options.player||(()=>player),direction=options.direction||(()=>facing/3),save=options.save||(()=>root.Journey?.save(true)),resetInput=options.resetInput||(()=>root.resetInput?.()),actors=options.actors||(()=>root.NativeStory?.visualActors?.()||[]),canStart=options.canStart||(()=>!root.NativeStory?.locked),grids=options.grids||(zone=>root.MistraltonChapter?.grids(zone)||root.MISTRALTON_SCENES?.[zone]?.permissionGrids||[]),audio=options.audio||((id,opts)=>root.AudioEngine?.playSound?.(id,opts));
  const ice=options.ice||root.MistraltonIce?.createController?.({...options,blocked:options.baseBlocked||((x,z)=>root.blocked?.(x,z)||root.NativeStory?.occupied?.(x,z))}),loaded=new Map(),instances=[],dirs=[[0,-1],[0,1],[-1,0],[1,0]],bodies=new Map(),miniMoves=new Map(),lockedFrames=new Map();
  let task=null,installed=false,motion=null,clock=0,attempt=null,entered=null,floorEffects=[];const floorSteps=new Map(),webFrames=new WeakMap();
  const finite=(n,a=-1e4,b=1e4)=>Number.isFinite(n)&&n>=a&&n<=b,isCave=zone=>!!D?.big?.[zone],zone=()=>state()?.zone,play=id=>{void audio(id);},near=(a,b)=>Math.abs(a-b)<1e-6;
  function tile(z,x,y){const gx=Math.floor(x),gz=Math.floor(y),g=grids(z).find(v=>gx>=v.x&&gx<v.x+32&&gz>=v.z&&gz<v.z+32);if(!g)return null;const p=8+((gz-g.z)*32+gx-g.x)*8,b=g.bytes;return {behavior:b[p]|b[p+1]<<8,blocked:!!(b[p+2]&1)};}
  function initial(z){return D.big[z].map(([x,h,y],index)=>({index,x:x+.5-16,z:y+.5-16,height:h}));}
  function bodyAt(z,x,y,except=-1){return list(z).find(c=>c.index!==except&&Math.abs(c.x-x)<.85&&Math.abs(c.z-y)<.85);}
  function npcAt(z,x,y){return z===zone()&&actors().some(a=>!a.gimmick&&(a.fieldZone===undefined||a.fieldZone===z)&&Math.abs(a.x-x)<.6&&Math.abs(a.y-y)<.6);}
  function scan(z,c,dx,dz,{limit=D.maxScan,bodies:trueBodies=true,npcs=true}={}){
   for(let step=1;step<=limit;step++){
    const x=c.x+dx*step,y=c.z+dz*step,t=tile(z,x+16,y+16);
    if(!t)return 0;
    if(t.blocked){return t.behavior===D.magneticBehavior?step-1:0;}
    if(trueBodies&&bodyAt(z,x,y,c.index)||npcs&&npcAt(z,x,y))return 0;
   }return 0;
  }
  function anchored(z,c){return dirs.some(([dx,dz])=>{const t=tile(z,c.x+16+dx,c.z+16+dz);return t?.blocked&&t.behavior===D.magneticBehavior;});}
  function validEndpoint(z,i,p){if(!Array.isArray(p)||p.length!==3||p.some(v=>!finite(v))||p[1]!==D.big[z][i][1])return false;const c=initial(z)[i],dx=p[0]-(c.x+15.5),dz=p[2]-(c.z+15.5);if(near(dx,0)&&near(dz,0))return true;if(!near(dx,Math.round(dx))||!near(dz,Math.round(dz))||dx&&dz)return false;const sx=Math.sign(dx),sz=Math.sign(dz),distance=Math.abs(dx||dz);return distance>0&&distance<D.maxScan&&scan(z,c,sx,sz,{bodies:false,npcs:false})===distance;}
  function nativeRecord(){const n=state();if(!n)return null;if(!n.mistraltonCrystals||typeof n.mistraltonCrystals!=='object'||Array.isArray(n.mistraltonCrystals))n.mistraltonCrystals={};return n;}
  function list(z=zone()){
   if(!isCave(z))return [];
   if(bodies.has(z))return bodies.get(z);
   const n=nativeRecord(),rows=n?.mistraltonCrystals[z],savedMotion=n?.mistraltonCrystalMotion;
   const result=initial(z).map(c=>{const p=Array.isArray(rows)?rows[c.index]:null;let valid=validEndpoint(z,c.index,p);
    if(!valid&&savedMotion?.zone===z&&savedMotion.index===c.index&&validMotion(savedMotion,false)){const m=savedMotion;valid=Array.isArray(p)&&p.length===3&&near(p[0],m.from[0]+m.dx*m.travel)&&near(p[2],m.from[2]+m.dz*m.travel)&&p[1]===m.from[1];}
    return valid?{...c,x:p[0]+.5-16,z:p[2]+.5-16,height:p[1]}:c;
   });bodies.set(z,result);write(z);return result;
  }
  function write(z=zone()){if(!isCave(z)||!bodies.has(z))return;nativeRecord().mistraltonCrystals[z]=bodies.get(z).map(c=>[c.x+15.5,c.height,c.z+15.5]);}
  function validMotion(m,checkCurrent=true){
   if(!m||!isCave(m.zone)||!Number.isInteger(m.index)||!D.big[m.zone][m.index]||!['move','fail'].includes(m.phase)||!dirs.some(v=>v[0]===m.dx&&v[1]===m.dz)||!finite(m.elapsed,0,120)||!finite(m.travel,0,31)||!Number.isInteger(m.distance)||m.distance<0||m.distance>=D.maxScan||!Array.isArray(m.from)||!Array.isArray(m.to)||m.from.length!==3||m.to.length!==3||!validEndpoint(m.zone,m.index,m.from))return false;
   if(m.from.some((v,i)=>v!==D.big[m.zone][m.index][i]))return false;
   if(m.to[0]!==m.from[0]+m.dx*m.distance||m.to[2]!==m.from[2]+m.dz*m.distance||m.to[1]!==m.from[1]||m.travel>m.distance)return false;
   if(m.phase==='move'&&(m.distance<1||!validEndpoint(m.zone,m.index,m.to)))return false;
   if(m.phase==='fail'&&(m.distance!==0||m.elapsed>failureSeconds()))return false;
   if(checkCurrent){const c=list(m.zone)[m.index];if(!near(c.x+15.5,m.from[0]+m.dx*m.travel)||!near(c.z+15.5,m.from[2]+m.dz*m.travel))return false;}
   return true;
  }
  const failureSeconds=()=>((D.models.big.frames?.[1]??44)+1)/D.tickRate;
  function isFieldObject(n){return !!D.web&&n?.model===D.web.model&&(n.fieldZone===D.web.zone||n.fieldZone===undefined&&zone()===D.web.zone);}
  function actorFrame(n){if(!isFieldObject(n))return null;n.fieldObject=true;n.noShadow=true;n.flip=false;return webFrames.get(n)??0;}
  function movement(n,code,elapsed=0){if(!isFieldObject(n)||code!==D.web.movement)return null;if(!finite(elapsed,0,3600))throw Error('Tempo animazione ragnatela non valido');let frameTime=Math.min(D.web.frames,elapsed*D.tickRate),frame=D.web.programs[1].steps.at(-1)[0];for(const [cell,hold]of D.web.programs[1].steps){frame=cell;if(frameTime<hold)break;frameTime-=hold;}webFrames.set(n,frame);n.frame=frame;actorFrame(n);return {duration:D.web.frames/D.tickRate,frame};}
  function persist(){write();const n=nativeRecord();if(!n)return;if(motion)n.mistraltonCrystalMotion={...motion,from:[...motion.from],to:[...motion.to]};else delete n.mistraltonCrystalMotion;}
  function restore(){bodies.clear();motion=null;attempt=null;floorEffects=[];floorSteps.clear();const n=nativeRecord();if(!n)return false;const m=n.mistraltonCrystalMotion;
   for(const z of Object.keys(D.big).map(Number))list(z);
   if(m&&m.zone===zone()&&validMotion(m))motion={...m,from:[...m.from],to:[...m.to]};else delete n.mistraltonCrystalMotion;
   ice?.restore?.();return !!motion||!!ice?.busy;
  }
  function install(){const assets=options.assets||root.OPENING_ASSETS;if(!assets)return;if(installed){for(const ins of instances){const scene=assets.scenes['zone'+ins.zone]||assets.scenes[ins.zone];if(scene&&!scene.instances.some(v=>v.model===ins.model))scene.instances.push(ins);}return;}Object.assign(assets.models,D.geometry);Object.assign(assets.textures,D.textures);
   function add(kind,z,i,p){const model=D.models[kind].model+'-'+z+'-'+i;assets.models[model]=D.geometry[D.models[kind].model];const ins={model,crystalKind:kind,crystalId:i,x:p[0]+.5-16,y:p[1],z:p[2]+.5-16,rotation:0,zone:z};instances.push(ins);const scene=assets.scenes['zone'+z]||assets.scenes[z];if(scene&&!scene.instances.some(v=>v.model===model))scene.instances.push(ins);}
   for(const z of Object.keys(D.big).map(Number)){D.big[z].forEach((p,i)=>{add('big',z,i,p);add('shadow',z,i,p);});D.mini[z].forEach((p,i)=>add('mini',z,i,[p[0],p[1]+.5,p[2]]));
    if(D.floor){const kind='floor',base=D.geometry[D.models.floor.model],model=D.models.floor.model+'-resources-'+z;assets.models[model]={groups:[...base.groups.map(g=>({...g,alpha:0})),...D.floor.keys.map(k=>({verts:[],texture:k.texture,alpha:0}))]};const ins={model,crystalKind:'floor-resources',x:0,y:0,z:0,rotation:0,zone:z};instances.push(ins);const scene=assets.scenes['zone'+z]||assets.scenes[z];if(scene&&!scene.instances.some(v=>v.model===model))scene.instances.push(ins);}
   }installed=true;
  }
  function prepare(){install();if(task)return task;task=Promise.all(Object.entries(D.models).map(async([k,m])=>{if(!loaded.has(k))loaded.set(k,await (options.loadGLB||root.StarterScene.loadGLB)(m.url));})).then(()=>true).catch(error=>{task=null;throw error;});return task;}
  function enter(z=zone()){floorEffects=[];floorSteps.clear();if(entered!==z){if(motion&&motion.zone!==z){motion=null;delete nativeRecord().mistraltonCrystalMotion;}attempt=null;miniMoves.clear();entered=z;}if(isCave(z))list(z);ice?.enter?.(z);}
  function start(c,dx,dz){const z=zone();if(motion)return true;if(anchored(z,c))return true;const key=[z,c.index,dx,dz].join(':'),p=hero();if(attempt?.key===key&&Math.hypot(p.x-attempt.x,p.y-attempt.z)<.25)return true;
   attempt={key,x:p.x,z:p.y};const distance=scan(z,c,dx,dz),from=[c.x+15.5,c.height,c.z+15.5];motion={zone:z,index:c.index,dx,dz,from,to:[from[0]+dx*distance,from[1],from[2]+dz*distance],distance,travel:0,elapsed:0,phase:distance?'move':'fail'};resetInput();persist();save();play(distance?1742:1370);return true;
  }
  function front(dx,dz,reach=1.3){const p=hero();return list().map(c=>({c,along:(c.x-p.x)*dx+(c.z-p.y)*dz,lateral:Math.abs((c.x-p.x)*dz-(c.z-p.y)*dx)})).filter(v=>v.along>=.48&&v.along<=reach&&v.lateral<=.36).sort((a,b)=>a.along-b.along)[0]?.c;}
  function touchMini(dx,dz){const p=hero(),x=Math.floor(p.x+16)+dx,z=Math.floor(p.y+16)+dz;D.mini[zone()].forEach((v,i)=>{const key=zone()+':'+i;if(v[0]===x&&v[2]===z&&!miniMoves.has(key))miniMoves.set(key,0);});}
  function tryStep(dx,dz){if(!isCave(zone())||motion||ice?.busy||!canStart())return !!motion;if(!dx&&!dz)return false;if(Math.abs(dx)>Math.abs(dz))dz=0;else dx=0;dx=Math.sign(dx);dz=Math.sign(dz);touchMini(dx,dz);const c=front(dx,dz,1.01);return c?start(c,dx,dz):false;}
  function interact(){if(isCave(zone())){if(motion)return true;if(!canStart())return false;const [dx,dz]=dirs[direction()]||dirs[0],c=front(dx,dz);touchMini(dx,dz);if(c)return start(c,dx,dz);}return ice?.interact?.()||false;}
  function floorHeight(x,z,fallback=0){if(options.height)return options.height(x,z)+.5;if(typeof renderer!=='undefined'&&renderer.groundHeight)return renderer.groundHeight(x,z)+.5;return fallback;}
  function trackFloor(moved){if(!D.floor||!isCave(zone()))return;const z=zone(),p=hero(),people=[{key:'hero',x:p.x,z:p.y,height:floorHeight(p.x,p.y),start:moved},...actors().filter(a=>!a.gimmick&&!a.hidden&&(a.fieldZone===undefined||a.fieldZone===z)).map(a=>({key:'actor:'+a.uid,x:a.x,z:a.y,height:floorHeight(a.x,a.y,(a.height??-.5)+.5)})),...list(z).map(a=>({key:'crystal:'+a.index,x:a.x,z:a.z,height:a.height}))];
   for(const a of people){if(!finite(a.x)||!finite(a.z))continue;const key=z+':'+a.key,cell=[Math.floor(a.x+16),Math.floor(a.z+16)].join(':'),last=floorSteps.get(key),distance=last?Math.hypot(last.x-a.x,last.z-a.z):0,moving=last?distance>1e-7&&distance<=1.01:a.start;if(moving&&(!last||cell!==last.cell)&&tile(z,a.x+16,a.z+16)?.behavior===D.floor.behavior){floorEffects.push({zone:z,x:a.x,z:a.z,height:a.height,elapsed:0});play(D.floor.sound);}floorSteps.set(key,{cell,x:a.x,z:a.z});}
  }
  function tick(dt,moved=false){if(!finite(dt,0,60))return;clock+=dt;ice?.tick?.(dt,moved);floorEffects=floorEffects.map(e=>({...e,elapsed:e.elapsed+dt})).filter(e=>e.zone===zone()&&e.elapsed*D.tickRate<D.floor.frames);if(motion&&zone()!==motion.zone){motion=null;delete nativeRecord().mistraltonCrystalMotion;attempt=null;}
   for(const [key,t]of miniMoves){const age=t+dt;if(age>=((D.models.mini.frames?.[1]??59)+1)/D.tickRate)miniMoves.delete(key);else miniMoves.set(key,age);}
   if(!motion){trackFloor(moved);return;}const m=motion,c=list(m.zone)[m.index];m.elapsed+=dt;
   if(m.phase==='move'){
    let frames=dt*D.tickRate;
    while(frames>1e-9&&m.travel<m.distance-1e-9){const cell=Math.floor(m.travel+1e-9),left=m.distance-cell,rate=left>4?D.movementFrames.far:left>2?D.movementFrames.middle:D.movementFrames.near,step=Math.min(1-(m.travel-cell),frames/rate);m.travel+=step;frames-=step*rate;}
    c.x=m.from[0]+.5-16+m.dx*m.travel;c.z=m.from[2]+.5-16+m.dz*m.travel;
   }
   if(m.phase==='move'&&m.travel>=m.distance-1e-8||m.phase==='fail'&&m.elapsed>=failureSeconds()){
    if(m.phase==='move'){c.x=m.to[0]+.5-16;c.z=m.to[2]+.5-16;lockedFrames.set(m.zone+':'+m.index,Math.floor(clock*D.tickRate)%((D.models.big.frames?.[0]??59)+1));play(1699);}motion=null;persist();resetInput();save();
   }else persist();trackFloor(moved);
  }
  function blocked(x,z){if(!isCave(zone()))return ice?.blocked?.(x,z)??null;return list().some(c=>Math.abs(c.x-x)<.45&&Math.abs(c.z-z)<.45)?true:null;}
  function canMove(x,z){return !motion&&!ice?.busy&&!blocked(x,z);}
  function command(name,args=[],values=args){return ice?.command?.(name,args,values)??false;}
  function reset(){motion=null;attempt=null;floorEffects=[];floorSteps.clear();miniMoves.clear();lockedFrames.clear();bodies.clear();const n=nativeRecord();if(n){n.mistraltonCrystals={};delete n.mistraltonCrystalMotion;}ice?.reset?.();save();}
  function apply(renderer){ice?.apply?.(renderer);if(!installed||!isCave(renderer.scene.zone))return;const z=renderer.scene.zone;
   for(const ins of instances){if(ins.zone!==z||ins.crystalKind==='floor-resources')continue;const kind=ins.crystalKind,id=ins.crystalId,key=z+':'+id,model=loaded.get(kind);let animation=0,frame=0;
    if(kind==='big'||kind==='shadow'){const c=list(z)[id];ins.x=c.x+D.bigOffset[0];ins.y=c.height+D.bigOffset[1];ins.z=c.z+D.bigOffset[2];if(kind==='big'){if(motion?.zone===z&&motion.index===id&&motion.phase==='fail'){animation=1;frame=Math.min(D.models.big.frames[1],Math.floor(motion.elapsed*D.tickRate));}else if(anchored(z,c))frame=lockedFrames.get(key)||0;else frame=Math.floor(clock*D.tickRate)%((D.models.big.frames[0]??59)+1);}}
    else{const moving=miniMoves.get(key);animation=moving===undefined?0:1;frame=moving===undefined?Math.floor(clock*D.tickRate)%((D.models.mini.frames[0]??119)+1):Math.floor(moving*D.tickRate);}
    if(!model||kind==='shadow')continue;const signature=[renderer.resourceEpoch,animation,frame].join(':');renderer.mistraltonCrystalFrames??=new Map();if(renderer.mistraltonCrystalFrames.get(ins.model)===signature&&renderer.models[ins.model])continue;
    const groups=root.FieldModels.geometry(model,{},animation,frame,16),gl=renderer.gl,old=renderer.models[ins.model]||[];renderer.models[ins.model]=groups.map((g,i)=>{const image=model.doc.images?.[model.doc.textures?.[g.textureIndex]?.source],stem=image?.uri?.split('/').pop().replace(/\.png$/,''),buf=old[i]?.buf||gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.verts),gl.DYNAMIC_DRAW);return {...g,buf,texture:D.models[kind].model+'-'+stem,count:g.verts.length/11};});for(const g of old.slice(groups.length))gl.deleteBuffer(g.buf);renderer.mistraltonCrystalFrames.set(ins.model,signature);
   }
   if(renderer.canvas)renderer.canvas.dataset.mistraltonPuzzles=JSON.stringify({crystals:list(z).map(c=>({index:c.index,x:c.x,z:c.z,anchored:anchored(z,c)})),motion,floorEffects});
  }
  function drawFloor(r){if(!D.floor||!isCave(r.scene.zone)||!floorEffects.length)return;const gl=r.gl,groups=r.models[D.models.floor.model+'-resources-'+r.scene.zone];if(!groups)return;const uniforms=['uSprite','uShadow','uExitEnabled','uRotation','uOffset','uAlpha'].map(k=>[k,gl.getUniform&&r.program?gl.getUniform(r.program,r.loc[k]):null]),cull=gl.isEnabled?.(gl.CULL_FACE),mode=gl.getParameter?.(gl.CULL_FACE_MODE);try{gl.uniform1f(r.loc.uSprite,0);gl.uniform1f(r.loc.uShadow,0);gl.uniform1f(r.loc.uExitEnabled,0);gl.uniform2f(r.loc.uRotation,1,0);
   for(const e of floorEffects){if(e.zone!==r.scene.zone)continue;const frame=Math.floor(e.elapsed*D.tickRate),texture=D.floor.keys.filter(k=>k.frame<=frame).at(-1).texture;gl.uniform3f(r.loc.uOffset,e.x,e.height,e.z);for(let i=0;i<D.geometry[D.models.floor.model].groups.length;i++){const m=groups[i],source=D.geometry[D.models.floor.model].groups[i];if(source.doubleSided===false){gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);}else gl.disable(gl.CULL_FACE);r.bind(m.buf);r.texture(r.cache[texture]||r.white,m.repeatS,m.repeatT,m.mirrorS,m.mirrorT);gl.uniform1f(r.loc.uAlpha,source.alpha??1);gl.drawArrays(gl.TRIANGLES,0,m.count);}}}finally{for(const [k,v]of uniforms)if(v!==null&&v!==undefined){if(k==='uRotation')gl.uniform2fv(r.loc[k],v);else if(k==='uOffset')gl.uniform3fv(r.loc[k],v);else gl.uniform1f(r.loc[k],v);}if(cull!==undefined){if(cull)gl.enable(gl.CULL_FACE);else gl.disable(gl.CULL_FACE);}if(mode!==undefined)gl.cullFace(mode);}
  }
  return {prepare,enter,restore,reset,tick,tryStep,interact,blocked,canMove,command,apply,drawFloor,actorFrame,movement,isFieldObject,crystals:list,scan,anchored,tile,get floorEffects(){return floorEffects;},get motion(){return motion;},get busy(){return !!motion||!!ice?.busy;},warps:(z,list)=>ice?.warps?.(z,list)||list,cameraOffset:()=>ice?.cameraOffset?.()||[0,0],applyCamera:renderer=>ice?.applyCamera?.(renderer)||(()=>{}),get ice(){return ice;}};
 }
 const api={createController};if(root.MISTRALTON_PUZZLE_DATA)Object.defineProperties(api,Object.getOwnPropertyDescriptors(createController()));root.MistraltonPuzzles=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
