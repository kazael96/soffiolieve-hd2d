/* Replay the browser fixture's actual move scorer in seven native sessions.
 * No renderer claim: preserve HP/PP, award actual XP and use the stated heals.
 */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{environment,drain}=require('./check-story-runtime.cjs');
(async()=>{
 const c=environment({mistralton:true,sourceRoot:process.env.QA_SOURCE_ROOT}),source=fs.readFileSync('tests/browser-qa.js','utf8'),begin=source.indexOf('function moveScore049'),end=source.indexOf('\n  function battleDiagnosis049',begin);
 assert.ok(begin>=0&&end>begin);vm.runInContext(source.slice(begin,end),c,{filename:'browser-fixture-scorer'});
 const spec=source.match(/const fixtureTeam=(\[.*?\]);for\(const mon of fixtureTeam\)/s);assert.ok(spec);vm.runInContext('var fixtureTeam049='+spec[1],c);
 const team=Array.from(c.fixtureTeam049),j=c.Journey,n=c.NativeStory;j.step=()=>{};Object.assign(n.state,{badges:[0,1,2,3],driftveil:true});j.state.starter='Snivy';j.state.phase='driftveil';
 for(const mon of team)for(const id of mon.moves)assert.ok(c.MISTRALTON_DATA.progression[mon.name==='Simipour'?'Panpour':mon.name].moves.some(m=>m.id===id&&m.level<=31),mon.name+'/'+id);
 j.state.party=team.map(({name,moves})=>j.pack(c.makeMon(name,31,{moves}),c.OPENING_DATA[name].growth[31]));const rows=[];
 for(const [index,trainerId]of [81,278,276,610,24,491,218].entries()){
  if(index>=4)j.heal();const trainer=c.MISTRALTON_DATA.trainers[trainerId]||c.OPENING_TRAINERS[trainerId],seed=[73,2026,index+1,73],s=c.session=new c.GEN5.Session(j.configs(),trainer.party,{enemyName:trainer.name,seed});
  assert.equal(s.battle.prng.startingSeed,seed.join(','));c.configureOpeningBattle(s,{trainerId,story:trainer.name});j.attachBattle(s,'trainer');const row={trainerId,seed,player:s.battle.p1.pokemon.map(p=>({name:p.name,level:p.level})),actions:[]};rows.push(row);
  for(let limit=0;!s.battle.ended&&limit<200;limit++){
   const req=s.request();let uiArgument;
   if(req.forceSwitch?.some(Boolean)){
    const foe=s.active('p2'),next=s.party().filter(p=>!p.active&&p.hp>0).map(p=>{const mon=s.battle.p1.pokemon.find(m=>m.name===p.name&&m.hp>0&&!m.isActive);return {...p,score:mon?Math.max(...mon.moveSlots.map(m=>c.moveScore049(mon,foe,m))):-1};}).sort((a,b)=>b.score-a.score)[0];assert.ok(next,'No surviving legal party member');uiArgument='switch '+next.index;
   }else{
    const mon=s.active('p1'),foe=s.active('p2'),moves=req.active?.[s.selectionSlot||0]?.moves||[],best=moves.map((m,i)=>({i,score:c.moveScore049(mon,foe,m)})).sort((a,b)=>b.score-a.score)[0];assert.ok(best&&best.score>=0);uiArgument=best.i;
   }
   // This is the mapping used by the real battle-ui turn(index,action).
   const command=typeof uiArgument==='string'?uiArgument:'move '+(uiArgument+1);row.actions.push({turn:s.battle.turn,uiArgument,command});j.recordParticipant(s);s.act(command);j.recordParticipant(s);
  }
  row.winner=s.battle.winner;row.finalSeed=s.battle.prng.getSeed();row.log=s.battle.log.slice();
  assert.equal(row.winner,'Alcide',JSON.stringify(row));await drain(c,j.afterBattle(s,'trainer',null,false));
  // The real field VM awards badge4 only after the trainer24 victory/XP.
  if(trainerId===24)n.state.badges.push(4);
  console.log('PASS native trainer'+trainerId+' seed='+seed.join(',')+' choices='+row.actions.length);
 }
 assert.equal(rows.length,7);if(process.env.QA_REPORT)fs.writeFileSync(process.env.QA_REPORT,JSON.stringify({source:'Browser fixture team/scorer; native Session, actual XP, declared nurse pauses; no forced winners',rows},null,2));
 console.log('PASS seven native story battles with emitted choices and real HP/PP/XP.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
