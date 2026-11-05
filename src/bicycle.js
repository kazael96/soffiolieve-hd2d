/* Native cycling billboards; continuous movement speed is adapted to HD-2D. */
(()=>{
 let preparing=false;
 const allowed=()=>!window.SurfField?.mounted()&&(!!renderer.scene?.outdoor||renderer.scene===ROM_SCENE||renderer.scene===window.Journey?.outdoor);
 const mounted=()=>!!Journey.state.original?.bicycle&&allowed();
 function dismount(){if(window.Journey?.state.original)Journey.state.original.bicycle=false;if(window.AudioEngine&&window.NativeStory)AudioEngine.setScene(NativeStory.music);}
 async function toggle(){
  if(preparing||battling||window.NativeStory?.locked||!Journey.itemCount(450))return false;
  if(mounted()){dismount();Journey.save(true);return true;}
  if(!allowed()){toast('Non puoi usare la Bicicletta qui.');return false;}
  preparing=true;const scene=renderer.scene;
  try{const prepare=async()=>{await NimbasaChapter.ensure();if(renderer.scene!==scene)return;await renderer.requireActors([...(NativeStory.visualActors()||[]),{name:'AlcideBike'}]);};if(renderer.resourceGate)await renderer.resourceGate('bicycle-entry',prepare);else await prepare();if(renderer.scene!==scene||!allowed())return false;await renderer.prepareScene();if(renderer.scene!==scene||!allowed())return false;Journey.state.original.bicycle=true;AudioEngine.setScene(1012);Journey.save(true);return true;}catch(error){toast('Bicicletta non disponibile: '+error.message);return false;}finally{preparing=false;}
 }
 function actor(frame,t,moving){if(!mounted())return {name:'Alcide',frame};const direction=Math.floor((frame%12)/3),step=moving?1+Math.floor(t*12)%3:0;return {name:'AlcideBike',hero:true,frame:direction*4+step};}
 window.Bicycle={allowed,mounted,toggle,dismount,actor,get preparing(){return preparing;}};
})();
