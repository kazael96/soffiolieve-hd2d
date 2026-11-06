/* Native417/effect17: dedicated Nardo model, joints, palettes and pattern keys. */
(function(root){
 function create(options={}){
  let pending=null,active=false;
  async function data(){if(pending)return pending;pending=Promise.resolve().then(async()=>{const raw=await(options.resources||root.RuntimeAssets).bytes((options.resource||root.NativeTextLayout.resource)('opelucid-departure-data.js')),text=new TextDecoder().decode(raw),match=/^\s*window\.OPELUCID_DEPARTURE_DATA\s*=\s*([\s\S]*?)\s*;?\s*$/.exec(text);if(!match)throw Error('Partenza originale non valida');const d=JSON.parse(match[1]);if(d.frames!==71||d.source.effect!==17||!d.texturePatterns.hero1?.length||!d.alpha.bird02_line?.length)throw Error('Partenza originale incompleta');return d;}).catch(error=>{pending=null;throw error;});return pending;}
  async function play(onCovered){
   if(active)throw Error('Partenza narrativa già in corso');active=true;
   const doc=options.document||root.document,panel=doc.createElement('section'),canvas=doc.createElement('canvas');panel.id='chapterCinematic';panel.setAttribute('aria-label','Nardo usa Volo');Object.assign(panel.style,{position:'fixed',inset:'0',zIndex:'80',background:'#000',display:'grid',placeItems:'center'});Object.assign(canvas.style,{width:'100%',height:'100%',objectFit:'contain'});canvas.width=960;canvas.height=720;panel.append(canvas);
   let scene,raf,last,frame=0,stopped=false,played=false;
   const request=options.requestFrame||root.requestAnimationFrame,cancel=options.cancelFrame||root.cancelAnimationFrame;
   try{
    const gate=options.resourceGate||((key,load)=>renderer.resourceGate(key,load));let film;
    await gate('native-nardo-departure',async()=>{film=await data();scene?.destroy();scene=new(options.Scene||root.StarterScene.Scene)(canvas,{preserveDrawingBuffer:true,clearColor:[0,0,0],models:{departure:film.model},materialAlpha:{departure:film.alpha},materialColor:{departure:film.color},materialTextures:{departure:film.texturePatterns},curves:{departure:film.camera},perspective:film.perspective});await scene.ready;scene.draw('departure',0);});
    // Only this complete, opaque native sequence authorizes the field handoff.
    doc.body.append(panel);panel.dataset.frames=String(film.frames);
    await new Promise((resolve,reject)=>{const tick=now=>{if(stopped)return;try{last??=now;const elapsed=Math.max(0,Math.min(100,now-last));last=now;if(!doc.hidden)frame=Math.min(film.frames-1,frame+elapsed*.03*(options.rate?.()||root.GameSpeed?.rate||1));scene.draw('departure',frame);if(!played&&frame>=24){played=true;void(options.audio||root.AudioEngine)?.playSound(1650);}panel.dataset.frame=String(Math.floor(frame));if(frame>=film.frames-1)resolve();else raf=request(tick);}catch(error){reject(error);}};raf=request(tick);});
    await onCovered();
   }finally{stopped=true;if(raf!==undefined)cancel(raf);scene?.destroy();panel.remove();active=false;options.resetInput?.();}
  }
  return {data,play,get active(){return active;}};
 }
 const api={create};Object.defineProperties(api,Object.getOwnPropertyDescriptors(create()));root.OpelucidDeparture=api;
})(typeof window==='undefined'?globalThis:window);
