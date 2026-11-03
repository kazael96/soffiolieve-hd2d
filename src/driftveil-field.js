/* Fixed geographical battle contexts for the Sciroccopoli–Libecciopoli chapter. */
(()=>{
 function context(zone,position,tile){if(zone===63)return {id:'elesaGym',label:'Palestra di Camelia',terrain:'interior'};if(zone===64)return {id:'nimbasaPark',label:'Luna park di Sciroccopoli',terrain:'town'};if(zone===329)return {id:tile==='darkGrass'?'route5Dark':tile==='grass'?'route5Grass':'route5Path',label:'Percorso 5',terrain:tile==='grass'||tile==='darkGrass'?'grass':'path'};if(zone===253)return {id:'driftveilBridge',label:'Ponte Libecciopoli',terrain:'bridge'};if(zone===96)return {id:'driftveilTown',label:'Libecciopoli',terrain:'town'};return null;}
 window.DRIFTVEIL_FIELD={context,music:zone=>zone===329?[1042,1043,1044,1045][new Date().getMonth()%4]:null};
})();

