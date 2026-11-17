const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/surf-field-motion.js'),'utf8'),c);
function setup({special=false,prepare=async()=>{},occupied=()=>false,presentation=null}={}){
 const n={zone:113,fieldHeight:7,bicycle:true},p={x:.5,y:.5},party=[{hp:0,pp:[{id:57,left:0}]}],samples=[],saves=[];
 const surface=(zone,x,y,h)=>{samples.push(h);const col=Math.floor(x);return {height:col>=2?6:7,flags:col>=1?2:0,behavior:special&&col===1?65:0};};
 const task=c.SurfFieldMotion.create({state:()=>n,hero:()=>p,surface,party:()=>party,direction:()=>3,prepare,occupied,presentation,save:()=>saves.push(JSON.parse(JSON.stringify({n,p})))});
 return {n,p,party,samples,saves,task};
}
for(const speed of [1,2,4])test('Surf enters and automatically lands with persistent native heights at x'+speed,async()=>{
 const {n,p,task,saves,samples}=setup();assert.ok(await task.start());assert.equal(n.bicycle,false);assert.equal(n.surf,true);assert.equal(task.busy,true);
 const before=p.x;task.tick(1/60);assert.equal(p.x,before,'Native wait precedes movement');
 for(let i=0;i<200&&task.busy;i++)task.tick(speed/60);assert.equal(p.x,1.5);assert.equal(n.fieldHeight,7);assert.equal(task.busy,false);assert.ok(saves.length>=2);assert.ok(samples.every(h=>h===7));
 assert.equal(task.tryLanding(-1,0),true);for(let i=0;i<200&&task.busy;i++)task.tick(speed/60);assert.equal(p.x,.5);assert.equal(n.surf,false);assert.equal(task.blocked(1.5,.5),true,'Water cannot be walked onto');
});
test('Surf move search excludes eggs but does not impose HP, PP or badge restrictions',async()=>{
 const {party,task,n}=setup();assert.equal(task.user(),0);assert.ok(await task.start());task.cancel();party[0].egg=true;assert.equal(task.user(),-1);assert.equal(await task.start(),false);assert.equal(n.surf,false);
});
test('native shore65 crosses two cells and probes the target near physical height',async()=>{
 const {task,n,p}=setup({special:true});assert.equal(task.coast().cells,2);assert.ok(await task.start());for(let i=0;i<200&&task.busy;i++)task.tick(1/60);assert.equal(p.x,2.5);assert.equal(n.fieldHeight,6);
});
test('an occupied shore or arrival never starts a transition',async()=>{
 const {task}=setup({special:true,occupied:x=>x===2.5});assert.equal(task.coast(),null);assert.equal(await task.start(),false);
});
test('cancelled or replaced resource preparation cannot mount in another scene',async()=>{
 let ready;const {task,n}=setup({prepare:()=>new Promise(resolve=>ready=resolve)}),pending=task.start();assert.equal(task.preparing,true);n.zone=115;task.cancel();ready();assert.equal(await pending,false);assert.equal(n.surf,undefined);assert.equal(task.busy,false);
});
test('saving halfway through a shoreline crossing resumes without jumping',async()=>{
 const original=setup();await original.task.start();for(let i=0;i<24;i++)original.task.tick(1/60);assert.ok(original.p.x>.5&&original.p.x<1.5);const copy=setup();Object.assign(copy.n,JSON.parse(JSON.stringify(original.n)));Object.assign(copy.p,original.p);assert.ok(copy.task.restore());assert.equal(copy.p.x,original.p.x);for(let i=0;i<100&&copy.task.busy;i++)copy.task.tick(1/60);assert.equal(copy.p.x,1.5);assert.equal(copy.n.surf,true);
});
test('a foreign-map or malformed shoreline task is rejected',async()=>{
 const {task,n}=setup();await task.start();n.surfMotion.travel=NaN;assert.equal(task.restore(),false);assert.equal(n.surfMotion,undefined);
});

