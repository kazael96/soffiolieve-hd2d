/* Merge extracted chapter assets before the renderer builds its GPU resources. */
(() => {
  if(!window.ACCUMULA_ASSETS)return;
  Object.assign(OPENING_ASSETS.models,ACCUMULA_ASSETS.models);
  Object.assign(OPENING_ASSETS.textures,ACCUMULA_ASSETS.textures);
  Object.assign(OPENING_DATA,ACCUMULA_ASSETS.pokemonData);
  for(const [zone,scene] of Object.entries(ACCUMULA_ASSETS.scenes))OPENING_ASSETS.scenes['zone'+zone]=scene;
  // IRBI map514's gate floor is level at -1/8 tile. The rear ceiling at
  // 5.5 tiles overlaps both entrances, so its highest triangle is not ground.
  OPENING_ASSETS.scenes.zone320.groundPlane=-.125;
  const names={7:'Komor',105:'Aralia',134:'Belle',103:'N',100:'Ghecis',18:'Viandante',24:'Padre'};
  for(const [id,paths] of Object.entries(ACCUMULA_ASSETS.sprites))OPENING_SPRITES[names[id]||'Original'+id]??=paths;
})();
