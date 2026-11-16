/* Original sprite parts staged in the 3D world. One pinned Pokémon bank and
 * one reusable 1 MiB GPU card per renderer; no accumulating frame textures. */
(function(root){
 let bank=null,pending=null,generation=0,action=null;
 const cards=new WeakMap(),native=()=>root.NativeStory?.state||root.Journey?.state.original;
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 function graphic(mon){return root.PokemonVisuals.graphic(mon);}
 function alpha(image){const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const x=c.getContext('2d');x.drawImage(image,0,0);return root.ROM_SPRITE_ANIM.alphaBounds(x.getImageData(0,0,c.width,c.height).data,c.width,c.height)||[0,0,c.width,c.height];}
 async function prepare(mon,move){
  const profile=root.FieldHMProfiles.profile(mon,move);if(!profile)throw Error('Animazione MN sul campo non disponibile per '+(mon.nickname||mon.name));
  const key=graphic(mon);if(bank?.graphic===key&&(![19,57].includes(move)||bank.sitting)){bank.mon=mon;return bank;}
  if(pending?.graphic===key)return pending.promise;
  const ticket=++generation,keys=[key+'-front',key+'-back'],release=root.ROM_SPRITE_ANIM.pin(keys);
  const promise=(async()=>{try{
   if([19,57].includes(move)&&!root.SURF_FIELD_ASSETS)await root.SurfField?.prepareRiderAssets();
   await root.ROM_SPRITE_ANIM.prepare(keys,{gate:false});
   const sources=[root.OPENING_SPRITES?.Alcide||root.ROM_SPRITES?.Alcide,root.SURF_FIELD_ASSETS?.sprites.AlcideSurf];
   const images=await Promise.all(sources.map(async frames=>frames?Promise.all([0,3,6,9].map(async i=>{const image=await root.RuntimeAssets.image(frames[i]);return {image,bounds:alpha(image)};})):null));
   if(ticket!==generation)throw Error('Preparazione MN sostituita');
   const previous=bank;bank={graphic:key,mon,displayMon:{...mon},standing:images[0],sitting:images[1],release};previous?.release();return bank;
  }catch(error){release();throw error;}finally{if(pending?.ticket===ticket)pending=null;}})();
  pending={graphic:key,promise,ticket};return promise;
 }
 function swimmer(){const n=native(),party=root.Journey?.state.party||[];return party[n?.surfUserIndex]||party.find(p=>!p.egg&&p.pp?.some(m=>m.id===57));}
 function surfReady(){const mon=swimmer();return !!mon&&bank?.graphic===graphic(mon)&&!!bank.sitting&&!!root.FieldHMProfiles.profile(mon,57);}
 function surfRenderable(){return !!swimmer()&&!!bank&&!!root.FieldHMProfiles.profile(bank.displayMon,57);}
 function dispose(renderer){const card=cards.get(renderer);if(!card)return;if(renderer.gl.isTexture(card.texture.texture))renderer.gl.deleteTexture(card.texture.texture);cards.delete(renderer);}
 function cardFor(renderer){let card=cards.get(renderer);if(card&&!renderer.gl.isTexture(card.texture.texture)){cards.delete(renderer);card=null;}if(!card){const canvas=document.createElement('canvas');canvas.width=canvas.height=512;card={canvas,context:canvas.getContext('2d'),texture:renderer.upload(canvas,true)};cards.set(renderer,card);}return card;}
 function bodyPose(p,s){return {fieldHM:true,graphic:p.graphic,species:p.species,dir:-1,crouch:s.crouch,lean:s.lean,head:s.head,arms:s.arms,feet:s.feet,tail:s.tail,wings:s.wings,sideHeads:s.sideHeads,jets:s.jets};}
 function seatLocal(s){return {x:Math.sin(s.lean)*s.seat/s.bodyScaleY*s.bodyScaleX*(s.flip?-1:1),y:Math.cos(s.lean)*s.seat};}
 function seatPoint(position,s,renderer){const a=seatLocal(s),pitch=renderer.cameraPitch||[.423,.906],yaw=renderer.yaw||0;return {x:position.x+a.x*Math.cos(yaw)-a.y*pitch[0]*Math.sin(yaw),z:position.z-a.x*Math.sin(yaw)-a.y*pitch[0]*Math.cos(yaw),height:position.height+a.y*pitch[1]};}
 function paint(renderer,p,s,time,{rider=true,standing=false,scale=1,ball=null}={}){
  const card=cardFor(renderer),c=card.context;card.rider=null;c.clearRect(0,0,512,512);c.imageSmoothingEnabled=false;
  c.save();c.translate(256,384);c.scale(scale,scale);c.translate(-256,-384);
  c.save();c.translate(256,384);c.scale((s.flip?-1:1)*s.bodyScaleX,s.bodyScaleY);c.rotate(s.lean);c.translate(-256,-384);
  if(s.jets>0){const anchors=root.FieldHMChoreography.anatomy(p.graphic)?.jetAnchors?.[s.back?'back':'front'];if(!anchors)throw Error('Contatti propulsori MN non verificati');for(const [u,v]of anchors){const x=Math.round(256+u*s.height*64),length=Math.round((18+4*Math.sin(time*35))*s.jets),y=Math.round(384-(v+Math.max(0,-s.feet)*.03)*s.height*64);c.fillStyle='#4088c8';c.fillRect(x-4,y,8,length);c.fillStyle='#a7eaff';c.fillRect(x-2,y,4,Math.round(length*.8));c.fillStyle='#fff9d5';c.fillRect(x-1,y,2,Math.round(length*.5));}}
  if(!root.ROM_SPRITE_ANIM.draw(c,p.graphic,s.back,256,384,s.height*64/80,0,true,bodyPose(p,s,time)))throw Error('Sprite MN non preparato');c.restore();
  if(rider){const direction=s.direction,row=(standing?bank.standing:bank.sitting||bank.standing)?.[direction];if(row){const [l,t,r,b]=row.bounds,h=standing?1.75:1.5,w=h*(r-l)/(b-t),contact=seatLocal(s),seatX=256+contact.x*64,seatY=384-contact.y*64,source=[l,t,r-l,b-t],destination=[seatX-w*32,seatY-h*64,w*64,h*64];c.drawImage(row.image,...source,...destination);card.rider={image:row.image,source,destination,scale};}}
  // Only the lower28% may pass behind the near-side body. Repainting the
  // whole silhouette here used to hide the rider's head/torso on large flyers.
  if(card.rider&&!s.back){const [,top,,height]=card.rider.destination,legs=Math.ceil(top+height*.72);c.save();c.beginPath();c.rect(0,legs,512,512-legs);c.clip();c.translate(256,384);c.scale((s.flip?-1:1)*s.bodyScaleX,s.bodyScaleY);c.rotate(s.lean);c.translate(-256,-384);root.ROM_SPRITE_ANIM.draw(c,p.graphic,s.back,256,384,s.height*64/80,0,true,bodyPose(p,s,time));c.restore();}
  c.restore();
  if(ball&&scale<1){const [x,y]=ball;c.strokeStyle='#ff8d9c';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(256,384-s.height*s.bodyScaleY*scale*32);c.stroke();c.fillStyle='#f5f2df';c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.fill();c.fillStyle='#bb3749';c.beginPath();c.arc(x,y,4,Math.PI,Math.PI*2);c.fill();c.strokeStyle='#283b43';c.lineWidth=1;c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.moveTo(x-4,y);c.lineTo(x+4,y);c.stroke();}
  if(p.move===15&&s.contact){c.strokeStyle='#f3f8cf';c.lineWidth=3;c.beginPath();c.arc(256+(s.flip?1:-1)*s.height*20,384-s.height*36,s.height*24,-1.2,.9);c.stroke();}
  const gl=renderer.gl;gl.bindTexture(gl.TEXTURE_2D,card.texture.texture);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,card.canvas);card.pose={graphic:p.graphic,move:p.move,phase:s.phase,choreography:s.choreography,bodyScaleX:s.bodyScaleX,bodyScaleY:s.bodyScaleY,seat:s.seat};return card.texture;
 }
 function present(renderer,time,actors){
  if(renderer.contextLost||renderer.gl?.isContextLost?.())return actors;
  const original=actors.find(a=>a.hero||a.name==='Alcide'||a.name==='AlcideSurf');if(!original)return actors;
  let mon,move,sample,position,rider=true,scale=1;
  if(action){if(action.zone!==native()?.zone&&!action.transfer)return actors;({mon,move}=action);const p=root.FieldHMProfiles.profile(mon,move),t=clamp(action.elapsed/action.duration);const viewDirection=root.NativeRails&&renderer.yaw?root.NativeRails.screenDirection(action.direction,renderer.yaw):action.direction;sample=root.FieldHMProfiles.sample(p,time,{phase:action.phase,progress:t,direction:viewDirection});position={x:original.x,z:original.z,height:action.height};
   if(move===19){
    const departing=action.phase==='depart',flight=departing?ease(clamp((t-.35)/.65)):1-ease(clamp(t/.65));position.height+=flight*96;
    const boarding=departing?ease(clamp((t-.15)/.2)):1-ease(clamp((t-.65)/.2));rider=departing?t>=.35:t<=.65;
    if(!rider){const ground={x:original.x,z:original.z,height:action.height+.04},contact=seatPoint({...position,height:position.height+sample.bob},sample,renderer);original.name='Alcide';original.frame=viewDirection*3;original.x=ground.x+(contact.x-ground.x)*boarding;original.z=ground.z+(contact.z-ground.z)*boarding;original.height=ground.height+(contact.height-ground.height)*boarding+Math.sin(boarding*Math.PI)*.5;original.groundHeight=action.height;original.groundX=ground.x;original.groundZ=ground.z;original.shadowAlpha=1/(1+Math.max(0,original.height-action.height)**2);}
    scale=departing?ease(t/.15):1-ease(clamp((t-.85)/.15));
   }
   else {rider=false;const travel=ease(clamp((t-.12)/.2))*(1-ease(clamp((t-.73)/.2))),dx=action.target.x-original.x,dz=action.target.y-original.z,distance=Math.hypot(dx,dz),approach=Math.max(0,distance-.65)/Math.max(.01,distance);position.x+=dx*approach*travel;position.z+=dz*approach*travel;scale=t<.12?ease(t/.12):t>.9?1-ease((t-.9)/.1):1;
    const [vx,vz]=[[0,-1],[0,1],[-1,0],[1,0]][action.direction];if(action.canRetreat===undefined)action.canRetreat=[.25,.5,.75,.95].every(step=>{const x=original.x-vx*step,z=original.z-vz*step;return typeof blocked==='function'&&!blocked(x-.18,z-.18)&&!blocked(x+.18,z+.18)&&!root.NativeStory?.occupied(x,z)&&Math.abs(renderer.groundHeight(x,z)-action.height)<.25;});
    if(action.canRetreat){const back=ease(t/.2)*(1-ease((t-.82)/.18));original.x-=vx*.95*back;original.z-=vz*.95*back;original.groundX=original.x;original.groundZ=original.z;if(t<.2||t>.82)original.frame=action.direction*3+1+Math.floor(time*8)%2;}
   }
  }else if(root.SurfField?.mounted()&&surfRenderable()){
   mon=surfReady()?swimmer():bank.displayMon;move=57;const p=root.FieldHMProfiles.profile(mon,move),n=native(),motion=n.surfMotion;
   const isMoving=typeof moving==='undefined'?true:moving,phase=motion?(motion.landing?'land':'board'):(isMoving?'swim':'idle');
   if(bank.loopPhase!==phase){bank.poseFade=bank.lastSample?{from:bank.lastSample,start:time}:null;bank.loopPhase=phase;bank.loopStart=time;}
   const progress=motion?(motion.phase==='wait'?.2*motion.wait/16:motion.phase==='recall'?.7+.3*motion.wait/16:motion.landing?.7*motion.travel:.2+.8*motion.travel):0;
   sample=root.FieldHMProfiles.sample(p,time-bank.loopStart,{phase,progress,direction:Math.floor((original.frame%12)/3),moving:isMoving});if(bank.poseFade){const q=ease(clamp((time-bank.poseFade.start)/.12));for(const key of [...root.FieldHMChoreography.channels,'bob'])sample[key]=bank.poseFade.from[key]+(sample[key]-bank.poseFade.from[key])*q;root.FieldHMProfiles.fit(p,sample);if(q===1)bank.poseFade=null;}bank.lastSample={...sample};position={x:original.x,z:original.z,height:n.fieldHeight||0};
   if(motion){const water=motion.landing?motion.from:motion.to;position={x:water.x,z:water.y,height:water.height};rider=false;
    const t=motion.phase==='wait'?0:motion.travel,mount=motion.landing?1-t:t,contact=seatPoint({...position,height:position.height+sample.bob},sample,renderer),ground={x:original.x,z:original.z};
    original.x+=(contact.x-water.x)*mount;original.z+=(contact.z-water.y)*mount;original.height=(n.fieldHeight||0)+(contact.height-water.height)*mount+Math.sin(Math.PI*t)*.7+.04*(1-mount);original.name='Alcide';original.frame=motion.direction*3;original.noShadow=false;original.groundHeight=n.fieldHeight||0;original.groundX=ground.x;original.groundZ=ground.z;
    if(!motion.landing&&motion.phase==='wait')scale=ease(motion.wait/16);
    if(motion.phase==='recall')scale=1-ease(motion.wait/16);
   }
  }else {dispose(renderer);if(!root.SurfField?.mounted()){bank?.release();bank=null;}return actors;}
  const p=root.FieldHMProfiles.profile(mon,move);if(bank?.graphic!==graphic(mon))return actors;
  position.height+=sample.bob||0;
  let ball=null;if(!rider&&scale<1){const heroHeight=(action?.height??native()?.fieldHeight??position.height)+1.1,q=1-scale;position={x:position.x+(original.x-position.x)*q,z:position.z+(original.z-position.z)*q,height:position.height+(heroHeight-position.height)*q-sample.height*sample.bodyScaleY*scale*q*.5};const pitch=renderer.cameraPitch||[.423,.906],yaw=renderer.yaw||0,dx=original.x-position.x,dz=original.z-position.z;ball=[256+(dx*Math.cos(yaw)-dz*Math.sin(yaw))*64,384-((heroHeight-position.height)*pitch[1]-(dx*Math.sin(yaw)+dz*Math.cos(yaw))*pitch[0])*64/Math.max(.1,pitch[1])];}
  const texture=paint(renderer,p,sample,move===15?action.elapsed/action.duration:time,{rider,scale,ball});
  const actor={name:'Alcide',fieldHM:true,texture,hero:true,...placement(position,renderer.cameraPitch,0,renderer.yaw||0),...(action?{groundHeight:action.height,shadowAlpha:1/(1+Math.max(0,position.height-action.height)**2)}:{}),worldWidth:8,worldHeight:8,nativeBillboard:true,noShadow:move===57||scale<1,frame:0};
  return [...actors.filter(a=>a!==original||!rider),actor];
 }
 function inspectCard(renderer){
  const card=cards.get(renderer);if(!card)return null;const pixels=card.context.getImageData(0,0,512,512).data;let riderUpperPixels=0,riderUpperVisible=0,riderUpperExactVisible=0;
  // This diagnostic runs only when QA explicitly inspects a painted card.
  // Ordinary frames allocate no mask canvas and never read these pixels back.
  if(card.rider?.scale===1){
   // Keep diagnostic rasterization separate from the live card backend.
   if(!card.riderMask){const canvas=document.createElement('canvas');canvas.width=canvas.height=512;card.riderMask={canvas,context:canvas.getContext('2d',{willReadFrequently:true})};}
   const {image,source,destination}=card.rider,m=card.riderMask.context;m.clearRect(0,0,512,512);m.imageSmoothingEnabled=false;m.drawImage(image,...source,...destination);
   const expected=m.getImageData(0,0,512,512).data,[left,top,width,height]=destination,x0=Math.max(0,Math.floor(left)),x1=Math.min(512,Math.ceil(left+width)),y0=Math.max(0,Math.floor(top)),y1=Math.min(512,Math.ceil(top+height*.72));
   // Chrome CPU/GPU nearest sampling differs nonuniformly by up to1 card
   // pixel at fractional sprite positions. This QA-only match allows that
   // Chebyshev1px neighbourhood; it is not an exact physically visible ratio
   // and cannot certify an occluded strip as thin as that raster tolerance.
   for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
    const i=(y*512+x)*4;if(expected[i+3]<250)continue;riderUpperPixels++;
    if(pixels[i+3]>=250&&Math.abs(expected[i]-pixels[i])<=2&&Math.abs(expected[i+1]-pixels[i+1])<=2&&Math.abs(expected[i+2]-pixels[i+2])<=2){riderUpperExactVisible++;riderUpperVisible++;continue;}
    let visible=false;for(let dy=-1;dy<=1&&!visible;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||xx>=512||yy<0||yy>=512)continue;const j=(yy*512+xx)*4;if(pixels[j+3]>=250&&Math.abs(expected[i]-pixels[j])<=2&&Math.abs(expected[i+1]-pixels[j+1])<=2&&Math.abs(expected[i+2]-pixels[j+2])<=2){visible=true;break;}}if(visible)riderUpperVisible++;
   }
  }
  return {...card.pose,alphaBounds:root.ROM_SPRITE_ANIM.alphaBounds(pixels,512,512),riderUpperPixels,riderUpperVisible,riderUpperVisibleFraction:riderUpperPixels?riderUpperVisible/riderUpperPixels:null,riderUpperExactVisible,riderUpperExactVisibleFraction:riderUpperPixels?riderUpperExactVisible/riderUpperPixels:null,riderRasterTolerancePx:1};
 }
 function copyCard(renderer,context,...rect){const card=cards.get(renderer);if(!card)return false;context.drawImage(card.canvas,...rect);return true;}
 function placement(position,pitch=[.423,.906],bob=0,yaw=0){return {x:position.x+2*pitch[0]*Math.sin(yaw),z:position.z+2*pitch[0]*Math.cos(yaw),height:position.height+bob-2*pitch[1],groundHeight:position.height,groundX:position.x,groundZ:position.z};}
 function cameraFor(base=[.423,.906]){if(action?.move!==15)return base;const t=clamp(action.elapsed/action.duration),amount=ease(t/.18)*(1-ease((t-.82)/.18)),angle=Math.atan2(base[0],base[1]),target=Math.max(angle,62*Math.PI/180),pitch=angle+(target-angle)*amount;return [Math.sin(pitch),Math.cos(pitch)];}
 function applyCamera(renderer){const base=renderer.cameraPitch;if(action?.move!==15)return ()=>{};renderer.cameraPitch=cameraFor(base);return ()=>{renderer.cameraPitch=base;};}
 function tick(dt){if(!action||document.hidden)return;if(action.zone!==native()?.zone&&!action.transfer){const old=action;action=null;old.reject(Error('Scena MN sostituita'));return;}if(action.done)return;action.elapsed=Math.min(action.duration,action.elapsed+Math.max(0,dt));if(action.onContact&&!action.committed&&action.elapsed/action.duration>=.52){action.committed=true;try{action.onContact();}catch(error){const old=action;action=null;old.reject(error);return;}}if(action.elapsed>=action.duration){const old=action;old.done=true;if(!old.retain)action=null;old.resolve();}}
 async function start(mon,move,{phase='cut',direction=1,target=null,height=0,duration=2,transfer=false,retain=false,onContact=null}={}){
  if(action&&!action.done)throw Error('Azione MN già in corso');await prepare(mon,move);if(action&&!action.done)throw Error('Azione MN già in corso');
  const finished=new Promise((resolve,reject)=>{action={mon,move,phase,direction,target,height,duration,transfer,retain,onContact,zone:native()?.zone,elapsed:0,resolve,reject};});if(move===15)void root.AudioEngine?.cry(root.PokemonVisuals.speciesId(mon));return {finished};
 }
 async function run(...args){return (await start(...args)).finished;}
 function clear(){generation++;const old=action;action=null;old?.reject(Error('Azione MN annullata'));bank?.release();bank=null;pending=null;}
 root.FieldHMWorld={prepare,present,inspectCard,copyCard,placement,cameraFor,applyCamera,tick,start,run,end(){if(action?.done)action=null;},dispose,clear,swimmer,surfReady,surfRenderable,rendererStats(renderer){const card=cards.get(renderer),valid=!!card&&renderer.gl.isTexture(card.texture.texture);return {gpuCards:valid?1:0,gpuBytes:valid?512*512*4:0};},get active(){return action;},get retained(){return {banks:bank?1:0,gpuCardBudgetBytes:512*512*4};}};
})(typeof window==='undefined'?globalThis:window);
