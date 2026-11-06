/* Chapter050 native scenes. Only neighboring outdoor cells share a window. */
(()=>{
 const zones=Object.keys(ICIRRUS_EVENTS.zones).map(Number),globalZones=[107,337,198,113],neighbors={107:[194,337],337:[107,198],198:[337,113],113:[198]},owned=new Map();let task=null,surfaces=null;
 const members=z=>[z,...(neighbors[z]||[])],descriptor=z=>window.IcirrusSeasons?.scene(z)||ICIRRUS_SCENES[z]||window.MISTRALTON_SCENES?.[z];
 const crosses=(a,b)=>[[107,337],[337,198]].some(p=>p.includes(a)&&p.includes(b));
 const grids=z=>members(z).flatMap(id=>descriptor(id)?.permissionGrids||[]);
 for(const zone of zones){const scene={...ICIRRUS_SCENES[zone],permissionGrids:grids(zone),instances:[],zone,chapter050:true,outdoor:globalZones.includes(zone)||[199,342].includes(zone),verticalMap:true,...(zone===342?{clearColor:[.7,.75,.77]}:{}),...(window.ICIRRUS_RAILS?.[zone]?{railZone:zone}:{}),assetsPending:true,ensureAssets:async()=>{await ensure();await window.IcirrusSeasons?.prepare(zone);window.IcirrusFieldModels?.install();if(zone===108)await window.IcirrusGym?.prepare();}};OPENING_ASSETS.scenes['zone'+zone]=scene;owned.set(zone,scene);}
 Object.assign(OPENING_DATA,ICIRRUS_DATA.pokemonData);
 for(const key of ['evolutions','progression','pokemonData','compatibility','machines'])Object.assign(TRAINING_DATA[key],ICIRRUS_DATA[key]);
 TRAINING_DATA.levelCap=ICIRRUS_DATA.levelCap;TRAINING_DATA.capSteps=ICIRRUS_DATA.capSteps;
 const names={7:'Komor',90:'Anemone',97:'Nardo',103:'N',104:'Gasparago',105:'Aralia',134:'Belle'};
 async function script(file,globalName){if(window[globalName])return;const url=NativeTextLayout.resource(file),bytes=await RuntimeAssets.bytes(url),tag=document.createElement('script');tag.textContent=new TextDecoder().decode(bytes)+'\n//# sourceURL='+new URL(url,location.href).href;document.body.append(tag);tag.remove();if(!window[globalName])throw Error('Risorsa del capitolo incompleta: '+file);}
 function ensure(){if(task)return task;task=Promise.resolve().then(async()=>{
  await Promise.all([script('icirrus-assets.js','ICIRRUS_ASSETS'),script('native-surface-data.js','NATIVE_SURFACE_DATA'),window.MistraltonChapter?.ensure()]);
  const d=ICIRRUS_ASSETS;Object.assign(OPENING_ASSETS.models,d.models);Object.assign(OPENING_ASSETS.textures,d.textures);
  for(const[id,paths]of Object.entries(d.sprites))OPENING_SPRITES[names[id]||'Original'+id]??=paths;
  for(const[z,scene]of owned)if(OPENING_ASSETS.scenes['zone'+z]===scene){Object.assign(scene,d.scenes[z]);scene.permissionGrids=grids(z);scene.instances=[...members(z).flatMap(id=>(d.scenes[id]||window.MISTRALTON_ASSETS?.scenes[id])?.instances||[]),...(d.visualSurroundings?.[z]?.instances||[])];scene.assetsPending=false;}
  await window.IcirrusSeasons?.prepare(199,{images:false});
  await RuntimeAssets.preloadImages(NativeTextLayout.resource('assets/icirrus-pack.bin'));surfaces=NativeSurfaces.create(NATIVE_SURFACE_DATA);return true;
 }).catch(error=>{task=null;throw error;});return task;}
 function fieldAt(x,z){return globalZones.find(id=>descriptor(id).permissionGrids.some(g=>x>=g.x-16&&x<g.x+16&&z>=g.z-16&&z<g.z+16))??null;}
 function visualFieldAt(zone,x,z){const rows=window.ICIRRUS_ASSETS?.visualSurroundings?.[zone]?.cells||[];return rows.find(g=>x>=g.x-16&&x<g.x+16&&z>=g.z-16&&z<g.z+16)?.zone??null;}
 function boundaryBlocked(zone,x,z){if(!globalZones.includes(zone))return false;const next=fieldAt(x,z);return next!==null&&next!==zone&&!crosses(zone,next);}
 function blockedAt(zone,x,z){if(boundaryBlocked(zone,x,z))return true;const grid=grids(zone).find(g=>x>=g.x-16&&x<g.x+16&&z>=g.z-16&&z<g.z+16);if(!grid)return true;const at=8+((Math.floor(z-grid.z)+16)*32+Math.floor(x-grid.x)+16)*8;return !!(grid.bytes[at+2]&1);}
 function surfaceAt(zone,x,z,height=0){return surfaces?.at(zone,x,z,height,window.IcirrusSeasons?.scene(zone)?.surfaces)||null;}
 window.IcirrusChapter={get ready(){return !!surfaces;},crosses,boundaryBlocked,visualFieldAt,zones,globalZones,members,grids,ensure,fieldAt,blockedAt,surfaceAt,sameField:(a,b)=>a===b||members(a).includes(b)};
})();
