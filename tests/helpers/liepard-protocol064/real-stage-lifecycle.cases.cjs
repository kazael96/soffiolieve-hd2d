'use strict';
// PREPARED, NOT RUN. Real C11 M.play/acquireProfile/lease/stage/controller;
// native data + real Session, explicit Canvas-operation/audio-transport stand-ins.
// No fake raster/ACK supplied as evidence of a drawn native frame.
const test=require('./registration-collector.cjs').register,assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{create}=require('./real-stage-host.cjs'),L=require('./strict-loader.cjs');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const drain=async()=>{for(let i=0;i<40;i++)await Promise.resolve();};
const turn=()=>new Promise(setImmediate);
const attestations=[],rss=[];
process.once('exit',()=>{if(process.env.C11_PROTOCOL_LEDGER)fs.writeFileSync(process.env.C11_PROTOCOL_LEDGER.replace(/\.json$/,'.real-stage.json'),JSON.stringify({status:'ACTUAL_EXECUTION_ATTESTATIONS_NOT_PREPARATION_PASS',scope:'Only executed CPU protocol fixtures. Audio transport and Canvas operations are stand-ins.',attestations,rssSnapshots:rss,maximumObservedRSS:Math.max(0,...rss)},null,2)+'\n');});
function fixture(){const h=create({variant:'v4.1'}),e=h.setup('p2',390,490),c=h.c,stage=c.LiepardMoves.staging064;assert.equal(h.pins.privateLiepard,L.contract.sourceLFHashes['liepard-moves.js']);assert.equal(h.pins.privateBG,'828451711278ffe5c72d351b53109f7597bbb08e19bfe92e16bb8496bd47a19e');assert(h.pins.actualVMCompilations.every(p=>p.compiledTextRoundTripExact&&p.rawSHA256===p.actualCompiledUTF8SHA256));
 attestations.push(h.pins);rss.push(process.memoryUsage().rss);assert(rss.at(-1)<400*1024*1024,'observed fixture RSS must remain below400MiB');
 function start(){let error,settled=false;const promise=c.MoveFX.play(10,e.side,{cryIds:e.cryIds,targetSide:'p1'}).catch(x=>{error=x;}).finally(()=>settled=true);return{promise,get error(){return error;},get settled(){return settled;}};}
 async function active(job){const audio=await Promise.race([c.protocolAudioReached.promise,job.promise.then(()=>{throw job.error||Error('Call settled before real audio await');})]);assert.equal(c.MoveFX.active,null);audio.gate.resolve();await drain();assert(c.MoveFX.active,'Audio return must reach actual active commit');return{action:c.MoveFX.active,audio};}
 async function close(job){c.MoveFX.cancel();await job?.promise;assert(stage.stats.coldSAT<=8192*stage.stats.compilations,'unchanged per-compilation SAT budget');rss.push(process.memoryUsage().rss);assert(rss.at(-1)<400*1024*1024,'observed fixture RSS must remain below400MiB');stage.clear();global.gc?.();}
 function resize(w,h){c.SpeciesMoves.beforeArenaResize();c.arena.width=w;c.arena.height=h;return c.SpeciesMoves.afterArenaResize();}
 function gateNextStage(){const original=stage.prepare,gate=deferred(),calls=[];stage.prepare=async function(...args){calls.push(args);await gate.promise;return original.apply(this,args);};return{gate,calls,restore(){stage.prepare=original;}};}
 async function blocked(){await turn();await drain();}
 async function ready(){for(let i=0;i<10000;i++){c.syncBattleActorFraming();if(c.MoveFX.beforeArenaFrame?.(c.arena.width,c.arena.height)!==false&&c.SpeciesMoves.beforeArenaFrame())return;await turn();}throw Error('Fixture did not reach ready within10000 cooperative turns');}
 return{h,e,c,stage,start,active,close,resize,gateNextStage,blocked,ready};}

