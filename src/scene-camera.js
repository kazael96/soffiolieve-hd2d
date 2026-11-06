/* Shared camera policy for native-map chapters, including future extensions. */
(function(root){
 const fieldViews=new WeakMap();
 function tracks(scene){return !!scene&&(scene.followPlayer===true||Object.entries(scene).some(([key,value])=>value===true&&/^chapter\d+$/.test(key)&&Number(key.slice(7))>=42));}
 function anchor(name,scene,zone,position){if(root.SurfField?.mounted())return [position.x,position.y+1.5];if(name==='town')return [[321,16,154].includes(zone)?position.x:position.x*.7,position.y+1.5];return tracks(scene)?[position.x,position.y+1.5]:[-10,-10];}
 function followFactor(seconds){const dt=Number.isFinite(seconds)?Math.max(0,Math.min(1,seconds)):0;return 1-Math.exp(-2.1*dt);}
 function applyFieldView(renderer,hero){
  let current=fieldViews.get(renderer);
  const restore=()=>{if(current){renderer.cameraPitch=current.base;fieldViews.delete(renderer);current=null;}};
  if(![206,213].includes(renderer.scene?.zone)||!hero||!Number.isFinite(hero.z)){restore();return ()=>{};}
  if(!current){current={base:renderer.cameraPitch};fieldViews.set(renderer,current);}
  const base=current.base||[.423,.906],f=Math.max(0,Math.min(1,(hero.z-27)/5)),smooth=f*f*(3-2*f),start=Math.atan2(base[0],base[1]),angle=start+(Math.PI*50/180-start)*smooth;
  if(renderer.scene.zone===213){const pitch=Math.max(start,(root.OPELUCID_FIELD_MOTION?.camera?.pitchTurn16??9694)*Math.PI*2/65536);renderer.cameraPitch=[Math.sin(pitch),Math.cos(pitch)];return restore;}
  // Raise the view through the narrow native forest entrance, returning
  // smoothly to the ordinary low camera before the open bridge.
  renderer.cameraPitch=[Math.sin(angle),Math.cos(angle)];return restore;
 }
 const api={tracks,anchor,followFactor,applyFieldView};root.SceneCamera=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
