'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const repo=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(repo,'src',f),'utf8'),drain=()=>new Promise(setImmediate);
function host({deferredPrepare=false}={}){
 const c=require(path.join(repo,'tests/helpers/finale-moves-host.cjs')).setup(),timers=new Map(),events=[],listeners={};let now=0,n=0,resolvePrepare,resolveTail,blocked=false;
 c.performance={now:()=>now};c.setTimeout=(fn,ms)=>({fn,ms});c.clearTimeout=()=>{};c.Image=class{constructor(){this.complete=true;this.naturalWidth=16;}};
 c.session={battle:{p1:{active:[{species:{num:500}}]},p2:{active:[{species:{num:500}}]}},double:false,multi:false}; // Native-session policy stub, not mechanics proof.
 c.visualState={p1:{},p2:{}};c.partner={name:'Emboar',id:500};c.enemy={name:'Emboar',id:500};for(const view of['front','back'])c.ROM_SPRITE_ANIM.cache['500-'+view].image={policyStub:true};
 c.document={hidden:false,addEventListener(type,fn){listeners[type]=fn;}};
 c.GameSpeed={rate:4,now:()=>now,schedule(fn,ms){timers.set(++n,{fn,ms});return n;},cancel(id){timers.delete(id);},flush(){events.push('flush');}};
 const transport={canPresent(){return !blocked;},acknowledge(f,next){events.push(['audioAck',f,next]);},pause(f){events.push(['pause',f]);},resume(f){events.push(['resume',f]);},cancel(){events.push('audioCancel');},finish(){events.push('finish');return new Promise(resolve=>resolveTail=resolve);},status(){return{policyStub:true};}};
 c.AudioEngine={cancelMove(){},async preloadMove(){},beginMove(){events.push('legacyBegin');},preparePresentation:deferredPrepare?()=>new Promise(resolve=>resolvePrepare=resolve):async()=>transport};
 const site=process.env.SOFFIOLIEVE_TEST_SITE||path.join(repo,'_site');
 vm.runInContext(fs.readFileSync(path.join(site,'assets/move-fx-data.js'),'utf8'),c,{filename:'assets/move-fx-data.js'});
 vm.runInContext(read('native-visual.js'),c,{filename:'native-visual.js'});
 const game=read('game.js'),start=game.indexOf('window.BattlePresentationOwners=Object.freeze'),end=game.indexOf('\nfunction drawArena(){',start);
 assert(start>=0&&end>start);vm.runInContext(game.slice(start,end),c,{filename:'game-owner-reader.js'});
 vm.runInContext(read('battle-presentation.js'),c,{filename:'battle-presentation.js'});
 vm.runInContext(read('move-fx.js'),c,{filename:'move-fx.js'});
 return{c,timers,events,transport,listeners,setNow:v=>now=v,setBlocked:v=>blocked=v,prepareReady:()=>resolvePrepare?.(transport),tailReady:()=>resolveTail?.()};
}
test('production actual MoveFX code holds every500 authored key and completes only after acknowledged final and owned tail',async()=>{
 for(const id of[205,360]){
  const h=host(),M=h.c.MoveFX,pending=M.play(id,'p1',{cryIds:{p1:500,p2:500}});await drain();
  assert.equal(h.timers.size,0);assert(!h.events.includes('legacyBegin'));
  const expected=id===205?[0,11/41*60,25,38,48,60,63,84,60+30/71*66,98,107,116,126]:[0,24/84*60,25,36,48,60,63,88,102,110,119,126];
  const seen=[];for(let i=0;i<expected.length;i++){
   h.setNow((i+1)*10000);const token=M.beginArenaFrame(),frame=token.token.frame;
   M.speciesPose('p1',500);M.speciesPose('p1',500);assert.equal(M.presentationState().clock.value,frame);
   M.markArenaActor('p1',500);M.markArenaActor('p2',500);const ack=M.presentedArenaFrame(token,true);assert(ack);seen.push(ack.frame);
  }
  assert.deepEqual(seen,expected);await drain();assert(M.active);assert.equal(M.presentationState().completing,true);assert.equal(M.beginArenaFrame(),null);
  h.tailReady();await pending;assert.equal(M.active,null);assert.equal(h.events.filter(e=>e==='flush').length,2); // original play cancel + final finish
  assert.deepEqual(h.events.filter(e=>Array.isArray(e)&&e[0]==='audioAck').map(e=>e[1]),expected);
 }
});
test('a suspended action-audio owner holds the real controller and resumes only with a new native draw',async()=>{
 const h=host(),M=h.c.MoveFX,playing=M.play(205,'p1',{cryIds:{p1:500,p2:500}});await drain();
 const first=M.beginArenaFrame();M.markArenaActor('p1',500);M.markArenaActor('p2',500);assert.ok(M.presentedArenaFrame(first,true));
 h.setNow(20);const stale=M.beginArenaFrame(),value=M.presentationState().clock.value;h.setBlocked(true);
 assert.equal(M.beginArenaFrame(),null);assert.equal(M.presentationState().paused,true);assert.equal(M.presentedArenaFrame(stale,true),false);
 h.setNow(100000);assert.equal(M.beginArenaFrame(),null);assert.equal(M.presentationState().clock.value,value);assert.equal(h.events.filter(e=>Array.isArray(e)&&e[0]==='pause').length,1);
 h.setBlocked(false);const fresh=M.beginArenaFrame();assert.notEqual(fresh,stale);assert.equal(fresh.token.frame,value);assert.equal(M.presentationState().paused,false);
 assert.equal(M.presentedArenaFrame(stale,true),false);M.markArenaActor('p1',500);M.markArenaActor('p2',500);assert.ok(M.presentedArenaFrame(fresh,true));
 M.cancel();await playing;
});
test('an audio owner cancelled by its interruption watchdog can release the visual hold and finish silently',async()=>{
 const h=host(),M=h.c.MoveFX,playing=M.play(205,'p1',{cryIds:{p1:500,p2:500}});await drain();h.setBlocked(true);assert.equal(M.beginArenaFrame(),null);
 // The real bridge watchdog owns cancellation. This transport-level stub
 // models its subsequent canPresent=true; the watchdog itself has21 tests.
 h.setBlocked(false);for(let n=0;n<13;n++){h.setNow((n+1)*10000);const frame=M.beginArenaFrame();M.markArenaActor('p1',500);M.markArenaActor('p2',500);assert.ok(M.presentedArenaFrame(frame,true));}
 await drain();h.tailReady();await playing;assert.equal(M.active,null);assert.equal(h.timers.size,0);
});
test('an audio presentation predicate error rejects the action and releases ownership',async()=>{
 const h=host(),M=h.c.MoveFX,playing=M.play(205,'p1',{cryIds:{p1:500,p2:500}});await drain();h.transport.canPresent=()=>{throw Error('Owner observation failed');};
 const rejected=assert.rejects(playing,/Owner observation failed/);assert.equal(M.beginArenaFrame(),null);await rejected;assert.equal(M.active,null);assert.ok(h.events.includes('audioCancel'));
});
test('double, multi and non-battle contexts retain the legacy path until physical-slot presentation is verified',async()=>{
 for(const session of[null,{battle:{},double:true},{battle:{},multi:true}]){
  const h=host();h.c.session=session;const playing=h.c.MoveFX.play(205,'p1',{cryIds:{p1:500,p2:500}});await drain();
  assert.equal(h.c.MoveFX.presentationState(),null);assert.equal(h.timers.size,1);assert.ok(h.events.includes('legacyBegin'));assert.equal(h.events.filter(e=>Array.isArray(e)&&e[0]==='audioAck').length,0);
  h.c.MoveFX.cancel();await playing;
 }
});
test('altered or hidden visual bodies cannot select a controller that would wait forever for raw-identity draw marks',async()=>{
 for(const flag of['substitute','minimized','hidden','faint']){
  const h=host(),M=h.c.MoveFX;h.c.visualState.p2[flag]=true;let preparations=0;h.c.AudioEngine.preparePresentation=async()=>{preparations++;return h.transport;};
  const playing=M.play(205,'p1',{cryIds:{p1:500,p2:500}});await drain();assert.equal(M.presentationState(),null,'Unsupported visual body entered protected raw-identity controller');assert.equal(h.timers.size,1);assert.equal(preparations,0);M.cancel();await playing;
 }
});
test('unready or mismatched graphics retain the legacy path before presentation audio preparation',async()=>{
 for(const kind of['unready','graphic','hiddenSide']){
  const h=host(),M=h.c.MoveFX;let preparations=0;h.c.AudioEngine.preparePresentation=async()=>{preparations++;return h.transport;};
  if(kind==='unready')h.c.ROM_SPRITE_ANIM.cache['500-front'].ready=false;if(kind==='graphic')h.c.enemy={name:'Snivy',id:495};
  const playing=M.play(205,'p1',{cryIds:{p1:500,p2:500},hiddenSides:kind==='hiddenSide'?['p2']:[]});await drain();assert.equal(M.presentationState(),null);assert.equal(h.timers.size,1);assert.equal(preparations,0);M.cancel();await playing;
 }
});
test('first500contact controller does not claim nonmirror or disguised-native contexts',async()=>{
 for(const id of[495,571]){
  const h=host(),M=h.c.MoveFX;h.c.session.battle.p2.active[0].species.num=id;
  const playing=M.play(205,'p1',{cryIds:{p1:500,p2:500}});await drain();assert.equal(M.presentationState(),null);assert.equal(h.timers.size,1);M.cancel();await playing;
 }
});
test('failed/hidden draws do not release audio, and visibility pause invalidates a stale actual MoveFX token',async()=>{
 const h=host(),M=h.c.MoveFX,playing=M.play(205,'p2',{cryIds:{p1:500,p2:500}});await drain();const first=M.beginArenaFrame();
 assert.equal(M.presentedArenaFrame(first,false),false);assert.equal(h.events.filter(e=>Array.isArray(e)&&e[0]==='audioAck').length,0);
 h.setNow(100);assert.equal(M.beginArenaFrame().token,first.token);h.c.document.hidden=true;h.listeners.visibilitychange();assert.equal(M.presentedArenaFrame(first,true),false);
 h.setNow(10000);h.c.document.hidden=false;const fresh=M.beginArenaFrame();assert.notEqual(fresh.token,first.token);assert.equal(fresh.token.frame,0);assert.equal(M.presentedArenaFrame(first,true),false);M.markArenaActor('p1',500);M.markArenaActor('p2',500);assert(M.presentedArenaFrame(fresh,true));
 M.cancel();await playing;assert(h.events.includes('audioCancel'));assert.equal(M.active,null);
});
test('cancelled asynchronous audio preparation is discarded before any active move or frame exists',async()=>{
 const h=host({deferredPrepare:true}),M=h.c.MoveFX,pending=M.play(205,'p1',{cryIds:{p1:500,p2:500}});await drain();assert.equal(M.active,null);
 M.cancel();h.prepareReady();await pending;assert.equal(M.active,null);assert(h.events.includes('audioCancel'));assert.equal(h.timers.size,0);
});