test('real acquisition marks only initially supported native singles even while banks are cold; selection stays unmarked and lazy',async()=>{
 const f=fixture(),{c,e,stage}=f,p=e.p,o={side:e.side,targetSide:'p1',cryIds:e.cryIds};try{
  assert.equal(p.liepardNativeScratch064,undefined);assert.equal(c.LiepardMoves.layoutBarrier064,undefined);const key='510-front',bank=c.ROM_SPRITE_ANIM.cache[key];bank.ready=false;
  const marked=c.LiepardMoves.acquireProfile064(p,o);assert.notEqual(marked,p);assert.equal(marked.liepardNativeScratch064,'private-native-claw-SPA170');assert.equal(p.liepardNativeScratch064,undefined);assert.equal(stage.stats.compilations,0);assert.equal(c.LiepardMoves.layoutBarrier064,undefined);bank.ready=true;
 }finally{await f.close();}
});

test('preview uses actual previous preparation/pose with no marker or lazy barrier installation',async()=>{
 const f=fixture(),{c,e,stage}=f;try{const before=c.protocolTrace.previousPrepare.length,frames=await c.MoveFX.preview(10,e.side,0,{cryIds:e.cryIds});assert.equal(frames,126);const action=c.MoveFX.active;assert.equal(action.preview,true);assert.equal(action.profile.liepardNativeScratch064,undefined);assert(c.protocolTrace.previousPrepare.length>before);assert.equal(stage.stats.compilations,0);assert.equal(c.LiepardMoves.layoutBarrier064,undefined);const body=c.SpeciesMoves.pose(action.profile,55,e.side,e.side,false,e.layout);assert.deepEqual(body,stage.baselinePose(action.profile,55,e.side,e.side,false,e.layout));}finally{await f.close();}
});

for(const kind of ['double','multi','altered','targetSide','cryIds','species','missing-owner'])test('initial unsupported '+kind+' preserves previous profile/preparation/pose instead of opting in',async()=>{
 const f=fixture(),{c,e,stage}=f,p=e.p,o={side:e.side,targetSide:'p1',cryIds:{...e.cryIds}};try{
  if(kind==='double')c.session.double=true;else if(kind==='multi')c.session.multi=true;else if(kind==='altered')c.visualState.p2.substitute=true;else if(kind==='targetSide')o.targetSide=e.side;else if(kind==='cryIds')o.cryIds.p2=509;else if(kind==='species')c.session.battle.p1.active[0].species={num:495};else c.BattlePresentationOwners={read:()=>({layoutSupported:false})};
  assert.equal(c.LiepardMoves.acquireProfile064(p,o),p);const before=c.protocolTrace.previousPrepare.length;await c.SpeciesMoves.prepare(p,o);assert.equal(c.protocolTrace.previousPrepare.length,before+1);assert.equal(c.protocolTrace.previousPrepare.at(-1)[0],p);assert.equal(c.protocolTrace.previousPrepare.at(-1)[1],o);assert.equal(c.LiepardMoves.layoutBarrier064,undefined);assert.equal(stage.stats.compilations,0);assert.deepEqual(c.SpeciesMoves.pose(p,55,e.side,e.side,false,e.layout),stage.baselinePose(p,55,e.side,e.side,false,e.layout));
 }finally{await f.close();}
});

test('actual M.play passes original early lease into real stage hit/miss preparation and active commit, with hot pose ready',async()=>{
 const f=fixture(),{c,e,stage}=f;let job;try{
  const captured=[] ,prepare=c.SpeciesMoves.prepare;c.SpeciesMoves.prepare=function(...args){captured.push(args);return prepare.apply(this,args);};
  job=f.start();const{action}=await f.active(job);assert.equal(captured.length,1);const[p,opts]=captured[0];assert.equal(p,action.profile);assert.equal(p.liepardNativeScratch064,'private-native-claw-SPA170');assert.equal(opts.nativeScratchLease064,action.nativeScratchLease064);assert.equal(action.nativeScratchLease064.owner,c.session);assert.equal(action.nativeScratchLease064.battle,c.session.battle);assert.equal(action.nativeScratchLease064.actors.p2,c.session.active('p2'));assert.equal(action.nativeScratchGeneration064,c.MoveFX.generation);assert.equal(c.MoveFX.assertNativeScratchOwner064(action),true);assert.equal(stage.lookupStatus(p,e.layout,e.side,false).ready,true);assert.equal(stage.lookupStatus(p,e.layout,e.side,true).ready,true);assert.equal(stage.stats.compilations,2);
  const before=stage.stats;for(let i=0;i<128;i++)c.SpeciesMoves.pose(p,i%127,e.side,e.side,false,e.layout);const after=stage.stats;assert.equal(after.coldSAT,before.coldSAT);assert.equal(after.compilations,before.compilations);assert.equal(after.canvasReads,0);
 }finally{await f.close(job);}
});

