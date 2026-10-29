const assert=require('node:assert/strict'),{environment,drain}=require('./check-story-runtime.cjs');
function chapter(starter=0){const c=environment(),j=c.Journey,n=c.NativeStory,name=['Snivy','Tepig','Oshawott'][starter];n.state.intro=true;n.state.initialized=true;j.state.starter=name;j.state.phase='dreamyardDone';j.state.party=[name,'Patrat','Lillipup'].map(x=>j.pack(c.newStoryMon(x,15),c.OPENING_DATA[x].growth[15]));Object.assign(n.state.vars,{16432:starter,16532:5});return c;}
(async()=>{
 for(let starter=0;starter<3;starter++){
  const c=chapter(starter),n=c.NativeStory,j=c.Journey;c.testSpeed=[1,2,4][starter];
  await n.changeZone(321,717,563);await drain(c,n.run(4,642),starter,'p1');assert.equal(n.state.vars[16533],1,'Komor battle and chase');
  c.player={x:-68.5,y:-185.5};await drain(c,n.run(7,642),starter,'p1');
  c.player={x:-103.5,y:-196.5};await drain(c,n.run(6,642),starter,'p1');assert.equal(n.state.vars[16533],3,'Cave permission');
  await n.changeZone(324,25,5);await drain(c,n.run(0,648),starter,'p1');assert.equal(n.state.vars[16533],4,'Partner battle recovers stolen Pokemon');
  await n.changeZone(321,715,565);await drain(c,n.run(10,642),starter,'p1');assert.equal(n.state.vars[16533],5,'Girl reward');
  await n.changeZone(16,665,600);await drain(c,n.run(9,32),starter,'p1');assert.equal(n.state.vars[16530],1);assert.equal(j.itemCount(150),3);assert.equal(j.state.phase,'nacrene');
  assert.ok(j.save(true));assert.equal(c.StoryState.read(c.localStorage).original.vars[16530],1);
  console.log('PASS Route3/cave/partner/reward/Nacrene',j.state.starter,'x'+c.testSpeed);
 }
 {
  const c=chapter(),n=c.NativeStory,j=c.Journey;n.state.route3=true;await n.changeZone(321,741,564);await drain(c,n.run(14,642),0,'p1');assert.equal(n.state.vars[16510],1);await n.changeZone(321,719,582);await drain(c,n.run(5,642),0,'p1');assert.equal(n.state.vars[16510],2);console.log('PASS twins and dark-grass lesson');
  await n.changeZone(323,6,8);const before=j.state.money;await drain(c,n.daycareService());assert.equal(n.state.daycare.pokemon.name,'Snivy');assert.ok(!j.state.party.some(p=>p.name==='Snivy'));j.save(true);const saved=c.StoryState.read(c.localStorage);assert.equal(saved.original.daycare.pokemon.name,'Snivy');assert.equal(saved.party.length,2);assert.notEqual(saved.phase,'gift');j.daycareSteps(1000);const level=n.state.daycare.pokemon.level;await drain(c,n.daycareService());assert.ok(j.state.party.some(p=>p.name==='Snivy'));assert.equal(j.state.money,before-100-100*Math.max(0,level-15));assert.ok(!n.state.daycare);console.log('PASS starter deposit/reload, capped step XP, withdrawal and exact fee');
  n.state.vars[16530]=1;await n.changeZone(16,644,582);await drain(c,n.run(10,32),0,'p1');assert.equal(n.state.vars[16530],2);await n.changeZone(20,7,13);assert.equal(n.state.healZone,20);console.log('PASS N outside museum and Nacrene heal checkpoint');
 }
})().catch(e=>{console.error(e);process.exitCode=1});
