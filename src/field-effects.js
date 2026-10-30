/* Original IRBI Pokédex receipt models/BMA/SPA; web field clock and HD-2D overlay. */
(function(root){
  const fieldRate=30;
  function duration(effect,assets){
    if(effect.particles===false)return effect.frames;
    const tail=Math.max(0,...assets.particles.emitters.map(e=>(effect.emitterStartFrame||0)+(e.delay||0)+(e.emitterLife||0)+(e.life||0)+1));
    return Math.max(effect.frames,tail);
  }
  function project(matrix,point,w,h){
    const p=[...point,1],clip=Array.from({length:4},(_,i)=>p.reduce((sum,v,j)=>sum+v*matrix[j*4+i],0));
    return {x:(clip[0]/clip[3]+1)*w/2,y:(1-clip[1]/clip[3])*h/2,w:clip[3]};
  }
  function particles(effect,assets,frame,w,h){
    if(effect.particles===false)return [];
    const out=[],S=root.ParticleSPL,matrix=root.StarterScene.camera([[0,0,0,...assets.camera.eye]],0,w/h,assets.perspective);
    const emitter=assets.particles.emitters[effect.emitter],time=frame-(effect.emitterStartFrame||0)-(emitter.delay||0),interval=Math.max(1,emitter.interval||1);
    if(time<0)return out;
    for(let birth=0;birth<emitter.emitterLife&&birth<=time;birth+=interval){
      const rate=emitter.rate||0,count=Math.floor((birth/interval+1)*rate)-Math.floor(birth/interval*rate);
      for(let index=0;index<count;index++){
        const seed=effect.emitter*100003+birth*97+index+50,life=S.life(emitter,seed),age=time-birth;if(age>life)continue;
        const appearance=S.animation(emitter,age,life,seed),motion=S.motion(emitter,age,seed);
        const position=motion.p.map((v,i)=>v+emitter.position[i]+(effect.emitterPositionDelta?.[i]||0)),p=project(matrix,position,w,h),edge=project(matrix,[position[0]+appearance.scale,position[1],position[2]],w,h);
        out.push({x:p.x,y:p.y,size:Math.abs(edge.x-p.x)*2,alpha:appearance.alpha,angle:appearance.angle,texture:appearance.texture,color:appearance.color,aspect:emitter.aspect||1});
      }
    }return out;
  }
  class Player {
    constructor(id,assets=root.FIELD_EFFECT_ASSETS){
      this.assets=assets;this.effect=assets.effects[id];if(!this.effect)throw Error('Original field effect unavailable: '+id);
      this.panel=document.createElement('section');this.panel.id='nativeFieldEffect';this.panel.setAttribute('aria-label',this.effect.label||'Ricezione del Pokédex');
      this.canvas=document.createElement('canvas');this.canvas.width=768;this.canvas.height=576;this.particleCanvas=document.createElement('canvas');this.particleCanvas.width=768;this.particleCanvas.height=576;
      this.panel.append(this.canvas,this.particleCanvas);document.body.append(this.panel);this.context=this.particleCanvas.getContext('2d');
      const models=Object.fromEntries([this.effect.background,this.effect.item].map(name=>[name,assets.models[name].url]));
      this.scene=new root.StarterScene.Scene(this.canvas,{models,materialAlpha:assets.materialAlpha,perspective:assets.perspective,curves:{[this.effect.background]:[[0,0,0,...assets.camera.eye]]},transparent:true});
      this.images=[];this.ready=Promise.all([this.scene.ready,...assets.particles.textures.map((t,i)=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{this.images[i]=image;resolve();};image.onerror=()=>reject(Error('Original particle texture unavailable'));image.src=t.src||'assets/field-effects/'+t.name;}))]);
    }
    draw(frame){
      this.panel.dataset.frame=String(frame);this.scene.draw(this.effect.background,frame,{extra:[this.effect.item]});
      const c=this.context;c.clearRect(0,0,768,576);c.imageSmoothingEnabled=false;
      for(const p of particles(this.effect,this.assets,frame,768,576)){const image=this.images[p.texture];if(!image||p.alpha<=0)continue;c.save();c.translate(p.x,p.y);c.rotate(p.angle);c.globalAlpha=p.alpha;c.drawImage(image,-p.size/2,-p.size*p.aspect/2,p.size,p.size*p.aspect);c.restore();}
    }
    destroy(){this.scene.destroy();this.panel.remove();}
  }
  async function play(id){
    root.ParticleSPL.clear();const player=new Player(id);let request;
    try{await player.ready;const end=duration(player.effect,player.assets);await new Promise((resolve,reject)=>{let last,elapsed=0;
      const tick=now=>{try{last??=now;elapsed+=(now-last)*(root.GameSpeed?.rate||1);last=now;const frame=Math.min(end-1,Math.floor(elapsed*fieldRate/1000));player.draw(frame);if(elapsed*fieldRate/1000>=end)resolve();else request=requestAnimationFrame(tick);}catch(error){reject(error);}};
      request=requestAnimationFrame(tick);
    });}finally{if(request)cancelAnimationFrame(request);player.destroy();}
  }
  root.FieldEffects={Player,play,duration,particles,project,fieldRate};
})(typeof window!=='undefined'?window:globalThis);
