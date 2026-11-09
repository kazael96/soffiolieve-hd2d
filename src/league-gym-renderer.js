/* Sixteen original IRBI46 instances; joints and BTP palette swaps share task time. */
(function(root){
 function create({data=root.LEAGUE_GYM_DATA,assets=root.OPENING_ASSETS,task,hero=()=>null,height=()=>0,
  loadGLB=url=>root.StarterScene.loadGLB(url),geometry=(...args)=>root.FieldModels.geometry(...args),resource=file=>root.NativeTextLayout.resource(file)}={}){
  if(data?.zone!==121||!task||!assets)throw Error('Visuale della palestra di Aristide non disponibile');
  let prepared=null,loading=null,epoch=0;const renderers=new Map();
  const instances=data.instances.map(record=>({model:'lg-gym-instance'+record.index,x:record.worldOrigin[0],y:record.worldOrigin[1],z:record.worldOrigin[2],rotation:record.rotationRaw*Math.PI*2/65536,drayden:record.index}));
  const keyOf=index=>'lg-gym-'+data.descriptors[index].model;
  function install(){
   const scene=assets.scenes.zone121;if(!scene)return false;
   for(const instance of instances){assets.models[instance.model]=data.geometry[keyOf(instance.drayden)];if(!scene.instances.includes(instance))scene.instances.push(instance);}
   return true;
  }
  function prepare(){
   if(prepared){install();return Promise.resolve(true);}if(loading)return loading;const token=epoch;
   loading=Promise.all(Object.entries(data.models).map(async([key,model])=>[key,await Promise.all(model.states.map(row=>loadGLB(resource(row.url))))]))
    .then(rows=>{if(token!==epoch)return false;prepared=Object.fromEntries(rows);install();return true;}).finally(()=>{if(token===epoch)loading=null;});return loading;
  }
  function release(){
   epoch++;prepared=null;loading=null;const scene=assets.scenes.zone121;if(scene)scene.instances=scene.instances.filter(i=>!instances.includes(i));
   for(const instance of instances)if(assets.models[instance.model]===data.geometry[keyOf(instance.drayden)])delete assets.models[instance.model];
   for(const [renderer,owned]of renderers)for(const [key,groups]of owned)if(renderer.models[key]===groups){for(const group of groups)renderer.gl.deleteBuffer(group.buf);delete renderer.models[key];renderer.draydenFrames?.delete(key);}renderers.clear();
  }
  function hidden(index){const p=hero();return !!p&&height()<=4&&p.x>=0&&p.y>=14&&(index>=10&&index<=15);}
  function apply(renderer){
   if(renderer.scene.zone!==121||!prepared)return;
   renderer.draydenFrames??=new Map();
   for(const instance of instances){
    const pose=task.visual(instance.drayden);if(!pose)continue;
    const key=keyOf(instance.drayden),definition=data.models[key],state=definition.states[pose.track],model=prepared[key][pose.track],hide=hidden(instance.drayden),joint=state.convertedAnimations>0;
    const frame=joint?Math.min(pose.frame,state.lastFrames60[0]):0,signature=[epoch,renderer.resourceEpoch,pose.track,joint?frame:pose.frame,hide].join(':');
    if(renderer.draydenFrames.get(instance.model)===signature&&renderer.models[instance.model])continue;
    const groups=hide?[]:geometry(model,{},0,frame,16),previous=renderer.models[instance.model]||[],gl=renderer.gl;
    const output=groups.map((group,index)=>{
     const image=model.doc.images?.[model.doc.textures?.[group.textureIndex]?.source],stem=image?.uri?.split('/').pop().replace(/\.png$/,''),patterns=state.materialTextures?.[group.material],pattern=patterns?.filter(p=>p.frame<=pose.frame).at(-1),texture=pattern?.textureKey||key+'-'+stem;
     if(group.textureIndex!==undefined&&!assets.textures[texture])throw Error('Texture originale del drago mancante: '+texture);
     const buf=previous[index]?.buf||gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(group.verts),gl.DYNAMIC_DRAW);
     return {...group,buf,texture:group.textureIndex===undefined?null:texture,count:group.verts.length/11};
    });
    for(const group of previous.slice(groups.length))gl.deleteBuffer(group.buf);renderer.models[instance.model]=output;renderer.draydenFrames.set(instance.model,signature);
    if(!renderers.has(renderer))renderers.set(renderer,new Map());renderers.get(renderer).set(instance.model,output);
   }
  }
  return {prepare,install,release,apply,get ready(){return !!prepared;},get instances(){return instances;}};
 }
 const api={create};root.LeagueGymRenderer=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
