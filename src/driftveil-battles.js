/* Battle clearings use the actual native scenery of each newly playable place. */
(()=>{
 const contexts={
  elesaGym:{zone:63,origin:[12.5,-11.5],height:2,back:18,cutoff:-14,floor:'dv-map-520-c4g_yuka01',tint:[.12,.45,.55],indoor:true},
  nimbasaPark:{zone:64,origin:[37.5,-.5],height:1,back:20,cutoff:-16,floor:'dv-map-121-out36_yuka01'},
  route5Path:{zone:329,origin:[-426.5,-315.5],back:18,cutoff:-18,floor:'dv-map-43-michi02b'},
  route5Grass:{zone:329,origin:[-438.5,-320.5],back:18,cutoff:-18,floor:'dv-map-43-grass01ax'},
  route5Dark:{zone:329,origin:[-415.5,-327.5],back:18,cutoff:-18,floor:'dv-map-43-grass01ax'},
  driftveilBridge:{zone:253,origin:[112,48],back:18,cutoff:-14,floor:'dv-map-123-h02_hasi2'},
  driftveilTown:{zone:96,origin:[-580.5,-322.5],back:18,cutoff:-16,floor:'dv-map-48-out9_michi'}
 };
 Object.assign(PinwheelBattles.contexts,contexts);
 function instances(id){const c=contexts[id];if(!c)return null;const floor='pinwheel-battle-'+id;
  if(!OPENING_ASSETS.textures[c.floor])throw Error('Terreno originale mancante: '+id);
  if(!OPENING_ASSETS.models[floor]){const verts=[];for(const i of [0,1,2,2,1,3])verts.push(i%2?48:-48,0,i>=2?24:-64,i%2?1536:0,i>=2?1408:0,...(c.tint||[1,1,1]),0,1,0);OPENING_ASSETS.models[floor]={groups:[{texture:c.floor,verts,repeatS:true,repeatT:true}]};}
  return [...OPENING_ASSETS.scenes['zone'+c.zone].instances.filter(i=>i.cart===undefined&&i.switch===undefined).map(i=>({...i,x:i.x-c.origin[0],y:i.y-(c.height||0),z:i.z-c.origin[1]-c.back})),{model:floor,x:0,y:0,z:0,rotation:0}];
 }
 const ambient=[{species:'Minccino',id:572,x:-7.5,z:-17.5,height:.48},{species:'Gothita',id:574,x:-4.5,z:-17.5,height:.5},{species:'Trubbish',id:568,x:-1.5,z:-17.5,height:.46}],before=PinwheelBattles.ambient;
 PinwheelBattles.ambient=id=>['route5Path','route5Grass','route5Dark'].includes(id)?ambient:contexts[id]?[]:before(id);
 window.DriftveilBattles={contexts,instances,has:id=>!!contexts[id]};
})();


