/* Original PSEL models, skinning, joint animation and recorded camera curves. */
(() => {
  const I=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
  const mul=(a,b)=>Array.from({length:16},(_,i)=>{const r=i%4,c=i>>2;return a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];});
  function trs(t=[0,0,0],q=[0,0,0,1],s=[1,1,1]){const [x,y,z,w]=q;return [(1-2*(y*y+z*z))*s[0],2*(x*y+z*w)*s[0],2*(x*z-y*w)*s[0],0,2*(x*y-z*w)*s[1],(1-2*(x*x+z*z))*s[1],2*(y*z+x*w)*s[1],0,2*(x*z+y*w)*s[2],2*(y*z-x*w)*s[2],(1-2*(x*x+y*y))*s[2],0,...t,1];}
  function interpolate(a,b,t,quaternion=false){
    let dot=a.reduce((n,v,i)=>n+v*b[i],0);if(quaternion&&dot<0){b=b.map(v=>-v);dot=-dot;}
    let result;if(quaternion&&dot<.9995){const angle=Math.acos(Math.min(1,dot)),s=Math.sin(angle);result=a.map((v,i)=>(v*Math.sin((1-t)*angle)+b[i]*Math.sin(t*angle))/s);}else result=a.map((v,i)=>v+(b[i]-v)*t);
    return quaternion?result.map(v=>v/Math.hypot(...result)):result;
  }
  function sample(channel,time){
    const {times,values}=channel;let i=0;while(i<times.length-1&&times[i+1]<=time)i++;
    if(i===times.length-1||channel.mode==='STEP')return values[i];
    return interpolate(values[i],values[i+1],Math.max(0,(time-times[i])/(times[i+1]-times[i])),channel.path==='rotation');
  }
  function camera(curve,frame,aspect=4/3,perspective=STARTER_ASSETS.perspective){
    const i=Math.max(0,Math.min(curve.length-1,Math.floor(frame))),j=Math.min(curve.length-1,i+1),v=interpolate(curve[i],curve[j],frame-i);
    const pitch=v[0]*Math.PI/180,yaw=v[1]*Math.PI/180,roll=v[2]*Math.PI/180;
    // Camera's local +Z points backwards. Nitro's curve stores XYZ Euler angles.
    const rx=trs(undefined,[Math.sin(pitch/2),0,0,Math.cos(pitch/2)]),ry=trs(undefined,[0,Math.sin(yaw/2),0,Math.cos(yaw/2)]),rz=trs(undefined,[0,0,Math.sin(roll/2),Math.cos(roll/2)]),rotation=mul(rz,mul(ry,rx));
    const view=[rotation[0],rotation[4],rotation[8],0,rotation[1],rotation[5],rotation[9],0,rotation[2],rotation[6],rotation[10],0,0,0,0,1];
    for(let r=0;r<3;r++)view[12+r]=-view[r]*v[3]-view[4+r]*v[4]-view[8+r]*v[5];
    const p=perspective,f=p.cos/p.sin,n=p.near,z=p.far;
    return mul([f/aspect,0,0,0,0,f,0,0,0,0,(z+n)/(n-z),-1,0,0,2*z*n/(n-z),0],view);
  }
  async function loadGLB(url){
    const raw=await RuntimeAssets.bytes(url),header=new DataView(raw);if(header.getUint32(0,true)!==0x46546c67)throw Error('Invalid GLB');
    const length=header.getUint32(12,true),doc=JSON.parse(new TextDecoder().decode(new Uint8Array(raw,20,length))),data=new DataView(raw,28+length);
    const cache=new Map();function accessor(index){if(cache.has(index))return cache.get(index);const a=doc.accessors[index],v=doc.bufferViews[a.bufferView],sizes={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},size=sizes[a.type],types={5126:['getFloat32',4,1],5125:['getUint32',4,4294967295],5123:['getUint16',2,65535],5121:['getUint8',1,255]},[getter,bytes,denom]=types[a.componentType],stride=v.byteStride||size*bytes,offset=(v.byteOffset||0)+(a.byteOffset||0);
      const values=Array.from({length:a.count},(_,i)=>Array.from({length:size},(_,j)=>data[getter](offset+i*stride+j*bytes,true)/(a.normalized?denom:1)));cache.set(index,values);return values;}
    const animationSets=(doc.animations||[]).map(animation=>[
      ...animation.channels.filter(c=>c.target.node!==undefined).map(c=>{const s=animation.samplers[c.sampler];return {node:c.target.node,path:c.target.path,times:accessor(s.input).flat(),values:accessor(s.output),mode:s.interpolation||'LINEAR'};}),
      ...(animation.extensions?.EXT_property_animation?.channels||[]).map(c=>{const s=animation.samplers[c.sampler];return {property:c.target,times:accessor(s.input).flat(),values:accessor(s.output),mode:s.interpolation||'LINEAR'};})
    ]);
    const images=await Promise.all(doc.images.map(record=>RuntimeAssets.image(new URL(record.uri,new URL(url,location.href)).href)));
    return {doc,accessor,animationSets,animations:animationSets.flat(),images};
  }
  class Scene {
    constructor(canvas,assets=STARTER_ASSETS){
      this.assets=assets;this.canvas=canvas;const gl=this.gl=canvas.getContext('webgl',{alpha:!!assets.transparent,antialias:true,preserveDrawingBuffer:!!assets.preserveDrawingBuffer});if(!gl)throw Error('WebGL non disponibile');
      const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
      this.program=gl.createProgram();gl.attachShader(this.program,compile(gl.VERTEX_SHADER,`attribute vec3 p;attribute vec2 uv;attribute vec4 color;attribute vec4 joint;attribute vec4 weight;uniform mat4 bones[24];uniform mat4 camera;uniform vec3 offset;uniform vec2 texOffset;varying vec2 tex;varying vec4 tint;void main(){mat4 skin=bones[int(joint.x)]*weight.x+bones[int(joint.y)]*weight.y+bones[int(joint.z)]*weight.z+bones[int(joint.w)]*weight.w;vec4 world=skin*vec4(p,1.);world.xyz+=offset;gl_Position=camera*world;tex=uv+texOffset;tint=color;}`));
      gl.attachShader(this.program,compile(gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D image;uniform float opacity;uniform vec3 materialTint;uniform float brightness;varying vec2 tex;varying vec4 tint;void main(){vec4 c=texture2D(image,tex)*tint;c.rgb*=materialTint;c.a*=opacity;if(c.a<.02)discard;c.rgb=mix(c.rgb,vec3(brightness>=0.?1.:0.),abs(brightness)/16.);gl_FragColor=c;}`));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
      this.locations=Object.fromEntries(['bones[0]','camera','offset','image','texOffset','opacity','materialTint','brightness'].map(n=>[n,gl.getUniformLocation(this.program,n)]));this.attributes=['p','uv','color','joint','weight'].map(n=>gl.getAttribLocation(this.program,n));this.models={};
      this.ready=Promise.allSettled(Object.entries(assets.models).map(async([name,url])=>{const model=await loadGLB(url),{doc,accessor,images}=model;if(this.destroyed)throw Error('Scena annullata');this.models[name]=model;model.textures=[];model.groups=[];
        model.textures=doc.textures.map(t=>{const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,images[t.source]);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);const sampler=doc.samplers?.[t.sampler]||{};gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,sampler.wrapS||gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,sampler.wrapT||gl.REPEAT);return texture;});
        model.groups=[];doc.nodes.forEach((node,ni)=>{if(node.mesh===undefined)return;for(const primitive of doc.meshes[node.mesh].primitives){const a=primitive.attributes,p=accessor(a.POSITION),uv=a.TEXCOORD_0===undefined?p.map(()=>[0,0]):accessor(a.TEXCOORD_0),colors=a.COLOR_0===undefined?p.map(()=>[1,1,1,1]):accessor(a.COLOR_0),joints=a.JOINTS_0===undefined?p.map(()=>[0,0,0,0]):accessor(a.JOINTS_0),weights=a.WEIGHTS_0===undefined?p.map(()=>[1,0,0,0]):accessor(a.WEIGHTS_0),mat=doc.materials[primitive.material],factor=mat.pbrMetallicRoughness?.baseColorFactor||[1,1,1,1],indices=primitive.indices===undefined?p.map((_,i)=>i):accessor(primitive.indices).flat();
          for(const batch of NitroSkinning.batches(indices,joints,weights)){const palette=new Map(batch.palette.map((joint,i)=>[joint,i])),packed=new Float32Array(batch.indices.flatMap(i=>[...p[i],...uv[i],...factor.map((f,j)=>(j===3||assets.materialColor?.[name]?.[mat.name]?1:f)*(colors[i][j]??1)),...joints[i].map((joint,k)=>weights[i][k]>0?palette.get(joint):0),...weights[i]]));const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,packed,gl.STATIC_DRAW);model.groups.push({node:ni,skin:node.skin,palette:batch.palette,material:primitive.material,texture:mat.pbrMetallicRoughness?.baseColorTexture?.index,alpha:factor[3],alphaTrack:assets.materialAlpha[name]?.[mat.name],colorTrack:assets.materialColor?.[name]?.[mat.name],textureTrack:assets.materialTextures?.[name]?.[mat.name],blend:mat.alphaMode==='BLEND'||!!assets.materialAlpha[name]?.[mat.name],doubleSided:!!mat.doubleSided,buffer,count:batch.indices.length});}}
        });model.patternTextures=new Map();for(const track of Object.values(assets.materialTextures?.[name]||{}))for(const key of track){if(model.patternTextures.has(key.url))continue;const image=await RuntimeAssets.image(key.url);if(this.destroyed)throw Error('Scena annullata');const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);model.patternTextures.set(key.url,texture);}
      })).then(results=>{const failed=results.find(result=>result.status==='rejected');if(failed){this.destroy();throw failed.reason;}});
    }
    drawModel(name,frame,offset=[0,0,0],blend=false){
      const m=this.models[name];if(!m)return;const gl=this.gl,{doc,accessor}=m,transforms=doc.nodes.map(n=>({translation:n.translation,rotation:n.rotation,scale:n.scale})),properties={};
      for(const a of m.animations){const v=sample(a,frame/60);if(a.node!==undefined)transforms[a.node][a.path]=v;else properties[a.property]=v;}
      const world=[];function visit(i,parent){const n=doc.nodes[i],t=transforms[i];world[i]=mul(parent,n.matrix||trs(t.translation,t.rotation,t.scale));for(const child of n.children||[])visit(child,world[i]);}for(const i of doc.scenes[doc.scene||0].nodes)visit(i,I());
      gl.uniform3fv(this.locations.offset,offset);
      for(const group of m.groups){if(group.blend!==blend)continue;if(group.doubleSided)gl.disable(gl.CULL_FACE);else gl.enable(gl.CULL_FACE);const skin=doc.skins?.[group.skin],allBones=skin?skin.joints.map((node,i)=>mul(world[node],accessor(skin.inverseBindMatrices)[i])):[world[group.node]],bones=group.palette.map(id=>allBones[id]);if(bones.length>24||bones.some(b=>!b))throw Error('Palette scheletrica incompleta');gl.uniformMatrix4fv(this.locations['bones[0]'],false,new Float32Array(bones.flat()));
        gl.uniform3fv(this.locations.materialTint,group.colorTrack?.[Math.max(0,Math.min(group.colorTrack.length-1,Math.floor(frame)))]||[1,1,1]);gl.uniform1f(this.locations.opacity,group.alphaTrack?group.alphaTrack[Math.max(0,Math.min(group.alphaTrack.length-1,Math.floor(frame)))]/31:group.alpha);gl.bindBuffer(gl.ARRAY_BUFFER,group.buffer);for(let i=0;i<5;i++){const attr=this.attributes[i];gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,[3,2,4,4,4][i],gl.FLOAT,false,68,[0,12,20,36,52][i]);}
        gl.uniform2fv(this.locations.texOffset,properties[`/materials/${group.material}/pbrMetallicRoughness/baseColorTexture/extensions/KHR_texture_transform/offset`]||[0,0]);let texture=m.textures[group.texture];if(group.textureTrack){let key=group.textureTrack[0];for(const next of group.textureTrack){if(next.frame>frame)break;key=next;}texture=m.patternTextures.get(key.url);}gl.bindTexture(gl.TEXTURE_2D,texture);gl.drawArrays(gl.TRIANGLES,0,group.count);
      }
    }
    draw(name,frame,{cameraFrame=frame,selected=-1,ballFrame=0,extra=[]}={}){
      const gl=this.gl,w=this.canvas.width,h=this.canvas.height;gl.viewport(0,0,w,h);const clear=this.assets.transparent?0:1;const brightness=this.assets.brightness?.[Math.max(0,Math.min(this.assets.brightness.length-1,Math.floor(frame)))]||0,base=this.assets.clearColor||[clear,clear,clear],shade=base.map(v=>brightness>=0?v+(1-v)*brightness/16:v*(1+brightness/16));gl.clearColor(...shade,clear);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(this.program);gl.uniform1i(this.locations.image,0);gl.uniform1f(this.locations.brightness,brightness);gl.uniformMatrix4fv(this.locations.camera,false,new Float32Array(camera(this.assets.curves[name],cameraFrame,w/h,this.assets.perspective)));for(const blend of [false,true]){gl.depthMask(!blend);this.drawModel(name,frame,[0,0,0],blend);for(const other of extra)this.drawModel(other,frame,[0,0,0],blend);if(name==='selection')for(let i=0;i<3;i++)this.drawModel('ball',i===selected?ballFrame:0,this.assets.ballPositions[i],blend);}gl.depthMask(true);
    }
    destroy(){if(this.destroyed)return;this.destroyed=true;const gl=this.gl;for(const m of Object.values(this.models)){for(const t of [...(m.textures||[]),...(m.patternTextures?.values()||[])])gl.deleteTexture(t);for(const g of m.groups||[])gl.deleteBuffer(g.buffer);}this.models={};gl.deleteProgram(this.program);}
  }
  window.StarterScene={Scene,interpolate,sample,camera,loadGLB,identity:I,mul,trs};
})();
