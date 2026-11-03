/* IRBI cart joints and rail geometry; boarding uses continuous HD-2D movement. */
(()=>{
 const D=DRIFTVEIL_GYM_DATA,loaded=new Map(),instances=[],origins=[[22.5,2,37.5],[41.5,2,38.5],[34.5,2,6.5],[5.5,2,37.5]],families=[1,2,3,0],stops=[40,65,0,124,0,126,0,138];
 let task=null,prepared=false,ride=null;
 const state=()=>window.NativeStory?.state,clamp=x=>Math.max(0,Math.min(1,x));
 function switches(){return state()?.rollerSwitches||[0,0,0,0];}
 function animation(cart){return families[cart]*2+(switches()[cart]?1:0);}
 function frame(cart){return ride?.cart===cart?ride.frame:state()?.rollerFrames?.[cart]??(cart===0?40:0);}
 function path(cart,f){const track=D.paths[animation(cart)],p=StarterScene.sample({...track,path:'translation'},f/60),o=origins[cart];return {x:o[0]-16+p[0]/16,y:o[2]-16+p[2]/16,height:o[1]+p[1]/16};}
 function links(cart){return cart===0?(switches()[0]?[1,2]:[1,0]):switches()[cart]?([null,[4,3],[6,5],[8,7]])[cart]:null;}
 function prepare(){if(task)return task;task=Promise.all(Object.entries(D.models).map(async([key,r])=>{if(!loaded.has(key))loaded.set(key,await StarterScene.loadGLB(r.url));})).then(()=>{
  if(!prepared){for(let cart=0;cart<4;cart++){const o=origins[cart],model='dv-cart-'+cart;OPENING_ASSETS.models[model]=OPENING_ASSETS.models['dv-gym-cart'];instances.push({model,x:o[0]-16,y:o[1],z:o[2]-16,rotation:0,cart});const rail='dv-gym-rail'+(families[cart]+1);instances.push({model:rail,x:o[0]-16,y:o[1],z:o[2]-16,rotation:0});}
   for(const [i,p]of [[29,33],[13,16],[46,41],[25,9]].entries())instances.push({model:'dv-gym-switch',x:p[0]-15.5,y:2,z:p[1]-15.5,rotation:0,switch:i});
   OPENING_ASSETS.scenes.zone63.instances.push(...instances);prepared=true;
  }return true;
 }).catch(e=>{task=null;throw e;});return task;}
 function activate(index){if(index<0||index>3)throw Error('Scambio non valido');const n=state();n.rollerSwitches??=[0,0,0,0];n.rollerSwitches[index]^=1;n.vars[16395+index]=1;n.rollerFrames??=[40,0,0,0];n.rollerFrames[index]=0;AudioEngine.playSound?.(1674);}
 function tick(dt){if(!ride)return;const r=ride;if(state()?.zone!==63){ride=null;r.resolve(false);return;}r.elapsed+=dt;const duration=r.boarding?.3:r.disembarking?.3:Math.abs(r.end-r.start)/30;
  if(r.approaching){const t=clamp(r.elapsed/Math.max(.01,Math.abs(r.start-r.approachFrom)/30));r.frame=r.approachFrom+(r.start-r.approachFrom)*t;if(t>=1){r.approaching=false;r.boarding=true;r.elapsed=0;}return;}
  const t=clamp(r.elapsed/Math.max(.01,duration));
  if(r.boarding||r.disembarking){const p=r.boarding?path(r.cart,r.start):r.landing;player.x=r.from.x+(p.x-r.from.x)*t;player.y=r.from.y+(p.y-r.from.y)*t;r.height=r.from.height+((p.height+.1)-r.from.height)*t;}
  else{r.frame=r.start+(r.end-r.start)*t;const p=path(r.cart,r.frame);player.x=p.x;player.y=p.y;r.height=p.height+.15;}
  if(t<1)return;
  if(r.boarding){r.boarding=false;r.elapsed=0;return;}
  if(!r.disembarking){r.disembarking=true;r.elapsed=0;r.from={x:player.x,y:player.y,height:r.height};return;}
  const n=state();n.rollerFrames??=[40,0,0,0];n.rollerFrames[r.cart]=r.end;ride=null;facing=3;Journey.save(true);r.resolve(true);
 }
 function interact(){if(state()?.zone!==63||ride)return false;let found;
  for(let cart=0;cart<4;cart++){const l=links(cart);if(!l)continue;for(let i=0;i<2;i++){const s=D.stations[l[i]],x=s[0]-15.5,y=s[1]-15.5;if(Math.hypot(player.x-x,player.y-y)<1.15){found={cart,index:i,link:l};break;}}if(found)break;}
  if(!found)return false;
  const {cart,index,link}=found;
  if(cart===1&&link[index]===3&&!state().flags.includes(116)||cart===2&&link[index]===5&&!state().flags.includes(117)){void NativeStory.run(7);return true;}
  const to=link[1-index],target=D.stations[to],end=index===0?stops[(cart*2)+(switches()[cart]?1:0)]:0,start=index===0?0:stops[cart*2+(switches()[cart]?1:0)];
  const current=frame(cart),approaching=Math.abs(current-start)>.01;
  Journey.save(true);resetInput();const promise=new Promise(resolve=>ride={cart,start,end,frame:current,approachFrom:current,approaching,boarding:!approaching,elapsed:0,from:{x:player.x,y:player.y,height:2},height:2,landing:{x:target[0]-15.5,y:target[1]-15.5,height:2},resolve});void promise;return true;
 }
 function apply(renderer){if(!prepared||renderer.scene.zone!==63)return;for(const ins of instances){if(ins.cart===undefined)continue;const cart=ins.cart,model=loaded.get('cart'),anim=animation(cart),f=frame(cart),sig=[renderer.resourceEpoch,anim,f].join(':');renderer.rollerFrames??=new Map();if(renderer.rollerFrames.get(cart)===sig&&renderer.models[ins.model])continue;const groups=FieldModels.geometry(model,{},anim,f,16),gl=renderer.gl,old=renderer.models[ins.model]||[];
  renderer.models[ins.model]=groups.map((g,i)=>{const im=model.doc.images?.[model.doc.textures?.[g.textureIndex]?.source],stem=im?.uri?.split('/').pop().replace(/\.png$/,''),buf=old[i]?.buf||gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.verts),gl.DYNAMIC_DRAW);return {...g,buf,texture:'dv-gym-cart-'+stem,count:g.verts.length/11};});for(const g of old.slice(groups.length))gl.deleteBuffer(g.buf);renderer.rollerFrames.set(cart,sig);
 }}
 window.DriftveilGym={prepare,activate,tick,interact,apply,path,links,get busy(){return !!ride;},heroHeight:base=>ride?ride.height:base};
})();
