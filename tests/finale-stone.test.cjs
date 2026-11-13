const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=path.resolve(__dirname,'../src'),text=fs.readFileSync(path.join(source,'finale-stone-data.js'),'utf8'),data=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));
function fixture({rate=1,slow=false,modelFailure=false,audioFailure=false}={}){
 const c=vm.createContext({Promise,TextDecoder});vm.runInContext(fs.readFileSync(path.join(source,'finale-stone.js'),'utf8'),c);
 let now=0,id=0,hidden=false,destroyed=0,stopped=0,resets=0,release,broken=false,heldErrors=0;const queue=new Map(),panels=[],frames=[],syncs=[],assets=[];
 const renderer={canvas:{width:390,height:844}},document={get hidden(){return hidden;},body:{append:p=>panels.push(p)},createElement:()=>({style:{},dataset:{},setAttribute(){},append(){},remove(){const i=panels.indexOf(this);if(i>=0)panels.splice(i,1);}})};
 class Scene{constructor(canvas,a){assets.push(a);this.ready=modelFailure?Promise.reject(Error('model offline')):slow?new Promise(r=>release=r):Promise.resolve();}draw(part,frame,options){if(broken)throw Error('GPU lost');frames.push({part,frame,options});}destroy(){destroyed++;}}
 const projection=[1,0,0,0,0,1,0,0,0,0,1,0,.2,.3,0,1];
 const api=c.FinaleStone.create({renderer,document,data,Scene,projection:()=>projection,resourceGate:(key,load)=>load(),rate:()=>rate,requestFrame:f=>{queue.set(++id,f);return id;},cancelFrame:id=>queue.delete(id),resetInput:()=>resets++,onHeldError:()=>heldErrors++,audio:{createCinematic(src,opts){assert.equal(src,data.audio.src);assert.equal(opts.ownsMusic,false);return{prepare:async()=>{if(audioFailure)throw Error('audio offline');},sync:(f,r)=>syncs.push([f,r]),stop:()=>stopped++};}}});
 async function pump(n=1){for(let i=0;i<n;i++){await Promise.resolve();const pending=[...queue.values()];queue.clear();now+=100;for(const f of pending)f(now);}}
 return{api,pump,renderer,panels,frames,syncs,assets,setHidden:v=>hidden=v,release:()=>release?.(),breakGpu:()=>broken=true,get destroyed(){return destroyed;},get stopped(){return stopped;},get resets(){return resets;},get queued(){return queue.size;},get heldErrors(){return heldErrors;}};
}
const position={x:.5,y:25.5,height:0};
test('native stone resources retain original306-frame model, both exported parts and baked sound',()=>{
 assert.equal(data.frames,306);assert.equal(data.source.overlay,64);assert.equal(data.source.gimmick,53);assert.equal(data.flash.start,101);assert.equal(data.flash.end,117);
 for(const m of Object.values(data.models)){assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(source,m.url))).digest('hex'),m.sha256);}
 assert.ok(fs.existsSync(path.join(source,data.audio.src)));assert.equal(Math.round(data.audio.duration*32768),Math.round(306*32768/30));
});
test('at1/2/4 the stone stays attached to field, pauses in background and holds final pose until covered close',async()=>{
 for(const rate of [1,2,4]){const f=fixture({rate}),playing=f.api.play(position);await f.pump(25);assert.ok(f.frames.length);const at=f.api.snapshot.frame;
  f.setHidden(true);await f.pump(20);assert.equal(f.api.snapshot.frame,at);f.setHidden(false);f.renderer.canvas.width=844;f.renderer.canvas.height=390;
  await assert.rejects(f.api.play(position),/già in corso/);await f.pump(120);await playing;
  assert.equal(f.api.snapshot.frame,306);assert.equal(f.api.snapshot.held,true);assert.equal(f.api.snapshot.canvas.width,844);assert.equal(f.frames.at(-1).frame,305);
  assert.ok(f.frames.every(v=>v.part==='part0'&&v.options.projection[12]===.2));assert.equal(f.assets[0].transparent,true);assert.deepEqual(Object.keys(f.assets[0].models),['part0']);assert.equal(f.assets[0].frameSampling,'native');
  const audioCount=f.syncs.length;await f.pump(5);assert.equal(f.syncs.length,audioCount);assert.equal(f.panels.length,1);assert.equal(f.destroyed,0);f.api.close();assert.equal(f.api.active,false);assert.equal(f.panels.length,0);assert.equal(f.queued,0);assert.equal(f.destroyed,1);assert.equal(f.stopped,1);assert.equal(f.resets,1);f.api.close();assert.equal(f.destroyed,1);
 }
});
test('cancel during model load and resource failures cannot leave a panel, clock, audio or locked input',async()=>{
 const f=fixture({slow:true}),failure=assert.rejects(f.api.play(position),/annullata/);await f.pump(10);f.api.cancel();await f.pump(5);await failure;f.release();await f.pump(10);assert.equal(f.frames.length,0);assert.equal(f.panels.length,0);assert.equal(f.queued,0);assert.equal(f.destroyed,1);assert.equal(f.stopped,0);
 for(const options of [{modelFailure:true},{audioFailure:true}]){const g=fixture(options),rejected=assert.rejects(g.api.play(position),/offline/);await g.pump(20);await rejected;assert.equal(g.api.active,false);assert.equal(g.panels.length,0);assert.equal(g.queued,0);assert.equal(g.destroyed,1);}
});
test('render failures before and after native completion release resources and propagate to covered close',async()=>{
 const f=fixture(),failed=assert.rejects(f.api.play(position),/GPU lost/);await f.pump(20);f.breakGpu();await f.pump();await failed;assert.equal(f.panels.length,0);assert.equal(f.queued,0);
 const g=fixture(),playing=g.api.play(position);await g.pump(150);await playing;g.breakGpu();await g.pump();assert.equal(g.heldErrors,1);assert.equal(g.panels.length,0);assert.equal(g.queued,0);assert.throws(()=>g.api.close(),/GPU lost/);g.api.close();
});
