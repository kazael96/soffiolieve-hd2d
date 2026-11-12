/* IRBI field-model animations. Original BCA/BMA data, projected by VillageRenderer. */
(function(root){
  function nativeFrame(metadata,frame,length){return metadata.mode===1?Math.floor(frame)%length:Math.max(0,Math.min(length-1,Math.floor(frame)));}
  function boundTracks(model,metadata,animation,frame){
    const bindings=metadata.animations?.[animation]?.bindings;
    if(!bindings)return {tracks:model.animationSets[animation]||[],time:()=>frame};
    const tracks=[],times=new Map();
    for(const binding of bindings){
      const set=model.animationSets[binding.index];if(!set)throw Error('Traccia originale del modello non disponibile');
      for(const track of set)if(binding.kind==='joint'?track.node!==undefined:!!track.property){tracks.push(track);times.set(track,nativeFrame(metadata,frame,binding.frames));}
    }
    return {tracks,time:track=>times.get(track)};
  }
  function worldMatrices(model,tracks,frame,time=()=>frame){
    const {doc}=model,{identity,mul,trs,sample}=root.StarterScene;
    const transforms=doc.nodes.map(n=>({translation:n.translation,rotation:n.rotation,scale:n.scale}));
    for(const track of tracks){if(track.node===undefined)continue;transforms[track.node][track.path]=sample(track,time(track)/60);}
    const matrices=[];
    function visit(i,parent){const node=doc.nodes[i],t=transforms[i];matrices[i]=mul(parent,node.matrix||trs(t.translation,t.rotation,t.scale));for(const child of node.children||[])visit(child,matrices[i]);}
    for(const node of doc.scenes[doc.scene||0].nodes)visit(node,identity());
    return matrices;
  }
  function materialPattern(metadata,animation,material,frame){const keys=metadata.materialTextures?.[animation]?.[material];if(!keys?.length)return null;if(keys[0].nativeFrames)frame=nativeFrame(metadata,frame,keys[0].nativeFrames);let selected=null;for(const key of keys){if(key.frame>frame)break;selected=key;}if(!selected)throw Error('Texture animata originale non disponibile');return selected;}
  function geometryKey(model,record,animation,frame){
    const textureOnly=record.nativeFormats?.length&&record.nativeFormats.every(format=>format==='BTP0')&&!model.animationSets[animation]?.length&&!Object.keys(record.materialAlpha||{}).length&&!record.materialUV?.[animation];
    if(!textureOnly){
      if(record.mode!==1)return animation+':'+frame;
      // Native resources can have different periods; retain their individual
      // phases rather than wrapping the whole model at its longest track.
      return JSON.stringify([animation,...(record.animations[animation].bindings||[]).map(b=>nativeFrame(record,frame,b.frames)),...Object.values(record.materialUV?.[animation]||{}).map(t=>nativeFrame(record,frame,t.frames.length)),...Object.values(record.materialAlpha||{}).map(t=>nativeFrame(record,frame,t.length)),...Object.keys(record.materialTextures?.[animation]||{}).map(name=>materialPattern(record,animation,name,frame).url)]);
    }
    return JSON.stringify([animation,...Object.keys(record.materialTextures?.[animation]||{}).map(material=>{const key=materialPattern(record,animation,material,frame);return [material,key.url,key.w,key.h];})]);
  }
  function geometry(model,metadata,animation,frame,units=16){
    const {doc,accessor}=model,{mul,sample}=root.StarterScene,{tracks,time}=boundTracks(model,metadata,animation,frame);
    const matrices=worldMatrices(model,tracks,frame,time),properties={};
    for(const track of tracks)if(track.property)properties[track.property]=sample(track,time(track)/60);
    const output=[];
    doc.nodes.forEach((node,ni)=>{if(node.mesh===undefined)return;
      const skin=doc.skins?.[node.skin],inverse=skin&&accessor(skin.inverseBindMatrices),bones=skin&&skin.joints.map((joint,i)=>mul(matrices[joint],inverse[i]));
      for(const primitive of doc.meshes[node.mesh].primitives){
        const a=primitive.attributes,p=accessor(a.POSITION),normal=a.NORMAL===undefined?null:accessor(a.NORMAL),uv=a.TEXCOORD_0===undefined?null:accessor(a.TEXCOORD_0),colors=a.COLOR_0===undefined?null:accessor(a.COLOR_0);
        const joints=a.JOINTS_0===undefined?null:accessor(a.JOINTS_0),weights=a.WEIGHTS_0===undefined?null:accessor(a.WEIGHTS_0);
        const material=doc.materials[primitive.material],factor=material.pbrMetallicRoughness?.baseColorFactor||[1,1,1,1],textureIndex=material.pbrMetallicRoughness?.baseColorTexture?.index;
        const tex=doc.textures?.[textureIndex],image=tex&&model.images[tex.source],sampler=doc.samplers?.[tex?.sampler]||{},pattern=materialPattern(metadata,animation,material.name,frame),w=pattern?.w||image?.width||1,h=pattern?.h||image?.height||1;
        const nativeUV=metadata.materialUV?.[animation]?.[material.name]?.frames,texOffset=nativeUV?nativeUV[nativeFrame(metadata,frame,nativeUV.length)]:properties[`/materials/${primitive.material}/pbrMetallicRoughness/baseColorTexture/extensions/KHR_texture_transform/offset`]||[0,0];
        const indices=primitive.indices===undefined?p.map((_,i)=>i):accessor(primitive.indices).flat(),verts=[];
        for(const index of indices){
          const matrix=skin&&joints?Array.from({length:16},(_,i)=>joints[index].reduce((sum,j,k)=>sum+bones[j][i]*weights[index][k],0)):matrices[ni];
          const pos=p[index],n=normal?.[index]||[0,1,0],point=Array.from({length:3},(_,i)=>(matrix[i]*pos[0]+matrix[4+i]*pos[1]+matrix[8+i]*pos[2]+matrix[12+i])/units),norm=Array.from({length:3},(_,i)=>matrix[i]*n[0]+matrix[4+i]*n[1]+matrix[8+i]*n[2]);
          verts.push(...point,((uv?.[index]?.[0]||0)+texOffset[0])*w,((uv?.[index]?.[1]||0)+texOffset[1])*h,...factor.slice(0,3).map((c,i)=>c*(colors?.[index]?.[i]??1)),...norm);
        }
        const alpha=metadata.materialAlpha?.[material.name];
        output.push({verts,material:material.name,doubleSided:!!material.doubleSided,textureIndex,...(pattern?{patternURL:pattern.url}:{}),alpha:alpha?alpha[nativeFrame(metadata,frame,alpha.length)]/31:factor[3],repeatS:sampler.wrapS!==33071,repeatT:sampler.wrapT!==33071,mirrorS:sampler.wrapS===33648,mirrorT:sampler.wrapT===33648});
      }
    });return output;
  }
  function targets(scene,assets){
    const result=[];
    for(const instance of scene.instances){
      const chapter=/^(route|striaton|pw|ca|mt|ic|op|lg|fn)(?:-season[0-3])?-prop-(True|False)-(\d+)-(\d+)$/.exec(instance.model),match=/^(?:out-|in-)?prop-?(\d+)$/.exec(instance.model);if(!match&&!chapter)continue;
      const id=+(match?.[1]??chapter[4]),indoor=instance.model.startsWith('in-')||chapter?.[2]==='False',scope=chapter&&assets.scopes?.[chapter[1]],scopedKey=chapter&&chapter.slice(2).join('-'),child=indoor?null:scope?.children[scopedKey]||assets.children[id],record=scope?.models[child?.modelKey||scopedKey]||assets.models[child?.model??id];if(!record||indoor!==(record.source.archive==='a/2/3/0'))continue;
      const [x,y,z]=child?.offset||[0,0,0],c=Math.cos(instance.rotation),s=Math.sin(instance.rotation);
      result.push({instance,record,automatic:chapter?.[1]==='fn'&&record.mode===1,child:!!child,x:instance.x+x*c+z*s,y:instance.y+y,z:instance.z-x*s+z*c,rotation:instance.rotation,key:instance.model+':'+instance.x+':'+instance.z});
    }return result;
  }
  class Controller {
    constructor(renderer,assets,audio=()=>{}){
      this.renderer=renderer;this.assets=assets;this.audio=audio;this.loaded=new Map();this.handles=new Map();this.scenes=new WeakMap();this.nextHandle=1;
      this.waiters=[];this.ready=this.load();
      renderer.fieldModels=this;
    }
    uploadTextures(model){model.textures=(model.doc.textures||[]).map(tex=>this.renderer.upload(model.images[tex.source],false));model.patternTextures=new Map([...(model.patternImages||[])].map(([url,image])=>[url,this.renderer.upload(image,false)]));}
    async loadModel(record){
      if(this.loaded.has(record.key))return;
      const model=await root.StarterScene.loadGLB(record.model),urls=[...new Set(Object.values(record.materialTextures||{}).flatMap(materials=>Object.values(materials).flatMap(keys=>keys.map(key=>key.url))))];
      if(urls.some(url=>typeof url!=='string'||!url))throw Error('Texture animata originale non disponibile');
      // Finish all downloads before allocating GPU objects, so a failed
      // pattern load can retry without leaving half-installed textures.
      model.patternImages=new Map(await Promise.all(urls.map(async url=>[url,await root.RuntimeAssets.image(url)])));
      for(const materials of Object.values(record.materialTextures||{}))for(const keys of Object.values(materials))for(const key of keys){const image=model.patternImages.get(key.url);key.w??=image.width;key.h??=image.height;}
      this.uploadTextures(model);model.cache=new Map();this.loaded.set(record.key,model);
    }
    async load(records=Object.values(this.assets.models)){const results=await Promise.allSettled(records.map(record=>this.loadModel(record)));const failed=results.find(r=>r.status==='rejected');this.error=failed?.reason||null;this.failedRecords=this.error?[...records]:null;if(this.error){this.renderer.modelsRecovering=true;this.renderer.status?.('Alcuni modelli non sono disponibili. Riprova il caricamento.',()=>this.renderer.contextLost?this.renderer.restoreContext():this.retry(),{key:'models',valid:()=>!!this.error&&!this.renderer.gl?.isContextLost()});return false;}for(const done of this.waiters.splice(0))done();return true;}
    async prepareScene(scene=this.renderer.scene){const records=[...new Set(this.records(scene,true).map(target=>target.record))];if(records.some(record=>!this.loaded.has(record.key)))this.ready=this.load(records);if(!await this.ready)throw this.error||Error('Modelli della scena non disponibili');root.LeagueGates?.prepare(this,scene);this.renderer.modelsRecovering=false;this.renderer.recovery?.clear('models');return true;}
    async retry(){this.ready=this.load(this.failedRecords||Object.values(this.assets.models));const okay=await this.ready;if(okay){this.renderer.recovery?.clear('models');this.renderer.modelsRecovering=false;if(this.renderer.assetsReady&&!this.renderer.contextLost&&!this.renderer.resourceGates?.size){this.renderer.ready=true;document.getElementById('loading')?.remove();this.renderer.resumeSceneWaiters?.();}this.renderer.recovery?.refresh();}return okay;}
    restoreGraphics(){for(const model of this.loaded.values()){const gl=this.renderer.gl;for(const t of [...(model.textures||[]),...(model.patternTextures?.values()||[])])if(gl?.isTexture?.(t.texture))gl.deleteTexture(t.texture);for(const groups of model.cache.values())for(const group of groups)if(gl?.isBuffer?.(group.buf))gl.deleteBuffer(group.buf);this.uploadTextures(model);model.cache.clear();}}
    records(scene=this.renderer.scene,refresh=false){
      const cached=this.scenes.get(scene);
      if(refresh||!cached||cached.instances!==scene.instances||cached.count!==scene.instances.length){
        // Deferred geometry and newly installed native scopes keep the same
        // scene identity. Refresh their targets, retaining live handle state.
        const previous=new Map((cached?.items||[]).map(t=>[t.instance,t])),items=targets(scene,this.assets).map(target=>{const old=previous.get(target.instance);return old?.record===target.record?Object.assign(old,target):target;});
        for(const target of items)if(target.automatic&&target.animation===undefined)Object.assign(target,{animation:0,elapsed:0,frame:0,playing:true});
        this.scenes.set(scene,{instances:scene.instances,count:scene.instances.length,items});
      }
      return this.scenes.get(scene).items;
    }
    find(type,x,z){
      // IRBI 0218C484/0218C8C4: first compatible loaded model, inclusive rectangle.
      return this.records().find(t=>t.record.class===type&&Math.abs(t.x-x)<=2&&Math.abs(t.z-z)<=3)||null;
    }
    create(type,x,z){
      const target=this.find(type,x,z);if(!target)throw Error(`Original field model unavailable: class ${type} at ${x},${z}`);
      const id=this.nextHandle++;this.handles.set(id,target);return id;
    }
    hide(type,x,z){
      const target=this.find(type,x,z);if(!target)return false;
      target.resolve?.();target.playing=false;target.hidden=true;return true;
    }
    property(type,x,z,value){
      const target=this.find(type,x,z);if(!target?.record.key.startsWith('fn-field-'))return false;
      // IRBI mode1's property callback is218c338 (no-op). Mode2 routes
      // 1 to218c1e4 (last pose),2 to218c190 (play),3 to218c250 (pause).
      if(target.record.mode===1)return true;
      if(target.record.mode!==2||![0,1,2,3].includes(value))throw Error('Proprietà originale del modello non supportata');
      if(value===3){target.playing=false;return true;}
      const spec=target.record.animations[0];if(!spec)throw Error('Animazione originale del modello non disponibile');
      target.resolve?.();Object.assign(target,{animation:0,elapsed:value===1?spec.frames/this.assets.tickRate:0,frame:value===1?spec.frames-1:0,playing:value===2});
      target.promise=value===2?new Promise(resolve=>target.resolve=resolve):Promise.resolve();
      if(value===1)target.resolve=null;
      return true;
    }
    async play(id,animation){
      await this.ready;if(this.error)await new Promise(resolve=>this.waiters.push(resolve));const target=this.handles.get(id);if(!target)throw Error('Unknown field model handle '+id);
      const spec=target.record.animations[animation];if(!spec)throw Error('Unknown original model animation '+animation);
      target.resolve?.();target.animation=animation;target.elapsed=0;target.frame=0;target.playing=true;
      target.promise=new Promise(resolve=>target.resolve=resolve);
      if(spec.sound)void this.audio(spec.sound);
    }
    wait(id){const target=this.handles.get(id);return target?.promise||Promise.resolve();}
    pause(id){const target=this.handles.get(id);if(!target)throw Error('Unknown field model handle '+id);target.playing=false;}
    release(id){const target=this.handles.get(id);if(target){target.resolve?.();for(const key of ['animation','frame','elapsed','playing','promise','resolve'])delete target[key];}this.handles.delete(id);}
    clear(){for(const id of [...this.handles.keys()])this.release(id);for(const target of this.records()){delete target.hidden;if(target.automatic)Object.assign(target,{animation:0,elapsed:0,frame:0,playing:true});}}
    tick(dt){
      for(const target of this.records())if(target.playing){
        if(target.automatic&&!this.loaded.has(target.record.key))continue;
        const spec=target.record.animations[target.animation];target.elapsed+=dt;
        target.frame=target.automatic?Math.floor((target.elapsed+1e-9)*this.assets.tickRate):Math.min(spec.frames-1,Math.floor((target.elapsed+1e-9)*this.assets.tickRate));
        if(!target.automatic&&target.elapsed+1e-9>=spec.frames/this.assets.tickRate){target.playing=false;target.resolve?.();target.resolve=null;}
      }
      if(this.renderer.canvas)this.renderer.canvas.dataset.fieldModels=JSON.stringify(this.records().filter(t=>t.animation!==undefined).map(t=>({model:t.record.key,animation:t.animation,frame:t.frame,playing:t.playing})));
    }
    replaces(instance){return this.records().some(t=>t.instance===instance&&!t.child&&(t.hidden||t.animation!==undefined));}
    draw(instance,extra=[]){
      const r=this.renderer,g=r.gl;
      for(const target of [...this.records(),...extra].filter(t=>t.instance===instance)){
        if(target.hidden)continue;
        // Bedroom smoke is event-controlled; its last BMA frame is transparent.
        if(!target.child&&target.animation===undefined)continue;
        const model=this.loaded.get(target.record.key);if(!model)continue;
        const animation=target.animation??0,frame=target.frame??0,key=geometryKey(model,target.record,animation,frame);
        if(!model.cache.has(key))model.cache.set(key,geometry(model,target.record,animation,frame,this.assets.units).map(group=>{
          const {verts,...material}=group,buf=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,buf);g.bufferData(g.ARRAY_BUFFER,new Float32Array(verts),g.STATIC_DRAW);return {...material,buf,count:verts.length/11};
        }));
        if(target.record.key.startsWith('fn-field-')){
          const current=model.cache.get(key);model.cache.delete(key);model.cache.set(key,current);
          while(model.cache.size>64){const oldest=model.cache.keys().next().value;for(const group of model.cache.get(oldest))g.deleteBuffer(group.buf);model.cache.delete(oldest);}
        }
        g.uniform3f(r.loc.uOffset,target.x,target.y,target.z);g.uniform2f(r.loc.uRotation,Math.cos(target.rotation),Math.sin(target.rotation));g.uniform1f(r.loc.uSprite,0);g.uniform1f(r.loc.uShadow,0);
        for(const group of [...model.cache.get(key)].sort((a,b)=>(b.alpha===1)-(a.alpha===1))){
          if(group.alpha<=0)continue;const texture=group.patternURL?model.patternTextures.get(group.patternURL):model.textures[group.textureIndex]||r.white;if(!texture)throw Error('Texture animata originale non caricata');if(group.doubleSided)g.disable(g.CULL_FACE);else g.enable(g.CULL_FACE);r.bind(group.buf);r.texture(texture,group.repeatS,group.repeatT,group.mirrorS,group.mirrorT);g.uniform1f(r.loc.uAlpha,group.alpha);g.depthMask(group.alpha>=1);g.drawArrays(g.TRIANGLES,0,group.count);
        }g.depthMask(true);g.disable(g.CULL_FACE);
      }
    }
  }
  root.FieldModels={Controller,geometry,worldMatrices,targets};
  if(typeof module!=='undefined')module.exports=root.FieldModels;
})(typeof window!=='undefined'?window:globalThis);
