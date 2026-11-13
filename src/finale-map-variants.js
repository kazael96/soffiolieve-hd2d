/* Native replacement rows37/42 and condition records4/6, IRBI first ending. */
(function(root){
 const data=root.FINALE_MAP_VARIANTS;
 function select(zone,native,metadata){const v=data[zone];return v&&native?.vars?.[v.work]===v.value?{key:v.key,descriptor:{...metadata[zone],...v.scene,sourceMatrix:v.source.matrix},surfaceZone:v.surfaceZone}:null;}
 function set(native,event,enabled){const v=data[native.zone];if(!v||v.event!==event)return false;if(![0,1].includes(enabled))throw Error('Variante della mappa finale non valida');native.vars[v.work]=enabled?v.value:0;return true;}
 root.FinaleMapVariants={select,set};
})(typeof window==='undefined'?globalThis:window);