test('cold bank await keeps the original M.play owner lease; same-species target replacement cannot be reacquired by prepareInitial',async()=>{
 const f=fixture(),{c,e,stage}=f,gate=deferred(),keys=[];let job;try{
  c.ROM_SPRITE_ANIM.cache['510-front'].ready=false;c.ROM_SPRITE_ANIM.prepare=async(k,options)=>{keys.push({k,options});await gate.promise;for(const key of k)c.ROM_SPRITE_ANIM.cache[key].ready=true;};
  job=f.start();await drain();assert.equal(keys.length,1);assert.equal(keys[0].options.gate,false);const old=c.session.battle.p1.active[0];c.session.battle.p1.active[0]={...old};gate.resolve();await job.promise;assert.match(job.error?.message||'',/STALE_PREPARATION_OWNER/);assert.equal(c.MoveFX.active,null);assert.equal(c.protocolTrace.audio.length,0);assert.equal(stage.stats.compilations,0);
 }finally{gate.resolve();await f.close(job);}
});

for(const owner of ['Session','actor','target'])test('real marked active '+owner+' loss is rejected before clear and old pose never falls back',async()=>{
 const f=fixture(),{c,e}=f;let job;try{job=f.start();const{action,audio}=await f.active(job);assert.equal(c.SpeciesMoves.beforeArenaFrame(),true);if(owner==='Session')c.session={...c.session};else{const side=owner==='actor'?'p2':'p1';c.session.battle[side].active[0]={...c.session.battle[side].active[0]};}assert.throws(()=>c.SpeciesMoves.pose(action.profile,55,e.side,e.side,false,e.layout),/owner|acquired|STALE/i);assert.equal(c.MoveFX.beforeArenaFrame(390,490),false);await job.promise;assert(job.error);assert.equal(c.MoveFX.active,null);assert(audio.cancelled>0);assert.equal(c.protocolTrace.canvas.length,0);}finally{await f.close(job);}
});

for(const snapshot of [false,true])test('real resize pending '+(snapshot?'with':'without')+' completed protocol snapshot owns its loading/cache; canonical cancel stops pending stage',async()=>{
 const f=fixture(),{c,stage}=f;let job,gated;try{
  job=f.start();const{action,audio}=await f.active(job);assert.equal(c.SpeciesMoves.beforeArenaFrame(),true);
  if(snapshot){const ack={frame:60,key:true};c.SpeciesMoves.afterArenaFrame({record:{action,token:{id:1,frame:60}},ack,completed:true,drawable:true});}
  gated=f.gateNextStage();assert.equal(f.resize(844,234),false);await f.blocked();assert.equal(gated.calls.length,1);const controller=c.LiepardMoves.layoutBarrier064.controller;
  assert.equal(controller.status.hasFrozen,snapshot);const copies=c.protocolTrace.canvas.filter(a=>a[0]==='surface'&&a[1]==='copy');assert.equal(copies.length,snapshot?1:0);
  if(snapshot){assert.equal(c.protocolLoading(),null);assert(c.protocolTrace.canvas.some(a=>a[0]==='arena'&&a[1]==='copy'));}
  else{const box=c.protocolLoading();assert(box);assert.equal(box.children[0].textContent,'Caricamento della lotta…');assert.equal(c.renderer.ready,true);box.remove();assert.equal(c.protocolLoading(),null);assert.equal(c.SpeciesMoves.beforeArenaFrame(),false);assert(c.protocolLoading(),'Pending no-snapshot loading must be recreated');}
  const before=stage.stats;c.MoveFX.cancel();assert.equal(controller.status.phase,'CANCELLED');assert.equal(controller.status.hasFrozen,false);assert.equal(c.protocolLoading(),null);assert(audio.cancelled>0);gated.gate.resolve();await job.promise;await f.blocked();assert.equal(c.MoveFX.active,null);assert.equal(stage.stats.compilations,before.compilations);assert.equal(job.error,undefined);
 }finally{gated?.gate.resolve();gated?.restore();await f.close(job);}
});

