/* Explicit native geography behind the clear HD-2D battle floor. */
(()=>{
 const contexts={
  skylaGym:{zone:108,origin:[-.5,8.5],height:0,back:25,cutoff:-20,floor:'ic-map-525-gym06_t023',indoor:true,sky:['#334951','#8c9b9a']},
  route7Path:{zone:337,origin:[-660.5,-493.5],back:25,cutoff:-21,floor:'ic-map-61-michi01b'},
  route7Grass:{zone:337,origin:[-660.5,-493.5],back:25,cutoff:-21,floor:'ic-map-61-grass01ax'},
  route7Dark:{zone:337,origin:[-660.5,-493.5],back:25,cutoff:-21,floor:'ic-map-61-grass01ax'},
  route7Water:{zone:337,origin:[-660.5,-493.5],back:25,cutoff:-21,floor:'ic-map-61-michi01b'},
  twistApproach:{zone:198,origin:[-642.5,-547.5],back:26,cutoff:-22,floor:'ic-map-63-gake_michi'},
  twistYard:{zone:199,origin:[37.5,35.5],back:25,cutoff:-21,floor:'ic-map-333-yuka_001'},
  twist200:{zone:200,origin:[16.5,15.5],back:25,cutoff:-21,floor:'ic-map-337-d7bedrock',indoor:true,sky:['#29241d','#625747']},
  twist201:{zone:201,origin:[16.5,15.5],back:25,cutoff:-21,floor:'ic-map-339-d7bedrock',indoor:true,sky:['#29241d','#625747']},
  twist202:{zone:202,origin:[16.5,15.5],back:25,cutoff:-21,floor:'ic-map-343-d7bedrock',indoor:true,sky:['#25231f','#5b554a']},
  twist203:{zone:203,origin:[-.5,-.5],back:25,cutoff:-21,floor:'ic-map-346-d7bedrock4',indoor:true,sky:['#252c31','#62676a']},
  mistraltonTown:{zone:107,origin:[-692.5,-448.5],back:24,cutoff:-20,floor:'ic-map-59-michi02b'},
  mistraltonCenter:{zone:109,origin:[-7.5,-3.5],back:24,cutoff:-20,floor:'ic-map-489-in02_yuka6',indoor:true},
  icirrusTown:{zone:113,origin:[-589.5,-592.5],back:25,cutoff:-21,floor:'ic-map-66-michi01b'},
  icirrusMarsh:{zone:113,origin:[-589.5,-592.5],back:25,cutoff:-21,floor:'ic-map-64-sp_marsh'},
  icirrusWater:{zone:113,origin:[-589.5,-592.5],back:25,cutoff:-21,floor:'ic-map-64-sp_marsh'}
 };
 for(const[zone,map]of [[338,387],[339,388],[340,389],[341,390],[342,391]])contexts['celestial'+zone]={zone,origin:[-.5,-1.5],back:25,cutoff:-21,floor:zone===342?'ic-map-391-o23_yuka_a':'ic-map-'+map+'-in42_fl01',indoor:zone!==342,sky:['#4c4142','#aca391']};
 const yard=contexts.twistYard;for(let season=0;season<4;season++)contexts['twistYard'+(season||'')]={...yard,sourceSeason:season,floor:season===3?'ic-season3-map-396-w_yuka_002':'ic-season'+season+'-map-333-yuka_001'};
 // Only these interiors are combat-capable in this chapter. Services never
 // acquire an unrelated path background if a later event opens a battle there.
 const far=(species,id,x,height)=>Object.freeze({species,id,x,z:-19.5,height});
 function ambient(id){const c=contexts[id];if(!c)return null;const table=ICIRRUS_DATA.encounters[c.zone]?.seasons[window.FieldSeason?.current()??((new Date().getMonth()%4)+4)%4],kind=id.endsWith('Dark')?'dark':id.endsWith('Water')?'surf':'normal',slots=table?.[kind]?.slots||[],unique=[...new Map(slots.map(s=>[s.name,s])).values()].slice(0,3);return unique.map((s,i)=>far(s.name,s.id,-6+i*2.2,.38));}
 function floor(id){const c=contexts[id];if(!c)return null;if(!OPENING_ASSETS.textures[c.floor])throw Error('Terreno originale non disponibile: '+id);const key='icirrus-battle-'+id;
  if(!OPENING_ASSETS.models[key]){const verts=[];for(const i of [0,1,2,2,1,3])verts.push(i%2?48:-48,0,i>=2?24:-64,i%2?1536:0,i>=2?1408:0,1,1,1,0,1,0);const groups=[{texture:c.floor,verts,repeatS:true,repeatT:true}];
   // Cutaway chamber adapted to the low battle camera. Native upper floors
   // cannot be reused overhead: their undersides obscure the cave horizon.
   const rock=c.sourceSeason!==undefined?(c.sourceSeason===3?'ic-season3-map-396-w_gake_003_2':'ic-season'+c.sourceSeason+'-map-330-gake_003_2'):{twist200:'ic-map-337-d7cliff',twist201:'ic-map-339-d7cliff',twist202:'ic-map-343-d7cliff',twist203:'ic-map-346-d7cliff2'}[id];
   if(rock){if(!OPENING_ASSETS.textures[rock])throw Error('Parete nativa mancante: '+id);for(const [ax,az,bx,bz]of [[-48,-36,48,-36],[-48,-24,-48,-36],[48,-36,48,-24]]){const wall=[],length=Math.hypot(bx-ax,bz-az);for(const i of [0,1,2,2,1,3])wall.push(i%2?bx:ax,i>=2?(c.sourceSeason!==undefined?8:18):0,i%2?bz:az,i%2?length*4:0,i>=2?0:OPENING_ASSETS.textures[rock].h*3,.82,.85,.88,0,0,1);groups.push({texture:rock,verts:wall,repeatS:true,repeatT:true,doubleSided:true});}}
   OPENING_ASSETS.models[key]={groups};}return key;
 }
 function instances(id){const c=contexts[id];if(!c)return null;const source=window.IcirrusSeasons?.scene(c.zone)||ICIRRUS_ASSETS.scenes[c.zone],scenery=[...source.instances,...(ICIRRUS_ASSETS.visualSurroundings?.[c.zone]?.instances||[])];return [...scenery.filter(i=>i.actorUid===undefined&&(!(/^twist20[0-3]$/.test(id)||c.sourceSeason!==undefined)||!/^ic-(?:map-|season\d-map-)/.test(i.model))).map(i=>({...i,x:i.x-c.origin[0],y:i.y-(c.height||0),z:i.z-c.origin[1]-c.back})),{model:floor(id),x:0,y:0,z:0,rotation:0}];}
 async function prepare(id){const c=contexts[id];if(!c)return false;await IcirrusChapter.ensure();if(c.sourceSeason!==undefined){if(FieldSeason.current()!==c.sourceSeason)throw Error('Fondale stagionale diverso dal campo caricato');await IcirrusSeasons.prepare(199);c.height=IcirrusChapter.surfaceAt?.(199,...c.origin,0)?.height??0;}floor(id);return true;}
 Object.assign(PinwheelBattles.contexts,contexts);const previous=PinwheelBattles.instances,previousAmbient=PinwheelBattles.ambient;PinwheelBattles.instances=id=>contexts[id]?instances(id):previous(id);PinwheelBattles.ambient=id=>ambient(id)??previousAmbient(id);
 window.IcirrusBattles={contexts,instances,ambient,prepare,isGround:name=>/^ic-/.test(name||'')&&/(?:fl0|bedrock|yuka|michi|grass|marsh|gym06_t023)/.test(name),has:id=>!!contexts[id]};
})();
