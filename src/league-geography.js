/* One metadata owner and one three-family budget for the existing and new geography. */
(function(root){
 function validate(scenes,parts){
  if(!scenes||!parts?.families||!parts.zoneFamily||parts.residentLimit!==3)throw Error('Manifesto geografico incompleto');
  const assigned=new Set();
  for(const [name,part]of Object.entries(parts.families)){
   if(!/^[a-z][a-zA-Z0-9]*$/.test(name)||!Array.isArray(part.zones)||!part.zones.length)throw Error('Famiglia geografica non valida');
   for(const zone of part.zones){
    if(!Number.isInteger(zone)||zone<0||assigned.has(zone)||!scenes[zone]||parts.zoneFamily[zone]!==name||scenes[zone].family!==name)throw Error('Proprietà geografica incoerente: '+zone);
    assigned.add(zone);
   }
  }
  const metadata=Object.keys(scenes),mapping=Object.keys(parts.zoneFamily);
  if(metadata.length!==assigned.size||mapping.length!==assigned.size||metadata.some(key=>String(+key)!==key||!assigned.has(+key))||mapping.some(key=>String(+key)!==key||!assigned.has(+key)))throw Error('Inventario geografico incompleto');
 }
 function combine({baseScenes,baseParts,scenes,parts}){
  validate(baseScenes,baseParts);validate(scenes,parts);
  for(const zone of Object.keys(scenes))if(Object.hasOwn(baseScenes,zone))throw Error('La nuova geografia sostituisce una scena esistente: '+zone);
  for(const family of Object.keys(parts.families))if(Object.hasOwn(baseParts.families,family))throw Error('Famiglia geografica già posseduta: '+family);
  return {scenes:{...baseScenes,...scenes},parts:{source:'IRBI051+052; shared scenes retain existing ownership',residentLimit:3,
   families:{...baseParts.families,...parts.families},zoneFamily:{...baseParts.zoneFamily,...parts.zoneFamily}}};
 }
 const api={combine,validate};root.LeagueGeography=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
