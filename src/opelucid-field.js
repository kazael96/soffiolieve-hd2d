/* Contexts are introduced explicitly; unknown future combat places fail closed. */
(()=>{
 function context(zone,position,tile='path'){
  if(zone===114)return {id:'brycenGym',label:'Palestra di Silvestro',terrain:'interior'};
  if([205,206].includes(zone)){const variant=tile==='water'?'Water':tile==='darkGrass'?'Dark':tile==='grass'?'Grass':'Path';if(variant==='Water'&&zone!==206)return null;return {id:'dragon'+zone+variant,label:'Torre Dragospira: '+(zone===205?'ingresso':'cortile'),terrain:variant==='Water'?'water':variant==='Path'?'path':'grass'};}
  if([207,208,210,212].includes(zone))return {id:'dragon'+zone,label:'Torre Dragospira · '+(zone-206)+'º piano',terrain:'interior'};
  return null;
 }
 window.OPELUCID_FIELD={context,music:zone=>window.OPELUCID_EVENTS?.zones[zone]?.music??null};
})();
