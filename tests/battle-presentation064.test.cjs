'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const {create,plan}=require('../src/battle-presentation.js');
const site=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site'),data={Image:class{set src(value){}},document:{addEventListener(){}}};data.window=data;vm.createContext(data);for(const name of ['assets/move-fx-data.js','native-audio.js','native-visual.js','species-moves.js','battle-presentation.js','move-fx.js']){const source=path.resolve(__dirname,'../src',name);vm.runInContext(fs.readFileSync(fs.existsSync(source)?source:path.join(site,name),'utf8'),data,{filename:name});}
function sequence(id,species=id===16?521:500){const p={species,id,frames:126,impact:60,nativeEffects:true},q=data.SpeciesMoves.timeline(data.MoveFX.timeline(data.ROM_MOVE_FX.moves[id],0,0,'p1',{}),p);return{p,q};}
const keys=[25,38,48,60,63,84,98,107,116],make=()=>create({duration:126,keys});
test('important authored keys cannot be skipped by large frame gaps',()=>{
 const c=make(),seen=[];for(let i=0;i<11;i++){const p=c.begin(i*10000);seen.push(p.frame);assert(c.presented(p,i*10000+30));}assert.deepEqual(seen,[0,...keys,126]);assert.equal(c.snapshot().complete,true);
});
test('one immutable candidate serves all draw queries until successful acknowledgment',()=>{
 const c=make(),p=c.begin(0);assert.ok(Object.isFrozen(p));assert.equal(c.begin(1000),p);assert.equal(c.begin(2000),p);assert.equal(c.snapshot().value,0);assert.equal(c.presented(p,2000,{drawable:false}),false);assert.equal(c.begin(3000),p);assert.equal(c.presented(p,3000,{visible:false}),false);assert.equal(c.begin(4000),p);assert(c.presented(p,4000));assert.equal(c.begin(4010).frame,.6);
});
test('hidden pause invalidates old tokens and presents an unshown key even after delayed first resumed draw',()=>{
 const c=make(),p=c.begin(0);c.presented(p,0);const key=c.begin(1000);assert.equal(key.frame,25);c.pause(1010);assert.equal(c.begin(5000),null);assert.equal(c.presented(key,5000),false);c.resume(6000);const replacement=c.begin(6100);assert.notEqual(replacement,key);assert.equal(replacement.frame,25);assert.equal(c.presented(key,6100),false);assert(c.presented(replacement,6120));assert(Math.abs(c.begin(6130).frame-25.6)<1e-12);
});
test('monotonic checks cover repeated queries, rejected ACK and pause/resume',()=>{
 const c=make(),p=c.begin(100);c.begin(200);assert.throws(()=>c.begin(199),/monotonic/);assert.equal(c.presented(p,250,{visible:false}),false);assert.throws(()=>c.presented(p,249),/monotonic/);c.pause(300);assert.throws(()=>c.resume(299),/monotonic/);
});
test('final pose requires a successful actual draw and cancellation cannot complete it',()=>{
 const c=create({duration:2,keys:[]});c.presented(c.begin(0),0);const end=c.begin(1000);assert.equal(end.frame,2);assert.equal(c.snapshot().complete,false);c.cancel();assert.equal(c.presented(end,1000),false);assert.equal(c.snapshot().complete,false);const d=create({duration:2,keys:[]});d.presented(d.begin(0),0);const e=d.begin(1000);assert.equal(d.presented(e,1000).complete,true);assert.equal(d.begin(2000),null);
});
test('key render time and overrun are discarded after the key becomes visible',()=>{
 const c=make();c.presented(c.begin(0),1000);assert.equal(c.begin(1010).frame,.6);const ordinary=c.begin(1010);c.presented(ordinary,1020);const key=c.begin(4000);assert.equal(key.frame,25);c.presented(key,8000);assert(Math.abs(c.begin(8010).frame-25.6)<1e-12);
});
test('several ordinary frame rates and speeds retain every key once in order',()=>{
 for(const rate of [.5,1,2,4])for(const fps of [5,15,60,120]){const c=make();let at=0,count=0;const seen=[];while(!c.snapshot().complete&&count++<1000){const p=c.begin(at);const ack=c.presented(p,at);if(ack.key)seen.push(ack.frame);at+=1000/fps*rate;}assert(c.snapshot().complete,`${rate}/${fps}`);assert.deepEqual(seen,[0,...keys,126]);}
});
test('explicit500 plans preserve authored boundaries and exact original native audio starts',()=>{
 const a=sequence(205),b=sequence(360);assert.deepEqual(plan(a.p,a.q).keys,[...new Set([0,...keys,126,...a.q.audio.map(e=>e.start)])].sort((a,b)=>a-b));assert.deepEqual(plan(b.p,b.q).keys,[...new Set([0,25,36,48,60,63,88,102,110,119,126,...b.q.audio.map(e=>e.start)])].sort((a,b)=>a-b));assert.equal(plan({...a.p,species:501},a.q),null);assert.throws(()=>plan({...a.p,frames:120},a.q),/timing changed/);assert.throws(()=>plan(a.p,{...a.q,audio:[{kind:'sfx',start:NaN}]}),/cue changed|audio/);
});

