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
 function bodyPose(p,s,time){const battle=root.SpeciesMoves.select(p.species,p.move,{preparing:p.move===19});if(!battle)throw Error('Anatomia MN mancante: '+p.graphic+':'+p.move);const pose=root.SpeciesMoves.sample({...battle,graphic:p.graphic},(p.move===15?clamp(time):.4)*battle.frames,'p1');return {...pose,graphic:p.graphic,species:p.species,dir:-1,wind:1,hit:1,glare:0,crouch:0,lean:s.lean,head:s.head,arms:s.arms,feet:s.feet,tail:s.tail};}
 function paint(renderer,p,s,time,{rider=true,standing=false,scale=1,ball=null}={}){
  const card=cardFor(renderer),c=card.context;c.clearRect(0,0,512,512);c.imageSmoothingEnabled=false;
  c.save();c.translate(256,384);c.scale(scale,scale);c.translate(-256,-384);
  c.save();c.translate(256,384);c.scale(s.flip?-1:1,1);c.rotate(s.lean);c.translate(-256,-384);
  if(s.jets>0){for(const side of [-1,1]){const x=Math.round(256+side*s.height*64*.15),length=Math.round((18+4*Math.sin(time*35))*s.jets),y=382;c.fillStyle='#4088c8';c.fillRect(x-4,y,8,length);c.fillStyle='#a7eaff';c.fillRect(x-2,y,4,Math.round(length*.8));c.fillStyle='#fff9d5';c.fillRect(x-1,y,2,Math.round(length*.5));}}
  if(!root.ROM_SPRITE_ANIM.draw(c,p.graphic,s.back,256,384,s.height*64/80,0,true,bodyPose(p,s,time)))throw Error('Sprite MN non preparato');c.restore();
  if(rider){const direction=s.direction,row=(standing?bank.standing:bank.sitting||bank.standing)?.[direction];if(row){const [l,t,r,b]=row.bounds,h=standing?1.75:1.5,w=h*(r-l)/(b-t),seatX=256+Math.sin(s.lean)*s.seat*64*(s.flip?-1:1),seatY=384-Math.cos(s.lean)*s.seat*64;c.drawImage(row.image,l,t,r-l,b-t,seatX-w*32,seatY-h*64,w*64,h*64);}}
  // The near-side body occludes the rider's lower legs; native back views keep the rider in front.
  if(rider&&!s.back){c.save();c.translate(256,384);c.scale(s.flip?-1:1,1);c.rotate(s.lean);c.translate(-256,-384);root.ROM_SPRITE_ANIM.draw(c,p.graphic,s.back,256,384,s.height*64/80,0,true,bodyPose(p,s,time));c.restore();}
  c.restore();
  if(ball&&scale<1){const [x,y]=ball;c.strokeStyle='#ff8d9c';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(256,384-s.height*scale*32);c.stroke();c.fillStyle='#f5f2df';c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.fill();c.fillStyle='#bb3749';c.beginPath();c.arc(x,y,4,Math.PI,Math.PI*2);c.fill();c.strokeStyle='#283b43';c.lineWidth=1;c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.moveTo(x-4,y);c.lineTo(x+4,y);c.stroke();}
  if(p.move===15&&s.contact){c.strokeStyle='#f3f8cf';c.lineWidth=3;c.beginPath();c.arc(256+(s.flip?1:-1)*s.height*20,384-s.height*36,s.height*24,-1.2,.9);c.stroke();}
  const gl=renderer.gl;gl.bindTexture(gl.TEXTURE_2D,card.texture.texture);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,card.canvas);return card.texture;
 }
 function present(renderer,time,actors){
  if(renderer.contextLost||renderer.gl?.isContextLost?.())return actors;
  const original=actors.find(a=>a.hero||a.name==='Alcide'||a.name==='AlcideSurf');if(!original)return actors;
  let mon,move,sample,position,rider=true,scale=1;
  if(action){if(action.zone!==native()?.zone&&!action.transfer)return actors;({mon,move}=action);const p=root.FieldHMProfiles.profile(mon,move),t=clamp(action.elapsed/action.duration);const viewDirection=root.NativeRails&&renderer.yaw?root.NativeRails.screenDirection(action.direction,renderer.yaw):action.direction;sample=root.FieldHMProfiles.sample(p,time,{phase:action.phase,progress:t,direction:viewDirection});position={x:original.x,z:original.z,height:action.height};
   if(move===19){
    const departing=action.phase==='depart',flight=departing?ease(clamp((t-.35)/.65)):1-ease(clamp(t/.65));position.height+=flight*96;
    const boarding=departing?ease(clamp((t-.15)/.2)):1-ease(clamp((t-.65)/.2));rider=departing?t>=.35:t<=.65;
    if(!rider){original.name='Alcide';original.frame=viewDirection*3;original.height=action.height+(sample.seat+sample.bob)*boarding+Math.sin(boarding*Math.PI)*.5+.04;original.groundHeight=action.height;original.shadowAlpha=1/(1+Math.max(0,original.height-action.height)**2);}
    scale=departing?ease(t/.15):1-ease(clamp((t-.85)/.15));
   }
   else {rider=false;const travel=ease(clamp((t-.12)/.2))*(1-ease(clamp((t-.73)/.2))),dx=action.target.x-original.x,dz=action.target.y-original.z,distance=Math.hypot(dx,dz),approach=Math.max(0,distance-.65)/Math.max(.01,distance);position.x+=dx*approach*travel;position.z+=dz*approach*travel;scale=t<.12?ease(t/.12):t>.9?1-ease((t-.9)/.1):1;
    const [vx,vz]=[[0,-1],[0,1],[-1,0],[1,0]][action.direction];if(action.canRetreat===undefined)action.canRetreat=[.25,.5,.75,.95].every(step=>{const x=original.x-vx*step,z=original.z-vz*step;return typeof blocked==='function'&&!blocked(x-.18,z-.18)&&!blocked(x+.18,z+.18)&&!root.NativeStory?.occupied(x,z)&&Math.abs(renderer.groundHeight(x,z)-action.height)<.25;});
    if(action.canRetreat){const back=ease(t/.2)*(1-ease((t-.82)/.18));original.x-=vx*.95*back;original.z-=vz*.95*back;original.groundX=original.x;original.groundZ=original.z;if(t<.2||t>.82)original.frame=action.direction*3+1+Math.floor(time*8)%2;}
   }
  }else if(root.SurfField?.mounted()&&surfRenderable()){
   mon=surfReady()?swimmer():bank.displayMon;move=57;const p=root.FieldHMProfiles.profile(mon,move),n=native(),motion=n.surfMotion;
   sample=root.FieldHMProfiles.sample(p,time,{direction:Math.floor((original.frame%12)/3),moving:typeof moving==='undefined'?true:moving});position={x:original.x,z:original.z,height:n.fieldHeight||0};
   if(motion){const water=motion.landing?motion.from:motion.to;position={x:water.x,z:water.y,height:water.height};rider=false;
    const t=motion.phase==='wait'?0:motion.travel,lift=(sample.seat+sample.bob)*(motion.landing?1-t:t)+Math.sin(Math.PI*t)*.7;
    original.height=(n.fieldHeight||0)+lift+.04;original.name='Alcide';original.frame=motion.direction*3;original.noShadow=false;original.groundHeight=n.fieldHeight||0;
    if(!motion.landing&&motion.phase==='wait')scale=ease(motion.wait/16);
    if(motion.phase==='recall')scale=1-ease(motion.wait/16);
   }
  }else {dispose(renderer);if(!root.SurfField?.mounted()){bank?.release();bank=null;}return actors;}
  const p=root.FieldHMProfiles.profile(mon,move);if(bank?.graphic!==graphic(mon))return actors;
  position.height+=sample.bob||0;
  let ball=null;if(!rider&&scale<1){const heroHeight=(action?.height??native()?.fieldHeight??position.height)+1.1,q=1-scale;position={x:position.x+(original.x-position.x)*q,z:position.z+(original.z-position.z)*q,height:position.height+(heroHeight-position.height)*q-sample.height*scale*q*.5};const pitch=renderer.cameraPitch||[.423,.906],yaw=renderer.yaw||0,dx=original.x-position.x,dz=original.z-position.z;ball=[256+(dx*Math.cos(yaw)-dz*Math.sin(yaw))*64,384-((heroHeight-position.height)*pitch[1]-(dx*Math.sin(yaw)+dz*Math.cos(yaw))*pitch[0])*64/Math.max(.1,pitch[1])];}
  const texture=paint(renderer,p,sample,move===15?action.elapsed/action.duration:time,{rider,scale,ball});
  const actor={name:'Alcide',fieldHM:true,texture,hero:true,...placement(position,renderer.cameraPitch,0,renderer.yaw||0),...(action?{groundHeight:action.height,shadowAlpha:1/(1+Math.max(0,position.height-action.height)**2)}:{}),worldWidth:8,worldHeight:8,nativeBillboard:true,noShadow:move===57||scale<1,frame:0};
  return [...actors.filter(a=>a!==original||!rider),actor];
 }
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
 root.FieldHMWorld={prepare,present,placement,cameraFor,applyCamera,tick,start,run,end(){if(action?.done)action=null;},dispose,clear,swimmer,surfReady,surfRenderable,rendererStats(renderer){const card=cards.get(renderer),valid=!!card&&renderer.gl.isTexture(card.texture.texture);return {gpuCards:valid?1:0,gpuBytes:valid?512*512*4:0};},get active(){return action;},get retained(){return {banks:bank?1:0,gpuCardBudgetBytes:512*512*4};}};
})(typeof window==='undefined'?globalThis:window);
