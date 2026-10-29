/* Original Route 2 and Striaton assets, merged before GPU resource creation. */
(()=>{
 if(!window.ROUTE2_ASSETS)return;
 Object.assign(OPENING_ASSETS.models,ROUTE2_ASSETS.models);Object.assign(OPENING_ASSETS.textures,ROUTE2_ASSETS.textures);Object.assign(OPENING_DATA,ROUTE2_DATA.pokemonData);
 const north=OPENING_ASSETS.scenes.north;
 for(const zone of [319,6]){const scene=ROUTE2_ASSETS.scenes[zone];for(const g of scene.permissionGrids)if(!north.permissionGrids.some(p=>p.x===g.x&&p.z===g.z))north.permissionGrids.push(g);for(const i of scene.instances){if(zone===319&&i.x>=-48&&i.x< -16&&i.z>=-112&&i.z< -80)continue;north.instances.push(i);}}
 OPENING_ASSETS.scenes.zone8=ROUTE2_ASSETS.scenes[8];
 const names={147:'Mamma',134:'Belle'};for(const [id,paths]of Object.entries(ROUTE2_ASSETS.sprites))OPENING_SPRITES[names[id]||'Original'+id]??=paths;
})();
