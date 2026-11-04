/* Native Surf resources, shore controls and HD-2D presentation. */
(()=>{
 let dataTask=null,catalog=null,rideModel=null,sprayModel=null;
 const uploads=new WeakMap(),native=()=>window.NativeStory?.state||window.Journey?.state.original;
 const mounted=()=>native()?.surf===true;
 function surface(zone,x,z,height=0){
  const original=window.IcirrusChapter?.surfaceAt(zone,x,z,height);if(original)return original;
  const scene=window.OPENING_ASSETS?.scenes['zone'+zone]||renderer.scene;
  const grid=scene?.permissionGrids?.find(g=>x>=g.x-16&&x<g.x+16&&z>=g.z-16&&z<g.z+16);if(!grid)return null;
  const at=8+((Math.floor(z-grid.z)+16)*32+Math.floor(x-grid.x)+16)*8;
  return {behavior:grid.bytes[at]|grid.bytes[at+1]<<8,flags:grid.bytes[at+2]|grid.bytes[at+3]<<8,height};
 }
 const motion=SurfFieldMotion.create({state:native,hero:()=>player,party:()=>Journey.state.party,surface,occupied:(x,z)=>NativeStory.occupied(x,z),direction:()=>facing/3,
  save:()=>Journey.save(true),music:()=>AudioEngine.setScene(NativeStory.music),prepare:async()=>{
   await prepareAssets();const h=renderer.groundHeight(player.x,player.y);native().fieldHeight=IcirrusChapter.surfaceAt(native().zone,player.x,player.y,h)?.height??h;
   await renderer.requireActors([...NativeStory.visualActors(),{name:'AlcideSurf'}]);
  }});
 function prepareAssets(){if(dataTask)return dataTask;dataTask=Promise.resolve().then(async()=>{
  if(!window.SURF_FIELD_ASSETS){const url=NativeTextLayout.resource('surf-field-assets.js'),bytes=await RuntimeAssets.bytes(url),script=document.createElement('script');script.textContent=new TextDecoder().decode(bytes);document.body.append(script);script.remove();}
  catalog=SURF_FIELD_ASSETS;Object.assign(OPENING_ASSETS.models,catalog.models);Object.assign(OPENING_ASSETS.textures,catalog.textures);Object.assign(OPENING_SPRITES,catalog.sprites);
  await IcirrusChapter.ensure();[rideModel,sprayModel]=await Promise.all([StarterScene.loadGLB(catalog.urls.sea_ride),StarterScene.loadGLB(catalog.urls.shibuki01)]);return true;
 }).catch(error=>{dataTask=null;throw error;});return dataTask;}
 function wanted(){return mounted()||motion.preparing;}
 function resources(){return wanted()&&catalog?{models:Object.keys(catalog.models),textures:Object.keys(catalog.textures),sprite:'AlcideSurf'}:{models:[],textures:[]};}
 function actor(frame){if(!mounted())return {};const direction=Math.floor(frame%12/3),contact=catalog?.riderContact,support=contact?.supportY||0,padding=contact?.footPadding.AlcideSurf[direction]||0;return {name:'AlcideSurf',hero:true,frame:direction*3,height:(native().fieldHeight||0)+support-padding,noShadow:true};}
 function instances(time,isMoving){if(!mounted()||!catalog)return [];const d=facing/3,h=native().fieldHeight||0,offset=catalog.directions.sprayOffsetQ16[d];return [
  {model:'surf-sea_ride',x:player.x,y:h,z:player.y,rotation:catalog.directions.rideYaw[d]*Math.PI/32768},
  ...(isMoving?[{model:'surf-shibuki01',x:player.x+offset[0]/65536,y:h+offset[1]/65536,z:player.y+offset[2]/65536,rotation:catalog.directions.sprayYaw[d]*Math.PI/32768}]:[])
 ];}
 function apply(renderer,time,isMoving){if(!mounted()||!sprayModel||!isMoving)return;
  const track=sprayModel.animationSets[0]||[],duration=Math.max(1,...track.map(t=>(t.times.at(-1)||0)*60)),frame=Math.floor(time*60)%duration,key=renderer.resourceEpoch+':'+frame;if(uploads.get(renderer)===key)return;
  const groups=FieldModels.geometry(sprayModel,{},0,frame),old=renderer.models['surf-shibuki01']||[],gl=renderer.gl;
  renderer.models['surf-shibuki01']=groups.map((group,i)=>{const image=sprayModel.doc.images[sprayModel.doc.textures[group.textureIndex].source],texture='surf-shibuki01-'+image.uri.split('/').pop().replace(/\.png$/,''),buf=old[i]?.buf||gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(group.verts),gl.DYNAMIC_DRAW);return {...group,texture,buf,count:group.verts.length/11,transparent:true};});for(const group of old.slice(groups.length))gl.deleteBuffer(group.buf);uploads.set(renderer,key);
 }
 function tick(dt){motion.tick(dt);if(mounted()&&!motion.busy){const p=surface(native().zone,player.x,player.y,native().fieldHeight||0);if(p)native().fieldHeight=p.height;}}
 function blocked(x,z,forPlayer=false){if(!forPlayer)return null;if(mounted())return motion.blocked(x,z);const h=renderer.groundHeight(player.x,player.y),row=surface(native()?.zone,x,z,h);return row?.flags&2?true:null;}
 function canStart(index){if(mounted()||motion.user(index)<0)return false;native().fieldHeight=renderer.groundHeight(player.x,player.y);return !!motion.coast();}
 function enter(){const n=native();if(!n?.surf&&!n?.surfMotion)return;if(n.surfMotion?.zone!==n.zone)delete n.surfMotion;motion.restore();}
 function restore(){if(!mounted()&&!native()?.surfMotion)return false;void renderer.queueAssets().then(()=>{motion.restore();AudioEngine.setScene(NativeStory.music);});return true;}
 async function play(mon){
  const prepare=()=>ROM_SPRITE_ANIM.prepare([mon]);if(renderer.resourceGate)await renderer.resourceGate('surf-cut-in',prepare);else await prepare();
  const release=ROM_SPRITE_ANIM.pin?.([mon])||(()=>{}),canvas=document.createElement('canvas');canvas.id='nativeSurfCutIn';canvas.width=768;canvas.height=384;canvas.setAttribute('aria-label',(mon.nickname||mon.name)+' usa Surf');
  Object.assign(canvas.style,{position:'fixed',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:'min(100vw,200vh,768px)',height:'auto',zIndex:'1500',pointerEvents:'none',background:'rgba(8,40,64,.88)'});
  const context=canvas.getContext('2d'),graphic=PokemonVisuals.graphic(mon),id=PokemonVisuals.speciesId(mon),profile=SpeciesMoves.select(id,57);let request;
  try{if(!profile)throw Error('Coreografia Surf non disponibile per '+mon.name);document.body.append(canvas);void AudioEngine.cry(id);
   await new Promise((resolve,reject)=>{let last,elapsed=0;const tick=now=>{try{last??=now;elapsed+=(now-last)*(window.GameSpeed?.rate||1);last=now;const progress=Math.min(1,elapsed/1000),pose=SpeciesMoves.sample(profile,progress*profile.frames,'p1');context.clearRect(0,0,768,384);ROM_SPRITE_ANIM.draw(context,graphic,false,128+512*progress,300,2.6,elapsed/1000,false,pose);if(progress===1)resolve();else request=requestAnimationFrame(tick);}catch(error){reject(error);}};request=requestAnimationFrame(tick);});
  }finally{if(request)cancelAnimationFrame(request);canvas.remove();release();}
 }
 function encounters(){return mounted()?(catalog?.encounters[native().zone]?.seasons[new Date().getMonth()%4]||{rate:0,slots:[]}):null;}
 function music(){return mounted()&&catalog?.musicFlags[native().zone]?1013:null;}
 window.SurfField={motion,play,prepareAssets,resources,actor,instances,apply,tick,blocked,restore,enter,music,encounters,mounted,knows:motion.known,canStart,start:(index)=>renderer.resourceGate?renderer.resourceGate('surf-entry',()=>motion.start(index)):motion.start(index),tryStep:motion.tryLanding,get busy(){return motion.busy;},get preparing(){return motion.preparing;},get checkpointable(){return !!native()?.surfMotion;}};
})();
