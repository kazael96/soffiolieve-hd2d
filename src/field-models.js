/* IRBI field-model animations. Original BCA/BMA data, projected by VillageRenderer. */
(function(root){
  function worldMatrices(model,tracks,frame){
    const {doc}=model,{identity,mul,trs,sample}=root.StarterScene;
    const transforms=doc.nodes.map(n=>({translation:n.translation,rotation:n.rotation,scale:n.scale}));
    for(const track of tracks){if(track.node===undefined)continue;transforms[track.node][track.path]=sample(track,frame/60);}
    const matrices=[];
    function visit(i,parent){const node=doc.nodes[i],t=transforms[i];matrices[i]=mul(parent,node.matrix||trs(t.translation,t.rotation,t.scale));for(const child of node.children||[])visit(child,matrices[i]);}
    for(const node of doc.scenes[doc.scene||0].nodes)visit(node,identity());
    return matrices;
  }
  function geometry(model,metadata,animation,frame,units=16){
    const {doc,accessor}=model,{mul,sample}=root.StarterScene,tracks=model.animationSets[animation]||[];
    const matrices=worldMatrices(model,tracks,frame),properties={};
    for(const track of tracks)if(track.property)properties[track.property]=sample(track,frame/60);
    const output=[];
    doc.nodes.forEach((node,ni)=>{if(node.mesh===undefined)return;
      const skin=doc.skins?.[node.skin],inverse=skin&&accessor(skin.inverseBindMatrices),bones=skin&&skin.joints.map((joint,i)=>mul(matrices[joint],inverse[i]));
      for(const primitive of doc.meshes[node.mesh].primitives){
        const a=primitive.attributes,p=accessor(a.POSITION),normal=a.NORMAL===undefined?null:accessor(a.NORMAL),uv=a.TEXCOORD_0===undefined?null:accessor(a.TEXCOORD_0),colors=a.COLOR_0===undefined?null:accessor(a.COLOR_0);
        const joints=a.JOINTS_0===undefined?null:accessor(a.JOINTS_0),weights=a.WEIGHTS_0===undefined?null:accessor(a.WEIGHTS_0);
        const material=doc.materials[primitive.material],factor=material.pbrMetallicRoughness?.baseColorFactor||[1,1,1,1],textureIndex=material.pbrMetallicRoughness?.baseColorTexture?.index;
        const tex=doc.textures?.[textureIndex],image=tex&&model.images[tex.source],sampler=doc.samplers?.[tex?.sampler]||{},w=image?.width||1,h=image?.height||1;
        const texOffset=properties[`/materials/${primitive.material}/pbrMetallicRoughness/baseColorTexture/extensions/KHR_texture_transform/offset`]||[0,0];
        const indices=primitive.indices===undefined?p.map((_,i)=>i):accessor(primitive.indices).flat(),verts=[];
        for(const index of indices){
          const matrix=skin&&joints?Array.from({length:16},(_,i)=>joints[index].reduce((sum,j,k)=>sum+bones[j][i]*weights[index][k],0)):matrices[ni];
          const pos=p[index],n=normal?.[index]||[0,1,0],point=Array.from({length:3},(_,i)=>(matrix[i]*pos[0]+matrix[4+i]*pos[1]+matrix[8+i]*pos[2]+matrix[12+i])/units),norm=Array.from({length:3},(_,i)=>matrix[i]*n[0]+matrix[4+i]*n[1]+matrix[8+i]*n[2]);
          verts.push(...point,((uv?.[index]?.[0]||0)+texOffset[0])*w,((uv?.[index]?.[1]||0)+texOffset[1])*h,...factor.slice(0,3).map((c,i)=>c*(colors?.[index]?.[i]??1)),...norm);
        }
        const alpha=metadata.materialAlpha?.[material.name];
        output.push({verts,material:material.name,doubleSided:!!material.doubleSided,textureIndex,alpha:alpha?alpha[Math.min(alpha.length-1,Math.floor(frame))]/31:factor[3],repeatS:sampler.wrapS!==33071,repeatT:sampler.wrapT!==33071,mirrorS:sampler.wrapS===33648,mirrorT:sampler.wrapT===33648});
      }
    });return output;
  }
  function targets(scene,assets){
    const result=[];
    for(const instance of scene.instances){
      const chapter=/^(?:route|striaton)-prop-(True|False)-\d+-(\d+)$/.exec(instance.model),match=/^(?:out-|in-)?prop-?(\d+)$/.exec(instance.model)||(chapter&&[chapter[0],chapter[2]]);if(!match)continue;
      const id=+match[1],indoor=instance.model.startsWith('in-')||chapter?.[1]==='False',child=indoor?null:assets.children[id],record=assets.models[child?.model??id];if(!record||indoor!==(record.source.archive==='a/2/3/0'))continue;
      const [x,y,z]=child?.offset||[0,0,0],c=Math.cos(instance.rotation),s=Math.sin(instance.rotation);
      result.push({instance,record,child:!!child,x:instance.x+x*c+z*s,y:instance.y+y,z:instance.z-x*s+z*c,rotation:instance.rotation,key:instance.model+':'+instance.x+':'+instance.z});
    }return result;
  }
  class Controller {
    constructor(renderer,assets,audio=()=>{}){
      this.renderer=renderer;this.assets=assets;this.audio=audio;this.loaded=new Map();this.handles=new Map();this.scenes=new WeakMap();this.nextHandle=1;
      this.waiters=[];this.ready=this.load();
      renderer.fieldModels=this;
    }
    async load(){const results=await Promise.allSettled(Object.values(this.assets.models).map(async record=>{if(this.loaded.has(record.key))return;const model=await root.StarterScene.loadGLB(record.model);model.textures=(model.doc.textures||[]).map(tex=>this.renderer.upload(model.images[tex.source],false));model.cache=new Map();this.loaded.set(record.key,model);}));const failed=results.find(r=>r.status==='rejected');this.error=failed?.reason||null;if(this.error){this.renderer.modelsRecovering=true;this.renderer.status?.('Alcuni modelli non sono disponibili. Riprova il caricamento.',()=>this.renderer.contextLost?this.renderer.restoreContext():this.retry());return false;}for(const done of this.waiters.splice(0))done();return true;}
    async retry(){this.ready=this.load();const okay=await this.ready;if(okay){this.renderer.modelsRecovering=false;if(this.renderer.assetsReady&&!this.renderer.contextLost){this.renderer.ready=true;document.getElementById('loading')?.remove();}}return okay;}
    restoreGraphics(){for(const model of this.loaded.values()){const gl=this.renderer.gl;for(const t of model.textures||[])if(gl?.isTexture?.(t.texture))gl.deleteTexture(t.texture);for(const groups of model.cache.values())for(const group of groups)if(gl?.isBuffer?.(group.buf))gl.deleteBuffer(group.buf);model.textures=(model.doc.textures||[]).map(tex=>this.renderer.upload(model.images[tex.source],false));model.cache.clear();}}
    records(scene=this.renderer.scene){if(!this.scenes.has(scene))this.scenes.set(scene,targets(scene,this.assets));return this.scenes.get(scene);}
    find(type,x,z){
      // IRBI 0218C484/0218C8C4: first compatible loaded model, inclusive rectangle.
      return this.records().find(t=>t.record.class===type&&Math.abs(t.x-x)<=2&&Math.abs(t.z-z)<=3)||null;
    }
    create(type,x,z){
      const target=this.find(type,x,z);if(!target)throw Error(`Original field model unavailable: class ${type} at ${x},${z}`);
      const id=this.nextHandle++;this.handles.set(id,target);return id;
    }
    async play(id,animation){
      await this.ready;if(this.error)await new Promise(resolve=>this.waiters.push(resolve));const target=this.handles.get(id);if(!target)throw Error('Unknown field model handle '+id);
      const spec=target.record.animations[animation];if(!spec)throw Error('Unknown original model animation '+animation);
      target.resolve?.();target.animation=animation;target.elapsed=0;target.frame=0;target.playing=true;
      target.promise=new Promise(resolve=>target.resolve=resolve);
      if(spec.sound)void this.audio(spec.sound);
    }
    wait(id){const target=this.handles.get(id);return target?.promise||Promise.resolve();}
    release(id){const target=this.handles.get(id);if(target){target.resolve?.();for(const key of ['animation','frame','elapsed','playing','promise','resolve'])delete target[key];}this.handles.delete(id);}
    clear(){for(const id of [...this.handles.keys()])this.release(id);}
    tick(dt){
      for(const target of this.records())if(target.playing){
        const spec=target.record.animations[target.animation];target.elapsed+=dt;
        target.frame=Math.min(spec.frames-1,Math.floor((target.elapsed+1e-9)*this.assets.tickRate));
        if(target.elapsed+1e-9>=spec.frames/this.assets.tickRate){target.playing=false;target.resolve?.();target.resolve=null;}
      }
      if(this.renderer.canvas)this.renderer.canvas.dataset.fieldModels=JSON.stringify(this.records().filter(t=>t.animation!==undefined).map(t=>({model:t.record.key,animation:t.animation,frame:t.frame,playing:t.playing})));
    }
    replaces(instance){return this.records().some(t=>t.instance===instance&&!t.child&&t.animation!==undefined);}
    draw(instance){
      const r=this.renderer,g=r.gl;
      for(const target of this.records().filter(t=>t.instance===instance)){
        // Bedroom smoke is event-controlled; its last BMA frame is transparent.
        if(!target.child&&target.animation===undefined)continue;
        const model=this.loaded.get(target.record.key);if(!model)continue;
        const animation=target.animation??0,frame=target.frame??0,key=animation+':'+frame;
        if(!model.cache.has(key))model.cache.set(key,geometry(model,target.record,animation,frame,this.assets.units).map(group=>{
          const buf=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,buf);g.bufferData(g.ARRAY_BUFFER,new Float32Array(group.verts),g.STATIC_DRAW);return {...group,buf,count:group.verts.length/11};
        }));
        g.uniform3f(r.loc.uOffset,target.x,target.y,target.z);g.uniform2f(r.loc.uRotation,Math.cos(target.rotation),Math.sin(target.rotation));g.uniform1f(r.loc.uSprite,0);g.uniform1f(r.loc.uShadow,0);
        for(const group of [...model.cache.get(key)].sort((a,b)=>(b.alpha===1)-(a.alpha===1))){
          if(group.alpha<=0)continue;if(group.doubleSided)g.disable(g.CULL_FACE);else g.enable(g.CULL_FACE);r.bind(group.buf);r.texture(model.textures[group.textureIndex]||r.white,group.repeatS,group.repeatT,group.mirrorS,group.mirrorT);g.uniform1f(r.loc.uAlpha,group.alpha);g.depthMask(group.alpha>=1);g.drawArrays(g.TRIANGLES,0,group.count);
        }g.depthMask(true);g.disable(g.CULL_FACE);
      }
    }
  }
  root.FieldModels={Controller,geometry,worldMatrices,targets};
  if(typeof module!=='undefined')module.exports=root.FieldModels;
})(typeof window!=='undefined'?window:globalThis);
