'use strict';
const {repo,sourceRoot,sourcePath,site,fixturePath,readSourceBytes,readFixtureBytes}=require('./helpers/minccino-slap-paths064.cjs');
// Actual Minccino/GEN5 owner/banks from the ONE existing recording/protocol host.
// IO/audio and actor marks below are declared protocol inputs, not PCM/R.draw/Game evidence.
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {make}=require('./helpers/minccino-slap-protocol064.cjs');
const marker='private-native-tail-SPA163/v1',liveHosts=new Set();
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
async function settle(){for(let i=0;i<50;i++)await Promise.resolve();}
function host(){
 const h=make(true),c=h.c,M=c.MoveFX;let serial=0,wait=null,audioWait=null,now=0;
 const timers=new Map(),audio={cancel:0,begin:0,prepared:0,acknowledgements:0};
 const mon=(name,moves)=>({name,level:25,moves});
 c.session=new c.GEN5.Session([mon('Minccino',[3]),mon('Minccino',[3])],[mon('Liepard',[33]),mon('Liepard',[33])],{seed:[1,2,3,4]});
 c.partner=c.session.snapshot('p1');c.enemy=c.session.snapshot('p2');
 c.GameSpeed={rate:1,now:()=>now,flush(){},schedule(fn){const id=++serial;timers.set(id,fn);return id;},cancel(id){timers.delete(id);}};
 const profile=c.SpeciesMoves.select(572,3,{hitIndex:0,hitCount:3});assert.equal(profile.minccinoNativeSlap064,marker);
 const mappedAudio=Object.fromEntries(['p1','p2'].map(side=>[side,JSON.parse(JSON.stringify(c.SpeciesMoves.timeline(M.timeline(c.ROM_MOVE_FX.moves[3],0,0,side,{}),profile).audio))]));
 // Same explicitly declared audio transport as the recording host; original
 // SpeciesMoves.prepare, R.prepare, Minccino verifier/select/sample/part and BPO stay installed.
 c.AudioEngine={cancelMove(){audio.cancel++;},beginMove(){audio.begin++;},preloadMove(){return wait?.promise||Promise.resolve();},async preparePresentation(events,options){
  assert.deepEqual(JSON.parse(JSON.stringify(events)),mappedAudio[options.side]);assert.equal(options.profileSpecies,572);assert.equal(options.profileMarker,marker);assert.equal(options.nativeWaitGroups,false);assert.notEqual(options.side,options.targetSide);
  audio.prepared++;const gate=audioWait;if(gate)await gate.promise;
  return{canPresent:()=>true,acknowledge(){audio.acknowledgements++;},pause(){},resume(){},cancel(){audio.cancel++;},async finish(){}};
 }};
 const options=(hitIndex=0,extra={})=>({cryIds:{p1:572,p2:510},targetSide:'p2',context:{hitIndex,hitCount:3},hold:hitIndex<2,...extra});
 const result=Object.assign(h,{M,timers,audio,options,
  replaceSession(extra={}){const old=c.session;c.session=Object.assign(Object.create(Object.getPrototypeOf(old)),old,extra);assert.notEqual(c.session,old);assert.equal(typeof c.session.active,'function');return c.session;},
  replaceNative(side){const slot=c.session.battle[side],old=slot.active[0],next=slot.pokemon.find(p=>p!==old);assert(next&&next.species.num===old.species.num);slot.active[0]=next;assert.equal(c.session.active(side),next);},
  mutateVisual(kind){if(kind==='layout')c.session.double=true;if(kind==='available')c.partner=null;if(kind==='actor-altered')c.visualState.p1.substitute=true;if(kind==='target-altered')c.visualState.p2.substitute=true;if(kind==='bank-ready')c.ROM_SPRITE_ANIM.cache['510-front'].ready=false;if(kind==='visible-graphic')c.enemy={...c.enemy,id:800};if(kind==='reader-throws')c.BattlePresentationOwners=Object.freeze({read(){throw Error('injected visual owner read failure');}});},
  audioGate(){audioWait=deferred();return audioWait;},releaseAudioGate(){audioWait=null;},gate(){wait=deferred();return wait;},releaseGate(){wait=null;},
  async complete(){await settle();const action=M.active;assert.ok(action&&!action.preview,'New action must actually be active before completion');
   if(action.presentationClock){for(let i=0;i<256&&M.active===action&&!action.preview;i++){now+=1000;const record=M.beginArenaFrame();if(record){const pose=M.speciesPose(action.side,572);if(action.moveId===3){assert(pose.minccinoSlap064?.score,'Actual Minccino source sample/proof');assert.equal(pose.minccinoSlap064.score.frame,record.token.frame);}M.markArenaActor('p1',572);M.markArenaActor('p2',510);M.presentedArenaFrame(record,true);}await settle();}assert.ok(M.active!==action||action.preview,'All actual clock protocol keys complete');}
   else{const fn=timers.get(action.timer);assert.equal(typeof fn,'function');timers.delete(action.timer);fn();await settle();}
  },
  async first(){const job=M.play(3,'p1',options());await this.complete();await job;assert.equal(M.active.preview,true);assert.equal(M.active.nativeSlapCompletedHold064,true);return M.active;},
  async dispose(){M.cancel();wait?.resolve();audioWait?.resolve();await settle();c.renderer.recovery.dispose();h.assertUnchanged(assert);}
 });liveHosts.add(result);return result;
}
test.afterEach(async()=>{try{for(const h of liveHosts)await h.dispose();}finally{liveHosts.clear();global.gc?.();}});

