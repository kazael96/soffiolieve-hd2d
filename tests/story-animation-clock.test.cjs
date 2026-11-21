const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=path.resolve(__dirname,'../src');
function environment(kind='effects',rate=1){
 let next=0,time=0,hidden=false,destroyed=0;const queue=new Map(),listeners=new Map(),panels=new Set(),frames=[];
 const document={get hidden(){return hidden;},body:{append(p){panels.add(p);}},addEventListener(name,fn){listeners.set(name,fn);},removeEventListener(name,fn){if(listeners.get(name)===fn)listeners.delete(name);},createElement(){return {dataset:{},style:{},setAttribute(){},append(){},remove(){panels.delete(this);},getContext(){return {clearRect(){}};}};}};
 class Scene {constructor(canvas,assets){this.ready=Promise.resolve();this.models={bridge:{animations:[{times:[0,12]}]},wheel:{animations:[{times:[0,12]}]}};}draw(name,frame){frames.push(frame);}destroy(){destroyed++;}}
 const c={console,document,Math,Promise,GameSpeed:{rate},ParticleSPL:{clear(){}},StarterScene:{Scene},requestAnimationFrame(fn){const id=++next;queue.set(id,fn);return id;},cancelAnimationFrame(id){queue.delete(id);},resetInput(){},renderer:{resourceGate:async(key,load)=>load()},NativeStory:{showPage:async()=>{}},FIELD_EFFECT_ASSETS:{effects:{2:{frames:361,background:'background',item:'badge',particles:false}},models:{background:{url:'background.glb'},badge:{url:'badge.glb'}},materialTextures:{badge:{badge_anime:[{frame:0},{frame:272},{frame:273},{frame:274},{frame:275},{frame:276}]}},nodeVisibility:{badge:{badge:Array.from({length:361},(_,i)=>i<160?1:0)},background:{circle:Array.from({length:361},(_,i)=>i<340?1:0)}},particles:{textures:[]},camera:{eye:[0,0,1]},perspective:{}},DRIFTVEIL_CINEMATICS:{models:Object.fromEntries(['wheelSky','wheelField','wheelFrame','wheel','bridgeSky','bridge'].map(k=>[k,{url:k+'.glb'}]))}};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(source,kind==='effects'?'field-effects.js':'driftveil-cinematics.js'),'utf8'),c);
 async function microtasks(){for(let i=0;i<8;i++)await Promise.resolve();}
 async function pump(at){time=at;await microtasks();const pending=[...queue.values()];queue.clear();for(const callback of pending)callback(at);await microtasks();}
 async function finish(promise){for(let n=0;queue.size&&n<1000;n++)await pump(time+100);await promise;assert.equal(panels.size,0);assert.equal(queue.size,0);assert.equal(listeners.size,0,'Visibility listener must be owned by this playback');}
 return {c,frames,pump,finish,panels,listeners,hide(value){hidden=value;listeners.get('visibilitychange')?.();},get destroyed(){return destroyed;}};
}
test('receipt time does not advance while hidden and does not absorb a suspended RAF gap on resume',async()=>{
 for(const rate of [1,2,4]){
  const f=environment('effects',rate),play=f.c.FieldEffects.play(2);await f.pump(0);await f.pump(50);const before=f.frames.at(-1),draws=f.frames.length;
  f.hide(true);await f.pump(50000);const during=f.frames.at(-1);f.hide(false);await f.pump(60000);const resumed=f.frames.at(-1);await f.finish(play);
  assert.equal(during,before,'A hidden receipt must retain its last visible pose at x'+rate);assert.equal(resumed,before,'A resumed receipt must discard wall time spent in another app at x'+rate);assert.ok(f.frames.length>=draws);assert.equal(f.destroyed,1);
 }
});
test('receipt remains on its pose when the browser suspends every hidden RAF callback',async()=>{
 const f=environment('effects',4),play=f.c.FieldEffects.play(2);await f.pump(0);await f.pump(50);const before=f.frames.at(-1);f.hide(true);f.hide(false);await f.pump(60000);const resumed=f.frames.at(-1);await f.finish(play);assert.equal(resumed,before);
});
test('slow x4 receipt playback actually draws every short native badge texture key and visibility handoff',async()=>{
 const f=environment('effects',4),play=f.c.FieldEffects.play(2);await f.pump(0);await f.finish(play);for(const frame of [0,160,272,273,274,275,276,340,360])assert.ok(f.frames.includes(frame),'Native receipt phase was skipped: '+frame);assert.equal(f.frames.at(-1),360);
});
test('both narrative wheel and bridge pause across hidden callbacks and a fully suspended browser',async()=>{
 for(const id of [3,15]){
  const f=environment('driftveil',4),play=f.c.DriftveilCinematics.play(id);await f.pump(0);await f.pump(50);const before=f.frames.at(-1);
  f.hide(true);await f.pump(50000);const during=f.frames.at(-1);f.hide(false);await f.pump(60000);const resumed=f.frames.at(-1);await f.finish(play);
  assert.equal(during,before,'Hidden narrative film advanced: '+id);assert.equal(resumed,before,'Narrative resume skipped poses: '+id);assert.equal(f.destroyed,1);
 }
});

