/* Native575, gimmick53/overlay64: original Light Stone, attached to hero position.
 * A transparent native-model layer shares the field projection and holds its
 * final pose until FieldClose. It never replaces the world or the player card.
 */
(function(root){
 function create(options={}){
  let loading=null,current=null,heldError=null;
  const renderer=()=>options.renderer;
  const request=options.requestFrame||root.requestAnimationFrame,cancelFrame=options.cancelFrame||root.cancelAnimationFrame;
  async function data(){
   if(!loading)loading=Promise.resolve().then(async()=>{
    if(options.data)return options.data;
    const raw=await root.RuntimeAssets.bytes(root.NativeTextLayout.resource('finale-stone-data.js')),text=new TextDecoder().decode(raw),match=/^\s*window\.FINALE_STONE\s*=\s*([\s\S]*?)\s*;?\s*$/.exec(text);
    if(!match)throw Error('Animazione del Chiarolite non valida');const d=JSON.parse(match[1]);
    if(d.frames!==306||d.source?.overlay!==64||d.source?.gimmick!==53||!d.models?.part0?.url||!d.audio?.nativeHandleReplacement||d.audio.rate!==32768)throw Error('Animazione del Chiarolite incompleta');return d;
   }).catch(error=>{loading=null;throw error;});return loading;
  }
  function dispose(run){
   if(!run||run.disposed)return;run.disposed=true;if(run.raf!==undefined)cancelFrame?.(run.raf);run.sound?.stop();run.scene?.destroy();run.panel?.remove();if(current===run)current=null;(options.resetInput||root.resetInput)?.();
  }
  function cancel(){heldError=null;const run=current;if(!run)return;run.cancelled=true;run.reject?.(Error('Animazione del Chiarolite annullata'));dispose(run);}
  function close(){const error=current?.error||heldError;cancel();if(error)throw error;}
  async function play(position){
   if(current)throw Error('Una reazione del Chiarolite è già in corso');heldError=null;
   if(![position.x,position.y,position.height].every(Number.isFinite))throw Error('Posizione del Chiarolite non valida');
   const run=current={position:{...position},frame:0,held:false,cancelled:false,disposed:false,reject:null},doc=options.document||root.document;
   const alive=()=>{if(run.cancelled||current!==run)throw Error('Animazione del Chiarolite annullata');};
   try{
    const panel=run.panel=doc.createElement('section'),canvas=run.canvas=doc.createElement('canvas'),flash=run.flash=doc.createElement('div');panel.id='nativeLightStone';panel.setAttribute('aria-label','Il Chiarolite reagisce');Object.assign(panel.style,{position:'fixed',inset:'0',zIndex:'8',pointerEvents:'none'});Object.assign(canvas.style,{width:'100%',height:'100%'});Object.assign(flash.style,{position:'absolute',inset:'0',background:'#fff',opacity:'0'});panel.append(canvas,flash);doc.body.append(panel);
    const gate=options.resourceGate||((key,work)=>renderer().resourceGate(key,work)),cancelled=new Promise((_,reject)=>run.reject=reject);
    const prepared=gate('native-light-stone',async()=>{
     const d=await data();alive();const r=renderer();canvas.width=r.canvas.width;canvas.height=r.canvas.height;
     run.scene=new(options.Scene||root.StarterScene.Scene)(canvas,{transparent:true,preserveDrawingBuffer:true,frameSampling:'native',models:{part0:d.models.part0.url},materialAlpha:d.materialAlpha,materialColor:d.materialColor,materialTextures:d.materialTextures,materialUV:d.materialUV,curves:{}});
     await run.scene.ready;alive();run.sound=(options.audio||root.AudioEngine)?.createCinematic(d.audio.src,{ownsMusic:false});await run.sound?.prepare();alive();return d;
    });
    const d=await Promise.race([prepared,cancelled]);alive();let last;
    await Promise.race([new Promise((resolve,reject)=>{
     const tick=now=>{
      if(run.cancelled||current!==run)return;
      try{
       alive();const r=renderer(),rate=options.rate?.()||root.GameSpeed?.rate||1;last??=now;const elapsed=Math.max(0,Math.min(100,now-last));last=now;
       if(!doc.hidden&&!run.held)run.frame=Math.min(d.frames,run.frame+elapsed*.03*rate);
       if(canvas.width!==r.canvas.width||canvas.height!==r.canvas.height){canvas.width=r.canvas.width;canvas.height=r.canvas.height;}
       const projection=(options.projection||root.NativeFieldProjection.matrix)(r,run.position,d.nativeFieldScale);
       run.scene.draw('part0',Math.min(d.frames-1,run.frame),{projection});if(!run.held)run.sound?.sync(run.frame,rate);
       flash.style.opacity=String(run.frame>=d.flash.start&&run.frame<d.flash.end?1:0);panel.dataset.frame=String(Math.floor(run.frame));panel.dataset.held=String(run.held);
       if(run.frame>=d.frames&&!run.held){run.held=true;panel.dataset.held='true';resolve();}
       run.raf=request(tick);
      }catch(error){run.error=error;reject(error);if(run.held){heldError=error;(options.onHeldError||(()=>{}))(error);}dispose(run);}
     };run.raf=request(tick);
    }),cancelled]);
    // Keep the complete final frame until the native FieldClose transition.
    return true;
   }catch(error){dispose(run);throw error;}
  }
  return {play,close,cancel,data,get active(){return !!current;},get snapshot(){return current?{frame:current.frame,held:current.held,position:{...current.position},canvas:current.canvas,error:current.error}:null;}};
 }
 root.FinaleStone={create};
})(typeof window==='undefined'?globalThis:window);