for(const snapshot of [false,true])test('real resized current stage error '+(snapshot?'with':'without')+' cache rejects owner once, closes owned loading, and never resumes',async()=>{
 const f=fixture(),{c}=f;let job,gated;try{
  job=f.start();const{action,audio}=await f.active(job);assert.equal(c.SpeciesMoves.beforeArenaFrame(),true);if(snapshot)c.SpeciesMoves.afterArenaFrame({record:{action,token:{id:2,frame:60}},ack:{frame:60,key:true},completed:true,drawable:true});
  gated=f.gateNextStage();assert.equal(f.resize(844,234),false);await f.blocked();assert.equal(gated.calls.length,1);const error=new (require('node:vm').runInContext('Error',c,{filename:'FIXTURE_ONLY/same-VM-error-constructor'}))('Deliberate current-stage resize failure');gated.gate.reject(error);await job.promise;await f.blocked();assert.equal(job.error,error);assert.equal(c.MoveFX.active,null);assert(audio.cancelled>0);assert.equal(c.protocolLoading(),null);const controller=c.LiepardMoves.layoutBarrier064.controller;assert.equal(controller.status.phase,'FAILED');assert.equal(controller.status.hasFrozen,false);
 }finally{gated?.gate.resolve();gated?.restore();await f.close(job);}
});

test('real successive rotations retain one original snapshot; stale layout stage job cannot overwrite the newest plan',async()=>{
 const f=fixture(),{c,stage}=f;let job,gated;try{
  job=f.start();const{action}=await f.active(job);assert.equal(c.SpeciesMoves.beforeArenaFrame(),true);c.SpeciesMoves.afterArenaFrame({record:{action,token:{id:3,frame:60}},ack:{frame:60,key:true},completed:true,drawable:true});
  gated=f.gateNextStage();f.resize(844,234);await f.blocked();assert.equal(gated.calls.length,1);f.resize(1280,475);assert.equal(c.protocolTrace.canvas.filter(a=>a[0]==='surface'&&a[1]==='copy').length,1);gated.gate.resolve();await f.ready();assert.equal(job.error,undefined);assert.equal(c.MoveFX.active,action);assert.equal(stage.lookupStatus(action.profile,c.BattleGround.layout(1280,475),'p2',false).ready,true);assert(gated.calls.length>=2);
 }finally{gated?.gate.resolve();gated?.restore();await f.close(job);}
});

test('canonical cancel survives a throwing layout callback and preserves callback error on old action',async()=>{
 const f=fixture(),{c}=f;let job;try{job=f.start();const{action,audio}=await f.active(job),error=Error('Deliberate layout cleanup observer failure');c.SpeciesMoves.cancelLayoutPreparation=()=>{throw error;};assert.doesNotThrow(()=>c.MoveFX.cancel());await job.promise;assert.equal(c.MoveFX.active,null);assert.equal(action.nativeScratchCleanupError064,error);assert(audio.cancelled>0);assert.equal(job.error,undefined);}finally{await f.close(job);}
});

test('canonical owner failure survives a throwing layout callback and preserves original failure reason',async()=>{
 const f=fixture(),{c}=f;let job;try{job=f.start();const{action,audio}=await f.active(job),callback=Error('Deliberate failure cleanup observer error'),cause=new (require('node:vm').runInContext('Error',c,{filename:'FIXTURE_ONLY/same-VM-error-constructor'}))('Deliberate geometry error');c.SpeciesMoves.cancelLayoutPreparation=()=>{throw callback;};assert.equal(c.MoveFX.failLayoutPreparation(action,c.MoveFX.generation,cause),true);await job.promise;assert.equal(job.error,cause);assert.equal(action.nativeScratchCleanupError064,callback);assert.equal(c.MoveFX.active,null);assert(audio.cancelled>0);assert.equal(c.MoveFX.failLayoutPreparation(action,c.MoveFX.generation,cause),false);}finally{await f.close(job);}
});
