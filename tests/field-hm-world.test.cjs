/* Controller/ownership tests. These do not certify world-rendered pixels. */
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function setup(){
 const calls={pins:0,releases:0},n={zone:152},party=[{id:501,name:'Oshawott',pp:[{id:57}]}];
 const image={width:32,height:32},context={drawImage(){},getImageData(){return {data:new Uint8Array(4096)};}};
 const c={console,Promise,Map,WeakMap,document:{hidden:false,createElement:()=>({getContext:()=>context})},NativeStory:{state:n},Journey:{state:{party,original:n}},OPENING_SPRITES:{Alcide:Array(12).fill('hero')},SURF_FIELD_ASSETS:{sprites:{AlcideSurf:Array(12).fill('surf')}},RuntimeAssets:{image:async()=>image},ROM_SPRITE_ANIM:{pin(){calls.pins++;return ()=>calls.releases++;},prepare:async()=>{},alphaBounds:()=>[0,0,32,32]}};
 c.window=c;vm.createContext(c);for(const f of ['pokemon-visuals.js','field-hm-cut-choreographies.js','field-hm-fly-choreographies.js','field-hm-surf-choreographies.js','field-hm-cut-anatomy.js','field-hm-fly-anatomy.js','field-hm-surf-anatomy.js','field-hm-choreography.js','field-hm-profiles.js','field-hm-world.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',f),'utf8'),c,{filename:f});return {c,n,party,calls,world:c.FieldHMWorld};
}
async function flyFrame({height=7,yaw=0,direction=1,elapsed=1.94,graphic=519,pitch=[0,1]}={}){
 const a=setup(),{c,n,world}=a,draws=[],images=[];n.zone=28;n.fieldHeight=height;
 c.OPENING_SPRITES.Alcide=Array.from({length:12},(_,i)=>'hero-'+i);c.SURF_FIELD_ASSETS.sprites.AlcideSurf=Array.from({length:12},(_,i)=>'surf-'+i);c.RuntimeAssets.image=async src=>({width:32,height:32,src});
 let mirrored=false;const stack=[];const context=new Proxy({}, {get:(_,key)=>key==='getImageData'?(()=>({data:new Uint8Array(4096)})):key==='drawImage'?((...args)=>images.push({...args[0],mirrored,drawArgs:args.slice(1)})):key==='save'?(()=>stack.push(mirrored)):key==='restore'?(()=>{mirrored=stack.pop()??false;}):key==='scale'?((x)=>{if(x<0)mirrored=!mirrored;}):()=>{}});c.document.createElement=()=>({width:512,height:512,getContext:()=>context});
 c.ROM_SPRITE_ANIM.draw=(...args)=>{draws.push(Object.assign(args,{mirrored}));return true;};c.SpeciesMoves={select:()=>({frames:10}),sample:()=>({})};
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/native-rails.js'),'utf8'),c);
 const renderer={scene:{zone:28},cameraPitch:pitch,yaw,groundHeight:()=>7,upload:()=>({texture:{},w:512,h:512}),gl:{isTexture:()=>true,bindTexture(){},texSubImage2D(){}}};
 const task=await world.start({id:graphic},19,{phase:elapsed>1.5?'arrive':'depart',duration:2,direction,height:7});world.active.elapsed=elapsed;
 const actors=world.present(renderer,.5,[{name:'Alcide',hero:true,x:1,z:2,height:7.04,frame:3}]);world.tick(3);await task.finished;world.clear();return {actors,draws,images};
}
test('the standing rider reaches the exact composite seat before Fly attaches it, including lean, squash and camera pitch',async()=>{
 const pitch=[Math.sin(.44),Math.cos(.44)],yaw=.6,epsilon=1e-8;
 for(const graphic of [519,567,623,635])for(const direction of [0,1,2,3]){
  const before=await flyFrame({graphic,direction,pitch,yaw,elapsed:2*(.35-epsilon)}),after=await flyFrame({graphic,direction,pitch,yaw,elapsed:2*(.35+epsilon)}),hero=before.actors.find(a=>!a.fieldHM&&a.hero),card=after.actors.find(a=>a.fieldHM),image=after.images.filter(i=>i.drawArgs.length===8).at(-1);assert.ok(hero&&card&&image);
  const d=image.drawArgs,sx=(d[4]+d[6]/2-256)/64,sy=(384-d[5]-d[7])/64,base={x:card.x-2*pitch[0]*Math.sin(yaw),z:card.z-2*pitch[0]*Math.cos(yaw),height:card.height+2*pitch[1]},seat={x:base.x+sx*Math.cos(yaw)-sy*pitch[0]*Math.sin(yaw),z:base.z-sx*Math.sin(yaw)-sy*pitch[0]*Math.cos(yaw),height:base.height+sy*pitch[1]};
  assert.ok(Math.hypot(hero.x-seat.x,hero.z-seat.z,hero.height-seat.height)<1e-5,`Fly attachment jumps at ${graphic}/${direction}: hero=${JSON.stringify(hero)} seat=${JSON.stringify(seat)}`);
 }
});
test('rider visibility diagnostics preserve the live backend and allocate no mask during ordinary frames',async()=>{
 const {c,world}=setup(),contexts=[];let reads=0,uploads=0;
 c.document.createElement=()=>{const canvas={width:0,height:0};const context=new Proxy({},{get:(_,key)=>key==='getImageData'?(()=>{reads++;return {data:new Uint8Array(canvas.width*canvas.height*4)};}):()=>{}});canvas.getContext=(kind,options)=>{contexts.push({canvas,kind,options});return context;};return canvas;};
 c.ROM_SPRITE_ANIM.draw=()=>true;const renderer={cameraPitch:[.423,.906],gl:{isTexture:()=>true,bindTexture(){},texSubImage2D(){}},upload:()=>{uploads++;return {texture:{}};}},task=await world.start({id:519},19,{duration:2});world.active.elapsed=.8;
 const actors=()=>[{name:'Alcide',hero:true,x:0,z:0,height:.04,frame:3}],before=reads;world.present(renderer,0,actors());assert.equal(reads,before,'Ordinary paint read pixels');
 const first=contexts.filter(r=>r.canvas.width===512&&r.canvas.height===512);assert.equal(first.length,1,'Ordinary paint allocated a rider mask');assert.equal(first[0].options,undefined,'QA must not move ordinary card rendering onto a different backend');world.inspectCard(renderer);
 const inspected=contexts.filter(r=>r.canvas.width===512&&r.canvas.height===512);assert.equal(inspected.length,2);assert.equal(inspected[1].options.willReadFrequently,true,'Only the diagnostic mask requests readback-oriented rasterization');
 world.inspectCard(renderer);assert.equal(contexts.filter(r=>r.canvas.width===512&&r.canvas.height===512).length,2,'Rider mask was not reused');const afterInspect=reads;world.present(renderer,0,actors());assert.equal(reads,afterInspect,'Ordinary paint read the retained QA mask');assert.equal(uploads,1);world.tick(3);await task.finished;world.clear();
});
test('rider RGB diagnostics tolerate one raster pixel while retaining exact counts and detecting a concealed upper body',async()=>{
 for(const concealed of [false,true]){
  const {c,world}=setup(),expected=new Uint8Array(512*512*4),actual=new Uint8Array(512*512*4);let cardContexts=0;
  for(let x=250;x<254;x++){const rgba=[40+(x-250)*10,80+(x-250)*15,120+(x-250)*20,255];expected.set(rgba,(250*512+x)*4);if(!concealed)actual.set(rgba,(250*512+x+1)*4);}expected.set([255,255,255,249],(250*512+270)*4);
  c.document.createElement=()=>{const canvas={width:0,height:0};let mask=false;const context=new Proxy({},{get:(_,key)=>key==='getImageData'?(()=>({data:canvas.width===512?(mask?expected:actual):new Uint8Array(4096)})):()=>{}});canvas.getContext=()=>{if(canvas.width===512)mask=++cardContexts>1;return context;};return canvas;};c.ROM_SPRITE_ANIM.draw=()=>true;
  const renderer={cameraPitch:[.423,.906],gl:{isTexture:()=>true,bindTexture(){},texSubImage2D(){}},upload:()=>({texture:{}})},task=await world.start({id:519},19,{duration:2});world.active.elapsed=.8;world.present(renderer,0,[{name:'Alcide',hero:true,x:0,z:0,height:.04,frame:3}]);const measured=world.inspectCard(renderer);
  assert.equal(measured.riderUpperPixels,4,'Antialiased alpha249 must not enter the denominator');assert.equal(measured.riderUpperExactVisible,0);assert.equal(measured.riderUpperExactVisibleFraction,0);assert.equal(measured.riderRasterTolerancePx,1);assert.equal(measured.riderUpperVisible,concealed?0:4);assert.equal(measured.riderUpperVisibleFraction,concealed?0:1);world.tick(3);await task.finished;world.clear();
 }
});
test('entering a native Surf landing retains the previous swimming joint pose before blending to the landing score',async()=>{
 const {c,n,world}=setup(),ctx=new Proxy({},{get:(_,key)=>key==='getImageData'?(()=>({data:new Uint8Array(4096)})):()=>{}});c.document.createElement=()=>({getContext:()=>ctx});const poses=[];c.ROM_SPRITE_ANIM.draw=(...args)=>{poses.push(args.at(-1));return true;};c.SurfField={mounted:()=>true};c.moving=true;n.surf=true;n.surfUserIndex=0;n.fieldHeight=0;
 const renderer={cameraPitch:[.423,.906],yaw:0,gl:{isContextLost:()=>false,isTexture:()=>true,bindTexture(){},texSubImage2D(){}},upload:()=>({texture:{}})},actors=()=>[{name:'AlcideSurf',hero:true,x:1,z:2,height:0,frame:3}];await world.prepare(c.Journey.state.party[0],57);world.present(renderer,0,actors());const time=.26/2.4;world.present(renderer,time,actors());const before=poses.at(-1);assert.ok(Math.abs(before.arms)>.8);
 n.surfMotion={landing:true,phase:'move',from:{x:1,y:2,height:0},to:{x:1,y:1,height:0},travel:0,direction:1,wait:0};world.present(renderer,time,actors());const after=poses.at(-1);for(const key of ['arms','head','lean','feet','tail','crouch'])assert.ok(Math.abs(before[key]-after[key])<1e-9,'Landing snapped '+key);world.clear();
});

