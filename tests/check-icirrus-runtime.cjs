/* Native narrative contracts with supplied battle outcomes; browser travel is separate. */
const path=require('node:path'),assert=require('node:assert/strict'),{environment,drain}=require('./check-story-runtime.cjs');
(async()=>{
 const c=environment({icirrus:true,sourceRoot:process.env.QA_SOURCE_ROOT}),n=c.NativeStory.state,j=c.Journey;await c.IcirrusChapter.ensure();
 Object.assign(n,{intro:true,initialized:true,pokedex:true,mistralton:true,badges:[0,1,2,3,4],healZone:109});Object.assign(n.vars,Object.fromEntries(Array.from({length:61},(_,i)=>[16520+i,100])),{16537:0,16535:0,16564:1,16570:0,16571:0});j.state.starter='Snivy';j.state.party=['Servine','Pignite','Dewott'].map(name=>j.pack(c.makeMon(name,35),c.OPENING_DATA[name].growth[35]));j.displayPartner();
 async function event(label,zone,x,z,entry){await drain(c,c.NativeStory.changeZone(zone,x,z));await drain(c,c.NativeStory.run(entry),0,'p1',()=>!c.NativeStory.locked);console.log('PASS '+label);}
 async function travel(name){await drain(c,c.NativeStory.changeZone(195,7,59));for(let i=0;i<30000;i++){c.Journey.step(1/30,false);await Promise.resolve();const r=c.NativeStory.departures.records.get(name);if(!r||r.stage==='resident')return;}throw Error('Itinerary did not finish: '+name);}
 await event('Ponentopoli native introduction',107,102,302,7);assert.equal(n.vars[16537],1);
 await travel('Anemone');await event('Anemone introduces the Tower bell',342,16,16,0);assert.equal(n.vars[16570],1);
 await event('Native bell animation and Anemone departure',342,16,11,2);assert.ok(n.flags.includes(676));
 await travel('Anemone');await event('Anemone sixth badge and Acrobatics',108,15,6,4);assert.ok(n.badges.includes(5));assert.equal(c.Training.limit(),39);assert.equal(j.itemCount(389),1);
 await event('N outside the airport after the sixth badge',107,76,269,12);assert.equal(n.vars[16537],3);
 // Reproduce the actual049 Komor handoff with the previous host, then import it.
 const legacy=environment({mistralton:true,sourceRoot:process.env.QA_SOURCE_ROOT});await legacy.MistraltonChapter.ensure();legacy.NativeStory.state.zone=195;
 const source=legacy.MISTRALTON_EVENTS.zones[96].actors.find(a=>a.id===11);assert.equal(source.model,7);legacy.NativeStory.departures.depart({name:'Komor',uid:11,fieldZone:96,x:source.x-783.5,y:source.z-751.5,height:source.y/65536,frame:0,direction:0},96);legacy.MistraltonContinuity.coveredTransition();
 for(let i=0;i<30000;i++){legacy.NativeStory.departures.tick(1/30);legacy.MistraltonContinuity.tick(1/30);await Promise.resolve();if(legacy.NativeStory.departures.records.get('Komor')?.plan.nextChapter)break;}
 const handoff=JSON.parse(JSON.stringify(legacy.NativeStory.departures.save()));assert.equal(handoff[0].plan.nextChapter,true);c.NativeStory.departures.restore(handoff,n.zone,n);await travel('Komor');
 assert.equal(c.NativeStory.departures.records.get('Komor').zone,198);await event('Komor battle, Nardo jump and native Surf gift',198,144,208,1);assert.equal(j.itemCount(422),1);
 await travel('Komor');await event('Komor and Plasma in the final Mountain gallery',202,52,14,0);assert.equal(n.vars[16571],1);assert.equal(n.vars[16535],1);
 await travel('Rutilo');await event('Rutilo arrival at Icirrus',113,176,209,0);assert.equal(n.vars[16535],2);assert.equal(j.state.phase,'icirrus');
 console.log('PASS native main narrative through Icirrus, with legacy Komor transfer');
})().catch(error=>{console.error(error);process.exitCode=1;});
