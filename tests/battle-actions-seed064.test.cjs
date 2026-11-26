'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const c=require('./helpers/finale-moves-host.cjs').setup();
// Native protocol timestamps are wall-clock data, independent of the RNG seed.
// Freeze only this fixture's intrinsic VM Date; leave the host and other VMs alone.
const fixtureNow064=1767225600000,seedClock064={now:fixtureNow064},hostDate064=Date,hostDateNow064=Date.now;
c.seedClock064=seedClock064;
vm.runInContext('Date.now=()=>seedClock064.now',c,{filename:'seed-fixture-clock064'});
const scenarios=[['status','Snivy',43,'Tepig',39],...[1,3,47,541].map(id=>['contact-'+id,'Liepard',10,'Minccino',id]),['contact-3-p1','Minccino',3,'Liepard',10],['snatch','Purrloin',289,'Snivy',74]];
function turn(spec,seed=[1,2,3,4]){const [name,p1,m1,p2,m2]=spec,team=(name,id)=>[{name,level:50,gender:'M',moves:[id]}],s=new c.GEN5.Session(team(p1,m1),team(p2,m2),{seed}),before=['p1','p2'].map(side=>s.active(side).hp),ppBefore=['p1','p2'].map(side=>s.active(side).moveSlots[0].pp);s.act('move 1');return{name,before,ppBefore,after:['p1','p2'].map(side=>({hp:s.active(side).hp,pp:s.active(side).moveSlots[0].pp,def:s.active(side).boosts.def,atk:s.active(side).boosts.atk,spa:s.active(side).boosts.spa})),log:[...s.battle.log]};}
test('all seven fixed native seeds reproduce the real command expectations without substituting accuracy or damage',()=>{
 assert.equal(scenarios.length,7);
 assert.notEqual(vm.runInContext('Date',c),hostDate064,'Fixture must own a separate intrinsic Date');
 assert.equal(vm.runInContext('Date.now()',c),fixtureNow064);
 assert.equal(Date,hostDate064);assert.equal(Date.now,hostDateNow064);
 for(const spec of scenarios){const row=turn(spec);assert.deepEqual(turn(spec),row,'Native RNG replay must be deterministic');assert.ok(row.log.includes('|t:|'+fixtureNow064/1000),'Native protocol must read the fixture clock');for(const line of row.log)if(line.startsWith('|t:|'))assert.equal(line,'|t:|'+fixtureNow064/1000);assert.deepEqual(row.after.map(m=>m.pp),row.ppBefore.map(pp=>pp-1));if(row.name==='status'){assert.deepEqual(row.after.map(m=>m.hp),row.before);assert.ok(row.after.every(m=>m.def===-1));}else if(row.name==='snatch'){assert.equal(row.after[0].atk,1);assert.equal(row.after[0].spa,1);assert.equal(row.after[1].atk,0);}else{assert.ok(row.after[1].hp<row.before[1]);if(row.name==='contact-47'){assert.equal(row.after[0].hp,row.before[0]);assert.ok(row.log.some(line=>line.startsWith('|-miss|p2a: Minccino')),'The native Sing miss is preserved');}else assert.ok(row.after[0].hp<row.before[0]);}}
 const original=turn(scenarios[0]);try{
  seedClock064.now+=1000;const later=turn(scenarios[0]);
  assert.ok(later.log.includes('|t:|'+(fixtureNow064/1000+1)),'Native protocol must follow a controlled one-second VM change');
  assert.deepEqual(later.before,original.before);
  assert.deepEqual(later.ppBefore,original.ppBefore);
  assert.deepEqual(later.after,original.after,'A protocol timestamp change must not change seeded battle outcomes');
  assert.notDeepEqual(later.log,original.log,'The integral raw log must retain its timestamp events');
 }finally{seedClock064.now=fixtureNow064;}
 assert.deepEqual(turn(scenarios[0]),original,'Restoring the fixture clock must reproduce the integral native result and raw log');
 assert.equal(Date,hostDate064);assert.equal(Date.now,hostDateNow064);
 assert.notEqual(Date.now(),fixtureNow064,'Host Date.now must still read real time through its original function');
});
test('the native simulator can genuinely miss Tail Slap; a seeded QA hit must not be an overridden result',()=>{
 const spec=scenarios.find(row=>row[0]==='contact-541');let missed=null;for(let n=2;n<=64&&!missed;n++){const row=turn(spec,[n,2,3,4]);if(row.log.some(line=>line.startsWith('|-miss|p2a: Minccino')))missed=row;}
 assert.ok(missed,'A real native accuracy failure must remain possible');assert.equal(missed.after[0].hp,missed.before[0]);assert.ok(turn(spec).after[0].hp<missed.before[0]);
});

