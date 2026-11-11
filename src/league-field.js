/* Physical combat places are enabled explicitly, independently of the foe. */
(function(root){
 function context(zone,position,tile='path'){
  if(zone===121)return {id:'draydenGym',label:'Palestra di Aristide',terrain:'interior'};
  if(zone===355&&tile!=='water')return {id:'route10'+(tile==='darkGrass'?'Dark':tile==='grass'?'Grass':'Path'),label:'Percorso 10',terrain:tile==='grass'||tile==='darkGrass'?'grass':'path'};
  if(zone===214&&tile!=='water')return {id:'victoryOutside',label:'Via Vittoria · esterno',terrain:'path'};
  if(zone>=215&&zone<=228){if(tile==='water'&&![215,220].includes(zone))return null;return {id:'victoryCave'+zone+(tile==='water'?'Water':''),label:'Via Vittoria · '+(tile==='water'?'lago sotterraneo':'grotta'),terrain:tile==='water'?'water':'cave'};}
  return null;
 }
 root.LEAGUE_FIELD={context,music:zone=>root.LEAGUE_EVENTS?.zones?.[zone]?.music??null};
})(typeof window==='undefined'?globalThis:window);
