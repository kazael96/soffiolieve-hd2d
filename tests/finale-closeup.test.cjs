const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),motion=require('../src/finale-closeup-motion.js');
const src=path.resolve(__dirname,'../src'),text=fs.readFileSync(path.join(src,'finale-closeups-data.js'),'utf8'),data=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));
function fixture({rate=1,slow=false,wrongSize=false}={}){
 const c=vm.createContext({Promise,TextDecoder});vm.runInContext(fs.readFileSync(path.join(src,'finale-closeup.js'),'utf8'),c);let now=0,next=0,hidden=false,resets=0,covers=0,broken=false,release,blockFade=false,fadeRelease,loads=0;
 const waiting=slow?new Promise(r=>release=r):Promise.resolve(),queue=new Map(),panels=[],fades=[],canvases=[];
 const doc={get hidden(){return hidden;},body:{append:p=>panels.push(p)},createElement(kind){const calls=[],context={globalAlpha:1,clearRect(...v){calls.push(['clear',...v]);},drawImage(...v){if(broken)throw Error('Canvas lost');calls.push(['image',...v]);}};const e={style:{},dataset:{},calls,setAttribute(){},append(){},getContext:()=>context,remove(){const i=panels.indexOf(this);if(i>=0)panels.splice(i,1);}};if(kind==='canvas')canvases.push(e);return e;}};
 const api=c.FinaleCloseup.create({document:doc,data,motion,resource:x=>x,resourceGate:(key,load)=>load(),resources:{image:async url=>{loads++;await waiting;const d=Object.values(data.images).find(i=>i.src===url);return {width:wrongSize?1:d.size[0],height:d.size[1],url};}},fade:async(to,frames)=>{fades.push([to,frames]);if(blockFade){blockFade=false;await new Promise(r=>fadeRelease=r);}},requestFrame:f=>{queue.set(++next,f);return next;},cancelFrame:i=>queue.delete(i),rate:()=>rate,random:()=>0,resetInput:()=>resets++,coverFailure:()=>covers++});
 async function pump(n=1){for(let i=0;i<n;i++){await Promise.resolve();const pending=[...queue.values()];queue.clear();now+=100;for(const f of pending)f(now);}}
 return {api,pump,panels,fades,canvases,release:()=>release?.(),setHidden:v=>hidden=v,breakCanvas:()=>broken=true,blockFade:()=>blockFade=true,releaseFade:()=>fadeRelease?.(),get resets(){return resets;},get covers(){return covers;},get loads(){return loads;},get queued(){return queue.size;}};
}
test('three native closeups preserve24 resource checksums, original face coordinates and native animation records',()=>{
 assert.equal(data.source.overlay,82);assert.equal(data.source.archive,'a/1/8/7');assert.equal(Object.keys(data.images).length,24);for(const row of Object.values(data.images))assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(src,row.src))).digest('hex'),row.sha256);
 assert.deepEqual(data.eyes.at,[104,64,48,16]);assert.deepEqual(data.mouth.at,[112,88,32,16]);assert.deepEqual(data.eyes.sequence.map(v=>v[0]),[0,1,2,1,0]);assert.deepEqual(data.mouth.sequence.map(v=>v[0]),[1,2,1,0]);
});
test('portrait introduction completes native blend30 at1/2/4, pauses in background and keeps one uncropped256x192 canvas',async()=>{
 for(const rate of [1,2,4]){const f=fixture({rate}),open=f.api.open(1);await f.pump(25);const at=f.api.snapshot.frame;f.setHidden(true);await f.pump(10);assert.equal(f.api.snapshot.frame,at);f.setHidden(false);await f.pump(60);await open;assert.equal(f.api.snapshot.opened,true);assert.equal(f.api.snapshot.blend,30);assert.equal(f.panels.length,1);assert.equal(f.api.snapshot.canvas.width,256);assert.equal(f.api.snapshot.canvas.height,192);assert.equal(f.api.snapshot.canvas.style.objectFit,'contain');assert.deepEqual(f.fades,[[1,16],[0,16]]);
  await assert.rejects(f.api.open(2),/già in corso/);f.api.restart();f.api.message({done:false});await f.pump(4);assert.ok(f.canvases[1].calls.some(c=>c[0]==='clear'&&c.slice(1).join(',')==='104,64,48,16'),'Native eyes replace tiles before body blending');await f.api.close();assert.deepEqual(f.fades.slice(-2),[[1,16],[0,16]]);assert.equal(f.panels.length,0);assert.equal(f.queued,0);assert.equal(f.resets,1);
 }
});
test('special farewell closes in two native updates and leaves field covered for the ending',async()=>{
 const f=fixture(),open=f.api.open(2,0,1);await f.pump(80);await open;await f.api.close();assert.deepEqual(f.fades,[[1,16],[0,16],[1,2]]);assert.equal(f.api.active,false);assert.equal(f.queued,0);
});
test('cancelled loading cannot install a late portrait or cover a replacement; failed resources remain retryable',async()=>{
 const f=fixture({slow:true}),cancelled=assert.rejects(f.api.open(1),/annullato/);await f.pump(10);f.api.cancel();f.release();const next=f.api.open(2);await f.pump(80);await cancelled;await next;assert.equal(f.api.snapshot.mode,2);assert.equal(f.covers,0);assert.equal(f.panels.length,1);await f.api.close();
 const failed=fixture({wrongSize:true}),error=assert.rejects(failed.api.open(1),/Dimensioni/);await failed.pump(20);await error;assert.equal(failed.api.cacheEntries,0);assert.equal(failed.panels.length,0);assert.equal(failed.queued,0);
});
test('late close and render failure cannot leave an overlay, clock or erase a replacement scene',async()=>{
 const f=fixture(),open=f.api.open(1);await f.pump(80);await open;f.blockFade();const cancelled=assert.rejects(f.api.close(),/annullato/);f.api.cancel();const replacement=f.api.open(2);await f.pump(80);await replacement;f.releaseFade();await cancelled;assert.equal(f.api.snapshot.mode,2);assert.equal(f.covers,0);await f.api.close();
 const g=fixture(),ready=g.api.open(1);await g.pump(80);await ready;g.breakCanvas();await g.pump();assert.equal(g.api.active,false);assert.equal(g.panels.length,0);assert.equal(g.queued,0);assert.ok(g.covers>0);await assert.rejects(g.api.close(),/Canvas lost/);
});
