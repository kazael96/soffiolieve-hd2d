const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const src=path.resolve(__dirname,'../src'),text=fs.readFileSync(path.join(src,'opelucid-cinematics-data.js'),'utf8'),catalog=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));
function environment(){const c=vm.createContext({TextDecoder,TextEncoder,Promise,console});vm.runInContext(fs.readFileSync(path.join(src,'opelucid-cinematics.js'),'utf8'),c);return c.OpelucidCinematics;}
function fixture({rate=1,fail=0,renderFail=false,audio=null}={}){
 let requests=0,destroyed=0,resets=0,hidden=false,now=0;const queue=new Map(),panels=[],frames=[],assets=[];let next=0;
 const doc={get hidden(){return hidden;},body:{append:p=>panels.push(p)},createElement:()=>({style:{},dataset:{},setAttribute(){},append(){},remove(){panels.splice(panels.indexOf(this),1);}})};
 class Scene{constructor(canvas,a){assets.push(a);this.ready=fail-->0?Promise.reject(Error('model offline')):Promise.resolve();}destroy(){destroyed++;}draw(name,f,options){if(renderFail)throw Error('GPU lost');frames.push({name,f,options});}}
 const api=environment().create({document:doc,Scene,audio,resources:{bytes:async()=>{requests++;return new TextEncoder().encode(text).buffer;}},resource:p=>p,resourceGate:async(key,load)=>load(),requestFrame:f=>{const id=++next;queue.set(id,f);return id;},cancelFrame:id=>queue.delete(id),rate:()=>rate,resetInput:()=>resets++});
 async function pump(count=800){for(let i=0;i<count;i++){await Promise.resolve();const callbacks=[...queue.values()];queue.clear();now+=100;for(const f of callbacks)f(now);}}
 return {api,pump,frames,assets,panels,setHidden:v=>hidden=v,get requests(){return requests;},get destroyed(){return destroyed;},get resets(){return resets;},get queued(){return queue.size;}};
}
test('both native films retain material alpha, colour and all texture keys omitted by the converter',()=>{
 const a=catalog.films[13],b=catalog.films[14];assert.equal(a.materialAlpha.stage.mist_2.length,551);assert.equal(a.materialAlpha.stage.mist_3.length,551);assert.equal(b.materialAlpha.stage.mist_2.length,551);
 assert.ok(new Set(a.materialAlpha.stage.mist_2).size>1);assert.equal(a.materialColor.stage.sky02.length,551);assert.ok(new Set(a.materialColor.stage.sky02.map(v=>v.join(','))).size>1);
 for(const film of [a,b])for(const track of Object.values(film.materialTextures.stage)){assert.equal(track.length,138);assert.equal(track[0].frame,0);assert.equal(new Set(track.map(k=>k.url)).size,3);for(const key of track)assert.ok(fs.existsSync(path.join(src,key.url)));}
});
test('native brightness is independent of audio: Black fades to black; White flashes white then fades to black',()=>{
 const a=catalog.films[13],b=catalog.films[14];assert.equal(a.brightness.length,552);assert.equal(b.brightness.length,551);
 for(const frame of [0,429,430])assert.equal(a.brightness[frame],0);assert.equal(a.brightness[431],-1);assert.equal(a.brightness[550],-16);assert.equal(a.brightness[551],-16);
 assert.equal(b.brightness[430],0);assert.equal(b.brightness[490],16);assert.equal(b.brightness[500],10);assert.equal(b.brightness[550],-16);
 assert.ok(a.brightness.every(v=>Number.isInteger(v)&&v>=-16&&v<=16));assert.ok(b.brightness.every(v=>Number.isInteger(v)&&v>=-16&&v<=16));assert.equal(b.timeline.filter(e=>e.kind===10).length,2);
});
test('both complete films play to their last native frame at all three speeds and release resources',async()=>{
 for(const id of [13,14])for(const rate of [1,2,4]){const f=fixture({rate}),play=f.api.play(id);await f.pump();await play;assert.equal(f.frames.at(-1).f,catalog.films[id].frames-1);assert.ok(f.frames.every(v=>v.name==='stage'&&v.options.extra[0]==='dragon'));assert.equal(f.panels.length,0);assert.equal(f.destroyed,1);assert.equal(f.resets,1);assert.equal(f.queued,0);assert.equal(f.api.active,false);assert.equal(f.assets[0].materialTextures.stage.n.length,138);}
});
test('background pauses film time; duplicate play cannot create a second panel',async()=>{
 const f=fixture(),play=f.api.play(13);await f.pump(30);const at=f.frames.at(-1).f;f.setHidden(true);await f.pump(80);assert.equal(f.frames.at(-1).f,at);await assert.rejects(f.api.play(14),/già in corso/);assert.equal(f.panels.length,1);f.setHidden(false);await f.pump();await play;assert.equal(f.panels.length,0);
});
test('model failure leaves a fresh retry; renderer failure cleans the panel and input',async()=>{
 const f=fixture({fail:1}),first=assert.rejects(f.api.play(13),/model offline/);await f.pump(10);await first;assert.equal(f.api.active,false);assert.equal(f.panels.length,0);const retry=f.api.play(13);await f.pump();await retry;assert.equal(f.destroyed,2);assert.equal(f.requests,1,'parsed catalogue is reusable after GPU failure');
 const bad=fixture({renderFail:true}),failure=assert.rejects(bad.api.play(14),/GPU lost/);await bad.pump(20);await failure;assert.equal(bad.panels.length,0);assert.equal(bad.destroyed,1);assert.equal(bad.resets,1);
});
test('corrupt lazy data can be fetched again without caching a rejected promise',async()=>{
 let count=0;const api=environment().create({resource:p=>p,resources:{bytes:async()=>new TextEncoder().encode(++count===1?'invalid':text).buffer}});await assert.rejects(api.data(),/non valide/);assert.equal((await api.data()).films[13].frames,552);assert.equal(count,2);
});
test('native soundtrack is prepared before frames, follows their exact clock and always stops',async()=>{
 const handles=[],audio={createCinematic(src){const handle={src,prepared:false,stops:0,frames:[],async prepare(){this.prepared=true;},sync(frame,speed){assert.equal(this.prepared,true);this.frames.push([frame,speed]);},stop(){this.stops++;}};handles.push(handle);return handle;}};
 for(const rate of [1,2,4]){const f=fixture({rate,audio}),play=f.api.play(13);await f.pump();await play;const h=handles.at(-1);assert.equal(h.src,catalog.films[13].audio.src);assert.equal(h.frames.length,f.frames.length);assert.ok(h.frames.every(([frame,speed],i)=>frame===f.frames[i].f&&speed===rate));assert.equal(h.stops,1);}
});
test('soundtrack preparation failure cleans the model and a fresh attempt can replay the same film',async()=>{
 let failures=1,stops=0;const audio={createCinematic(){return {async prepare(){if(failures-->0)throw Error('sound offline');},sync(){},stop(){stops++;}};}},f=fixture({audio}),first=assert.rejects(f.api.play(13),/sound offline/);await f.pump(10);await first;assert.equal(f.panels.length,0);assert.equal(f.destroyed,1);assert.equal(stops,1);const retry=f.api.play(13);await f.pump();await retry;assert.equal(f.destroyed,2);assert.equal(stops,2);assert.equal(f.requests,1);
});