test('Surf remembers the selected swimmer across a saved crossing and clears it on landing',async()=>{
 const a=setup();a.party.push({name:'Second swimmer',pp:[{id:57,left:0}]});
 assert.ok(await a.task.start(1));assert.equal(a.n.surfUserIndex,1);
 const b=setup();b.party.push(a.party[1]);Object.assign(b.n,JSON.parse(JSON.stringify(a.n)));assert.ok(b.task.restore());assert.equal(b.n.surfUserIndex,1);
 for(let i=0;i<100&&b.task.busy;i++)b.task.tick(1/60);
 assert.ok(b.task.tryLanding(-1,0));for(let i=0;i<100&&b.task.busy;i++)b.task.tick(1/60);
 assert.equal(b.n.surf,false);assert.equal(b.n.surfUserIndex,undefined);
});

test('a party replacement during resource preparation cannot silently change the swimmer',async()=>{
 let ready,prepared;const a=setup({prepare:mon=>{prepared=mon;return new Promise(resolve=>ready=resolve);}}),chosen=a.party[0],pending=a.task.start(0);
 assert.equal(prepared,chosen);a.party[0]={pp:[{id:57,left:0}]};ready();assert.equal(await pending,false);assert.notEqual(a.n.surf,true);assert.equal(a.n.surfUserIndex,undefined);
});

test('old mounted saves choose a swimmer without adding HP, PP or badge restrictions',()=>{
 const a=setup();a.p.x=1.5;a.n.surf=true;assert.ok(a.task.restore());assert.equal(a.n.surfUserIndex,0);
 a.n.surfUserIndex=99;assert.ok(a.task.restore());assert.equal(a.n.surfUserIndex,0);
 a.n.surf=false;a.task.restore();assert.equal(a.n.surfUserIndex,undefined);
});

test('shore landing keeps the swimmer through recall and resumes that visual phase after saving',async()=>{
 const a=setup();await a.task.start();while(a.task.busy)a.task.tick(1/60);a.task.tryLanding(-1,0);
 while(a.n.surfMotion.phase!=='recall')a.task.tick(1/60);
 assert.equal(a.p.x,.5);assert.equal(a.n.surf,true);assert.equal(a.n.surfUserIndex,0);a.task.tick(4/60);
 const b=setup();Object.assign(b.n,JSON.parse(JSON.stringify(a.n)));Object.assign(b.p,a.p);assert.ok(b.task.restore());assert.equal(b.n.surfMotion.phase,'recall');
 while(b.task.busy)b.task.tick(1/60);assert.equal(b.n.surf,false);assert.equal(b.n.surfUserIndex,undefined);assert.equal(b.p.x,.5);
});

test('a presentation budget retains both native terminal phases until their completed frame is confirmed',async()=>{
 let complete=false;const a=setup({presentation:(motion,dt)=>({dt,complete})});await a.task.start();
 for(let i=0;i<100;i++)a.task.tick(.1);assert.ok(a.n.surfMotion,'Boarding removed its native motion before the final frame was confirmed');assert.equal(a.n.surfMotion.phase,'move');assert.equal(a.n.surfMotion.travel,1);assert.equal(a.task.busy,true);assert.equal(a.p.x,1.5);const saves=a.saves.length;
 for(let i=0;i<20;i++)a.task.tick(.1);assert.equal(a.saves.length,saves,'Holding a final frame repeated native persistence');
 complete=true;a.task.tick(.1);assert.equal(a.n.surfMotion,undefined);assert.equal(a.n.surf,true);assert.equal(a.n.surfUserIndex,0);
 complete=false;assert.ok(a.task.tryLanding(-1,0));for(let i=0;i<100;i++)a.task.tick(.1);assert.equal(a.n.surfMotion.phase,'recall');assert.equal(a.n.surfMotion.wait,16);assert.equal(a.n.surf,true);assert.equal(a.n.surfUserIndex,0);
 complete=true;a.task.tick(.1);assert.equal(a.n.surfMotion,undefined);assert.equal(a.n.surf,false);assert.equal(a.n.surfUserIndex,undefined);assert.equal(a.p.x,.5);
});

test('a zero frame budget and invalid deltas cannot advance native shore physics or consume the caller time twice',async()=>{
 let allowed=0,calls=0;const a=setup({presentation:(motion,dt)=>{calls++;return {dt:allowed,complete:false};}});await a.task.start();const initial=JSON.stringify({n:a.n,p:a.p});
 for(const dt of [0,-1,NaN,Infinity,-Infinity])a.task.tick(dt);assert.equal(calls,0);assert.equal(JSON.stringify({n:a.n,p:a.p}),initial);
 for(let i=0;i<25;i++)a.task.tick(.04);assert.equal(a.n.surfMotion.wait,0);assert.equal(a.p.x,.5);
 allowed=100;a.task.tick(1/60);assert.equal(a.n.surfMotion.wait,1,'A presentation callback accelerated beyond the requested physics time');
 allowed=-1;assert.throws(()=>a.task.tick(.04),/Budget di presentazione/);assert.equal(a.n.surfMotion.wait,1);
});

