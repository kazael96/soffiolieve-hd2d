/* Native Route 3, Wellspring Cave and Nacrene arrival maps. */
(()=>{
 if(!window.ROUTE3_ASSETS)return;
 Object.assign(OPENING_ASSETS.models,ROUTE3_ASSETS.models);Object.assign(OPENING_ASSETS.textures,ROUTE3_ASSETS.textures);Object.assign(OPENING_DATA,ROUTE3_DATA.pokemonData);
 // A level battle staging area uses the original cave floor material. The
 // field map's cliffs stay in the distance instead of intersecting combatants.
 const floor=[];for(const i of [0,1,2,2,1,3])floor.push(i%2?32:-32,0,i>=2?20:-28,i%2?1024:0,i>=2?768:0,1,1,1,0,1,0);
 const wall=[];for(const i of [0,1,2,2,1,3])wall.push(i%2?32:-32,i>=2?9:0,-14,i%2?1024:0,i>=2?0:192,.8,.83,.9,0,0,1);
 OPENING_ASSETS.models['route3-battle-floor']={groups:[{texture:'acc-map-356-d0yuka_001',verts:floor,repeatS:true,repeatT:true},{texture:'acc-map-356-d0gake_001',verts:wall,repeatS:true,repeatT:true}]};
 OPENING_ASSETS.models['route3-city-floor']={groups:[{texture:'acc-map-17-michi02b',verts:floor,repeatS:true,repeatT:true}]};
 for(const zone of [321,16]){const scene=ROUTE3_ASSETS.scenes[zone],north=OPENING_ASSETS.scenes.north;for(const g of scene.permissionGrids)if(!north.permissionGrids.some(p=>p.x===g.x&&p.z===g.z))north.permissionGrids.push(g);north.instances.push(...scene.instances);}
 for(const zone of [322,323,324,27,20])OPENING_ASSETS.scenes['zone'+zone]={...ROUTE3_ASSETS.scenes[zone],chapter042:true,outdoor:false,cave:zone===324};
 for(const [id,paths]of Object.entries(ROUTE3_ASSETS.sprites))OPENING_SPRITES[{7:'Komor',134:'Belle',105:'Aralia',103:'N'}[id]||'Original'+id]??=paths;
})();