test('invalid duration/key data rejects rather than running a partial plan',()=>{
 for(const args of [{duration:0,keys:[]},{duration:126,keys:[127]},{duration:126,keys:[NaN]},{duration:126,keys:null}])assert.throws(()=>create(args));
});
for(const rate of [1,4])test(`ordinary rendering cost counts at${rate}x with30ms draw and8ms inter-frame gap`,()=>{
 const c=create({duration:126,keys:[]});c.presented(c.begin(0),30*rate);const second=c.begin(38*rate);assert(Math.abs(second.frame-.48*rate)<1e-12);c.presented(second,68*rate);const third=c.begin(76*rate);assert(Math.abs(third.frame-2.76*rate)<1e-12,`rate${rate}: ordinary render time was discarded; frame=${third.frame}`);
});
for(const rate of [1,4])test(`ordinary rendering cost does not inflate a key-free action at${rate}x by a multiple of its nominal duration`,()=>{
 const c=create({duration:126,keys:[]});let wall=0,draws=0;while(!c.snapshot().complete&&draws++<2000){const token=c.begin(wall*rate);c.presented(token,(wall+30)*rate);wall+=38;}const finalDrawEnd=wall-8,nominal=126/(.06*rate);assert(c.snapshot().complete);assert(finalDrawEnd<=nominal+98,`rate${rate}: ${finalDrawEnd}ms for nominal${nominal}ms; successful ordinary drawing was charged as idle time`);assert(finalDrawEnd>=nominal);
});
test('nonzero-cost draws at1x and4x still present the complete real500 key order',()=>{
 for(const rate of [1,4]){const c=make(),seen=[];let wall=0,n=0;while(!c.snapshot().complete&&n++<1000){const token=c.begin(wall*rate),ack=c.presented(token,(wall+30)*rate);if(ack.key)seen.push(ack.frame);wall+=38;}assert(c.snapshot().complete);assert.deepEqual(seen,[0,...keys,126]);}
});
test('a failed ordinary ACK discards the failed wait rather than catching up through later keys',()=>{
 const c=make();c.presented(c.begin(0),0);const p=c.begin(10);assert.equal(p.frame,.6);assert.equal(c.presented(p,40,{drawable:false}),false);assert.equal(c.begin(10000),p);assert(c.presented(p,10000));assert(Math.abs(c.begin(10010).frame-1.2)<1e-12);
});
test('a failed key ACK holds that same key and discards a long wait only after its valid draw',()=>{
 const c=make();c.presented(c.begin(0),0);const p=c.begin(1000);assert.equal(p.frame,25);assert.equal(c.presented(p,1030,{drawable:false}),false);assert.equal(c.begin(20000),p);assert(c.presented(p,20000));assert(Math.abs(c.begin(20010).frame-25.6)<1e-12);
});
test('repeated ordinary draw queries do not resample the pose but their elapsed drawing time is counted afterward',()=>{
 const c=make();c.presented(c.begin(0),0);const p=c.begin(10);assert.equal(p.frame,.6);assert.equal(c.begin(20),p);assert.equal(c.begin(30),p);assert(c.presented(p,30));assert(Math.abs(c.begin(40).frame-2.4)<1e-12);
});
test('pause before an ordinary candidate was drawn preserves that candidate through delayed resume',()=>{
 const c=make();c.presented(c.begin(0),0);const old=c.begin(10);assert.equal(old.frame,.6);c.pause(11);c.resume(9000);const resumed=c.begin(9010);assert.notEqual(resumed,old);assert.equal(resumed.frame,.6);assert.equal(c.presented(old,9010),false);assert(c.presented(resumed,9040));assert(Math.abs(c.begin(9048).frame-2.88)<1e-12);
});
test('a forged or stale ACK cannot release the next key or change the current candidate',()=>{
 const c=make(),p=c.begin(0);assert.equal(c.presented({...p},1),false);assert.equal(c.snapshot().pending,p);assert(c.presented(p,1));const q=c.begin(1000);assert.equal(q.frame,25);assert.equal(c.presented(p,1000),false);assert.equal(c.snapshot().pending,q);assert.equal(c.snapshot().shown.includes(25),false);
});

