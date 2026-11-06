/* Chapter051 geographic ownership. No aggregate geometry is loaded at startup. */
(()=>{
 let surfaces=null,metadataTask=null,sceneWindow;
 async function catalog(file,key){const text=new TextDecoder().decode(await RuntimeAssets.bytes(NativeTextLayout.resource(file))),prefix='window.'+key+'=';if(!text.trimStart().startsWith(prefix))throw Error('Catalogo del capitolo non valido: '+file);return JSON.parse(text.trimStart().slice(prefix.length).trim().replace(/;$/,''));}
 async function metadata(){if(metadataTask)return metadataTask;metadataTask=Promise.resolve().then(async()=>{
  await window.IcirrusChapter?.ensure();const data=await catalog('opelucid-surface-data.js','OPELUCID_SURFACE_DATA');
  surfaces=NativeSurfaces.create({...NATIVE_SURFACE_DATA,grids:{...NATIVE_SURFACE_DATA.grids,...data.grids},scenes:{...NATIVE_SURFACE_DATA.scenes,...data.scenes}});
 }).catch(error=>{metadataTask=null;throw error;});return metadataTask;}
 const resources={bytes:(...args)=>RuntimeAssets.bytes(...args),preloadImages:(...args)=>RuntimeAssets.preloadImages(...args),releaseImages:(...args)=>RuntimeAssets.releaseImages(...args)};
 const variant=z=>{const v=window.OPELUCID_MAP_VARIANTS;return v&&z===v.zone&&window.NativeStory?.state.vars[v.work]===v.value?{key:v.variant,descriptor:{...OPELUCID_SCENES[z],...v.scene},surfaceZone:v.surfaceZone}:null;};
 const loader=OpelucidFamilyLoader.create({manifest:OPELUCID_PARTS,assets:OPENING_ASSETS,resources,onEvict:(name)=>{sceneWindow?.evict(name);if(name==='brycen')window.OpelucidGym?.release();}});
 const legacyScene=z=>window.ICIRRUS_ASSETS?.scenes[z]||window.NIMBASA_ASSETS?.scenes[z]||window.MISTRALTON_ASSETS?.scenes[z];
 sceneWindow=OpelucidSceneWindow.create({metadata:OPELUCID_SCENES,parts:OPELUCID_PARTS,assets:OPENING_ASSETS,loader,
  legacyDescriptor:z=>window.ICIRRUS_SCENES?.[z]||window.NIMBASA_SCENES?.[z]||window.MISTRALTON_SCENES?.[z],legacyScene,
  legacyEnsure:async z=>{if(window.IcirrusChapter?.zones.includes(z))await IcirrusChapter.ensure();else await window.NimbasaChapter?.ensure();},
  variant,surfaces:{at:(z,...args)=>surfaces?.at(variant(z)?.surfaceZone??z,...args)},afterPrepare:async z=>{if(z===114)await window.OpelucidGym?.prepare();}
 }).register();
 const names={7:'Komor',91:'Silvestro',92:'Iris',97:'Nardo',100:'Ghecis',103:'N',104:'Gasparago',105:'Aralia',134:'Belle'};
 for(const [id,paths]of Object.entries(OPELUCID_SPRITES))OPENING_SPRITES[names[id]||'Original'+id]??=paths;
 Object.assign(OPENING_DATA,OPELUCID_DATA.pokemonData);for(const key of ['evolutions','progression','pokemonData','compatibility','machines'])Object.assign(TRAINING_DATA[key],OPELUCID_DATA[key]);TRAINING_DATA.levelCap=OPELUCID_DATA.levelCap;TRAINING_DATA.capSteps=OPELUCID_DATA.capSteps;
 const prepare=sceneWindow.prepare;sceneWindow.prepare=async zone=>{await metadata();return prepare(zone);};
 // Descriptors installed above retain this wrapper, including on a cold saved-map load.
 for(const z of sceneWindow.zones)sceneWindow.scene(z).ensureAssets=()=>sceneWindow.prepare(z);
 function blockedAt(zone,x,z){if([209,211].includes(zone)){const hint=window.NativeStory?.state.railCurrent,native=window.NativeStory?.state;return !window.NativeRails?.locate(zone,x,z,hint?.zone===zone?hint:{height:native?.zone===zone?native.fieldHeight??0:0});}return sceneWindow.blockedAt(zone,x,z);}
 window.OpelucidChapter={...sceneWindow,blockedAt,ensure:zone=>zone===undefined?metadata():sceneWindow.prepare(zone),loader,get ready(){return !!surfaces;}};
 Object.assign(PINWHEEL_RAILS,OPELUCID_RAILS);
})();
