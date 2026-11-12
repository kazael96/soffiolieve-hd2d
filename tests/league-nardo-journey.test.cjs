/* Actual departure/slide controllers, with a covered source and mocked GPU/audio.
 * Gate flags in these fixtures are explicit prerequisites, never travel rewards. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {setup:base,drain}=require('./helpers/league-field-host.cjs');
async function setup(season=0,open=true){const c=await base(),n=c.NativeStory.state;
 n.fieldSeason=season;n.badges=[0,1,2,3,4,5,6,7];n.flags=[594,758,669];n.vars[16591]=1;
 if(open)for(const row of Object.values(c.LeagueGates.rows))n.flags.push(row.flag);
 c.Journey.state.starter='Snivy';c.Journey.state.party=[c.Journey.pack(c.makeMon('Serperior',43),c.OPENING_DATA.Serperior.growth[43])];
 await drain(c,c.NativeStory.changeZone(122,7,13));const t=c.LeagueJourneys.trip('nardo-league-entry');
 const a={...t.source,name:'Nardo',model:97,uid:8,fieldZone:120,frame:0,direction:1,script:2000};delete a.zone;
 n.opelucidArrivals??={};n.opelucidArrivals['120:8']='Nardo';assert.equal(c.NativeStory.departures.depart(a,120),true);
 c.NativeStory.departures.records.get('Nardo').plan.transferAuthorized=true;c.testSpeed=4;
 return {c,n,trip:t,record:()=>c.NativeStory.departures.records.get('Nardo')};
}
for(const season of [0,1,2,3])test('Nardo physically reaches League136 through gates, caves and both slides in season'+season,async()=>{
 const {c,n,record}=await setup(season),visited=new Set(),slides=new Set(),flags=[...n.flags],wins=[...n.trainerWins],step=c.Journey.step;
 c.Journey.step=(...args)=>{step(...args);const r=record();if(r){visited.add(r.zone);if(r.plan.slideRecord)slides.add(r.plan.slideRecord.sourceLine);}};
 await drain(c,Promise.resolve(),0,'p1',()=>record()?.stage==='resident');const r=record();
 assert.equal(r.zone,136);assert.equal(r.actor.fieldZone,136);assert.equal(r.actor.uid,251);assert.equal(n.opelucidArrivals['136:251'],'Nardo');
 assert.equal(visited.has(337),false,'synthetic nextChapter field used as physical destination');
 for(const z of [132,355,356,363,364,215,216,220,219,221,223,224,225,226,227,228,136])assert.ok(visited.has(z),'skipped native area'+z);
 assert.equal(slides.size,2,'one of the required native slides was skipped');assert.deepEqual(n.flags,flags);assert.deepEqual(n.trainerWins,wins);assert.equal(c.NativeStory.locked,false);
});
test('Nardo waits beside a closed native badge gate and resumes when its actual flag opens',async()=>{
 const {c,n,record}=await setup(0,false);await drain(c,Promise.resolve(),0,'p1',()=>record()?.zone===356&&record()?.stage==='hold');const r=record(),pose={...r.actor};
 for(let i=0;i<100;i++)c.Journey.step(1/30,false);assert.equal(record(),r);assert.equal(r.zone,356);assert.equal(r.actor.x,pose.x);assert.equal(r.actor.y,pose.y);assert.equal(c.NativeStory.locked,false);
 for(const row of Object.values(c.LeagueGates.rows))n.flags.push(row.flag);await drain(c,Promise.resolve(),0,'p1',()=>record()?.stage==='resident');assert.equal(record().zone,136);
});
test('every closed-gate waiting point leaves an original player corridor unobstructed',async()=>{
 const {c,trip}=await setup(0,false);for(const leg of trip.legs.filter(l=>l.gateWaiting)){
  const bypass=c.LEAGUE_JOURNEY_DATA.paths[leg.gateBypass];assert.ok(bypass?.length,'missing bypass proof for gate'+leg.zone);
  let prior=[leg.start.x,leg.start.y,leg.start.height];for(const p of bypass){const count=Math.max(1,Math.ceil(Math.hypot(p[0]-prior[0],p[1]-prior[1])/.05));for(let i=1;i<=count;i++){const f=i/count,x=prior[0]+(p[0]-prior[0])*f,y=prior[1]+(p[1]-prior[1])*f,height=prior[2]+(p[2]-prior[2])*f;if(Math.abs(height-leg.height)<1.25)assert.equal(c.NpcWalk.occupies({x:leg.anchor.x,y:leg.anchor.y},x,y),false,'waiting NPC blocks player at gate'+leg.zone);}prior=p;}
 }
});

test('Nardo waits in358 until narrow359 is opened, without occupying its only corridor',async()=>{
 const {c,n,record}=await setup(0,false);for(const z of [356,357,358])n.flags.push(c.LeagueGates.rows[z].flag);
 await drain(c,Promise.resolve(),0,'p1',()=>record()?.zone===358&&record()?.stage==='hold');const body=record().actor,leg=record().plan.leg;
 for(let i=0;i<100;i++)c.Journey.step(1/30,false);assert.equal(record().actor,body);assert.equal(record().plan.leg,leg);assert.equal(record().zone,358);assert.equal(c.NativeStory.locked,false);
 n.flags.push(c.LeagueGates.rows[359].flag);await drain(c,Promise.resolve(),0,'p1',()=>record()?.zone===360&&record()?.stage==='hold');assert.equal(record().zone,360);
});

for(const season of [0,1,2,3])test('Komor continues from the actual Route10 exit body only after the native League visit in season'+season,async()=>{
 const {c,n}=await setup(season),get=()=>c.NativeStory.departures.records.get('Komor');n.vars[16568]=4;n.vars[16545]=0;n.leagueRoute10Exits={Komor:true};
 const source=c.LeagueJourneys.trip('komor-route10-exit').source,body={...source,name:'Komor',model:7,uid:0,fieldZone:355,frame:0,direction:0,script:2000};delete body.zone;
 assert.equal(c.NativeStory.departures.depart(body,355),true);get().plan.transferAuthorized=true;
 await drain(c,Promise.resolve(),0,'p1',()=>get()?.stage==='resident');assert.equal(get().zone,132);assert.equal(get().actor.uid,252);const arrived=get().actor;
 for(let i=0;i<50;i++)c.Journey.step(1/30,false);assert.equal(get().actor,arrived);assert.equal(get().zone,132,'Komor left before the first native League entry');
 const flags=[...n.flags],wins=[...n.trainerWins];n.vars[16545]=1;c.Journey.step(1/30,false);assert.equal(get().actor,arrived,'the waiting body was replaced on departure');assert.equal(get().plan.destination,'league-komor-league-entry');
 await drain(c,Promise.resolve(),0,'p1',()=>get()?.stage==='resident'&&get()?.zone===136&&n.opelucidArrivals['136:251']==='Nardo');assert.equal(get().actor.uid,250);assert.equal(n.opelucidArrivals['136:250'],'Komor');assert.equal(n.opelucidArrivals['136:251'],'Nardo');
 assert.deepEqual(n.flags,flags);assert.deepEqual(n.trainerWins,wins);assert.equal(n.vars[16568],4);assert.equal(c.NativeStory.locked,false);
});
test('a saved cave-door passage retains its fractional pose and resumes outward without replaying the approach',async()=>{
 const {c,n,record}=await setup();await drain(c,Promise.resolve(),0,'p1',()=>record()?.zone===132&&record()?.plan.leg===1&&record()?.index===record()?.plan.points.length-1);
 c.Journey.step(1/30,false);const before={...record().actor},row=JSON.parse(JSON.stringify(c.NativeStory.departures.save().find(r=>r.key==='Nardo')));
 c.NativeStory.departures.clear();c.NativeStory.departures.restore([row],n.zone,n);assert.ok(record(),'door record was rejected on reload');assert.equal(record().actor.x,before.x);assert.equal(record().actor.y,before.y);
 c.Journey.step(1/30,false);const leg=c.LeagueJourneys.trip('nardo-league-entry').legs[1];assert.ok((record().actor.x-before.x)*leg.dx+(record().actor.y-before.y)*leg.dy>=-.001,'NPC walked back to the old approach');
 await drain(c,Promise.resolve(),0,'p1',()=>record()?.stage==='resident');assert.equal(record().zone,136);
});
test('a native NPC airborne departure checkpoint resumes the same slide at its saved age',async()=>{
 const {c,n,record}=await setup();await drain(c,Promise.resolve(),0,'p1',()=>record()?.plan.slideRecord?.age>.1);const before={...record().actor},age=record().plan.slideRecord.age,row=JSON.parse(JSON.stringify(c.NativeStory.departures.save().find(r=>r.key==='Nardo')));
 c.NativeStory.departures.clear();c.NativeStory.departures.restore([row],n.zone,n);assert.ok(record());assert.equal(record().plan.slideRecord.age,age);assert.equal(record().actor.x,before.x);assert.equal(record().actor.y,before.y);assert.equal(record().actor.height,before.height);
 await drain(c,Promise.resolve(),0,'p1',()=>record()?.stage==='resident');assert.equal(record().zone,136);
});
test('the old synthetic337 boundary record migrates through its proved132 portal rather than teleporting to the League',async()=>{
 const {c,n,trip,record}=await setup(),leg=trip.legs[1];c.NativeStory.departures.clear();
 const actor={name:'Nardo',model:97,uid:8,fieldZone:337,x:leg.anchor.x+leg.dx*2.8,y:leg.anchor.y+leg.dy*2.8,height:leg.height,frame:0,direction:0};
 const row={key:'Nardo',actor,zone:337,plan:{kind:'resident',points:[],clip:null,chapter049:true,itineraryVersion:2,destination:'nardo-league-road',leg:1,nextChapter:true,transferAuthorized:true},index:0,stage:'resident'};
 c.NativeStory.departures.restore([row],n.zone,n);assert.ok(record());assert.equal(record().zone,132);assert.equal(record().actor.x,actor.x);assert.equal(record().actor.y,actor.y);assert.equal(record().plan.nextChapter,undefined);
 await drain(c,Promise.resolve(),0,'p1',()=>record()?.stage==='resident');assert.equal(record().zone,136);
});
test('a visible travelling NPC reserves its landing, survives a real save normalization and keeps its body for the next walking leg',async()=>{
 const {c,n,record}=await setup();await drain(c,Promise.resolve(),0,'p1',()=>record()?.plan.slideRecord?.age>.1);const age=record().plan.slideRecord.age,p=c.NativeRails.position(214,0,2,0);
 await c.NativeStory.changeZone(214,p.x-.5,p.z-.5,p.height);assert.equal(record().plan.slideRecord.age,age);const end=c.LeaguePlayerSlide.finish(record().plan.slideRecord);
 assert.equal(c.NativeStory.occupied(end.x,end.y),true,'the player could occupy an airborne NPC landing');assert.equal(c.NativeStory.locked,false);assert.equal(c.Journey.save(true),true);
 const save=c.StoryState.read(c.localStorage),restored=require('./helpers/league-field-host.cjs').environment({league:true,sourceRoot:path.resolve(__dirname,'../src'),save});
 await restored.OpelucidChapter.ensure(214);await restored.NativeStory.changeZone(214,save.player.x+15.5,save.player.y+15.5,save.original.fieldHeight);
 const get=()=>restored.NativeStory.departures.records.get('Nardo'),body=get()?.actor,leg=get()?.plan.leg;assert.ok(body);assert.equal(get().plan.slideRecord.age,age);let sequence=0;restored.renderer.actorVisibility=()=>({visible:true,sequence:++sequence});
 await drain(restored,Promise.resolve(),0,'p1',()=>get()?.plan.leg===leg+1);assert.equal(get().actor,body,'the visible slide-to-walk seam replaced the rendered NPC');assert.equal(get().zone,214);assert.equal(restored.NativeStory.locked,false);
});
