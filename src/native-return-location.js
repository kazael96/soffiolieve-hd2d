/* OP217 stores an indexed return context, not a map number or a party cure. */
(function(root){
 function create(data=root.NATIVE_RETURN_LOCATIONS){
  const rows=data?.records;if(!rows||Object.keys(rows).length!==17)throw Error('Tabella dei ritorni originali non disponibile');
  const valid=id=>Number.isInteger(id)&&id>=1&&id<=17&&Array.isArray(rows[id])&&rows[id].length===10;
  function set(state,id){if(!state||!valid(id))return false;state.returnContext=id;return true;}
  function setCenter(state,zone){const id=Object.keys(rows).find(id=>rows[id][2]===zone);return id===undefined?false:set(state,Number(id));}
  function normalize(state){if(state&&state.returnContext!==undefined&&!valid(state.returnContext))delete state.returnContext;}
  function respawn(state){
   if(!valid(state?.returnContext))return null;const row=rows[state.returnContext];
   // 02159ea8 reads zone at+4 and packed X/Z at+6;02159f48 supplies facing1.
   return {zone:row[2],x:row[3]&255,z:row[3]>>>8,facing:1};
  }
  return {set,setCenter,normalize,respawn};
 }
 const api={create,...(root.NATIVE_RETURN_LOCATIONS?create():{})};root.NativeReturnLocation=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
