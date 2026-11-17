/* Actual native Reshiram camera has a cut at681, with a roll wrap ±180. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
test('native movie rendering keeps one complete recorded frame across a camera cut, without interpolating through the room',()=>{
 const c={};c.window=c;vm.createContext(c);for(const file of ['starter-scene','finale-cinematics-data'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file+'.js'),'utf8'),c);
 const film=c.FINALE_CINEMATICS.films[9],matrices=[],poses=[],gl=new Proxy({uniformMatrix4fv:(location,transpose,value)=>matrices.push([...value])},{get:(target,key)=>key in target?target[key]:()=>{}});
 const scene={canvas:{width:960,height:720},assets:{frameSampling:'native',curves:{part0:film.camera},perspective:film.perspective,brightness:film.brightness},gl,locations:{},drawModel:(name,frame)=>poses.push(frame)};
 for(const time of [680.1,680.66,680.99,681.01]){
  poses.length=0;matrices.length=0;c.StarterScene.Scene.prototype.draw.call(scene,'part0',time,{extra:['part1','part2']});
  assert.ok(poses.every(frame=>frame===Math.floor(time)),'All three models and materials use the same native frame');
  const expected=Array.from(new Float32Array(c.StarterScene.camera(film.camera,Math.floor(time),4/3,film.perspective)));assert.deepEqual(matrices[0],expected,'Camera jumps at the original cut, without an invented intermediate viewpoint');
 }
});

// The mesh node, native node index, skin-joint index and uploaded palette slot
// deliberately differ. A node mask applied to any one of those numeric indices
// instead of the original joint name will hide the wrong rigid triangle.
function visibilityGLB({weighted=false,mixedTriangle=false}={}){
 const chunks=[],views=[],accessors=[];let offset=0;
 function add(values,Type,type,componentType){const bytes=Buffer.from(new Type(values).buffer),index=accessors.length;views.push({buffer:0,byteOffset:offset,byteLength:bytes.length});accessors.push({bufferView:views.length-1,componentType,count:values.length/({VEC3:3,VEC4:4,MAT4:16,SCALAR:1}[type]),type});chunks.push(bytes);offset+=bytes.length;if(offset%4){const padding=Buffer.alloc(4-offset%4);chunks.push(padding);offset+=padding.length;}return index;}
 const positions=Array.from({length:3},(_,triangle)=>[[triangle,0,0],[triangle+1,0,0],[triangle,1,0]]).flat(),owners=[2,2,2,0,0,0,1,1,1],joints=owners.map(id=>[id,0,0,0]),weights=owners.map(()=>[1,0,0,0]);
 if(weighted){joints[0]=[0,1,0,0];weights[0]=[.5,.5,0,0];}if(mixedTriangle)joints[2]=[1,0,0,0];
 const identity=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],position=add(positions.flat(),Float32Array,'VEC3',5126),joint=add(joints.flat(),Uint16Array,'VEC4',5123),weight=add(weights.flat(),Float32Array,'VEC4',5126),indices=add(owners.map((_,i)=>i),Uint16Array,'SCALAR',5123),inverse=add([...identity,...identity,...identity],Float32Array,'MAT4',5126);
 const doc={asset:{version:'2.0'},buffers:[{byteLength:offset}],bufferViews:views,accessors,scene:0,scenes:[{nodes:[0,1,2,3]}],nodes:[{name:'circle',translation:[1,0,0]},{name:'circle1',translation:[2,0,0]},{name:'line_circle',translation:[3,0,0]},{name:'native_mesh',mesh:0,skin:0}],skins:[{joints:[2,0,1],inverseBindMatrices:inverse}],meshes:[{primitives:[{attributes:{POSITION:position,JOINTS_0:joint,WEIGHTS_0:weight},indices,material:0}]}],materials:[{name:'badge_anime',pbrMetallicRoughness:{baseColorFactor:[1,1,1,1],baseColorTexture:{index:0}}}],textures:[{source:0}],images:[{uri:'base.png'}]};
 const json=Buffer.from(JSON.stringify(doc)),padded=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]),data=Buffer.concat(chunks),raw=Buffer.alloc(28+padded.length+data.length);raw.writeUInt32LE(0x46546c67,0);raw.writeUInt32LE(2,4);raw.writeUInt32LE(raw.length,8);raw.writeUInt32LE(padded.length,12);raw.writeUInt32LE(0x4e4f534a,16);padded.copy(raw,20);raw.writeUInt32LE(data.length,20+padded.length);raw.writeUInt32LE(0x004e4942,24+padded.length);data.copy(raw,28+padded.length);return raw;
}
function visibilityFixture({tracks={circle:Array.from({length:361},(_,frame)=>frame<160?1:0),circle1:Array.from({length:361},(_,frame)=>frame<160?0:1)},weighted=false,mixedTriangle=false}={}){
 const raw=visibilityGLB({weighted,mixedTriangle}),draws=[],shaderSources=[],vertexUniformVectors=[],uniforms=new Map(),gl={};let serial=0,texture;
 for(const [i,key]of ['VERTEX_SHADER','FRAGMENT_SHADER','COMPILE_STATUS','LINK_STATUS','TEXTURE_2D','RGBA','UNSIGNED_BYTE','TEXTURE_MIN_FILTER','TEXTURE_MAG_FILTER','NEAREST','TEXTURE_WRAP_S','TEXTURE_WRAP_T','REPEAT','ARRAY_BUFFER','STATIC_DRAW','CULL_FACE','FLOAT','TRIANGLES'].entries())gl[key]=i+1;
 for(const key of ['compileShader','attachShader','linkProgram','texParameteri','bindBuffer','bufferData','enable','disable','enableVertexAttribArray','vertexAttribPointer','deleteTexture','deleteBuffer','deleteProgram'])gl[key]=()=>{};
 Object.assign(gl,{createShader:type=>({id:++serial,type}),shaderSource:(shader,source)=>{shader.source=source;shaderSources.push(source);},createProgram:()=>({id:++serial}),getShaderParameter:shader=>{if(shader.type!==gl.VERTEX_SHADER)return true;const vectors=[...shader.source.matchAll(/uniform\s+(mat4|mat3|vec4|vec3|vec2|float)\s+\w+(?:\[(\d+)\])?\s*;/g)].reduce((sum,match)=>sum+(match[1]==='mat4'?4:match[1]==='mat3'?3:1)*Number(match[2]||1),0);vertexUniformVectors.push(vectors);return vectors<=128;},getShaderInfoLog:()=> 'Vertex shader exceeds the WebGL minimum128 uniform vectors',getProgramParameter:()=>true,getUniformLocation:(program,name)=>name,getAttribLocation:()=>0,createTexture:()=>({id:++serial}),createBuffer:()=>({id:++serial}),bindTexture:(target,value)=>texture=value,texImage2D:(...args)=>{texture.url=args.at(-1).url;},uniform1f:(name,value)=>uniforms.set(name,value),uniform4fv:(name,value)=>{assert.ok(value.every(Number.isFinite));assert.equal(value.length,24,'Six vec4 uniforms retain the full24-joint visibility palette');uniforms.set(name,Array.from(value));},uniform2fv:(name,value)=>uniforms.set(name,Array.from(value)),uniform3fv:(name,value)=>uniforms.set(name,Array.from(value)),uniformMatrix3fv:(name,transpose,value)=>{assert.equal(transpose,false);assert.ok(value.every(Number.isFinite));uniforms.set(name,Array.from(value));},uniformMatrix4fv:(name,transpose,value)=>{assert.equal(transpose,false);assert.ok(value.every(Number.isFinite));uniforms.set(name,Array.from(value));},drawArrays:(mode,first,count)=>draws.push({mode,first,count,texture:texture.url,useVisibility:uniforms.get('useVisibility'),visibility:uniforms.get('visibility[0]')?.slice(),bones:uniforms.get('bones[0]').slice(),opacity:uniforms.get('opacity')})});
 const c={TextDecoder,TextEncoder,URL,location:{href:'https://native.test/'},RuntimeAssets:{bytes:async()=>raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength),image:async url=>({url})}};c.window=c;vm.createContext(c);for(const name of ['nitro-skinning','starter-scene'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',name+'.js'),'utf8'),c,{filename:name+'.js'});
 const assets={models:{tracked:'assets/tracked.glb',legacy:'assets/legacy.glb'},materialAlpha:{tracked:{},legacy:{}},materialTextures:{tracked:{badge_anime:[{frame:0,url:'assets/pat-one.png'},{frame:272,url:'assets/pat-two.png'}]}}};if(tracks!==null)assets.nodeVisibility={tracked:tracks};
 const scene=new c.StarterScene.Scene({getContext:()=>gl},assets);return {scene,draws,shaderSources,vertexUniformVectors,draw(name,frame){const before=draws.length;scene.drawModel(name,frame);assert.equal(draws.length,before+1,'Real drawModel submits the complete rigid mesh');return draws.at(-1);}};
}

test('native visibility crosses frame160 through named skin joints in the actual reordered GPU palette, independently of PAT272',async()=>{
 const f=visibilityFixture();try{await f.scene.ready;assert.deepEqual(Array.from(f.scene.models.tracked.groups[0].palette),[2,0,1]);assert.ok(f.vertexUniformVectors.length>0&&f.vertexUniformVectors.every(count=>count<=128),'Native node masks fit minimum WebGL vertex-uniform capacity');
  for(const [frame,expected,pattern]of [[-1,[0,1,1],'one'],[159.99,[0,1,1],'one'],[160,[1,1,0],'one'],[160.99,[1,1,0],'one'],[271.99,[1,1,0],'one'],[272,[1,1,0],'two'],[10000,[1,1,0],'two']]){
   const draw=f.draw('tracked',frame);assert.equal(draw.useVisibility,1,'The actual shader enables native node masks');assert.equal(draw.visibility.length,24);assert.deepEqual(draw.visibility.slice(0,3),expected,'Palette slots follow original node names through skin.joints');assert.deepEqual([draw.bones[12],draw.bones[28],draw.bones[44]],[2,3,1],'Visibility must retain native skin transforms');assert.equal(draw.count,9);assert.equal(draw.texture,'assets/pat-'+pattern+'.png');assert.equal(draw.opacity,1);
  }
 }finally{f.scene.destroy();}
});
test('a model without native visibility tracks disables the previous mask and keeps its original skin and material',async()=>{
 const f=visibilityFixture();try{await f.scene.ready;f.draw('tracked',160);const draw=f.draw('legacy',160);assert.equal(draw.useVisibility,0,'A prior model mask must not leak into ordinary models');assert.deepEqual([draw.bones[12],draw.bones[28],draw.bones[44]],[2,3,1]);assert.ok(draw.texture.endsWith('/base.png'));assert.equal(draw.opacity,1);assert.equal(draw.count,9);}finally{f.scene.destroy();}
});
test('native visibility rejects unknown original names, non-binary tracks and triangles with multiple native owners',async()=>{
 for(const options of [{tracks:{not_a_native_node:[1]}},{tracks:{circle:[1,.5]}},{weighted:true},{mixedTriangle:true}]){const f=visibilityFixture(options);try{await assert.rejects(f.scene.ready,/Visibilita|BVA/);}finally{f.scene.destroy();}}
});
test('ordinary weighted models remain supported when native visibility is absent',async()=>{
 const f=visibilityFixture({tracks:null,weighted:true});try{await f.scene.ready;const draw=f.draw('tracked',160);assert.ok(draw.bones.every(Number.isFinite));assert.equal(draw.count,9);}finally{f.scene.destroy();}
});
