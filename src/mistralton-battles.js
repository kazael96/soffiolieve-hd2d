/* Native IRBI sets, reframed behind a clear, textured HD-2D fighting surface. */
(()=>{
 const contexts={
  coldStorageYardPath:{zone:191,origin:[-604.5,-287.5],back:23,cutoff:-20,floor:'mt-map-51-michi02b'},
  coldStorageYardGrass:{zone:191,origin:[-604.5,-287.5],back:23,cutoff:-20,floor:'mt-map-51-grass01ax'},
  coldStorageYardDark:{zone:191,origin:[-604.5,-287.5],back:23,cutoff:-20,floor:'mt-map-51-grass01ax'},
  coldStorageWarehouse:{zone:192,origin:[-.5,3.5],back:22,cutoff:-20,floor:'mt-map-329-d5_dyuka01',indoor:true,sky:['#2d4455','#677c87']},
  coldStorageIce:{zone:192,origin:[-.5,3.5],back:22,cutoff:-20,floor:'mt-map-329-d5_diceyk',indoor:true,sky:['#2d4455','#677c87']},
  coldStorageRoom:{zone:193,origin:[-11.5,-3.5],back:25,cutoff:-20,floor:'mt-map-532-d5ice_yuka',indoor:true,sky:['#2c4050','#657b86']},
  clayGym:{zone:97,origin:[-.5,4.5],height:-59,back:24,cutoff:-20,floor:'mt-map-524-in27_yuka02',indoor:true,sky:['#201911','#4a3622']},
  clayGymEntrance:{zone:98,origin:[-7.5,-4.5],back:23,cutoff:-20,floor:'mt-map-595-in27y_yuka01',indoor:true,sky:['#31281e','#5d4831']},
  route6Path:{zone:331,origin:[-648.5,-383.5],back:24,cutoff:-21,floor:'mt-map-53-michi01b'},
  route6Grass:{zone:331,origin:[-648.5,-383.5],back:24,cutoff:-21,floor:'mt-map-53-grass01ax'},
  route6Dark:{zone:331,origin:[-648.5,-383.5],back:24,cutoff:-21,floor:'mt-map-53-grass01ax'},
  chargestoneEntrance:{zone:194,origin:[-676.5,-409.5],height:1,back:24,cutoff:-21,floor:'mt-map-55-gake_michi'},
  chargestone1:{zone:195,origin:[.5,1.5],back:24,cutoff:-21,floor:'mt-map-300-d6yuka_001',indoor:true,sky:['#081c2d','#24495a']},
  chargestone2:{zone:196,origin:[25.5,1.5],back:24,cutoff:-21,floor:'mt-map-308-d6yuka_001',indoor:true,sky:['#081c2d','#24495a']},
  chargestone3:{zone:197,origin:[-.5,1.5],back:24,cutoff:-21,floor:'mt-map-310-d6yuka_001',indoor:true,sky:['#081c2d','#24495a']},
  mistraltonTown:{zone:107,origin:[-692.5,-448.5],back:24,cutoff:-20,floor:'mt-map-59-michi02b'},
  mistraltonCenter:{zone:109,origin:[-7.5,-3.5],back:24,cutoff:-20,floor:'mt-map-489-in02_yuka6',indoor:true,sky:['#4d4d3c','#807c61']}
 };
 for(const c of Object.values(contexts)){Object.freeze(c.origin);if(c.sky)Object.freeze(c.sky);Object.freeze(c);}Object.freeze(contexts);
 const far=(species,id,x,height)=>Object.freeze({species,id,x,z:-18.5,height});
 const observers={
  yard:Object.freeze([far('Vanillite',582,-5.9,.46),far('Minccino',572,-3.9,.45),far('Timburr',532,-1.9,.52)]),
  route:Object.freeze([far('Swadloon',541,-5.8,.45),far('Foongus',590,-3.8,.37),far('Karrablast',588,-1.8,.43)]),
  cave:Object.freeze([far('Joltik',595,-5.7,.31),far('Klink',599,-3.8,.43),far('Ferroseed',597,-1.9,.43)])
 };
 function ambient(id){if(/^coldStorageYard/.test(id))return observers.yard;if(/^route6/.test(id))return observers.route;if(/^chargestone[123]$/.test(id))return observers.cave;return contexts[id]?[]:null;}
 function floor(id){const c=contexts[id],key='pinwheel-battle-'+id;if(!c)return null;
  if(!OPENING_ASSETS.textures[c.floor])throw Error('Terreno originale mancante: '+id);
  if(!OPENING_ASSETS.models[key]){const verts=[];for(const i of [0,1,2,2,1,3])verts.push(i%2?48:-48,0,i>=2?24:-64,i%2?1536:0,i>=2?1408:0,1,1,1,0,1,0);OPENING_ASSETS.models[key]={groups:[{texture:c.floor,verts,repeatS:true,repeatT:true}]};}
  return key;
 }
 function instances(id){const c=contexts[id];if(!c)return null;const source=window.MISTRALTON_ASSETS?.scenes[c.zone];if(!source)throw Error('Scenario originale mancante: '+id);const plane=floor(id);
  return [...source.instances.filter(i=>i.actorUid===undefined).map(i=>({...i,x:i.x-c.origin[0],y:i.y-(c.height||0),z:i.z-c.origin[1]-c.back})),{model:plane,x:0,y:0,z:0,rotation:0}];
 }
 async function prepare(id){if(!contexts[id])return false;await window.MistraltonChapter?.ensure();floor(id);return true;}
 const isGround=texture=>/^mt-/.test(texture||'')&&/(?:yuka|diceyk|michi|grass|kaidan|ashiba|kage)/.test(texture);
 Object.assign(PinwheelBattles.contexts,contexts);const before=PinwheelBattles.ambient;PinwheelBattles.ambient=id=>ambient(id)??before(id);
 window.MistraltonBattles={contexts,instances,ambient,prepare,isGround,has:id=>!!contexts[id]};
})();
