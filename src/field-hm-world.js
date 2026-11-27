/* Original sprite parts staged in the 3D world. One pinned Pokémon bank and
 * one reusable 1 MiB GPU card per renderer; no accumulating frame textures. */
(function(root){
 let bank=null,pending=null,generation=0,action=null;
 const cards=new WeakMap(),presented=new WeakMap(),surfGates=new WeakMap(),native=()=>root.NativeStory?.state||root.Journey?.state.original;
 const riderWaists064={M:[[16,25],[16,23.5],[19.5,23.5],[12.5,23.5]],F:[[16,24.5],[16,23.5],[18.5,23.5],[13.5,23.5]]};
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 function graphic(mon){return root.PokemonVisuals.graphic(mon);}
 function alpha(image){const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const x=c.getContext('2d');x.drawImage(image,0,0);return root.ROM_SPRITE_ANIM.alphaBounds(x.getImageData(0,0,c.width,c.height).data,c.width,c.height)||[0,0,c.width,c.height];}
 async function prepare(mon,move){
  const profile=root.FieldHMProfiles.profile(mon,move);if(!profile)throw Error('Animazione MN sul campo non disponibile per '+(mon.nickname||mon.name));
  const key=graphic(mon),identity=root.PlayerIdentity?.key||'M',authoredCut=[501,502,503].includes(+key)&&move===15,cutArt=authoredCut?(+key===501?root.FieldHMOshawottCut:root.FieldHMEvolvedCut?.forGraphic(key)):null;if(authoredCut&&!cutArt)throw Error('Animazione Taglio con conchiglia non disponibile');
  if(bank?.graphic===key&&bank.identity===identity&&(![19,57].includes(move)||bank.sitting)&&(!authoredCut||bank.cutArt)){if(!authoredCut&&bank.cutArt){bank.cutArt.release();bank.cutArt=null;}bank.mon=mon;return bank;}
  if(pending?.graphic===key&&pending.identity===identity&&pending.move===move)return pending.promise;
  const ticket=++generation,keys=[key+'-front',key+'-back'],release=root.ROM_SPRITE_ANIM.pin(keys);
  const promise=(async()=>{try{
   if([19,57].includes(move)&&!root.SURF_FIELD_ASSETS)await root.SurfField?.prepareRiderAssets();
   await root.ROM_SPRITE_ANIM.prepare(keys,{gate:false});
   if(cutArt)await cutArt.prepare();
   const sources=root.PlayerIdentity?[root.PlayerIdentity.frames('Alcide'),root.PlayerIdentity.frames('AlcideSurf')]:[root.OPENING_SPRITES?.Alcide||root.ROM_SPRITES?.Alcide,root.SURF_FIELD_ASSETS?.sprites.AlcideSurf];
   if(!sources[0]||[19,57].includes(move)&&!sources[1])throw Error('Sprite del protagonista MN non disponibile');
   const images=await Promise.all(sources.map(async frames=>frames?Promise.all([0,3,6,9].map(async i=>{const image=await root.RuntimeAssets.image(frames[i]);return {image,bounds:alpha(image)};})):null));
   if(ticket!==generation)throw Error('Preparazione MN sostituita');
   const contactProfile=root.FieldHMProfiles.profiles.get(key+':57')||root.FieldHMProfiles.profiles.get(key+':19'),contact=contactProfile?.riderContact,contacts=contact?{}:null;
   if(contact)for(const view of ['front','back']){const source=root.ROM_SPRITE_ANIM.cache[key+'-'+view],b=source.groundBounds,q=root.FieldHMChoreography.riderAnchor(key,view==='back',contact[view],source.data),h=b[3]-b[1];contacts[view]=Object.freeze({x:(q.x-(b[0]+b[2])/2)/h,y:(b[3]-q.y)/h,track:q.track});}
   const previous=bank;bank={contacts,graphic:key,identity,mon,displayMon:{...mon},standing:images[0],sitting:images[1],release,cutArt};previous?.release();if(previous?.cutArt&&previous.cutArt!==cutArt)previous.cutArt.release();return bank;
  }catch(error){release();throw error;}finally{if(pending?.ticket===ticket)pending=null;if(!pending&&!bank?.cutArt)cutArt?.release();}})();
  pending={graphic:key,identity,move,promise,ticket};return promise;
 }
 function swimmer(){const n=native(),party=root.Journey?.state.party||[];return party[n?.surfUserIndex]||party.find(p=>!p.egg&&p.pp?.some(m=>m.id===57));}
 function surfReady(){const mon=swimmer();return !!mon&&bank?.graphic===graphic(mon)&&!!bank.sitting&&!!root.FieldHMProfiles.profile(mon,57);}
 function surfRenderable(){return !!swimmer()&&!!bank&&!!root.FieldHMProfiles.profile(bank.displayMon,57);}
 function dispose(renderer){restoreCutCamera(renderer);const card=cards.get(renderer);if(!card)return;if(renderer.gl.isTexture(card.texture.texture))renderer.gl.deleteTexture(card.texture.texture);cards.delete(renderer);}
 function cardFor(renderer){let card=cards.get(renderer);if(card&&!renderer.gl.isTexture(card.texture.texture)){cards.delete(renderer);card=null;}if(!card){const canvas=document.createElement('canvas');canvas.width=canvas.height=512;card={canvas,context:canvas.getContext('2d'),texture:renderer.upload(canvas,true)};cards.set(renderer,card);}return card;}
 function surfPosture064(){const r=native()?.surfMotion;return !r?1:r.phase==='wait'?ease(clamp(r.wait/16)):r.phase==='recall'?1-ease(clamp(r.wait/16)):1;}
 function bodyPose(p,s){return {fieldHM:true,fieldMove:p.move,surfPosture:surfPosture064(),graphic:p.graphic,species:p.species,dir:-1,crouch:s.crouch,lean:s.lean,head:s.head,arms:s.arms,feet:s.feet,tail:s.tail,wings:s.wings,sideHeads:s.sideHeads,jets:s.jets};}
 const balanceStops064=Object.freeze([0,.25,.5,.75,1]);
 function balanceGate064(from,to){return {from,to,progress:0,index:0,debt:0,done:Math.abs(from-to)<1e-10};}
 function advanceBalance064(g,dt){if(!g||g.done||document.hidden||!Number.isFinite(dt)||dt<=0)return;g.debt=Math.min(1-g.progress,g.debt+dt/.12);const next=Math.min(balanceStops064[g.index]??1,g.progress+g.debt);g.debt-=next-g.progress;g.progress=next;}
 function acknowledgeBalance064(g,progress){if(!g||g.done||Math.abs(g.progress-progress)>1e-9)return;while(g.index<balanceStops064.length&&g.progress+1e-9>=balanceStops064[g.index])g.index++;if(g.progress>=1-1e-9)g.done=true;}
 function balanceAngle064(g){return g.from+(g.to-g.from)*ease(g.progress);}
 function seatLocal(s){const q=s.riderContact&&bank?.graphic===s.graphic?bank.contacts?.[s.back?'back':'front']:null;if(!q)return {x:Math.sin(s.lean)*s.seat/s.bodyScaleY*s.bodyScaleX*(s.flip?-1:1),y:Math.cos(s.lean)*s.seat};const x=q.x*s.height,y=q.y*s.height,a=s.lean;return {x:(Math.cos(a)*x+Math.sin(a)*y)*s.bodyScaleX*(s.flip?-1:1),y:(Math.cos(a)*y-Math.sin(a)*x)*s.bodyScaleY};}
 function riderWaist(s){return s.riderContact&&bank?.contacts?riderWaists064[bank.identity]?.[s.direction]:null;}
 function riderRotation(s){return s.riderContact?(s.back?-1:1)*(s.flip?-1:1)*(s.riderLean||0):0;}
 function riderFeetLocal(s){const a=seatLocal(s),waist=riderWaist(s),row=bank?.sitting?.[s.direction];if(!waist||!row)return a;const [l,t,r,b]=row.bounds,k=1.5/(b-t),dx=((l+r)/2-waist[0])*k,dy=(b-waist[1])*k,angle=riderRotation(s);a.x+=dx*Math.cos(angle)-dy*Math.sin(angle);a.y-=dx*Math.sin(angle)+dy*Math.cos(angle);return a;}
 function seatPoint(position,s,renderer){const a=riderFeetLocal(s),pitch=renderer.cameraPitch||[.423,.906],yaw=renderer.yaw||0;return {x:position.x+a.x*Math.cos(yaw)-a.y*pitch[0]*Math.sin(yaw),z:position.z-a.x*Math.sin(yaw)-a.y*pitch[0]*Math.cos(yaw),height:position.height+a.y*pitch[1]};}
 function paint(renderer,p,s,time,{rider=true,standing=false,scale=1,ball=null}={}){
  const card=cardFor(renderer),c=card.context;card.rider=null;c.clearRect(0,0,512,512);c.imageSmoothingEnabled=false;
  c.save();c.translate(256,384);c.scale(scale,scale);c.translate(-256,-384);
  c.save();c.translate(256,384);c.scale((s.flip?-1:1)*s.bodyScaleX,s.bodyScaleY);c.rotate(s.lean);c.translate(-256,-384);
  if(s.jets>0){const anchors=root.FieldHMChoreography.anatomy(p.graphic)?.jetAnchors?.[s.back?'back':'front'];if(!anchors)throw Error('Contatti propulsori MN non verificati');for(const [u,v]of anchors){const x=Math.round(256+u*s.height*64),length=Math.round((18+4*Math.sin(time*35))*s.jets),y=Math.round(384-(v+Math.max(0,-s.feet)*.03)*s.height*64);c.fillStyle='#4088c8';c.fillRect(x-4,y,8,length);c.fillStyle='#a7eaff';c.fillRect(x-2,y,4,Math.round(length*.8));c.fillStyle='#fff9d5';c.fillRect(x-1,y,2,Math.round(length*.5));}}
  const authoredCut=[501,502,503].includes(+p.graphic)&&p.move===15;
  if(authoredCut){if(!bank.cutArt?.draw(c,s.back,256,384,s.height*64,s.progress))throw Error('Taglio con conchiglia non preparato');if(s.contact)bank.cutArt.trail(c,s.back,256,384,s.height*64,s.progress);}
  else if(!root.ROM_SPRITE_ANIM.draw(c,p.graphic,s.back,256,384,s.height*64/80,0,true,bodyPose(p,s,time)))throw Error('Sprite MN non preparato');
  let cutTip=null;
  if(p.move===15&&s.contact&&!authoredCut){const source=root.ROM_SPRITE_ANIM.cache[p.graphic+'-'+(s.back?'back':'front')];if(!source?.data||!source.groundBounds)throw Error('Contatto Taglio non preparato');const tip=root.FieldHMChoreography.cutAnchor(p.graphic,s.back,bodyPose(p,s,time),source.data),b=source.groundBounds,k=s.height*64/Math.max(1,b[3]-b[1]),x=256+(tip.x-(b[0]+b[2])/2)*k,y=384+(tip.y-b[3])*k;cutTip={x,y,track:tip.track};c.save();c.translate(x,y);c.rotate(tip.rotation);c.strokeStyle='#f3f8cf';c.lineWidth=2;c.beginPath();c.arc(0,0,Math.max(2,4*k),-1.2,.9);c.stroke();c.restore();}
  c.restore();
  if(rider){const direction=s.direction,row=(standing?bank.standing:bank.sitting||bank.standing)?.[direction];if(row){const [l,t,r,b]=row.bounds,h=standing?1.75:1.5,w=h*(r-l)/(b-t),contact=seatLocal(s),seatX=256+contact.x*64,seatY=384-contact.y*64,source=[l,t,r-l,b-t],waist=standing?null:riderWaist(s),destination=waist?[seatX-(waist[0]-l)/(r-l)*w*64,seatY-(waist[1]-t)/(b-t)*h*64,w*64,h*64]:[seatX-w*32,seatY-h*64,w*64,h*64];const rotation=standing?0:riderRotation(s);if(rotation){c.save();c.translate(seatX,seatY);c.rotate(rotation);c.translate(-seatX,-seatY);}c.drawImage(row.image,...source,...destination);if(rotation)c.restore();card.rider={image:row.image,source,destination,scale,rotation,pivotX:seatX,pivotY:seatY};}}
  // Only the lower28% may pass behind the near-side body. Repainting the
  // whole silhouette here used to hide the rider's head/torso on large flyers.
  if(card.rider&&!s.back){const [,top,,height]=card.rider.destination,legs=Math.ceil(top+height*.72);c.save();c.beginPath();if(card.rider.rotation){c.save();c.translate(card.rider.pivotX,card.rider.pivotY);c.rotate(card.rider.rotation);c.translate(-card.rider.pivotX,-card.rider.pivotY);c.rect(0,legs,512,512-legs);c.restore();}else c.rect(0,legs,512,512-legs);c.clip();c.translate(256,384);c.scale((s.flip?-1:1)*s.bodyScaleX,s.bodyScaleY);c.rotate(s.lean);c.translate(-256,-384);root.ROM_SPRITE_ANIM.draw(c,p.graphic,s.back,256,384,s.height*64/80,0,true,bodyPose(p,s,time));c.restore();}
  c.restore();
  if(ball&&scale<1){const [x,y]=ball;c.strokeStyle='#ff8d9c';c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(256,384-s.height*s.bodyScaleY*scale*32);c.stroke();c.fillStyle='#f5f2df';c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.fill();c.fillStyle='#bb3749';c.beginPath();c.arc(x,y,4,Math.PI,Math.PI*2);c.fill();c.strokeStyle='#283b43';c.lineWidth=1;c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.moveTo(x-4,y);c.lineTo(x+4,y);c.stroke();}
  const gl=renderer.gl;gl.bindTexture(gl.TEXTURE_2D,card.texture.texture);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,card.canvas);card.pose={graphic:p.graphic,move:p.move,phase:s.phase,choreography:s.choreography,bodyScaleX:s.bodyScaleX,bodyScaleY:s.bodyScaleY,seat:s.seat,...(cutTip?{cutTip}:{}),...(authoredCut?{authoredAtlas:bank.cutArt.name||'oshawott-cut-064',authoredFrame:bank.cutArt.frameAt(s.progress)}:{})};return card.texture;
 }
 function present(renderer,time,actors){
  presented.delete(renderer);
  if(renderer.contextLost||renderer.gl?.isContextLost?.())return actors;
  const original=actors.find(a=>a.hero||a.name==='Alcide'||a.name==='AlcideSurf');if(!original)return actors;
  captureCutCamera(renderer,original,actors);
  const stagedPlan=cutCameraScope(action)?cutCameraPlans.get(action)?.get(renderer):null;
  if(cutCameraScope(action)&&(!stagedPlan||stagedPlan.invalid||stagedPlan.scene!==renderer.scene||stagedPlan.bank!==bank||stagedPlan.staging?.error))return rejectCutStage(renderer,actors,stagedPlan?.staging?.error||'Riferimenti della scena Taglio sostituiti');
  let mon,move,sample,position,rider=true,scale=1;
  if(action){if(action.zone!==native()?.zone&&!action.transfer)return actors;({mon,move}=action);const p=root.FieldHMProfiles.profile(mon,move),t=clamp(action.elapsed/action.duration);const viewDirection=root.NativeRails&&renderer.yaw?root.NativeRails.screenDirection(action.direction,renderer.yaw):action.direction;sample=root.FieldHMProfiles.sample(p,time,{phase:action.phase,progress:t,direction:viewDirection});position={x:original.x,z:original.z,height:action.height};
   if(move===19){
    const departing=action.phase==='depart',flight=departing?ease(clamp((t-.35)/.65)):1-ease(clamp(t/.65));position.height+=flight*96;
    const boarding=departing?ease(clamp((t-.15)/.2)):1-ease(clamp((t-.65)/.2));rider=departing?t>=.35:t<=.65;
    if(!rider){const ground={x:original.x,z:original.z,height:action.height+.04},contact=seatPoint({...position,height:position.height+sample.bob},sample,renderer);original.name='Alcide';original.frame=viewDirection*3;original.x=ground.x+(contact.x-ground.x)*boarding;original.z=ground.z+(contact.z-ground.z)*boarding;original.height=ground.height+(contact.height-ground.height)*boarding+Math.sin(boarding*Math.PI)*.5;original.groundHeight=action.height;original.groundX=ground.x;original.groundZ=ground.z;original.shadowAlpha=1/(1+Math.max(0,original.height-action.height)**2);}
    scale=departing?ease(t/.15):1-ease(clamp((t-.85)/.15));
   }
   else {rider=false;const travel=ease(clamp((t-.12)/.2))*(1-ease(clamp((t-.73)/.2))),dx=action.target.x-original.x,dz=action.target.y-original.z,distance=Math.hypot(dx,dz),approach=Math.max(0,distance-.65)/Math.max(.01,distance);scale=t<.12?ease(t/.12):t>.9?1-ease((t-.9)/.1):1;
    if(stagedPlan){const lane=stagedPlan.staging;position.x=lane.origin[0]+(lane.end[0]-lane.origin[0])*travel;position.z=lane.origin[1]+(lane.end[1]-lane.origin[1])*travel;}
    else {position.x+=dx*approach*travel;position.z+=dz*approach*travel;
    const [vx,vz]=[[0,-1],[0,1],[-1,0],[1,0]][action.direction];if(action.canRetreat===undefined)action.canRetreat=[.25,.5,.75,.95].every(step=>{const x=original.x-vx*step,z=original.z-vz*step;return typeof blocked==='function'&&!blocked(x-.18,z-.18)&&!blocked(x+.18,z+.18)&&!root.NativeStory?.occupied(x,z)&&Math.abs(renderer.groundHeight(x,z)-action.height)<.25;});
    if(action.canRetreat){const back=ease(t/.2)*(1-ease((t-.82)/.18));original.x-=vx*.95*back;original.z-=vz*.95*back;original.groundX=original.x;original.groundZ=original.z;if(t<.2||t>.82)original.frame=action.direction*3+1+Math.floor(time*8)%2;}
    }
   }
  }else if(root.SurfField?.mounted()&&surfRenderable()){
   mon=surfReady()?swimmer():bank.displayMon;move=57;const p=root.FieldHMProfiles.profile(mon,move),n=native(),motion=n.surfMotion;
   const isMoving=typeof moving==='undefined'?true:moving,phase=motion?(motion.landing?'land':'board'):(isMoving?'swim':'idle');
   if(bank.loopPhase!==phase){if(p.riderLean&&bank.loopPhase==='board'&&!motion)bank.leanIn=balanceGate064(0,p.riderLean);bank.poseFade=bank.lastSample?{from:bank.lastSample,start:time}:null;bank.loopPhase=phase;bank.loopStart=time;}
   const progress=motion?(motion.phase==='wait'?.2*motion.wait/16:motion.phase==='recall'?.7+.3*motion.wait/16:motion.landing?.7*motion.travel:.2+.8*motion.travel):0;
   sample=root.FieldHMProfiles.sample(p,time-bank.loopStart,{phase,progress,direction:Math.floor((original.frame%12)/3),moving:isMoving});if(bank.poseFade){const q=ease(clamp((time-bank.poseFade.start)/.12));for(const key of [...root.FieldHMChoreography.channels,'bob'])sample[key]=bank.poseFade.from[key]+(sample[key]-bank.poseFade.from[key])*q;root.FieldHMProfiles.fit(p,sample);if(q===1)bank.poseFade=null;}if(bank.leanIn&&!motion)sample.riderLean=balanceAngle064(bank.leanIn);position={x:original.x,z:original.z,height:n.fieldHeight||0};
   if(motion){const gate=surfGate064(motion);if(motion.landing&&p.riderLean){bank.leanIn=null;sample.riderLean=gate.leanOut&&!gate.leanOut.done?balanceAngle064(gate.leanOut):0;}const water=motion.landing?motion.from:motion.to;position={x:water.x,z:water.y,height:water.height};rider=false;
    const t=motion.phase==='wait'?0:motion.travel,mount=motion.landing?1-t:t,contact=seatPoint({...position,height:position.height+sample.bob},sample,renderer),ground={x:original.x,z:original.z};
    original.x+=(contact.x-water.x)*mount;original.z+=(contact.z-water.y)*mount;original.height=(n.fieldHeight||0)+(contact.height-water.height)*mount+Math.sin(Math.PI*t)*.7+.04*(1-mount);original.name='Alcide';original.frame=motion.direction*3;original.noShadow=false;original.groundHeight=n.fieldHeight||0;original.groundX=ground.x;original.groundZ=ground.z;
    if(!motion.landing&&motion.phase==='wait')scale=ease(motion.wait/16);
    if(motion.phase==='recall')scale=1-ease(motion.wait/16);
    if(motion.landing&&gate.leanOut&&!gate.leanOut.done)rider=true;
   }
   bank.lastSample={...sample};
  }else {dispose(renderer);if(!root.SurfField?.mounted()){if(!pending)bank?.cutArt?.release();bank?.release();bank=null;}return actors;}
  const p=root.FieldHMProfiles.profile(mon,move);if(bank?.graphic!==graphic(mon))return actors;
  position.height+=sample.bob||0;
  let ball=null;if(!rider&&scale<1){const heroHeight=(action?.height??native()?.fieldHeight??position.height)+1.1,q=1-scale;position={x:position.x+(original.x-position.x)*q,z:position.z+(original.z-position.z)*q,height:position.height+(heroHeight-position.height)*q-sample.height*sample.bodyScaleY*scale*q*.5};const pitch=renderer.cameraPitch||[.423,.906],yaw=renderer.yaw||0,dx=original.x-position.x,dz=original.z-position.z;ball=[256+(dx*Math.cos(yaw)-dz*Math.sin(yaw))*64,384-((heroHeight-position.height)*pitch[1]-(dx*Math.sin(yaw)+dz*Math.cos(yaw))*pitch[0])*64/Math.max(.1,pitch[1])];}
  const texture=paint(renderer,p,sample,move===15?action.elapsed/action.duration:time,{rider,scale,ball});
  const actor={name:'Alcide',fieldHM:true,texture,hero:true,...placement(position,renderer.cameraPitch,0,renderer.yaw||0),...(action?{groundHeight:action.height,shadowAlpha:1/(1+Math.max(0,position.height-action.height)**2)}:{}),worldWidth:8,worldHeight:8,nativeBillboard:true,noShadow:move===57||scale<1,frame:0};
  if(action)presented.set(renderer,{action,elapsed:action.elapsed});
  else if(native()?.surfMotion){const motion=native().surfMotion,gate=surfGates.get(motion);presented.set(renderer,{motion,progress:surfProgress(motion),...(gate?.leanOut&&!gate.leanOut.done?{balanceProgress:gate.leanOut.progress}:{})});}
  else if(bank?.leanIn&&!bank.leanIn.done)presented.set(renderer,{riderBank:bank,balanceProgress:bank.leanIn.progress});
  return [...cutForegroundActors064(renderer,actors).filter(a=>a!==original||!rider),actor];
 }
 function inspectCard(renderer){
  const card=cards.get(renderer);if(!card)return null;const pixels=card.context.getImageData(0,0,512,512).data;let riderUpperPixels=0,riderUpperVisible=0,riderUpperExactVisible=0;
  // This diagnostic runs only when QA explicitly inspects a painted card.
  // Ordinary frames allocate no mask canvas and never read these pixels back.
  if(card.rider?.scale===1){
   // Keep diagnostic rasterization separate from the live card backend.
   if(!card.riderMask){const canvas=document.createElement('canvas');canvas.width=canvas.height=512;card.riderMask={canvas,context:canvas.getContext('2d',{willReadFrequently:true})};}
   const {image,source,destination,rotation=0,pivotX=0,pivotY=0}=card.rider,m=card.riderMask.context;m.clearRect(0,0,512,512);m.imageSmoothingEnabled=false;if(rotation){m.save();m.translate(pivotX,pivotY);m.rotate(rotation);m.translate(-pivotX,-pivotY);}m.drawImage(image,...source,...destination);if(rotation)m.restore();
   const expected=m.getImageData(0,0,512,512).data,[left,top,width,height]=destination,x0=rotation?0:Math.max(0,Math.floor(left)),x1=rotation?512:Math.min(512,Math.ceil(left+width)),y0=rotation?0:Math.max(0,Math.floor(top)),y1=rotation?512:Math.min(512,Math.ceil(top+height*.72)),rc=Math.cos(rotation),rs=Math.sin(rotation);
   // Chrome CPU/GPU nearest sampling differs nonuniformly by up to1 card
   // pixel at fractional sprite positions. This QA-only match allows that
   // Chebyshev1px neighbourhood; it is not an exact physically visible ratio
   // and cannot certify an occluded strip as thin as that raster tolerance.
   for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
    const i=(y*512+x)*4;if(expected[i+3]<250)continue;if(rotation){const dx=x+.5-pivotX,dy=y+.5-pivotY,u=pivotX+rc*dx+rs*dy,v=pivotY-rs*dx+rc*dy;if(u<left||u>=left+width||v<top||v>=top+height*.72)continue;}riderUpperPixels++;
    if(pixels[i+3]>=250&&Math.abs(expected[i]-pixels[i])<=2&&Math.abs(expected[i+1]-pixels[i+1])<=2&&Math.abs(expected[i+2]-pixels[i+2])<=2){riderUpperExactVisible++;riderUpperVisible++;continue;}
    let visible=false;for(let dy=-1;dy<=1&&!visible;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||xx>=512||yy<0||yy>=512)continue;const j=(yy*512+xx)*4;if(pixels[j+3]>=250&&Math.abs(expected[i]-pixels[j])<=2&&Math.abs(expected[i+1]-pixels[j+1])<=2&&Math.abs(expected[i+2]-pixels[j+2])<=2){visible=true;break;}}if(visible)riderUpperVisible++;
   }
  }
  return {...card.pose,alphaBounds:root.ROM_SPRITE_ANIM.alphaBounds(pixels,512,512),riderUpperPixels,riderUpperVisible,riderUpperVisibleFraction:riderUpperPixels?riderUpperVisible/riderUpperPixels:null,riderUpperExactVisible,riderUpperExactVisibleFraction:riderUpperPixels?riderUpperExactVisible/riderUpperPixels:null,riderRasterTolerancePx:1};
 }
 function copyCard(renderer,context,...rect){const card=cards.get(renderer);if(!card)return false;context.drawImage(card.canvas,...rect);return true;}
 function placement(position,pitch=[.423,.906],bob=0,yaw=0){return {x:position.x+2*pitch[0]*Math.sin(yaw),z:position.z+2*pitch[0]*Math.cos(yaw),height:position.height+bob-2*pitch[1],groundHeight:position.height,groundX:position.x,groundZ:position.z};}
 function cameraFor(base=[.423,.906]){if(![15,19].includes(action?.move))return base;if(cutCameraScope(action)&&action.direction===1)return base;const t=clamp(action.elapsed/action.duration),amount=action.move===15?ease(t/.18)*(1-ease((t-.82)/.18)):action.phase==='depart'?ease(t/.12):1-ease((t-.85)/.15),angle=Math.atan2(base[0],base[1]),target=Math.max(angle,62*Math.PI/180),pitch=angle+(target-angle)*amount;return [Math.sin(pitch),Math.cos(pitch)];}
 // Private501/15 camera pilot. Geometry is frozen before the original staging.
 const cutCameraPlans=new WeakMap(),cutCameraFrames=new Map();
 function restoreCutCamera(renderer){const lease=cutCameraFrames.get(renderer);if(!lease)return;cutCameraFrames.delete(renderer);
  for(const key of ['zoom','center','yaw','cameraPitch'])if(renderer[key]===lease.applied[key]&&(!Array.isArray(renderer[key])||renderer[key].every((v,i)=>v===lease.values[key][i])))renderer[key]=lease.base[key];
 }
 function releaseCutCameras(owner){for(const [renderer,lease]of cutCameraFrames)if(!owner||lease.owner===owner)restoreCutCamera(renderer);}
 function cutCameraScope(a){return !!a&&!a.done&&a.move===15&&a.phase==='cut'&&+graphic(a.mon)===501&&[0,1].includes(a.direction)&&a.zone===152;}
  function rejectCutStage(renderer,actors,reason){const old=action;releaseCutCameras(old);action=null;old.reject(Error(reason));dispose(renderer);return actors;}
  function cutStageClear(renderer,x,z,radius,height){
   if(typeof blocked!=='function'||typeof root.NativeStory?.occupied!=='function')return false;
   return (radius?[[0,0],[-radius,-radius],[-radius,radius],[radius,-radius],[radius,radius]]:[[0,0]]).every(([u,v])=>!blocked(x+u,z+v)&&!root.NativeStory.occupied(x+u,z+v)&&renderer.groundHeight(x+u,z+v)===height);
  }
  function cutLateralStage(renderer,h,metadata,p,keys,stretch){
   const back=action.direction===0,side=back?-1:1,b=metadata.bounds[back?'back':'front'],row=bank.standing?.[action.direction],image=row?.image,width=image?.naturalWidth||image?.width,unit=p.height/(b[3]-b[1]),lean=Math.max(0,...keys.map(k=>-side*(k.lean||0)));
   if(!row?.bounds||!(width>0&&unit>0&&lean<Math.PI/2))return {error:'Dimensioni native della corsia Taglio non disponibili'};
   // Shell is held to the right in back cells, to the left in front cells.
   // Keep that original gesture facing the tree. One source texel is the gap;
   // the other terms are actual hero alpha and the authored inward-lean bound.
   const heroHalf=h.width*(row.bounds[2]-row.bounds[0])/(2*width),bodyHalf=unit*((b[2]-b[0])/2+(b[3]-b[1])*Math.sin(lean))*stretch,clearance=(heroHalf+bodyHalf+unit)/Math.cos(back?Math.PI/6:0),foot=unit*(b[2]-b[0])/2;
   const dx=action.target.x-h.x,dz=action.target.y-h.z,distance=Math.hypot(dx,dz),advance=distance>.65?(distance-.65)/distance:0,origin=[h.x+side*clearance,h.z],end=[origin[0]+dx*advance,origin[1]+dz*advance];
   if(![heroHalf,bodyHalf,clearance,foot,...origin,...end].every(Number.isFinite)||!(heroHalf>0&&foot>0))return {error:'Corsia Taglio non finita'};
   // The native permission grid is one world unit per tile. Check every cell
   // touched by the conservative body-width footprint, not a distance-step fit.
   const left=Math.floor(Math.min(origin[0],end[0])-foot),right=Math.floor(Math.max(origin[0],end[0])+foot),top=Math.floor(Math.min(origin[1],end[1])-foot),bottom=Math.floor(Math.max(origin[1],end[1])+foot);
   if((right-left+1)*(bottom-top+1)>128)return {error:'Corsia Taglio fuori dal vicinato del bersaglio'};
   for(let x=left;x<=right;x++)for(let z=top;z<=bottom;z++)if(!cutStageClear(renderer,x+.5,z+.5,0,action.height))return {error:'Spazio laterale insufficiente per Taglio'};
   if(!cutStageClear(renderer,...origin,foot,action.height)||!cutStageClear(renderer,...end,foot,action.height))return {error:'Appoggio laterale di Taglio non libero'};
   return {origin,end,foot,side,clearance,heroHalf,bodyHalf,sourceUnit:unit};
  }
 function captureCutCamera(renderer,hero,actors){if(!cutCameraScope(action))return;let plans=cutCameraPlans.get(action);if(!plans){plans=new WeakMap();cutCameraPlans.set(action,plans);}const prior=plans.get(renderer);
  if(prior){if(hero.x!==prior.hero.x||hero.z!==prior.hero.z||bank!==prior.bank)prior.invalid=true;return;}
  const target=action.target,tree=actors.find(a=>a.source?.model===108&&a.x===target?.x&&a.z===target?.y),metadata=bank?.cutArt?.metadata,p=root.FieldHMProfiles.profile(action.mon,15);
  if(!target||!tree||!metadata||bank.graphic!==graphic(action.mon)||!p||!renderer.images?.[(renderer.spriteName?.(tree.name)||tree.name)+'-0'])return;
  const geometry=a=>({x:a.x,z:a.z,height:a.height??.04,width:a.worldWidth??2,tall:a.worldHeight??2,nativeBillboard:!!a.nativeBillboard});const h=geometry(hero),treeBox=geometry(tree);
  if(![h.x,h.z,h.height,h.width,h.tall,treeBox.x,treeBox.z,treeBox.height,treeBox.width,treeBox.tall,action.height,p.height].every(Number.isFinite)||h.width<=0||h.tall<=0||treeBox.width<=0||treeBox.tall<=0)return;
  const keys=p.choreography.cut.map(row=>row[1]),range=key=>[Math.min(0,...keys.map(k=>k[key]||0)),Math.max(0,...keys.map(k=>k[key]||0))],stretch=range('stretch'),squash=range('squash'),crouch=range('crouch'),bob=range('bob'),sx=1+stretch[1]+.32*crouch[1],sy=1+squash[1]-crouch[0];
  const b=metadata.bounds[action.direction===0?'back':'front'],unit=p.height/(b[3]-b[1]),cx=(b[0]+b[2])/2,origin=metadata.origin,cell=metadata.cell;
  // Every opaque texel lies inside its immutable atlas cell. A disc bounds
  // every original lean angle; scale channel extrema follow the score keys.
  const radius=unit*Math.hypot(Math.max(Math.abs(-origin[0]-cx),Math.abs(cell-origin[0]-cx)),Math.max(Math.abs(-origin[1]-b[3]),Math.abs(cell-origin[1]-b[3])));
  const dx=target.x-h.x,dz=target.y-h.z,distance=Math.hypot(dx,dz),advance=distance>.65?(distance-.65)/distance:0,[vx,vz]=action.direction===0?[0,-1]:[0,1];
  if(!(Number.isFinite(radius)&&radius>0&&sx>0&&sy>0&&p.height>0))return;
  const staging=cutLateralStage(renderer,h,metadata,p,keys,sx),roots=staging.error?[[h.x,h.z]]:[[h.x,h.z],[h.x,h.z],staging.origin,staging.end],low=action.height+Math.min(bob[0],0)-p.height*sy/8,high=action.height+Math.max(bob[1],1.1);
  plans.set(renderer,{owner:action,bank,scene:renderer.scene,hero:h,tree:treeBox,targetSource:tree.source,staging,roots,low,high,u:radius*sx,v:radius*sy,height:p.height,invalid:false});
 }
 // A copied render actor only: native target/save data and its hidden flag stay untouched.
 function cutForegroundActors064(renderer,actors){
  const owner=action,plan=owner&&cutCameraPlans.get(owner)?.get(renderer),lease=cutCameraFrames.get(renderer);
  if(!cutCameraScope(owner)||owner.direction!==1||owner.committed||native()?.zone!==152||!plan||plan.invalid||plan.owner!==owner||plan.bank!==bank||plan.scene!==renderer.scene||lease?.owner!==owner)return actors;
  const t=clamp(owner.elapsed/owner.duration),amount=ease(t/.18)*(1-ease((t-.82)/.18));if(amount===0)return actors;
  const alpha=1-(1-.38)*amount;if(!Number.isFinite(alpha)||alpha<.38||alpha>1)return actors;
  return actors.map(a=>a.name==='Original108'&&!a.hero&&!a.fieldHM&&!a.hidden&&a.source===plan.targetSource&&a.source?.model===108&&!a.source.hidden&&a.x===owner.target?.x&&a.z===owner.target?.y?{...a,fieldHMCutForeground064:{ownerRef:owner,treeSourceRef:plan.targetSource,alpha}}:a);
 }
 function cutCameraPoints(plan,pitch,yaw){const points=[],cs=Math.cos(yaw),sn=Math.sin(yaw),[ps,pc]=pitch;
  const billboard=(box,x,z)=>{const w=box.width,h=box.tall,local=[[-w/2,0,0],[w/2,0,0],[-w/2,h*pc,-h*ps],[w/2,h*(box.nativeBillboard?pc:pc-.126),-h*(box.nativeBillboard?ps:ps+.202)]];for(const [u,v,d]of local)points.push([x+u*cs+d*sn,box.height+v,z-u*sn+d*cs]);};
  billboard(plan.tree,plan.tree.x,plan.tree.z);for(const [x,z]of plan.roots.slice(0,2))billboard(plan.hero,x,z);
  for(const [x,z]of plan.roots)for(const y of [plan.low,plan.high])for(const u of [-plan.u,plan.u])for(const v of [-plan.v,plan.v])points.push([x+u*cs-v*ps*sn,y+v*pc,z-u*sn-v*ps*cs]);return points;
 }
 function closeCutCamera(renderer,plan,base,pitch,amount){const w=renderer.viewSize?.[0]??root.innerWidth,h=renderer.viewSize?.[1]??root.innerHeight,gutter=16;
  if(plan.invalid||plan.owner!==action||bank!==plan.bank||renderer.scene!==plan.scene||native()?.zone!==action.zone||renderer.taskProjection||(base.yaw||0)!==0||!(w>gutter*2&&h>gutter*2&&base.zoom>0)||!Array.isArray(base.center)||base.center.length!==2)return null;
  const yaw=(base.yaw||0)+(action.direction===1?0:Math.PI/6*amount),points=cutCameraPoints(plan,pitch,yaw),[ps,pc]=pitch,cs=Math.cos(yaw),sn=Math.sin(yaw),elevation=renderer.elevation||0,distance=renderer.cameraDistance||65,rail=!!(renderer.scene.railZone||renderer.scene.verticalMap);
  const middle=[0,1,2].map(i=>(Math.min(...points.map(p=>p[i]))+Math.max(...points.map(p=>p[i])))/2),depth=(middle[1]-elevation)*pc/ps,goal=[middle[0]-depth*sn,middle[2]-depth*cs],center=base.center.map((v,i)=>v+(goal[i]-v)*amount),pixels=Math.min(w/30,h/21);
  let xMax=0,yMax=0,minQ=Infinity;const project=p=>{const dx=p[0]-center[0],dz=p[2]-center[1],py=p[1]-elevation,vx=dx*cs-dz*sn,vz=dx*sn+dz*cs,raw=1-(py*ps+vz*pc)/distance,q=rail?raw:Math.max(.35,raw);if(!(q>0&&Number.isFinite(q)))return null;return [vx/q,(pc*py-ps*vz)/q,q,vx,pc*py-ps*vz];};
  for(const p of points){const q=project(p);if(!q)return null;minQ=Math.min(minQ,q[2]);xMax=Math.max(xMax,Math.abs(q[3]));yMax=Math.max(yMax,Math.abs(q[4]));}
  xMax/=minQ;yMax/=minQ;
  const foot=project([plan.hero.x,action.height,plan.hero.z]);if(!foot)return null;const preferred=Math.max(base.zoom,64*foot[2]/(plan.height*pixels)),interpolated=base.zoom+(preferred-base.zoom)*amount,cap=Math.min((w/2-gutter)/(xMax*pixels),(h/2-gutter)/(yMax*pixels)),zoom=Math.min(interpolated,cap);
  if(!(Number.isFinite(zoom)&&zoom>0&&center.every(Number.isFinite)))return null;return {zoom,center,yaw,cameraPitch:pitch};
 }
 function applyCamera(renderer){restoreCutCamera(renderer);const pitchBase=renderer.cameraPitch;if(![15,19].includes(action?.move))return ()=>{};
  const pitch=cameraFor(pitchBase),plan=cutCameraPlans.get(action)?.get(renderer),t=clamp(action.elapsed/action.duration),amount=ease(t/.18)*(1-ease((t-.82)/.18));
  if(cutCameraScope(action)&&plan&&amount>0){const base={zoom:renderer.zoom,center:renderer.center,yaw:renderer.yaw,cameraPitch:pitchBase},applied=closeCutCamera(renderer,plan,base,pitch,amount);if(applied){const lease={owner:action,base,applied,values:Object.fromEntries(Object.entries(applied).map(([k,v])=>[k,Array.isArray(v)?v.slice():v]))};cutCameraFrames.set(renderer,lease);Object.assign(renderer,applied);return ()=>{if(cutCameraFrames.get(renderer)===lease)restoreCutCamera(renderer);};}}
  renderer.cameraPitch=pitch;return ()=>{renderer.cameraPitch=pitchBase;};
 }
 // GameSpeed may run many physics chunks before one draw. Keep every authored
 // gesture and physical contact behind a successful-frame acknowledgement.
 // At very low FPS the presentation takes longer instead of skipping poses.
 function checkpoints(mon,move,phase){
  const score=root.FieldHMChoreography.get(graphic(mon),move),keys=score[phase].map(row=>row[0]);
  keys.push(...(move===15?[.34,.52,.84]:move===57?phase==='board'?[.2]:[.7]:phase==='depart'?[.12,.25,.35,.4,.85]:[.65,.7,.85]));
  const ordered=[...new Set(keys)].sort((a,b)=>a-b),result=[];let previous=0;
  for(const end of ordered){const count=Math.ceil((end-previous)/.08);for(let i=1;i<=count;i++)result.push(i===count?end:previous+(end-previous)*i/count);previous=end;}
  return result;
 }
 function surfProgress(motion){return motion.phase==='wait'?.2*motion.wait/16:motion.phase==='recall'?.7+.3*motion.wait/16:motion.landing?.7*motion.travel:.2+.8*motion.travel;}
 function surfGate064(motion){let gate=surfGates.get(motion);if(!gate){const mon=surfReady()?swimmer():bank.displayMon,p=root.FieldHMProfiles.profile(mon,57),stops=checkpoints(mon,57,motion.landing?'land':'board'),q=surfProgress(motion),from=bank.lastSample?.riderLean??p.riderLean??0;gate={stops,index:stops.findIndex(t=>t>q+1e-9),complete:false,leanOut:motion.landing&&motion.phase==='move'&&motion.travel<=1e-9&&p.riderLean?balanceGate064(from,0):null};if(gate.index<0)gate.index=stops.length;surfGates.set(motion,gate);}return gate;}
 function surfBudget(motion,dt){
  if(!Number.isFinite(dt)||dt<=0)return {dt:0,complete:false};
  if(!surfRenderable())return {dt:0,complete:false};
  const gate=surfGate064(motion),q=surfProgress(motion);
  if(gate.leanOut&&!gate.leanOut.done){advanceBalance064(gate.leanOut,dt);return {dt:0,complete:false};}
  const rate=motion.phase==='wait'?.75:motion.phase==='recall'?1.125:(motion.landing?2.8:3.2)/Math.max(1,motion.cells),stop=gate.stops[gate.index]??1;
  return {dt:Math.max(0,Math.min(dt,(stop-q)/rate)),complete:gate.complete};
 }
 function rendered(renderer){const frame=presented.get(renderer);presented.delete(renderer);if(!frame||document.hidden||renderer.contextLost||renderer.gl?.isContextLost?.())return;
  if(frame.riderBank){if(frame.riderBank!==bank)return;acknowledgeBalance064(bank.leanIn,frame.balanceProgress);if(bank.leanIn?.done)bank.leanIn=null;return;}
  if(frame.motion){const motion=native()?.surfMotion,gate=surfGates.get(frame.motion);if(frame.motion!==motion||!gate||Math.abs(frame.progress-surfProgress(motion))>1e-9)return;if(frame.balanceProgress!==undefined){acknowledgeBalance064(gate.leanOut,frame.balanceProgress);return;}while(gate.index<gate.stops.length&&frame.progress+1e-9>=gate.stops[gate.index])gate.index++;if(frame.progress>=1-1e-9)gate.complete=true;return;}
  if(frame.action!==action||frame.elapsed!==action.elapsed||action.done)return;
  if(action.elapsed+1e-9>=action.checkpoints[action.checkpoint]*action.duration)action.checkpoint++;
  if(action.elapsed>=action.duration){const old=action;releaseCutCameras(old);old.done=true;if(!old.retain)action=null;old.resolve();}
 }
 function tick(dt){if(document.hidden)return;if(bank?.leanIn&&root.SurfField?.mounted()&&!native()?.surfMotion)advanceBalance064(bank.leanIn,dt);if(!action)return;if(action.zone!==native()?.zone&&!action.transfer){const old=action;releaseCutCameras(old);action=null;old.reject(Error('Scena MN sostituita'));return;}if(action.done||!Number.isFinite(dt)||dt<=0)return;
  action.debt=Math.min(action.duration-action.elapsed,action.debt+dt);
  const limit=Math.max(action.elapsed,action.checkpoints[action.checkpoint]*action.duration);
  const elapsed=Math.min(limit,action.elapsed+action.debt);action.debt-=elapsed-action.elapsed;action.elapsed=elapsed;
  if(action.onContact&&!action.committed&&action.elapsed/action.duration>=.52){action.committed=true;try{action.onContact();}catch(error){const old=action;releaseCutCameras(old);action=null;old.reject(error);}}
 }
 async function start(mon,move,{phase=move===19?'depart':'cut',direction=1,target=null,height=0,duration=2,transfer=false,retain=false,onContact=null}={}){
  if(action&&!action.done)throw Error('Azione MN già in corso');await prepare(mon,move);if(action&&!action.done)throw Error('Azione MN già in corso');
  if(!Number.isFinite(duration)||duration<=0)throw Error('Durata MN non valida');
  releaseCutCameras(action);
  const stops=checkpoints(mon,move,phase);
  const finished=new Promise((resolve,reject)=>{action={mon,move,phase,direction,target,height,duration,transfer,retain,onContact,zone:native()?.zone,elapsed:0,debt:0,checkpoints:stops,checkpoint:0,resolve,reject};});if(move===15)void root.AudioEngine?.cry(root.PokemonVisuals.speciesId(mon));return {finished};
 }
 async function run(...args){return (await start(...args)).finished;}
 function clear(){releaseCutCameras();generation++;const old=action;action=null;old?.reject(Error('Azione MN annullata'));bank?.release();bank=null;pending=null;root.FieldHMOshawottCut?.release();root.FieldHMEvolvedCut?.release();}
 root.FieldHMWorld={prepare,present,rendered,inspectCard,copyCard,placement,cameraFor,applyCamera,tick,start,run,end(){if(action?.done){releaseCutCameras(action);action=null;}},dispose,clear,swimmer,surfReady,surfRenderable,surfBudget,rendererStats(renderer){const card=cards.get(renderer),valid=!!card&&renderer.gl.isTexture(card.texture.texture);return {gpuCards:valid?1:0,gpuBytes:valid?512*512*4:0};},get active(){return action;},get retained(){return {banks:bank?1:0,gpuCardBudgetBytes:512*512*4,authoredAtlasBytes:(root.FieldHMOshawottCut?.stats.decodedBytes||0)+(root.FieldHMEvolvedCut?.stats.decodedBytes||0)};}};
})(typeof window==='undefined'?globalThis:window);
