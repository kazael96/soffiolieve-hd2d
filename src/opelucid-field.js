/* Contexts are introduced explicitly; unknown future combat places fail closed. */
(()=>{
 function context(zone,position,tile='path'){
  if(zone===114)return {id:'brycenGym',label:'Palestra di Silvestro',terrain:'interior'};
  if([205,206].includes(zone)){const variant=tile==='water'?'Water':tile==='darkGrass'?'Dark':tile==='grass'?'Grass':'Path';if(variant==='Water'&&zone!==206)return null;return {id:'dragon'+zone+variant,label:'Torre Dragospira: '+(zone===205?'ingresso':'cortile'),terrain:variant==='Water'?'water':variant==='Path'?'path':'grass'};}
  if([207,208,210,212].includes(zone))return {id:'dragon'+zone,label:'Torre Dragospira · '+(zone-206)+'º piano',terrain:'interior'};
  if([157,158].includes(zone))return {id:'desert'+zone,label:'Deserto della Quiete'+(zone===157?' · ingresso':' · rovine'),terrain:'sand'};
  if([160,161,162,163,164,165].includes(zone))return {id:'relic'+zone,label:'Castello Sepolto · '+(zone===160?'PT':'S'+(zone-160)),terrain:'cave'};
  return null;
 }
 window.OPELUCID_FIELD={context,music:zone=>window.OPELUCID_EVENTS?.zones[zone]?.music??null};
})();
