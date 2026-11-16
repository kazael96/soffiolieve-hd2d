/* Controller/ownership tests. These do not certify world-rendered pixels. */
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function setup(){
 const calls={pins:0,releases:0},n={zone:152},party=[{id:501,name:'Oshawott',pp:[{id:57}]}];
 const image={width:32,height:32},context={drawImage(){},getImageData(){return {data:new Uint8Array(4096)};}};
 const c={console,Promise,Map,WeakMap,document:{hidden:false,createElement:()=>({getContext:()=>context})},NativeStory:{state:n},Journey:{state:{party,original:n}},OPENING_SPRITES:{Alcide:Array(12).fill('hero')},SURF_FIELD_ASSETS:{sprites:{AlcideSurf:Array(12).fill('surf')}},RuntimeAssets:{image:async()=>image},ROM_SPRITE_ANIM:{pin(){calls.pins++;return ()=>calls.releases++;},prepare:async()=>{},alphaBounds:()=>[0,0,32,32]}};
 c.window=c;vm.createContext(c);for(const f of ['pokemon-visuals.js','field-hm-profiles.js','field-hm-world.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',f),'utf8'),c,{filename:f});return {c,n,party,calls,world:c.FieldHMWorld};
}
async function flyFrame({height=7,yaw=0,direction=1,elapsed=1.94}={}){
 const a=setup(),{c,n,world}=a,draws=[],images=[];n.zone=28;n.fieldHeight=height;
 c.OPENING_SPRITES.Alcide=Array.from({length:12},(_,i)=>'hero-'+i);c.SURF_FIELD_ASSETS.sprites.AlcideSurf=Array.from({length:12},(_,i)=>'surf-'+i);c.RuntimeAssets.image=async src=>({width:32,height:32,src});
 let mirrored=false;const stack=[];const context=new Proxy({}, {get:(_,key)=>key==='getImageData'?(()=>({data:new Uint8Array(4096)})):key==='drawImage'?((...args)=>images.push({...args[0],mirrored})):key==='save'?(()=>stack.push(mirrored)):key==='restore'?(()=>{mirrored=stack.pop()??false;}):key==='scale'?((x)=>{if(x<0)mirrored=!mirrored;}):()=>{}});c.document.createElement=()=>({width:512,height:512,getContext:()=>context});
 c.ROM_SPRITE_ANIM.draw=(...args)=>{draws.push(Object.assign(args,{mirrored}));return true;};c.SpeciesMoves={select:()=>({frames:10}),sample:()=>({})};
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/native-rails.js'),'utf8'),c);
 const renderer={scene:{zone:28},cameraPitch:[0,1],yaw,groundHeight:()=>7,upload:()=>({texture:{},w:512,h:512}),gl:{isTexture:()=>true,bindTexture(){},texSubImage2D(){}}};
 const task=await world.start({id:519},19,{phase:elapsed>1.5?'arrive':'depart',duration:2,direction,height:7});world.active.elapsed=elapsed;
 const actors=world.present(renderer,.5,[{name:'Alcide',hero:true,x:1,z:2,height:7.04,frame:3}]);world.tick(3);await task.finished;world.clear();return {actors,draws,images};
}
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