test('render-gated native wait and travel endpoints close despite floating-point rounding',async()=>{
 const a=setup({presentation:(motion,dt)=>({dt,complete:false})});await a.task.start();a.n.surfMotion.wait=16-1e-10;a.task.tick(1e-14);assert.equal(a.n.surfMotion.wait,16);assert.equal(a.n.surfMotion.phase,'move');
 a.n.surfMotion.travel=1-1e-10;a.task.tick(1e-14);assert.equal(a.n.surfMotion.travel,1);assert.equal(a.p.x,1.5);assert.equal(a.n.surfMotion.phase,'move');assert.equal(a.task.busy,true);
});

function shoreProgress(r){return r.landing?(r.phase==='recall'?.7+.3*r.wait/16:.7*r.travel):(r.phase==='wait'?.2*r.wait/16:.2+.8*r.travel);}
async function renderedShore({id=501,special=false}={}){
 let host;const a=setup({special,presentation:(motion,dt)=>host.FieldHMWorld.surfBudget(motion,dt)});Object.assign(a.party[0],{id});
 const context=new Proxy({getImageData:()=>({data:new Uint8Array(4096)})},{get:(target,key)=>key in target?target[key]:()=>{}}),image={width:32,height:32};
 host={console,Promise,Map,WeakMap,document:{hidden:false,createElement:()=>({getContext:()=>context})},NativeStory:{state:a.n},Journey:{state:{party:a.party,original:a.n}},SurfField:{mounted:()=>a.task.mounted()},OPENING_SPRITES:{Alcide:Array(12).fill('hero')},SURF_FIELD_ASSETS:{sprites:{AlcideSurf:Array(12).fill('surf')}},RuntimeAssets:{image:async()=>image},ROM_SPRITE_ANIM:{prepare:async()=>{},pin:()=>()=>{},draw:()=>true,alphaBounds:()=>[0,0,32,32]}};host.window=host;vm.createContext(host);
 for(const file of ['pokemon-visuals.js','field-hm-cut-choreographies.js','field-hm-fly-choreographies.js','field-hm-surf-choreographies.js','field-hm-cut-anatomy.js','field-hm-fly-anatomy.js','field-hm-surf-anatomy.js','field-hm-choreography.js','field-hm-profiles.js','field-hm-world.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),host,{filename:file});
 await host.FieldHMWorld.prepare(a.party[0],57);
 const renderer={cameraPitch:[.423,.906],yaw:0,groundHeight:()=>a.n.fieldHeight,upload:()=>({texture:{}}),gl:{isContextLost:()=>false,isTexture:()=>true,bindTexture(){},texSubImage2D(){},deleteTexture(){}}},frames=[];host.renderer=renderer;let time=0;
 return {...a,host,renderer,frames,tick(dt){time+=dt;a.task.tick(dt);},draw({ack=true}={}){
  if(host.document.hidden||renderer.contextLost||renderer.gl.isContextLost())return;
  const motion=a.n.surfMotion,actors=host.FieldHMWorld.present(renderer,time,[{name:'AlcideSurf',hero:true,x:a.p.x,z:a.p.y,height:a.n.fieldHeight,frame:9}]);
  if(motion&&actors.some(actor=>actor.fieldHM))frames.push({motion,phase:motion.landing?'land':'board',progress:shoreProgress(motion)});
  if(ack)host.FieldHMWorld.rendered(renderer);
 }};
}
function finishShore(a,{speed=4,holdFinal=false}={}){
 let frames=0;while(a.task.busy&&frames++<300){let rest=.25*speed;while(rest>1e-8){const dt=Math.min(.04,rest);a.tick(dt);rest-=dt;}if(holdFinal&&a.n.surfMotion&&shoreProgress(a.n.surfMotion)>=1){a.draw({ack:false});return;}a.draw();}
 assert.equal(a.task.busy,false,'Drawable Surf did not finish within 300 acknowledged frames');
}

test('the production Surf frame budget preserves every native authored boarding and landing key at ×1/×2/×4',async()=>{
 const ids=[501,502,503,507,508,515,516,531,535,536,537,550,699,564,565,580,581,592,'592-female',593,'593-female',594,612,613,614,618,621,626,635];
 for(const speed of [1,2,4])for(const id of ids){
  const a=await renderedShore({id});try{assert.ok(await a.task.start());finishShore(a,{speed});assert.equal(a.n.surf,true);assert.ok(a.task.tryLanding(-1,0));finishShore(a,{speed});assert.equal(a.n.surf,false);assert.equal(a.p.x,.5);
   const profile=a.host.FieldHMProfiles.profile(a.party[0],57);for(const phase of ['board','land']){const actual=a.frames.filter(frame=>frame.phase===phase).map(frame=>frame.progress);for(const [key]of profile.choreography[phase])if(key>0)assert.ok(actual.some(value=>Math.abs(value-key)<1e-8),`${id}:${phase}:×${speed} skipped native authored key ${key}: ${actual.join(',')}`);for(let i=1;i<actual.length;i++){assert.ok(actual[i]+1e-9>=actual[i-1],'Surf progress rewound');assert.ok(actual[i]-actual[i-1]<=.080000001,'One draw skipped an entire Surf gesture interval');}}
  }finally{a.task.cancel();a.host.FieldHMWorld.clear();}
 }
});

test('Surf composition and lost-context frames cannot release a production shoreline checkpoint',async()=>{
 const a=await renderedShore();try{await a.task.start();for(let i=0;i<25;i++)a.tick(.04);const held=shoreProgress(a.n.surfMotion);a.draw({ack:false});for(let i=0;i<25;i++)a.tick(.04);assert.equal(shoreProgress(a.n.surfMotion),held,'Card composition acknowledged native movement');
  a.renderer.gl.isContextLost=()=>true;a.host.FieldHMWorld.rendered(a.renderer);for(let i=0;i<25;i++)a.tick(.04);assert.equal(shoreProgress(a.n.surfMotion),held,'A lost context acknowledged native movement');a.renderer.gl.isContextLost=()=>false;a.draw();finishShore(a);assert.equal(a.n.surf,true);
 }finally{a.task.cancel();a.host.FieldHMWorld.clear();}
});

test('a held final Surf frame survives storage roundtrip without serializing the compositor or replaying the crossing',async()=>{
 const a=await renderedShore();let b;try{await a.task.start();finishShore(a,{holdFinal:true});assert.equal(a.n.surfMotion.travel,1);assert.equal(a.task.busy,true);const snapshot=JSON.parse(JSON.stringify(a.n));assert.deepEqual(Object.keys(snapshot.surfMotion).sort(),['cells','direction','from','landing','phase','to','travel','wait','zone'].sort());
  b=await renderedShore();Object.assign(b.n,snapshot);Object.assign(b.p,a.p);assert.ok(b.task.restore());const position={...b.p};b.tick(.04);assert.equal(b.task.busy,true,'A restored final pose completed without a draw');assert.deepEqual(b.p,position);assert.equal(shoreProgress(b.n.surfMotion),1);b.draw();b.tick(.04);assert.equal(b.task.busy,false);assert.deepEqual(b.p,position);assert.equal(b.n.surfUserIndex,0);assert.equal(b.n.surf,true);
 }finally{a.task.cancel();a.host.FieldHMWorld.clear();if(b){b.task.cancel();b.host.FieldHMWorld.clear();}}
});

test('a completed frame from a cancelled Surf motion cannot release its replacement',async()=>{
 const a=await renderedShore();try{await a.task.start();finishShore(a,{holdFinal:true});const old=a.n.surfMotion;a.task.cancel();assert.ok(await a.task.start());assert.notEqual(a.n.surfMotion,old);for(let i=0;i<25;i++)a.tick(.04);const held=shoreProgress(a.n.surfMotion);a.host.FieldHMWorld.rendered(a.renderer);for(let i=0;i<25;i++)a.tick(.04);assert.equal(shoreProgress(a.n.surfMotion),held,'Stale shoreline frame acknowledged a replacement command');finishShore(a);assert.equal(a.n.surf,true);
 }finally{a.task.cancel();a.host.FieldHMWorld.clear();}
});
