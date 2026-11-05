/* Controller/ROM contracts; these tests do not certify NPC travel or pixels. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');
const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=old;
async function setup(save){
 const c=environment({icirrus:true,sourceRoot:path.resolve(__dirname,'../src'),save});await c.IcirrusChapter.ensure();
 if(!save){const n=c.NativeStory.state,j=c.Journey;Object.assign(n,{intro:true,initialized:true,pokedex:true,mistralton:true,badges:[0,1,2,3,4],healZone:109});n.vars[16537]=1;j.state.starter='Snivy';j.state.phase='mistralton';j.state.party=['Servine','Pignite','Dewott'].map(name=>j.pack(c.makeMon(name,35),c.OPENING_DATA[name].growth[35]));j.displayPartner();}
 return c;
}
for(const speed of [1,2,4])test('native sixth badge, cap39, TM62 and loss branch at ×'+speed,async()=>{
 for(const winner of ['p1','p2']){const c=await setup(),n=c.NativeStory.state;c.testSpeed=speed;
  await drain(c,c.NativeStory.changeZone(108,15,6));
  await drain(c,c.NativeStory.run(4),0,winner,()=>!c.NativeStory.locked);
  const won=winner==='p1';assert.equal(n.badges.includes(5),won);assert.equal(c.Training.limit(),won?39:35);assert.equal(c.Journey.itemCount(389),won?1:0);assert.equal(n.vars[16537],won?2:1);
 }
});
test('Tower upper stairs have inward walkable landings and keep rail coordinates on reload',async()=>{
 const c=await setup();
 for(const zone of [338,339,340,341]){const w=c.ICIRRUS_EVENTS.zones[zone].warps.find(w=>w.rail),p=c.NativeRails.warp(zone,w),landing=c.NativeRails.landing(zone,w);
  assert.equal(p.span,3);assert.ok(Number.isFinite(landing.rail.height));
  for(const [dx,dz]of [[-.2,-.2],[.2,.2],[-.2,.2],[.2,-.2]])assert.ok(c.NativeRails.locate(zone,landing.x+dx,landing.z+dz,{height:p.height,line:p.line}));
  const saved=structuredClone(c.Journey.state);saved.scene='zone'+zone;saved.phase='celestial';saved.original.zone=zone;saved.original.railCurrent={zone,...landing.rail};saved.player={x:landing.x,y:landing.z};
  const restored=c.StoryState.normalize(saved);assert.ok(restored);assert.equal(restored.original.railCurrent.zone,zone);assert.equal(restored.original.railCurrent.line,landing.rail.line);
 }
});
test('map0 seams allow Route7 and never bypass Twist Mountain into Icirrus',async()=>{
 const c=await setup();for(const [a,b]of [[107,337],[337,107],[337,198],[198,337]])assert.equal(c.IcirrusChapter.crosses(a,b),true);
 assert.equal(c.IcirrusChapter.crosses(198,113),false);assert.equal(c.IcirrusChapter.crosses(113,198),false);
});
test('Icirrus coordinates and sixth-badge progress survive source save normalization',async()=>{
 const c=await setup();await drain(c,c.NativeStory.changeZone(113,176,209));
 const s=structuredClone(c.Journey.state);s.player={x:c.player.x,y:c.player.y};const restored=c.StoryState.normalize(s);
 assert.ok(restored);assert.equal(restored.scene,'zone113');assert.equal(restored.phase,'icirrus');assert.equal(restored.player.y,-542.5);assert.equal(restored.original.zone,113);
});
test('native party selectors use first conscious non-egg and friendship excludes eggs',async()=>{
 const c=await setup(),command=c.NativeStory.vm.host.command,m=c.NativeStory.vm,j=c.Journey;
 j.state.party[0].hp=0;j.state.party[1].egg=true;j.state.party[2].happiness=178;
 await command({name:'NativeOpcode269'},[32800,2],[32800,2],m);assert.equal(m.value(32800),2);
 await command({name:'NativeOpcode252'},[32801,2],[32801,2],m);assert.equal(m.value(32801),178);
 await command({name:'NativeOpcode269'},[32800,1],[32800,1],m);assert.equal(m.value(32800),0);
 await command({name:'NativeOpcode252'},[32801,1],[32801,1],m);assert.equal(m.value(32801),0);
});

test('ordinary disk autosave persists a busy native cannon without permitting narrative saves',async()=>{
 const c=await setup();await drain(c,c.NativeStory.changeZone(108,15,30));c.player.x=-.5;c.player.y=14.5;
 assert.ok(c.IcirrusGym.tryStep(0,-1));for(let i=0;i<200;i++){c.IcirrusGym.tick(1/30);if(c.IcirrusGym.task.ride?.phase==='flight'&&c.IcirrusGym.task.ride.pathFrame>=12)break;}
 assert.equal(c.NativeStory.locked,true);assert.equal(c.NativeStory.fieldCheckpointAllowed,true);assert.equal(c.Journey.save(true),true);
 const saved=c.StoryState.read(c.localStorage);assert.equal(saved.original.cannonRide.phase,'flight');assert.ok(saved.original.cannonRide.pathFrame>=12);assert.equal(saved.player.x,c.player.x);assert.equal(saved.player.y,c.player.y);
 const loaded=await setup(saved);assert.equal(loaded.NativeStory.state.cannonRide.pathFrame,saved.original.cannonRide.pathFrame);
});