test('visual ownership changed during cold audio preparation falls back before acquiring raw draw marks',async()=>{
 const h=host({deferredPrepare:true}),M=h.c.MoveFX,pending=M.play(205,'p1',{cryIds:{p1:500,p2:500}});await drain();
 h.c.visualState.p2.substitute=true;h.prepareReady();await drain();
 assert.equal(M.presentationState(),null);assert.equal(h.timers.size,1);assert(h.events.includes('audioCancel'));assert(h.events.includes('legacyBegin'));
 M.cancel();await pending;
});

test('late audio preparation failures cannot reject a cancelled action or start an obsolete body',async()=>{
 const h=host(),M=h.c.MoveFX;let rejectAudio;h.c.AudioEngine.preparePresentation=()=>new Promise((resolve,reject)=>rejectAudio=reject);
 const pending=M.play(205,'p1',{cryIds:{p1:500,p2:500}});await drain();M.cancel();rejectAudio(Error('Late resource failure'));await pending;
 assert.equal(M.active,null);assert.equal(h.timers.size,0);assert(!h.events.includes('legacyBegin'));
});

test('current audio preparation failures propagate with no active body or timer',async()=>{
 const h=host(),M=h.c.MoveFX;h.c.AudioEngine.preparePresentation=async()=>{throw Error('Resource unavailable');};
 await assert.rejects(M.play(205,'p1',{cryIds:{p1:500,p2:500}}),/Resource unavailable/);assert.equal(M.active,null);assert.equal(h.timers.size,0);
});

