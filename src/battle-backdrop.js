/* Original battle geometry. The view is composed for the demo's HD-2D canvas. */
(() => {
  const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:false,antialias:true});
  if(!gl)throw Error('WebGL non disponibile per gli ambienti della lotta');
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  const program=gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec3 p;attribute vec2 uv;attribute vec3 color;uniform mat4 camera;uniform vec3 offset;uniform vec2 size;varying vec2 tex;varying vec3 tint;void main(){gl_Position=camera*vec4(p+offset,1.);tex=uv/size;tint=color;}`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D image;uniform float alpha;varying vec2 tex;varying vec3 tint;void main(){vec4 c=texture2D(image,tex);if(c.a<.02)discard;gl_FragColor=vec4(c.rgb*tint,c.a*alpha);}`));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  const loc=Object.fromEntries(['camera','offset','size','image','alpha'].map(n=>[n,gl.getUniformLocation(program,n)]));
  const attrs=['p','uv','color'].map(n=>gl.getAttribLocation(program,n)),images={},models={};
  for(const [name,m] of Object.entries(BATTLE_FIELDS.models))models[name]=m.groups.map(group=>{const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(group.verts),gl.STATIC_DRAW);return {...group,buffer,count:group.verts.length/11};});
  let ready=false;const errors=[];
  const pending=Promise.all(Object.entries(BATTLE_FIELDS.textures).map(([key,record])=>new Promise(resolve=>{
    const image=new Image();image.onload=()=>{const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);images[key]={texture,w:image.width,h:image.height};resolve();};image.onerror=()=>{errors.push(record.src);resolve();};image.src=record.src;
  }))).then(()=>ready=true);
  const sub=(a,b)=>a.map((n,i)=>n-b[i]),dot=(a,b)=>a.reduce((v,n,i)=>v+n*b[i],0),unit=a=>a.map(n=>n/Math.hypot(...a)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  function multiply(a,b){return Array.from({length:16},(_,i)=>{const row=i%4,col=Math.floor(i/4);return [0,1,2,3].reduce((s,k)=>s+a[k*4+row]*b[col*4+k],0);});}
  function projection(w,h){
    const eye=[12,8,22],target=[0,2,-4],z=unit(sub(eye,target)),x=unit(cross([0,1,0],z)),y=cross(z,x);
    const view=[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];
    const f=1/Math.tan(.48),near=.5,far=220;
    const camera=multiply([f*h/w,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0],view);
    const project=z=>{const q=[0,0,z,1].map((_,r)=>camera[r]*0+camera[4+r]*0+camera[8+r]*z+camera[12+r]);return [q[0]/q[3],q[1]/q[3]];};
    const a=project(0x572f/4096),b=project(-0xcb7d/4096),sx=.76/(b[0]-a[0]),sy=.46/(b[1]-a[1]),tx=-.38-sx*a[0],ty=-.32-sy*a[1];
    return multiply([sx,0,0,0,0,sy,0,0,0,0,1,0,tx,ty,0,1],camera);
  }
  function model(name,z){
    gl.uniform3f(loc.offset,0,0,z);
    for(const m of models[name]){const t=images[m.texture];if(!t)continue;gl.bindBuffer(gl.ARRAY_BUFFER,m.buffer);for(let i=0;i<3;i++){gl.enableVertexAttribArray(attrs[i]);gl.vertexAttribPointer(attrs[i],[3,2,3][i],gl.FLOAT,false,44,[0,12,20][i]);}
      gl.bindTexture(gl.TEXTURE_2D,t.texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,m.repeatS?(m.mirrorS?gl.MIRRORED_REPEAT:gl.REPEAT):gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,m.repeatT?(m.mirrorT?gl.MIRRORED_REPEAT:gl.REPEAT):gl.CLAMP_TO_EDGE);gl.uniform2f(loc.size,t.w,t.h);gl.uniform1f(loc.alpha,m.alpha);gl.drawArrays(gl.TRIANGLES,0,m.count);
    }
  }
  function draw(context,w,h,scene,visibility={}){
    const data=BATTLE_FIELDS.scenes[scene];if(!data)return false;
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    gl.viewport(0,0,w,h);gl.clearColor(.78,.76,.68,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(program);gl.uniformMatrix4fv(loc.camera,false,new Float32Array(projection(w,h)));gl.uniform1i(loc.image,0);
    if(ready){if(!visibility.hideSky)model(data.field,0);if(!visibility.hideGround){model(data.stage,0x572f/4096);model(data.stage,-0xcb7d/4096);}}
    context.drawImage(canvas,0,0,w,h);return true;
  }
  window.BattleBackdrop={draw,pending,errors,get ready(){return ready;}};
})();
