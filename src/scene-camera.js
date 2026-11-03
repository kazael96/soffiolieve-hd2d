/* Shared camera policy for native-map chapters, including future extensions. */
(function(root){
 function tracks(scene){return !!scene&&(scene.followPlayer===true||Object.entries(scene).some(([key,value])=>value===true&&/^chapter\d+$/.test(key)&&Number(key.slice(7))>=42));}
 function anchor(name,scene,zone,position){if(name==='town')return [[321,16,154].includes(zone)?position.x:position.x*.7,position.y+1.5];return tracks(scene)?[position.x,position.y+1.5]:[-10,-10];}
 function followFactor(seconds){const dt=Number.isFinite(seconds)?Math.max(0,Math.min(1,seconds)):0;return 1-Math.exp(-2.1*dt);}
 const api={tracks,anchor,followFactor};root.SceneCamera=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
