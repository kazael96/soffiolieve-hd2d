/* Italian overlay182: sixteen-tick fades, A/B/Start or >900 ticks.
 * One native256x192 screen is contained without stretching on the browser. */
(function(root){
 function motion(){let phase='in',alpha=0,wait=0;return{tick(confirm=false){
  if(phase==='in'){if(++alpha===16)phase='wait';}
  else if(phase==='wait'){if(confirm||++wait>900)phase='out';}
  else if(phase==='out'){if(--alpha===0)phase='done';}
  return{phase,alpha,wait,finished:phase==='done'};
 }};}
 function create(options={}){
  const doc=options.document||root.document,request=options.requestFrame||root.requestAnimationFrame,cancelFrame=options.cancelFrame||root.cancelAnimationFrame;let current;
  async function play(){
   if(current)throw Error('Schermata finale già in corso');
   const run=current={cancelled:false};let panel,raf;
   const cancellation=new Promise((_,reject)=>run.reject=reject),alive=()=>{if(run.cancelled)throw Error('Schermata finale annullata');};
   let confirm=false;
   const key=e=>{if(!e.repeat&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&['z','e','enter','escape','b','x'].includes(e.key.toLowerCase())){e.preventDefault();e.stopImmediatePropagation();confirm=true;}},touch=e=>{if(e.target.closest?.('#demoControls,#demoRestartConfirm'))return;e.preventDefault();e.stopImmediatePropagation();confirm=true;};
   try{
    const image=await Promise.race([(options.resourceGate||((k,load)=>load()))('native-end-image',()=>options.image?options.image():root.RuntimeAssets.image(root.NativeTextLayout.resource('assets/finale/credits/end-it.png'))),cancellation]);alive();
    panel=doc.createElement('section');panel.id='nativeFirstEnd';panel.setAttribute('aria-label','Fine');Object.assign(panel.style,{position:'fixed',inset:'0',zIndex:'81',background:'#000',display:'grid',placeItems:'center'});
    const canvas=doc.createElement('canvas');canvas.width=256;canvas.height=192;Object.assign(canvas.style,{width:'min(100vw,133.333333vh)',height:'min(75vw,100vh)',imageRendering:'pixelated'});panel.append(canvas);doc.body.append(panel);const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    doc.addEventListener('keydown',key,true);panel.addEventListener('pointerup',touch,true);options.resetInput?.();
    const clock=motion();let last,accumulator=0,state={alpha:0,finished:false};
    await Promise.race([new Promise((resolve,reject)=>{const tick=now=>{try{
     alive();last??=now;const elapsed=Math.max(0,Math.min(100,now-last));last=now;
     if(!doc.hidden){accumulator+=elapsed*.06*(options.rate?.()||root.GameSpeed?.rate||1);while(accumulator>=1&&!state.finished){state=clock.tick(confirm);confirm=false;accumulator--;}}
     ctx.fillStyle='#000';ctx.fillRect(0,0,256,192);ctx.globalAlpha=state.alpha/16;ctx.drawImage(image,0,0);ctx.globalAlpha=1;options.onFrame?.(state);
     if(state.finished)resolve();else raf=request(tick);
    }catch(error){reject(error);}};raf=request(tick);}),cancellation]);
   }finally{run.cancelled=true;run.reject=null;if(raf!==undefined)cancelFrame(raf);doc.removeEventListener('keydown',key,true);panel?.removeEventListener('pointerup',touch,true);panel?.remove();if(current===run)current=null;options.resetInput?.();}
  }
  return{play,cancel(){if(!current)return false;current.cancelled=true;current.reject?.(Error('Schermata finale annullata'));return true;},get active(){return !!current;}};
 }
 const api={create,motion};root.FinaleEnd=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
