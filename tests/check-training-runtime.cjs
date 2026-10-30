/* Real Journey services, ROM growth/learnsets and save normalization at level25. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{environment,drain}=require('./check-story-runtime.cjs');
function setup(){const c=environment();c.NativeStory.state.intro=true;c.Journey.state.starter='Snivy';c.Journey.state.phase='nacrene';c.Journey.state.party=[c.Journey.pack(c.newStoryMon('Snivy',25),c.OPENING_DATA.Snivy.growth[25])];return c;}
(async()=>{
 {
  const c=setup(),site=path.resolve(process.argv[2]||'_site');
  for(const f of ['purrloin-moves','demo-moves','chapter-moves','route3-moves','species-moves','tepig-moves','oshawott-moves','patrat-moves','lillipup-moves','training-moves','battle-reactions'])vm.runInContext(fs.readFileSync(path.join(site,f+'.js'),'utf8'),c,{filename:f});
  const layout={p1:{x:250,y:520,height:180,w:1000,h:650},p2:{x:720,y:330,height:130,w:1000,h:650}};let count=0;
  for(const [name,ids]of Object.entries(c.TrainingMoves.pairs))for(const id of ids){
   const sid=c.GEN5.species.find(p=>p.en===name).id,p=c.SpeciesMoves.select(sid,id);assert.ok(p,'missing '+name+' / '+id);count++;
   for(let frame=0;frame<=p.frames;frame++)for(const miss of [false,true]){
    const a=c.SpeciesMoves.sample(p,frame,'p1',miss),b=c.SpeciesMoves.sample(p,frame,'p2',miss);assert.equal(a.dir,-b.dir);
    for(const side of ['p1','p2']){
     const pose=c.SpeciesMoves.pose(p,frame,side,side,miss,layout);for(const n of Object.values(pose).filter(v=>typeof v==='number'))assert.ok(Number.isFinite(n),name+' '+id+' '+frame);
     const r=c.BattleReactions.sample(p,frame,side,sid,miss);if(r)for(const n of Object.values(r).filter(v=>typeof v==='number'))assert.ok(Number.isFinite(n),'reaction '+name+' '+id);
    }
    if(frame===0||frame===p.frames)for(const k of ['reach','crouch','lift','head','tail','arms','feet','lean','breath'])assert.ok(Math.abs(a[k]??0)<1e-7,name+' '+id+' '+k+' recovery');
   }
  }
  assert.ok(c.SpeciesMoves.select(510,468),'retained Purrloin Unghiaguzze');assert.equal(c.SpeciesMoves.select(499,292).attachment,'hand');
  console.log('PASS level25 animation matrix:',count,'pairs; both sides, misses, reactions and grounded recovery');
 }
 for(const [name,level,target,ability,move]of [
  ['Snivy',16,'Servine',65,0],['Tepig',16,'Pignite',66,292],['Oshawott',16,'Dewott',67,534],
  ['Lillipup',15,'Herdier',146,0],['Patrat',19,'Watchog',35,109],['Purrloin',19,'Liepard',7,0],
  ['Pidove',20,'Tranquill',145,0],['Roggenrola',24,'Boldore',5,408],['Timburr',24,'Gurdurr',62,0],['Tympole',24,'Palpitoad',33,0]
 ]){
  const c=setup(),j=c.Journey,p=j.pack(c.makeMon(name,level,{abilityId:name==='Lillipup'?53:c.TRAINING_DATA.progression[name].abilities[0],moves:[33]}),c.OPENING_DATA[name].growth[level]);
  p.nickname='Amico';p.pp[0].left=7;p.hp-=2;p.met={date:'2026-10-30T12:00:00.000Z',zone:321,level:5};j.state.party.push(p);assert.ok(j.addItem(50));
  const traits=JSON.stringify({ivs:p.ivs,evs:p.evs,nature:p.nature,gender:p.gender,met:p.met}),before=j.unpack(p);
  await drain(c,j.useRareCandy(1));assert.equal(p.level,level+1);assert.equal(p.name,target);assert.equal(p.abilityId,ability);assert.equal(p.nickname,'Amico');assert.equal(p.pp.find(m=>m.id===33).left,7);
  assert.equal(JSON.stringify({ivs:p.ivs,evs:p.evs,nature:p.nature,gender:p.gender,met:p.met}),traits);assert.equal(p.hp,j.unpack(p).max-(before.max-before.hp));
  if(move)assert.ok(p.pp.some(m=>m.id===move),target+' evolution-level move missing');
  assert.ok(j.save(true));assert.ok(c.StoryState.read(c.localStorage).party.some(p=>p.name===target));
  console.log('PASS level evolution, ability, HP/PP, traits and save:',name,'→',target);
 }
 {
  const c=setup(),j=c.Journey;j.state.party=[j.pack(c.makeMon('Snivy',24,{moves:[33]}),c.OPENING_DATA.Snivy.growth[24])];j.addItem(50,2);c.cancelEvolution=true;
  const first=j.useRareCandy(0);assert.equal(await j.useRareCandy(0),false,'concurrent candy');await drain(c,first);
  assert.equal(j.state.party[0].name,'Snivy');assert.equal(j.state.party[0].level,25);assert.equal(j.itemCount(50),1);assert.equal(await j.useRareCandy(0),false);assert.ok(j.save(true));assert.equal(c.StoryState.read(c.localStorage).party[0].level,25);
  console.log('PASS cancellation, repeat input, cap and exact candy consumption');
 }
 {
  const c=setup(),j=c.Journey;j.state.party=[j.pack(c.makeMon('Snivy',14,{moves:[33]}),c.OPENING_DATA.Snivy.growth[14])];
  const session=new c.GEN5.Session(j.configs(),[{name:'Audino',level:100}],{seed:[1,2,3,4]});j.attachBattle(session,'wild');session.battle.win('p1');await drain(c,j.afterBattle(session,'wild',null,false));
  assert.equal(j.state.party[0].level,25);assert.equal(j.state.party[0].name,'Servine');assert.equal(j.state.party[0].xp,c.OPENING_DATA.Servine.growth[25]);assert.equal(c.evolutions.length,1);
  j.state.party[0]=j.pack(c.makeMon('Snivy',50),c.OPENING_DATA.Snivy.growth[50]+99);const before=j.state.party[0].xp;
  const next=new c.GEN5.Session(j.configs(),[{name:'Patrat',level:5}],{seed:[1,2,3,4]});j.attachBattle(next,'wild');next.battle.win('p1');await drain(c,j.afterBattle(next,'wild',null,false));
  assert.equal(j.state.party[0].level,50);assert.equal(j.state.party[0].xp,before);assert.equal(c.evolutions.length,1,'no evolution without a level-up');
  console.log('PASS battle XP cap, one post-battle evolution and preserved legacy level/XP');
 }
 {
  const c=setup(),j=c.Journey,p=j.pack(c.makeMon('Lillipup',15),c.OPENING_DATA.Lillipup.growth[15]);c.NativeStory.state.daycare={pokemon:p,level:15,distance:0};
  j.daycareSteps(1e9);assert.equal(p.name,'Lillipup','daycare must not evolve');assert.equal(p.level,25);assert.equal(p.xp,c.OPENING_DATA.Lillipup.growth[25]);
  const frozen=JSON.stringify(p);j.daycareSteps(10000);assert.equal(JSON.stringify(p),frozen);assert.ok(j.save(true));assert.equal(c.StoryState.read(c.localStorage).original.daycare.pokemon.level,25);
  console.log('PASS daycare level25, learned moves, no daycare evolution and persisted cap');
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
