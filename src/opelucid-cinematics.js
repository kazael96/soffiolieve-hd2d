/* Native Tower cameras, joints, material colours, alpha and texture patterns. */
(function(root){
 function create(options={}){
  let pending=null,active=false;
  async function data(){
   if(pending)return pending;
   pending=Promise.resolve().then(async()=>{const raw=await(options.resources||root.RuntimeAssets).bytes((options.resource||root.NativeTextLayout.resource)('opelucid-cinematics-data.js')),text=new TextDecoder().decode(raw),match=/^\s*window\.OPELUCID_CINEMATICS\s*=\s*([\s\S]*?)\s*;?\s*$/.exec(text);if(!match)throw Error('Sequenze della Torre non valide');const parsed=JSON.parse(match[1]);for(const id of [13,14]){const f=parsed.films?.[id];if(!f||f.camera.length!==f.frames||!f.models.stage?.url||!f.models.dragon?.url||f.audio?.src!=='assets/opelucid/cinematics/'+id+'/audio.flac'||f.audio.rate!==32768||!f.audio.nativePitchAndVolumeBaked)throw Error('Sequenza della Torre incompleta: '+id);}return parsed;}).catch(error=>{pending=null;throw error;});return pending;
  }
  async function play(id){
   if(![13,14].includes(id))throw Error('Sequenza della Torre non disponibile: '+id);
   if(active)throw Error('Una sequenza narrativa è già in corso');active=true;
   const doc=options.document||root.document,panel=doc.createElement('section'),canvas=doc.createElement('canvas');panel.id='chapterCinematic';panel.setAttribute('aria-label','Torre Dragospira · N e il Pokémon leggendario');Object.assign(panel.style,{position:'fixed',inset:'0',zIndex:'80',background:'#10191f',display:'grid',placeItems:'center'});Object.assign(canvas.style,{width:'100%',height:'100%',objectFit:'contain'});canvas.width=960;canvas.height=720;panel.append(canvas);doc.body.append(panel);
   let scene,soundtrack,raf,last,frame=0,stopped=false;
   const request=options.requestFrame||root.requestAnimationFrame,cancel=options.cancelFrame||root.cancelAnimationFrame;
   try{
    const gate=options.resourceGate||((key,load)=>renderer.resourceGate(key,load));
    let film;await gate('tower-cinematic-'+id,async()=>{film=(await data()).films[id];soundtrack?.stop();scene?.destroy();const assets={preserveDrawingBuffer:true,clearColor:[0,0,0],brightness:film.brightness,models:Object.fromEntries(Object.entries(film.models).map(([key,value])=>[key,value.url])),materialAlpha:{dragon:{},...film.materialAlpha},materialColor:film.materialColor,materialTextures:film.materialTextures,curves:{stage:film.camera},perspective:film.perspective};scene=new(options.Scene||root.StarterScene.Scene)(canvas,assets);await scene.ready;soundtrack=(options.audio||root.AudioEngine)?.createCinematic(film.audio.src);await soundtrack?.prepare();});
    panel.dataset.frames=String(film.frames);panel.dataset.film=String(id);
    await new Promise((resolve,reject)=>{const tick=now=>{if(stopped)return;try{last??=now;const elapsed=Math.max(0,Math.min(100,now-last));last=now;if(!doc.hidden)frame=Math.min(film.frames-1,frame+elapsed*.03*(options.rate?.()||root.GameSpeed?.rate||1));scene.draw('stage',frame,{extra:['dragon']});soundtrack?.sync(frame,options.rate?.()||root.GameSpeed?.rate||1);panel.dataset.frame=String(Math.floor(frame));if(frame>=film.frames-1)resolve();else raf=request(tick);}catch(error){reject(error);}};raf=request(tick);});
   }finally{stopped=true;if(raf!==undefined)cancel(raf);soundtrack?.stop();scene?.destroy();panel.remove();active=false;(options.resetInput||(()=>{if(typeof resetInput==='function')resetInput();}))();}
  }
  return {data,play,get active(){return active;}};
 }
 const api={create};Object.defineProperties(api,Object.getOwnPropertyDescriptors(create()));root.OpelucidCinematics=api;
})(typeof window==='undefined'?globalThis:window);
