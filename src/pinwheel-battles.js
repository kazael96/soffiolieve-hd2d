/* Fixed, place-specific battle clearings with original nearby scenery. */
(()=>{
 const contexts={nacreneLibrary:{zone:18,origin:[-6.5,4.5],scale:1.6,back:16,cutoff:-8,floor:'pw-map-518-in20yuka_01',indoor:true},aloeGym:{zone:19,origin:[-11.5,-8.5],scale:1.8,back:14,cutoff:-8,floor:'pw-map-552-in20yuka_01',indoor:true},pinwheelOuter:{zone:154,origin:[-191.5,-161.5],cutoff:-22,floor:'pw-map-19-grass01ax',path:'pw-map-19-michi02b'},pinwheelForest:{zone:155,origin:[48.5,17.5],cutoff:-18,floor:'pw-map-289-d2grass01ax',path:'pw-map-289-d2michi02b'}};
 const quad=(width,z0,z1,y=0)=>{const v=[];for(const i of [0,1,2,2,1,3])v.push(i%2?width:-width,y,i>=2?z1:z0,i%2?width*32:0,i>=2?(z1-z0)*16:0,1,1,1,0,1,0);return v;};
 for(const [id,c]of Object.entries(contexts)){
  if(!OPENING_ASSETS.textures[c.floor])throw Error('Terreno di lotta mancante: '+id);
  const groups=[{texture:c.floor,verts:quad(48,-64,22),repeatS:true,repeatT:true}];
  if(c.path)groups.push({texture:c.path,verts:quad(4,-32,22,.005),repeatS:true,repeatT:true,terrain:'path'});
  OPENING_ASSETS.models['pinwheel-battle-'+id]={groups};
 }
 function instances(id){const c=contexts[id];if(!c)return null;const scale=c.scale||1;return [...PINWHEEL_ASSETS.scenes[c.zone].instances.filter(i=>i.actorUid===undefined).map(i=>{let model=i.model;if(scale!==1){model='pinwheel-set-'+id+'-'+i.model;if(!OPENING_ASSETS.models[model])OPENING_ASSETS.models[model]={groups:OPENING_ASSETS.models[i.model].groups.map(g=>({...g,verts:g.verts.map((v,k)=>k%11<3?v*scale:v)}))};}return {...i,model,x:(i.x-c.origin[0])*scale,y:i.y*scale,z:(i.z-c.origin[1])*scale-(c.back||0)};}),{model:'pinwheel-battle-'+id,x:0,y:0,z:0,rotation:0}];}
 const observers={pinwheelOuter:[{species:'Pidove',id:519,x:-7.5,z:-20.5,height:.5},{species:'Timburr',id:532,x:-4.6,z:-20.5,height:.56},{species:'Tympole',id:535,x:-1.8,z:-20.5,height:.37}],pinwheelForest:[{species:'Sewaddle',id:540,x:-7.2,z:-17,height:.43},{species:'Cottonee',id:546,x:-4.5,z:-17,height:.42},{species:'Venipede',id:543,x:-1.8,z:-17,height:.4}]};
 window.PinwheelBattles={contexts,has:id=>!!contexts[id],instances,ambient:id=>observers[id]||null};
})();
