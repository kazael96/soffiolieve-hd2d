'use strict';
const {repo,sourceRoot,sourcePath,site,fixturePath,readSourceBytes,readFixtureBytes}=require('./helpers/minccino-slap-paths064.cjs');
// Actual UI playNativeMove source; explicit MoveFX promise/generation protocol.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),test=require('node:test'),assert=require('node:assert/strict');
const source=fs.readFileSync(sourcePath('battle-ui.js'),'utf8'),from=source.indexOf('async function playNativeMove(');assert(from>=0);
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
function host(){const wait=deferred(),session={},states={p1:{moveHeld:false},p2:{customReaction:false}},options={context:{hitIndex:0,hitCount:3}},calls=[],c={session,visualState:states,partner:{spriteId:572},enemy:{spriteId:510},PokemonVisuals:{speciesId:id=>+id},SpeciesMoves:{select:()=>({nativeEffects:true,damage:true})},BattleReactions:{rigs:{510:{}}},MoveFX:{generation:7,active:{preview:true,moveId:3,side:'p1'},play(...args){calls.push(args);return wait.promise;}}};c.window=c;vm.createContext(c);vm.runInContext(source.slice(from),c,{filename:'battle-ui.js:actual-playNativeMove'});return{c,session,states,options,wait,calls};}
test('Session replacement without MoveFX generation change cannot write new reaction or revive old held state',async()=>{
 const h=host(),job=h.c.playNativeMove(3,'p1',h.options);assert.equal(h.calls.length,1);h.c.session={};h.c.visualState={p1:{moveHeld:'new owner'},p2:{customReaction:'new owner'}};h.wait.resolve();await job;
 assert.equal(h.c.MoveFX.generation,7);assert.equal(h.c.visualState.p2.customReaction,'new owner');assert.equal(h.c.visualState.p1.moveHeld,'new owner');assert.equal(h.states.p1.moveHeld,false,'Late old completion must not reactivate old held flags');
});
test('same Session success still records the genuine held move and custom reaction',async()=>{
 const h=host(),job=h.c.playNativeMove(3,'p1',h.options);h.wait.resolve();await job;assert.equal(h.states.p1.moveHeld,true);assert.equal(h.states.p2.customReaction,true);assert.equal(h.c.session,h.session);
});
test('same Session MoveFX rejection propagates without setting held/reaction flags',async()=>{
 const h=host(),job=h.c.playNativeMove(3,'p1',h.options),rejected=assert.rejects(job,/deliberate playback failure/);h.wait.reject(Error('deliberate playback failure'));await rejected;assert.equal(h.states.p1.moveHeld,false);assert.equal(h.states.p2.customReaction,false);
});
test('existing generation cancellation still skips all post-playback writes',async()=>{
 const h=host(),job=h.c.playNativeMove(3,'p1',h.options);h.c.MoveFX.generation++;h.wait.resolve();await job;assert.equal(h.states.p1.moveHeld,false);assert.equal(h.states.p2.customReaction,false);
});
