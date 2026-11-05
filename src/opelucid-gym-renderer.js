/* Six native puzzle instances; animation timing is owned by OpelucidGymTask. */
(function(root){
 function create({data=root.OPELUCID_GYM_DATA,assets=root.OPENING_ASSETS,task,loadGLB=url=>root.StarterScene.loadGLB(url),geometry=(...args)=>root.FieldModels.geometry(...args),resource=file=>root.NativeTextLayout.resource(file)}={}){
  if(!data||!task||!assets)throw Error('Visuale della palestra di Silvestro non disponibile');
  let prepared=null,loading=null,epoch=0;const renderers=new Map(),instances=data.instances.map(record=>({model:data.models[record.kind].key+'-instance'+record.index,x:record.worldOrigin[0],y:record.worldOrigin[1],z:record.worldOrigin[2],rotation:0,brycen:record.index}));
  function install(){
   const scene=assets.scenes.zone114;if(!scene)return false;
   for(const record of data.instances){const kind=data.models[record.kind];assets.models[instances[record.index].model]=data.geometry[kind.key];}
   for(const instance of instances)if(!scene.instances.includes(instance))scene.instances.push(instance);
   return true;
  }
  function prepare(){
   if(prepared){install();return Promise.resolve(true);}if(loading)return loading;
   const token=epoch;
   const pending=Promise.all(Object.entries(data.models).map(async([kind,model])=>[kind,await Promise.all(model.states.map(state=>loadGLB(resource(state.url))))]));
   loading=pending.then(rows=>{if(token!==epoch)return false;prepared=Object.fromEntries(rows);install();return true;}).finally(()=>{if(token===epoch)loading=null;});return loading;
  }
  function release(){
   epoch++;prepared=null;loading=null;const scene=assets.scenes.zone114;if(scene)scene.instances=scene.instances.filter(instance=>!instances.includes(instance));
   for(const record of data.instances){const key=instances[record.index].model;if(assets.models[key]===data.geometry[data.models[record.kind].key])delete assets.models[key];}
   for(const [renderer,owned]of renderers)for(const [key,groups]of owned)if(renderer.models[key]===groups){for(const group of groups)renderer.gl.deleteBuffer(group.buf);delete renderer.models[key];renderer.brycenFrames?.delete(key);}renderers.clear();
  }
  function apply(renderer){
   if(renderer.scene.zone!==114||!prepared)return;
   renderer.brycenFrames??=new Map();
   for(const record of data.instances){
    const pose=task.visual(record.index);if(!pose)continue;
    const definition=data.models[record.kind],state=definition.states[pose.state],model=prepared[record.kind][pose.state],instance=instances[record.index],frame=state.animation===null?0:Math.min(pose.frame,state.gltfLastFrame),signature=[epoch,renderer.resourceEpoch,pose.state,frame].join(':');
    if(renderer.brycenFrames.get(instance.model)===signature&&renderer.models[instance.model])continue;
    const groups=geometry(model,{},state.animation??0,frame,16),gl=renderer.gl,previous=renderer.models[instance.model]||[];
    renderer.models[instance.model]=groups.map((group,index)=>{
     const image=model.doc.images?.[model.doc.textures?.[group.textureIndex]?.source],stem=image?.uri?.split('/').pop().replace(/\.png$/,''),texture=definition.key+'-'+stem;
     if(!assets.textures[texture])throw Error('Texture del meccanismo mancante: '+texture);
     const buf=previous[index]?.buf||gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(group.verts),gl.DYNAMIC_DRAW);return {...group,buf,texture,count:group.verts.length/11};
    });
    for(const group of previous.slice(groups.length))gl.deleteBuffer(group.buf);renderer.brycenFrames.set(instance.model,signature);if(!renderers.has(renderer))renderers.set(renderer,new Map());renderers.get(renderer).set(instance.model,renderer.models[instance.model]);
   }
  }
  return {prepare,install,release,apply,get ready(){return !!prepared;},get instances(){return instances;}};
 }
 const api={create};root.OpelucidGymRenderer=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
