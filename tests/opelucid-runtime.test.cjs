/* Actual field host and native programs; visual browser traversal remains separate. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');const {environment,drain}=require('./check-story-runtime.cjs');process.argv[2]=old;
async function setup(save){const c=environment({opelucid:true,sourceRoot:path.resolve(__dirname,'../src'),save});await c.OpelucidChapter.ensure();if(!save){const n=c.NativeStory.state,j=c.Journey;Object.assign(n,{intro:true,initialized:true,pokedex:true,badges:[0,1,2,3,4,5],healZone:115});j.state.starter='Snivy';j.state.phase='icirrus';j.state.party=['Serperior','Emboar','Samurott'].map(name=>j.pack(c.makeMon(name,39),c.OPENING_DATA[name].growth[39]));j.displayPartner();}return c;}

test('Tower actors on another native height cannot be spoken to or block the current floor',async()=>{
 const c=await setup(),n=c.NativeStory.state;await drain(c,c.NativeStory.changeZone(210,16,27));const trainer=c.npcs.find(a=>a.script===3303);Object.assign(c.player,{x:trainer.x,y:trainer.y+1});c.facing=0;n.fieldHeight=trainer.height-5;assert.equal(c.NativeStory.occupied(trainer.x,trainer.y),false);assert.equal(c.NativeStory.interact(),undefined);
});

test('new Tower trainers and floor items respond to A once and retain their result after saving',async()=>{
 const c=await setup(),n=c.NativeStory.state;await drain(c,c.NativeStory.changeZone(210,16,27));const trainer=c.npcs.find(a=>a.script===3303);assert.ok(trainer);Object.assign(c.player,{x:trainer.x,y:trainer.y+1});n.fieldHeight=trainer.height;c.facing=0;const battles=[],start=c.startBattle;c.startBattle=(kind,config)=>{battles.push(config.trainerId);return start(kind,config);};
 await drain(c,c.NativeStory.interact(),0,'p1');assert.deepEqual(battles,[303]);assert.ok(n.trainerWins.includes(303));await drain(c,c.NativeStory.interact(),0,'p1');assert.equal(battles.length,1);
 await drain(c,c.NativeStory.changeZone(208,16,26));const item=c.npcs.find(a=>a.script===7012);assert.ok(item);Object.assign(c.player,{x:item.x,y:item.y+1});c.facing=0;const record=c.OPELUCID_DATA.items[item.script],before=c.Journey.itemCount(record.id);await drain(c,c.NativeStory.interact());assert.equal(c.Journey.itemCount(record.id),before+record.count);assert.ok(n.collectedItems[208].includes(item.uid));c.Journey.save(true);const saved=c.StoryState.read(c.localStorage);assert.ok(saved.original.trainerWins.includes(303));assert.ok(saved.original.collectedItems[208].includes(item.uid));
});

test('new chapter migration hides later native actors, and never reapplies after their event starts',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 for(const flag of [577,578,587,588,589,603,604,605,606,607,613,659,688,838])assert.ok(n.flags.includes(flag),'native initial flag '+flag);
 await drain(c,c.NativeStory.changeZone(113,181,184));
 assert.equal(c.npcs.some(a=>[91,182,134].includes(a.model)),false);
 n.flags=n.flags.filter(f=>f!==578);n.vars[16535]=4;
 const saved=structuredClone(c.Journey.state);saved.original=structuredClone(n);
 const resumed=await setup(saved);assert.equal(resumed.NativeStory.state.flags.includes(578),false);assert.equal(resumed.NativeStory.state.vars[16535],4);
});

test('native lever program animates both resources before moving only its invisible blockers',async()=>{
 const c=await setup(),n=c.NativeStory.state;await drain(c,c.NativeStory.changeZone(114,18,61));
 assert.equal(c.renderer.scene.zone,114);assert.equal(c.renderer.scene.assetsPending,false);assert.equal(c.renderer.scene.instances.filter(i=>i.brycen!==undefined).length,6);
 const blocker=c.npcs.find(a=>a.uid===3);assert.equal(blocker.collisionOnly,true);assert.equal(blocker.noShadow,true);
 const before={...blocker};c.player.x=7.5;c.player.y=37.5;c.Journey.step(1/30,false);await drain(c,Promise.resolve(),0,"p1",()=>!c.NativeStory.locked);assert.equal(n.brycenPuzzle.states[0],1);assert.equal(n.vars[16385],1);assert.notEqual(blocker.x+':'+blocker.y,before.x+':'+before.y);assert.equal(n.brycenPuzzle.task,undefined);
 c.player.y=38.5;c.Journey.step(1/30,false);c.player.y=37.5;c.Journey.step(1/30,false);await drain(c,Promise.resolve(),0,"p1",()=>!c.NativeStory.locked);assert.equal(n.brycenPuzzle.states[0],0);assert.equal(n.vars[16385],0);const current=c.npcs.find(a=>a.uid===3);assert.equal(current.x,before.x);assert.equal(current.y,before.y);assert.equal(n.badges.length,6);
});

for(const speed of [1,4])test('Silvestro native victory/loss updates seventh badge, cap43 and TM79 once at ×'+speed,async()=>{
 for(const outcome of ['p1','p2']){const c=await setup(),n=c.NativeStory.state;c.testSpeed=speed;await drain(c,c.NativeStory.changeZone(114,17,14));await drain(c,c.NativeStory.run(0),0,outcome);const won=outcome==='p1';assert.equal(n.badges.includes(6),won);assert.equal(c.Training.limit(),won?43:39);assert.equal(c.Journey.itemCount(406),won?1:0);assert.equal(n.vars[16551]||0,won?1:0);assert.equal(n.vars[16437]||0,won?790:0);}
});

test('new native maps and coordinates survive source save validation without dropping the party',async()=>{
 const c=await setup();await drain(c,c.NativeStory.changeZone(114,18,61));const s=structuredClone(c.Journey.state);const saved=c.StoryState.normalize(s);assert.ok(saved);assert.equal(saved.scene,'zone114');assert.equal(saved.original.zone,114);assert.equal(saved.party.length,3);assert.equal(saved.player.x,s.player.x);assert.equal(saved.player.y,s.player.y);assert.equal(c.StoryState.normalize({...s,original:{...s.original,zone:'114'}})?.original,undefined);
});

test('native119 turns the player for405; the independent slide can autosave and resume without repeating its event',async()=>{
 const c=await setup();await drain(c,c.NativeStory.changeZone(114,18,61));c.player.x=1.5;c.player.y=44.5;c.facing=9;c.Journey.step(1/30,false);
 for(let i=0;i<200&&!c.NativeStory.fieldCheckpointAllowed;i++){await Promise.resolve();c.Journey.step(1/300,false);}
 assert.equal(c.facing,0);assert.equal(c.OpelucidGym.rails.busy,true);assert.equal(c.NativeStory.vm.running,false);assert.equal(c.NativeStory.fieldCheckpointAllowed,true);assert.equal(c.Journey.save(true),true);
 const saved=c.StoryState.read(c.localStorage);assert.ok(saved.original.brycenIceRide);const restored=await setup(saved);assert.equal(restored.OpelucidGym.rails.busy,true);assert.equal(restored.player.x,saved.player.x);assert.equal(restored.player.y,saved.player.y);
 await drain(restored,Promise.resolve(),0,'p1',()=>!restored.NativeStory.locked);assert.equal(restored.NativeStory.state.brycenIceRide,undefined);
 // Native163 is line2/front2 at (-4.5,42.5). The old endpoint44.5
 // is two blocked padding cells beyond the playable landing boundary.
 assert.ok(Math.abs(restored.player.x+4.5)<1e-6);assert.ok(Math.abs(restored.player.y-42.5)<1e-6,JSON.stringify(restored.player));assert.equal(restored.blocked(restored.player.x,restored.player.y),false);
 await drain(c,Promise.resolve(),0,'p1',()=>!c.NativeStory.locked);assert.equal(c.NativeStory.state.brycenIceRide,undefined);assert.equal(restored.player.x,c.player.x);assert.equal(restored.player.y,c.player.y);assert.equal(restored.NativeStory.state.fieldHeight,c.NativeStory.state.fieldHeight);
});

test('corrupt puzzle task is isolated and machine text references never grant an unavailable TM',async()=>{
 const c=await setup();await drain(c,c.NativeStory.changeZone(114,18,61));const s=structuredClone(c.Journey.state);s.original.brycenPuzzle={version:1,states:[0,0,0],switches:[0,0,0],task:{kind:'platform',index:0,start:0,frame:999,fraction:0}};
 const cleaned=c.StoryState.normalize(s);assert.equal(cleaned.original.brycenPuzzle.task,undefined);assert.equal(cleaned.party.length,3);assert.equal(c.NATIVE_MACHINE_TEXT.moves[328],468);assert.equal(c.TRAINING_DATA.machines[328],undefined);assert.equal(c.Journey.itemCount(328),0);
});

test('post-gym native cutscene reaches the Dragonspiral investigation without leaving input locked',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 await drain(c,c.NativeStory.changeZone(114,17,14));await drain(c,c.NativeStory.run(0),0,'p1');assert.equal(n.vars[16437],790);
 await drain(c,c.NativeStory.changeZone(113,172,170));
 await drain(c,c.NativeStory.run(1),0,'p1');
 assert.equal(n.vars[16535],4);assert.ok(n.flags.includes(580));assert.equal(c.NativeStory.locked,false);
 const trips=c.NativeStory.departures.records;
 for(const [name,destination,uid]of [['Komor','komor-dragonspiral',1],['Silvestro','brycen-dragonspiral',4]]){
  const trip=trips.get(name);assert.ok(trip,name+' retains a physical itinerary');assert.equal(trip.plan.destination,destination);assert.equal(trip.plan.kind,'path');assert.equal(trip.plan.leg,0);
 }
 await drain(c,Promise.resolve(),0,'p1',()=>['Komor','Silvestro'].every(name=>trips.get(name)?.stage==='resident'));
 for(const [name,zone,height]of [['Komor',208,3],['Silvestro',210,10]]){const r=trips.get(name);assert.equal(r.actor.fieldZone,zone);assert.equal(r.actor.height,c.OpelucidChapter.surfaceAt(zone,r.actor.x,r.actor.y,height).height);}
});

test('early tower arrival has no future collision and the event waits for physical roles',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16551]=1;
 await drain(c,c.NativeStory.changeZone(205,176,148));
 assert.equal(c.NativeStory.visualActors().some(a=>['Gasparago','Komor','Silvestro'].includes(a.name)),false);
 assert.equal(c.NativeStory.occupied(-602.5,-607.5),false);
 assert.equal(c.OpelucidContinuity.prepareEvent(205,1),false);assert.equal(c.NativeStory.locked,false);
});

test('legacy050 Cedric boundary checkpoint walks onward from its saved body',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16535]=2;
 await drain(c,c.NativeStory.changeZone(113,172,170));
 const body={name:'Gasparago',model:104,uid:252,fieldZone:113,x:-603.5,y:-591.5,height:3,direction:0,frame:0};
 assert.ok(c.NativeStory.departures.depart(body,113));const r=c.NativeStory.departures.records.get('Gasparago');
 Object.assign(r,{stage:'resident',index:0,plan:{...r.plan,points:[],kind:'arrival',destinationZone:113,targetUid:252}});
 const before={x:r.actor.x,y:r.actor.y};c.Journey.step(1/30,false);
 assert.equal(r.stage,'walk');assert.equal(r.plan.destinationZone,205);assert.equal(r.actor.x,before.x);assert.equal(r.actor.y,before.y);
 await drain(c,Promise.resolve(),0,'p1',()=>r.stage==='resident');assert.equal(r.actor.fieldZone,205);assert.equal(r.actor.uid,0);
});

test('native Dragonspiral entry scene advances the investigation and gives the Old Gateau',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 // Start at the preceding050 arrival. All subsequent progress comes from
 // native programs: Cedric, Silvestro, the Triad and the Tower investigation.
 n.vars[16535]=1;n.flags=n.flags.filter(f=>f!==579);
 await drain(c,c.NativeStory.changeZone(113,175,208));await drain(c,c.NativeStory.run(0),0,'p1');assert.equal(n.vars[16535],2);
 await drain(c,c.NativeStory.changeZone(114,17,14));await drain(c,c.NativeStory.run(0),0,'p1');
 await drain(c,c.NativeStory.changeZone(113,172,170));await drain(c,c.NativeStory.run(1),0,'p1');
 assert.ok(n.belleDragonspiralDeparture);assert.equal(c.NativeStory.departures.records.get('Belle')?.plan.destination,'belle-dragonspiral');
 await drain(c,c.NativeStory.changeZone(205,180,147));
 try{await drain(c,Promise.resolve(),0,'p1',()=>c.OpelucidContinuity.prepareEvent(205,1));}catch(error){throw Error(error.message+' '+JSON.stringify([...c.NativeStory.departures.records.values()].map(r=>({name:r.actor.name,stage:r.stage,zone:r.zone,position:[r.actor.x,r.actor.y],index:r.index,target:r.plan.points[r.index],length:r.plan.points.length}))));}
 assert.equal(c.OpelucidContinuity.prepareEvent(205,1),true);c.NativeStory.syncActors();
 await drain(c,c.NativeStory.run(0),0,'p1');assert.equal(n.vars[16551],2);assert.equal(n.vars[16535],5);assert.equal(c.Journey.itemCount(54),1);assert.equal(c.NativeStory.locked,false);
});

test('N continues the050 boundary checkpoint through every Tower floor only after the native bridge opens',async()=>{
 const c=await setup();await drain(c,c.NativeStory.changeZone(113,172,170));
 const body={name:'N',model:103,uid:253,fieldZone:113,x:-604.5,y:-591.5,height:3,direction:0,frame:0};
 assert.ok(c.NativeStory.departures.depart(body,113));const r=c.NativeStory.departures.records.get('N');
 Object.assign(r,{stage:'resident',index:0,plan:{...r.plan,kind:'arrival',points:[],destination:'n-dragonspiral-approach',destinationZone:113,targetUid:253,transferAuthorized:true}});
 c.Journey.step(1/30,false);assert.equal(r.stage,'resident');assert.equal(r.actor.y,body.y);
 await drain(c,c.NativeStory.changeZone(114,17,14));await drain(c,c.NativeStory.run(0),0,'p1');
 const current=()=>c.NativeStory.departures.records.get('N');try{await drain(c,Promise.resolve(),0,'p1',()=>current()?.stage==='resident'&&current().actor.fieldZone===213);}catch(error){const r=current();throw Error(error.message+' '+JSON.stringify({stage:r?.stage,zone:r?.zone,actor:r?.actor,leg:r?.plan.leg,index:r?.index,length:r?.plan.points.length,target:r?.plan.points[r.index],authorized:r?.plan.transferAuthorized}));}
 const arrived=current();
 assert.equal(arrived.plan.destination,'n-dragonspiral-summit');assert.equal(arrived.actor.uid,2);assert.equal(arrived.actor.x,.5);assert.equal(arrived.actor.y,-3.5);assert.equal(c.OpelucidContinuity.prepareEvent(213,1),false,'N alone cannot start the event before both friends arrive');
});

test('saving during an off-map native ledge jump preserves the airborne pose and completes the same journey',async()=>{
 const c=await setup();await drain(c,c.NativeStory.changeZone(114,17,14));await drain(c,c.NativeStory.run(0),0,'p1');
 assert.ok(c.NativeStory.departures.depart({name:'N',model:103,uid:253,fieldZone:113,x:-604.5,y:-591.5,height:3,direction:0,frame:0},113));c.NativeStory.departures.records.get('N').plan.transferAuthorized=true;
 const current=()=>c.NativeStory.departures.records.get('N');await drain(c,Promise.resolve(),0,'p1',()=>current()?.actor.fieldZone===211&&current().actor.jumpLift>.15);
 const before=structuredClone(current().actor);assert.equal(c.Journey.save(true),true);const saved=c.StoryState.read(c.localStorage),resumed=await setup(saved),trip=()=>resumed.NativeStory.departures.records.get('N');
 assert.equal(trip().actor.x,before.x);assert.equal(trip().actor.y,before.y);assert.equal(trip().actor.jumpLift,before.jumpLift);
 await drain(resumed,Promise.resolve(),0,'p1',()=>trip()?.stage==='resident'&&trip().actor.fieldZone===213);assert.equal(trip().actor.jumpLift||0,0);
});

test('native Tower summit program reaches the reserved investigation without unlocking the postgame capture',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16437]=790;n.vars[16551]=8;n.opelucidArrivals={'205:3':'Nardo','213:0':'Komor','213:1':'Silvestro'};
 await drain(c,c.NativeStory.changeZone(113,172,170));const body={name:'N',model:103,uid:253,fieldZone:113,x:-604.5,y:-591.5,height:3,direction:0,frame:0};
 assert.ok(c.NativeStory.departures.depart(body,113));await drain(c,Promise.resolve(),0,'p1',()=>c.NativeStory.departures.records.get('N')?.actor.fieldZone===213&&c.NativeStory.departures.records.get('N')?.stage==='resident');
 await drain(c,c.NativeStory.changeZone(213,16,21));await drain(c,c.NativeStory.run(0),0,'p1');await drain(c,Promise.resolve(),0,'p1',()=>n.vars[16541]===1&&!c.NativeStory.locked||!!c.elements.get('world')?.dataset.eventError);assert.equal(c.elements.get('world')?.dataset.eventError,undefined);
 assert.equal(n.vars[16551],9);assert.equal(n.zone,205);assert.equal(n.flags.includes(609),true);assert.equal(c.NativeStory.locked,false);
 assert.equal(c.Journey.state.party.some(p=>['Reshiram','Zekrom'].includes(p.name)),false);
});

test('presented summit boards N and retires both physical bodies without resident dragon copies',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16437]=790;n.vars[16551]=8;n.opelucidArrivals={'205:3':'Nardo','213:0':'Komor','213:1':'Silvestro'};c.renderer.hasPresentedActor=()=>true;
 await drain(c,c.NativeStory.changeZone(113,172,170));const body={name:'N',model:103,uid:253,fieldZone:113,x:-604.5,y:-591.5,height:3,direction:0,frame:0};c.NativeStory.departures.depart(body,113);await drain(c,Promise.resolve(),0,'p1',()=>c.NativeStory.departures.records.get('N')?.actor.fieldZone===213&&c.NativeStory.departures.records.get('N')?.stage==='resident');
 let mounted=0;const step=c.Journey.step;c.Journey.step=(...args)=>{step(...args);const actors=c.NativeStory.visualActors(),rider=actors.find(a=>a.name==='N'&&a.nativeDragonRider),dragon=actors.find(a=>[211,213].includes(a.model));if(rider&&dragon){mounted++;assert.equal(rider.x,dragon.x);assert.ok(Math.abs(rider.height-dragon.height-.9)<1e-7);}};
 await drain(c,c.NativeStory.changeZone(213,16,21));await drain(c,c.NativeStory.run(0),0,'p1');await drain(c,Promise.resolve(),0,'p1',()=>n.vars[16541]===1&&!c.NativeStory.locked||!!c.elements.get('world')?.dataset.eventError);assert.equal(c.elements.get('world')?.dataset.eventError,undefined);assert.ok(mounted>5,'N never mounted the dragon');assert.equal(n.zone,205);assert.equal([...c.NativeStory.departures.records.values()].some(r=>[211,213].includes(r.actor.model)),false);assert.equal(c.NativeStory.departures.records.has('N'),false);
});

test('player collision on rail-only Tower floors uses the native ribbons and rejects their voids',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 for(const zone of [209,211]){await c.OpelucidChapter.ensure(zone);n.zone=zone;n.fieldHeight=0;
  const positions=zone===211?c.NativeRailPaths.jumpLinks(zone).map(j=>j.from):c.OPELUCID_EVENTS.zones[zone].warps.map(w=>{const p=c.NativeRails.landing(zone,w);return {x:p.x,y:p.z,height:p.rail.height};});
  for(const p of positions){n.fieldHeight=p.height;assert.equal(c.OpelucidChapter.blockedAt(zone,p.x,p.y),false,zone+' ramp/portal is blocked');}
  assert.equal(c.OpelucidChapter.blockedAt(zone,500,500),true,'void became walkable');
 }
});

test('the dragon keeps native absolute height before its downward departure step',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16551]=10;await drain(c,c.NativeStory.changeZone(213,16,21));
 const command=async(name,args)=>drain(c,c.NativeStory.vm.host.command({name},args,args,c.NativeStory.vm));
 await command('ActorNew',[16,9,1,251,213,0]);await command('ActorSetGPos',[251,28,3,8,3]);const dragon=c.npcs.find(a=>a.uid===251);assert.equal(dragon.height,3,'109 supplies an absolute Y tile, not ground-level decoration');
 c.ORIGINAL_EVENTS.scripts[9001]={entries:[0],supportedEntries:[0],movements:{0:[[180,1]]},code:{0:{name:'ActorCmdExec',args:[251,0],end:8},8:{name:'ActorCmdWait',args:[],end:10},10:{name:'VMHalt',args:[],end:12}}};await drain(c,c.NativeStory.run(0,9001));assert.equal(dragon.height,2);assert.equal(dragon.nativeDragonFlight,true);assert.equal(dragon.noShadow,true,'flying body must not carry a floating contact shadow');
});

test('Komor stops at his native second-floor scene before continuing to Silvestro on floor four',async()=>{
 const c=await setup(),n=c.NativeStory.state;await drain(c,c.NativeStory.changeZone(114,17,14));await drain(c,c.NativeStory.run(0),0,'p1');await drain(c,c.NativeStory.changeZone(113,172,170));await drain(c,c.NativeStory.run(1),0,'p1');
 const current=()=>c.NativeStory.departures.records.get('Komor');await drain(c,Promise.resolve(),0,'p1',()=>current()?.stage==='resident'&&current()?.actor.fieldZone===208);assert.equal(current().actor.uid,251);assert.equal(current().actor.x,-11.5);assert.equal(current().actor.y,-1.5);assert.equal(c.OpelucidContinuity.prepareEvent(210,1),false);
 await drain(c,c.NativeStory.changeZone(207,14,26));await drain(c,c.NativeStory.run(0),0,'p1');await drain(c,Promise.resolve(),0,'p1',()=>n.vars[16551]===3&&!c.NativeStory.locked);assert.equal(n.vars[16551],3);
 await drain(c,c.NativeStory.changeZone(208,14,24));await drain(c,c.NativeStory.run(0),0,'p1');await drain(c,Promise.resolve(),0,'p1',()=>n.vars[16551]===4&&!c.NativeStory.locked);assert.equal(current()?.plan.destination,'komor-dragonspiral-upper');assert.ok(c.NativeStory.visualActors().filter(a=>a.name==='Komor').length<=1);
 await drain(c,Promise.resolve(),0,'p1',()=>current()?.stage==='resident'&&current()?.actor.fieldZone===210);assert.equal(current().actor.uid,0);assert.equal(c.OpelucidContinuity.prepareEvent(210,1),true);
});

test('native dragon cry text stays visible until the cry finishes, then the fifth-floor event advances once',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16551]=6;await drain(c,c.NativeStory.changeZone(212,16,22));let finishCry;const heard=[];c.AudioEngine.cry=id=>{heard.push(id);return new Promise(resolve=>finishCry=resolve);};const event=c.NativeStory.run(7);
 for(let i=0;i<500&&!heard.length;i++){await Promise.resolve();c.Journey.step(1/30,false);if(c.elements.get('dialogue')?.open)c.continue();}
 for(let i=0;i<12;i++)await Promise.resolve();assert.deepEqual(heard,[644]);assert.equal(c.elements.get('world')?.dataset.eventError,undefined);assert.equal(c.elements.get('dialogue').open,true);assert.ok(c.elements.get('dialogueText').textContent.length>0);
 c.continue();await Promise.resolve();assert.equal(n.vars[16551],6);assert.equal(c.elements.get('dialogue').open,true,'early A closed the roar text');finishCry();await drain(c,event,0,'p1');assert.equal(n.vars[16551],7);assert.equal(c.NativeStory.locked,false);assert.equal(heard.length,1);
});

test('Komor and Silvestro physically finish the Tower ascent and descend to their reserved roles before the investigation',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16551]=8;n.vars[16535]=5;n.vars[16437]=790;n.actors??={};n.actors[210]=[{name:'Komor',model:7,uid:0,fieldZone:210,x:3.5,y:.5,height:10,direction:2,frame:6,script:3},{name:'Silvestro',model:91,uid:1,fieldZone:210,x:3.5,y:-2.5,height:10,direction:0,frame:0,script:11}];
 await drain(c,c.NativeStory.changeZone(212,16,22));c.Journey.step(1/30,false);const trip=name=>c.NativeStory.departures.records.get(name);assert.equal(trip('Komor')?.plan.destination,'komor-dragonspiral-top');assert.equal(trip('Silvestro')?.plan.destination,'brycen-dragonspiral-top');assert.equal(c.OpelucidContinuity.prepareEvent(213,1),false);assert.equal(c.NativeStory.locked,false);
 await drain(c,Promise.resolve(),0,'p1',()=>['Komor','Silvestro'].every(name=>trip(name)?.stage==='resident'&&trip(name)?.actor.fieldZone===213));assert.equal(trip('Komor').actor.uid,0);assert.equal(trip('Silvestro').actor.uid,1);
 await drain(c,c.NativeStory.changeZone(213,16,21));n.flags=n.flags.filter(f=>f!==613);for(const id of [0,1])await c.NativeStory.vm.host.command({name:'ActorAdd'},[id],[id],c.NativeStory.vm);c.NativeStory.visualActors();for(const [name,address]of [['Komor',1496],['Silvestro',1524]]){const body=c.npcs.find(a=>a.name===name);assert.ok(c.MistraltonContinuity.startExitMotion(body,213,address));assert.ok(trip(name).plan.destination.endsWith('dragonspiral-return'));}
 n.vars[16551]=9;n.vars[16541]=1;await drain(c,c.NativeStory.changeZone(205,179,146));await drain(c,Promise.resolve(),0,'p1',()=>['Komor','Silvestro'].every(name=>trip(name)?.stage==='resident'&&trip(name)?.actor.fieldZone===205));assert.equal(trip('Komor').actor.uid,1);assert.equal(trip('Silvestro').actor.uid,4);assert.ok(Math.abs(trip('Silvestro').actor.height-3)<.01);assert.equal(c.NativeStory.visualActors().filter(a=>a.name==='Komor').length,1);
});

test('the reserved investigation leaves control while friends descend and survives a mid-descent save without repeating the awakening',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16437]=790;n.vars[16551]=8;n.opelucidArrivals={'205:3':'Nardo','213:0':'Komor','213:1':'Silvestro','213:2':'N'};
 await drain(c,c.NativeStory.changeZone(213,16,21));await drain(c,c.NativeStory.run(0),0,'p1');await drain(c,Promise.resolve(),0,'p1',()=>n.zone===205&&!c.NativeStory.locked);assert.equal(n.vars[16541]||0,0);assert.equal(c.OpelucidContinuity.deferredEvent(205),4);assert.equal(c.OpelucidContinuity.prepareEvent(205,4),false);
 await drain(c,Promise.resolve(),0,'p1',()=>[...c.NativeStory.departures.records.values()].some(r=>r.actor.fieldZone===211&&r.actor.jumpLift>.1));c.NativeStory.captureActors();assert.equal(c.Journey.save(true),true);const saved=c.StoryState.read(c.localStorage);assert.equal(saved.original.vars[16541]||0,0);assert.ok(saved.original.departures.some(r=>r.actor.fieldZone===211&&r.actor.jumpLift>.1));
 const resumed=await setup(saved);await drain(resumed,Promise.resolve(),0,'p1',()=>resumed.NativeStory.state.vars[16541]===1&&!resumed.NativeStory.locked);assert.equal(resumed.NativeStory.state.zone,205);assert.equal(resumed.cinematics,undefined,'Reload repeated the awakening');assert.equal(resumed.OpelucidContinuity.deferredEvent(205),null);
});

test('new chapter events prepare the actual scene and arriving bodies before executing their native instructions',async()=>{
 const c=await setup(),n=c.NativeStory.state;await drain(c,c.NativeStory.changeZone(212,16,22));n.vars[16551]=6;const heard=[];c.AudioEngine.cry=id=>{heard.push(id);return Promise.resolve();};let release,calls=0;const gate=new Promise(resolve=>release=resolve);c.renderer.prepareScene=()=>{calls++;return gate;};const before=c.NativeStory.vm.trace.length,event=c.NativeStory.run(7);for(let i=0;i<12;i++)await Promise.resolve();assert.equal(calls,1);assert.equal(c.NativeStory.vm.trace.length,before);assert.equal(c.NativeStory.locked,true);await c.NativeStory.run(7);assert.equal(c.NativeStory.vm.trace.length,before);assert.equal(calls,1);release();await drain(c,event,0,'p1');assert.equal(n.vars[16551],7);assert.deepEqual(heard,[644]);
});

test('Gasparago and Silvestro re-enter the Tower and adopt their actual first-floor research roles',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16437]=790;n.vars[16551]=9;n.vars[16541]=1;n.flags=n.flags.filter(f=>![602,606,607].includes(f));await drain(c,c.NativeStory.changeZone(205,179,146));
 for(const [name,address]of [['Gasparago',800],['Silvestro',816]]){const body=c.npcs.find(a=>a.name===name&&a.fieldZone===205);assert.ok(body);assert.equal(c.MistraltonContinuity.startExitMotion(body,205,address),true);assert.equal(c.OpelucidContinuity.allowActor({name,fieldZone:207,uid:name==='Gasparago'?1:0}),false);}
 const trip=name=>c.NativeStory.departures.records.get(name);await drain(c,Promise.resolve(),0,'p1',()=>['Gasparago','Silvestro'].every(name=>trip(name)?.stage==='resident'&&trip(name)?.actor.fieldZone===207));
 assert.equal(trip('Gasparago').actor.uid,1);assert.equal(trip('Gasparago').actor.x,6.5);assert.equal(trip('Gasparago').actor.y,-3.5);assert.equal(trip('Silvestro').actor.uid,0);assert.equal(trip('Silvestro').actor.x,8.5);assert.equal(trip('Silvestro').actor.y,-5.5);await drain(c,c.NativeStory.changeZone(207,14,26));const actors=c.NativeStory.visualActors();for(const name of ['Gasparago','Silvestro'])assert.equal(actors.filter(a=>a.name===name).length,1);assert.equal(c.NativeStory.departures.records.has('Gasparago'),false);const pages=await drain(c,c.NativeStory.run(1),0,'p1');assert.ok(pages.some(p=>p.includes('Gasparago')),'Native research dialogue unavailable');
});

test('a visible follower crosses the shared Icirrus/Dragonspiral boundary without waiting to disappear',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16535]=5;n.vars[16551]=2;n.vars[16437]=790;await drain(c,c.NativeStory.changeZone(113,172,170));let sequence=0;c.renderer.actorVisibility=()=>({visible:true,sequence:++sequence});const start={name:'Komor',model:7,uid:0,fieldZone:113,x:-605.5,y:-591.5,height:3,direction:0,frame:0};assert.ok(c.NativeStory.departures.depart(start,113));const trip=c.NativeStory.departures.records.get('Komor'),body=trip.actor;let before={...body};for(let i=0;i<250&&trip.zone===113;i++){before={...trip.actor};c.Journey.step(1/30,false);await Promise.resolve();}
 assert.equal(trip.zone,205);assert.equal(trip.actor,body,'Shared-field crossing replaced the physical actor');assert.ok(Math.hypot(body.x-before.x,body.y-before.y)<=.126);assert.equal(c.NativeStory.departures.retired.some(a=>a.name==='Komor'),false);assert.equal(c.NativeStory.visualActors().filter(a=>a.name==='Komor').length,1);
});