// Additional branches of TWO existing callbacks. Shared protocol host chooses
// real Minccino/Snivy owners for each view; the p1-only legacy host is untouched.
const historicalSourceKeys=[0,20,24,42,44,56,58,60,62,64,66,70,78,80,84,88,92,96,126,...[0,5,10,15,20,22,25,28,33,38,43,47,52,56,100,129].map(n=>60+n/129*66)];
const expectedSourceKeys=[...new Set([...historicalSourceKeys,12,72,90,108,118])].sort((a,b)=>a-b);
assert.equal(new Set(historicalSourceKeys).size,33);assert.equal(expectedSourceKeys.length,38);
async function driveSharedSource(h,owned,action,side,miss){
 let impact;
 for(let i=0;i<256&&h.c.MoveFX.active===action&&!action.preview;i++){
  owned.advance(1000);h.c.ac.rows.length=0;h.frame((i+1)*1000);await h.flush();assert.deepEqual(h.metrics.rafError,[]);
  if(action.presentationClock.value===60&&h.c.MoveFX.active===action)impact=h.c.MoveFX.speciesPose(side,572)?.minccinoSlap064?.score;
 }
 // Passive snapshot of actual original Game-helper begin/mark/presented calls.
 // This does not manufacture an ACK, filter keys, or turn a getter into a draw.
 const snapshot=action.presentationClock.snapshot();assert.deepEqual(Array.from(snapshot.required),expectedSourceKeys);assert.deepEqual(Array.from(snapshot.shown),expectedSourceKeys);assert.equal(snapshot.complete,true);
 assert(impact,'Actual frame60 source sample must exist');assert.equal(impact.frame,60);assert.equal(impact.originalContext.hitCount,miss?0:2);assert.equal(impact.originalContext.hitIndex,action.profile.nativeSlapContext064.hitIndex);assert.equal(impact.originalContext.miss,miss);assert.equal(impact.effectiveImpactFrame,miss?null:60);
 return impact;
}
function checkWarmSource(h,action,side){
 // Capture everything BEFORE mutation. No MoveFX.active getter is read while
 // invalid: its cancellation/recovery guard would contaminate this source test.
 const c=h.c,profile=action.profile,bank=c.ROM_SPRITE_ANIM.cache['572-'+(side==='p1'?'back':'front')],image=bank.image,grounds=bank.groundBounds;
 const sample=()=>c.SpeciesMoves.sample(profile,60,side,true);
 for(const [key,value]of [['closed',true],['complete',false],['naturalWidth',0]]){
  const descriptor=Object.getOwnPropertyDescriptor(image,key);
  try{Object.defineProperty(image,key,{value,writable:true,configurable:true,enumerable:descriptor?.enumerable??true});assert.equal(bank.image,image);assert.throws(sample,/source owner changed/,'Same-image warm mutation '+key+' must reject');}
  finally{if(descriptor)Object.defineProperty(image,key,descriptor);else delete image[key];}
  assert.deepEqual(Object.getOwnPropertyDescriptor(image,key),descriptor);assert.equal(sample().minccinoSlap064.score.frame,60,'Same profile works after exact restore, with no new prepare');
 }
 const descriptor=Object.getOwnPropertyDescriptor(grounds,'0'),before=grounds.slice();
 try{grounds[0]+=1;assert.equal(bank.groundBounds,grounds);assert.throws(sample,/source owner changed/,'Same-grounds warm mutation must reject');}
 finally{Object.defineProperty(grounds,'0',descriptor);}
 assert.equal(bank.groundBounds,grounds);assert.deepEqual(grounds,before);assert.deepEqual(Object.getOwnPropertyDescriptor(grounds,'0'),descriptor);assert.equal(sample().minccinoSlap064.score.frame,60,'Restored grounds reuse the same prepared profile');
}
async function twoHitSources(){
 for(const side of ['p1','p2']){
  const h=make(true);let owned;
  try{
   owned=await h.owned(side,{hold:true},true);const first=h.c.MoveFX.active;assert.equal(first.profile.minccinoNativeSlap064,marker);assert.equal(first.profile.nativeSlapContext064.hitCount,2);assert.equal(first.cryIds[side],572);assert.equal(first.cryIds[side==='p1'?'p2':'p1'],495,'This additional branch uses the shared native Snivy target');
   await driveSharedSource(h,owned,first,side,false);await owned.job;assert.equal(h.c.MoveFX.active,first);assert.equal(first.nativeSlapCompletedHold064,true);
   const session=h.c.session,cryIds={...first.cryIds},job=h.c.MoveFX.play(3,side,{cryIds,context:{hitIndex:1,hitCount:2},hold:false});let failure;job.catch(error=>failure=error);await h.flush();if(failure)throw failure;
   const second=h.c.MoveFX.active;assert(second&&second!==first);assert.equal(h.c.session,session);assert.equal(second.profile.nativeSlapContext064.hitIndex,1);await driveSharedSource(h,owned,second,side,false);await job;assert.equal(h.c.MoveFX.active,null);h.assertUnchanged(assert);
  }finally{try{if(owned)await owned.dispose();}finally{h.c.renderer.recovery.dispose();global.gc?.();}}
 }
}
async function zeroHitSources(){
 // Declared protocol events, not GEN5-engine outcomes or hit-reason evidence.
 for(const side of ['p1','p2']){
  const h=make(true);
  try{for(const kind of ['-miss','-immune','-fail','-notarget']){
   const target=side==='p1'?'p2':'p1',event=Object.freeze({kind,side:target,actor:target+'a: target',args:Object.freeze([])}),context={hitIndex:0,hitCount:0,events:[event]},before=JSON.stringify(context),owned=await h.owned(side,{miss:true,context,hold:false},true);
   try{
    const action=h.c.MoveFX.active;assert(action&&!action.preview);assert.equal(action.miss,true);assert.equal(action.profile.nativeSlapContext064.hitIndex,0);assert.equal(action.profile.nativeSlapContext064.hitCount,0);assert.equal(action.cryIds[target],495);
    if(kind==='-miss')checkWarmSource(h,action,side);
    const impact=await driveSharedSource(h,owned,action,side,true);await owned.job;assert.equal(h.c.MoveFX.active,null,'A valid zero-hit failed attempt never retains the prior hit');assert.equal(JSON.stringify(context),before);assert.equal(impact.m===0&&impact.t===0,false,'Zero-hit has a real tail attempt');h.assertUnchanged(assert);
   }finally{await owned.dispose();}
  }}finally{h.c.renderer.recovery.dispose();global.gc?.();}
 }
}


