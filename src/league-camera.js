/* Native preset target/pitch/yaw over the HD-2D lens; preserve user zoom and
 * perspective distance. This is not an emulation of the DS projection. */
(function(root){
 const owned=new WeakMap(),tau=Math.PI*2,angle=p=>Math.atan2(...(p||[.423,.906]));
 const snapshot=r=>Object.fromEntries(['cameraPitch','yaw','storyCameraHeight'].map(k=>[k,{own:Object.hasOwn(r,k),value:r[k]}]));
 function reset(r){const old=owned.get(r);if(!old)return;for(const [key,v]of Object.entries(old.properties)){if(v.own)r[key]=v.value;else delete r[key];}owned.delete(r);}
 function track(r,{pitch,yaw,height},finish){
  const start={pitch:angle(r.cameraPitch),yaw:r.yaw||0,height:r.storyCameraHeight??r.elevation??0};
  return fraction=>{const f=Math.max(0,Math.min(1,fraction)),p=start.pitch+(pitch-start.pitch)*f;r.cameraPitch=[Math.sin(p),Math.cos(p)];r.yaw=start.yaw+(yaw-start.yaw)*f;r.storyCameraHeight=start.height+(height-start.height)*f;if(f===1)finish?.();};
 }
 function begin(r,preset){
  if(!preset||!Array.isArray(preset.targetFx)||preset.targetFx.length!==3||![preset.pitchTurn16,preset.yawTurn16,...preset.targetFx].every(Number.isFinite))throw Error('Preset della camera originale non valido');
  if(!owned.has(r))owned.set(r,{properties:snapshot(r),pitch:angle(r.cameraPitch),yaw:r.yaw||0,height:r.storyCameraHeight??r.elevation??0});
  return track(r,{pitch:preset.pitchTurn16*tau/65536,yaw:preset.yawTurn16*tau/65536,height:preset.targetFx[1]/65536});
 }
 function returning(r){const old=owned.get(r);return old?track(r,old,()=>reset(r)):null;}
 const api={begin,returning,reset,active:r=>owned.has(r)};root.LeagueCamera=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