function suspendedFixture(kind,rate=4){
 let now=0,next=0,hidden=false;const tasks=new Map(),listeners=new Map(),panels=new Set(),frames=[];
 const paint=new Proxy({createRadialGradient(){return {addColorStop(){}};}},{get:(o,k)=>k in o?o[k]:(()=>{})});
 const doc={get hidden(){return hidden;},body:{append(p){panels.add(p);}},addEventListener(k,f){listeners.set(k,f);},removeEventListener(k,f){if(listeners.get(k)===f)listeners.delete(k);},createElement(){return {style:{},dataset:{},append(){},setAttribute(){},remove(){panels.delete(this);},getContext(){return paint;},addEventListener(){},querySelector(){return null;},showModal(){},close(){},focus(){}};}};
 class Scene{constructor(canvas){this.canvas=canvas;this.ready=Promise.resolve();}draw(name,frame){if(kind!=='credits')frames.push(frame);}destroy(){}}
 const request=fn=>{const id=++next;tasks.set(id,fn);return id;},cancel=id=>tasks.delete(id),c={console,Math,Promise,TextDecoder,TextEncoder,document:doc,performance:{now:()=>now},requestAnimationFrame:request,cancelAnimationFrame:cancel,GameSpeed:{rate},StarterScene:{Scene,camera:()=>Array(16).fill(0)},resetInput(){},RuntimeAssets:{},NativeSettings:{state:{textSpeed:2}}};c.window=c;vm.createContext(c);
 const catalogFile={tower:'opelucid-cinematics-data.js',finale:'finale-cinematics-data.js',credits:'finale-credits-data.js',closeup:'finale-closeups-data.js'}[kind],catalog=catalogFile?fs.readFileSync(path.join(source,catalogFile),'utf8'):null;
 const options={document:doc,Scene,resource:p=>p,resourceGate:async(k,fn)=>fn(),requestFrame:request,cancelFrame:cancel,rate:()=>rate,fade:async()=>{},music:{src:'test.flac'},random:()=>.5,resources:{bytes:async()=>new TextEncoder().encode(catalog).buffer,image:async p=>{const d=JSON.parse(catalog.slice(catalog.indexOf('=')+1).trim().replace(/;$/,'')),entry=Object.values(d.images).find(v=>v.src===p);return {width:entry.size?.[0]||256,height:entry.size?.[1]||192};}},onFrame:state=>frames.push(state.frame)};
 let api,play,measure;
 if(kind==='tower'||kind==='finale'){
  const name=kind==='tower'?'OpelucidCinematics':'FinaleCinematics';vm.runInContext(fs.readFileSync(path.join(source,kind==='tower'?'opelucid-cinematics.js':'finale-cinematics.js'),'utf8'),c);api=c[name].create(options);play=()=>api.play(kind==='tower'?13:6);measure=()=>frames.at(-1);
 }else if(kind==='credits'){
  for(const f of ['finale-credits-motion.js','finale-credits.js'])vm.runInContext(fs.readFileSync(path.join(source,f),'utf8'),c);api=c.FinaleCredits.create(options);play=()=>api.play();measure=()=>frames.at(-1);
 }else if(kind==='closeup'){
  for(const f of ['finale-closeup-motion.js','finale-closeup.js'])vm.runInContext(fs.readFileSync(path.join(source,f),'utf8'),c);api=c.FinaleCloseup.create(options);play=()=>api.open(0);measure=()=>api.snapshot?.frame;
 }else{
  c.ROM_SPRITE_ANIM={load:()=>({ready:true,promise:Promise.resolve()}),draw(){}};vm.runInContext(fs.readFileSync(path.join(source,'evolution-scene.js'),'utf8'),c);api=c.EvolutionScene;play=()=>api.play(495,496);measure=()=>Number(api.active?.dataset.progress);
 }
 async function pump(delta=50){now+=delta;for(let i=0;i<20;i++)await Promise.resolve();const callbacks=[...tasks.values()];tasks.clear();for(const f of callbacks)f(now);for(let i=0;i<20;i++)await Promise.resolve();}
 return {play,measure,pump,hide(value){hidden=value;listeners.get('visibilitychange')?.();},async finish(promise){if(api.cancel)api.cancel();if(kind==='evolution')api.active?.children?.[2]?.onclick?.();for(let i=0;i<2000&&tasks.size;i++)await pump(100);await promise.catch(e=>{if(!/annullat/.test(e.message))throw e;});assert.equal(panels.size,0);assert.equal(listeners.size,0);}};
}
for(const [name,kind]of [['Tower films','tower'],['Finale films','finale'],['Credits','credits'],['N closeups','closeup'],['Evolution','evolution']])test(name+' retain the exact pose when no RAF runs during a hidden interval',async()=>{
 for(const rate of [1,2,4]){
  const f=suspendedFixture(kind,rate),play=f.play();play.catch(()=>{});await f.pump();await f.pump();const before=f.measure();assert.ok(Number.isFinite(before),kind+' did not start');f.hide(true);f.hide(false);await f.pump(60000);const resumed=f.measure();await f.finish(play);assert.equal(resumed,before,kind+' at x'+rate+' consumed suspended browser time');
 }
});
