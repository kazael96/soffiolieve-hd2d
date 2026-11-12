const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const src=path.resolve(__dirname,'../src'),text=fs.readFileSync(path.join(src,'finale-cinematics-data.js'),'utf8'),catalog=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));
function fixture({rate=1,modelFailure=false,renderFailure=false,slow=false}={}){
 const c=vm.createContext({TextDecoder,TextEncoder,Promise});vm.runInContext(fs.readFileSync(path.join(src,'finale-cinematics.js'),'utf8'),c);let hidden=false,now=0,next=0,destroyed=0,resets=0,stops=0,release,fetches=0;const queue=new Map(),panels=[],frames=[],assets=[],audio=[];
 const doc={get hidden(){return hidden;},body:{append:p=>panels.push(p)},createElement:()=>({style:{},dataset:{},setAttribute(){},append(){},remove(){panels.splice(panels.indexOf(this),1);}})};
 class Scene{constructor(canvas,a){assets.push(a);this.ready=modelFailure?Promise.reject(Error('model offline')):slow?new Promise(r=>release=r):Promise.resolve();}destroy(){destroyed++;}draw(name,frame,options){if(renderFailure)throw Error('GPU lost');frames.push({name,frame,options});}}
 const api=c.FinaleCinematics.create({document:doc,Scene,resources:{bytes:async()=>{fetches++;return new TextEncoder().encode(text);}},resource:p=>p,resourceGate:(key,load)=>load(),audio:{createCinematic(){return {prepare:async()=>{},sync:(f,r)=>audio.push([f,r]),stop:()=>stops++};}},requestFrame:f=>{queue.set(++next,f);return next;},cancelFrame:id=>queue.delete(id),rate:()=>rate,resetInput:()=>resets++});
 async function pump(n=700){for(let i=0;i<n;i++){await Promise.resolve();const a=[...queue.values()];queue.clear();now+=100;for(const f of a)f(now);}}
 return {api,pump,frames,assets,audio,panels,queue,setHidden:v=>hidden=v,release:()=>release?.(),get destroyed(){return destroyed;},get resets(){return resets;},get stops(){return stops;},get fetches(){return fetches;}};
}
test('all five movies preserve three native model parts, original resources, dynamic UV and finite brightness',()=>{
 for(const[id,f]of Object.entries(catalog.films)){
  assert.equal(Object.keys(f.models).length,3);assert.equal(f.camera.length,f.frames);assert.equal(f.brightness.length,f.frames);assert.equal(f.brightness.at(-1),-16);assert.ok(f.brightness.every(v=>Number.isInteger(v)&&v>=-16&&v<=16));
  assert.ok(f.audio.nativeHandleReplacement&&f.audio.nativePitchAndVolumeBaked);assert.equal(Math.round(f.audio.duration*32768),Math.round(f.frames*32768/30));assert.ok(fs.existsSync(path.join(src,f.audio.src)));
  for(const m of Object.values(f.models)){const bytes=fs.readFileSync(path.join(src,m.url));assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),m.sha256);assert.ok(m.bindings.some(b=>b.kind==='joint'));}
  for(const mats of Object.values(f.materialUV))for(const t of Object.values(mats)){assert.ok(t.frames.length>1000);assert.ok(t.frames.every(v=>v.length===9&&v.every(Number.isFinite)));}
 }
 assert.ok(catalog.films[6].materialUV.part1.n_drill.frames[0][0]!==1);
});
test('every movie finishes its native frame at1/2/4, with synchronized audio and complete resource cleanup',async()=>{
 for(const id of [6,9,10,11,12])for(const rate of [1,2,4]){const f=fixture({rate}),play=f.api.play(id);await f.pump();await play;assert.equal(f.frames.at(-1).frame,catalog.films[id].frames-1);assert.ok(f.frames.every(r=>r.name==='part0'&&r.options.extra.join(',')==='part1,part2'));assert.ok(f.assets[0].materialUV);assert.equal(f.audio.length,f.frames.length);assert.ok(f.audio.every(([frame,r],i)=>frame===f.frames[i].frame&&r===rate));assert.equal(f.panels.length,0);assert.equal(f.queue.size,0);assert.equal(f.destroyed,1);assert.equal(f.stops,1);assert.equal(f.resets,1);assert.equal(f.api.active,false);}
});
test('background pauses native time and duplicate playback cannot create a second movie',async()=>{
 const f=fixture(),play=f.api.play(6);await f.pump(25);const at=f.frames.at(-1).frame;f.setHidden(true);await f.pump(20);assert.equal(f.frames.at(-1).frame,at);await assert.rejects(f.api.play(9),/già in corso/);assert.equal(f.panels.length,1);f.setHidden(false);await f.pump();await play;
});
test('cancellation during loading never installs a late model or restarts audio',async()=>{
 const f=fixture({slow:true}),failure=assert.rejects(f.api.play(6),/annullata/);await f.pump(20);assert.equal(f.api.cancel(),true);await f.pump(10);await failure;f.release();await f.pump(10);assert.equal(f.frames.length,0);assert.equal(f.audio.length,0);assert.equal(f.panels.length,0);assert.equal(f.api.active,false);assert.equal(f.destroyed,1);assert.equal(f.api.cancel(),false);
});
test('model and drawing failures release the panel and input instead of leaving a locked movie',async()=>{
 for(const options of [{modelFailure:true},{renderFailure:true}]){const f=fixture(options),failure=assert.rejects(f.api.play(12),/offline|GPU lost/);await f.pump(20);await failure;assert.equal(f.api.active,false);assert.equal(f.panels.length,0);assert.equal(f.queue.size,0);assert.equal(f.destroyed,1);assert.equal(f.resets,1);}
});
