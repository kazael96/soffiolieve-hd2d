/* IRBI physical contexts and seasonal field music for the fifth-badge chapter. */
(()=>{
 const routes=new Set([331,194]),caves=new Set([195,196,197]);
 function context(zone,position,tile='path'){
  const grass=tile==='grass'||tile==='darkGrass';
  if(zone===96)return {id:'driftveilTown',label:'Libecciopoli',terrain:'town'};
  if(zone===191)return {id:tile==='darkGrass'?'coldStorageYardDark':grass?'coldStorageYardGrass':'coldStorageYardPath',label:'Deposito Frigo: piazzale',terrain:grass?'grass':'path'};
  if(zone===192)return {id:tile==='ice'?'coldStorageIce':'coldStorageWarehouse',label:'Deposito Frigo',terrain:'interior'};
  if(zone===193)return {id:'coldStorageRoom',label:'Deposito Frigo: container',terrain:'interior'};
  if(zone===97)return {id:'clayGym',label:'Palestra di Rafan',terrain:'interior'};
  if(zone===98)return {id:'clayGymEntrance',label:'Ingresso della palestra di Rafan',terrain:'interior'};
  if(routes.has(zone))return {id:zone===194?'chargestoneEntrance':tile==='darkGrass'?'route6Dark':grass?'route6Grass':'route6Path',label:zone===194?'Ingresso della Cava Pietrelettrica':'Percorso 6',terrain:grass?'grass':'path'};
  if(caves.has(zone))return {id:'chargestone'+(zone-194),label:'Cava Pietrelettrica'+(zone===195?'':zone===196?' −1F':' −2F'),terrain:'cave'};
  if(zone===107)return {id:'mistraltonTown',label:'Ponentopoli',terrain:'town'};
  if(zone===109)return {id:'mistraltonCenter',label:'Centro Pokémon di Ponentopoli',terrain:'interior'};
  return null;
 }
 function music(zone,month=new Date().getMonth()){
  if(routes.has(zone))return [1046,1047,1048,1049][((month%4)+4)%4];
  if(zone===96||zone===191)return 1030;
  if(zone===192||zone===193)return 1079;
  if(zone===97||zone===98)return 1063;
  if(caves.has(zone))return 1078;
  if(zone===107)return 1031;
  if(zone===109)return 1060;
  return null;
 }
 window.MISTRALTON_FIELD={context,music};
})();
