'use strict';
// PREPARED FAULT TEST, NOT RUN. No production fix or new retry behavior.
const test=require('../liepard-protocol064/registration-collector.cjs').register,assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm'),{fixture,drain,turn}=require('./protocol-host-fixture.cjs'),L=require('../liepard-protocol064/strict-loader.cjs');
const observations=[];
process.once('exit',()=>{if(process.env.C11_PROTOCOL_LEDGER)fs.writeFileSync(process.env.C11_PROTOCOL_LEDGER.replace(/\.json$/,'.g7.json'),JSON.stringify({scope:'G7 actual source fault observations; status is diagnostic, not a test PASS. No real turn/renderer/PCM/network playback.',observations},null,2)+'\n');});
function resourceFault(f){
 const{c}=f,listeners=new Map(),timers=new Map(),requests=[],delays=[],retryAttempts=[],prepareCalls=[],gateCalls=[];let serial=0,broken=true;
 const listen=(name,fn)=>{if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);};
 c.navigator={onLine:true};c.addEventListener=listen;c.removeEventListener=(n,fn)=>listeners.get(n)?.delete(fn);c.document.addEventListener=listen;c.document.removeEventListener=c.removeEventListener;c.TextDecoder=TextDecoder;
 L.run(c,'runtime-assets.js');
 const retry=c.RuntimeAssets.retry;c.RuntimeAssets.retry=(task,options)=>retry(async()=>{retryAttempts.push(retryAttempts.length+1);return task();},{...options,wait:async ms=>{delays.push(ms);}});
 // Real renderer recovery/gate/status methods, without constructing WebGL or claiming a render.
 L.run(c,'world3d.js');
 const Renderer=vm.runInContext('VillageRenderer',c,{filename:'FIXTURE_ONLY/reference-class-no-new-program'}),recovery=new c.RuntimeAssets.Recovery({setTimer:(fn,ms)=>{timers.set(++serial,{fn,ms});return serial;},clearTimer:id=>timers.delete(id)}),renderer=Object.assign(Object.create(Renderer.prototype),{ready:true,assetsReady:true,canvas:{dataset:{}},recovery,sceneWaiters:[]});
 const resourceGate=renderer.resourceGate;renderer.resourceGate=function(...a){gateCalls.push(a[0]);return resourceGate.apply(this,a);};c.renderer=renderer;
 const key='510-front',bank=c.ROM_SPRITE_ANIM.cache[key],prepare=c.ROM_SPRITE_ANIM.prepare;
 c.ROM_SPRITE_ANIM.prepare=function(keys,options){prepareCalls.push({keys:[...keys],options});return prepare.call(this,keys,options);};
 c.RuntimeAssets.json=async src=>{requests.push({type:'json',src,broken});if(broken)throw Error('G7 temporary resource unavailable');return bank.data;};
 c.RuntimeAssets.image=async src=>{requests.push({type:'image',src,broken});if(broken)throw Error('G7 temporary resource unavailable');return bank.image;};
 function removeBank(){delete c.ROM_SPRITE_ANIM.cache[key];}
 function restoredArrival(){broken=false;c.ROM_SPRITE_ANIM.cache[key]=bank;}
 function emit(name){for(const fn of listeners.get(name)||[])fn();}
 async function exhaust(){for(let i=0;i<40&&retryAttempts.length<2;i++)await turn();await drain();assert.equal(retryAttempts.length,2,'Both actual RuntimeAssets.retry task attempts must fail');assert.equal(requests.filter(x=>x.type==='image').length,2);assert(prepareCalls.some(x=>x.options?.gate===false),'Must reach actual stage adapter gate:false prepare');}
 async function wake(){c.navigator.onLine=false;c.document.hidden=true;emit('offline');emit('visibilitychange');restoredArrival();c.navigator.onLine=true;emit('online');c.document.hidden=false;emit('visibilitychange');await drain();for(let i=0;i<6&&timers.size;i++){const[id,t]=timers.entries().next().value;timers.delete(id);t.fn();await drain();await turn();}const button=c.protocolLoading()?.children?.find(x=>typeof x.onclick==='function');if(button)button.onclick();await drain();await turn();}
 return{removeBank,restoredArrival,exhaust,wake,requests,delays,retryAttempts,prepareCalls,gateCalls,recovery,timers,dispose(){recovery.dispose();timers.clear();}};
}
for(const phase of ['initial-prepare','active-resize'])test('G7 '+phase+' two exhausted resource attempts keep the same M.play recoverable on online/visible/manual without replay',async()=>{
 const f=fixture(),{c,stage}=f;let job,fault;const row={phase,expectation:'same original call remains recoverable without replay; resource failure is not a permanent geometry/owner rejection'};observations.push(row);
 try{
  let plays=0;const play=c.MoveFX.play;c.MoveFX.play=function(...a){plays++;return play.apply(this,a);};
  if(phase==='active-resize'){job=f.start();await f.active(job);assert.equal(c.SpeciesMoves.beforeArenaFrame(),true);}
  fault=resourceFault(f);fault.removeBank();const turnBefore=c.session.battle.turn;
  if(phase==='initial-prepare')job=f.start();else f.resize(844,234);
  await fault.exhaust();row.settledAfterTwoFailures=job.settled;row.errorAfterTwoFailures=job.error?.message;row.activeAfterTwoFailures=!!c.MoveFX.active;row.recoveryEntriesAfterFailures=fault.recovery.entries.size;row.readyAfterFailures=c.renderer.ready;
  await fault.wake();row.settledAfterReturn=job.settled;row.errorAfterReturn=job.error?.message;row.activeAfterReturn=!!c.MoveFX.active;row.playCalls=plays;row.nativeTurnBefore=turnBefore;row.nativeTurnAfter=c.session.battle.turn;row.retryTaskAttempts=fault.retryAttempts.length;row.retryWaits=fault.delays;row.prepareCalls=fault.prepareCalls;row.resourceGateCalls=fault.gateCalls;row.resourceRequests=fault.requests;row.stageStats=stage.stats;row.manualRetryAvailable=!!c.protocolLoading()?.children?.some(x=>typeof x.onclick==='function');
  assert.equal(plays,1,'Do not replay M.play to manufacture recovery');assert.equal(c.session.battle.turn,turnBefore,'No native turn is executed or replayed by this protocol fixture');
  assert.equal(job.settled,false,'Exhausting two temporary resource attempts must retain the original caller for bounded/event/manual recovery');
  if(phase==='initial-prepare'){const audio=await Promise.race([c.protocolAudioReached.promise,job.promise.then(()=>{throw job.error||Error('Original call ended during resource recovery');})]);audio.gate.resolve();await drain();}
  else await f.ready();
  assert(c.MoveFX.active,'Original call must be able to become/remain active');assert.equal(c.MoveFX.assertNativeScratchOwner064(c.MoveFX.active),true);assert.equal(job.error,undefined);
 }finally{fault?.dispose();await f.close(job);}
});
