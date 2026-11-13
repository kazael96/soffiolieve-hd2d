/* IRBI gimmick53/overlay64:597 throws model1,598 starts its original46-frame
 * release,600 waits for frame5,599 waits for the joint animation to finish.
 * Native21f39d8 uses a Q16 linear path plus a triangular vertical offset.
 */
(function(root){
 function position(from,to,arc,frames,tick){
  if(![from.x,from.y,from.height,to.x,to.y,to.height,arc,tick].every(Number.isFinite)||arc<0||!Number.isInteger(frames)||frames<1)throw Error('Traiettoria originale non valida');
  const at=Math.min(frames,Math.max(0,Math.floor(tick))),result={};
  for(const key of ['x','y','height']){const start=Math.round(from[key]*65536),end=Math.round(to[key]*65536);result[key]=(start+Math.trunc((end-start)*at/frames))/65536;}
  result.height+=Math.trunc(Math.round(arc*65536)*Math.min(at,frames-at)/frames)/65536;return result;
 }
 function create(options={}){
  let current=null,heldError=null;const doc=options.document||root.document,request=options.requestFrame||root.requestAnimationFrame,cancelFrame=options.cancelFrame||root.cancelAnimationFrame;
  function dispose(run){if(!run||run.disposed)return;run.disposed=true;if(run.raf!==undefined)cancelFrame?.(run.raf);run.scene?.destroy();run.panel?.remove();options.stop?.(1382);options.stop?.(1383);if(current===run)current=null;options.resetInput?.();}
  function cancel(){const run=current;if(!run)return false;run.cancelled=true;const error=Error('Lancio originale annullato');run.reject?.(error);for(const waiter of run.waiters)waiter.reject(error);run.waiters=[];dispose(run);return true;}
  function checked(){if(heldError){const error=heldError;heldError=null;throw error;}if(!current)throw Error('Lancio originale non disponibile');return current;}
  function settle(run){for(const w of [...run.waiters])if(w.phase===run.phase&&run.frame>=w.frame){run.waiters.splice(run.waiters.indexOf(w),1);w.resolve(true);}}
  function waitAt(phase,frame){const run=checked();if(run.phase===phase&&run.frame>=frame)return Promise.resolve(true);return new Promise((resolve,reject)=>run.waiters.push({phase,frame,resolve,reject}));}
  async function flight(from,to,arc,frames){
   position(from,to,arc,frames,0);if(current)throw Error('Un lancio originale è già in corso');heldError=null;
   const run=current={phase:'loading',frame:0,position:{...from},from:{...from},to:{...to},arc,frames,waiters:[],cancelled:false,disposed:false,reject:null},alive=()=>{if(run.cancelled||current!==run)throw Error('Lancio originale annullato');},cancelled=new Promise((_,reject)=>run.reject=reject);
   try{
    const gate=options.resourceGate||((key,load)=>load()),prepared=gate('finale-native-ball-release',async()=>{const d=await(options.data?Promise.resolve(options.data):root.FinaleStone.data());alive();if(d.source?.overlay!==64||d.models.part1.frames!==46)throw Error('Effetto originale della Poké Ball incompleto');
     const panel=run.panel=doc.createElement('section'),canvas=run.canvas=doc.createElement('canvas');panel.id='nativeCastleBall';panel.setAttribute('aria-label','Poké Ball di N');Object.assign(panel.style,{position:'fixed',inset:'0',zIndex:'8',pointerEvents:'none'});Object.assign(canvas.style,{width:'100%',height:'100%'});const r=options.renderer;canvas.width=r.canvas.width;canvas.height=r.canvas.height;panel.append(canvas);
     run.scene=new(options.Scene||root.StarterScene.Scene)(canvas,{transparent:true,preserveDrawingBuffer:true,frameSampling:'native',models:{part1:d.models.part1.url},materialAlpha:d.materialAlpha,materialColor:d.materialColor,materialTextures:d.materialTextures,materialUV:d.materialUV,curves:{}});await run.scene.ready;alive();await options.prepareAudio?.([1382,1383]);alive();return d;
    });
    const d=await Promise.race([prepared,cancelled]);alive();doc.body.append(run.panel);run.phase='flight';options.play?.(1382);let last;
    const failed=new Promise((_,reject)=>run.drawReject=reject);failed.catch(()=>{});
    const tick=now=>{if(run.cancelled||current!==run)return;try{const r=options.renderer;last??=now;const dt=Math.max(0,Math.min(100,now-last));last=now;if(!doc.hidden){const limit=run.phase==='flight'?run.frames:46;run.frame=Math.min(limit,run.frame+dt*.03*(options.rate?.()||root.GameSpeed?.rate||1));}
      if(run.phase==='flight')run.position=position(run.from,run.to,run.arc,run.frames,run.frame);
      if(run.canvas.width!==r.canvas.width||run.canvas.height!==r.canvas.height){run.canvas.width=r.canvas.width;run.canvas.height=r.canvas.height;}
      const projection=(options.projection||root.NativeFieldProjection.matrix)(r,run.position,d.nativeFieldScale);run.scene.draw('part1',run.phase==='flight'?0:Math.min(45,run.frame),{projection});run.panel.dataset.phase=run.phase;run.panel.dataset.frame=String(Math.floor(run.frame));settle(run);run.raf=request(tick);
     }catch(error){heldError=error;run.drawReject(error);for(const w of run.waiters)w.reject(error);run.waiters=[];options.coverFailure?.(error);dispose(run);}};
    run.raf=request(tick);await Promise.race([waitAt('flight',frames),cancelled,failed]);alive();return true;
   }catch(error){if(!run.cancelled&&(!current||current===run))options.coverFailure?.(error);dispose(run);throw error;}
  }
  function activate(at){const run=checked();if(run.phase!=='flight'||run.frame<run.frames)throw Error('La Poké Ball non è ancora arrivata');if(![at.x,at.y,at.height].every(Number.isFinite))throw Error('Posizione della Poké Ball non valida');run.position={...at};run.frame=0;run.phase='release';options.play?.(1383);return true;}
  return {flight,activate,waitReady:()=>waitAt('release',5),waitDone:()=>waitAt('release',46),cancel,get active(){return !!current;},get snapshot(){return current?{phase:current.phase,frame:current.frame,position:{...current.position},canvas:current.canvas}:null;}};
 }
 const api={create,position};root.FinaleBallRelease=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
