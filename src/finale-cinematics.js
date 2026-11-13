/* Original overlay203 films: three joint models, native UV/alpha/patterns,
 * recorded camera, Q12 brightness and driver-rendered synchronized audio. */
(function(root){
 const ids=[6,7,8,9,10,11,12];
 function create(options={}){
  let pending=null,current=null,observer=options.onFrame;
  const resources=()=>options.resources||root.RuntimeAssets;
  async function data(){
   if(pending)return pending;
   pending=Promise.resolve().then(async()=>{
    const raw=await resources().bytes((options.resource||root.NativeTextLayout.resource)('finale-cinematics-data.js')),text=new TextDecoder().decode(raw),match=/^\s*window\.FINALE_CINEMATICS\s*=\s*([\s\S]*?)\s*;?\s*$/.exec(text);
    if(!match)throw Error('Sequenze del finale non valide');const parsed=JSON.parse(match[1]);
    for(const id of ids){const f=parsed.films?.[id];if(!f||!Number.isInteger(f.frames)||f.frames<2||f.camera?.length!==f.frames||f.brightness?.length!==f.frames||!['part0','part1','part2'].every(k=>f.models?.[k]?.url)||f.audio?.src!=='assets/finale/cinematics/'+id+'/audio.flac'||f.audio.rate!==32768||!f.audio.nativePitchAndVolumeBaked||!f.audio.nativeHandleReplacement)throw Error('Sequenza originale del finale incompleta: '+id);}
    for(const id of ids){const p=parsed.films[id].perspective;if(p?.nativeScreenOffsetsQ12?.length!==2||!p.nativeScreenOffsetsQ12.every(Number.isInteger)||p.nativeScreenMatricesQ12?.length!==2||!p.nativeScreenMatricesQ12.every(m=>Array.isArray(m)&&m.length===16&&m.every(Number.isInteger)))throw Error('Proiezioni originali dei due schermi incomplete: '+id);}
    return parsed;
   }).catch(error=>{pending=null;throw error;});return pending;
  }
  async function play(id){
   if(!ids.includes(id))throw Error('Sequenza del finale non disponibile: '+id);if(current)throw Error('Una sequenza narrativa è già in corso');
   const run=current={cancelled:false,reject:null},doc=options.document||root.document,panel=doc.createElement('section'),canvas=doc.createElement('canvas');
   panel.id='chapterCinematic';panel.setAttribute('aria-label',id===6?'Comparsa del Castello di N':id===7||id===8?'Partenza di N':'Risveglio del Pokémon leggendario');Object.assign(panel.style,{position:'fixed',inset:'0',zIndex:'80',background:'#000',display:'grid',placeItems:'center'});Object.assign(canvas.style,{width:'100%',height:'100%',objectFit:'contain'});canvas.width=960;canvas.height=720;panel.append(canvas);doc.body.append(panel);
   let scene,soundtrack,raf,last,frame=0;const request=options.requestFrame||root.requestAnimationFrame,cancelFrame=options.cancelFrame||root.cancelAnimationFrame;
   const assertCurrent=()=>{if(run.cancelled||current!==run)throw Error('Sequenza del finale annullata');};
   try{
    const load=(options.resourceGate||((key,work)=>renderer.resourceGate(key,work)))('finale-cinematic-'+id,async()=>{
     const film=(await data()).films[id];assertCurrent();soundtrack?.stop();scene?.destroy();
     const dual=film.perspective.nativeScreenOffsetsQ12?.some(v=>v!==0),raster=dual?doc.createElement('canvas'):canvas;canvas.width=dual?768:960;canvas.height=dual?1152:720;raster.width=dual?768:960;raster.height=dual?576:720;
     scene=new(options.Scene||root.StarterScene.Scene)(raster,{preserveDrawingBuffer:true,frameSampling:'native',clearColor:[0,0,0],brightness:film.brightness,models:Object.fromEntries(Object.entries(film.models).map(([k,m])=>[k,m.url])),materialAlpha:film.materialAlpha,materialColor:film.materialColor,materialTextures:film.materialTextures,materialUV:film.materialUV,curves:{part0:film.camera},perspective:film.perspective});
     await scene.ready;assertCurrent();soundtrack=(options.audio||root.AudioEngine)?.createCinematic(film.audio.src,{ownsMusic:true});await soundtrack?.prepare();assertCurrent();return film;
    });
    const cancellation=new Promise((_,reject)=>{run.reject=reject;});let film=await Promise.race([load,cancellation]);assertCurrent();panel.dataset.frames=String(film.frames);panel.dataset.film=String(id);
    const dual=film.perspective.nativeScreenOffsetsQ12?.some(v=>v!==0),composite=dual?canvas.getContext('2d'):null;if(composite)composite.imageSmoothingEnabled=false;panel.dataset.screens=dual?'2':'1';
    await Promise.race([new Promise((resolve,reject)=>{const tick=now=>{try{assertCurrent();last??=now;const elapsed=Math.max(0,Math.min(100,now-last));last=now;const rate=options.rate?.()||root.GameSpeed?.rate||1;if(!doc.hidden)frame=Math.min(film.frames-1,frame+elapsed*.03*rate);
     if(dual){for(let screen=0;screen<2;screen++){const perspective={...film.perspective,nativeMatrixQ12:film.perspective.nativeScreenMatricesQ12[screen]},projection=(options.camera||root.StarterScene.camera)(film.camera,Math.floor(frame),4/3,perspective);scene.draw('part0',frame,{extra:['part1','part2'],projection,nativeScreen:screen});composite.drawImage(scene.canvas,0,screen*576,768,576);}}
     else scene.draw('part0',frame,{extra:['part1','part2']});
     soundtrack?.sync(frame,rate);panel.dataset.frame=String(Math.floor(frame));observer?.({id,frame,canvas,scene,screens:dual?2:1});if(frame>=film.frames-1)resolve();else raf=request(tick);
    }catch(error){reject(error);}};raf=request(tick);}),cancellation]);
   }finally{run.cancelled=true;run.reject=null;if(raf!==undefined)cancelFrame(raf);soundtrack?.stop();scene?.destroy();panel.remove();if(current===run)current=null;(options.resetInput||(()=>{if(typeof resetInput==='function')resetInput();}))();}
  }
  function cancel(){if(!current)return false;current.cancelled=true;current.reject?.(Error('Sequenza del finale annullata'));return true;}
  function observe(callback){if(callback!==undefined&&typeof callback!=='function')throw Error('Osservatore del filmato non valido');const previous=observer;observer=callback;return()=>{if(observer===callback)observer=previous;};}
  return {data,play,cancel,observe,get active(){return !!current;}};
 }
 const api={create,ids};Object.defineProperties(api,Object.getOwnPropertyDescriptors(create()));root.FinaleCinematics=api;
})(typeof window==='undefined'?globalThis:window);