test('an eligible action reports a missing presentation module instead of silently dropping required poses',{timeout:5000},async()=>{
 const h=host();vm.runInContext('delete window.BattlePresentation',h.c);
 await assert.rejects(h.c.MoveFX.play(205,'p1',{cryIds:{p1:500,p2:500}}),/presentation clock is unavailable/);
 assert.equal(h.c.MoveFX.active,null);assert.equal(h.timers.size,0);assert(!h.events.includes('legacyBegin'));
});
test('drawArena returning without an actual native visible combatant cannot acknowledge or release audio',async()=>{
 const h=host(),M=h.c.MoveFX,playing=M.play(205,'p1',{cryIds:{p1:500,p2:500}});await drain();
 const first=M.beginArenaFrame();assert.equal(M.presentedArenaFrame(first,true),false);
 M.markArenaActor('p1',500);assert.equal(M.presentedArenaFrame(first,true),false);
 M.markArenaActor('p2',495);assert.equal(M.presentedArenaFrame(first,true),false);
 const fresh=M.beginArenaFrame();M.markArenaActor('p1',500);M.markArenaActor('p2',500);assert.equal(M.presentedArenaFrame(first,true),false);assert(M.presentedArenaFrame(fresh,true));
 M.cancel();await playing;
});
test('other moves keep their original timer-based path and do not acquire study ownership',async()=>{
 const h=host(),M=h.c.MoveFX,pending=M.play(1,'p1',{cryIds:{p1:999,p2:999}});await drain();assert.equal(M.presentationState(),null);assert.equal(M.beginArenaFrame(),null);assert(h.events.includes('legacyBegin'));assert.equal(h.timers.size,1);
 [...h.timers.values()][0].fn();await pending;assert.equal(M.active,null);assert(!h.events.includes('finish'));
});
test('exact drawArena wrapper acknowledges success only after all draws, rejects exceptions and invalid presentation state',()=>{
 const text=read('game.js'),start=text.indexOf('function drawArena(){'),end=text.indexOf('\nfunction frame(now){',start),fn=text.slice(start,end);
 for(const failure of['none','throw','hidden','lost','glLost','canvasLost','notReady','battleRecovering','modelsRecovering']){
  const ack=[],events=[],record={},layout={p1:{x:1,y:2,height:3,world:{}},p2:{x:4,y:5,height:6,world:{}}},card={style:{}},c={console,JSON,Math};c.window=c;
  Object.assign(c,{document:{hidden:failure==='hidden'},arena:{width:390,height:490,dataset:{}},ac:{fillRect(){},save(){},translate(){},scale(){},restore(){},isContextLost:()=>failure==='canvasLost'},
   renderer:{ready:failure!=='notReady',contextLost:failure==='lost',battleRecovering:failure==='battleRecovering',modelsRecovering:failure==='modelsRecovering',gl:{isContextLost:()=>failure==='glLost'}},
   MoveFX:{beginArenaFrame(){events.push('begin');return record;},presentedArenaFrame(r,valid){assert.equal(r,record);ack.push(valid);},visualState:()=>({}),drawBackground(){},drawSpecies(){},draw(){}},
   BattleEnvironment:{draw(){events.push('draw');if(failure==='throw')throw Error('Injected draw failure');}},BattleGround:{layout:()=>layout},
   partner:{name:'Emboar'},enemy:{name:'Emboar'},visualState:{p1:{},p2:{}},syncBattleActorFraming(){events.push('framing');},combatant(){events.push('body');},$:()=>card});
  vm.runInNewContext(fn,c);if(failure==='throw')assert.throws(()=>c.drawArena(),/Injected/);else c.drawArena();
  assert.deepEqual(ack,[failure==='none']);if(failure==='none')assert.deepEqual(events,['framing','begin','draw','body','body']);
 }
});
test('real index installs the production clock before MoveFX and keeps the actual owner reader outside its IIFE',()=>{
 const index=read('index.html');assert(index.indexOf('src="battle-presentation.js"')<index.indexOf('src="move-fx.js"'));
 assert.equal((index.match(/src="battle-presentation.js"/g)||[]).length,1);
 assert(!read('move-fx.js').includes('NativePresentationOwnersStudy'));
 const h=host();assert.equal(h.c.BattlePresentationOwners.read().layoutSupported,true);
 h.c.visualState.p2.substitute=true;assert.equal(h.c.BattlePresentationOwners.read().roles.p2.altered,true);
});

