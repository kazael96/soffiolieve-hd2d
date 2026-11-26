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

// Source turn/playBattleEvents unwind audit. Actual MoveFX is loaded above;
// UI snapshots/DOM and synthetic event/native identities are explicit inputs.
const uiSource=fs.readFileSync(sourcePath('battle-ui.js'),'utf8');
function extract(from,to){const a=uiSource.indexOf(from),b=uiSource.indexOf(to,a);assert(a>=0&&b>a);return uiSource.slice(a,b);}
function ui(h){const c=h.c,mutations=[],caption={hidden:false,textContent:'new-action'};
 Object.assign(c,{busy:false,finished:false,storyBattle:null,labBattle:false,trainer:false,escapedBattle:false,partner:{spriteId:572,name:'Minccino'},enemy:{spriteId:510,name:'Liepard'},visualState:{p1:{},p2:{}},visualBattleContext:{},captureVisualContext(){},syncVisualVolatiles(){mutations.push(['sync',c.session]);},snapshotPartner(){mutations.push(['snapshot',c.session]);},updateBattle(){mutations.push(['update',c.session]);},log(text){mutations.push(['log',c.session,text]);},$:()=>caption});
 c.session.battle.log=[];c.session.act=()=>c.session.battle.log.push('old-turn-event');return{c,mutations,caption};
}
function installTurn(h){vm.runInContext(extract('async function turn(', '\nfunction renderParty'),h.c,{filename:'battle-ui.js:actual-turn'});}
function installEvents(h,events){const c=h.c;c.BATTLE_EVENTS={events:()=>events};c.nativeBattleMessage=()=>'';c.moveVisualMultihit=()=>false;c.moveVisualContext=()=>({hitIndex:0,hitCount:3});vm.runInContext(extract('async function playBattleEvents(',"\n$('animationSpeed')"),c,{filename:'battle-ui.js:actual-playBattleEvents'});}
async function newPreview(h){await h.M.preview(3,'p1',0,{cryIds:{p1:572,p2:510},context:{hitIndex:0,hitCount:3}});assert(h.M.active?.preview);return h.M.active;}
for(const phase of ['success','error'])test('same Session turn '+phase+' preserves original UI and MoveFX cleanup',async()=>{
 const h=host(),u=ui(h);await newPreview(h);u.c.playBattleEvents=async()=>{if(phase==='error')throw Error('same-session deliberate failure');};u.c.showOpeningTrainerHint=async()=>{};u.c.GameSpeed.wait=async()=>{};installTurn(h);
 await u.c.turn(0);assert.equal(h.M.active,null);assert.equal(u.c.busy,false);assert.equal(u.caption.hidden,true);assert.equal(u.c.session.cursor,1);assert.equal(u.mutations.filter(v=>v[0]==='snapshot').length,1);assert.equal(u.mutations.filter(v=>v[0]==='sync').length,1);assert.equal(u.mutations.filter(v=>v[0]==='update').length,2);assert.equal(u.mutations.filter(v=>v[0]==='log'&&/deliberate failure/.test(v[2])).length,phase==='error'?1:0);
});
test('obsolete turn success ignores a newer Session UI and actual MoveFX action',async()=>{
 const h=host(),u=ui(h),wait=deferred();u.c.playBattleEvents=()=>wait.promise;installTurn(h);const old=u.c.turn(0);await settle();const oldBattle=u.c.session.battle,nativeActors={p1:u.c.session.active('p1'),p2:u.c.session.active('p2')};
 const nextBattle=Object.assign(Object.create(Object.getPrototypeOf(oldBattle)),oldBattle,{log:['new'],turn:77});
 h.replaceSession({battle:nextBattle,cursor:0});
 assert.notEqual(nextBattle,oldBattle);assert.equal(Object.getPrototypeOf(nextBattle),Object.getPrototypeOf(oldBattle));
 for(const side of ['p1','p2']){let proto=Object.getPrototypeOf(nextBattle),descriptor;while(proto&&!descriptor){descriptor=Object.getOwnPropertyDescriptor(proto,side);proto=Object.getPrototypeOf(proto);}assert.equal(typeof descriptor?.get,'function','Native side is still exposed by its original prototype getter');assert.equal(Object.hasOwn(nextBattle,side),false);assert.equal(nextBattle[side],oldBattle[side]);assert.equal(u.c.session.active(side),nativeActors[side],'Owner replacement preserves the exact native active actor');}
 assert.deepEqual(Array.from(u.c.session.battle.log),['new']);assert.equal(u.c.session.battle.turn,77);assert.equal(u.c.session.cursor,0);const fresh=u.c.session,newJob=h.M.play(3,'p1',h.options());await settle();const newest=h.M.active;assert(newest?.presentationClock);u.c.busy=true;u.caption.hidden=false;u.mutations.length=0;wait.resolve();await old;const kept=h.M.active;assert.equal(kept,newest);assert.equal(u.c.busy,true);assert.equal(u.caption.hidden,false);assert.equal(fresh.cursor,0);assert.equal(u.mutations.length,0);h.M.cancel();await newJob;
});
test('Session replacement during trainer hint cannot run old wait or finally on the new UI',async()=>{
 const h=host(),u=ui(h),wait=deferred(),entered=deferred();let pauses=0;u.c.playBattleEvents=async()=>{};u.c.showOpeningTrainerHint=()=>{entered.resolve();return wait.promise;};u.c.GameSpeed.wait=async()=>pauses++;installTurn(h);const old=u.c.turn(0);await entered.promise;h.replaceSession();const newest=await newPreview(h);u.c.busy=true;u.caption.hidden=false;u.mutations.length=0;wait.resolve();await old;assert.equal(h.M.active,newest);assert.equal(pauses,0);assert.equal(u.c.busy,true);assert.equal(u.caption.hidden,false);assert.equal(u.mutations.length,0);h.M.cancel();
});
for(const phase of ['success','error'])test('same Session event '+phase+' still cancels its held Minccino and cleans old flags',async()=>{
 const h=host(),u=ui(h),wait=deferred(),events=[{kind:'move',side:'p1',args:['doubleslap','p2: target']}];await newPreview(h);installEvents(h,events);u.c.playNativeMove=()=>{u.c.visualState.p1.moveHeld=true;return wait.promise;};const state=u.c.visualState.p1,job=u.c.playBattleEvents([]),outcome=job.catch(e=>e);await settle();assert.equal(state.attacking,true);if(phase==='error')wait.reject(Error('same-session event failure'));else wait.resolve();const result=await outcome;if(phase==='error')assert.match(result.message,/same-session event failure/);assert.equal(h.M.active,null);assert.equal(state.moveHeld,false);assert.equal(state.attacking,false);
});
test('obsolete event success stops before next focusEvent and preserves new visual flags/caption',async()=>{
 const h=host(),u=ui(h),wait=deferred(),events=[{kind:'move',side:'p1',args:['doubleslap','p2: target']},{kind:'move',side:'p1',args:['doubleslap','p2: target']}];let focus=0;u.c.DoubleBattles={normalizeEvents(){},focusEvent(){focus++;}};installEvents(h,events);u.c.playNativeMove=()=>{u.c.visualState.p1.moveHeld=true;return wait.promise;};const state=u.c.visualState.p1,job=u.c.playBattleEvents([]),outcome=job.catch(e=>e);await settle();h.replaceSession();u.c.visualState={p1:{attacking:'new',moveHeld:'new'},p2:{}};const newest=await newPreview(h);u.caption.hidden=false;u.caption.textContent='new caption';wait.resolve();const result=await outcome;assert.match(result.message,/session changed/);assert.equal(h.M.active,newest);assert.equal(focus,1);assert.equal(u.c.visualState.p1.attacking,'new');assert.equal(u.c.visualState.p1.moveHeld,'new');assert.equal(u.caption.hidden,false);assert.equal(u.caption.textContent,'new caption');assert.equal(state.moveHeld,false);assert.equal(state.attacking,false);h.M.cancel();
});