'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),Q=require('./qa-body-actions064.js');
const check=(value,message)=>{if(!value)throw Error(message);};
const body=(side,extra={})=>({success:true,graphic:503,side,back:side==='p1',contextMatches:true,x:0,y:0,size:1,visible:true,frame:45,duration:126,...extra});
const completed={success:true,activeMatches:true,visible:true,audit:{actual:'audit'}};
test('capture requires two successful matching bodies and completed same original arena invocation',()=>{
 const frames=[],g=Q.captureGate({graphic:503,attacker:'p2',phases:Q.windows.tail,onCapture:f=>frames.push(f)}),first={id:1},second={id:1};
 g.observe(first,body('p1'));g.observe(second,body('p2'));assert.equal(g.complete(first,completed),false);assert.equal(g.complete(second,completed),false);assert.equal(frames.length,0);
 const retry={id:2};g.observe(retry,body('p1'));g.observe(retry,body('p2'));assert.equal(frames.length,0);assert.equal(g.complete(retry,completed),true);assert.equal(frames[0].phase,'peak');assert.equal(frames[0].approximateFrame,45);assert.equal(frames[0].exactProtectedFrame,false);assert.equal(frames[0].completedOriginalArena,true);
});
test('failed/mismatched/invisible native draws and aborted/nonvisible/stale arena cannot certify evidence',()=>{
 for(const patch of[{success:false},{graphic:500},{contextMatches:false},{side:'p3'},{back:true},{x:NaN},{size:0},{visible:false}]){
  const out=[],g=Q.captureGate({graphic:503,attacker:'p1',phases:Q.windows.tail,onCapture:f=>out.push(f)}),token={};g.observe(token,body('p1'));g.observe(token,body('p2',patch));g.complete(token,completed);assert.equal(out.length,0,JSON.stringify(patch));
 }
 for(const patch of[{success:false},{activeMatches:false},{visible:false}]){const out=[],g=Q.captureGate({graphic:503,attacker:'p1',phases:Q.windows.tail,onCapture:f=>out.push(f)}),token={};g.observe(token,body('p1'));g.observe(token,body('p2'));g.complete(token,{...completed,...patch});assert.equal(out.length,0);}
});
test('windows are bounded, independent of rate, once per phase and derive attacker frame only',()=>{
 const out=[],g=Q.captureGate({graphic:503,attacker:'p2',phases:Q.windows.tail,onCapture:f=>out.push(f)});
 for(const f of[-1,0,0,25,45,110,110,127]){const token={};g.observe(token,body('p1',{frame:60}));g.observe(token,body('p2',{frame:f}));g.complete(token,completed);}
 assert.deepEqual(out.map(f=>f.phase),['start','release','peak','recovery']);assert.deepEqual(out.map(f=>f.approximateFrame),[0,25,45,110]);
 for(const f of out)assert.ok(f.approximateFrame>=f.window[0]&&f.approximateFrame<=f.window[1]);
});
test('framing audit is evaluated only for an accepted visible completed phase',()=>{
 let audits=0;const g=Q.captureGate({graphic:503,attacker:'p1',phases:Q.windows.tail,onCapture(){}}),audit=()=>{audits++;return{actual:true};};
 for(const f of[80,45,45]){const token={};g.observe(token,body('p1',{frame:f}));g.observe(token,body('p2'));g.complete(token,{...completed,audit});}
 assert.equal(audits,1);
});
test('rate requests select exact subsets and reject empty, duplicates, whitespace and unsupported values',()=>{
 assert.deepEqual(Q.rates(''),[1,2,4]);assert.deepEqual(Q.rates('?battleRates064=4,1'),[4,1]);
 for(const value of['','0','3','1,1','1,2,4,8','2,',' 2'])assert.throws(()=>Q.rates('?battleRates064='+encodeURIComponent(value)));
});
function environment({fail='start'}={}){
 let received,finishes=0,cancels=0,rate,arena=function originalArena(){},nativeTurn=1;
 class NativeSession{constructor(...args){received=args;}}
 const GEN5={Session:NativeSession},MoveFX={play(){},cancel(){cancels++;}},R={draw(){}},original={play:MoveFX.play,draw:R.draw,arena},mon={hp:100,moveSlots:[{pp:20}],boosts:{def:0},status:''};
 const e={GEN5,MoveFX,ROM_SPRITE_ANIM:R,GameSpeed:{set:n=>{rate=n;},now:()=>0},check,until:async fn=>{check(fn(),'CPU condition failed');},search:'?battleRates064=2',getArenaDraw:()=>arena,setArenaDraw:fn=>{arena=fn;},finish(){finishes++;},busy:()=>false,session:()=>({active:()=>mon,battle:{get turn(){return nativeTurn;},log:[]}}),async start(team1,team2){new GEN5.Session(team1,team2,{format:'gen5',sentinel:7});if(fail==='start')throw Error('start failure');},async command(){throw Error('DOM command failure');}};
 return{e,GEN5,MoveFX,R,original,NativeSession,get received(){return received;},get result(){return{finishes,cancels,rate,arena};}};
}
test('both drivers seed native constructor only and restore all hooks/rate after rejected start',async()=>{
 for(const run of[Q.runTail,Q.runTynamo]){const h=environment();await assert.rejects(run(h.e),/start failure/);assert.equal(h.GEN5.Session,h.NativeSession);assert.equal(h.MoveFX.play,h.original.play);assert.equal(h.R.draw,h.original.draw);assert.equal(h.result.arena,h.original.arena);assert.equal(h.result.rate,1);assert.equal(h.result.finishes,2);assert.equal(h.result.cancels,2);assert.deepEqual(h.received[2],{format:'gen5',sentinel:7,seed:[1,2,3,4]});assert.equal(h.received[0],h.received[1]);}
});
test('failed real-command callback also restores all hooks',async()=>{
 const h=environment({fail:'command'});await assert.rejects(Q.runTail(h.e),/DOM command failure/);assert.equal(h.GEN5.Session,h.NativeSession);assert.equal(h.MoveFX.play,h.original.play);assert.equal(h.R.draw,h.original.draw);assert.equal(h.result.arena,h.original.arena);assert.equal(h.result.rate,1);
});
test('observer hooks accept only completed original arena calls; synthetic CPU success restores owners',async()=>{
 // This deliberately synthetic renderer tests observer wiring, not pixels or
 // presentation quality. The real turn simulator below supplies all outcomes.
 const c=require('./helpers/finale-moves-host.cjs').setup(),NativeSession=c.GEN5.Session,shots=[];let session,clock=0,poseFrame=0,arena,originalDrawCalls=0,active=null;
 const R={draw(){originalDrawCalls++;return true;}},nativeDraw=R.draw,ctx={globalAlpha:1,canvas:{width:390,height:490}},MoveFX={get active(){return active;},cancel(){active=null;}},speed={set(){},now:()=>clock};
 const baseArena=()=>{for(const side of['p2','p1']){const isActor=side===active.side,a=isActor?{species:active.profile.species,t:poseFrame/126,nativeTailWhip:active.profile.species,nativeTick:0,nativeParentMap:0}:null;R.draw(ctx,active.profile.species,side==='p1',0,0,1,isActor?0:376.812,true,a);}};arena=baseArena;
 const basePlay=async(id,side,options)=>{active={side,moveId:id,cryIds:options.cryIds,start:0,speed:1,profile:{species:options.cryIds[side],id,frames:126,kind:id===39?'nativeTailWhipStatus064':'native-fixture'}};for(const frame of(id===39?[0,25,45,110]:[0,52.5,115])){poseFrame=frame;clock=(id!==39&&frame===52.5?72.72:frame)/.06;arena();}active=null;};MoveFX.play=basePlay;
 const e={GEN5:c.GEN5,MoveFX,ROM_SPRITE_ANIM:R,GameSpeed:speed,check,search:'?battleRates064=1',until:async fn=>check(fn(),'synthetic condition'),getArenaDraw:()=>arena,setArenaDraw:fn=>{arena=fn;},getArenaInfo:()=>({width:390,height:490,visible:true}),BattleGround:{layout:()=>({p1:{x:100,y:400,height:80,size:1,w:390,h:490},p2:{x:250,y:250,height:80,size:1,w:390,h:490}}),framingStatus:{supported:true,status:'CPU_FIXTURE_ONLY',factor:.75}},session:()=>session,busy:()=>false,finish(){},capture:(label,frame)=>shots.push({label,frame}),async start(p1,p2){session=new c.GEN5.Session(p1,p2,{});},async command(id){const from=session.battle.log.length;session.act('move 1');for(const row of session.battle.log.slice(from).filter(line=>line.startsWith('|move|'))){const side=row.split('|')[2].slice(0,2),graphic=session.active(side).species.num;await MoveFX.play(id,side,{cryIds:{p1:graphic,p2:graphic}});}}};
 for(const [run,expected]of[[Q.runTail,16],[Q.runTynamo,24]]){shots.length=0;const result=await run(e);assert.equal(shots.length,expected);assert.equal(result.suppliedBattleOutcomes,false);assert.equal(result.protectedPresentationKeys,false);assert.equal(result.turns.length,run===Q.runTail?2:4);assert.equal(c.GEN5.Session,NativeSession);assert.equal(MoveFX.play,basePlay);assert.equal(R.draw,nativeDraw);assert.equal(arena,baseArena);for(const s of shots){assert.ok(s.label.length<100);assert.equal(s.frame.audit.commonFactor,.75);assert.equal(s.frame.audit.width,390);if(run===Q.runTynamo&&s.frame.phase==='impact'){const actor=s.frame.bodies[s.frame.bodies.p1.pose?'p1':'p2'],target=s.frame.bodies[s.frame.bodies.p1.pose?'p2':'p1'];assert.equal(target.pose,null);assert.equal(target.frame,null,'idle target must not inherit wall frame 72.72');assert.equal(target.frameSource,null);assert.equal(actor.frame,52.5);assert.equal(actor.frameSource,'attacker-pose.t*profile.frames');assert.equal(s.frame.approximateFrame,52.5);assert.equal(s.frame.actionFrame,52.5);assert.equal(s.frame.actionFrameSource,'attacker-pose.t*profile.frames');assert.equal(target.effectiveTick,376.812);assert.equal(s.frame.exactProtectedFrame,false);}}}
 assert.equal(originalDrawCalls,80);
});
test('turn validator rejects swallowed actions, misses, native PP/HP/def failures and unsupported paralysis',()=>{
 const spec={id:39},before={p1:{hp:100,pp:10,def:0},p2:{hp:100,pp:10,def:0}},after={p1:{hp:100,pp:9,def:-1},p2:{hp:100,pp:9,def:-1}},played=[{side:'p1',id:39},{side:'p2',id:39}];
 Q.validateTurn('tail',spec,before,after,played,[],check);
 assert.throws(()=>Q.validateTurn('tail',spec,before,after,played.slice(1),[],check),/omitted/);
 assert.throws(()=>Q.validateTurn('tail',spec,before,after,played,['|cant|p1a: Emboar|par'],check),/prevented/);
 for(const [field,value,match]of[['hp',99,/HP/],['pp',10,/PP/],['def',0,/defense/]])assert.throws(()=>Q.validateTurn('tail',spec,before,{...after,p1:{...after.p1,[field]:value}},played,[],check),match);
 assert.throws(()=>Q.validateTurn('tynamo',{id:86},before,after,played.map(p=>({...p,id:86})),[],check),/paralysis/);
});
test('selected Tynamo seeds run real GEN5 turns with two actions and native damage/paralysis; all four moves are level1',()=>{
 const c=require('./helpers/finale-moves-host.cjs').setup(),data=c.ROM_BATTLE.species.find(p=>p.id===602);
 for(const spec of Q.specifications('tynamo')){
  assert.ok(data.learnset.some(move=>move.id===spec.id&&move.level===1),'native level1 '+spec.id);
  const team=[{name:spec.name,level:54,moves:[spec.id]}],session=new c.GEN5.Session(team,team,{seed:spec.seed.slice()}),read=()=>Object.fromEntries(['p1','p2'].map(side=>{const p=session.active(side);return[side,{hp:p.hp,pp:p.moveSlots[0].pp,def:p.boosts.def,status:p.status}];})),before=read(),from=session.battle.log.length;
  session.act('move 1');const native=session.battle.log.slice(from),played=native.filter(line=>line.startsWith('|move|')).map(line=>({id:spec.id,side:line.split('|')[2].slice(0,2)}));
  Q.validateTurn('tynamo',spec,before,read(),played,native,check);
 }
 // Seed1,2,3,4 genuinely fully paralyzes the second Thunder Wave actor.
 // The observer uses the preselected native seed1,2,3,5, never an outcome override.
 const t=[{name:'Tynamo',level:54,moves:[86]}],s=new c.GEN5.Session(t,t,{seed:[1,2,3,4]});s.act('move 1');assert.ok(s.battle.log.some(line=>line.startsWith('|cant|')));assert.deepEqual(Q.specifications('tynamo').find(s=>s.id===86).seed,[1,2,3,5]);
});
