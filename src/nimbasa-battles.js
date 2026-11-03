/* Place-specific compositions from the original Route 4 / Nimbasa geometry. */
(()=>{
 const contexts={
  route4Road:{zone:326,origin:[-353.5,-166.5],back:18,cutoff:-20,floor:'nb-map-31-michi02b'},
  route4Sand:{zone:326,origin:[-374.5,-201.5],back:16,cutoff:-22,floor:'nb-map-31-sabaku01'},
  route4Coast:{zone:326,origin:[-394.5,-167.5],back:14,cutoff:-18,floor:'nb-map-31-sabaku01'},
  nimbasaTown:{zone:62,origin:[-353.5,-281.5],height:1,back:18,cutoff:-16,floor:'nb-map-39-out07_yuka01'}
 };
 Object.assign(PinwheelBattles.contexts,contexts);
 function instances(id){const c=contexts[id];if(!c)return null;const floor='pinwheel-battle-'+id;
  if(!OPENING_ASSETS.textures[c.floor])throw Error('Terreno originale mancante: '+id);
  if(!OPENING_ASSETS.models[floor]){
   const quad=(left,right,y)=>{const v=[];for(const i of [0,1,2,2,1,3])v.push(i%2?right:left,y,i>=2?24:-64,i%2?(right-left)*16:0,i>=2?1408:0,1,1,1,0,1,0);return v;};
   const coast=id==='route4Coast',groups=[{texture:c.floor,verts:quad(coast?-10:-48,48,0),repeatS:true,repeatT:true}];
   if(coast){groups.push({texture:'nb-map-35-sea_mizu1',verts:quad(-48,-10,-.65),repeatS:true,repeatT:true});const wall=[];for(const i of [0,1,2,2,1,3])wall.push(-10,i%2?0:-.65,i>=2?24:-64,i>=2?1408:0,i%2?0:16,1,1,1,-1,0,0);groups.push({texture:'nb-map-35-sea_gake01',verts:wall,repeatS:true,repeatT:true});}
   OPENING_ASSETS.models[floor]={groups};
  }
  return [...OPENING_ASSETS.scenes['zone'+c.zone].instances.map(i=>({...i,x:i.x-c.origin[0],y:i.y-(c.height||0),z:i.z-c.origin[1]-c.back})),{model:floor,x:0,y:0,z:0,rotation:0}];
 }
 const ambient=Object.freeze([{species:'Sandile',id:551,x:-7.5,z:-16.5,height:.45},{species:'Darumaka',id:554,x:-4.5,z:-16.5,height:.56},{species:'Scraggy',id:559,x:-1.6,z:-16.5,height:.54}]);
 const before=PinwheelBattles.ambient;PinwheelBattles.ambient=id=>id==='nimbasaTown'?[]:contexts[id]?ambient:before(id);
 // The southern fountains are behind the battle camera. Keep their clipped
 // upper water triangles from becoming isolated blue fragments in the plaza.
 const omit=(id,texture)=>id==='nimbasaTown'&&/c07_foun_|-fou_0/.test(texture);
 window.NimbasaBattles={contexts,instances,omit,has:id=>!!contexts[id]};
})();
