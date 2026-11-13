/* Original overlay82 closeups: BG2 background, BG3 N and native face tiles.
 * The DS256x192 composition is contained within the HD viewport, never cropped.
 */
(function(root){
 function create(options={}){
  let catalog=null,current=null,heldError=null;const cache=new Map(),doc=options.document||root.document,request=options.requestFrame||root.requestAnimationFrame,cancelFrame=options.cancelFrame||root.cancelAnimationFrame;
  const gate=options.resourceGate||((key,load)=>load()),fade=options.fade,resources=options.resources||root.RuntimeAssets,resource=options.resource||root.NativeTextLayout.resource;
  async function data(){if(!catalog)catalog=Promise.resolve().then(async()=>{if(options.data)return options.data;const raw=new TextDecoder().decode(await resources.bytes(resource('finale-closeups-data.js'))),match=/^\s*window\.FINALE_CLOSEUPS\s*=\s*([\s\S]*?)\s*;?\s*$/.exec(raw);if(!match)throw Error('Primi piani originali non validi');const d=JSON.parse(match[1]);if(d.source?.overlay!==82||d.width!==256||d.height!==192||Object.keys(d.images).length!==24)throw Error('Primi piani originali incompleti');return d;}).catch(error=>{catalog=null;throw error;});return catalog;}
  async function prepare(mode){
   if(![0,1,2].includes(mode))throw Error('Primo piano originale non disponibile');
   if(!cache.has(mode)){const work=Promise.resolve().then(async()=>{const d=await data(),m=d.modes[mode],keys=[m.background,m.body,...m.eyes,...m.mouth],images=Object.fromEntries(await Promise.all(keys.map(async k=>{const image=await resources.image(resource(d.images[k].src));if(image.width!==d.images[k].size[0]||image.height!==d.images[k].size[1])throw Error('Dimensioni del primo piano non valide');return[k,image];})));return{data:d,mode:m,images,bytes:keys.reduce((n,k)=>n+d.images[k].size[0]*d.images[k].size[1]*4,0)};}).catch(error=>{cache.delete(mode);throw error;});cache.set(mode,work);}return cache.get(mode);
  }
  function dispose(run){if(!run||run.disposed)return;run.disposed=true;if(run.raf!==undefined)cancelFrame?.(run.raf);run.panel?.remove();if(current===run)current=null;options.resetInput?.();}
  function cancel(){const run=current;if(!run)return false;run.cancelled=true;run.reject?.(Error('Primo piano annullato'));dispose(run);return true;}
  function checkError(){if(heldError){const error=heldError;heldError=null;throw error;}}
  async function open(mode,unused=0,stayBlack=0){
   if(current)throw Error('Un primo piano è già in corso');if(unused!==0||![0,1].includes(stayBlack))throw Error('Parametri del primo piano non disponibili');heldError=null;
   const run=current={mode,stayBlack,frame:0,blend:0,cancelled:false,disposed:false,reject:null},alive=()=>{if(run.cancelled||current!==run)throw Error('Primo piano annullato');},cancelled=new Promise((_,reject)=>run.reject=reject);
   try{
    const prepared=await Promise.race([gate('finale-closeup-'+mode,()=>prepare(mode)),cancelled]);alive();
    const panel=run.panel=doc.createElement('section'),canvas=run.canvas=doc.createElement('canvas');panel.id='nativeNCloseup';panel.setAttribute('aria-label','N');Object.assign(panel.style,{position:'fixed',inset:'0',zIndex:'8',pointerEvents:'none',background:'#000'});canvas.width=256;canvas.height=192;Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',objectFit:'contain',imageRendering:'pixelated'});panel.append(canvas);
    const motion=run.motion=(options.motion||root.FinaleCloseupMotion).create({speed:options.speed?.()||root.NativeSettings?.state.textSpeed||2,random:options.random||Math.random}),context=canvas.getContext('2d'),body=doc.createElement('canvas');body.width=256;body.height=192;const face=body.getContext('2d');face.imageSmoothingEnabled=false;context.imageSmoothingEnabled=false;let last,accumulator=0;
    const rendered=new Promise((resolve,reject)=>{run.blendResolve=resolve;const tick=now=>{
     if(run.cancelled||current!==run)return;
     try{last??=now;const dt=Math.max(0,Math.min(100,now-last));last=now;if(!doc.hidden){accumulator+=dt*.03*(options.rate?.()||root.GameSpeed?.rate||1);while(accumulator>=1){accumulator--;run.frame++;motion.tick();}if(run.blendStart!==undefined)run.blend=Math.min(30,run.frame-run.blendStart);}
      const d=prepared.data,m=prepared.mode,im=prepared.images,p=motion.snapshot;face.clearRect(0,0,256,192);face.drawImage(im[m.body],0,0);for(const key of ['eyes','mouth']){const at=d[key].at;face.clearRect(...at);face.drawImage(im[m[key][p[key]]],at[0],at[1]);}context.globalAlpha=1;context.clearRect(0,0,256,192);context.drawImage(im[m.background],0,0);context.globalAlpha=run.blend/30;context.drawImage(body,0,0);context.globalAlpha=1;panel.dataset.frame=String(run.frame);panel.dataset.eyes=String(p.eyes);panel.dataset.mouth=String(p.mouth);panel.dataset.blend=String(run.blend);if(run.blend===30)resolve(true);run.raf=request(tick);
     }catch(error){heldError=error;run.error=error;reject(error);options.coverFailure?.(error);dispose(run);}
    };run.raf=request(tick);});rendered.catch(()=>{});
    // Assets are prepared before beginning the native clock. The field remains
    // visible during network recovery rather than displaying a partial portrait.
    await Promise.race([fade(1,16),cancelled]);alive();doc.body.append(panel);await Promise.race([fade(0,16),cancelled]);alive();run.blendStart=run.frame;await Promise.race([rendered,cancelled]);alive();run.opened=true;return true;
   }catch(error){if(!run.cancelled&&(!current||current===run))options.coverFailure?.(error);dispose(run);throw error;}
  }
  async function close(){checkError();const run=current;if(!run)return false;try{await fade(1,run.stayBlack?2:16);if(current!==run||run.cancelled)throw Error('Primo piano annullato');dispose(run);if(!run.stayBlack)await fade(0,16);return true;}catch(error){if(!run.cancelled&&(!current||current===run))options.coverFailure?.(error);dispose(run);throw error;}}
  function restart(){checkError();if(!current?.opened)throw Error('Primo piano del dialogo non disponibile');current.motion.restart();}
  function message(printer){if(current?.opened)current.motion.message(printer||{done:true});}
  return {open,close,cancel,restart,message,prepare,data,get active(){return !!current;},get snapshot(){return current?{frame:current.frame,mode:current.mode,blend:current.blend,opened:!!current.opened,canvas:current.canvas,...current.motion?.snapshot}:null;},get cacheEntries(){return cache.size;}};
 }
 root.FinaleCloseup={create};
})(typeof window==='undefined'?globalThis:window);
