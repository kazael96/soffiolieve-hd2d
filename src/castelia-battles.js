/* Battle spaces retain the actual gym, city street and northern gate materials. */
(()=>{
 const contexts={casteliaPlaza:{zone:30,origin:[-.5,2.5],back:18,cutoff:-8,floor:'ca-map-108-c3_road',indoor:false},casteliaAlley:{zone:35,origin:[-1.5,24.5],back:14,cutoff:-8,floor:'ca-map-112-c3_road',indoor:false},casteliaGym:{zone:29,origin:[16.5,-7.5],scale:1.7,back:18,cutoff:-8,floor:'ca-map-519-c03_07',indoor:true},casteliaStreet:{zone:31,origin:[-6.5,18.5],back:14,cutoff:-8,floor:'ca-map-223-c3_road1',indoor:false},casteliaGate:{zone:51,origin:[-11.5,-6.5],scale:2.8,back:19,cutoff:-8,floor:'ca-map-568-gate_yuka01',indoor:true}};
 Object.assign(PinwheelBattles.contexts,contexts);
 function instances(id){const c=contexts[id];if(!c)return null;const floor='pinwheel-battle-'+id;
  if(!OPENING_ASSETS.models[floor]){const v=[];for(const i of [0,1,2,2,1,3])v.push(i%2?48:-48,0,i>=2?24:-64,i%2?1536:0,i>=2?1408:0,1,1,1,0,1,0);OPENING_ASSETS.models[floor]={groups:[{texture:c.floor,verts:v,repeatS:true,repeatT:true}]};}
  const scale=c.scale||1;return [...OPENING_ASSETS.scenes['zone'+c.zone].instances.filter(i=>!i.gymKind).map(i=>{const model='castelia-set-'+id+'-'+i.model;if(!OPENING_ASSETS.models[model])OPENING_ASSETS.models[model]={groups:OPENING_ASSETS.models[i.model].groups.map(g=>({...g,verts:g.verts.map((v,k)=>k%11<3?v*scale:v)}))};return {...i,model,x:(i.x-c.origin[0])*scale,y:i.y*scale,z:(i.z-c.origin[1])*scale-c.back};}),{model:floor,x:0,y:0,z:0,rotation:0}];
 }
 window.CasteliaBattles={contexts,instances,has:id=>!!contexts[id]};
})();
