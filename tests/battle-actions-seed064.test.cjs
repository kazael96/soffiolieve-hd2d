'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const c=require('./helpers/finale-moves-host.cjs').setup();
// Native protocol timestamps are wall-clock data, independent of the RNG seed.
// Freeze only this fixture's intrinsic VM Date; leave the host and other VMs alone.
const fixtureNow064=1767225600000,seedClock064={now:fixtureNow064},hostDate064=Date,hostDateNow064=Date.now;
c.seedClock064=seedClock064;
vm.runInContext('Date.now=()=>seedClock064.now',c,{filename:'seed-fixture-clock064'});
const scenarios=[['status','Snivy',43,'Tepig',39],...[1,3,47,541].map(id=>['contact-'+id,'Liepard',10,'Minccino',id]),['snatch','Purrloin',289,'Snivy',74]];
function turn(spec,seed=[1,2,3,4]){const [name,p1,m1,p2,m2]=spec,team=(name,id)=>[{name,level:50,gender:'M',moves:[id]}],s=new c.GEN5.Session(team(p1,m1),team(p2,m2),{seed}),before=['p1','p2'].map(side=>s.active(side).hp),ppBefore=['p1','p2'].map(side=>s.active(side).moveSlots[0].pp);s.act('move 1');return{name,before,ppBefore,after:['p1','p2'].map(side=>({hp:s.active(side).hp,pp:s.active(side).moveSlots[0].pp,def:s.active(side).boosts.def,atk:s.active(side).boosts.atk,spa:s.active(side).boosts.spa})),log:[...s.battle.log]};}
test('all six fixed native seeds reproduce the real command expectations without substituting accuracy or damage',()=>{
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
const observer=block.slice(block.indexOf('  ROM_SPRITE_ANIM.draw=function('),block.indexOf('  drawArena=function('));

test('the actual QA observer distinguishes all four native Minccino bodies from the only installed authored song',()=>{
 assert.ok(coverage.startsWith('  function minccinoCoverage064('),'Production observer coverage function missing');
 const site=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site'),R=c.ROM_SPRITE_ANIM;
 let nativeDrawImages=0;const context=()=>({save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(){nativeDrawImages++;}});
 c.document={createElement(){return{width:0,height:0,getContext:context};}};
 for(const view of ['front','back']){const data=JSON.parse(fs.readFileSync(path.join(site,'assets/animated/572-'+view+'.json')));R.cache['572-'+view]={ready:true,data,image:{},bounds:R.bounds(data),groundBounds:R.bounds(data)};}
 const draw=R.draw;c.sprite=draw;c.check=(value,message)=>assert.ok(value,message);c.GameSpeed={rate:1};c.pendingShot=null;
 vm.runInContext(coverage+observer,c,{filename:'actual-browser-qa-Minccino-observer'});
 try{
  const layout={p1:{x:200,y:400,w:1000,h:650,height:130},p2:{x:700,y:180,w:1000,h:650,height:90}};
  for(const id of [1,3,47,541])for(const side of ['p1','p2']){
   const p=c.SpeciesMoves.select(572,id,{}),row={id,side,profile:{species:572},bodySamples:0,minccinoBodySamples:0,authoredMinccinoSamples:0,reactionSamples:0,maxForepaw:0,frames:[],captured:false};c.current=row;c.pendingShot=null;
   for(let f=0;f<=p.frames;f++){const a=c.SpeciesMoves.pose(p,f,side,side,false,layout).speciesPose;assert.equal(R.draw(context(),572,side==='p1',160,200,1.3,a.nativeTick||0,true,a),true);}
   assert.equal(row.bodySamples,p.frames+1);assert.equal(row.minccinoBodySamples,p.frames+1);assert.ok(c.pendingShot,'Actual native Minccino body never becomes eligible for an arena capture');
   const evidence=c.minccinoCoverage064([row],id);assert.equal(evidence.bodySamples,p.frames+1);assert.equal(evidence.visualApproval,false);
   if(id===47){assert.equal(evidence.mode,'authored-song');assert.equal(row.authoredMinccinoSamples,p.frames+1);}
   else{assert.equal(evidence.mode,'preceding-contact-baseline-withheld');assert.equal(row.authoredMinccinoSamples,0);assert.equal(row.authoredMinccinoSamples>0,false,'The former blanket authored-pose assertion must reject this legitimate withheld baseline');}
  }
  assert.ok(nativeDrawImages>1000,'The original native composite renderer did not draw its real OAM layers');
 }finally{R.draw=draw;delete c.current;delete c.pendingShot;delete c.sprite;}
});

test('the production Minccino coverage gate rejects missing bodies, leaked withheld poses and missing authored song',()=>{
 const check=c.minccinoCoverage064;assert.equal(typeof check,'function');
 const row=(id,body=1,authored=id===47?1:0)=>({id,profile:{species:572},minccinoBodySamples:body,authoredMinccinoSamples:authored});
 for(const id of [1,3,47,541]){assert.throws(()=>check([],id),/real native body/);assert.throws(()=>check([row(id,0)],id),/real native body/);}
 for(const id of [1,3,541])assert.throws(()=>check([row(id,1,1)],id),/withheld/);
 assert.throws(()=>check([row(47,1,0)],47),/authored pose/);
 assert.throws(()=>check([row(10)],10),/unexpected/);
 assert.throws(()=>check([{...row(1),profile:{species:510}}],1),/real native body/);
});

test('the observer fix retains all six commands, seed, mechanics, both roles and authored Liepard forepaw checks',()=>{
 assert.match(block,/\.\.\.\[1,3,47,541\]\.map/);assert.match(block,/name:'status'/);assert.match(block,/name:'snatch'/);assert.match(block,/seed:\[1,2,3,4\]/);
 for(const condition of ["r.side==='p1'","r.side==='p2'",'session.active(\'p2\').hp<before.hp[1]','session.active(\'p1\').boosts.atk>0','r.maxForepaw>.35','played.every(r=>r.reactionSamples>0)','moveSlots[0].pp===before.pp[i]-1','authoredMinccinoSamples===0','minccinoCoverage:minccinoCoverage064'])assert.ok(block.includes(condition),condition);
 assert.ok(block.includes('preceding native-body baseline')&&block.includes('Baseline contact overlap remains a separate visual limitation'));
});
