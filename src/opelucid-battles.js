/* Original icy Gym scenery behind a clear grounded HD-2D arena. */
(()=>{
 const context={zone:114,origin:[1.5,-1.5],height:7,back:25,cutoff:-20,floor:'op-map-527-in30_yuka02',indoor:true,sky:['#263d50','#839ba9']},key='opelucid-battle-brycenGym';
 function floor(){if(!OPENING_ASSETS.textures[context.floor])throw Error('Pavimento nativo della palestra non disponibile');if(!OPENING_ASSETS.models[key]){const verts=[];for(const i of [0,1,2,2,1,3])verts.push(i%2?48:-48,0,i>=2?24:-64,i%2?1536:0,i>=2?1408:0,1,1,1,0,1,0);OPENING_ASSETS.models[key]={groups:[{texture:context.floor,verts,repeatS:true,repeatT:true}]};}}
 async function prepare(id){if(id!=='brycenGym')return false;await OpelucidChapter.ensure(114);floor();return true;}
 function instances(){floor();const source=OpelucidChapter.loader.get('brycen').scenes[114];return [...source.instances.map(i=>({...i,x:i.x-context.origin[0],y:i.y-context.height,z:i.z-context.origin[1]-context.back})),{model:key,x:0,y:0,z:0,rotation:0}];}
 const previous=PinwheelBattles.instances,previousAmbient=PinwheelBattles.ambient;PinwheelBattles.contexts.brycenGym=context;PinwheelBattles.instances=id=>id==='brycenGym'?instances():previous(id);PinwheelBattles.ambient=id=>id==='brycenGym'?[]:previousAmbient(id);
 window.OpelucidBattles={has:id=>id==='brycenGym',prepare,instances,contexts:{brycenGym:context},isGround:name=>/^op-/.test(name||'')&&/(?:yuka|ice_s)/.test(name)};
})();
