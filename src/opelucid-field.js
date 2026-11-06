/* Contexts are introduced explicitly; unknown future combat places fail closed. */
(()=>{
 function context(zone,position,tile='path'){
  if(zone===113)return {id:tile==='water'?'icirrusWater':tile==='marsh'?'icirrusMarsh':'icirrusTown',label:'Mistralopoli',terrain:tile==='water'?'water':tile==='marsh'?'marsh':'town'};
  if(zone===114)return {id:'brycenGym',label:'Palestra di Silvestro',terrain:'interior'};
  if([205,206].includes(zone)){const variant=tile==='water'?'Water':tile==='darkGrass'?'Dark':tile==='grass'?'Grass':'Path';if(variant==='Water'&&zone!==206)return null;return {id:'dragon'+zone+variant,label:'Torre Dragospira: '+(zone===205?'ingresso':'cortile'),terrain:variant==='Water'?'water':variant==='Path'?'path':'grass'};}
  if([207,208,210,212].includes(zone))return {id:'dragon'+zone,label:'Torre Dragospira · '+(zone-206)+'º piano',terrain:'interior'};
  if([157,158].includes(zone))return {id:'desert'+zone,label:'Deserto della Quiete'+(zone===157?' · ingresso':' · rovine'),terrain:'sand'};
  if([160,161,162,163,164,165].includes(zone))return {id:'relic'+zone,label:'Castello Sepolto · '+(zone===160?'PT':'S'+(zone-160)),terrain:'cave'};
  if([345,346].includes(zone)){const variant=tile==='water'?'Water':tile==='marsh'?'Mud':'Path';return {id:(zone===345?'route8':'moor')+variant,label:zone===345?'Percorso 8':'Palude Mistralopoli',terrain:variant==='Water'?'water':variant==='Mud'?'marsh':'path'};}
  if(zone===348)return {id:'route9'+(tile==='darkGrass'?'Dark':tile==='grass'?'Grass':'Path'),label:'Percorso 9',terrain:tile==='grass'||tile==='darkGrass'?'grass':'path'};
  if(zone===254)return {id:'tubeline',label:'Ponte Cilindro',terrain:'bridge'};
  if(zone===125)return {id:'opelucidTrainerHouse',label:'Boreduopoli · casa degli Allenatori',terrain:'interior'};
  return null;
 }
 window.OPELUCID_FIELD={context,music:zone=>window.OPELUCID_EVENTS?.zones[zone]?.music??null};
})();
