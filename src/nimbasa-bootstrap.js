/* Small collision descriptors at startup; chapter geometry loads on arrival. */
(()=>{
 const zones=Object.keys(NIMBASA_EVENTS.zones).map(Number),globalZones=[326,62];
 for(const zone of zones)OPENING_ASSETS.scenes['zone'+zone]={...NIMBASA_SCENES[zone],instances:[],zone,chapter047:true,outdoor:globalZones.includes(zone),assetsPending:true,ensureAssets:()=>ensure()};
 Object.assign(OPENING_DATA,NIMBASA_DATA.pokemonData);
 for(const key of ['evolutions','progression','pokemonData','compatibility','machines'])Object.assign(TRAINING_DATA[key],NIMBASA_DATA[key]);
 const names={2:'AlcideBike',7:'Komor',134:'Belle',105:'Aralia'};let task=null;
 function ensure(){if(task)return task;task=Promise.resolve().then(async()=>{
  if(!window.NIMBASA_ASSETS){const url=NativeTextLayout.resource('nimbasa-assets.js'),raw=await RuntimeAssets.bytes(url),tag=document.createElement('script');tag.textContent=new TextDecoder().decode(raw)+'\n//# sourceURL='+new URL(url,location.href).href;document.body.append(tag);tag.remove();if(!window.NIMBASA_ASSETS)throw Error('Risorse del Percorso 4 incomplete');}
  const data=NIMBASA_ASSETS;Object.assign(OPENING_ASSETS.models,data.models);Object.assign(OPENING_ASSETS.textures,data.textures);
  for(const [id,paths]of Object.entries(data.sprites))OPENING_SPRITES[names[id]||'Original'+id]??=paths;
  for(const zone of zones){Object.assign(OPENING_ASSETS.scenes['zone'+zone],data.scenes[zone]);OPENING_ASSETS.scenes['zone'+zone].assetsPending=false;}
  await RuntimeAssets.preloadImages(NativeTextLayout.resource('assets/nimbasa-pack.bin'));return true;
 }).catch(error=>{task=null;throw error;});return task;}
 window.NimbasaChapter={zones,globalZones,ensure};
})();