test('cold delay keeps only the genuine previous572/3body while old timer/audio/promise are retired',async()=>{const h=host(),old=await h.first(),gate=h.gate(),before=h.audio.cancel,started=h.audio.begin,job=h.M.play(3,'p1',h.options(1));await settle();const kept=h.M.active;assert.ok(kept&&kept!==old&&kept.preview);assert.ok(h.audio.cancel>before);assert.equal(h.audio.begin,started);assert.equal(kept.presentationClock,null);assert.equal(kept.presentationAudio,null);assert.equal(kept.presentationRecord,null);for(const key of ['events','audio','visual','clact'])assert.equal(kept.sequence[key].length,0);assert.equal(h.M.speciesPose('p1',572).minccinoSlap064.score.frame,126);assert.equal(h.M.speciesPose('p1',572).minccinoSlap064.hitIndex,0);gate.resolve();h.releaseGate();await h.complete();await job;assert.equal(h.M.active.nativeSlapContext064.hitIndex,1);h.M.cancel();});
test('explicit cancel settles the owned pending caller without waiting for shared IO and cannot resurrect after late success',async()=>{const h=host();await h.first();const gate=h.gate();let ended=false;const job=h.M.play(3,'p1',h.options(1)).then(()=>ended=true);await settle();h.M.cancel();await settle();assert.equal(ended,true);assert.equal(h.M.active,null);const started=h.audio.begin;gate.resolve();h.releaseGate();await settle();assert.equal(h.M.active,null);assert.equal(h.audio.begin,started);await job;});
test('late shared rejection after cancel remains consumed and cannot revive the retained visual',async()=>{const h=host();await h.first();const gate=h.gate(),job=h.M.play(3,'p1',h.options(1));await settle();h.M.cancel();await job;gate.reject(Error('late shared resource failure'));await settle();assert.equal(h.M.active,null);});
test('current cold preparation failure rejects and clears the held body',async()=>{const h=host();await h.first();const gate=h.gate(),job=h.M.play(3,'p1',h.options(1));await settle();gate.reject(Error('injected owned preload failure'));await assert.rejects(job,/owned preload failure/);assert.equal(h.M.active,null);assert.equal(h.timers.size,0);});
for(const changed of ['actor','target','session','bank-data','bank-image'])test('changing real '+changed+' during cold wait invalidates the old preview and future action',async()=>{const h=host();await h.first();const gate=h.gate(),job=h.M.play(3,'p1',h.options(1));await settle();if(changed==='actor')h.replaceNative('p1');if(changed==='target')h.replaceNative('p2');if(changed==='session')h.replaceSession();if(changed==='bank-data')h.c.ROM_SPRITE_ANIM.cache['572-back'].data={};if(changed==='bank-image')h.c.ROM_SPRITE_ANIM.cache['510-front'].image={};assert.equal(h.M.active,null);await settle();await job;gate.resolve();await settle();assert.equal(h.M.active,null);});
for(const bad of ['skipped-index','repeated-index','changed-count','changed-cry','changed-target','miss','other-move','fake-preview'])test('strict continuation rejects '+bad+' rather than recycling the old hold',async()=>{const h=host();await h.first();const gate=h.gate();let o=h.options(1),id=3;if(bad==='skipped-index')o.context.hitIndex=2;if(bad==='repeated-index')o.context.hitIndex=0;if(bad==='changed-count')o.context.hitCount=4;if(bad==='changed-cry')o.cryIds={p1:572,p2:'510'};if(bad==='changed-target')o.targetSide='p1';if(bad==='miss')o.miss=true;if(bad==='other-move')id=10;if(bad==='fake-preview')h.M.active.nativeSlapCompletedHold064=false;const job=h.M.play(id,'p1',o);await settle();assert.equal(h.M.active,null);gate.resolve();h.releaseGate();if(bad==='changed-target')await assert.rejects(job);else if(bad==='miss'){await settle();assert.throws(()=>h.M.speciesPose('p1',572),/Invalid explicit source3 context/,'Positive native hit count plus MISS remains an invalid real source context');h.M.cancel();await job;await zeroHitSources();}else{await h.complete();await job;}h.M.cancel();});
test('last real hit finishes with no held residue; repeated cancellation is idempotent visually',async()=>{const h=host();await h.first();const middle=h.M.play(3,'p1',h.options(1));await h.complete();await middle;assert.equal(h.M.active.preview,true);const last=h.M.play(3,'p1',h.options(2));await h.complete();await last;assert.equal(h.M.active,null);h.M.cancel();h.M.cancel();assert.equal(h.M.active,null);await twoHitSources();});
for(const changed of ['layout','available','actor-altered','target-altered','bank-ready','visible-graphic','reader-throws'])test('a visual '+changed+' change clears retained cold body before another render read',async()=>{const h=host();await h.first();const gate=h.gate(),job=h.M.play(3,'p1',h.options(1));await settle();h.mutateVisual(changed);assert.equal(h.M.active,null);await job;gate.resolve();await settle();assert.equal(h.M.active,null);});
test('cold audio preparation preserves the previous body and cancels its own late controller after explicit cancel',async()=>{const h=host();await h.first();const gate=h.audioGate(),prepared=h.audio.prepared,job=h.M.play(3,'p1',h.options(1));await settle();assert.equal(h.audio.prepared,prepared+1);assert.equal(h.M.active.preparationHold064!==undefined,true);assert.equal(h.M.active.presentationAudio,null);h.M.cancel();await job;const before=h.audio.cancel;gate.resolve();h.releaseAudioGate();await settle();assert.ok(h.audio.cancel>before,'Late prepared controller itself must be cancelled');assert.equal(h.M.active,null);});
test('cold audio preparation rejection propagates while disposing the retained visual',async()=>{const h=host();await h.first();const gate=h.audioGate(),job=h.M.play(3,'p1',h.options(1));await settle();assert.ok(h.M.active.preparationHold064!==undefined);gate.reject(Error('injected private audio preparation failure'));await assert.rejects(job,/private audio preparation failure/);assert.equal(h.M.active,null);});
// Marks above are explicit synthetic clock-protocol inputs, not R.draw mocks,
// exported images, actual arena acknowledgements or proof that a sprite drew.
// Real AudioEngine/window/PCM validation is a separate dedicated contract test;
// realDOM must supply successful native bodies and original draw completion.
