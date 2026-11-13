/* IRBI Gym121 init242: version21 binds selector162/work16416 to graphic180.
 * Resolve that context before resource preparation, even if work16416 still
 * contains a value from another map. Other selector contexts remain unchanged.
 */
(function(root){
 const model=(zone,raw)=>zone===121&&raw===162?180:raw;
 // The taller HD-2D viewport can see beyond native indoor meshes. Match
 // their dark cutaways. The small exterior gate maps need distant landscape
 // behind their native cliff silhouettes instead of the renderer's teal void.
 const gateZones=new Set([356,357,358,359,360,361,362,363,364]);
 function applyScene(scene){if(!scene)return false;if(scene.zone===121||root.LEAGUE_SCENES?.[scene.zone]?.outdoor===false||root.FINALE_SCENES?.[scene.zone]?.outdoor===false){scene.clearColor=[0,0,0];scene.clearAlpha=1;delete scene.backdrop;return true;}if(gateZones.has(scene.zone)||[136,214].includes(scene.zone)){scene.clearColor=[0,0,0];scene.clearAlpha=0;scene.backdrop=scene.zone===361?'league-abyss':[136,214].includes(scene.zone)?'league-victory':'league-highlands';return true;}return false;}
 // HD-2D foreground closure at map517's native floor edge. The original
 // lower link-room stairs otherwise project as a detached piece in the void.
 const edge=[[-16.25,-.125,3],[-.75,-.125,3],[-16.25,-3,3],[-.75,-3,3]],front=new Float32Array([0,1,2,2,1,3].flatMap(i=>[...edge[i],0,0,0,0,0,0,0,1]));
 const frontClosure=(scene,height=0)=>scene?.zone===146&&height>=-.125?front:null;
 const api={model,applyScene,frontClosure};root.LeagueGraphics=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
