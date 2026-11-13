const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{position}=require('../src/finale-ball-release.js');
const src=path.resolve(__dirname,'../src'),text=fs.readFileSync(path.join(src,'finale-stone-data.js'),'utf8'),data=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));
function fixture({rate=1,slow=false,failed=false}={}){
 const c=vm.createContext({Promise});vm.runInContext(fs.readFileSync(path.join(src,'finale-ball-release.js'),'utf8'),c);let time=0,next=0,hidden=false,destroyed=0,covers=0,release,broken=false;const queue=new Map(),panels=[],draws=[],sounds=[],stops=[];
 const document={get hidden(){return hidden;},body:{append:p=>panels.push(p)},createElement:()=>({style:{},dataset:{},setAttribute(){},append(){},remove(){const i=panels.indexOf(this);if(i>=0)panels.splice(i,1);}})};
 class Scene{constructor(){this.ready=failed?Promise.reject(Error('model offline')):slow?new Promise(r=>release=r):Promise.resolve();}draw(name,frame,options){if(broken)throw Error('GPU lost');draws.push({name,frame,projection:options.projection});}destroy(){destroyed++;}}
 const renderer={canvas:{width:390,height:844}},api=c.FinaleBallRelease.create({data,document,Scene,renderer,projection:(r,p)=>[p.x,p.height,p.y],rate:()=>rate,resourceGate:(k,load)=>load(),requestFrame:f=>{queue.set(++next,f);return next;},cancelFrame:id=>queue.delete(id),play:id=>sounds.push(id),stop:id=>stops.push(id),coverFailure:()=>covers++});
 async function pump(n=1){for(let i=0;i<n;i++){await Promise.resolve();const pending=[...queue.values()];queue.clear();time+=100;for(const f of pending)f(time);}}
 return {api,pump,panels,draws,sounds,stops,renderer,setHidden:v=>hidden=v,release:()=>release?.(),breakGpu:()=>broken=true,get destroyed(){return destroyed;},get covers(){return covers;},get queued(){return queue.size;}};
}
const from={x:.5,y:20.5,height:0},to={x:.5,y:-9.5,height:2.5};
test('original throw uses signed Q16 division and triangular height over20 native updates, never a substituted parabola',()=>{
 assert.deepEqual(position(from,to,5,20,0),from);assert.deepEqual(position(from,to,5,20,20),to);assert.deepEqual(position(from,to,5,20,10),{x:.5,y:5.5,height:3.75});
 const a=position({x:0,y:0,height:0},{x:-1,y:-2,height:1},0,3,1);assert.equal(a.x,-21845/65536);assert.equal(a.y,-43690/65536);assert.equal(a.height,21845/65536);assert.deepEqual(position(from,to,5,20,25),to);assert.throws(()=>position(from,to,5,0,1),/non valida/);
});
test('597 completes the throw,600 waits for release frame5 and599 waits for46 at1/2/4, with background pause and no duplicate object',async()=>{
 for(const rate of [1,2,4]){const f=fixture({rate}),flight=f.api.flight(from,to,5,20);await f.pump(8);if(f.api.snapshot?.phase==='flight'){const at=f.api.snapshot.frame;f.setHidden(true);await f.pump(4);assert.equal(f.api.snapshot.frame,at);f.setHidden(false);}await f.pump(40);await flight;assert.equal(f.api.snapshot.frame,20);assert.deepEqual({...f.api.snapshot.position},to);assert.ok(f.draws.every(d=>d.name==='part1'&&d.frame===0));await assert.rejects(f.api.flight(from,to,5,20),/già in corso/);
  f.api.activate(to);let ready=false,done=false;const a=f.api.waitReady().then(()=>ready=true),b=f.api.waitDone().then(()=>done=true);await f.pump(1);if(f.api.snapshot.frame<5)assert.equal(ready,false);await f.pump(30);await a;await b;assert.equal(ready,true);assert.equal(done,true);assert.equal(f.api.snapshot.frame,46);assert.equal(f.draws.at(-1).frame,45);assert.deepEqual(f.sounds,[1382,1383]);assert.equal(f.panels.length,1);f.api.cancel();assert.equal(f.panels.length,0);assert.equal(f.queued,0);assert.equal(f.destroyed,1);
 }
});
test('loading cancellation and failed drawing reject native waiters and never leave late models or a frozen command',async()=>{
 const f=fixture({slow:true}),cancelled=assert.rejects(f.api.flight(from,to,5,20),/annullato/);await f.pump(12);f.api.cancel();f.release();await f.pump(15);await cancelled;assert.equal(f.panels.length,0);assert.equal(f.draws.length,0);assert.equal(f.sounds.length,0);assert.equal(f.destroyed,1);assert.equal(f.covers,0);
 const g=fixture(),flight=g.api.flight(from,to,5,20);await g.pump(40);await flight;g.api.activate(to);const failed=assert.rejects(g.api.waitDone(),/GPU lost/);g.breakGpu();await g.pump();await failed;assert.equal(g.api.active,false);assert.equal(g.panels.length,0);assert.equal(g.queued,0);assert.ok(g.covers>0);
 const h=fixture({failed:true}),offline=assert.rejects(h.api.flight(from,to,5,20),/offline/);await h.pump(20);await offline;assert.equal(h.api.active,false);assert.equal(h.panels.length,0);assert.equal(h.destroyed,1);
});
