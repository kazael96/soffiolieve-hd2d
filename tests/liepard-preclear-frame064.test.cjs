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

test('owner lost between frames rejects old M.play before clear and preserves the next source frame',async()=>{
 const h=host(),job=h.start();await settle();assert.equal(h.requests.length,1);h.requests[0].gate.resolve();await settle();assert.ok(h.c.MoveFX.active?.presentationClock,'Actual M.play must first acquire its active action');
 const gameFile=process.env.SOFFIOLIEVE_GAME_SOURCE||sourcePath('game.js');assert.ok(gameFile);const game=fs.readFileSync(gameFile,'utf8'),drawStart=game.indexOf('function drawArena(){'),frameStart=game.indexOf('function frame(now){'),frameEnd=game.indexOf('refresh();requestAnimationFrame(frame);',frameStart);assert(drawStart>=0&&frameStart>drawStart&&frameEnd>frameStart);
 const c=h.c,queued=[],metrics={fill:0,combatant:0,status:0,world:0};Object.assign(c,{last:0,t:0,cooldown:0,battling:true,keys:{},moving:false,controls:{state:()=>({})},menuOpen:()=>false,requestAnimationFrame:fn=>queued.push(fn),renderer:{ready:true,gl:{isContextLost:()=>false},status(){metrics.status++;}},canvas:{dataset:{}},arena:{width:390,height:490},ac:{fillRect(){metrics.fill++;}},syncBattleActorFraming(){},combatant(){metrics.combatant++;},refresh(){},drawWorld(){metrics.world++;}});c.document.querySelector=()=>null;
 const speedSource=fs.readFileSync(process.env.SOFFIOLIEVE_GAMESPEED_SOURCE||sourcePath('game-speed.js'),'utf8'),stepStart=speedSource.indexOf('steps(dt){'),stepEnd=speedSource.indexOf('return out;}',stepStart);assert(stepStart>=0&&stepEnd>stepStart);const exactSteps=speedSource.slice(stepStart,stepEnd+'return out;}'.length);c.GameSpeed.steps=vm.runInContext('(function(rate){return({'+exactSteps+'}).steps;})',c,{filename:'game-speed.js:exact-source-steps'})(c.GameSpeed.rate);
 vm.runInContext(game.slice(drawStart,frameStart),c,{filename:gameFile+':source-drawArena'});vm.runInContext(game.slice(frameStart,frameEnd),c,{filename:gameFile+':source-frame'});
 c.session=h.makeSession();c.frame(1000);await job.promise;
 assert.ok(job.error);assert.match(job.error.message,/owner changed/i);assert.equal(c.MoveFX.active,null);assert.equal(metrics.fill,0,'Loss must be handled before any arena clear');assert.equal(metrics.combatant,0,'A stale action must never enter the body/pose renderer');assert.equal(metrics.status,0);assert.equal(c.renderer.ready,true);assert.equal(c.canvas.dataset.runtimeError,undefined);assert.equal(queued.length,1,'Source frame must retain its scheduled successor');
 c.battling=false;queued.shift()(1016);assert.equal(metrics.world,1);assert.equal(c.renderer.ready,true);assert.equal(metrics.status,0);assert.equal(queued.length,1);
});
