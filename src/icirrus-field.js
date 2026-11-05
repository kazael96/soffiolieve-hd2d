/* Physical location, season and field music of the sixth-badge chapter. */
(()=>{
 const names={107:'Ponentopoli',108:'Palestra di Anemone',109:'Centro Pokémon di Ponentopoli',110:'Ponentopoli',111:'Ponentopoli',112:'Ponentopoli',337:'Percorso 7',338:'Torre Cielo',339:'Torre Cielo · 2P',340:'Torre Cielo · 3P',341:'Torre Cielo · 4P',342:'Torre Cielo · cima',343:'Percorso 7',344:'Percorso 7',198:'Monte Vite',199:'Monte Vite · esterno',200:'Monte Vite · 1P',201:'Monte Vite · PT',202:'Monte Vite · S1',203:'Monte Vite · sala inferiore',204:'Monte Vite · rifugio',113:'Mistralopoli',115:'Centro Pokémon di Mistralopoli',116:'Mistralopoli',117:'Mistralopoli',118:'Mistralopoli',119:'Mistralopoli'};
 function context(zone,p,tile='path'){
  if(!names[zone])return null;const grass=['grass','darkGrass'].includes(tile),water=tile==='water';let id,terrain='interior';
  if(zone===337){id=water?'route7Water':tile==='darkGrass'?'route7Dark':grass?'route7Grass':'route7Path';terrain=water?'water':grass?'grass':'path';}
  else if(zone===198){id='twistApproach';terrain='path';}
  else if(zone===199){const season=window.FieldSeason?.current()??new Date().getMonth()%4;id='twistYard'+(season||'');terrain='path';}
  else if([200,201,202,203].includes(zone)){id='twist'+zone;terrain='cave';}
  else if([338,339,340,341,342].includes(zone))id='celestial'+zone;
  else if(zone===108)id='skylaGym';
  else if(zone===107){id='mistraltonTown';terrain='town';}
  else if(zone===109)id='mistraltonCenter';
  else if(zone===113){id=water?'icirrusWater':grass?'icirrusMarsh':'icirrusTown';terrain=water?'water':grass?'grass':'town';}
  else id='icirrusRoom'+zone;
  return {id,label:names[zone],terrain,season:window.FieldSeason?.current()??((new Date().getMonth()%4)+4)%4};
 }
 function music(zone,month=window.FieldSeason?.current()??new Date().getMonth()){
  if(zone===337||zone===198)return [1046,1047,1048,1049][((month%4)+4)%4];
  return ICIRRUS_EVENTS.zones[zone]?.music??null;
 }
 window.ICIRRUS_FIELD={context,music,names};
})();