const qa=fs.readFileSync(path.join(__dirname,'browser-qa.js'),'utf8'),begin=qa.indexOf(" case049('qaBattleActions064'"),end=qa.indexOf(" case049('qaGustActions064'",begin),block=qa.slice(begin,end);
const coverage=block.slice(block.indexOf('  function minccinoCoverage064('),block.indexOf('  const cases=['));
const captureHelpers=block.slice(block.indexOf('  function minccinoImpact064('),block.indexOf('  ROM_SPRITE_ANIM.draw=function('));
const observer=block.slice(block.indexOf('  ROM_SPRITE_ANIM.draw=function('),block.indexOf('  drawArena=function('));
const arenaObserver=block.slice(block.indexOf('  drawArena=function('),block.indexOf('  function minccinoCoverage064('));

test('the actual QA observer distinguishes native bodies, authored song and the new native tail gesture',()=>{
 assert.ok(coverage.startsWith('  function minccinoCoverage064('),'Production observer coverage function missing');
 assert.ok(captureHelpers.startsWith('  function minccinoImpact064('),'Production protected Minccino impact gate missing');
 const site=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site'),R=c.ROM_SPRITE_ANIM;
 let nativeDrawImages=0;const context=()=>({save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(){nativeDrawImages++;}});
 c.document={createElement(){return{width:0,height:0,getContext:context};}};
 // Policy image dimensions and qualified neutral opaque bounds accompany the
 // real derived bank. R.bounds is the wider animation envelope; Game computes
 // groundBounds from opaque reference pixels. This counter does not rasterize.
 for(const view of ['front','back']){const data=JSON.parse(fs.readFileSync(path.join(site,'assets/animated/572-'+view+'.json')));R.cache['572-'+view]={ready:true,pending:false,error:null,data,image:{complete:true,naturalWidth:512,naturalHeight:256,width:512,height:256},bounds:R.bounds(data),groundBounds:view==='back'?[-35,-49,23,0]:[-21,-49,36,0]};}
 const draw=R.draw;c.sprite=draw;c.check=(value,message)=>assert.ok(value,message);c.GameSpeed={rate:1};c.pendingShot=null;c.arena={};c.MoveFX={active:null,generation:0};
 vm.runInContext(coverage+captureHelpers+observer,c,{filename:'actual-browser-qa-Minccino-observer'});
 try{
  const layout={p1:{x:200,y:400,w:1000,h:650,height:130},p2:{x:700,y:180,w:1000,h:650,height:90}};
  for(const id of [1,3,47,541])for(const side of ['p1','p2']){
   const p=c.SpeciesMoves.select(572,id,id===3?{hitIndex:0,hitCount:2}:{}),row={id,side,profile:{species:572},bodySamples:0,minccinoBodySamples:0,authoredMinccinoSamples:0,authoredNativeSlapSamples:0,reactionSamples:0,maxForepaw:0,frames:[],captured:false};c.current=row;c.pendingShot=null;
   if(id===3){const proof=c.MinccinoMoves.prepareSlapSource064(p,side),bank=R.cache['572-'+(side==='p1'?'back':'front')];assert.equal(proof.bank,bank);assert.equal(proof.image,bank.image);assert.equal(proof.kind,side==='p1'?'native572-back-cell7-oam-partition/v1':'native572-front-cell12-oam-partition/v1');}
   for(let f=0;f<=p.frames;f++){const a=c.SpeciesMoves.pose(p,f,side,side,false,layout).speciesPose;assert.equal(R.draw(context(),572,side==='p1',160,200,1.3,a.nativeTick||0,true,a),true);}
   assert.equal(row.bodySamples,p.frames+1);assert.equal(row.minccinoBodySamples,p.frames+1);if(id===3)assert.equal(c.pendingShot,null,'Bare tail body draws without a real pending presentation record must not capture');else assert.ok(c.pendingShot,'Actual native Minccino body never becomes eligible for an arena capture');
   const evidence=c.minccinoCoverage064([row],id);assert.equal(evidence.bodySamples,p.frames+1);assert.equal(evidence.visualApproval,false);
   if(id===47){assert.equal(evidence.mode,'authored-song');assert.equal(row.authoredMinccinoSamples,p.frames+1);}
   else if(id===3){assert.equal(evidence.mode,'native-tail-double-slap');assert.equal(evidence.nativeTailSamples,p.frames+1);assert.equal(row.authoredNativeSlapSamples,p.frames+1);assert.equal(row.authoredMinccinoSamples,0);const a=c.SpeciesMoves.pose(p,60,side,side,false,layout).speciesPose,bad={...a,minccinoSlap064:{...a.minccinoSlap064,anatomy:'paw'}};assert.throws(()=>R.draw(context(),572,side==='p1',160,200,1.3,0,true,bad),/native tail source/);}
   else{assert.equal(evidence.mode,'preceding-contact-baseline-withheld');assert.equal(row.authoredMinccinoSamples,0);assert.equal(row.authoredMinccinoSamples>0,false,'The former blanket authored-pose assertion must reject this legitimate withheld baseline');}
  }
  assert.ok(nativeDrawImages>1000,'The original native composite renderer did not draw its real OAM layers');
 }finally{R.draw=draw;delete c.current;delete c.pendingShot;delete c.sprite;delete c.arena;delete c.MoveFX;}
});