test('actual transformed monster marks only successful visible native drawing, not missing or static fallback art',()=>{
 const s=read('game.js'),start=s.indexOf('function monster('),end=s.indexOf('\nfunction drawArena(){',start),fn=s.slice(start,end);
 for(const [native,alpha,back]of[[true,1,true],[true,1,false],[true,0,true],[false,1,true]]){
  const marks=[],c={Math,GEN5:{species:[{en:'Emboar',id:500}]},battleImages:Object.fromEntries(['front','back'].map(side=>['500-'+side,{complete:true,naturalWidth:80,naturalHeight:80}]))};c.window=c;
  c.ROM_SPRITE_ANIM={draw:()=>native,imageBounds:()=>[0,0,80,80]};c.MoveFX={speciesPose:()=>({}),markArenaActor:(...args)=>marks.push(args)};
  const ctx={globalAlpha:alpha,save(){},restore(){},drawImage(){}};vm.runInNewContext(fn,c);c.monster(ctx,'Emboar',0,0,1,back,0,500);
  assert.deepEqual(marks,native&&alpha>0?[[back?'p1':'p2',500]]:[]);
 }
});
for(const method of['acknowledge','pause','resume'])test('owned '+method+' audio bridge error rejects the action and releases the controller',async()=>{
 const h=host(),M=h.c.MoveFX,playing=M.play(205,'p1',{cryIds:{p1:500,p2:500}});await drain();
 const error=Error('Injected bridge '+method);h.transport[method]=()=>{throw error;};const record=M.beginArenaFrame();
 if(method==='acknowledge'){M.markArenaActor('p1',500);M.markArenaActor('p2',500);assert.equal(M.presentedArenaFrame(record,true),false);}
 else if(method==='pause')M.pauseArenaFrame();
 else{M.pauseArenaFrame();h.setNow(1000);assert.equal(M.beginArenaFrame(),null);}
 await assert.rejects(playing,e=>e===error);assert.equal(M.active,null);assert(h.events.includes('audioCancel'));assert.equal(h.timers.size,0);
});
