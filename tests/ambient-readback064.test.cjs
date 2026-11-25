'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{host,plan,pinned,sha}=require('./helpers/ambient-readback064-host.cjs');
const test=require('node:test'),os=require('node:os');
const started=performance.now(),file=process.env.SOFFIOLIEVE_RECT_CPU_RESULT||path.join(fs.mkdtempSync(path.join(os.tmpdir(),'soffiolieve-ambient064-')),'result.json');
assert(file&&path.isAbsolute(file)&&!fs.existsSync(file),'Fresh explicit result required');
const report={schema:1,status:'PREPARED_GATE_RUNNING',pid:process.pid,scope:plan.scope,limits:{stageMs:180000,heapMiB:400,RSSMiB:400,PNG:0},cases:[],comparedPairs:0,releasedOracleReferences:0,gcMs:0,gcSamples:[],eventLoopYields:0,eventLoopWaitMs:0,requiresChromeExactEquivalenceAndProfile:true};
const save=()=>{const raw=JSON.stringify(report,null,2)+'\n';assert(Buffer.byteLength(raw)<=1048576,'CPU report1MiB cap');fs.writeFileSync(file,raw);};
function budget(){assert(performance.now()-started<170000,'Internal170s stop');assert(process.memoryUsage().rss<400*1024*1024,'RSS400MiB stop');}
async function step(id,fn){budget();const r={id,status:'RUNNING'};report.cases.push(r);save();const t=performance.now();try{r.details=await fn();await collectGC('case-end');r.status='PASS';r.ms=performance.now()-t;save();}catch(e){r.status='FAIL';r.error=e.stack;save();throw e;}}
async function collectGC(reason){
 const row={reason,atPair:report.comparedPairs,currentSample:report.currentSample??null,before:process.memoryUsage(),startedMs:performance.now()-started};report.gcSamples.push(row);save();
 budget();assert.equal(typeof global.gc,'function','Exposed GC is required for this bounded fixture lifecycle');const t=performance.now();global.gc();row.gcMs=performance.now()-t;row.after=process.memoryUsage();report.gcMs+=row.gcMs;budget();row.beforeYield=process.memoryUsage();save();const y=performance.now();await new Promise(resolve=>setImmediate(resolve));row.waitMs=performance.now()-y;row.afterYield=process.memoryUsage();report.eventLoopYields++;report.eventLoopWaitMs+=row.waitMs;save();budget();row.status='WITHIN_SAME_RSS_AND_TIME_GUARDS';save();
}
function eq(a,b,label){assert.deepEqual(a.metrics,b.metrics,label+' metrics');for(const key of ['frame','source']){assert.equal(!!a[key],!!b[key]);if(a[key])assert(a[key].equals(b[key]),label+' full RGBA '+key+' mismatch');}}
async function renderPair(A,B,actors,key,tick,consume=null){
 const counts=[A.counts.ambientReadbacks,B.counts.ambientReadbacks],a=A.render(key,tick,actors.A,true),b=B.render(key,tick,actors.B,true);
 try{eq(a,b,key+'/'+tick);assert.equal(A.counts.ambientReadbacks-counts[0],1,'Baseline ambient frame exactly1readback');assert.equal(B.counts.ambientReadbacks-counts[1],1,'Candidate ambient frame exactly1readback');if(consume)consume(a,b);return{a:{metrics:a.metrics},b:{metrics:b.metrics},rectA:A.readback(actors.A.frameContext),rectB:B.readback(actors.B.frameContext)};}
 finally{a.frame=null;a.source=null;b.frame=null;b.source=null;report.releasedOracleReferences+=4;report.comparedPairs++;if(report.comparedPairs%32===0)await collectGC('32-pairs');}
}
const gcd=(a,b)=>b?gcd(b,a%b):a,lcm=(a,b)=>a/gcd(a,b)*b;
function period(data){const channels=[...data.parent,...data.animations];assert(channels.every(a=>a.mode===2&&(a.loop||0)===0));return channels.filter(a=>a.frames.length>1).reduce((p,a)=>lcm(p,a.frames.reduce((s,f)=>s+Math.max(0,f[1]),0)),1);}
const keys=['504-front','506-front'];let A,B,actors,periods;
async function main(){
 await step('01-original-R-source-and-native-assets',async()=>{
  for(const p of plan.inputs)pinned(p);assert.equal(plan.programs.A.path,plan.programs.B.path);assert.equal(plan.programs.A.sha256,'bde5a3f22260afc2002de9cdd4c82f32f4246dc80b3b3a528f1b062ed88df395');assert(pinned(plan.programs.A).equals(pinned(plan.programs.B)));
  for(const p of [plan.programs.A,plan.programs.B,plan.speciesSource,plan.ambientCanvas,plan.ambientHelper,plan.ambientPose.A,plan.ambientPose.B,plan.wingWrapper,...plan.nativeAssets.filter(p=>p.relative.endsWith('.json'))]){const raw=pinned(p);assert(raw.equals(Buffer.from(raw.toString('utf8'),'utf8')),'Compiled/decoded UTF8 must equal raw pinned bytes: '+p.path);}
  assert.equal(plan.ambientPose.B.sha256,'45f10a5517c0c20798b66b776669756df4bc8c6aac41cce1a3c8eaefd71adc5c','Current FULL pose must be extracted from qualified parent');assert.notEqual(plan.ambientPose.A.sha256,plan.ambientPose.B.sha256,'Historical ROI vs current FULL must remain a non-tautological oracle');
  A=host('A');B=host('B');await A.R.prepare(keys,{gate:false});await B.R.prepare(keys,{gate:false});actors={A:{},B:{}};periods={};
  for(const key of keys){periods[key]=period(A.R.cache[key].data);assert.equal(period(B.R.cache[key].data),periods[key]);assert(periods[key]>0&&periods[key]<=4096);for(const h of [A,B])actors[h.label][key]=await h.actor(+key.split('-')[0],true);}
  return{nativeOriginalSHA256:plan.programs.A.sha256,compiledTextUTF8RoundtripRawExact:true,periods,framesHint:true,rendererLayerHintChanges:false,sourceHintChanges:false,APIA:A.audit().APIBindingsOriginal,APIB:B.audit().APIBindingsOriginal};
 });
 await step('02-every-native-front-state-exact-frame-source-metrics',async()=>{
  let samples=0;const digest=require('node:crypto').createHash('sha256'),before=[A.audit(),B.audit()],jointStates={};
  for(const key of keys){const states=new Set();for(let tick=0;tick<periods[key];tick++){
   if(tick%32===0)budget();report.currentSample={phase:'full-cycle',key,tick};const pair=await renderPair(A,B,{A:actors.A[key],B:actors.B[key]},key,tick,a=>{digest.update(a.frame);digest.update(a.source);});assert(pair.a.metrics.rawBounds,'Native body nonempty');
   const sig=JSON.stringify(A.R.parts(A.R.cache[key].data,tick).map(p=>[p.r,p.f,p.pf,p.o]));states.add(sig);samples++;
  }jointStates[key]=states.size;}
  const after=[A.audit(),B.audit()],calls=after.map((a,i)=>a.counts.ambientReadbacks-before[i].counts.ambientReadbacks),pixels=after.map((a,i)=>a.counts.ambientPixels-before[i].counts.ambientPixels),returned=after.map((a,i)=>a.counts.ambientReturnedPixels-before[i].counts.ambientReturnedPixels),returnedBytes=after.map((a,i)=>a.counts.ambientReturnedBytes-before[i].counts.ambientReturnedBytes);
  assert.equal(calls[0],samples);assert.equal(calls[1],samples);assert.equal(pixels[1],samples*65536,'Current FULL runtime must read all65536 pixels per update');assert(pixels[0]<pixels[1],'Historical ROI oracle must retain its independently pinned cropped reads');
  assert.deepEqual(returned,pixels,'Actual ImageData dimensions must match requested rectangle');assert.deepEqual(returnedBytes,returned.map(p=>p*4),'Actual RGBA byte lengths');
  return{pairedSamples:samples,jointStates,fullRGBAAndMetricsExact:true,ambientReadbackCalls:calls,requestedPixels:pixels,actualReturnedPixels:returned,actualReturnedBytes:returnedBytes,digestSHA256:digest.digest('hex'),A:after[0],B:after[1]};
 });
 await step('03-warm-complete-cycle-exact-and-allocation-decode-plateau',async()=>{
  const before=[A.audit(),B.audit()];let samples=0;
  for(const key of keys)for(let tick=0;tick<periods[key];tick++){if(tick%32===0)budget();report.currentSample={phase:'warm-cycle',key,tick};await renderPair(A,B,{A:actors.A[key],B:actors.B[key]},key,tick);samples++;}
  const after=[A.audit(),B.audit()];for(let i=0;i<2;i++){assert.equal(after[i].canvases,before[i].canvases);assert.equal(after[i].counts.PNGDecodes,before[i].counts.PNGDecodes);assert.equal(after[i].counts.JSONLoads,before[i].counts.JSONLoads);assert.deepEqual(after[i].stats.layers,before[i].stats.layers);}
  return{samples,newCanvases:[0,0],newDecodes:[0,0],sameLayerAccounting:true,rawFullRGBAExact:true};
 });
 const negativeNames=['filter','matrix','shadowBlur','shadowOffset','composite','clip-active-oldpixels','clip-restored-sticky','clip-binding','draw-false','draw-wrapped-warm','draw-wrapped-birth','bounds-wrapped-birth','bounds-binding','part-binding','R-object','frame-resize','source-resize','notready','unsupported-id','unobservable-matrix'];
 for(const name of negativeNames)await step('04-full-fallback-'+name,async()=>{
  const hs={A:host('A'),B:host('B')},as={};for(const h of Object.values(hs)){await h.R.prepare(['504-front'],{gate:false});}
  if(name.endsWith('-birth'))for(const h of Object.values(hs)){const key=name.startsWith('draw')?'draw':'bounds',old=h.R[key];h.allowBindingFault(key);h.R[key]=function(...a){return Reflect.apply(old,this,a);};}
  for(const h of Object.values(hs))as[h.label]=await h.actor(504,true);
  for(const h of Object.values(hs)){const a=as[h.label],ctx=a.frameContext;
   if(name==='filter')ctx.filter='blur(5px)';
   if(name==='matrix')ctx.translate(7,3);
   if(name==='shadowBlur'){ctx.shadowColor='red';ctx.shadowBlur=8;}
   if(name==='shadowOffset'){ctx.shadowColor='red';ctx.shadowOffsetX=6;}
   if(name==='composite')ctx.globalCompositeOperation='copy';
   if(name.startsWith('clip-')&&name!=='clip-binding'){ctx.fillStyle='red';ctx.fillRect(0,0,3,3);ctx.save();ctx.beginPath();ctx.rect(120,170,8,8);ctx.clip();if(name==='clip-restored-sticky')ctx.restore();}
   if(name==='clip-binding')ctx.clip=function(){};
   if(name==='draw-false'){h.allowBindingFault('draw');h.R.draw=()=>false;}
   if(name==='draw-wrapped-warm'){const old=h.R.draw;h.allowBindingFault('draw');h.R.draw=function(...args){return Reflect.apply(old,this,args);};}
   if(name==='bounds-binding'){h.allowBindingFault('bounds');h.R.bounds=()=>[0,0,1,1];}
   if(name==='part-binding')h.c.SpeciesMoves.part=()=>({x:6});
   if(name==='R-object')h.c.ROM_SPRITE_ANIM={...h.R};
   if(name==='frame-resize')a.frame.width=300;
   if(name==='source-resize')a.source.height=300;
   if(name==='notready')h.R.cache['504-front'].ready=false;
   if(name==='unsupported-id'){a.id=509;h.R.cache['509-front']={ready:false,pending:false,promise:Promise.resolve(false)};}
   if(name==='unobservable-matrix')ctx.getTransform=undefined;
  }
  const x=await renderPair(hs.A,hs.B,as,'504-front',0);assert.deepEqual(x.rectA,[0,0,256,256]);assert.deepEqual(x.rectB,[0,0,256,256]);
  if(name==='clip-active-oldpixels')assert.equal(x.a.metrics.clipped,true,'Old pixels outside active clip must remain observed by full readback');
  return{frameAndSourceRGBAExact:true,metricsExact:true,candidateRectangle:x.rectB,oneAmbientReadbackEach:true,scope:name==='unsupported-id'?'Unsupported id509 uses explicit unready cache and prepared504 fallback image only; no509 asset/optimization claim':name};
 });
 for(const name of ['bank-object','data-object','OAM-coordinate','groundBounds'])await step('05-current-input-'+name,async()=>{
  const hs={A:host('A'),B:host('B')},as={};for(const h of Object.values(hs)){await h.R.prepare(['504-front'],{gate:false});as[h.label]=await h.actor(504,true);}
  const before=await renderPair(hs.A,hs.B,as,'504-front',0);
  for(const h of Object.values(hs)){const bank=h.R.cache['504-front'];
   if(name==='bank-object')h.R.cache['504-front']={...bank};
   if(name==='data-object')bank.data=JSON.parse(JSON.stringify(bank.data));
   if(name==='OAM-coordinate'){const p=h.R.parts(bank.data,0)[0];p.o[0]+=21;}
   if(name==='groundBounds')bank.groundBounds=bank.groundBounds.map((v,i)=>v+(i===3?7:0));
  }
  const after=await renderPair(hs.A,hs.B,as,'504-front',0);if(name==='groundBounds')assert.notDeepEqual(after.rectA,before.rectA,'Historical ROI current registration must alter rectangle; no stale token');assert(after.rectA[2]*after.rectA[3]<65536);assert.deepEqual(after.rectB,[0,0,256,256],'Current FULL must not adopt a stale or cropped rectangle');
  return{before:before.rectA,after:after.rectA,currentFullRect:after.rectB,frameSourceMetricsExact:true,currentDataReadEachFrame:true};
 });
 await step('06-added-Rbounds-reference-cost-not-browser-profile',async()=>{
  let calls=0;const t=performance.now();for(const key of keys)for(let tick=0;tick<periods[key];tick++){if(tick%32===0)budget();const b=B.R.bounds(B.R.cache[key].data,tick);assert(b.every(Number.isFinite));calls++;}
  return{calls,elapsedMs:performance.now()-t,scope:'Standalone original R.bounds reference cost only; not total helper overhead, Chrome readback cost, FPS or GPU residency. No R function wrapper/instrumentation.'};
 });
 await step('07-helper-module-before-native-APIs',async()=>{const vm=require('node:vm'),q={};q.window=q;vm.createContext(q);vm.runInContext(pinned(plan.ambientHelper).toString('utf8'),q);assert.equal(q.ROM_SPRITE_ANIM,undefined);assert.equal(q.SpeciesMoves,undefined);return{helperInitializesWithoutRorSpecies:true,bindingCapture:'Only actor birth; no native API read during helper module evaluation'};});
 for(const present of [true,false])await step('08-exact-Unfezant-birth-wrapper-'+present,async()=>{
  const hs={A:host('A'),B:host('B')},as={},calls={A:0,B:0},vm=require('node:vm');
  for(const h of Object.values(hs)){await h.R.prepare(['504-front'],{gate:false});const native=h.R.draw,original={draw:function(...args){calls[h.label]++;return Reflect.apply(native,this,args);}};const factory=vm.runInContext('(function(original,R){return '+pinned(plan.wingWrapper).toString('utf8')+';})',h.c);h.allowBindingFault('draw');h.R.draw=factory(original,h.R);if(present)h.c.UnfezantMoves={fixtureExactWrapperOnly:true};as[h.label]=await h.actor(504,true);}
  const pair=await renderPair(hs.A,hs.B,as,'504-front',0);assert.equal(calls.A,1);assert.equal(calls.B,1);if(present)assert(pair.rectA[2]*pair.rectA[3]<65536);else assert.deepEqual(pair.rectA,[0,0,256,256]);assert.deepEqual(pair.rectB,[0,0,256,256]);
  return{approvedWrapperExactText:true,UnfezantAPIPresent:present,nativeDelegateCalls:calls,candidateRect:pair.rectB,frameSourceMetricsExact:true,scope:'Exact isolated native delegate branch for504, not full399 app/source-order proof or Chrome profile'};
 });
 await step('09-new-actor-context-after-sticky-clip',async()=>{
  const hs={A:host('A'),B:host('B')},old={},fresh={};for(const h of Object.values(hs)){await h.R.prepare(['504-front'],{gate:false});old[h.label]=await h.actor(504,true);const c=old[h.label].frameContext;c.save();c.beginPath();c.rect(0,0,1,1);c.clip();c.restore();}
  const first=await renderPair(hs.A,hs.B,old,'504-front',0);assert.deepEqual(first.rectA,[0,0,256,256],'Historical ROI sticky old context must use FULL before a fresh owner becomes eligible');assert.deepEqual(first.rectB,[0,0,256,256]);for(const h of Object.values(hs))fresh[h.label]=await h.actor(504,true);const second=await renderPair(hs.A,hs.B,fresh,'504-front',0);assert(second.rectA[2]*second.rectA[3]<65536);assert.deepEqual(second.rectB,[0,0,256,256]);return{stickyOldContextFull:true,newHistoricalROIContextEligible:true,currentRuntimeAlwaysFull:true,exactRGBA:true};
 });
 A.stable();B.stable();for(const pin of plan.inputs)pinned(pin);report.status='CPU_EXACT_EQUIVALENCE_ONLY_CHROME_REQUIRED';report.sourceUnchanged=true;report.durationMs=performance.now()-started;report.peakRSSKiB=process.resourceUsage().maxRSS;save();console.log(report.status+' '+report.durationMs+'ms');
}
test('ambient native readback:32 full-cycle source/metrics/fallback/ownership steps in one bounded owner',{timeout:180000},async t=>{try{await main();t.diagnostic(JSON.stringify({logicalCases:report.cases.length,pairedSamples:report.comparedPairs,result:report.status,report:file,sourceUnchanged:report.sourceUnchanged}));}catch(e){report.status='FAIL';report.error=e.stack;report.durationMs=performance.now()-started;save();console.error(e);throw e;}});