test('the production Minccino coverage gate rejects missing bodies, leaked withheld poses and missing song/tail gestures',()=>{
 const check=c.minccinoCoverage064;assert.equal(typeof check,'function');
 const row=(id,body=1,authored=id===47?1:0)=>({id,profile:{species:572},minccinoBodySamples:body,authoredMinccinoSamples:authored,authoredNativeSlapSamples:id===3?1:0});
 for(const id of [1,3,47,541]){assert.throws(()=>check([],id),/real native body/);assert.throws(()=>check([row(id,0)],id),/real native body/);}
 for(const id of [1,541]){assert.throws(()=>check([row(id,1,1)],id),/withheld/);assert.throws(()=>check([{...row(id),authoredNativeSlapSamples:1}],id),/withheld/);}
 assert.throws(()=>check([{...row(3),authoredNativeSlapSamples:0}],3),/native tail choreography/);
 assert.throws(()=>check([{...row(3),authoredMinccinoSamples:1}],3),/native tail choreography/);
 assert.throws(()=>check([row(47,1,0)],47),/authored pose/);
 assert.throws(()=>check([row(10)],10),/unexpected/);
 assert.throws(()=>check([{...row(1),profile:{species:510}}],1),/real native body/);
});

test('the observer retains the six original scenarios plus reversed M3, native mechanics and Liepard on its actual role',()=>{
 assert.match(block,/\.\.\.\[1,3,47,541\]\.map/);assert.match(block,/name:'status'/);assert.match(block,/name:'snatch'/);assert.match(block,/name:'contact-3-p1',minccinoMove:3,p1:\{name:'Minccino'.*p2:\{name:'Liepard'/);assert.match(block,/seed:\[1,2,3,4\]/);
 for(const condition of ["r.side==='p1'","r.side==='p2'",'session.active(\'p2\').hp<before.hp[1]','session.active(\'p1\').boosts.atk>0','r.maxForepaw>.35','played.every(r=>r.reactionSamples>0)','moveSlots[0].pp===before.pp[i]-1','authoredMinccinoSamples===0','minccinoCoverage:minccinoCoverage064'])assert.ok(block.includes(condition),condition);
 assert.ok(block.includes('preceding native-body baseline')&&block.includes('Baseline contact overlap remains a separate visual limitation'));
 for(const condition of ['r.side===liepardSide','r.side===minccinoSide&&r.captured','nativeTailImpact.originalTokenConsumed','nativeTailDoubleSlap.every','state.pending!==null','state.shown.includes(60)','Seven isolated scenarios','new native-tail gesture'])assert.ok(block.includes(condition),condition);
 assert.ok(!block.includes('native-paw'),'Actual M3 scope must describe its native tail source');
});


// CPU regression with the real native compositor and original BPO clock; its fake arena is not Game/GPU evidence.
test('actual M3 capture rejects early/reaction/stale owners and waits for the original protected60 ACK on both roles',()=>{
 const R=c.ROM_SPRITE_ANIM,draw=R.draw,temporary=['arena','MoveFX','GameSpeed','pendingShot','current','sprite','arenaDraw','drawArena','shot','pixels','BattlePresentation'],prior=new Map(temporary.map(key=>[key,{present:Object.hasOwn(c,key),value:c[key]}]));
 const context=()=>({canvas:c.arena,globalAlpha:1,save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(){}}),shots=[];let clock,at=0,allowAck=false;
 try{
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/battle-presentation.js'),'utf8'),c,{filename:'actual-protected-impact-clock'});
  c.arena={width:320,height:240,dataset:{visual:'{}'}};c.GameSpeed={rate:1};c.sprite=draw;c.pixels=()=>null;c.shot=(label,canvas,metadata)=>shots.push({label,canvas,metadata});
  c.arenaDraw=function(){if(allowAck)clock.presented(c.MoveFX.active.presentationRecord.token,at,{drawable:true,visible:true});return 'original-arena-return';};
  vm.runInContext(captureHelpers+observer+arenaObserver,c,{filename:'actual-browser-qa-protected-tail-capture'});
  const layout={p1:{x:200,y:400,w:1000,h:650,height:130},p2:{x:700,y:180,w:1000,h:650,height:90}};
  for(const side of ['p1','p2']){
   const other=side==='p1'?'p2':'p1',p=c.SpeciesMoves.select(572,3,{hitIndex:0,hitCount:2});c.MinccinoMoves.prepareSlapSource064(p,side);
   const row={ordinal:shots.length+1,id:3,side,profile:{species:572,id:3},bodySamples:0,reactionSamples:0,maxForepaw:0,minccinoBodySamples:0,authoredMinccinoSamples:0,authoredNativeSlapSamples:0,frames:[],captured:false,rejectedImpactCaptures:0};c.current=row;c.pendingShot=null;
   clock=c.BattlePresentation.create({duration:126,keys:[60],now:0});const initial=clock.begin(0);clock.presented(initial,0,{drawable:true,visible:true});
   const active={moveId:3,side,targetSide:other,profile:p,cryIds:{p1:572,p2:572},nativeSlapController064:true,miss:false,presentationClock:clock};c.MoveFX={active,generation:17};
   at=700;const early=clock.begin(at);assert.equal(early.frame,42);active.presentationRecord=Object.freeze({action:active,token:early});
   const earlyPose=c.SpeciesMoves.pose(p,early.frame,side,side,false,layout).speciesPose;assert.ok(earlyPose.t>.3&&earlyPose.t<.8,'This real wind-up would pass the former broad screenshot window');
   assert.equal(R.draw(context(),572,side==='p1',160,200,1.3,0,true,earlyPose),true);assert.equal(c.pendingShot,null,'Early native attacker draw is not impact60');
   clock.presented(early,at,{drawable:true,visible:true});at=1000;const token=clock.begin(at);assert.equal(token.frame,60);const record=Object.freeze({action:active,token});active.presentationRecord=record;
   const reaction=c.BattleReactions.sample(p,68,other,572,false);assert.ok(reaction.reaction&&reaction.wind>.15,'This genuine target reaction would pass the former screenshot gate');
   assert.equal(R.draw(context(),572,other==='p1',160,200,1.3,0,true,reaction),true);assert.equal(c.pendingShot,null,'A target reaction must not stand in for the M3 attacker');
   const pose=c.SpeciesMoves.pose(p,60,side,side,false,layout).speciesPose;
   const staleClock=c.BattlePresentation.create({duration:126,keys:[60],now:0}),staleInitial=staleClock.begin(0);staleClock.presented(staleInitial,0,{drawable:true,visible:true});const staleToken=staleClock.begin(1000);assert.equal(staleToken.frame,60);
   active.presentationRecord=Object.freeze({action:active,token:staleToken});assert.equal(R.draw(context(),572,side==='p1',160,200,1.3,0,true,pose),true);assert.equal(c.pendingShot,null,'A stale token with the same numeric frame cannot own this draw');
   active.presentationRecord=record;const foreign=context();foreign.canvas={};assert.equal(R.draw(foreign,572,side==='p1',160,200,1.3,0,true,pose),true);assert.equal(c.pendingShot,null,'Off-arena body draws must not capture');
   assert.equal(R.draw(context(),572,side==='p1',160,200,1.3,0,true,pose),true);assert.ok(c.pendingShot);assert.equal(row.captured,false);
   active.presentationRecord=Object.freeze({action:active,token:staleToken});allowAck=false;assert.equal(c.drawArena(),'original-arena-return');assert.equal(row.captured,false,'Owner replacement after the body draw invalidates capture');assert.equal(shots.length,side==='p1'?0:1);
   active.presentationRecord=record;R.draw(context(),572,side==='p1',160,200,1.3,0,true,pose);assert.equal(c.drawArena(),'original-arena-return');assert.equal(row.captured,false,'An unconsumed original pending token is not an ACK');
   R.draw(context(),572,side==='p1',160,200,1.3,0,true,pose);allowAck=true;assert.equal(c.drawArena(),'original-arena-return');assert.equal(row.captured,true);assert.equal(c.pendingShot,null);
   assert.equal(row.nativeTailImpact.frame,60);assert.equal(row.nativeTailImpact.poseT,60/126);assert.equal(row.nativeTailImpact.side,side);assert.equal(row.nativeTailImpact.anatomy,'tail');assert.equal(row.nativeTailImpact.originalTokenConsumed,true);assert.equal(row.nativeTailImpact.protectedFrameShown,true);assert.equal(row.rejectedImpactCaptures,2);
   assert.ok(Object.values(row.nativeTailImpact).every(value=>value===null||typeof value!=='object'),'Serialized capture evidence must contain scalars, not live owner references');assert.doesNotThrow(()=>JSON.stringify(row));
  }
  assert.equal(shots.length,2);assert.deepEqual(shots.map(s=>s.metadata.nativeTailImpact.side),['p1','p2']);
 }finally{R.draw=draw;for(const [key,entry]of prior)if(entry.present)c[key]=entry.value;else delete c[key];}
});
