/* Controller/ownership tests. These do not certify world-rendered pixels. */
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
/* CPU Canvas state observer: record actual drawImage matrices, not metadata. */
function matrixPoint064(m,x,y){return[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]];}
function matrixRecorder064(onImage){let mirrored=false,m=[1,0,0,1,0,0],stack=[];const multiply=b=>{const a=m;m=[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];},state=()=>({mirrored,matrix:m.slice()}),context=new Proxy({},{get:(_,key)=>key==='getImageData'?(()=>({data:new Uint8Array(4096)})):key==='drawImage'?((image,...args)=>onImage(image,args,state())):key==='save'?(()=>stack.push({mirrored,m:m.slice()})):key==='restore'?(()=>{const prior=stack.pop();mirrored=prior.mirrored;m=prior.m;}):key==='scale'?((x,y)=>{if(x<0)mirrored=!mirrored;multiply([x,0,0,y,0,0]);}):key==='translate'?((x,y)=>multiply([1,0,0,1,x,y])):key==='rotate'?(a=>multiply([Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0])):()=>{}});return{context,state};}

// Controller-only renderer inputs, with the actual native Dreamyard descriptor.
// Test targets keep their declared translated coordinates; this is not Game QA.
let controllerDreamyard064;
function controllerFieldInputs064(){
 if(!controllerDreamyard064){const read=name=>{const text=fs.readFileSync(path.join(__dirname,'../src',name),'utf8');return JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));},assets=read('striaton-assets.js'),events=read('striaton-events.js'),tree=events.zones[152].actors.find(a=>a.id===8&&a.model===108&&a.script===10004);assert(tree&&assets.sprites[108]?.[0]&&assets.scenes[152]);controllerDreamyard064={scene:{...assets.scenes[152],chapter040:true,outdoor:true},tree,treeSprite:assets.sprites[108][0],floor:tree.y/65536};}
 return controllerDreamyard064;
}
function fieldRenderer064(c,renderer){
 const input=c.controllerFieldInputs064;renderer.scene??=c.NativeStory.state.zone===152?input.scene:{zone:c.NativeStory.state.zone};renderer.images??={};renderer.images['Original108-0']??={texture:{},w:32,h:32,src:input.treeSprite};renderer.spriteName??=name=>name;renderer.center??=[1,3.5];renderer.zoom??=1.4;renderer.viewSize??=[390,844];renderer.groundHeight??=()=>input.floor;return renderer;
}
function fieldActors064(world,c,hero={name:'Alcide',hero:true,x:1,z:2,height:.04,frame:3}){
 const action=world.active;if(!action||action.move!==15||!action.target||c.NativeStory.state.zone!==152)return [hero];
 let source=c.controllerCutSources064.get(action);if(!source){const native=c.controllerFieldInputs064.tree;source={model:native.model,uid:native.id,script:native.script,x:action.target.x,y:action.target.y,height:action.height,native};c.controllerCutSources064.set(action,source);}
 return [{name:'Original108',x:source.x,z:source.y,height:source.height,frame:0,source},hero];
}
function setup(){
 const calls={pins:0,releases:0},n={zone:152},party=[{id:501,name:'Oshawott',pp:[{id:57}]}];
 const nativeSnapshots=new Proxy({},{get(cache,key){if(typeof key!=='string')return cache[key];if(cache[key])return cache[key];const data=JSON.parse(fs.readFileSync(path.join(process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site'),'assets/animated/'+key+'.json'),'utf8'));return cache[key]={data,groundBounds:[-128,-128,128,0]};}}); // Controller fixture only: native tracks, conservative geometry; no pixel acceptance.
 const image={width:32,height:32},context=new Proxy({drawImage(){},getImageData(){return {data:new Uint8Array(4096)};}},{get:(target,key)=>key in target?target[key]:()=>{}});
 const c={console,Promise,Map,WeakMap,setTimeout,clearTimeout,Image:class{set src(value){const png=Buffer.from(value.split(',')[1],'base64');this.naturalWidth=png.readUInt32BE(16);this.naturalHeight=png.readUInt32BE(20);queueMicrotask(()=>this.onload?.());}},document:{hidden:false,createElement:()=>({getContext:()=>context})},NativeStory:{state:n},Journey:{state:{party,original:n}},OPENING_SPRITES:{Alcide:Array(12).fill('hero')},SURF_FIELD_ASSETS:{sprites:{AlcideSurf:Array(12).fill('surf')}},RuntimeAssets:{image:async()=>image},ROM_SPRITE_ANIM:{cache:nativeSnapshots,frame:a=>a.frames[0],pin(){calls.pins++;return ()=>calls.releases++;},prepare:async()=>{},draw:()=>true,alphaBounds:()=>[0,0,32,32]}};
  c.controllerFieldInputs064=controllerFieldInputs064();c.controllerCutSources064=new WeakMap();c.NativeStory.occupied=()=>false;c.blocked=()=>false;
  c.window=c;vm.createContext(c);for(const f of ['pokemon-visuals.js','field-hm-cut-choreographies.js','field-hm-fly-choreographies.js','field-hm-surf-choreographies.js','field-hm-cut-anatomy.js','field-hm-fly-anatomy.js','field-hm-surf-anatomy.js','field-hm-choreography.js','field-hm-profiles.js','field-hm-oshawott-cut.js','field-hm-evolved-cut.js','field-hm-world.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',f),'utf8'),c,{filename:f});return {c,n,party,calls,world:c.FieldHMWorld};
}
test('changing player sex rebuilds the native rider bank for the same Pokemon without leaking pins',async()=>{
 const {c,world,calls}=setup(),loaded=[];c.PLAYER_ASSETS={sprites:{Anita:Array(12).fill('female-standing'),AnitaSurf:Array(12).fill('female-sitting')}};
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/player-identity.js'),'utf8'),c);
 c.RuntimeAssets.image=async src=>{loaded.push(src);return {width:32,height:32};};
 await world.prepare({id:501},57);assert.ok(loaded.includes('hero'));assert.ok(loaded.includes('surf'));
 c.Journey.state.playerGender='F';loaded.length=0;await world.prepare({id:501},57);
 assert.deepEqual([...new Set(loaded)].sort(),['female-sitting','female-standing']);assert.equal(calls.pins,2);assert.equal(calls.releases,1);
 world.clear();assert.equal(calls.releases,2);
});
test('an unavailable female rider is a recoverable error and never loads male art',async()=>{
 const {c,world,calls}=setup(),loaded=[];c.Journey.state.playerGender='F';c.PLAYER_ASSETS={sprites:{Anita:Array(12).fill('female-standing')}};
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/player-identity.js'),'utf8'),c);
 c.RuntimeAssets.image=async src=>{loaded.push(src);return {width:32,height:32};};
 await assert.rejects(world.prepare({id:501},57),/protagonista MN/);assert.deepEqual(loaded,[]);assert.equal(calls.pins,calls.releases);
 c.PLAYER_ASSETS.sprites.AnitaSurf=Array(12).fill('female-sitting');await world.prepare({id:501},57);assert.ok(loaded.includes('female-sitting'));world.clear();assert.equal(calls.pins,calls.releases);
});
/* CPU contract only: compose the real card, then acknowledge a completed draw.
 * A present() call or a skipped/failed draw is deliberately not an acknowledgement. */
function fieldPresenter(world,c,renderer={},actors=()=>fieldActors064(world,c)){
 renderer.gl??={};for(const [key,value]of Object.entries({isContextLost:()=>false,isTexture:()=>true,bindTexture(){},texSubImage2D(){},deleteTexture(){}}))renderer.gl[key]??=value;
 fieldRenderer064(c,renderer);renderer.cameraPitch??=[.423,.906];renderer.yaw??=0;renderer.groundHeight??=()=>0;renderer.upload??=()=>({texture:{}});c.renderer=renderer;
 let time=0;const frames=[];
 return {renderer,frames,tick(dt){time+=dt;world.tick(dt);},draw({ack=true}={}){
  if(c.document.hidden||renderer.contextLost||renderer.gl.isContextLost())return actors();
  const action=world.active,presented=world.present(renderer,time,actors());
  if(action&&presented.some(actor=>actor.fieldHM))frames.push({action,progress:action.elapsed/action.duration,phase:action.phase,committed:!!action.committed});
  // Optional only to replay the old source as a failing baseline. Assertions
  // still require every actual pose and reject progress without acknowledgements.
  if(ack)world.rendered?.(renderer);return presented;
 }};
}
function finishField(world,c,renderer){const f=fieldPresenter(world,c,renderer);let frames=0;while(world.active&&!world.active.done&&frames++<1000){f.tick(.04);f.draw();}assert.ok(!world.active||world.active.done,'A drawable field action did not complete within 1000 acknowledged frames');return f.frames;}
async function flyFrame({height=7,yaw=0,direction=1,elapsed=1.94,graphic=519,pitch=[0,1],phase=elapsed>1.5?'arrive':'depart'}={}){
 const a=setup(),{c,n,world}=a,draws=[],images=[];n.zone=28;n.fieldHeight=height;
 c.OPENING_SPRITES.Alcide=Array.from({length:12},(_,i)=>'hero-'+i);c.SURF_FIELD_ASSETS.sprites.AlcideSurf=Array.from({length:12},(_,i)=>'surf-'+i);c.RuntimeAssets.image=async src=>({width:32,height:32,src});
 const recorder=matrixRecorder064((image,drawArgs,state)=>images.push({...image,...state,drawArgs})),context=recorder.context;c.document.createElement=()=>({width:512,height:512,getContext:()=>context});c.ROM_SPRITE_ANIM.draw=(...args)=>{draws.push(Object.assign(args,recorder.state()));return true;};c.SpeciesMoves={select:()=>({frames:10}),sample:()=>({})};
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/native-rails.js'),'utf8'),c);
 const renderer={scene:{zone:28},cameraPitch:pitch,yaw,groundHeight:()=>7,upload:()=>({texture:{},w:512,h:512}),gl:{isTexture:()=>true,bindTexture(){},texSubImage2D(){}}};
 const task=await world.start({id:graphic},19,{phase,duration:2,direction,height:7});world.active.elapsed=elapsed;
 const actors=world.present(renderer,.5,[{name:'Alcide',hero:true,x:1,z:2,height:7.04,frame:3}]);world.clear();await assert.rejects(task.finished,/annullata/);return {actors,draws,images};
}
test('the standing rider reaches the exact composite seat before Fly attaches it, including lean, squash and camera pitch',async()=>{
 const pitch=[Math.sin(.44),Math.cos(.44)],yaw=.6,epsilon=1e-8;
 for(const graphic of [519,567,580,581,623,635])for(const direction of [0,1,2,3]){
  const before=await flyFrame({graphic,direction,pitch,yaw,elapsed:2*(.35-epsilon)}),after=await flyFrame({graphic,direction,pitch,yaw,elapsed:2*(.35+epsilon)}),hero=before.actors.find(a=>!a.fieldHM&&a.hero),card=after.actors.find(a=>a.fieldHM),image=after.images.filter(i=>i.drawArgs.length===8).at(-1);assert.ok(hero&&card&&image);
  const d=image.drawArgs,feet=matrixPoint064(image.matrix,d[4]+d[6]/2,d[5]+d[7]),sx=(feet[0]-256)/64,sy=(384-feet[1])/64,base={x:card.x-2*pitch[0]*Math.sin(yaw),z:card.z-2*pitch[0]*Math.cos(yaw),height:card.height+2*pitch[1]},seat={x:base.x+sx*Math.cos(yaw)-sy*pitch[0]*Math.sin(yaw),z:base.z-sx*Math.sin(yaw)-sy*pitch[0]*Math.cos(yaw),height:base.height+sy*pitch[1]};
  assert.ok(Math.hypot(hero.x-seat.x,hero.z-seat.z,hero.height-seat.height)<1e-5,`Fly attachment jumps at ${graphic}/${direction}: hero=${JSON.stringify(hero)} seat=${JSON.stringify(seat)}`);
 }
});
test('Fly landing releases the rider at the exact composite seat with the raised view, yaw, lean and squash',async()=>{
 const pitch=[Math.sin(62*Math.PI/180),Math.cos(62*Math.PI/180)],yaw=-.6,epsilon=1e-8;
 for(const graphic of [519,567,580,581,623,635])for(const direction of [0,1,2,3]){
  const before=await flyFrame({graphic,direction,pitch,yaw,phase:'arrive',elapsed:2*(.65-epsilon)}),after=await flyFrame({graphic,direction,pitch,yaw,phase:'arrive',elapsed:2*(.65+epsilon)}),hero=after.actors.find(a=>!a.fieldHM&&a.hero),card=before.actors.find(a=>a.fieldHM),image=before.images.filter(i=>i.drawArgs.length===8).at(-1);assert.ok(hero&&card&&image);
  const d=image.drawArgs,feet=matrixPoint064(image.matrix,d[4]+d[6]/2,d[5]+d[7]),sx=(feet[0]-256)/64,sy=(384-feet[1])/64,base={x:card.x-2*pitch[0]*Math.sin(yaw),z:card.z-2*pitch[0]*Math.cos(yaw),height:card.height+2*pitch[1]},seat={x:base.x+sx*Math.cos(yaw)-sy*pitch[0]*Math.sin(yaw),z:base.z-sx*Math.sin(yaw)-sy*pitch[0]*Math.cos(yaw),height:base.height+sy*pitch[1]};
  assert.ok(Math.hypot(hero.x-seat.x,hero.z-seat.z,hero.height-seat.height)<1e-5,`Fly landing detached discontinuously at ${graphic}/${direction}`);
 }
});
test('rider visibility diagnostics preserve the live backend and allocate no mask during ordinary frames',async()=>{
 const {c,world}=setup(),contexts=[];let reads=0,uploads=0;
 c.document.createElement=()=>{const canvas={width:0,height:0};const context=new Proxy({},{get:(_,key)=>key==='getImageData'?(()=>{reads++;return {data:new Uint8Array(canvas.width*canvas.height*4)};}):()=>{}});canvas.getContext=(kind,options)=>{contexts.push({canvas,kind,options});return context;};return canvas;};
 c.ROM_SPRITE_ANIM.draw=()=>true;const renderer={cameraPitch:[.423,.906],gl:{isTexture:()=>true,bindTexture(){},texSubImage2D(){}},upload:()=>{uploads++;return {texture:{}};}},task=await world.start({id:519},19,{duration:2});world.active.elapsed=.8;
 const actors=()=>[{name:'Alcide',hero:true,x:0,z:0,height:.04,frame:3}],before=reads;world.present(renderer,0,actors());assert.equal(reads,before,'Ordinary paint read pixels');
 const first=contexts.filter(r=>r.canvas.width===512&&r.canvas.height===512);assert.equal(first.length,1,'Ordinary paint allocated a rider mask');assert.equal(first[0].options,undefined,'QA must not move ordinary card rendering onto a different backend');world.inspectCard(renderer);
 const inspected=contexts.filter(r=>r.canvas.width===512&&r.canvas.height===512);assert.equal(inspected.length,2);assert.equal(inspected[1].options.willReadFrequently,true,'Only the diagnostic mask requests readback-oriented rasterization');
 world.inspectCard(renderer);assert.equal(contexts.filter(r=>r.canvas.width===512&&r.canvas.height===512).length,2,'Rider mask was not reused');const afterInspect=reads;world.present(renderer,0,actors());assert.equal(reads,afterInspect,'Ordinary paint read the retained QA mask');assert.equal(uploads,1);world.clear();await assert.rejects(task.finished,/annullata/);
});
test('rider RGB diagnostics tolerate one raster pixel while retaining exact counts and detecting a concealed upper body',async()=>{
 for(const concealed of [false,true]){
  const {c,world}=setup(),expected=new Uint8Array(512*512*4),actual=new Uint8Array(512*512*4);let cardContexts=0;
  for(let x=250;x<254;x++){const rgba=[40+(x-250)*10,80+(x-250)*15,120+(x-250)*20,255];expected.set(rgba,(250*512+x)*4);if(!concealed)actual.set(rgba,(250*512+x+1)*4);}expected.set([255,255,255,249],(250*512+270)*4);
  c.document.createElement=()=>{const canvas={width:0,height:0};let mask=false;const context=new Proxy({},{get:(_,key)=>key==='getImageData'?(()=>({data:canvas.width===512?(mask?expected:actual):new Uint8Array(4096)})):()=>{}});canvas.getContext=()=>{if(canvas.width===512)mask=++cardContexts>1;return context;};return canvas;};c.ROM_SPRITE_ANIM.draw=()=>true;
  const renderer={cameraPitch:[.423,.906],gl:{isTexture:()=>true,bindTexture(){},texSubImage2D(){}},upload:()=>({texture:{}})},task=await world.start({id:519},19,{duration:2});world.active.elapsed=.8;world.present(renderer,0,[{name:'Alcide',hero:true,x:0,z:0,height:.04,frame:3}]);const measured=world.inspectCard(renderer);
  assert.equal(measured.riderUpperPixels,4,'Antialiased alpha249 must not enter the denominator');assert.equal(measured.riderUpperExactVisible,0);assert.equal(measured.riderUpperExactVisibleFraction,0);assert.equal(measured.riderRasterTolerancePx,1);assert.equal(measured.riderUpperVisible,concealed?0:4);assert.equal(measured.riderUpperVisibleFraction,concealed?0:1);world.clear();await assert.rejects(task.finished,/annullata/);
 }
});
test('entering a native Surf landing retains the previous swimming joint pose before blending to the landing score',async()=>{
 const {c,n,world}=setup(),ctx=new Proxy({},{get:(_,key)=>key==='getImageData'?(()=>({data:new Uint8Array(4096)})):()=>{}});c.document.createElement=()=>({getContext:()=>ctx});const poses=[];c.ROM_SPRITE_ANIM.draw=(...args)=>{poses.push(args.at(-1));return true;};c.SurfField={mounted:()=>true};c.moving=true;n.surf=true;n.surfUserIndex=0;n.fieldHeight=0;
 const renderer={cameraPitch:[.423,.906],yaw:0,gl:{isContextLost:()=>false,isTexture:()=>true,bindTexture(){},texSubImage2D(){}},upload:()=>({texture:{}})},actors=()=>[{name:'AlcideSurf',hero:true,x:1,z:2,height:0,frame:3}];await world.prepare(c.Journey.state.party[0],57);world.present(renderer,0,actors());const time=.26/2.4;world.present(renderer,time,actors());const before=poses.at(-1);assert.ok(Math.abs(before.arms)>.8);
 n.surfMotion={landing:true,phase:'move',from:{x:1,y:2,height:0},to:{x:1,y:1,height:0},travel:0,direction:1,wait:0};world.present(renderer,time,actors());const after=poses.at(-1);for(const key of ['arms','head','lean','feet','tail','crouch'])assert.ok(Math.abs(before[key]-after[key])<1e-9,'Landing snapped '+key);world.clear();
});

test('Surf mounting and dismounting share the exact visible composite seat in all four directions',async()=>{
 for(const graphic of [501,503,507,508,515,516,580,581,635])for(const direction of [0,1,2,3])for(const landing of [false,true]){
  const {c,n,world}=setup(),images=[],pitch=[Math.sin(.44),Math.cos(.44)],yaw=-.6,context=matrixRecorder064((image,args,state)=>{if(args.length===8)images.push(Object.assign(args,{matrix:state.matrix}));}).context;c.document.createElement=()=>({getContext:()=>context});c.ROM_SPRITE_ANIM.draw=()=>true;c.SurfField={mounted:()=>true};c.moving=true;Object.assign(c.Journey.state.party[0],{id:graphic,name:({501:'Oshawott',503:'Samurott',508:'Stoutland',635:'Hydreigon'})[graphic]});n.surf=true;n.surfUserIndex=0;n.fieldHeight=3.2;
  const renderer={cameraPitch:pitch,yaw,gl:{isContextLost:()=>false,isTexture:()=>true,bindTexture(){},texSubImage2D(){}},upload:()=>({texture:{}})},actors=()=>[{name:'AlcideSurf',hero:true,x:1,z:2,height:3.2,frame:direction*3}];await world.prepare(c.Journey.state.party[0],57);let riderCard,standing,time=0;
  if(landing){world.present(renderer,0,actors());time=.26/c.FieldHMProfiles.profile(c.Journey.state.party[0],57).cadence;riderCard=world.present(renderer,time,actors()).find(a=>a.fieldHM);n.surfMotion={landing:true,phase:'move',from:{x:1,y:2,height:3.2},to:{x:1,y:1,height:3.2},travel:0,direction,wait:0};standing=world.present(renderer,time,actors()).find(a=>!a.fieldHM&&a.hero);if(!standing){const poses=[];for(let i=0;i<16&&!standing;i++){const current=world.present(renderer,time,actors());riderCard=current.find(a=>a.fieldHM)||riderCard;standing=current.find(a=>!a.fieldHM&&a.hero);if(standing)break;const im=images.at(-1);poses.push(Math.abs(Math.atan2(im.matrix[1],im.matrix[0])));world.rendered(renderer);world.surfBudget(n.surfMotion,.04);}assert.ok(standing,'The private balance stage did not finish');assert.ok(poses.length>=5,'The balance stage skipped required poses');assert.ok(poses[0]>.19&&poses.at(-1)<1e-10);assert.ok(poses.every((v,i)=>!i||v<=poses[i-1]+1e-10),'Landing balance must unwind progressively');}}
  else{n.surfMotion={landing:false,phase:'move',from:{x:1,y:1,height:3.2},to:{x:1,y:2,height:3.2},travel:1-1e-9,direction,wait:0};standing=world.present(renderer,0,actors()).find(a=>!a.fieldHM&&a.hero);delete n.surfMotion;riderCard=world.present(renderer,0,actors()).find(a=>a.fieldHM);}
  const d=images.at(-1),feet=matrixPoint064(d.matrix,d[4]+d[6]/2,d[5]+d[7]),sx=(feet[0]-256)/64,sy=(384-feet[1])/64,base={x:riderCard.x-2*pitch[0]*Math.sin(yaw),z:riderCard.z-2*pitch[0]*Math.cos(yaw),height:riderCard.height+2*pitch[1]},seat={x:base.x+sx*Math.cos(yaw)-sy*pitch[0]*Math.sin(yaw),z:base.z-sx*Math.sin(yaw)-sy*pitch[0]*Math.cos(yaw),height:base.height+sy*pitch[1]};assert.ok(Math.hypot(standing.x-seat.x,standing.z-seat.z,standing.height-seat.height)<1e-6,`Surf seat discontinuity ${graphic}/${direction}/${landing}`);world.clear();
 }
});

test('recall converges to the visible hero hand, even when the saved native rail height differs from the rendered floor',async()=>{
 const {actors}=await flyFrame({height:99});const card=actors.find(a=>a.fieldHM);assert.ok(card.height+2<8.2,'Pokémon recall followed a stale native height above the visible player');
});
test('world Pokémon orientation follows the actual Castelia camera yaw',async()=>{
 const {draws}=await flyFrame({yaw:Math.PI,direction:1});assert.equal(draws[0][2],true,'World south is seen from behind by the opposite street camera');
});
test('a west-facing rider uses the original west field sprite rather than the front sprite',async()=>{
 const {images}=await flyFrame({direction:2,elapsed:1});assert.equal(images.at(-1).src,'surf-6');
});
test('east-facing Pokémon artwork mirrors independently while the native east rider sprite stays unchanged',async()=>{
 const {draws,images}=await flyFrame({direction:3,elapsed:1});assert.equal(draws[0].mirrored,true,'Native front artwork must face east rather than repeat the west view');assert.equal(images.at(-1).src,'surf-9');assert.equal(images.at(-1).mirrored,false,'The already oriented native rider must not be flipped with the Pokémon');
});
test('Fly contact shadow fades as the Pokémon leaves the ground instead of remaining after departure',async()=>{
 const {actors}=await flyFrame({elapsed:1.4});const card=actors.find(a=>a.fieldHM);assert.ok(card.shadowAlpha<.001,'An airborne Pokémon must not retain a dark contact shadow at its starting position');
});
test('world profiles preserve seasonal, blue-striped and female graphic identities',()=>{
 const {c}=setup();c.ROM_FORM_SPRITES={basculinbluestriped:{species:550,graphic:699}};
 for(const [mon,move,key]of [[{id:521,gender:'F'},19,'521-female'],[{id:592,gender:'F'},57,'592-female'],[{id:593,gender:'F'},57,'593-female'],[{name:'Basculin-Blue-Striped'},57,699],[{id:586,form:3},15,706]])assert.equal(c.FieldHMProfiles.profile(mon,move)?.graphic,key);
 assert.equal(c.FieldHMProfiles.profile({id:495},19),null,'A field profile does not grant Fly to Snivy');
});
test('field contacts and limbs remain finite throughout all 105 species/form–HM profiles',()=>{
 const {c}=setup(),profiles=[...c.FieldHMProfiles.profiles.values()];assert.equal(profiles.length,105);
 for(const p of profiles)for(const direction of [0,1,2,3])for(const phase of ['depart','arrive','cruise','cut'])for(const t of [0,.1,.2,.5,.8,1]){
  const s=c.FieldHMProfiles.sample(p,t*2,{phase,progress:t,direction});for(const key of ['height','seat','bob','lean','arms','feet','head','tail','scale'])assert.ok(Number.isFinite(s[key]),p.graphic+':'+p.move+' '+key);
  assert.ok(s.seat>0&&s.seat<s.height,'Rider contact lies inside the fitted silhouette');assert.equal(s.back,direction===0);
 }
});
test('the opaque sprite foot, rather than the transparent card edge, coincides with ground at every camera yaw',()=>{
 const {world}=setup(),position={x:3,z:9,height:7};for(const angle of [.2,.44,.8])for(const yaw of [0,.6,-1.2,Math.PI]){
  const pitch=[Math.sin(angle),Math.cos(angle)],a=world.placement(position,pitch,0,yaw);
  assert.ok(Math.abs(a.x-2*pitch[0]*Math.sin(yaw)-position.x)<1e-10);assert.ok(Math.abs(a.z-2*pitch[0]*Math.cos(yaw)-position.z)<1e-10);assert.ok(Math.abs(a.height+2*pitch[1]-position.height)<1e-10);assert.equal(a.groundX,position.x);assert.equal(a.groundZ,position.z);
 }
});
test('Cut temporarily clears foreground trees with a smooth camera and restores the owned base view every frame',async()=>{
 const {world,c}=setup(),base=[Math.sin(.44),Math.cos(.44)],renderer={cameraPitch:base,zoom:1.8},f=fieldPresenter(world,c,renderer);const task=await world.start({id:501},15,{direction:0,duration:2,target:{x:1,y:1}});
 assert.ok(Math.abs(Math.atan2(...world.cameraFor(base))-.44)<1e-10);while(world.active.elapsed/2<.3){f.tick(.04);f.draw();}
 for(let i=0;i<5;i++){const restore=world.applyCamera(renderer);assert.ok(Math.abs(Math.atan2(...renderer.cameraPitch)-62*Math.PI/180)<1e-10);restore();assert.equal(renderer.cameraPitch,base);assert.equal(renderer.zoom,1.8);}
 finishField(world,c,renderer);await task.finished;assert.equal(world.cameraFor(base),base);
 const steep=[Math.sin(1.2),Math.cos(1.2)],other=await world.start({id:501},15,{direction:0,duration:2,target:{x:1,y:1}});f.tick(.6);f.draw();assert.ok(Math.abs(Math.atan2(...world.cameraFor(steep))-1.2)<1e-10);finishField(world,c,renderer);await other.finished;
});
test('Cut commits once at contact; a hidden tab advances neither pose nor native tree flag',async()=>{
 const {world,c}=setup(),f=fieldPresenter(world,c);let commits=0;const task=await world.start({id:501},15,{onContact:()=>commits++,duration:2,target:{x:1,y:1}});while(world.active.elapsed/2<.4){f.tick(.04);f.draw();}assert.equal(commits,0);const before=world.active.elapsed;
 c.document.hidden=true;f.tick(20);assert.equal(commits,0);assert.equal(world.active.elapsed,before);
 c.document.hidden=false;finishField(world,c,f.renderer);await task.finished;assert.equal(commits,1);assert.equal(world.active,null);
});
test('Fly holds its fully departed pose across a covered transfer and runs a separate arrival',async()=>{
 const {world,n,c}=setup(),mon={id:519};const departure=await world.start(mon,19,{phase:'depart',duration:1,transfer:true,retain:true});finishField(world,c);await departure.finished;assert.equal(world.active.done,true);
 n.zone=16;world.tick(2);assert.equal(world.active.phase,'depart');const arrival=await world.start(mon,19,{phase:'arrive',duration:1,transfer:true});finishField(world,c);await arrival.finished;assert.equal(world.active,null);
});
test('unrelated scene replacement cancels Cut without applying its gameplay outcome',async()=>{
 const {world,n}=setup();let commits=0;const task=await world.start({id:501},15,{onContact:()=>commits++});n.zone=16;world.tick(.1);await assert.rejects(task.finished,/Scena MN sostituita/);assert.equal(commits,0);assert.equal(world.active,null);
});
test('failed preparation releases pins and can retry without replacing a valid active bank',async()=>{
 const {world,c,calls}=setup();await world.prepare({id:501},57);c.RuntimeAssets.image=async()=>{throw Error('offline');};await assert.rejects(world.prepare({id:519},19),/offline/);assert.equal(calls.pins-calls.releases,1);assert.equal(world.retained.banks,1);
 c.RuntimeAssets.image=async()=>({width:32,height:32});await world.prepare({id:519},19);assert.equal(calls.pins-calls.releases,1);world.clear();assert.equal(calls.pins,calls.releases);
});
test('an inactive field action releases its sprite pins instead of pinning the last Pokémon indefinitely',async()=>{
 const {world,calls}=setup();await world.prepare({id:519},19);assert.equal(calls.pins-calls.releases,1);
 world.present({},0,[{name:'Alcide',hero:true,x:1,z:2,height:0,frame:3}]);assert.equal(calls.pins,calls.releases);assert.equal(world.retained.banks,0);assert.equal(world.retained.gpuCardBudgetBytes,1048576);
});
test('world preparation loads and pins both orientations before north-facing Cut or Surf can render',async()=>{
 const {world,c}=setup(),prepared=[],pinned=[];c.ROM_SPRITE_ANIM.prepare=async mons=>prepared.push([...mons]);c.ROM_SPRITE_ANIM.pin=mons=>{pinned.push([...mons]);return ()=>{};};
 await world.prepare({id:496,name:'Servine'},15);assert.deepEqual(prepared.flat().sort(),['496-back','496-front']);assert.deepEqual(pinned.flat().sort(),['496-back','496-front']);
});

test('only Oshawott Cut uses its authored atlas; Surf keeps the original native bank',async()=>{
 const {c,n,world}=setup();let originalDraws=0;c.ROM_SPRITE_ANIM.draw=()=>{originalDraws++;return true;};
 const renderer=fieldRenderer064(c,{cameraPitch:[.423,.906],gl:{isTexture:()=>true,bindTexture(){},texSubImage2D(){}},upload:()=>({texture:{}})}),actors=()=>fieldActors064(world,c,{name:'Alcide',hero:true,x:0,z:0,height:0,frame:3});
 const task=await world.start({id:501},15,{duration:2,target:{x:0,y:1}});const rejected=assert.rejects(task.finished,/annullata/);world.active.elapsed=1.04;world.present(renderer,0,actors());
 assert.equal(originalDraws,0);assert.equal(world.inspectCard(renderer).authoredAtlas,'oshawott-cut-064');assert.equal(world.retained.authoredAtlasBytes,1806336);world.clear();await rejected;assert.equal(world.retained.authoredAtlasBytes,0);
 c.SurfField={mounted:()=>true};n.surfUserIndex=0;await world.prepare(c.Journey.state.party[0],57);world.present(renderer,0,actors());assert.ok(originalDraws>0);assert.equal(world.inspectCard(renderer).authoredAtlas,undefined);assert.equal(world.retained.authoredAtlasBytes,0);world.clear();
});

test('evolved Cut owns a single decoded source across species switches and releases it before Surf',async()=>{
 const {c,world,calls}=setup(),f=fieldPresenter(world,c);let originalDraws=0;c.ROM_SPRITE_ANIM.draw=()=>{originalDraws++;return true;};
 for(const graphic of [501,502,503,502]){
  const task=await world.start({id:graphic},15,{duration:2,target:{x:0,y:1}}),rejected=assert.rejects(task.finished,/annullata/);world.active.elapsed=1.04;f.draw();assert.equal(originalDraws,0);assert.equal(world.inspectCard(f.renderer).authoredAtlas,graphic===501?'oshawott-cut-064':graphic===502?'dewott-cut-064':'samurott-cut-064');assert.equal(world.retained.authoredAtlasBytes,graphic===501?1806336:graphic===502?2490368:6230016);world.clear();await rejected;assert.equal(world.retained.authoredAtlasBytes,0);
 }
 await world.prepare({id:503},15);await world.prepare({id:502},15);assert.equal(c.FieldHMEvolvedCut.stats.graphic,502);assert.equal(c.FieldHMEvolvedCut.stats.retainedAtlases,1);assert.equal(world.retained.authoredAtlasBytes,2490368);
 await world.prepare({id:502},57);assert.equal(world.retained.authoredAtlasBytes,0);world.clear();assert.equal(calls.pins,calls.releases);
});

test('a cancelled atlas decode cannot create a late Cut action or replace the following bank',async()=>{
 const {c,world,calls}=setup(),images=[];c.Image=class{constructor(){this.naturalWidth=448;this.naturalHeight=1008;images.push(this);}set src(value){this.source=value;}};
 const old=world.start({id:501},15,{target:{x:0,y:1}}),rejected=assert.rejects(old,/sostituita/);await new Promise(setImmediate);assert.equal(images.length,1);assert.equal(world.active,null,'No action may start before its source is decoded');
 world.clear();await world.prepare({id:519},19);images[0].onload();await rejected;assert.equal(world.active,null);assert.equal(world.retained.banks,1);assert.equal(world.retained.authoredAtlasBytes,0);assert.equal(calls.pins-calls.releases,1);world.clear();assert.equal(calls.pins,calls.releases);
});
test('a superseded asynchronous bank cannot replace the newer selected species',async()=>{
 const {world,c,calls}=setup();let resolve;c.ROM_SPRITE_ANIM.prepare=([p])=>p.id===501||p==='501-front'?new Promise(r=>resolve=r):Promise.resolve();const old=world.prepare({id:501},57);await world.prepare({id:519},19);resolve();await assert.rejects(old,/sostituita/);assert.equal(world.retained.banks,1);assert.equal(calls.pins-calls.releases,1);world.clear();assert.equal(calls.pins,calls.releases);
});

test('Surf swimmers immerse their lower body while keeping the rider support above water',()=>{
 const {c}=setup();for(const p of c.FieldHMProfiles.profiles.values()){if(p.move!==57)continue;const s=c.FieldHMProfiles.sample(p,0);if(p.kind==='levitateSwim'){assert.ok(s.bob>0);continue;}assert.ok(s.bob<-.1,`${p.graphic} is standing on the water instead of swimming`);assert.ok(s.seat+s.bob>.25,`${p.graphic} rider support is submerged`);}
});

test('context loss before its DOM event cannot turn a field card upload into a fatal render error',async()=>{
 const {world,c}=setup();const task=await world.start({id:519},19,{duration:2});const actors=[{name:'Alcide',hero:true,x:1,z:2,height:0,frame:3}],renderer={gl:{isContextLost:()=>true},upload(){throw Error('Contesto grafico interrotto');}};assert.equal(world.present(renderer,0,actors),actors,'Keep the owned action while the renderer restores its context');assert.ok(world.active);let finished=false;task.finished.then(()=>finished=true);world.tick(2);await Promise.resolve();assert.equal(finished,false,'A lost context must not complete an undrawn action');renderer.gl.isContextLost=()=>false;renderer.upload=()=>({texture:{}});finishField(world,c,renderer);await task.finished;
});

test('Surf keeps the last visible species during evolution loading and swaps atomically on the same GPU card',async()=>{
 const {c,n,party,calls,world}=setup(),ctx=new Proxy({},{get:(_,key)=>key==='getImageData'?(()=>({data:new Uint8Array(4096)})):()=>{}});c.document.createElement=()=>({getContext:()=>ctx});c.SpeciesMoves={select:()=>({frames:10}),sample:()=>({})};const graphics=[];c.ROM_SPRITE_ANIM.draw=(_ctx,g)=>{graphics.push(g);return true;};n.surf=true;n.surfUserIndex=0;c.SurfField={mounted:()=>true};let uploads=0;const renderer={cameraPitch:[0,1],gl:{isContextLost:()=>false,isTexture:()=>true,bindTexture(){},texSubImage2D(){},deleteTexture(){}},upload:()=>{uploads++;return {texture:{}};}};
 await world.prepare(party[0],57);party[0].id=502;party[0].name='Dewott';let resume;c.ROM_SPRITE_ANIM.prepare=()=>new Promise(resolve=>resume=resolve);const pending=world.prepare(party[0],57),actors=[{name:'AlcideSurf',hero:true,x:1,z:2,height:0,frame:3}];const old=world.present(renderer,0,actors).find(a=>a.fieldHM);assert.ok(old,'The swimmer must remain visible while the evolved bank loads');assert.equal(graphics.at(-1),501);assert.equal(world.surfReady(),false);assert.equal(world.surfRenderable(),true);
 resume();await pending;const next=world.present(renderer,0,actors).find(a=>a.fieldHM);assert.equal(graphics.at(-1),502);assert.equal(next.texture,old.texture);assert.equal(uploads,1);assert.equal(calls.releases,1);world.clear();world.dispose(renderer);assert.equal(calls.pins,calls.releases);
});

test('low-FPS speed chunks render every authored Cut and Fly key before completion at ×1/×2/×4',async t=>{
 for(const speed of [1,2,4]){const {world,c}=setup();t.after(()=>world.clear());const profiles=[...c.FieldHMProfiles.profiles.values()].filter(p=>p.move===15||p.move===19);assert.equal(profiles.length,76);
 for(const profile of profiles)for(const phase of profile.move===15?['cut']:['depart','arrive']){
  const f=fieldPresenter(world,c),id=profile.graphic,move=profile.move,duration=move===15?2.4:2.2,mon={id};let commits=0;
  const task=await world.start(mon,move,{phase,duration,target:{x:1,y:1},onContact:move===15?()=>{commits++;assert.ok(Math.abs(world.active.elapsed/duration-.52)<1e-9,'Native contact must occur at its authored .52 boundary');}:null});task.finished.catch(()=>{});
  let frames=0;while(world.active&&!world.active.done&&frames++<200){let rest=.25*speed;while(rest>1e-8){const dt=Math.min(.04,rest);f.tick(dt);rest-=dt;}f.draw();}
  assert.ok(!world.active||world.active.done,'Render acknowledgement must eventually release control');await task.finished;
  const actual=f.frames.map(frame=>frame.progress),required=c.FieldHMProfiles.profile(mon,move).choreography[phase].map(row=>row[0]).filter(progress=>progress>0);
  for(const progress of required)assert.ok(actual.some(value=>Math.abs(value-progress)<1e-9),`${id}:${phase}:×${speed} omitted authored rendered key ${progress}: ${actual.join(',')}`);
  for(let i=1;i<actual.length;i++){assert.ok(actual[i]>=actual[i-1],'Visible action progress went backwards');assert.ok(actual[i]-actual[i-1]<=.080000001,'One rendered frame crossed an entire gesture interval');}
  assert.equal(commits,move===15?1:0);if(move===15){assert.ok(f.frames.some(frame=>frame.progress>=.30&&frame.progress<=.45&&!frame.committed),'Preparation never reached the renderer before native contact');assert.ok(f.frames.some(frame=>frame.progress>=.52&&frame.progress<=.61&&frame.committed),'Committed contact never reached the renderer');}
 }}
});

test('the documented .278 to .583 Cut overshoot cannot skip preparation or commit before it is drawn',async t=>{
 const {world,c}=setup(),f=fieldPresenter(world,c);let commits=0;const task=await world.start({id:496},15,{duration:2.4,target:{x:1,y:1},onContact:()=>commits++});task.finished.catch(()=>{});t.after(()=>world.clear());
 // The source runtime supplies normal .04 chunks; rendering stays independent.
 while(world.active.elapsed/2.4<.278){f.tick(.04);f.draw();}
 f.tick((.583-.278)*2.4);f.draw();
 assert.equal(commits,0,'Low FPS committed the tree before showing the preparation');
 finishField(world,c,f.renderer);await task.finished;assert.equal(commits,1);
 assert.ok(f.frames.every(frame=>frame.progress<.52||frame.committed),'Contact was visible without its native tree outcome');
});

test('many physics chunks and card composition cannot acknowledge an undrawn field action',async t=>{
 const {world,c}=setup(),f=fieldPresenter(world,c);let commits=0;const task=await world.start({id:496},15,{duration:2.4,target:{x:1,y:1},onContact:()=>commits++});task.finished.catch(()=>{});t.after(()=>world.clear());
 f.tick(1);const held=world.active.elapsed;for(let i=0;i<25;i++)f.tick(.04);assert.equal(world.active.elapsed,held,'Physics crossed a key before any draw');
 f.draw({ack:false});for(let i=0;i<25;i++)f.tick(.04);assert.equal(world.active.elapsed,held,'Painting an offscreen card counted as a completed world draw');assert.equal(commits,0);
 world.rendered?.(f.renderer);world.rendered?.(f.renderer);f.tick(.04);assert.ok(world.active.elapsed>held,'A successful frame did not release its key');
 const next=world.active.elapsed;for(let i=0;i<25;i++)f.tick(.04);assert.equal(world.active.elapsed,next,'One acknowledged frame released more than one render boundary');finishField(world,c,f.renderer);await task.finished;assert.equal(commits,1);
});

test('hidden tabs, lost contexts and frames without the hero cannot release a held pose',async t=>{
 const {world,c}=setup(),f=fieldPresenter(world,c);const task=await world.start({id:519},19,{phase:'depart',duration:2.2});task.finished.catch(()=>{});t.after(()=>world.clear());
 f.tick(1);const held=world.active.elapsed;f.draw({ack:false});c.document.hidden=true;world.rendered?.(f.renderer);f.tick(100);assert.equal(world.active.elapsed,held);
 c.document.hidden=false;f.renderer.gl.isContextLost=()=>true;f.draw();world.rendered?.(f.renderer);f.tick(100);assert.equal(world.active.elapsed,held,'Lost context acknowledged an undrawn key');
 f.renderer.gl.isContextLost=()=>false;world.present(f.renderer,0,[]);world.rendered?.(f.renderer);f.tick(100);assert.equal(world.active.elapsed,held,'A frame without the hero acknowledged the Pokémon');
 f.draw();f.tick(.04);assert.ok(world.active.elapsed>held);finishField(world,c,f.renderer);await task.finished;
});

test('cancelled action frames cannot acknowledge a replacement and scene replacement still rejects before contact',async t=>{
 const {world,c,n}=setup(),f=fieldPresenter(world,c);let commits=0;const first=await world.start({id:496},15,{target:{x:1,y:1},onContact:()=>commits++});f.tick(1);f.draw({ack:false});const rejected=assert.rejects(first.finished,/annullata/);world.clear();await rejected;
 const second=await world.start({id:496},15,{target:{x:1,y:1},onContact:()=>commits++});second.finished.catch(()=>{});t.after(()=>world.clear());f.tick(1);const held=world.active.elapsed;world.rendered?.(f.renderer);f.tick(1);assert.equal(world.active.elapsed,held,'An old action frame released the replacement');
 n.zone=16;f.tick(.04);await assert.rejects(second.finished,/Scena MN sostituita/);assert.equal(world.active,null);assert.equal(commits,0);
});

test('field actions resolve only after the final world frame has been acknowledged',async t=>{
 const {world,c}=setup(),f=fieldPresenter(world,c);const task=await world.start({id:519},19,{phase:'arrive',duration:2.2});task.finished.catch(()=>{});t.after(()=>world.clear());let finished=false;task.finished.then(()=>finished=true);
 let frames=0;while(world.active&&world.active.elapsed<2.2&&frames++<200){f.tick(1);if(world.active?.elapsed>=2.2){f.draw({ack:false});break;}f.draw();}
 assert.ok(world.active,'Action resolved before its final draw acknowledgement');assert.equal(world.active.elapsed,2.2);await Promise.resolve();assert.equal(finished,false,'Tick/card preparation resolved the command before presentation');
 f.tick(1);assert.equal(world.active.elapsed,2.2);world.rendered?.(f.renderer);await task.finished;assert.equal(world.active,null);
});

test('Fly camera opens above roofs before boarding and restores the exact base after every draw',async()=>{
 for(const phase of ['depart','arrive']){
  const {world}=setup(),base=[Math.sin(.44),Math.cos(.44)],steep=[Math.sin(1.2),Math.cos(1.2)],center=[7,-4],renderer={cameraPitch:base,zoom:1.8,center,yaw:.6};const task=await world.start({id:519},19,{phase,duration:2.2});
  for(const progress of [0,.06,.12,.15,.35,.65,.85,.925,1]){world.active.elapsed=progress*2.2;const target=62*Math.PI/180,expected=phase==='depart'?(progress===0?.44:progress>=.12?target:(.44+target)/2):progress<=.85?target:progress===1?.44:(.44+target)/2;
   for(let draw=0;draw<5;draw++){const restore=world.applyCamera(renderer);assert.ok(Math.abs(Math.atan2(...renderer.cameraPitch)-expected)<1e-9,phase+' camera at '+progress);assert.equal(renderer.zoom,1.8);assert.equal(renderer.center,center);assert.deepEqual(center,[7,-4]);assert.equal(renderer.yaw,.6);restore();assert.equal(renderer.cameraPitch,base,'The owned base pitch array was replaced');}
   assert.ok(Math.abs(Math.atan2(...world.cameraFor(steep))-1.2)<1e-9,'Fly lowered an already steeper camera');
  }
  world.clear();await assert.rejects(task.finished,/annullata/);assert.equal(world.cameraFor(base),base);
 }
});

{
/* Pose-order checks complement, never replace, the actual world-rendered replay. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const files=['field-hm-cut-choreographies.js','field-hm-fly-choreographies.js','field-hm-surf-choreographies.js','field-hm-cut-anatomy.js','field-hm-fly-anatomy.js','field-hm-surf-anatomy.js','field-hm-choreography.js','field-hm-profiles.js'];
function exclusiveSetup(){const c={console,Map,Math};c.window=c;vm.createContext(c);for(const f of files){const p=path.join(__dirname,'../src',f);if(fs.existsSync(p))vm.runInContext(fs.readFileSync(p,'utf8'),c,{filename:f});}return c;}
const channels=['lean','head','arms','feet','tail','crouch','stretch','squash','wings','sideHeads'];
function signature(c,p,phase){const values=Array.from({length:65},(_,i)=>{const u=i/64,progress=phase==='depart'?u*.35:phase==='arrive'?.65+u*.35:u;return c.FieldHMProfiles.sample(p,u,{phase,progress,cycle:u,moving:phase!=='idle'});});return channels.map(key=>{const seq=values.map(v=>v[key]||0),amplitude=Math.max(...seq.map(Math.abs));return amplitude<1e-8?'rest':seq.map(v=>Math.round(v/amplitude*8)).join(',');}).join('|');}
test('every shipped species/form–HM pair has an explicit authored sequence, not a family fallback',()=>{
 const c=exclusiveSetup(),profiles=[...c.FieldHMProfiles.profiles.values()];assert.equal(profiles.length,105);const ids=new Set();
 for(const p of profiles){assert.ok(p.choreography?.id,`${p.graphic}:${p.move} lacks an exclusive sequence`);assert.ok(p.choreography.beats.length>=3);assert.ok(!ids.has(p.choreography.id),'Duplicate choreography identity');ids.add(p.choreography.id);}
});
test('visible action trajectories remain distinct after removing graphic, size, support, cadence and per-channel amplitude',()=>{
 const c=exclusiveSetup();for(const move of [15,19,57]){const seen=new Map();for(const p of c.FieldHMProfiles.profiles.values()){if(p.move!==move)continue;const phases=move===15?['cut']:move===19?['depart','arrive']:['swim'];const key=phases.map(phase=>signature(c,p,phase)).join('::');assert.ok(!seen.has(key),`${p.graphic}:${move} repeats ${seen.get(key)} after normalization`);seen.set(key,p.graphic);}}
});
test('every Surf phase has its own distinct gesture order and closes its animation boundary',()=>{
 const c=exclusiveSetup();for(const phase of ['swim','idle','board','land']){const seen=new Set();for(const p of c.FieldHMProfiles.profiles.values()){if(p.move!==57)continue;const key=signature(c,p,phase);assert.ok(!seen.has(key),`${p.graphic} duplicates Surf ${phase}`);seen.add(key);const a=c.FieldHMProfiles.sample(p,0,{phase,progress:0,cycle:0}),b=c.FieldHMProfiles.sample(p,1,{phase,progress:1,cycle:1});for(const k of channels)assert.ok(Math.abs((a[k]||0)-(b[k]||0))<1e-9,`${p.graphic} ${phase} seam ${k}`);}}
});

test('only rendered native joints may distinguish choreographies, in either view',()=>{
 const c=exclusiveSetup();for(const back of [false,true])for(const move of [15,19,57])for(const phase of move===15?['cut']:move===19?['depart','arrive','cruise']:['board','swim','idle','land']){
  const seen=new Map();for(const p of c.FieldHMProfiles.profiles.values()){if(p.move!==move)continue;const allowed=new Set(c.FieldHMChoreography.supportedChannels(p.graphic,back)),parts=signature(c,p,phase).split('|'),key=parts.filter((_,i)=>allowed.has(channels[i])).join('|');assert.ok(!seen.has(key),`${p.graphic}:${move}:${phase}:${back} shares effective motion with ${seen.get(key)}`);seen.set(key,p.graphic);}
 }
});
test('field joint pivots belong to the active native map, not an inactive alternate',()=>{
 const c=exclusiveSetup(),ids=c.FieldHMChoreography.anatomy(501).front.left;assert.ok(ids.length>=2);
 const data={parent:[{frames:[[1,1,0,4096,4096,0,0]]}],maps:[[[ids[0],-90,-60]],[[ids.at(-1),20,8]]]};
 const pose={graphic:501,species:501,dir:1,head:0,arms:1,feet:0,tail:0,wings:0,sideHeads:0};const p=c.FieldHMChoreography.part(ids.at(-1),false,pose,data);assert.equal(p.pivotX,0);assert.equal(p.pivotY,0);
});
test('joint chains stay rigid around one active pivot and every mapped track is native',()=>{
 const c=exclusiveSetup(),site=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site'),done=new Set();
 for(const p of c.FieldHMProfiles.profiles.values()){if(done.has(p.graphic))continue;done.add(p.graphic);const anatomy=c.FieldHMChoreography.anatomy(p.graphic);assert.ok(anatomy,'Missing native map '+p.graphic);
  for(const back of [false,true]){const data=JSON.parse(fs.readFileSync(path.join(site,'assets/animated',p.graphic+'-'+(back?'back':'front')+'.json'),'utf8')),active=new Map(data.maps[data.parent[0].frames[0][0]].map(row=>[row[0],row])),all=new Set(data.maps.flat().map(row=>row[0])),assigned=new Set(),map=anatomy[back?'back':'front'];assert.ok(map);
   for(const [role,tracks]of Object.entries(map)){if(!Array.isArray(tracks))continue;const rendered=tracks.filter(track=>active.has(track)),transforms=[];
    for(const track of tracks){assert.ok(all.has(track),`${p.graphic}:${role} invented native track ${track}`);assert.ok(!assigned.has(track),`${p.graphic}:${back} duplicate track ${track}`);assigned.add(track);}
    for(const track of rendered){const a=c.FieldHMChoreography.part(track,back,{fieldHM:true,graphic:p.graphic,species:p.species,dir:1,head:.4,arms:1,feet:.6,tail:.7,wings:.2,sideHeads:.1},data);if(a){for(const k of ['rotation','pivotX','pivotY'])assert.ok(Number.isFinite(a[k]));transforms.push({angle:a.rotation,x:active.get(track)[1]+a.pivotX,y:active.get(track)[2]+a.pivotY});}}
    if(transforms.length>1)for(const t of transforms){assert.equal(t.angle,transforms[0].angle,'A limb chain was torn by independent rotations');assert.equal(t.x,transforms[0].x);assert.equal(t.y,transforms[0].y);}
   }
  }
 }
 assert.equal(done.size,85);
});

test('every scored pose keeps a positive body and a rider contact above the water and inside its fitted silhouette',()=>{
 const c=exclusiveSetup();for(const p of c.FieldHMProfiles.profiles.values())for(const phase of p.move===15?['cut']:p.move===19?['depart','arrive','cruise']:['board','swim','idle','land'])for(let i=0;i<=80;i++){
  const u=i/80,s=c.FieldHMProfiles.sample(p,u,{phase,progress:u,cycle:u});for(const key of [...channels,'height','seat','bodyScaleX','bodyScaleY'])assert.ok(Number.isFinite(s[key]),p.graphic+':'+phase+':'+key);assert.ok(s.bodyScaleX>.5&&s.bodyScaleX<1.3);assert.ok(s.bodyScaleY>.5&&s.bodyScaleY<1.3);assert.ok(s.seat>0&&s.seat<s.height*s.bodyScaleY);if(p.move===57)assert.ok(s.seat+s.bob>.15,p.graphic+' rider submerged during '+phase);
 }
});
test('Golurk flames use measured paired native contacts and its fused feet retract coherently',()=>{
 const c=exclusiveSetup(),a=c.FieldHMChoreography.anatomy(623);c.ROM_SPRITE_ANIM={cache:{'623-front':{groundBounds:[-36,-79,41,0]}}};
 for(const view of ['front','back']){assert.equal(a.jetAnchors[view].length,2);assert.ok(a.jetAnchors[view][0][0]<0&&a.jetAnchors[view][1][0]>0);}
 const p=c.FieldHMChoreography.part(a.front.feet[0],false,{graphic:623,species:623,feet:-1,jets:1}, {parent:[{frames:[[0,1]]}],maps:[[[a.front.feet[0],0,0]]]});assert.equal(p.rotation,0);assert.ok(Math.abs(p.y+79*.03)<1e-9);
});

test('Fly uses its own cruise wing pattern while airborne and retains the authored visible boarding and landing poses',()=>{
 const c=exclusiveSetup();for(const graphic of [519,623,635,644]){const p=c.FieldHMProfiles.profile({graphic},19);for(const [phase,progress]of [['depart',.7],['depart',.24],['arrive',.8]]){
  const s=c.FieldHMProfiles.sample(p,0,{phase,progress,cycle:.37}),base=c.FieldHMChoreography.sample(p.choreography,phase,progress),loop=c.FieldHMChoreography.sample(p.choreography,'cruise',.37),weight=phase==='depart'&&progress===.7?.65:0;
  for(const key of ['arms','wings','tail','sideHeads'])assert.ok(Math.abs(s[key]-(base[key]*(1-weight)+loop[key]*weight))<1e-9);
 }}
});

}

/* Additional private CPU contracts. No graphical acceptance inferred. */
async function balanceFixture064(graphic=580){const a=setup(),{c,n,world}=a,images=[],recorder=matrixRecorder064((image,args,state)=>{if(args.length===8)images.push({args,...state});});c.document.createElement=()=>({width:512,height:512,getContext:()=>recorder.context});c.ROM_SPRITE_ANIM.draw=()=>true;c.SurfField={mounted:()=>true};Object.assign(c.Journey.state.party[0],{id:graphic,name:graphic===613?'Cubchoo':'Ducklett'});n.surf=true;n.surfUserIndex=0;n.fieldHeight=0;await world.prepare(c.Journey.state.party[0],57);const renderer={cameraPitch:[.423,.906],gl:{isTexture:()=>true,bindTexture(){},texSubImage2D(){},isContextLost:()=>false},upload:()=>({texture:{}})},actors=()=>[{name:'AlcideSurf',hero:true,x:1,z:2,height:0,frame:3}];let time=0;return{...a,renderer,images,draw(){const actorsDrawn=world.present(renderer,time,actors());return{actors:actorsDrawn,angle:images.length?Math.atan2(images.at(-1).matrix[1],images.at(-1).matrix[0]):null};},advance(dt){time+=dt;world.tick(dt);},ack(){world.rendered(renderer);}};}
for(const [graphic,lean,name]of [[580,.2,'Ducklett'],[613,.16,'Cubchoo']]){
test(name+' mount balance holds every observed pose until an actual render acknowledgement',async()=>{
 const f=await balanceFixture064(graphic),{n,c,world}=f;try{n.surfMotion={landing:false,phase:'move',from:{x:1,y:1,height:0},to:{x:1,y:2,height:0},travel:1-1e-9,direction:1,wait:16,cells:1,zone:113};f.draw();delete n.surfMotion;assert.equal(f.draw().angle,0);for(let i=0;i<10;i++)f.advance(.3);assert.equal(f.draw().angle,0,'Undrawn mount progressed past its first pose');
 const angles=[];for(let i=0;i<5;i++){const a=f.draw().angle;angles.push(a);for(let j=0;j<10;j++)f.advance(.3);assert.equal(f.draw().angle,a,'Physics chunks skipped an unacknowledged rider pose');if(i===1){c.document.hidden=true;f.ack();c.document.hidden=false;f.advance(.3);assert.equal(f.draw().angle,a,'Hidden frame acknowledged rider pose');f.renderer.contextLost=true;f.ack();f.renderer.contextLost=false;f.advance(.3);assert.equal(f.draw().angle,a,'Lost-context frame acknowledged rider pose');}f.ack();f.advance(.3);}assert.ok(angles.every((a,i)=>!i||a>angles[i-1]));assert.ok(Math.abs(angles[0])<1e-10&&Math.abs(angles.at(-1)-lean)<1e-10);assert.equal(new Set(angles.map(a=>a.toFixed(6))).size,5);
 }finally{world.clear();}
});
test(name+' dismount unwinds before native travel without writing presentation state into its saveable record',async()=>{
 const f=await balanceFixture064(graphic),{n,world}=f;try{assert.ok(Math.abs(f.draw().angle-lean)<1e-10);n.surfMotion={landing:true,phase:'move',from:{x:1,y:2,height:0},to:{x:1,y:1,height:0},travel:0,direction:1,wait:16,cells:1,zone:113};const unchanged=JSON.stringify(n.surfMotion),angles=[];
 for(let i=0;i<5;i++){for(let j=0;j<10;j++)assert.equal(world.surfBudget(n.surfMotion,.3).dt,0,'Native travel started before the rider was upright');const current=f.draw();assert.ok(!current.actors.some(a=>!a.fieldHM&&a.hero),'Free standing avatar appeared before unwind completed');angles.push(current.angle);assert.equal(JSON.stringify(n.surfMotion),unchanged,'Presentation data leaked into save record');f.ack();}
 assert.ok(angles.every((a,i)=>!i||a<angles[i-1]));assert.ok(Math.abs(angles[0]-lean)<1e-10&&Math.abs(angles.at(-1))<1e-10);assert.ok(world.surfBudget(n.surfMotion,.3).dt>0,'Native travel did not resume');assert.ok(f.draw().actors.some(a=>!a.fieldHM&&a.hero),'Upright standing avatar was not released');assert.equal(JSON.stringify(n.surfMotion),unchanged);
 }finally{world.clear();}
});
test('a freshly restored '+name+' landing or recall never restarts balancing or pulls the avatar back onto the water',async()=>{
 for(const [phase,travel]of [['move',.4],['recall',1]]){const f=await balanceFixture064(graphic),{n,world}=f;try{n.surfMotion={landing:true,phase,from:{x:1,y:2,height:0},to:{x:1,y:1,height:0},travel,direction:1,wait:0,cells:1,zone:113};const unchanged=JSON.stringify(n.surfMotion);assert.ok(world.surfBudget(n.surfMotion,.03).dt>0,`Restored ${phase}/${travel} restarted the pre-departure balance wait`);assert.ok(f.draw().actors.some(a=>!a.fieldHM&&a.hero),`Restored ${phase}/${travel} pulled the standing avatar back onto the Pokemon`);assert.equal(JSON.stringify(n.surfMotion),unchanged);}finally{world.clear();}}
});

}


/* Dedicated strict function block isolates all eight camera helpers/imports. */
(() => {
/* Portable camera/ownership contracts: actual source, generated-site native501
 * JSON, original authored atlas and real Dreamyard scene shape. CPU matrix
 * observation only; no Game, raster, continuous-motion or art approval. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const repo=path.resolve(__dirname,'..'),site=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site'),source=path.join(repo,'src/field-hm-world.js');
function matrixRecorder(onImage){let m=[1,0,0,1,0,0],stack=[];const mul=b=>{const a=m;m=[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];};return new Proxy({},{get:(_,k)=>k==='getImageData'?()=>({data:new Uint8Array(4096)}):k==='drawImage'?(im,...args)=>onImage({im,args,m:m.slice()}):k==='save'?()=>stack.push(m.slice()):k==='restore'?()=>{m=stack.pop();}:k==='scale'?(x,y)=>mul([x,0,0,y,0,0]):k==='translate'?(x,y)=>mul([1,0,0,1,x,y]):k==='rotate'?a=>mul([Math.cos(a),Math.sin(a),-Math.sin(a),Math.cos(a),0,0]):()=>{}});}
async function fixture({direction=0,graphic=501,viewport=[390,844],zoom=1.4,firstTick=false,sceneDescriptor=null,heroZ=11.5,zone=152,onContact=null,blockedAt=()=>false,occupiedAt=()=>false,floorAt=()=>0}={}){
 const calls=[],context=matrixRecorder(row=>calls.push(row)),n={zone},c={Promise,Map,WeakMap,setTimeout,clearTimeout,console,innerWidth:viewport[0],innerHeight:viewport[1],document:{hidden:false,createElement:()=>({width:512,height:512,getContext:()=>context})},Image:class{set src(value){const b=Buffer.from(value.split(',')[1],'base64');this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);queueMicrotask(()=>this.onload?.());}},NativeStory:{state:n,occupied:occupiedAt},blocked:blockedAt,Journey:{state:{party:[],original:n}},OPENING_SPRITES:{Alcide:Array(12).fill('hero')},RuntimeAssets:{image:async()=>({width:32,height:32})}};
 c.ROM_SPRITE_ANIM={cache:{},pin:()=>()=>{},prepare:async keys=>{for(const key of keys)c.ROM_SPRITE_ANIM.cache[key]={data:JSON.parse(fs.readFileSync(path.join(site,'assets/animated/'+key+'.json'))),groundBounds:[-128,-128,128,0]};},draw:()=>true,alphaBounds:()=>[0,0,32,32],frame:a=>a.frames[0]};c.window=c;vm.createContext(c);
 for(const f of ['native-rails.js','pokemon-visuals.js','field-hm-cut-choreographies.js','field-hm-fly-choreographies.js','field-hm-surf-choreographies.js','field-hm-cut-anatomy.js','field-hm-fly-anatomy.js','field-hm-surf-anatomy.js','field-hm-choreography.js','field-hm-profiles.js','field-hm-oshawott-cut.js','field-hm-evolved-cut.js'])vm.runInContext(fs.readFileSync(path.join(repo,'src',f),'utf8'),c,{filename:f});vm.runInContext(fs.readFileSync(source,'utf8'),c,{filename:source});
 const world=c.FieldHMWorld,center=[7.5,13],pitch=[Math.sin(.44),Math.cos(.44)],r={scene:sceneDescriptor||{zone},zoom,center,cameraPitch:pitch,yaw:0,elevation:0,viewSize:viewport,images:{'Original108-0':{}},spriteName:x=>x,groundHeight:floorAt,upload:()=>({texture:{}}),gl:{isTexture:()=>true,bindTexture(){},texSubImage2D(){},deleteTexture(){}}},base={zoom,center,cameraPitch:pitch,yaw:0};
 const tree={name:'Original108',x:7.5,z:10.5,height:0,frame:0,source:{model:108,x:7.5,y:10.5}},hero={name:'Alcide',hero:true,x:7.5,z:heroZ,height:.04,frame:direction*3},actors=()=>[{...tree},{...hero}];const task=await world.start({id:graphic},15,{direction,target:{x:tree.x,y:tree.z},height:0,duration:2.4,onContact});task.finished.catch(()=>{});let firstElapsed=0,firstCamera=null;
 if(firstTick){c.performance={now:()=>0};c.localStorage={getItem:()=>null,setItem(){}};vm.runInContext(fs.readFileSync(path.join(repo,'src/game-speed.js'),'utf8'),c,{filename:'game-speed.js'});for(const dt of c.GameSpeed.steps(1/60))world.tick(dt);firstElapsed=world.active.elapsed;const restore=world.applyCamera(r);try{firstCamera={samePitchReference:r.cameraPitch===base.cameraPitch,pitch:r.cameraPitch.slice(),yaw:r.yaw};world.present(r,0,actors());world.rendered(r);}finally{restore();}}
 else world.present(r,0,actors());calls.length=0;
 return {c,world,r,base,calls,actors,task,hero,tree,firstElapsed,firstCamera,close(){world.clear();}};
}
// Independent world3d shader projection, including its non-rail q clamp.
function screen(r,[x,y,z]){const [w,h]=r.viewSize,[ps,pc]=r.cameraPitch,cs=Math.cos(r.yaw||0),sn=Math.sin(r.yaw||0),dx=x-r.center[0],dz=z-r.center[1],py=y-(r.elevation||0),vx=dx*cs-dz*sn,vz=dx*sn+dz*cs,q=Math.max(.35,1-(py*ps+vz*pc)/(r.cameraDistance||65)),s=Math.min(w/30,h/21)*r.zoom;return[w/2+vx*s/q,h/2-(pc*py-ps*vz)*s/q];}
function actorPoint(r,a,px,py){const [ps,pc]=r.cameraPitch,cs=Math.cos(r.yaw),sn=Math.sin(r.yaw),u=(px/512-.5)*(a.worldWidth??2),v=(1-py/512)*(a.worldHeight??2);return[a.x+u*cs-v*ps*sn,(a.height??.04)+v*pc,a.z-u*sn-v*ps*cs];}
function checkBounds(f,output){const r=f.r,[w,h]=r.viewSize,body=output.find(a=>a.fieldHM),draw=f.calls.find(row=>row.im.naturalWidth===448&&row.args.length===8);assert(body&&draw,'Original authored atlas draw missing');const d=draw.args,m=draw.m,points=[[d[4],d[5]],[d[4]+d[6],d[5]],[d[4],d[5]+d[7]],[d[4]+d[6],d[5]+d[7]]].map(([x,y])=>actorPoint(r,body,m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]));for(const a of output.filter(a=>!a.fieldHM))for(const [x,y]of [[-1,0],[1,0],[-1,2],[1,2]]){const [ps,pc]=r.cameraPitch,cs=Math.cos(r.yaw),sn=Math.sin(r.yaw),top=x===1&&y===2,v=y*pc-(top ? .126*y : 0),z=-y*ps-(top ? .202*y : 0);points.push([a.x+x*cs+z*sn,(a.height??.04)+v,a.z-x*sn+z*cs]);}for(const p of points){const [x,y]=screen(r,p);assert(x>=16&&x<=w-16&&y>=16&&y<=h-16,'Actual original draw escaped gutter '+JSON.stringify({p,x,y,w,h}));}}
// Density is measured from the actually recorded 56px source-cell draw, not zoom.
function sourceCellMinSingularValue(f,output){const body=output.find(a=>a.fieldHM),draw=f.calls.find(row=>row.im.naturalWidth===448&&row.args.length===8);assert(body&&draw,'Actual source cell draw missing');const d=draw.args,m=draw.m;assert.equal(d[2],56);assert.equal(d[3],56);const corners=[[d[4],d[5]],[d[4]+d[6],d[5]],[d[4],d[5]+d[7]]].map(([x,y])=>screen(f.r,actorPoint(f.r,body,m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]))),[o,x,y]=corners,a=(x[0]-o[0])/56,b=(x[1]-o[1])/56,c=(y[0]-o[0])/56,dv=(y[1]-o[1])/56,first=a*a+b*b,second=c*c+dv*dv,largest=Math.sqrt((first+second+Math.hypot(first-second,2*(a*c+b*dv)))/2),smallest=Math.abs(a*dv-b*c)/largest;assert(Number.isFinite(smallest),'Nonfinite source-pixel projection');return smallest;}
test('close Cut camera preserves native source detail and bounds at the portrait plateau',async()=>{const f=await fixture();try{f.world.active.elapsed=2.4*.52;const restore=f.world.applyCamera(f.r);try{const out=f.world.present(f.r,.5,f.actors());const density=sourceCellMinSingularValue(f,out);assert(density>=1,'Portrait source-cell density below1 CSSpx/nativepx: '+density);assert.equal(f.r.yaw,Math.PI/6);assert.notEqual(f.r.center,f.base.center);assert.equal(f.world.inspectCard(f.r).authoredAtlas,'oshawott-cut-064');assert.equal(f.world.active.direction,0);const nativeDraw=f.calls.find(row=>row.im.naturalWidth===448&&row.args.length===8);assert(nativeDraw.args[0]/56+8*nativeDraw.args[1]/56>=71,'North view ceased using the authored back cells');checkBounds(f,out);}finally{restore();}assert.equal(f.r.center,f.base.center);assert.equal(f.r.cameraPitch,f.base.cameraPitch);assert.equal(f.r.zoom,f.base.zoom);}finally{f.close();}});
test('close Cut camera contains real atlas draw corners, hero and tree across resize/user zoom on the unchanged route',async()=>{const f=await fixture({zoom:5});try{for(const size of [[390,844],[844,390],[1280,720]])for(const t of [.3,.52,.84]){f.r.viewSize=size;f.world.active.elapsed=t*2.4;f.calls.length=0;const restore=f.world.applyCamera(f.r);try{const out=f.world.present(f.r,t,f.actors());assert(f.r.yaw>0,'Baseline has no three-quarter separation');checkBounds(f,out);assert.deepEqual([f.hero.x,f.hero.z,f.tree.x,f.tree.z],[7.5,11.5,7.5,10.5]);}finally{restore();}assert.equal(f.r.zoom,5);assert.equal(f.r.center,f.base.center);}}finally{f.close();}});
test('close Cut camera keeps scoped south on the native basis while west/east retain the old camera',async()=>{for(const direction of [1,2,3]){const f=await fixture({direction});try{f.world.active.elapsed=1.2;const restore=f.world.applyCamera(f.r);try{assert.equal(f.r.yaw,0);if(direction===1)assert.equal(f.r.cameraPitch,f.base.cameraPitch);if(direction>=2){assert.equal(f.r.zoom,f.base.zoom);assert.equal(f.r.center,f.base.center);}}finally{restore();}}finally{f.close();}}});
test('close Cut camera restores original references on thrown draw and cancellation without persistent tween state',async()=>{const f=await fixture();try{f.world.active.elapsed=1.2;assert.throws(()=>{const restore=f.world.applyCamera(f.r);try{throw Error('original draw failure');}finally{restore();}},/original draw failure/);for(const k of ['zoom','center','yaw','cameraPitch'])assert.equal(f.r[k],f.base[k]);const late=f.world.applyCamera(f.r);f.world.clear();for(const k of ['zoom','center','yaw','cameraPitch'])assert.equal(f.r[k],f.base[k]);f.r.center=[100,200];late();assert.deepEqual(f.r.center,[100,200]);}finally{f.close();}});
test('close Cut camera never overwrites a foreign camera field and its old finalizer cannot release a new lease',async()=>{const f=await fixture();try{f.world.active.elapsed=1.2;const old=f.world.applyCamera(f.r),foreign=[100,200];f.r.center=foreign;old();assert.equal(f.r.center,foreign);f.r.center=f.base.center;const next=f.world.applyCamera(f.r),owned=f.r.center;old();assert.equal(f.r.center,owned);next();assert.equal(f.r.center,f.base.center);}finally{f.close();}});
test('close Cut camera is neutral at action boundaries and releases on scene replacement/dispose',async()=>{const f=await fixture();try{for(const t of [0,1]){f.world.active.elapsed=2.4*t;const restore=f.world.applyCamera(f.r);assert.equal(f.r.zoom,f.base.zoom);assert.equal(f.r.yaw,0);assert.equal(f.r.center,f.base.center);restore();}f.world.active.elapsed=1.2;let restore=f.world.applyCamera(f.r);f.world.dispose(f.r);assert.equal(f.r.center,f.base.center);restore();restore=f.world.applyCamera(f.r);f.c.NativeStory.state.zone=7;f.world.tick(.01);assert.equal(f.world.active,null);for(const k of ['zoom','center','yaw','cameraPitch'])assert.equal(f.r[k],f.base[k]);restore();}finally{f.close();}});// The original Game calls Journey.step -> HM.tick before renderer.draw/present.
// Preserve all six prior cases; this seventh exercises that missing first-frame order.
test('first positive native tick before first present still latches the unmodified real actor group',async()=>{const f=await fixture({firstTick:true});try{assert(f.firstElapsed>0,'Fixture must not supply the nonexistent initial0 draw');let frames=0,witnessed=false;while(!witnessed&&frames++<100){for(const dt of f.c.GameSpeed.steps(1/60))f.world.tick(dt);f.calls.length=0;const restore=f.world.applyCamera(f.r);try{const out=f.world.present(f.r,frames/60,f.actors());if(f.world.active.elapsed/f.world.active.duration>=.30){const density=sourceCellMinSingularValue(f,out);assert(density>=1,'First-positive-frame path has no close camera: '+density);assert.equal(f.r.yaw,Math.PI/6);checkBounds(f,out);witnessed=true;}f.world.rendered(f.r);}finally{restore();}}assert(witnessed,'Original tick/present/ACK sequence never reached preparation');assert.deepEqual([f.hero.x,f.hero.z,f.tree.x,f.tree.z],[7.5,11.5,7.5,10.5]);}finally{f.close();}});
// Real chapter040 scene shape: original data + the exact bootstrap additions,
// with NO fabricated .zone property. A same-native-zone replacement is foreign.
test('actual Dreamyard scene without zone activates framing and same-zone object replacement releases it',async()=>{const text=fs.readFileSync(path.join(repo,'src/striaton-assets.js'),'utf8'),data=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,'')),scene={...data.scenes[152],chapter040:true,outdoor:true};assert.equal(Object.prototype.hasOwnProperty.call(scene,'zone'),false);const f=await fixture({firstTick:true,sceneDescriptor:scene});try{let frames=0,witnessed=false;while(!witnessed&&frames++<100){for(const dt of f.c.GameSpeed.steps(1/60))f.world.tick(dt);f.calls.length=0;const restore=f.world.applyCamera(f.r);try{const out=f.world.present(f.r,frames/60,f.actors());if(f.world.active.elapsed/f.world.active.duration>=.30){const density=sourceCellMinSingularValue(f,out);assert(density>=1,'Real no-zone scene was rejected by camera: '+density);assert.equal(f.r.yaw,Math.PI/6);checkBounds(f,out);witnessed=true;}f.world.rendered(f.r);}finally{restore();}}assert(witnessed);const oldRestore=f.world.applyCamera(f.r);assert.equal(f.r.yaw,Math.PI/6);f.r.scene={...scene};assert.notEqual(f.r.scene,scene);assert.equal(f.c.NativeStory.state.zone,152);const replacementRestore=f.world.applyCamera(f.r);assert.equal(f.r.zoom,f.base.zoom);assert.equal(f.r.yaw,f.base.yaw);assert.equal(f.r.center,f.base.center);oldRestore();replacementRestore();assert.equal(f.r.center,f.base.center);}finally{f.close();}});

// Native-front candidate only. CPU matrices do NOT prove an alpha aperture or LOS.
test('native front Cut keeps its original basis from the first positive tick through original ACK completion',async()=>{
 const f=await fixture({direction:1,heroZ:9.5,firstTick:true});
 try{
  assert(f.firstElapsed>0,'The first real tick must precede the first present');
  assert(f.firstCamera.samePitchReference,'Front must never enter62 before the camera plan latches');
  assert.equal(f.firstCamera.yaw,0);assert.deepEqual(f.firstCamera.pitch,f.base.cameraPitch);
  let frames=0,preparation=false,contact=false,returning=false,completed=false;
  f.task.finished.then(()=>{completed=true;});
  while(f.world.active&&!f.world.active.done&&frames++<400){
   for(const dt of f.c.GameSpeed.steps(1/60))f.world.tick(dt);
   if(!f.world.active)break;
   const progress=f.world.active.elapsed/f.world.active.duration;
   assert.equal(f.world.cameraFor(f.base.cameraPitch),f.base.cameraPitch,'Native front pitch handoff changed the source base reference');
   const restore=f.world.applyCamera(f.r);
   try{
    assert.equal(f.r.cameraPitch,f.base.cameraPitch);assert.equal(f.r.yaw,0);
    f.calls.length=0;const out=f.world.present(f.r,frames/60,f.actors()),body=out.find(a=>a.fieldHM);
    assert(body,'Original front body is required before completion');assert.equal(body.groundHeight,0);
    assert.deepEqual([f.hero.x,f.hero.z,f.tree.x,f.tree.z],[7.5,9.5,7.5,10.5]);
    if(progress>=.30&&progress<=.61){
     assert(sourceCellMinSingularValue(f,out)>=1,'Native front source detail below1 CSSpx/nativepx');checkBounds(f,out);
     const draw=f.calls.find(row=>row.im.naturalWidth===448&&row.args.length===8),cell=draw.args[0]/56+8*draw.args[1]/56;
     assert(cell>=0&&cell<71,'Front switched to authored back cells');
     if(progress<.52)preparation=true;else contact=true;
    }
    if(progress>=.90)returning=true;
    await Promise.resolve();assert(!completed,'Original completion was released before its rendered ACK');
    f.world.rendered(f.r);
   }finally{restore();}
   for(const key of ['zoom','center','yaw','cameraPitch'])assert.equal(f.r[key],f.base[key],'Front failed to restore '+key);
  }
  assert(frames<400&&preparation&&contact&&returning,'Original tick/present/ACK flow omitted a required phase');
  await f.task.finished;assert.equal(f.world.active,null);assert(completed);
  assert.equal(f.world.cameraFor(f.base.cameraPitch),f.base.cameraPitch);
 }finally{f.close();}
});
test('native front exception leaves evolved Cut, another zone, west/east and back camera contracts intact',async()=>{
 for(const options of [{direction:1,graphic:502},{direction:1,zone:7},{direction:2},{direction:3},{direction:0}]){
  const f=await fixture(options);
  try{
   f.world.active.elapsed=1.2;const restore=f.world.applyCamera(f.r);
   try{
    assert(Math.abs(Math.atan2(...f.r.cameraPitch)-62*Math.PI/180)<1e-10,'Out-of-scope Cut lost its existing raised view');
    if(options.direction===0){assert.equal(f.r.yaw,Math.PI/6);assert.notEqual(f.r.center,f.base.center);}
    else{assert.equal(f.r.yaw,0);assert.equal(f.r.zoom,f.base.zoom);assert.equal(f.r.center,f.base.center);}
   }finally{restore();}
   for(const key of ['zoom','center','yaw','cameraPitch'])assert.equal(f.r[key],f.base[key]);
  }finally{f.close();}
 }
});

// Dedicated target transparency: synthetic CPU fixtures, never raster/art approval.
test('only the exact front Cut target render actor fades, without changing its native source or commit/cancel',async()=>{
 let commits=0;const f=await fixture({direction:1,heroZ:9.5,onContact(){commits++;}});
 try{
  const source=f.tree.source,sourceBefore=JSON.stringify(source),input={...f.tree},inputBefore=Object.keys(input).slice();
  f.world.active.elapsed=.30*2.4;const owner=f.world.active,restore=f.world.applyCamera(f.r);let faded;
  try{const out=f.world.present(f.r,.3,[input,{...f.hero}]);faded=out.find(a=>a.source===source);assert.notEqual(faded,input);assert.equal(faded.source,source);assert.equal(faded.fieldHMCutForeground064.ownerRef,owner);assert.equal(faded.fieldHMCutForeground064.treeSourceRef,source);assert.equal(faded.fieldHMCutForeground064.alpha,.38);assert(!faded.fieldHM);assert.equal(input.fieldHMCutForeground064,undefined);assert.deepEqual(Object.keys(input),inputBefore);assert.equal(JSON.stringify(source),sourceBefore);f.world.rendered(f.r);}finally{restore();}
  const foreign={...input,source:{...source}},restoreForeign=f.world.applyCamera(f.r);try{const out=f.world.present(f.r,.3,[foreign,{...f.hero}]);assert.equal(out.find(a=>a.source===foreign.source),foreign,'Another source reference must not acquire the captured target capability');}finally{restoreForeign();}
  let frames=0;while(f.world.active&&!f.world.active.committed&&frames++<200){f.world.tick(.04);const end=f.world.applyCamera(f.r);try{const out=f.world.present(f.r,frames/25,f.actors());if(f.world.active.committed)assert(!out.find(a=>a.source===source)?.fieldHMCutForeground064,'Native commit must end the foreground capability');f.world.rendered(f.r);}finally{end();}}
  assert.equal(commits,1);assert(f.world.active.committed);assert.equal(JSON.stringify(source),sourceBefore,'Native/save source was mutated by presentation');
  f.world.clear();await assert.rejects(f.task.finished,/annullata/);assert.equal(f.world.active,null);assert.equal(JSON.stringify(source),sourceBefore);
 }finally{f.close();}
 for(const options of [{direction:0},{direction:1,graphic:502},{direction:1,zone:7}]){const x=await fixture(options);try{x.world.active.elapsed=.30*2.4;const restore=x.world.applyCamera(x.r);try{const out=x.world.present(x.r,.3,x.actors());assert(!out.some(a=>a.fieldHMCutForeground064),'Out-of-scope target faded');}finally{restore();}}finally{x.close();}}
});
test('real World.draw defers only the owned target once, preserves ordinary calls and restores depth/camera on target failure',async()=>{
 const f=await fixture({direction:1,heroZ:9.5});
 try{
  // Execute the real class method with a declared GL-command fixture, no GPU or constructor.
  const text=fs.readFileSync(path.join(repo,'src/world3d.js'),'utf8'),draw=vm.runInContext('(function(){'+text+';return VillageRenderer.prototype.draw;})()',f.c,{filename:'world3d.js'});
  const r=f.r,rows=[],states=[],treeTex={},heroTex={},otherTex={},owner=f.world.active;let depthWrites=true,depthFunction='LEQUAL',throwTarget=null,acks=0,lastActors;
  const gl=new Proxy({isContextLost:()=>false,isTexture:()=>true,depthMask(value){depthWrites=value;states.push(value);},depthFunc(value){depthFunction=value;},getAttribLocation:()=>0},{get:(target,key)=>key in target?target[key]:typeof key==='string'&&key===key.toUpperCase()?key:()=>{}});
  Object.assign(r,{gl,ready:true,canvas:{width:390,height:844},images:{'Original108-0':treeTex,'Alcide-3':heroTex,'Original200-0':otherTex},cache:{},models:{},presented:new WeakSet(),attrs:[],loc:new Proxy({},{get:(_,key)=>key}),program:{},post:{},quad:{},target:{},framebuffer:{},shadow:{},hasResources:()=>true,resourcePlan:()=>({}),resize(){},indoor:()=>false,screen:()=>[0,0,1],spriteName:x=>x});r.scene.instances=[];
  const originalPresent=f.world.present,originalRendered=f.world.rendered;
  f.world.present=function(...args){lastActors=Reflect.apply(originalPresent,this,args);return lastActors;};f.world.rendered=function(...args){acks++;return Reflect.apply(originalRendered,this,args);};
  const ordinary={name:'Original200',x:9,z:8,height:0,frame:0,source:{model:200},opacity:.01};
  r.plane=function(...args){const row={args,argsLength:args.length,texture:args[5],flat:args[6],opacity:args[10]??1,depthWrites,depthFunction};rows.push(row);if(throwTarget&&row.texture===treeTex&&!row.flat&&args.length===11)throw throwTarget;};
  f.world.active.elapsed=.30*2.4;draw.call(r,.3,[{...f.tree},{...f.hero},ordinary]);
  const body=rows.filter(row=>!row.flat),treeRows=body.filter(row=>row.texture===treeTex),otherRows=body.filter(row=>row.texture===otherTex),silhouette=body.find(row=>row.texture===heroTex&&row.depthFunction==='GREATER');
  assert.equal(treeRows.length,1,'Target must replace its old draw, not add another');assert.equal(treeRows[0].argsLength,11);assert.equal(treeRows[0].opacity,.38);assert.equal(treeRows[0].depthWrites,false);assert.equal(treeRows[0].depthFunction,'LEQUAL');const targetIndex=rows.indexOf(treeRows[0]),shadows=rows.filter(row=>row.flat),opaqueBodies=body.filter(row=>row!==treeRows[0]&&row.depthFunction==='LEQUAL');
  assert(shadows.length>0&&shadows.every(row=>rows.indexOf(row)<targetIndex),'Every original contact shadow must precede the one target cutaway');
  assert(opaqueBodies.length>0&&opaqueBodies.every(row=>rows.indexOf(row)>targetIndex&&row.depthWrites===true),'The one target cutaway must precede every opaque actor with depth writes restored');
  assert(silhouette&&rows.indexOf(silhouette)>Math.max(...opaqueBodies.map(row=>rows.indexOf(row))),'Original player silhouette must remain after all opaque actors');
  assert.equal(otherRows.length,1);assert.equal(otherRows[0].argsLength,10);assert.equal(otherRows[0].opacity,1,'Generic actor.opacity must remain ignored');assert.equal(otherRows[0].depthWrites,true);assert.deepEqual(otherRows[0].args.slice(0,5),[9,0,8,2,2]);assert.equal(acks,1);assert.equal(depthWrites,true);assert(r.presented.has(f.tree.source));
  const tagged=lastActors.find(a=>a.source===f.tree.source);assert.equal(tagged.fieldHMCutForeground064.ownerRef,owner);
  // Renderer admission subcases use a declared input passthrough, not a second
  // HM producer: otherwise the real producer would renew valid target metadata.
  const observePresent=f.world.present;f.world.present=(_renderer,_time,input)=>input;
  try{for(const bad of [{...tagged,source:{...f.tree.source}},JSON.parse(JSON.stringify(tagged)),{...tagged,fieldHMCutForeground064:{...tagged.fieldHMCutForeground064,alpha:NaN}},{...tagged,fieldHMCutForeground064:{...tagged.fieldHMCutForeground064,alpha:.37}},{...tagged,fieldHMCutForeground064:{...tagged.fieldHMCutForeground064,alpha:1.01}}]){
   rows.length=0;draw.call(r,.3,[bad,{...f.hero},ordinary]);assert.equal(rows.filter(row=>row.texture===treeTex&&!row.flat&&row.argsLength===11).length,0,'Foreign/JSON/invalid capability used the translucent pass');
  }}finally{f.world.present=observePresent;}
  rows.length=0;const sentinel=Error('owned target draw sentinel');throwTarget=sentinel;const beforeACK=acks;assert.throws(()=>draw.call(r,.3,[{...f.tree},{...f.hero},ordinary]),error=>error===sentinel);assert.equal(depthWrites,true,'Depth writes leaked off after the owned pass threw');assert.equal(acks,beforeACK,'Failed draw produced an original completion ACK');for(const key of ['zoom','center','yaw','cameraPitch'])assert.equal(r[key],f.base[key]);throwTarget=null;
  f.world.clear();rows.length=0;draw.call(r,.3,[tagged,{...f.hero},ordinary]);assert.equal(rows.filter(row=>row.texture===treeTex&&!row.flat&&row.argsLength===11).length,0,'Cancelled action capability survived');assert.equal(depthWrites,true);f.world.present=originalPresent;f.world.rendered=originalRendered;
 }finally{f.close();}
});
test('Oshawott Cut stages its unchanged atlas beside the unchanged hero on a legal ground lane',async()=>{
 for(const direction of [0,1]){const f=await fixture({direction,heroZ:direction===0?11.5:9.5,firstTick:true});try{
  const view=direction===0?'back':'front',meta=f.c.FieldHMOshawottCut.metadata,b=meta.bounds[view],sourceBefore=JSON.stringify(f.tree.source);
  for(const t of [.30,.52,.84]){f.world.active.elapsed=t*2.4;f.calls.length=0;const input=f.actors(),hero=input[1],heroBefore=JSON.stringify(hero),restore=f.world.applyCamera(f.r);try{
   const out=f.world.present(f.r,t,input),body=out.find(a=>a.fieldHM),draw=f.calls.find(row=>row.im.naturalWidth===448&&row.args.length===8);assert(body&&draw,'Actual authored atlas must draw');assert.equal(JSON.stringify(hero),heroBefore,'Staging moved the hero render actor');assert.equal(out.find(a=>a===hero),hero);assert.equal(JSON.stringify(f.tree.source),sourceBefore);
   assert(direction===0?body.groundX<f.hero.x:body.groundX>f.hero.x,'Pokemon did not leave the hero column on its original shell side');assert.equal(body.groundHeight,0);assert.equal(body.noShadow,false);assert.equal(f.r.groundHeight(body.groundX,body.groundZ),body.groundHeight);
   const d=draw.args,m=draw.m,bodyXs=[];for(const x of [meta.origin[0]+b[0],meta.origin[0]+b[2]])for(const y of [meta.origin[1]+b[1],meta.origin[1]+b[3]]){const u=d[4]+x*d[6]/meta.cell,v=d[5]+y*d[7]/meta.cell;bodyXs.push(screen(f.r,actorPoint(f.r,body,m[0]*u+m[2]*v+m[4],m[1]*u+m[3]*v+m[5]))[0]);}
   const heroXs=[];for(const x of [-1,1])for(const y of [0,2]){const [ps,pc]=f.r.cameraPitch,cs=Math.cos(f.r.yaw),sn=Math.sin(f.r.yaw),top=x===1&&y===2,z=-y*ps-(top ? .202*y : 0);heroXs.push(screen(f.r,[hero.x+x*cs+z*sn,hero.height+y*pc-(top ? .126*y : 0),hero.z-x*sn+z*cs])[0]);}
   assert(direction===0?Math.max(...bodyXs)<Math.min(...heroXs):Math.min(...bodyXs)>Math.max(...heroXs),'Actual projected authored body envelope still crosses the hero');checkBounds(f,out);
  }finally{restore();}assert.equal(f.r.center,f.base.center);assert.equal(f.r.cameraPitch,f.base.cameraPitch);}
 }finally{f.close();}}
});
test('Oshawott lateral staging refuses blocked, occupied or unequal-floor lanes before native tree commit',async()=>{
 for(const obstacle of ['permission','actor','floor']){let commits=0;const f=await fixture({onContact(){commits++;},...(obstacle==='permission'?{blockedAt:x=>x<7}:obstacle==='actor'?{occupiedAt:x=>x<7}:{floorAt:x=>x<7?1:0})});try{
  assert.equal(f.world.active,null,'An inadmissible lane continued the original action');await assert.rejects(f.task.finished,/corsia|laterale|Taglio/);assert.equal(commits,0);assert.equal(f.tree.source.hidden,undefined);assert.deepEqual([f.hero.x,f.hero.z],[7.5,11.5]);for(const key of ['center','cameraPitch','zoom','yaw'])assert.equal(f.r[key],f.base[key]);
 }finally{f.close();}}
});
})();
