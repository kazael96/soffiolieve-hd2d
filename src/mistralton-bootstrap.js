/* Native Cold Storage/Route6/Chargestone maps. Heavy geometry stays deferred. */
(()=>{
 const zones=Object.keys(MISTRALTON_EVENTS.zones).map(Number),globalZones=[96,191,331,194,107],groups=[[96,191],[331,194]],ownedScenes=new Map(),members=z=>groups.find(g=>g.includes(z))||[z];let task=null;
 function grids(z){return members(z).flatMap(id=>MISTRALTON_SCENES[id].permissionGrids);}
 for(const zone of zones)if(!OPENING_ASSETS.scenes['zone'+zone]?.chapter050){const scene=OPENING_ASSETS.scenes['zone'+zone]={...MISTRALTON_SCENES[zone],permissionGrids:grids(zone),instances:[],zone,chapter049:true,verticalMap:zone===97,outdoor:globalZones.includes(zone),assetsPending:true,ensureAssets:async()=>{await ensure();window.MistraltonDoors?.install();if([97,98].includes(zone)){await window.MistraltonGym?.prepare();if(window.AudioEngine?.enabled)await AudioEngine.preloadEvents([1738,1739,1741,1754].map(id=>({kind:'sfx',id})));}if([192,194,195,196,197].includes(zone)){await window.MistraltonPuzzles?.prepare();if([195,196,197].includes(zone)&&window.AudioEngine?.enabled)await AudioEngine.preloadEvents([1370,1698,1699,1742].map(id=>({kind:"sfx",id})));}}};ownedScenes.set(zone,scene);}
 Object.assign(OPENING_DATA,MISTRALTON_DATA.pokemonData);
 for(const key of ['evolutions','progression','pokemonData','compatibility','machines'])Object.assign(TRAINING_DATA[key],MISTRALTON_DATA[key]);
 TRAINING_DATA.levelCap=MISTRALTON_DATA.levelCap;TRAINING_DATA.capSteps=MISTRALTON_DATA.capSteps;
 const names={7:'Komor',134:'Belle',105:'Aralia',103:'N',192:'Violante',89:'Rafan',90:'Anemone',104:'Rutilo',182:'Triade'};
 async function ensure(){if(task)return task;task=Promise.resolve().then(async()=>{
  if(!window.MISTRALTON_ASSETS){const url=NativeTextLayout.resource('mistralton-assets.js'),raw=await RuntimeAssets.bytes(url),tag=document.createElement('script');tag.textContent=new TextDecoder().decode(raw)+'\n//# sourceURL='+new URL(url,location.href).href;document.body.append(tag);tag.remove();if(!window.MISTRALTON_ASSETS)throw Error('Risorse della Cava e di Ponentopoli incomplete');}
  const d=MISTRALTON_ASSETS;Object.assign(OPENING_ASSETS.models,d.models);Object.assign(OPENING_ASSETS.textures,d.textures);
  for(const [id,paths]of Object.entries(d.sprites))OPENING_SPRITES[names[id]||'Original'+id]??=paths;
  for(const [z,scene]of ownedScenes)if(OPENING_ASSETS.scenes['zone'+z]===scene){Object.assign(scene,d.scenes[z]);scene.permissionGrids=grids(z);scene.instances=members(z).flatMap(id=>d.scenes[id].instances);scene.assetsPending=false;}
  await RuntimeAssets.preloadImages(NativeTextLayout.resource('assets/mistralton-pack.bin'));return true;
 }).catch(e=>{task=null;throw e;});return task;}
 function zoneAt(zone,p){if(!groups.some(g=>g.includes(zone)))return zone;return members(zone).find(id=>MISTRALTON_SCENES[id].permissionGrids.some(g=>p.x>=g.x-16&&p.x<g.x+16&&p.y>=g.z-16&&p.y<g.z+16))??zone;}
 function blockedAt(zone,x,y){const g=grids(zone).find(g=>x>=g.x-16&&x<g.x+16&&y>=g.z-16&&y<g.z+16);return !g||!!(g.bytes[8+((Math.floor(y-g.z)+16)*32+Math.floor(x-g.x)+16)*8+2]&1);}
 function fieldAt(x,y){return globalZones.find(id=>MISTRALTON_SCENES[id].permissionGrids.some(g=>x>=g.x-16&&x<g.x+16&&y>=g.z-16&&y<g.z+16))??null;}
 window.MistraltonChapter={zones,globalZones,groups,members,grids,ensure,zoneAt,blockedAt,fieldAt,sameField:(a,b)=>members(a).includes(b)};
})();
