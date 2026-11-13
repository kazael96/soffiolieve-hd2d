/* IRBI overlay56 entrance task. One native30Hz clock owns model/camera/audio.
 * The browser widens the vertical lens on narrow screens; world curves remain native. */
(function(root){
 function cameraMatrix(sample,width,height,zoom=1.4){
  if(!Array.isArray(sample)||sample.length!==9||sample.some(v=>!Number.isFinite(v))||sample.slice(0,3).some(v=>v!==1)||!(width>0&&height>0&&zoom>0))throw Error('Camera originale della Lega non valida');
  const aspect=width/height,lens=Math.min(1,aspect/(4/3))*zoom/1.4;
  return root.StarterScene.camera([[...sample.slice(3,6),...sample.slice(6).map(v=>v/16)]],0,aspect,{sin:1398/4096,cos:3850/4096*lens,near:1/16,far:1024/16});
 }
 function create({data=root.FINALE_ELITE_FOUR_ANIMATION,controls=root.FINALE_ELITE_CONTROLS,state,hero,face=()=>{},resetInput=()=>{},prepare=async()=>{},entryPosition=()=>null,show=()=>{},update=()=>{},hide=()=>{},play=()=>{},stop=()=>{},startSupport=()=>{},endSupport=()=>{},coverFailure=()=>{}}){
  if(!data?.entrances||!controls?.rooms||typeof state!=='function'||typeof hero!=='function')throw Error('Sequenze originali della Lega non disponibili');
  let active=null,serial=0;
  function finish(r,completed,error=null){
   if(active!==r)return false;serial++;active=null;
   const clean=operation=>{try{operation();}catch(failure){error??=failure;}};
   let covered=false;const protect=()=>{if(error&&!covered){covered=true;clean(coverFailure);}};protect();
   clean(()=>r.sound?.cancel());if(r.visible)clean(()=>hide(r));if(r.supportStarted)clean(()=>endSupport(r,completed&&!error));r.visible=false;clean(resetInput);
   protect();
   if(error)r.reject?.(error);else r.resolve?.(completed);return true;
  }
  function cancel(){return active?finish(active,false):false;}
  function start(r){r.supportStarted=true;startSupport(r);r.visible=true;show(r);r.phase='play';r.sound.advance(0);update(r);}
  async function begin(room,{female=false}={}){
   const zone=139+room,entry=data.entrances[zone],control=controls.rooms[zone];
   if(!Number.isInteger(room)||!entry||!control||state().zone!==zone)throw Error('Ingresso della Lega fuori dalla propria sala');
   if(active)throw Error('Una sequenza della Lega è già in corso');
   const token=++serial,r={zone,room,entry,control,model:entry.models[female?0:1],frame:0,age:0,visible:false,phase:'prepare'};active=r;resetInput();
   try{await prepare(r);}catch(error){if(active===r){active=null;resetInput();}throw error;}
   if(token!==serial||active!==r||state().zone!==zone){if(active===r)cancel();return false;}
   r.sound=root.FinaleEliteSound.create({room:control,play,stop});
   const result=new Promise((resolve,reject)=>Object.assign(r,{resolve,reject}));
   try{
    const point=entryPosition(r),body=hero(),distance=point&&Math.hypot(point.x-body.x,point.y-body.y);
    if(point&&(![point.x,point.y,distance].every(Number.isFinite)||distance>.8))throw Error('Protagonista fuori dalla casella originale di ingresso');
    if(distance>1e-6){const dx=point.x-body.x,dy=point.y-body.y;r.align={from:{x:body.x,y:body.y},to:point,age:0,duration:distance/3.5,direction:Math.abs(dx)>Math.abs(dy)?dx>0?3:2:dy>0?1:0};r.phase='align';}else start(r);
   }catch(error){finish(r,false,error);}
   return result;
  }
  function tick(dt){
   const r=active;if(!r)return;if(state().zone!==r.zone){cancel();return;}
   if(r.phase==='prepare'||root.document?.hidden||!Number.isFinite(dt)||dt<=0)return;
   try{
    if(r.phase==='align'){
     const a=r.align,used=Math.min(dt,a.duration-a.age);a.age+=used;const f=Math.min(1,a.age/a.duration);Object.assign(hero(),{x:a.from.x+(a.to.x-a.from.x)*f,y:a.from.y+(a.to.y-a.from.y)*f});face(a.direction);
     if(f<1-1e-9)return;Object.assign(hero(),a.to);start(r);dt-=used;if(dt<=1e-9)return;
    }
    r.age+=dt;r.frame=Math.min(r.entry.nativeFrames-1,Math.floor((r.age+1e-9)*30));
    r.sound.advance(r.frame);update(r);
    if(r.age+1e-9<r.entry.nativeFrames/30)return;
    const [x,y,z]=r.control.destination;Object.assign(hero(),{x:x-15.5,y:z-15.5});state().fieldHeight=y;face(r.control.facing);finish(r,true);
   }catch(error){finish(r,false,error);}
  }
  const actor=()=>active?.phase==='align'?{direction:active.align.direction,frame:active.align.direction*3+[0,1,0,2][Math.floor(active.align.age*30/4)%4]}:null;
  return {begin,tick,cancel,actor,get busy(){return !!active;},get hidden(){return !!active?.visible;},get snapshot(){return active;}};
 }
 const api={create,cameraMatrix};root.FinaleEliteTask=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
