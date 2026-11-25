'use strict';
// DRAFT, NOT RUN. Actual M.play source; explicit protocol-only actor/audio/clock inputs.
// No native renderer, original PCM, choreography, browser or source-art claim.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {sourcePath}=require('./helpers/minccino-slap-paths064.cjs');
const file=process.env.SOFFIOLIEVE_MFX_SOURCE||sourcePath('move-fx.js'),source=fs.readFileSync(file,'utf8');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const settle=async()=>{for(let i=0;i<40;i++)await Promise.resolve();};
// Opt-in spelling agreed with planner author B; not added to the planner benchmark.
const marker='private-native-claw-SPA170';
function host(){
 const requests=[],profile={species:510,id:10,key:'training-510-10',kind:'furySlash',frames:126,impact:60,nativeEffects:true,chapter:true,training:true,target:'foe',attachment:'hand',damage:true,liepardNativeScratch064:marker};
 const makeSession=()=>({battle:{gameType:'singles',p1:{active:[{species:{num:510}}]},p2:{active:[{species:{num:572}}]}},active(side='p1'){return this.battle[side].active[0];}});
 const c={console,Promise,Map,Set,WeakMap,Object,Number,Math,Error,performance:{now:()=>0},Image:class{},setTimeout:()=>0,clearTimeout(){},document:{hidden:false,addEventListener(){}},ROM_MOVE_FX:{moves:{10:{id:10,variants:[{commands:[]}],spas:[]}},spas:{}},NATIVE_AUDIO_BANK:{moves:{10:[{}]}},ROM_SPRITE_ANIM:{cache:{}},LiepardMoves:{install(){}},GameSpeed:{rate:1,now:()=>0,flush(){},cancel(){}},BattlePresentation:{plan:()=>({frames:126,keys:[0,60,126]}),create:()=>({value:0,cancel(){}})},session:makeSession()};c.window=c;
 c.BattlePresentationOwners={read:()=>({layoutSupported:true,available:true,nativeSpecies:{p1:c.session.active('p1').species.num,p2:c.session.active('p2').species.num},roles:Object.fromEntries(['p1','p2'].map((side,i)=>[side,{graphic:[510,572][i],bankReady:!!c.ROM_SPRITE_ANIM.cache[[510,572][i]+'-'+(i?'front':'back')]?.ready,altered:false}]))})};
 c.SpeciesMoves={select:()=>({...profile}),timeline:s=>({...s,frames:126}),sample:()=>({liepardClawPose:{foreA:1.18}}),async prepare(){for(const [side,id]of [['p1',510],['p2',572]])c.ROM_SPRITE_ANIM.cache[id+'-'+(side==='p1'?'back':'front')]={ready:true,data:{},image:{}};}};
 c.AudioEngine={cancelMove(){},preloadMove:async()=>{},async preparePresentation(){const gate=deferred(),r={gate,cancelled:0,canPresent:()=>true,acknowledge(){},pause(){},resume(){},cancel(){r.cancelled++;},async finish(){}};requests.push(r);await gate.promise;return r;}};
 vm.createContext(c);vm.runInContext(source,c,{filename:file});
 const options={cryIds:{p1:510,p2:572},targetSide:'p2'};
 return{c,requests,makeSession,start(){let error;const promise=c.MoveFX.play(10,'p1',options).catch(e=>{error=e;});return{promise,get error(){return error;}};}};
}
for(const kind of ['Session','battle','actor','target'])test('510 owner lease rejects same-species '+kind+' replacement during audio preparation',async()=>{
 const h=host(),job=h.start();await settle();assert.equal(h.requests.length,1,'Audio await must actually be reached');assert.equal(h.c.MoveFX.active,null);
 if(kind==='Session')h.c.session=h.makeSession();
 else if(kind==='battle')h.c.session.battle={...h.c.session.battle};
 else h.c.session.battle[kind==='actor'?'p1':'p2'].active[0]={species:{num:kind==='actor'?510:572}};
 h.requests[0].gate.resolve();await settle();const adopted=h.c.MoveFX.active;
 if(adopted)h.c.MoveFX.cancel();await job.promise;
 assert.equal(adopted,null,'An opted-in old call must not adopt the new same-species owner');assert.ok(job.error,'Owner loss must reject rather than fall back');assert.match(job.error.message,/(owner|acquisition|session|native|stale)/i);assert.ok(h.requests[0].cancelled>0,'Old prepared audio must be released');
});
test('510 same Session success reaches a real M.play active object after both preparation awaits',async()=>{
 const h=host(),job=h.start();await settle();assert.equal(h.requests.length,1);h.requests[0].gate.resolve();await settle();assert.equal(h.c.MoveFX.active?.moveId,10);assert.equal(h.c.MoveFX.active?.profile.species,510);assert.equal(h.c.MoveFX.active?.presentationAudio,h.requests[0]);h.c.MoveFX.cancel();await job.promise;assert.equal(job.error,undefined);
});
test('510 same Session audio error is preserved and does not install an active object',async()=>{
 const h=host(),job=h.start();await settle();const error=Error('Deliberate audio preparation failure');h.requests[0].gate.reject(error);await job.promise;assert.equal(job.error,error);assert.equal(h.c.MoveFX.active,null);
});
test('cancelled 510 audio caller cannot overwrite or cancel the newer M.play action',async()=>{
 const h=host(),old=h.start();await settle();assert.equal(h.requests.length,1);h.c.MoveFX.cancel();const fresh=h.start();await settle();assert.equal(h.requests.length,2);h.requests[1].gate.resolve();await settle();const current=h.c.MoveFX.active;assert.equal(current?.presentationAudio,h.requests[1]);h.requests[0].gate.resolve();await old.promise;assert.equal(h.c.MoveFX.active,current);assert.equal(h.requests[1].cancelled,0);assert.equal(old.error,undefined,'Generation cancellation must retain precedence over owner checks');assert.ok(h.requests[0].cancelled>0);h.c.MoveFX.cancel();await fresh.promise;
});