test('Surf mounting and dismounting share the exact visible composite seat in all four directions',async()=>{
 for(const graphic of [501,503,508,635])for(const direction of [0,1,2,3])for(const landing of [false,true]){
  const {c,n,world}=setup(),images=[],pitch=[Math.sin(.44),Math.cos(.44)],yaw=-.6,context=new Proxy({},{get:(_,key)=>key==='getImageData'?(()=>({data:new Uint8Array(4096)})):key==='drawImage'?((...args)=>{if(args.length===9)images.push(args.slice(1));}):()=>{}});c.document.createElement=()=>({getContext:()=>context});c.ROM_SPRITE_ANIM.draw=()=>true;c.SurfField={mounted:()=>true};c.moving=true;Object.assign(c.Journey.state.party[0],{id:graphic,name:({501:'Oshawott',503:'Samurott',508:'Stoutland',635:'Hydreigon'})[graphic]});n.surf=true;n.surfUserIndex=0;n.fieldHeight=3.2;
  const renderer={cameraPitch:pitch,yaw,gl:{isContextLost:()=>false,isTexture:()=>true,bindTexture(){},texSubImage2D(){}},upload:()=>({texture:{}})},actors=()=>[{name:'AlcideSurf',hero:true,x:1,z:2,height:3.2,frame:direction*3}];await world.prepare(c.Journey.state.party[0],57);let riderCard,standing,time=0;
  if(landing){world.present(renderer,0,actors());time=.26/c.FieldHMProfiles.profile(c.Journey.state.party[0],57).cadence;riderCard=world.present(renderer,time,actors()).find(a=>a.fieldHM);n.surfMotion={landing:true,phase:'move',from:{x:1,y:2,height:3.2},to:{x:1,y:1,height:3.2},travel:0,direction,wait:0};standing=world.present(renderer,time,actors()).find(a=>!a.fieldHM&&a.hero);}
  else{n.surfMotion={landing:false,phase:'move',from:{x:1,y:1,height:3.2},to:{x:1,y:2,height:3.2},travel:1-1e-9,direction,wait:0};standing=world.present(renderer,0,actors()).find(a=>!a.fieldHM&&a.hero);delete n.surfMotion;riderCard=world.present(renderer,0,actors()).find(a=>a.fieldHM);}
  const d=images.at(-1),sx=(d[4]+d[6]/2-256)/64,sy=(384-d[5]-d[7])/64,base={x:riderCard.x-2*pitch[0]*Math.sin(yaw),z:riderCard.z-2*pitch[0]*Math.cos(yaw),height:riderCard.height+2*pitch[1]},seat={x:base.x+sx*Math.cos(yaw)-sy*pitch[0]*Math.sin(yaw),z:base.z-sx*Math.sin(yaw)-sy*pitch[0]*Math.cos(yaw),height:base.height+sy*pitch[1]};assert.ok(Math.hypot(standing.x-seat.x,standing.z-seat.z,standing.height-seat.height)<1e-6,`Surf seat discontinuity ${graphic}/${direction}/${landing}`);world.clear();
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
 const {world}=setup(),base=[Math.sin(.44),Math.cos(.44)],renderer={cameraPitch:base,zoom:1.8};const task=await world.start({id:501},15,{duration:2});
 assert.ok(Math.abs(Math.atan2(...world.cameraFor(base))-.44)<1e-10);world.tick(.6);
 for(let i=0;i<5;i++){const restore=world.applyCamera(renderer);assert.ok(Math.abs(Math.atan2(...renderer.cameraPitch)-62*Math.PI/180)<1e-10);restore();assert.equal(renderer.cameraPitch,base);assert.equal(renderer.zoom,1.8);}
 world.tick(1.4);await task.finished;assert.equal(world.cameraFor(base),base);
 const steep=[Math.sin(1.2),Math.cos(1.2)],other=await world.start({id:501},15,{duration:2});world.tick(.6);assert.ok(Math.abs(Math.atan2(...world.cameraFor(steep))-1.2)<1e-10);world.tick(2);await other.finished;
});
test('Cut commits once at contact; a hidden tab advances neither pose nor native tree flag',async()=>{
 const {world,c}=setup();let commits=0;const task=await world.start({id:501},15,{onContact:()=>commits++,duration:2});world.tick(.9);assert.equal(commits,0);
 c.document.hidden=true;world.tick(20);assert.equal(commits,0);assert.equal(world.active.elapsed,.9);
 c.document.hidden=false;world.tick(.2);assert.equal(commits,1);world.tick(20);await task.finished;assert.equal(commits,1);assert.equal(world.active,null);
});
test('Fly holds its fully departed pose across a covered transfer and runs a separate arrival',async()=>{
 const {world,n}=setup(),mon={id:519};const departure=await world.start(mon,19,{phase:'depart',duration:1,transfer:true,retain:true});world.tick(1);await departure.finished;assert.equal(world.active.done,true);
 n.zone=16;world.tick(2);assert.equal(world.active.phase,'depart');const arrival=await world.start(mon,19,{phase:'arrive',duration:1,transfer:true});world.tick(1);await arrival.finished;assert.equal(world.active,null);
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
test('a superseded asynchronous bank cannot replace the newer selected species',async()=>{
 const {world,c,calls}=setup();let resolve;c.ROM_SPRITE_ANIM.prepare=([p])=>p.id===501||p==='501-front'?new Promise(r=>resolve=r):Promise.resolve();const old=world.prepare({id:501},57);await world.prepare({id:519},19);resolve();await assert.rejects(old,/sostituita/);assert.equal(world.retained.banks,1);assert.equal(calls.pins-calls.releases,1);world.clear();assert.equal(calls.pins,calls.releases);
});

test('Surf swimmers immerse their lower body while keeping the rider support above water',()=>{
 const {c}=setup();for(const p of c.FieldHMProfiles.profiles.values()){if(p.move!==57)continue;const s=c.FieldHMProfiles.sample(p,0);if(p.kind==='levitateSwim'){assert.ok(s.bob>0);continue;}assert.ok(s.bob<-.1,`${p.graphic} is standing on the water instead of swimming`);assert.ok(s.seat+s.bob>.25,`${p.graphic} rider support is submerged`);}
});

test('context loss before its DOM event cannot turn a field card upload into a fatal render error',async()=>{
 const {world}=setup();const task=await world.start({id:519},19,{duration:2});const actors=[{name:'Alcide',hero:true,x:1,z:2,height:0,frame:3}],renderer={gl:{isContextLost:()=>true},upload(){throw Error('Contesto grafico interrotto');}};assert.equal(world.present(renderer,0,actors),actors,'Keep the owned action while the renderer restores its context');assert.ok(world.active);world.tick(2);await task.finished;
});

test('Surf keeps the last visible species during evolution loading and swaps atomically on the same GPU card',async()=>{
 const {c,n,party,calls,world}=setup(),ctx=new Proxy({},{get:(_,key)=>key==='getImageData'?(()=>({data:new Uint8Array(4096)})):()=>{}});c.document.createElement=()=>({getContext:()=>ctx});c.SpeciesMoves={select:()=>({frames:10}),sample:()=>({})};const graphics=[];c.ROM_SPRITE_ANIM.draw=(_ctx,g)=>{graphics.push(g);return true;};n.surf=true;n.surfUserIndex=0;c.SurfField={mounted:()=>true};let uploads=0;const renderer={cameraPitch:[0,1],gl:{isContextLost:()=>false,isTexture:()=>true,bindTexture(){},texSubImage2D(){},deleteTexture(){}},upload:()=>{uploads++;return {texture:{}};}};
 await world.prepare(party[0],57);party[0].id=502;party[0].name='Dewott';let resume;c.ROM_SPRITE_ANIM.prepare=()=>new Promise(resolve=>resume=resolve);const pending=world.prepare(party[0],57),actors=[{name:'AlcideSurf',hero:true,x:1,z:2,height:0,frame:3}];const old=world.present(renderer,0,actors).find(a=>a.fieldHM);assert.ok(old,'The swimmer must remain visible while the evolved bank loads');assert.equal(graphics.at(-1),501);assert.equal(world.surfReady(),false);assert.equal(world.surfRenderable(),true);
 resume();await pending;const next=world.present(renderer,0,actors).find(a=>a.fieldHM);assert.equal(graphics.at(-1),502);assert.equal(next.texture,old.texture);assert.equal(uploads,1);assert.equal(calls.releases,1);world.clear();world.dispose(renderer);assert.equal(calls.pins,calls.releases);
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
 const c=exclusiveSetup(),site=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../../fidelity-build-054-field-candidate-08'),done=new Set();
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
