/* IRBI Gym121 init242: version21 binds selector162/work16416 to graphic180.
 * Resolve that context before resource preparation, even if work16416 still
 * contains a value from another map. Other selector contexts remain unchanged.
 */
(function(root){
 const model=(zone,raw)=>zone===121&&raw===162?180:raw;
 // The taller HD-2D viewport can see beyond native indoor meshes. Match
 // their dark cutaways; geographic ownership keeps outdoor skies unchanged.
 function applyScene(scene){if(scene?.zone!==121&&root.LEAGUE_SCENES?.[scene?.zone]?.outdoor!==false)return false;scene.clearColor=[0,0,0];return true;}
 const api={model,applyScene};root.LeagueGraphics=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
