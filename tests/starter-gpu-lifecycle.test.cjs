/* Exercise the real GLB loader and GPU command stream, independently of WebGL pixels. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=path.resolve(__dirname,'../src'),catalogText=fs.readFileSync(path.join(src,'opelucid-cinematics-data.js'),'utf8'),film=JSON.parse(catalogText.slice(catalogText.indexOf('=')+1).trim().replace(/;$/,'')).films[13];
function fixture({failDragon=false}={}){
 let serial=0,bound=null;const textures=new Set(),buffers=new Set(),deletedTextures=new Set(),deletedBuffers=new Set(),draws=[],uniforms=[];
 const gl={};for(const [i,key]of ['VERTEX_SHADER','FRAGMENT_SHADER','COMPILE_STATUS','LINK_STATUS','TEXTURE_2D','RGBA','UNSIGNED_BYTE','TEXTURE_MIN_FILTER','TEXTURE_MAG_FILTER','NEAREST','TEXTURE_WRAP_S','TEXTURE_WRAP_T','REPEAT','ARRAY_BUFFER','STATIC_DRAW','CULL_FACE','FLOAT','TRIANGLES','COLOR_BUFFER_BIT','DEPTH_BUFFER_BIT','DEPTH_TEST','BLEND','SRC_ALPHA','ONE_MINUS_SRC_ALPHA','ONE'].entries())gl[key]=1<<i;
 for(const key of ['shaderSource','compileShader','attachShader','linkProgram','texParameteri','bindBuffer','bufferData','enable','disable','enableVertexAttribArray','vertexAttribPointer','viewport','clearColor','clear','blendFuncSeparate','useProgram','uniform1i','depthMask'])gl[key]=()=>{};
 Object.assign(gl,{createShader:()=>({id:++serial}),createProgram:()=>({id:++serial}),getShaderParameter:()=>true,getProgramParameter:()=>true,getUniformLocation:(p,n)=>n,getAttribLocation:()=>0,
  createTexture(){const t={id:++serial};textures.add(t);return t;},bindTexture:(type,t)=>bound=t,texImage2D(...args){bound.url=args.at(-1).url;},deleteTexture:t=>deletedTextures.add(t),
  createBuffer(){const b={id:++serial};buffers.add(b);return b;},deleteBuffer:b=>deletedBuffers.add(b),deleteProgram(){},
  uniform3fv:(key,value)=>uniforms.push({key,value:[...value]}),uniform2fv(){},uniform1f:(key,value)=>uniforms.push({key,value}),uniformMatrix4fv:(key,transpose,value)=>{assert.ok(value.every(Number.isFinite));if(key==='bones[0]')assert.ok(value.length<=24*16);},drawArrays:()=>draws.push(bound?.url)});
 const c=vm.createContext({TextDecoder,TextEncoder,URL,console,location:{href:'https://demo.test/'},RuntimeAssets:{bytes:async url=>{if(failDragon&&url.includes('/dragon/')){await new Promise(resolve=>setTimeout(resolve,5));throw Error('dragon offline');}const b=fs.readFileSync(path.join(src,url));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);},image:async url=>({url})}});
 c.window=c;for(const file of ['nitro-skinning.js','starter-scene.js'])vm.runInContext(fs.readFileSync(path.join(src,file),'utf8'),c);
 const assets={clearColor:[0,0,0],brightness:film.brightness,models:Object.fromEntries(Object.entries(film.models).map(([key,m])=>[key,m.url])),materialAlpha:{dragon:{},...film.materialAlpha},materialColor:film.materialColor,materialTextures:film.materialTextures,curves:{stage:film.camera},perspective:film.perspective};
 return {scene:new c.StarterScene.Scene({width:960,height:720,getContext:()=>gl},assets),textures,buffers,deletedTextures,deletedBuffers,draws,uniforms};
}
test('real native models submit complete mobile palettes, animated sky tint and all three N textures',async()=>{
 const f=fixture();await f.scene.ready;for(const frame of [0,4,12,300,551])f.scene.draw('stage',frame,{extra:['dragon']});
 for(const name of ['n_b_1.png','n_b_2.png','n_b_3.png'])assert.ok(f.draws.some(url=>url?.endsWith(name)),name);
 assert.ok(f.uniforms.some(u=>u.key==='materialTint'&&u.value.some(v=>v!==1)),'animated sky diffuse reaches shader');
 assert.ok(f.uniforms.some(u=>u.key==='opacity'&&u.value<1),'native fog alpha reaches shader');
 assert.ok(f.uniforms.some(u=>u.key==='brightness'&&u.value===-16),'native ending fade reaches shader');
 f.scene.destroy();assert.equal(f.deletedTextures.size,f.textures.size);assert.equal(f.deletedBuffers.size,f.buffers.size);f.scene.destroy();assert.equal(f.deletedTextures.size,f.textures.size);
});
test('one failed model releases the other completed model before retrying the scene',async()=>{
 const f=fixture({failDragon:true});await assert.rejects(f.scene.ready,/dragon offline/);assert.ok(f.textures.size>0);assert.equal(f.deletedTextures.size,f.textures.size);assert.equal(f.deletedBuffers.size,f.buffers.size);assert.equal(Object.keys(f.scene.models).length,0);
});
test('destroying while resources are pending never installs GPU models afterwards',async()=>{
 const f=fixture();f.scene.destroy();await assert.rejects(f.scene.ready,/annullata/);assert.equal(f.textures.size,0);assert.equal(f.buffers.size,0);
});
