const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src');
function environment(){const c={console,Math,Map,WeakMap,URL,TextDecoder,DataView,Uint8Array,Float32Array};c.window=c;vm.createContext(c);for(const file of ['starter-scene.js','particle-spl.js','field-effect-assets.js','field-effects.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});return c;}
test('receipt effects retain native descriptors, models, particles and blocking semantics',()=>{
 const c=environment(),assets=c.FIELD_EFFECT_ASSETS;assert.equal(assets.verification.blocking,true);assert.equal(assets.effects[50].descriptor[5],180);assert.equal(assets.effects[51].descriptor[5],181);
 for(const [id,e]of Object.entries(assets.effects).filter(([id])=>[50,51].includes(+id))){
  assert.equal(c.FieldEffects.duration(e,assets),71);assert.ok(fs.existsSync(path.join(root,assets.models[e.item].url)));
  const source=fs.readFileSync(path.join(root,assets.models[e.item].url));const doc=JSON.parse(source.subarray(20,20+source.readUInt32LE(12)));assert.ok(doc.animations.length);assert.equal(assets.materialAlpha[e.item].lambert3.at(-1),0);
  const all=[];for(let frame=0;frame<71;frame++)all.push(...c.FieldEffects.particles(e,assets,frame,768,576));assert.ok(all.length>100);for(const p of all)for(const k of ['x','y','size','alpha','angle'])assert.ok(Number.isFinite(p[k]),id+':'+k);
  assert.ok(c.FieldEffects.particles(e,assets,40,768,576).length===0);assert.equal(assets.particles.textures[0].name,'particle-8-0.png');
 }
});
test('zero-radius SPL emission retains a random radial velocity instead of collapsing into a vertical line',()=>{
 const c=environment(),emitter=c.FIELD_EFFECT_ASSETS.particles.emitters[0];const a=c.ParticleSPL.motion(emitter,0,50),b=c.ParticleSPL.motion(emitter,0,51);assert.equal(Math.hypot(...a.p),0);assert.ok(Math.abs(a.v[0])+Math.abs(a.v[2])>0.05);assert.notDeepEqual(Array.from(a.v),Array.from(b.v));
});

test('Tris badge receipt has original 361-frame model and native background alpha',()=>{const c=environment(),a=c.FIELD_EFFECT_ASSETS,e=a.effects[2];assert.equal(e.descriptor[5],17);assert.equal(c.FieldEffects.duration(e,a),361);assert.equal(a.materialAlpha.badgeBackground.alpha_sq.length,361);for(const name of [e.background,e.item])assert.ok(fs.existsSync(path.join(root,a.models[name].url)));assert.equal(c.FieldEffects.particles(e,a,50,768,576).length,0);});

test('female Tris receipt installs original model148 and preserves the existing male receipt',()=>{
 const c=environment(),a=c.FIELD_EFFECT_ASSETS,male=a.effects[2],background=a.models.badgeBackground,alpha=a.materialAlpha.badgeBackground;
 vm.runInContext(fs.readFileSync(path.join(root,'trio-badge-assets.js'),'utf8'),c);
 const e=a.effects[42],model=a.models[e.item];assert.equal(a.effects[2],male);assert.equal(a.models.badgeBackground,background);assert.equal(a.materialAlpha.badgeBackground,alpha);
 assert.equal(e.descriptor[5],148);assert.equal(e.descriptor[12],149);assert.equal(e.descriptor[13],150);assert.notEqual(e.descriptorSha256,male.descriptorSha256);assert.equal(c.FieldEffects.duration(e,a),361);
 assert.deepEqual(Array.from(model.sourceMembers),[148,149,150]);const file=path.join(root,model.url),raw=fs.readFileSync(file),doc=JSON.parse(raw.subarray(20,20+raw.readUInt32LE(12)));
 assert.ok(doc.meshes.length);assert.ok(doc.animations.length);for(const image of doc.images||[])if(image.uri)assert.ok(fs.existsSync(path.join(path.dirname(file),image.uri)),image.uri);
 const incompatible={models:{badgeBackground:{}},hashes:{16:'wrong'},effects:{},materialAlpha:{}};assert.throws(()=>c.TrioBadgeAssets.install(incompatible),/background mismatch/);assert.deepEqual(incompatible.effects,{});
});

test('all sixteen native badge receipts retain their exact visibility and texture-pattern phase changes',async()=>{
 const c=environment(),a=c.FIELD_EFFECT_ASSETS,dexM=a.effects[50],dexF=a.effects[51];
 // Install shared tracks before later receipt models, as the page does.
 for(const file of ['trio-badge-assets.js','mistralton-badge-assets.js','icirrus-badge-assets.js','opelucid-badge-assets.js','league-badge-assets.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
 const ids=[2,4,5,6,7,8,9,10,42,43,44,45,46,47,48,49],proof=c.TRIO_BADGE_ASSETS.nativeAnimationProof;
 assert.deepEqual(Array.from(proof.coverage,x=>x.effect),ids);assert.equal(a.effects[50],dexM);assert.equal(a.effects[51],dexF);assert.equal(a.nodeVisibility.dexM,undefined);assert.equal(a.nodeVisibility.dexF,undefined);
 assert.equal(Object.keys(a.materialTextures).length,16);
 for(const id of ids){
  const name=a.effects[id].item,tracks=a.nodeVisibility[name],skin=proof.rigidSkinning[name];assert.equal(skin.onePositiveWeightPerVertex,true);assert.equal(skin.oneNativeOwnerPerTriangle,true);assert.ok(skin.vertices>0&&skin.triangles>0);
  assert.equal(Object.keys(tracks).length,4);for(const values of Object.values(tracks)){assert.equal(values.length,361);assert.ok(Array.from(values).every(v=>v===0||v===1));}
  for(const name of ['world_root','LL','RR'])assert.ok(Array.from(tracks[name]).every(v=>v===1));
  const badge=Object.keys(tracks).find(n=>!['world_root','LL','RR'].includes(n));assert.equal(tracks[badge][159],1);for(const frame of [160,271,272,300,360])assert.equal(tracks[badge][frame],0);
  const pattern=a.materialTextures[name].badge_anime;assert.deepEqual(Array.from(pattern,x=>x.frame),[0,272,273,274,275,276]);assert.deepEqual(Array.from(pattern,x=>x.texture.split('.').at(-1)),['1','2','3','4','3','2']);
  for(const key of pattern)assert.ok(fs.existsSync(path.join(root,key.url)),key.url);assert.equal(Array.from(pattern).filter(x=>x.frame<=300).at(-1).texture.split('.').at(-1),'2');
 }
 const bg=a.nodeVisibility.badgeBackground;assert.equal(bg.circle[159],1);assert.equal(bg.circle[160],0);assert.equal(bg.circle1[339],0);assert.equal(bg.circle1[340],1);assert.equal(bg.line_circle[271],0);assert.equal(bg.line_circle[272],1);assert.equal(bg.line_circle[304],1);assert.equal(bg.line_circle[305],0);
 c.document={createElement:()=>({dataset:{},append(){},setAttribute(){},remove(){},getContext:()=>({clearRect(){}})}),body:{append(){}}};c.Image=class{set src(value){this.onload?.();}};
 c.StarterScene.Scene=class{constructor(canvas,assets){assert.equal(assets.nodeVisibility===a.nodeVisibility,true,'Native node tracks must reach the scene');assert.equal(assets.materialTextures===a.materialTextures,true,'Native texture steps must reach the scene');this.ready=Promise.resolve();}draw(){}destroy(){}};
 for(const id of ids){const player=new c.FieldEffects.Player(id);try{await player.ready;for(const frame of [0,159,160,271,272,273,274,275,276,300,340,360])player.draw(frame);}finally{player.destroy();}}
});

test('all three actual female first-leader victories finish the original receipt and retain its reward on save',async()=>{
 const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');
 const {environment:storyEnvironment,drain}=require('./check-story-runtime.cjs');process.argv[2]=old;
 for(const [i,starter]of ['Snivy','Tepig','Oshawott'].entries()){
  const c=storyEnvironment({sourceRoot:root}),n=c.NativeStory,j=c.Journey,receipts=[];
  j.state.playerGender='F';j.state.playerName='Anita';j.state.starter=starter;j.state.phase='striaton';j.state.party=[j.pack(c.newStoryMon(starter,15),c.OPENING_DATA[starter].growth[15])];
  Object.assign(n.state,{intro:true,initialized:true,striaton:true,route2:true,healZone:8});Object.assign(n.state.vars,{16432:i,16509:2,16507:3,16514:4});n.state.flags.push(511,518,520,521,528);c.testSpeed=[1,2,4][i];
  for(const file of ['field-effect-assets.js','trio-badge-assets.js','field-effects.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),c,{filename:file});
  // CPU boundary: the real receipt constructor resolves its native model and
  // textures; GPU drawing remains the separate browser qualification.
  const create=c.document.createElement;c.document.createElement=(...args)=>{const e=create(...args);e.getContext=()=>({clearRect(){}});return e;};
  c.StarterScene.Scene=class{constructor(canvas,options){this.ready=Promise.resolve();assert.ok(Object.values(options.models).every(url=>fs.existsSync(path.join(root,url))));}draw(){}destroy(){}};
  c.Image=class{set src(value){this.onload?.();}};const Receipt=c.FieldEffects.Player;
  c.FieldEffects.play=async id=>{const p=new Receipt(id);try{await p.ready;p.draw(0);p.draw(180);p.draw(360);receipts.push(id);}finally{p.destroy();}};
  await n.changeZone(7,12,43);await drain(c,n.run(19,14),i,'p1');for(const entry of [8,9,13])await drain(c,n.run(entry,14),i,'p1');await drain(c,n.run(5,14),i,'p1');
  await drain(c,n.run([2,3,4][i],14),i,'p1');
  assert.deepEqual(receipts,[42],starter);assert.equal(n.state.won,true);assert.ok(n.state.badges.includes(0));assert.equal(j.itemCount(410),1);assert.equal(n.locked,false);assert.equal(j.save(true),true);
  const saved=c.StoryState.read(c.localStorage);assert.equal(saved.playerGender,'F');assert.ok(saved.original.badges.includes(0));assert.equal(saved.original.extraItems['410'],1);
 }
});
