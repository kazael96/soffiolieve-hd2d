/* Register small descriptors at startup; the city geometry loads on arrival. */
(()=>{
 Object.assign(PINWHEEL_RAILS,CASTELIA_RAILS);
 const zones=Object.keys(CASTELIA_EVENTS.zones).map(Number),outdoor=[28,30,31,32,33,34,35,38,40];
 for(const zone of zones){
  const scene=OPENING_ASSETS.scenes['zone'+zone]||{...CASTELIA_SCENES[zone],instances:[],zone,outdoor:outdoor.includes(zone),...(NativeRails.has(zone)?{railZone:zone}:{})};
  Object.assign(scene,{chapter046:true,assetsPending:true,ensureAssets:async()=>{await ensure();if(zone===29)await CasteliaGym.prepare();}});OPENING_ASSETS.scenes['zone'+zone]=scene;
 }
 for(const [zone,data]of Object.entries(CASTELIA_EVENTS.zones))if(NativeRails.has(+zone)){
  data.actors=data.actors.map(n=>n.rail?NativeRails.actor(+zone,n):n);
  data.background=data.background.map(n=>{if(!n.rail)return n;const p=NativeRails.position(+zone,n.x&65535,n.x>>>16,n.z<<16>>16);return {...n,railOriginal:{...n},x:Math.floor(p.x),z:Math.floor(p.z),y:Math.round(p.height*65536)};});
 }
 Object.assign(OPENING_DATA,CASTELIA_DATA.pokemonData);
 for(const key of ['evolutions','progression','pokemonData','compatibility','machines'])Object.assign(TRAINING_DATA[key],CASTELIA_DATA[key]);
 const names={7:'Komor',134:'Belle',87:'Artemisio',100:'Ghecis',92:'Iris'};
 let task=null;
 function ensure(){if(task)return task;task=Promise.resolve().then(async()=>{
  if(!window.CASTELIA_ASSETS){const url=NativeTextLayout.resource('castelia-assets.js'),raw=await RuntimeAssets.bytes(url),tag=document.createElement('script');tag.textContent=new TextDecoder().decode(raw)+'\n//# sourceURL='+new URL(url,location.href).href;document.body.append(tag);tag.remove();if(!window.CASTELIA_ASSETS)throw Error('Risorse di Austropoli incomplete');}
  const data=CASTELIA_ASSETS;Object.assign(OPENING_ASSETS.models,data.models);Object.assign(OPENING_ASSETS.textures,data.textures);
  for(const [id,paths]of Object.entries(data.sprites))OPENING_SPRITES[names[id]||'Original'+id]??=paths;
  for(const zone of zones){const scene=OPENING_ASSETS.scenes['zone'+zone];if(data.scenes[zone])Object.assign(scene,data.scenes[zone]);scene.assetsPending=false;}
  await RuntimeAssets.preloadImages(NativeTextLayout.resource('assets/castelia-pack.bin'));
  return true;
 }).catch(error=>{task=null;throw error;});return task;}
 window.CasteliaChapter={zones,ensure};
})();
