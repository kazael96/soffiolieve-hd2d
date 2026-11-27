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

// Selection, cold proof and source samples above are real. Synthetic marks/audio
// remain protocol inputs; these cases do not claim browser pixels or PCM.
for(const phase of ['preload','audio'])for(const changed of ['session','actor','target'])test('first protected hit rejects same-species '+changed+' replacement during '+phase,async()=>{
 const h=host(),gate=phase==='preload'?h.gate():h.audioGate();let outcome;
 const job=h.M.play(3,'p1',h.options()).then(()=>outcome={kind:'resolved'},error=>outcome={kind:'rejected',message:String(error.message)});
 await settle();if(phase==='audio')assert.equal(h.audio.prepared,1,'Must enter the real second asynchronous preparation');
 if(changed==='session')h.replaceSession();
 if(changed==='actor')h.replaceNative('p1');
 if(changed==='target')h.replaceNative('p2');
 gate.resolve();if(phase==='preload')h.releaseGate();else h.releaseAudioGate();
 await settle();const observed=outcome,active=h.M.active;
 h.M.cancel();await job;
 assert.equal(observed?.kind,'rejected','Owner identity acquired before IO cannot silently transfer to same-species replacement');
 assert.match(observed.message,/owner|ownership|identity/i);assert.equal(active,null);
});
test('first protected hit accepts a cold bank that becomes ready during preparation',async()=>{
 const h=host(),gate=h.gate();h.c.ROM_SPRITE_ANIM.cache['510-front'].ready=false;
 const job=h.M.play(3,'p1',h.options());await settle();h.c.ROM_SPRITE_ANIM.cache['510-front'].ready=true;
 gate.resolve();h.releaseGate();await settle();assert(h.M.active?.presentationClock,'Acquisition identity must not require a ready bank before preparation');
 h.M.cancel();await job;
});
for(const phase of ['preload','audio'])test('an obsolete '+phase+' completion cannot reject or cancel the newer action',async()=>{
 const h=host(),gate=phase==='preload'?h.gate():h.audioGate(),old=h.M.play(3,'p1',h.options());await settle();
 if(phase==='preload')h.releaseGate();else h.releaseAudioGate();
 h.replaceSession();const next=h.M.play(3,'p1',h.options());await settle();const newest=h.M.active;assert(newest?.presentationClock);
 gate.resolve();await settle();await old;assert.equal(h.M.active,newest);h.M.cancel();await next;
});