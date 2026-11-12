/* Gym121 combines WB floors with movable ribbons; exterior214 is native NG only. */
(function(root){
 function at(zone,x,z,height,base,rails=root.NativeRails){
  if(![121,214].includes(zone))return base?.at(zone,x,z,height)||null;
  const rail=rails?.surfaceAt?rails.surfaceAt(zone,x,z,{height}):rails?.locate(zone,x,z,{height});
  if(rail)return {flags:0,...rail};
  if(zone===214)return null;
  const grid=base?.at(zone,x,z,height);if(!grid||Math.abs(grid.height-height)>1.8)return null;
  // Native163 marks a mode boundary. A disabled ribbon cannot be bypassed by
  // treating that entry cell as an ordinary WB floor.
  return grid.behavior===163?{...grid,flags:grid.flags|1}:grid;
 }
 const api={at};root.LeagueSurfaces=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
