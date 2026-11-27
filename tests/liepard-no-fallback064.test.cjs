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

test('opted-in510 cannot fall back when its protected plan is absent',async()=>{
 const h=host();h.c.BattlePresentation.plan=()=>null;const job=h.start();await settle();const adopted=h.c.MoveFX.active;if(adopted)h.c.MoveFX.cancel();await job.promise;assert.equal(adopted,null,'Missing protected plan must not install a generic action');assert.ok(job.error);assert.match(job.error.message,/(protected plan|presentation|owner)/i);assert.equal(h.requests.length,0);
});
test('opted-in510 cannot fall back when a bank becomes unavailable during audio',async()=>{
 const h=host(),job=h.start();await settle();assert.equal(h.requests.length,1);delete h.c.ROM_SPRITE_ANIM.cache['572-front'];h.requests[0].gate.resolve();await settle();const adopted=h.c.MoveFX.active;if(adopted)h.c.MoveFX.cancel();await job.promise;assert.equal(adopted,null,'Post-audio eligibility loss must reject instead of generic fallback');assert.ok(job.error);assert.match(job.error.message,/(visual owner|presentation|acquisition|native)/i);assert.ok(h.requests[0].cancelled>0);
});
