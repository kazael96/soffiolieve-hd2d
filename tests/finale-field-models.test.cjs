const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {create}=require('./helpers/native-field-model-host.cjs');
test('nine native finale animated props resolve under their own scope without aliasing older bundle IDs',()=>{
 const {c}=create(),data=c.FINALE_FIELD_MODELS;
 assert.equal(Object.keys(data.models).length,9);
 const scene={instances:Object.keys(data.models).map((key,i)=>({model:'fn-prop-'+key,x:i*10,y:0,z:0,rotation:0}))};
 const targets=c.FieldModels.targets(scene,c.FIELD_MODEL_ASSETS);assert.equal(targets.length,9);
 for(const t of targets){assert.match(t.record.key,/^fn-field-/);assert.equal(t.child,false);assert.equal(t.record.source.archive,t.instance.model.startsWith('fn-prop-True-')?'a/2/2/9':'a/2/3/0');}
 assert.equal(c.FieldModels.targets({instances:[{model:'lg-prop-False-51-103',x:0,y:0,z:0,rotation:0}]},c.FIELD_MODEL_ASSETS).length,0);
});
test('original BTP palette pairs bind the matching material and dimensions at every texture transition',async()=>{
 const {c}=create();let transitions=0,patterns=0;
 for(const record of Object.values(c.FINALE_FIELD_MODELS.models)){
  const model=await c.StarterScene.loadGLB(record.model);
  for(const [animation,materials]of Object.entries(record.materialTextures||{}))for(const [material,keys]of Object.entries(materials)){
   patterns++;assert.equal(keys[0].frame,0);
   for(const key of keys){const bytes=fs.readFileSync('src/'+key.url);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),key.imageSHA256);assert.equal(bytes.readUInt32BE(16),key.w);assert.equal(bytes.readUInt32BE(20),key.h);
    for(const frame of new Set([Math.max(0,key.frame-1),key.frame,Math.min(record.animations[animation].frames-1,key.frame+1)])){
     const expected=keys.filter(k=>k.frame<=frame).at(-1),groups=c.FieldModels.geometry(model,record,+animation,frame),selected=groups.filter(g=>g.material===material);
     assert.ok(selected.length,record.key+' '+material);for(const group of selected){assert.equal(group.patternURL,expected.url);assert.ok(group.verts.every(Number.isFinite));}transitions++;
    }
   }
  }
 }
 assert.ok(patterns>=4);assert.ok(transitions>=20);
});
test('failed native pattern downloads allocate no GPU textures; retry draw and context restoration preserve bindings',async()=>{
 const {c,reads}=create(),record=c.FINALE_FIELD_MODELS.models['False-51-103'],instance={model:'fn-prop-False-51-103',x:0,y:0,z:0,rotation:0},scene={instances:[instance]},uploads=[],bound=[],deleted=[];
 let next=0,fail=true;const image=c.RuntimeAssets.image;
 c.RuntimeAssets.image=async url=>{if(fail&&url.includes('--'))throw Error('native pattern offline');return image(url);};
 const gl={createBuffer:()=>++next,bindBuffer(){},bufferData(){},uniform3f(){},uniform2f(){},uniform1f(){},disable(){},enable(){},depthMask(){},drawArrays(){},isTexture:()=>true,isBuffer:()=>true,deleteTexture:id=>deleted.push(id),deleteBuffer(){}};
 const renderer={scene,gl,loc:{},upload:(image)=>{const texture={texture:++next,image};uploads.push(texture);return texture;},bind(){},texture:t=>bound.push(t)};
 const assets={...c.FIELD_MODEL_ASSETS,models:{native:record}},control=new c.FieldModels.Controller(renderer,assets);
 assert.equal(await control.ready,false);assert.match(control.error.message,/offline/);assert.equal(uploads.length,0);assert.equal(control.loaded.size,0);
 fail=false;assert.equal(await control.retry(),true);assert.ok(uploads.length>0);assert.equal(control.loaded.size,1);
 const handle=control.create(8,0,0);await control.play(handle,0);
 for(let frame=0;frame<record.animations[0].frames;frame++){control.draw(instance);control.tick(1/30);}
 await control.wait(handle);assert.ok(bound.some(t=>t.image.url.includes('--')),'draw must bind actual BTP textures');
 const before=uploads.length,model=control.loaded.get(record.key),patterns=model.patternTextures.size,base=model.textures.length,readCount=reads.length;
 control.restoreGraphics();assert.equal(uploads.length-before,patterns+base);assert.equal(deleted.length,patterns+base);assert.equal(reads.length,readCount,'context restore reuses decoded native images');
 bound.length=0;control.draw(instance);assert.ok(bound.some(t=>t.image.url.includes('--')));control.release(handle);
});