test('the current value getter is immutable and does not depend on allocating a diagnostic snapshot',()=>{
 const c=make();assert.equal(c.value,0);const zero=c.begin(0);assert(c.presented(zero,0));const ordinary=c.begin(10);for(let i=0;i<100;i++)assert.equal(c.value,.6);assert.equal(c.begin(20),ordinary);assert.throws(()=>{c.value=90;},TypeError);assert(c.presented(ordinary,30));assert(Math.abs(c.begin(40).frame-2.4)<1e-12);assert.equal(c.value,c.snapshot().value);
});
test('Gust keeps every authored wing boundary and both simultaneous native impact cues',()=>{
 const {p,q}=sequence(16),keys=[0,8,9,21,33,43,54,64,78,91,95,101,106,111,112,126];assert.deepEqual(plan(p,q).keys,[...new Set([...keys,...q.audio.map(e=>e.start)])].sort((a,b)=>a-b));const c=create({...plan(p,q),now:0}),seen=[];for(let n=0;n<plan(p,q).keys.length;n++){const token=c.begin((n+1)*10000),ack=c.presented(token,(n+1)*10000+30);seen.push(ack.frame);}assert.deepEqual(seen,plan(p,q).keys);assert.equal(c.snapshot().complete,true);
});
test('supported plans reject native-anchor, duration, original cue or event drift before playback',()=>{
 for(const id of[205,360,16]){const {p,q}=sequence(id);for(const field of['nativeFrames','nativeAnchor','frames'])assert.throws(()=>plan(p,{...q,[field]:q[field]+1}),/timing changed/);assert.throws(()=>plan({...p,nativeEffects:false},q),/timing changed/);const shifted={...q,audio:q.audio.map(e=>e.target===16&&e.start===60?{...e,start:59}:e)};assert.throws(()=>plan(p,shifted),/cue changed/);const cueSafe={...q,audio:[...q.audio,{kind:'cry',start:70}]};assert.throws(()=>plan(p,cueSafe),/audio event/);}
});
test('clock ownership bounds and invalid numerical data cannot produce a partial presentation',()=>{
 assert.throws(()=>create({duration:126,keys:Array(257).fill(1)}),/Invalid/);for(const now of[NaN,Infinity])assert.throws(()=>create({duration:126,keys:[],now}),/Invalid/);const c=make();assert.throws(()=>c.begin(Infinity),/monotonic/);const q=sequence(16);assert.throws(()=>plan(q.p,{...q.q,audio:[...q.q.audio,{kind:'sfx',start:127}]}),/audio event/);
});
