/* Original Black staff roll. Rendering is isolated from completion and saving;
 * finishing this component never unlocks postgame or supplies a battle result.
 */
(function(root){
 function create(options={}){
  let pending=null,current=null;
  const resources=options.resources||root.RuntimeAssets,resource=options.resource||root.NativeTextLayout?.resource,doc=options.document||root.document,request=options.requestFrame||root.requestAnimationFrame,cancelFrame=options.cancelFrame||root.cancelAnimationFrame;
  async function data(){if(!pending)pending=Promise.resolve().then(async()=>{if(options.data)return options.data;const s=new TextDecoder().decode(await resources.bytes(resource('finale-credits-data.js'))),m=/^\s*window\.FINALE_CREDITS\s*=\s*([\s\S]*?)\s*;?\s*$/.exec(s);if(!m)throw Error('Crediti originali non validi');const d=JSON.parse(m[1]);if(d.source?.overlay!==181||d.rows?.length!==437||d.texts?.length!==401||!d.model?.url||d.music!==1016||d.perspective?.sin<=0)throw Error('Crediti originali incompleti');return d;}).catch(e=>{pending=null;throw e;});return pending;}
  function cancel(){if(!current)return false;current.cancelled=true;current.reject?.(Error('Titoli di coda annullati'));return true;}
  async function play(){
   if(current)throw Error('Titoli di coda già in corso');const run=current={cancelled:false},alive=()=>{if(run.cancelled||current!==run)throw Error('Titoli di coda annullati');},cancelled=new Promise((_,reject)=>run.reject=reject);let panel,scene,soundtrack,raf;
   try{
    const prepared=await Promise.race([(options.resourceGate||((key,load)=>load()))('finale-credits',async()=>{
     // ResourceGate can invoke this loader again. Dispose the failed attempt
     // before allocating another WebGL context or appending a new panel.
     soundtrack?.stop();soundtrack=null;scene?.destroy();scene=null;panel?.remove();panel=null;
     const d=await data();alive();const atlases=Object.fromEntries(await Promise.all(Object.entries(d.images).filter(([key])=>key.startsWith('font')||key==='title').map(async([key,m])=>[key,await resources.image(resource(m.src))])));alive();
     panel=doc.createElement('section');panel.id='nativeFirstCredits';panel.setAttribute('aria-label','Titoli di coda · Pokémon Versione Nera');Object.assign(panel.style,{position:'fixed',inset:'0',zIndex:'80',background:'#000',display:'grid',placeItems:'center',pointerEvents:'none'});
     const viewport=doc.createElement('div');Object.assign(viewport.style,{position:'relative',width:'min(100vw,66.666667vh)',height:'min(150vw,100vh)',background:'#000'});panel.append(viewport);
     const model=doc.createElement('canvas'),text=doc.createElement('canvas');model.width=768;model.height=576;text.width=256;text.height=384;Object.assign(model.style,{position:'absolute',top:'0',left:'0',width:'100%',height:'50%'});Object.assign(text.style,{position:'absolute',inset:'0',width:'100%',height:'100%',imageRendering:'pixelated'});viewport.append(model,text);doc.body.append(panel);
     scene=new(options.Scene||root.StarterScene.Scene)(model,{frameSampling:'native',clearColor:[0,0,0],models:{dragon:d.model.url},materialAlpha:{dragon:{}},materialTextures:{dragon:d.materialTextures},curves:{dragon:[[0,0,0,0,0,1]]},perspective:d.perspective});await scene.ready;alive();
     const music=options.music||root.FINALE_AUDIO?.music?.[1016];if(!music?.src)throw Error('Musica originale dei crediti non disponibile');soundtrack=(options.audio||root.AudioEngine)?.createCinematic(music.src,{ownsMusic:true});await soundtrack?.prepare();alive();return{d,atlases,model,text};
    }),cancelled]);alive();
    const {d,atlases,model,text}=prepared,motion=(options.motion||root.FinaleCreditsMotion).create(d),context=text.getContext('2d');context.imageSmoothingEnabled=false;let last,accumulator=0,state=motion.snapshot();
    await Promise.race([new Promise((resolve,reject)=>{const tick=now=>{try{
     alive();last??=now;const elapsed=Math.max(0,Math.min(100,now-last));last=now;const rate=options.rate?.()||root.GameSpeed?.rate||1;
     if(!doc.hidden){accumulator+=elapsed*.06*rate;while(accumulator>=1&&!state.finished){state=motion.tick();accumulator--;}}
     model.style.visibility=state.visible?'visible':'hidden';model.style.opacity=state.phase==='finish'?String(state.alpha/16):'1';if(state.visible)scene.draw('dragon',state.frame%d.model.loopFrames,{projection:(options.motion||root.FinaleCreditsMotion).projection(state.camera,d.perspective)});
     context.clearRect(0,0,256,384);
     if(state.logo.visible){context.save();context.translate(128,96);context.scale(state.logo.scale,state.logo.scale);context.globalAlpha=state.logo.alpha;context.drawImage(atlases.title,0,0,256,192,-128,-96,256,192);context.restore();}
     for(const line of state.lines){const font=d.fonts[line.font],value=d.texts[line.text],width=[...value].reduce((n,c)=>n+font.glyphs[c][3],0);let x=line.x-(line.align===1?width:line.align===2?Math.floor(width/2):0);context.globalAlpha=state.phase==='in'||state.phase.startsWith('out')||state.phase==='finish'?state.alpha/16:1;for(const c of value){const [sx,sy,left,advance]=font.glyphs[c];context.drawImage(atlases['font'+line.font+'-color'+line.color],sx,sy,font.cellWidth,font.height,x+left,line.y,font.cellWidth,font.height);x+=advance;}}
     context.globalAlpha=1;soundtrack?.sync(state.frame/2,rate);panel.dataset.frame=String(state.frame);panel.dataset.row=String(state.row);options.onFrame?.(state);
     if(state.finished)resolve();else raf=request(tick);
    }catch(error){reject(error);}};raf=request(tick);}),cancelled]);
   }finally{run.cancelled=true;run.reject=null;if(raf!==undefined)cancelFrame(raf);soundtrack?.stop();scene?.destroy();panel?.remove();if(current===run)current=null;options.resetInput?.();}
  }
  return{data,play,cancel,get active(){return !!current;}};
 }
 root.FinaleCredits={create};
})(typeof window==='undefined'?globalThis:window);
