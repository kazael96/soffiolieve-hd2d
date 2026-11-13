/* Original model/joint sequences, framed for the HD-2D browser presentation. */
(()=>{
 async function play(id){if(window.FinaleCinematics?.ids.includes(id))return window.FinaleCinematics.play(id);if([13,14].includes(id))return window.OpelucidCinematics.play(id);if(![3,15].includes(id))throw Error('Sequenza narrativa non disponibile: '+id);
  const wheel=id===3,names=wheel?['wheelSky','wheelField','wheelFrame','wheel']:['bridgeSky','bridge'],models=Object.fromEntries(names.map(n=>[n,DRIFTVEIL_CINEMATICS.models[n].url]));
  const panel=document.createElement('section'),canvas=document.createElement('canvas');panel.id='chapterCinematic';panel.setAttribute('aria-label',wheel?'Ruota panoramica con N':'Apertura del Ponte Libecciopoli');Object.assign(panel.style,{position:'fixed',inset:'0',zIndex:'80',background:'#182d35',display:'grid',placeItems:'center'});Object.assign(canvas.style,{width:'100%',height:'100%',objectFit:'contain'});canvas.width=960;canvas.height=640;panel.append(canvas);document.body.append(panel);
  let scene,raf,last,elapsed=0,stopped=false,renderError;
  try{
   const curve=wheel?[[-8,0,0,0,6,15]]:[[-3,17,0,-150,420,1400]],assets={preserveDrawingBuffer:true,models,materialAlpha:{},curves:{[names[0]]:curve},perspective:{sin:Math.sin(Math.PI/7),cos:Math.cos(Math.PI/7),near:wheel?.05:1,far:wheel?200:12000}};
   await renderer.resourceGate('chapter-cinematic-'+id,async()=>{scene?.destroy();scene=new StarterScene.Scene(canvas,assets);await scene.ready;});
   const animated=scene.models[wheel?'wheel':'bridge'],end=Math.max(1,...animated.animations.map(t=>(t.times.at(-1)||0)*60));
   panel.dataset.frames=String(wheel?Math.min(end-1,180):end-1);
   const tick=now=>{if(stopped)return;try{last??=now;elapsed+=Math.min(100,now-last)*(GameSpeed.rate||1);last=now;const frame=Math.min(end-1,elapsed*.03);scene.draw(names[0],frame,{extra:names.slice(1)});panel.dataset.frame=String(Math.floor(frame));raf=requestAnimationFrame(tick);}catch(error){renderError=error;}};raf=requestAnimationFrame(tick);
   if(wheel){await NativeStory.showPage('N: Io sono il re del Team Plasma.','N');await NativeStory.showPage('Voglio liberare i Pokémon e creare un mondo in cui possano vivere separati dagli esseri umani.','N');}
   await new Promise((resolve,reject)=>{const target=wheel?Math.min(end-1,180):end-1;const wait=()=>{if(renderError)reject(renderError);else if(elapsed*.03>=target)resolve();else requestAnimationFrame(wait);};requestAnimationFrame(wait);});
  }finally{stopped=true;if(raf)cancelAnimationFrame(raf);scene?.destroy();panel.remove();resetInput();}
 }
 window.DriftveilCinematics={play};
})();
