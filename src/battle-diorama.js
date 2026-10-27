/* Original IRBI meshes and UVs, reframed as low-camera HD-2D battle dioramas. */
(()=>{
 const records=new Map(),textures=new Map();let gpu;
 const supported=c=>c.id==='bedroomMess'||c.id==='route1';
 const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),unit=a=>a.map(v=>v/Math.hypot(...a)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 function setup(){
  if(gpu)return gpu;const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true});if(!gl)throw Error('WebGL necessario per i fondali originali');
  const shader=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;},program=gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec3 position;attribute vec2 uv;attribute vec3 color;attribute vec3 normal;uniform vec3 eye;uniform vec3 right;uniform vec3 up;uniform vec3 forward;uniform vec2 lens;uniform vec2 texSize;varying vec2 vUV;varying vec3 vColor;varying vec3 vNormal;varying float distance;void main(){vec3 p=position-eye;float z=dot(p,forward);gl_Position=vec4(dot(p,right)/lens.x,dot(p,up)/lens.y,1.001668*z-.200167,z);vUV=uv/texSize;vColor=color;vNormal=normal;distance=z;}`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D image;uniform float alpha;uniform float indoor;varying vec2 vUV;varying vec3 vColor;varying vec3 vNormal;varying float distance;void main(){vec4 t=texture2D(image,vUV);if(t.a<.08)discard;float light=.78+.25*max(dot(normalize(vNormal+vec3(.001)),normalize(vec3(-.35,.85,.4))),0.);vec3 c=t.rgb*vColor*light*vec3(1.035,1.015,.97);float haze=smoothstep(16.,52.,distance)*(1.-indoor)*.35;c=mix(c,vec3(.63,.75,.66),haze);gl_FragColor=vec4(c,t.a*alpha);}`));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));const uniforms={};for(const n of ['eye','right','up','forward','lens','texSize','image','alpha','indoor'])uniforms[n]=gl.getUniformLocation(program,n);const attrs=['position','uv','color','normal'].map(n=>gl.getAttribLocation(program,n));
  gpu={canvas,gl,program,uniforms,attrs};return gpu;
 }
 function loadTexture(name){if(textures.has(name))return textures.get(name);const {gl}=setup(),record=name.startsWith('ambient:')?{src:'assets/'+name.slice(8)+'-front.png'}:OPENING_ASSETS.textures[name]||ROM_SCENE.textures[name];const promise=new Promise((resolve,reject)=>{if(!record){reject(Error('Materiale originale mancante: '+name));return;}const image=new Image();image.onload=()=>{const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);resolve({texture,w:image.width,h:image.height,image});};image.onerror=()=>reject(Error('Materiale non caricato: '+record.src));image.src=window.NativeTextLayout?.resource(record.src)||record.src;});textures.set(name,promise);return promise;}
 function instances(c){if(c.id==='bedroomMess')return OPENING_ASSETS.scenes.bedroomMess.instances;
  // South Route 1: original tutorial area and its adjacent northern map, in local coordinates.
  return [...ROM_SCENE.instances.filter(i=>i.model==='map3'||i.model==='prop151'||i.model==='prop154'&&i.z< -16).map(i=>({...i,z:i.z+32})),...OPENING_ASSETS.scenes.north.instances.filter(i=>i.model==='map-4').map(i=>({...i,z:i.z+32}))];
 }
 function ground(name){return /(?:fhyuka|hh_shiki|hh_ashiato|grass|michi|kusa_ec|hana|gake|kaidan|sea_)/.test(name||'');}
 const ambientSpecs=Object.freeze([{species:'Patrat',id:504,x:1.15,z:-4.8,height:.9},{species:'Lillipup',id:506,x:7.4,z:-5,height:.8}].map(Object.freeze));
 function ambientQuad({x,z,height}){const verts=[];for(const i of [0,1,2,2,1,3]){const right=i%2,top=i>=2;verts.push(x+(right?32:-32)/52*height,.02+(top?68:-12)/52*height,z,right?64:0,top?0:80,1,1,1,0,.4,.9);}return verts;}
 function prepare(c){if(!supported(c))return Promise.resolve(false);const id=c.id;if(!records.has(id)){
  const record={ready:false,groups:[]};records.set(id,record);record.pending=(async()=>{const {gl}=setup();for(const ins of instances(c)){const model=OPENING_ASSETS.models[ins.model]||ROM_SCENE.models[ins.model];if(!model)throw Error('Modello originale mancante: '+ins.model);for(const group of model.groups){if(!group.texture)continue;const tex=await loadTexture(group.texture),verts=new Float32Array(group.verts),cos=Math.cos(ins.rotation),sin=Math.sin(ins.rotation);for(let i=0;i<verts.length;i+=11){const x=verts[i],z=verts[i+2],nx=verts[i+8],nz=verts[i+10];verts[i]=x*cos+z*sin+ins.x;verts[i+1]+=ins.y;verts[i+2]=-x*sin+z*cos+ins.z;verts[i+8]=nx*cos+nz*sin;verts[i+10]=-nx*sin+nz*cos;}const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,verts,gl.STATIC_DRAW);record.groups.push({...group,buffer,count:verts.length/11,tex,ground:ground(group.texture)});}}
   record.ambient=[];
   if(c.id==='route1')for(const {species,id,x,z,height}of ambientSpecs){
    const original=await loadTexture('ambient:'+species),animation=window.ROM_SPRITE_ANIM?.load(id+'-front');if(animation)await animation.promise;
    const source=document.createElement('canvas');source.width=64;source.height=80;const ctx=source.getContext('2d');ctx.imageSmoothingEnabled=false;const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    const verts=ambientQuad({x,z,height});const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);
    const shadow=document.createElement('canvas');shadow.width=shadow.height=64;const sh=shadow.getContext('2d'),gradient=sh.createRadialGradient(32,32,1,32,32,30);gradient.addColorStop(0,'#10251d88');gradient.addColorStop(.45,'#10251d50');gradient.addColorStop(1,'#10251d00');sh.fillStyle=gradient;sh.fillRect(0,0,64,64);const shadowTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,shadowTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,shadow);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);const shadowVerts=[];for(const i of [0,1,2,2,1,3])shadowVerts.push(x+(i%2?.38:-.38),.025,z+(i>=2?.19:-.19),i%2?64:0,i>=2?64:0,1,1,1,0,1,0);const shadowBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,shadowBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(shadowVerts),gl.STATIC_DRAW);
    record.ambient.push({species,id,x,z,height,source,ctx,original,buffer,count:6,tex:{texture,w:64,h:80},shadow:{buffer:shadowBuffer,count:6,tex:{texture:shadowTexture,w:64,h:64}},repeatS:false,repeatT:false});
   }
   record.ready=true;return true;})();
 }return records.get(id).pending;}
 function camera(c,aspect){const room=c.id==='bedroomMess',portrait=aspect<1.2;let eye,target,fov;
  if(room){eye=portrait?[-10,2.1,-6.3]:[-10,2.4,-3.7];target=[-10,portrait?.25:.05,-11.3];fov=portrait?55:28;}
  else{const grass=c.terrain==='grass';eye=grass?[4.5,2.2,3]:[4.5,2.7,13];target=grass?[4.5,portrait?-1.5:.15,-12]:[4.5,portrait?-2.5:.4,-7];fov=portrait?55:34;}
  const forward=unit(sub(target,eye)),right=unit(cross(forward,[0,1,0])),up=cross(right,forward),t=Math.tan(fov*Math.PI/360);return{eye,forward,right,up,lens:[t*aspect,t]};
 }
 function paint(c,layers,w,h){const record=records.get(c.id);if(!supported(c)||!record?.ready)return false;const {canvas,gl,program,uniforms:u,attrs}=setup();canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);gl.useProgram(program);const view=camera(c,w/h);for(const n of ['eye','forward','right','up'])gl.uniform3fv(u[n],view[n]);gl.uniform2fv(u.lens,view.lens);gl.uniform1f(u.indoor,c.id==='bedroomMess'?1:0);gl.uniform1i(u.image,0);gl.activeTexture(gl.TEXTURE0);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  const draw=g=>{gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);[3,2,3,3].forEach((n,i)=>{gl.enableVertexAttribArray(attrs[i]);gl.vertexAttribPointer(attrs[i],n,gl.FLOAT,false,44,[0,12,20,32][i]);});gl.bindTexture(gl.TEXTURE_2D,g.tex.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,g.repeatS?(g.mirrorS?gl.MIRRORED_REPEAT:gl.REPEAT):gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,g.repeatT?(g.mirrorT?gl.MIRRORED_REPEAT:gl.REPEAT):gl.CLAMP_TO_EDGE);gl.uniform2f(u.texSize,g.tex.w,g.tex.h);gl.uniform1f(u.alpha,g.alpha??1);gl.drawArrays(gl.TRIANGLES,0,g.count);};
  const skyContext=layers[0].getContext('2d'),sky=skyContext.createLinearGradient(0,0,0,h);sky.addColorStop(0,c.id==='bedroomMess'?'#d9d6ad':'#9dc6ca');sky.addColorStop(1,c.id==='bedroomMess'?'#baa577':'#dae3bc');skyContext.fillStyle=sky;skyContext.fillRect(0,0,w,h);
  // Ground remains complete when move scripts hide the wall/vegetation layer.
  for(const isGround of [true,false]){gl.colorMask(true,true,true,true);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);if(!isGround){gl.colorMask(false,false,false,false);record.groups.filter(g=>g.ground).forEach(draw);gl.colorMask(true,true,true,true);}record.groups.filter(g=>g.ground===isGround).forEach(draw);layers[isGround?1:2].getContext('2d').drawImage(canvas,0,0);}

  gpu.depthKey=[c.id,c.terrain,w,h].join(':');
  // Subtle warm grading and contact depth; leave combatant silhouettes unobstructed.
  const decor=layers[2].getContext('2d'),shade=decor.createRadialGradient(w*.51,h*.48,w*.13,w*.5,h*.5,w*.7);shade.addColorStop(0,'#192b2a00');shade.addColorStop(1,'#10242b30');decor.fillStyle=shade;decor.fillRect(0,0,w,h);return true;
 }

 const ambientFrames=new Map();
 function drawAmbient(target,c,w,h,visibility={}){
  const record=records.get(c.id);if(c.id!=='route1'||!record?.ready||visibility.hideSky)return;const species=c.terrain==='grass'?'Lillipup':'Patrat',actor=record.ambient.find(a=>a.species===species);if(!actor)return;
  const key=[c.id,c.terrain,w,h].join(':'),stamp=Math.floor(performance.now()/50);let cached=ambientFrames.get(key);
  if(!cached||cached.stamp!==stamp||cached.hideGround!==!!visibility.hideGround){
   const {canvas,gl,program,uniforms:u,attrs}=setup();if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gpu.depthKey=null;}gl.viewport(0,0,w,h);gl.useProgram(program);const view=camera(c,w/h);for(const n of ['eye','forward','right','up'])gl.uniform3fv(u[n],view[n]);gl.uniform2fv(u.lens,view.lens);gl.uniform1f(u.indoor,0);gl.uniform1i(u.image,0);gl.activeTexture(gl.TEXTURE0);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
   const draw=g=>{gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);[3,2,3,3].forEach((n,i)=>{gl.enableVertexAttribArray(attrs[i]);gl.vertexAttribPointer(attrs[i],n,gl.FLOAT,false,44,[0,12,20,32][i]);});gl.bindTexture(gl.TEXTURE_2D,g.tex.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,g.repeatS?(g.mirrorS?gl.MIRRORED_REPEAT:gl.REPEAT):gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,g.repeatT?(g.mirrorT?gl.MIRRORED_REPEAT:gl.REPEAT):gl.CLAMP_TO_EDGE);gl.uniform2f(u.texSize,g.tex.w,g.tex.h);gl.uniform1f(u.alpha,g.alpha??1);gl.drawArrays(gl.TRIANGLES,0,g.count);};
   // Reuse the static scene depth; rebuild only after a different view or resize.
   if(gpu.depthKey!==key){gl.depthMask(true);gl.colorMask(false,false,false,false);gl.clear(gl.DEPTH_BUFFER_BIT);record.groups.forEach(draw);gpu.depthKey=key;}
   gl.colorMask(true,true,true,true);gl.depthMask(false);gl.clear(gl.COLOR_BUFFER_BIT);
   actor.ctx.clearRect(0,0,64,80);if(!window.ROM_SPRITE_ANIM?.draw(actor.ctx,actor.id,false,32,68,52/80,stamp*3,true)){const im=actor.original.image,b=window.ROM_SPRITE_ANIM?.imageBounds(im)||[0,0,im.width,im.height],width=52*(b[2]-b[0])/(b[3]-b[1]);actor.ctx.drawImage(im,b[0],b[1],b[2]-b[0],b[3]-b[1],32-width/2,16,width,52);}gl.bindTexture(gl.TEXTURE_2D,actor.tex.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,actor.source);
   if(!visibility.hideGround)draw(actor.shadow);draw(actor);gl.depthMask(true);
   const image=cached?.image||document.createElement('canvas');if(image.width!==w||image.height!==h){image.width=w;image.height=h;}const ctx=image.getContext('2d');ctx.clearRect(0,0,w,h);ctx.drawImage(canvas,0,0);cached={image,stamp,hideGround:!!visibility.hideGround};ambientFrames.set(key,cached);if(ambientFrames.size>2)ambientFrames.delete(ambientFrames.keys().next().value);
  }target.drawImage(cached.image,0,0);target.canvas.dataset.ambient=JSON.stringify({species,frame:stamp*3,world:[actor.x,.02,actor.z],height:actor.height});
 }
 window.BattleDiorama={prepare,paint,supported,camera,drawAmbient,ambientSpecs,ambientQuad};
})();
