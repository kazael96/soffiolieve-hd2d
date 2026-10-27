/* Immutable physical battle context; never infer a place from the opponent. */
(function(root){
 const rooms={bedroom:['bedroom','Camera di Alcide',391],home:['home','Casa di Alcide',390],bianca:['bianca','Casa di Belle',392],biancaRoom:['biancaRoom','Camera di Belle',393],komorHome:['komorHome','Casa di Komor',394],komorRoom:['komorRoom','Camera di Komor',395],lab:['lab','Laboratorio di Aralia',396]};
 function capture(state,native,position,terrain='path'){
  if(!state||!position||!Number.isFinite(position.x)||!Number.isFinite(position.y))throw Error('Posizione del combattimento non disponibile');
  let id,label,zone,variant='interior';const room=rooms[state.scene];
  if(room){[id,label,zone]=room;if(id==='bedroom'&&native?.roomMess)id='bedroomMess';}
  else if(state.scene==='town'){
   const north=position.y< -16;
   id=north?'route1':'nuvema';label=north?'Percorso 1':'Soffiolieve';zone=north?317:389;variant=terrain==='grass'?'grass':'path';
   if(position.y<=-80){id='accumulaEntrance';label='Ingresso di Quattroventi';variant='town';}
  }else throw Error('Ambiente di lotta non definito: '+state.scene);
  return Object.freeze({id,label,zone,scene:state.scene,x:position.x,y:position.y,terrain:variant});
 }
 function tile(grids,position){const g=grids?.find(g=>position.x>=g.x-16&&position.x<g.x+16&&position.y>=g.z-16&&position.y<g.z+16);if(!g)return 'path';const at=8+(Math.floor(position.y-g.z)+16)*256+(Math.floor(position.x-g.x)+16)*8;return g.bytes[at]===4?'grass':'path';}
 const api={capture,tile,rooms};root.BattleLocation=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
