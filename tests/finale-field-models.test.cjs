const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {create}=require('./helpers/native-field-model-host.cjs');
test('22 native finale animated props resolve under their own scope without aliasing older bundle IDs',()=>{
 const {c}=create(),data=c.FINALE_FIELD_MODELS;
 assert.equal(Object.keys(data.models).length,22);
 for(const id of ['False-51-103','False-51-120','False-51-121','False-52-117','False-52-125','False-52-128','False-53-118','False-53-122','True-31-294'])assert.ok(data.models[id],'earlier native model lost '+id);
 const scene={instances:Object.keys(data.models).map((key,i)=>({model:'fn-prop-'+key,x:i*10,y:0,z:0,rotation:0}))};
 const targets=c.FieldModels.targets(scene,c.FIELD_MODEL_ASSETS);assert.equal(targets.length,22);
 for(const t of targets){assert.match(t.record.key,/^fn-field-/);assert.equal(t.child,false);assert.equal(t.record.source.archive,t.instance.model.startsWith('fn-prop-True-')?'a/2/2/9':'a/2/3/0');}
 assert.equal(c.FieldModels.targets({instances:[{model:'lg-prop-False-51-103',x:0,y:0,z:0,rotation:0}]},c.FIELD_MODEL_ASSETS).length,0);
});
test('native simultaneous joint and UV tracks with identical names both contribute to the actual field geometry',async()=>{
 const {c}=create(),record=c.FINALE_FIELD_MODELS.models['False-53-123'],model=await c.StarterScene.loadGLB(record.model);
 assert.equal(model.animationSets.length,2);assert.equal(record.animations[0].bindings.length,2);
 const combined={...model,animationSets:[[...model.animationSets[0],...model.animationSets[1]]]},reference=structuredClone(record);delete reference.animations[0].bindings;reference.mode=2;
 for(const frame of [0,37,120,240])assert.ok(JSON.stringify(c.FieldModels.geometry(model,record,0,frame))===JSON.stringify(c.FieldModels.geometry(combined,reference,0,frame)),'joint and material tracks diverge at'+frame);
});
test('native mode1 ambient effects begin automatically, loop their native frame periods and reset on a covered map clear',async()=>{
 const {c}=create(),record=c.FINALE_FIELD_MODELS.models['False-33-115'],instance={model:'fn-prop-False-33-115',x:0,y:0,z:0,rotation:0};
 const renderer={scene:{instances:[instance]},gl:{},upload:image=>({image})},control=new c.FieldModels.Controller(renderer,{...c.FIELD_MODEL_ASSETS,models:{native:record}});
 assert.equal(await control.ready,true);const target=control.records()[0];assert.equal(target.playing,true);assert.equal(target.automatic,true);assert.equal(target.frame,0);
 control.tick(306/30);assert.equal(target.playing,true);assert.equal(target.frame,306);
 const model=control.loaded.get(record.key);assert.ok(JSON.stringify(c.FieldModels.geometry(model,record,0,306))===JSON.stringify(c.FieldModels.geometry(model,record,0,5)),'ambient joint and pattern loops must share native301-frame period');
 control.records(renderer.scene,true);assert.equal(control.records()[0].frame,306,'resource refresh must not restart a visible ambient effect');
 control.clear();assert.equal(target.frame,0);assert.equal(target.playing,true);
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

test('continuous native UV effects keep at most64 meshes and release evicted GPU buffers without changing a revisited frame',async()=>{
 const {c}=create(),record=c.FINALE_FIELD_MODELS.models['False-1-23'],instance={model:'fn-prop-False-1-23',x:0,y:0,z:0,rotation:0};
 // Two simultaneous periods exercise a clock longer than the mesh budget.
 const spec=structuredClone(record);spec.materialUV={0:{[Object.keys(record.materialUV?.[0]||{})[0]||'unused']:{frames:Array.from({length:79},(_,i)=>[i/79,0])}}};
 let buffers=0;const deleted=[],uploads=[],gl={createBuffer:()=>++buffers,bindBuffer(){},bufferData:(target,data)=>uploads.push(Array.from(data)),deleteBuffer:b=>deleted.push(b),uniform3f(){},uniform2f(){},uniform1f(){},disable(){},enable(){},depthMask(){},drawArrays(){}};
 const renderer={scene:{instances:[instance]},gl,loc:{},upload:image=>({image}),bind(){},texture(){}},assets={...c.FIELD_MODEL_ASSETS,models:{native:spec},scopes:{...c.FIELD_MODEL_ASSETS.scopes,fn:{...c.FIELD_MODEL_ASSETS.scopes.fn,models:{'False-1-23':spec}}}},control=new c.FieldModels.Controller(renderer,assets);
 assert.equal(await control.ready,true);const target=control.records()[0];control.draw(instance);const first=uploads.slice();
 for(let i=1;i<100;i++){control.tick(1/30);control.draw(instance);}
 const model=control.loaded.get(spec.key);assert.equal(model.cache.size,64);assert.ok(deleted.length>0);assert.equal(buffers-deleted.length,[...model.cache.values()].reduce((n,groups)=>n+groups.length,0));
 target.frame=0;uploads.length=0;control.draw(instance);assert.deepEqual(uploads,first,'an evicted frame must reconstruct identical geometry');assert.equal(model.cache.size,64);
});

test('native property1 holds the final gate pose and property2 plays return pads instead of removing them',async()=>{
 const {c}=create(),gate=c.FINALE_FIELD_MODELS.models['True-31-294'],pad=c.FINALE_FIELD_MODELS.models['False-33-114'];
 const instances=[{model:'fn-prop-True-31-294',x:15.5,y:0,z:34.5,rotation:0},{model:'fn-prop-False-33-114',x:2.5,y:14,z:-7.5,rotation:0}];
 const control=new c.FieldModels.Controller({scene:{instances},gl:{},upload:image=>({image})},{...c.FIELD_MODEL_ASSETS,models:{gate,pad}});assert.equal(await control.ready,true);
 assert.equal(control.property(8,15,34,1),true);const target=control.records()[0];assert.equal(target.frame,12);assert.equal(target.playing,false);assert.equal(target.hidden,undefined);
 assert.equal(control.property(7,2,-8,2),true);const warp=control.records()[1];assert.equal(warp.frame,0);assert.equal(warp.playing,true);assert.equal(warp.hidden,undefined);
 control.tick(21/30);assert.equal(warp.frame,20);assert.equal(warp.playing,false);assert.equal(warp.hidden,undefined);
 assert.equal(control.property(7,2,-8,2),true);assert.equal(warp.frame,0);assert.equal(warp.playing,true);assert.equal(control.property(8,100,100,1),false);
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
test('Marshal original light21-frame SRT moves texture U while preserving geometry and ends at zero',async()=>{
 const {c}=create(),record=c.FINALE_FIELD_MODELS.models['False-52-125'],model=await c.StarterScene.loadGLB(record.model);
 assert.equal(model.animationSets.length,0,'the source conversion has no replacement UV animation');
 const first=c.FieldModels.geometry(model,record,0,0),hold=c.FieldModels.geometry(model,record,0,19),last=c.FieldModels.geometry(model,record,0,20);
 assert.deepEqual(first,hold);let affected=0;
 for(let i=0;i<first.length;i++){
  const group=first[i],end=last[i],native=record.materialUV[0][group.material];
  if(!native){assert.deepEqual(group,end);continue;}
  affected++;const width=model.images[model.doc.textures[group.textureIndex].source].width,expected=-native.frames[0][0]*width;
  assert.ok(expected>0);
  for(let at=0;at<group.verts.length;at+=11){assert.deepEqual(group.verts.slice(at,at+3),end.verts.slice(at,at+3));assert.ok(Math.abs(end.verts[at+3]-group.verts[at+3]-expected)<1e-8);assert.equal(group.verts[at+4],end.verts[at+4]);}
 }
 assert.ok(affected>=5);
});
test('a601-frame native texture-only effect reuses its two distinct meshes while retaining every texture change',async()=>{
 const {c}=create(),record=c.FINALE_FIELD_MODELS.models['False-51-120'],instance={model:'fn-prop-False-51-120',x:0,y:0,z:0,rotation:0},bound=new Set();
 let buffers=0;const gl={createBuffer:()=>++buffers,bindBuffer(){},bufferData(){},uniform3f(){},uniform2f(){},uniform1f(){},disable(){},enable(){},depthMask(){},drawArrays(){}};
 const renderer={scene:{instances:[instance]},gl,loc:{},upload:image=>({image}),bind(){},texture:texture=>bound.add(texture.image.url)};
 const control=new c.FieldModels.Controller(renderer,{...c.FIELD_MODEL_ASSETS,models:{native:record}});assert.equal(await control.ready,true);
 const handle=control.create(8,0,0);await control.play(handle,0);
 for(let frame=0;frame<601;frame++){control.draw(instance);control.tick(1/30);}
 await control.wait(handle);const model=control.loaded.get(record.key);assert.equal(model.cache.size,2,'cache must follow two visual states rather than601 frame numbers');
 for(const groups of model.cache.values())for(const group of groups)assert.equal(group.verts,undefined,'uploaded mesh cache must not retain a second CPU copy of its vertex array');
 assert.ok(bound.size>=2);assert.equal(buffers,[...model.cache.values()].reduce((n,groups)=>n+groups.length,0));
});
