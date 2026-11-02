/* Original honey-gym placements and joint tracks; continuous walking is HD-2D. */
(()=>{
 const D=CASTELIA_GYM_DATA,loaded=new Map(),instances=[],motions=new Map();let task=null,prepared=false,lastWall=-1;
 function state(){return window.NativeStory?.state;}
 function switches(){return state()?.casteliaGymSwitches||[];}
 function poleOpen(id){return D.buttonPoles.some((p,i)=>p.includes(id)&&switches()[i]);}
 function prepare(){if(task)return task;task=Promise.all(Object.entries(D.models).map(async([key,r])=>{if(!loaded.has(key))loaded.set(key,await StarterScene.loadGLB(r.url));})).then(()=>{
  if(!prepared){
   const add=(kind,id,p,model,rotation=0)=>{const name='ca-gym-'+kind+'-'+id;OPENING_ASSETS.models[name]=OPENING_ASSETS.models[D.models[model].model];instances.push({model:name,gymModel:model,gymKind:kind,gymId:id,x:p[0]-16,y:p[1],z:p[2]-16,rotation});};
   D.walls.forEach((p,i)=>add('wall',i,p,'wall1'));D.poles.forEach((p,i)=>add('pole',i,p,i%2?'pole2':'pole1'));D.buttons.forEach((p,i)=>add('switch',i,p,'switch'));
   OPENING_ASSETS.scenes.zone29.instances.push(...instances);prepared=true;
  }return true;
 }).catch(e=>{task=null;throw e;});return task;}
 function activate(index){const n=state();n.casteliaGymSwitches??=Array(8).fill(0);if(index<0||index>=8)throw Error('Interruttore di Austropoli non valido');n.casteliaGymSwitches[index]=1;motions.set('switch:'+index,{frame:0});for(const p of D.buttonPoles[index])motions.set('pole:'+p,{frame:0});}
 function tick(dt,position,moved){const wall=position?contact(position.x,position.y):-1;if(moved&&wall>=0&&wall!==lastWall)motions.set('wall:'+wall,{frame:0,base:(position.y<D.walls[wall][2]-16-.45)?2:0});lastWall=wall;for(const m of motions.values())m.frame=Math.min(180,m.frame+dt*30);}
 function contact(x,z){return D.walls.findIndex(p=>Math.abs(x-(p[0]-16))<1.3&&Math.abs(z-(p[2]-16-.45))<1.15);}
 function blocked(x,z){
  const wall=contact(x,z);if(wall<0)return null;
  // The two metal halves occupy the full doorway until both switches are pressed.
  if(wall<6&&!D.wallPoles[wall].every(poleOpen))return true;
  return false;
 }
 function apply(renderer){if(!prepared||renderer.scene.zone!==29)return;
  for(const ins of instances){
   const model=loaded.get(ins.gymModel),key=ins.gymKind+':'+ins.gymId,motion=motions.get(key),open=ins.gymKind==='pole'&&poleOpen(ins.gymId)||ins.gymKind==='switch'&&switches()[ins.gymId];
   let frame=motion?motion.frame:open?180:0,animation=0;
   if(ins.gymKind==='wall'&&motion){const base=motion.base||0,end=i=>Math.max(1,...(model.animationSets[i]||[]).map(t=>(t.times.at(-1)||0)*60)),a=end(base),b=end(base+1);animation=base;if(frame>a){animation=base+1;frame-=a;}if(frame>=b&&animation===base+1){animation=0;frame=0;}}
   const signature=[renderer.resourceEpoch,animation,frame,open].join(':');
   renderer.casteliaGymFrames??=new Map();if(renderer.casteliaGymFrames.get(ins.model)===signature&&renderer.models[ins.model])continue;
   const groups=FieldModels.geometry(model,{},animation,frame,16);
   const gl=renderer.gl,old=renderer.models[ins.model]||[];
   renderer.models[ins.model]=groups.map((g,i)=>{const image=model.doc.images?.[model.doc.textures?.[g.textureIndex]?.source],stem=image?.uri?.split('/').pop().replace(/\.png$/,''),texture=D.models[ins.gymModel].model+'-'+stem,buf=old[i]?.buf||gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.verts),gl.DYNAMIC_DRAW);return {...g,buf,texture,count:g.verts.length/11};});
   for(const g of old.slice(groups.length))gl.deleteBuffer(g.buf);renderer.casteliaGymFrames.set(ins.model,signature);
  }
 }
 window.CasteliaGym={prepare,activate,tick,blocked,contact,apply,poleOpen};
})();
