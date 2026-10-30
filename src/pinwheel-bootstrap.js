/* Original museum, library, forest, bridge and Castelia waterfront resources. */
(()=>{
 if(!window.PINWHEEL_ASSETS)return;
 Object.assign(OPENING_ASSETS.models,PINWHEEL_ASSETS.models);Object.assign(OPENING_ASSETS.textures,PINWHEEL_ASSETS.textures);
 Object.assign(OPENING_DATA,PINWHEEL_DATA.pokemonData);
 // The current field uses daylight. Native lamp cones are switched off in this lighting state.
 PINWHEEL_ASSETS.scenes[28].instances=PINWHEEL_ASSETS.scenes[28].instances.filter(i=>i.nativeModelId!==194);
 // The native bookshelf moves with actor 185 (three tiles east). Keep its
 // original triangles separate so the HD-2D renderer can follow that actor.
 const library=OPENING_ASSETS.models['pw-map-518'],moving=[];
 for(const group of library.groups){
  if(!/book|tana|kage/.test(group.texture||''))continue;
  const fixed=[],verts=[];
  for(let i=0;i<group.verts.length;i+=33){const triangle=group.verts.slice(i,i+33),inside=[0,11,22].every(k=>triangle[k]>=-5.05&&triangle[k]<=-.95&&triangle[k+2]>=-7.6&&triangle[k+2]<=-2.45);(inside?verts:fixed).push(...triangle);}
  if(verts.length)moving.push({...group,verts});group.verts=fixed;
 }
 if(!moving.length)throw Error('Geometria della libreria mobile non trovata');
 OPENING_ASSETS.models['pinwheel-library-moving']={groups:moving};
 PINWHEEL_ASSETS.scenes[18].instances.push({model:'pinwheel-library-moving',x:0,y:0,z:0,rotation:0,libraryMover:true});
 for(const [zone,data]of Object.entries(PINWHEEL_EVENTS.zones)){if(!PINWHEEL_ASSETS.scenes[zone])continue;for(const actor of data.actors){const special=PINWHEEL_ASSETS.specialActors?.[actor.model];if(!special)continue;PINWHEEL_ASSETS.scenes[zone].instances.push({model:special.model,actorUid:actor.id,x:actor.x-15.5,y:actor.y/65536,z:actor.z-15.5,rotation:0});}}const forest=PINWHEEL_ASSETS.scenes[154],north=OPENING_ASSETS.scenes.north;
 for(const g of forest.permissionGrids)if(!north.permissionGrids.some(p=>p.x===g.x&&p.z===g.z))north.permissionGrids.push(g);
 north.instances.push(...forest.instances);
 for(const zone of [17,18,19,155,250,251,252,249,28,41]){
  const outdoor=[155,250,249,28].includes(zone);
  OPENING_ASSETS.scenes['zone'+zone]={...PINWHEEL_ASSETS.scenes[zone],chapter043:true,outdoor,...(NativeRails.has(zone)?{railZone:zone}:{}),zone};
 }
 for(const [id,paths]of Object.entries(PINWHEEL_ASSETS.sprites))OPENING_SPRITES[{7:'Komor',134:'Belle',105:'Aralia',86:'Aloé',87:'Artemisio',76:'Cirillo'}[id]||'Original'+id]??=paths;
 for(const [zone,data]of Object.entries(PINWHEEL_EVENTS.zones))if(NativeRails.has(zone)){
  data.actors=data.actors.map(n=>NativeRails.actor(zone,n));
  data.background=data.background.map(n=>{const p=NativeRails.position(zone,n.x&65535,n.x>>>16,n.z<<16>>16);return {...n,railOriginal:{...n},x:Math.floor(p.x),z:Math.floor(p.z),y:Math.round(p.height*65536)};});
 }
})();
