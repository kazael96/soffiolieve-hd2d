/* Overlay205 automatic save: bank36 messages3/4, success1368,121 ticks.
 * Native window: x2,y18,width27,height4 tiles. Frame uses the existing original
 * field-window bitmap; no notebook confirmation or invented save-success state. */
(function(root){
 function create(options={}){
  const doc=options.document||root.document,request=options.requestFrame||root.requestAnimationFrame,cancelFrame=options.cancelFrame||root.cancelAnimationFrame;let current;
  async function play(write){
   if(current)throw Error('Salvataggio finale già in corso');const run=current={cancelled:false};let panel,raf;
   const cancellation=new Promise((_,reject)=>run.reject=reject),alive=()=>{if(run.cancelled)throw Error('Salvataggio finale annullato');};
   async function ticks(count){let last,accumulator=0,left=count;await Promise.race([new Promise((resolve,reject)=>{const tick=now=>{try{alive();last??=now;const elapsed=Math.max(0,Math.min(100,now-last));last=now;if(!doc.hidden){accumulator+=elapsed*.06*(options.rate?.()||root.GameSpeed?.rate||1);while(accumulator>=1&&left>0){left--;accumulator--;}}if(left===0)resolve();else raf=request(tick);}catch(e){reject(e);}};raf=request(tick);}),cancellation]);}
   try{
    const prepared=await Promise.race([(options.resourceGate||((k,load)=>load()))('first-ending-save-window',async()=>{
     if(options.render)return null;
     const resource=root.NativeTextLayout.resource,resources=root.RuntimeAssets;
     const images=await Promise.all([resources.image(resource(root.COMMON_DIALOGUE_ASSETS.images.fieldDialogue.src)),resources.image(resource('assets/pokedex/font.png'))]);await options.prepareAudio?.([1368]);return images;
    }),cancellation]);alive();
    panel=doc.createElement('section');panel.id='nativeFirstSave';panel.setAttribute('aria-label','Salvataggio');Object.assign(panel.style,{position:'fixed',inset:'0',zIndex:'80',background:'#000',display:'grid',placeItems:'center'});
    const canvas=doc.createElement('canvas');canvas.width=256;canvas.height=192;Object.assign(canvas.style,{width:'min(100vw,133.333333vh)',height:'min(75vw,100vh)',imageRendering:'pixelated'});panel.append(canvas);doc.body.append(panel);
    const messages=options.messages||root.FINALE_COMPLETION.saveMessages;
    function render(index){const text=(options.format||root.NativeTextLayout.format)(messages[index],[options.playerName?.()||root.Journey.state.playerName]);panel.dataset.message=String(index);if(options.render){options.render(canvas,text);options.onStatus?.(index,canvas);return;}const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle='#000';ctx.fillRect(0,0,256,192);const [frame,font]=prepared;ctx.drawImage(frame,0,0,8,48,8,136,8,48);ctx.drawImage(frame,8,0,240,48,16,136,216,48);ctx.drawImage(frame,248,0,8,48,232,136,8,48);root.NativeTextLayout.wrap(text,root.POKEDEX_ASSETS.font,216).forEach((line,i)=>root.NativeText.draw(ctx,font,line,16,144+i*16));options.onStatus?.(index,canvas);}
    render(3);await ticks(1);alive();if(await write()!==true)throw Error('Salvataggio finale non riuscito');alive();render(4);options.playSound?.(1368);await ticks(121);return true;
   }finally{run.cancelled=true;run.reject=null;if(raf!==undefined)cancelFrame(raf);panel?.remove();if(current===run)current=null;options.resetInput?.();}
  }
  return{play,cancel(){if(!current)return false;current.cancelled=true;current.reject?.(Error('Salvataggio finale annullato'));return true;},get active(){return !!current;}};
 }
 root.FinaleSave={create};if(typeof module!=='undefined')module.exports={create};
})(typeof window==='undefined'?globalThis:window);
