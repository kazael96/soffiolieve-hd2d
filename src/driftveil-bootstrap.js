/* Native chapter data; heavy map geometry remains deferred until arrival. */
(()=>{
 const zones=Object.keys(DRIFTVEIL_EVENTS.zones).map(Number).filter(z=>![77,330].includes(z)),globalZones=[62,329,96];
 for(const zone of zones)if(zone!==62)OPENING_ASSETS.scenes['zone'+zone]={...DRIFTVEIL_SCENES[zone],instances:[],zone,chapter048:true,outdoor:globalZones.includes(zone)||[64,253].includes(zone),assetsPending:true,ensureAssets:async()=>{await ensure();if(zone===63)await DriftveilGym.prepare();}};
 Object.assign(OPENING_DATA,DRIFTVEIL_DATA.pokemonData);
 for(const key of ['evolutions','progression','pokemonData','compatibility','machines'])Object.assign(TRAINING_DATA[key],DRIFTVEIL_DATA[key]);
 TRAINING_DATA.levelCap=DRIFTVEIL_DATA.levelCap;
 const names={7:'Komor',134:'Belle',105:'Aralia',103:'N',88:'Camelia',89:'Rafan',97:'Nardo'};let task=null;
 function ensure(){if(task)return task;task=Promise.resolve().then(async()=>{
  if(!window.DRIFTVEIL_ASSETS){const url=NativeTextLayout.resource('driftveil-assets.js'),raw=await RuntimeAssets.bytes(url),tag=document.createElement('script');tag.textContent=new TextDecoder().decode(raw)+'\n//# sourceURL='+new URL(url,location.href).href;document.body.append(tag);tag.remove();if(!window.DRIFTVEIL_ASSETS)throw Error('Risorse del capitolo incomplete');}
  const data=DRIFTVEIL_ASSETS;Object.assign(OPENING_ASSETS.models,data.models);Object.assign(OPENING_ASSETS.textures,data.textures);
  for(const [id,paths]of Object.entries(data.sprites))OPENING_SPRITES[names[id]||'Original'+id]??=paths;
  for(const zone of zones)if(zone!==62){Object.assign(OPENING_ASSETS.scenes['zone'+zone],data.scenes[zone]);OPENING_ASSETS.scenes['zone'+zone].assetsPending=false;}
  await RuntimeAssets.preloadImages(NativeTextLayout.resource('assets/driftveil-pack.bin'));return true;
 }).catch(error=>{task=null;throw error;});return task;}
 window.DriftveilChapter={zones,globalZones,ensure};
})();
