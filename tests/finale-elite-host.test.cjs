/* Original280/282/284/286 programs in the actual host; renderer/audio output mocked. */
const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/finale-field-host.cjs');
test('all four native room initializers and entrance events complete without no-op commands and release control',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 for(const zone of [140,141,142,143]){
  const before=c.soundRequests?.length||0;await drain(c,c.NativeStory.changeZone(zone,15,25));assert.equal(n.zone,zone);
  // The actual footstep trigger may already have started during scene reveal.
  await drain(c,Promise.resolve(),0,'play',()=>n.vars[16384]===1&&!c.NativeStory.locked);
  assert.equal(c.$('world').dataset.eventError,undefined,'native entrance failed '+zone);assert.equal(c.NativeStory.locked,false);assert.equal(c.FinaleElite.busy,false);assert.equal(c.FinaleElite.hidden,false);
  // Native programs continue walking after418: Mirton up1+3, Marzio up5,
  // Catlina right1/up4. Antemia ends directly at the task destination.
  const end={140:[-.5,-2.5],141:[-.5,-3.5],142:[-.5,-2.5],143:[-.5,-3.5]}[zone];assert.equal(c.player.x,end[0]);assert.equal(c.player.y,end[1]);assert.equal(c.facing,0);
  assert.ok((c.soundRequests||[]).slice(before).length>0,'native sound gates must execute '+zone);assert.ok(c.FinaleElite.projection(390,844,1.4)?.every(Number.isFinite),'native settled camera '+zone);
 }
});
test('actual Elite battle programs retain victories once, unlock cap52 only after four wins, and keep eight badges',async()=>{
 const c=await setup(),n=c.NativeStory.state;const encountered=[];const start=c.startBattle;c.startBattle=(trainer,config)=>{encountered.push(config.trainerId);return start(trainer,config);};
 // This event-host test forces battle outcomes; real combat and pixels are
 // separate checks. It verifies the native script after each result callback.
 for(const [zone,id,flag]of [[140,228,2409],[141,230,2410],[142,229,2411],[143,231,2412]]){
  await drain(c,c.NativeStory.changeZone(zone,15,25));await drain(c,Promise.resolve(),0,'p1',()=>n.vars[16384]===1&&!c.NativeStory.locked);
  const leader=c.npcs.find(x=>x.uid===0);Object.assign(c.player,{x:leader.x,y:leader.y+1});c.facing=0;
  assert.equal(c.FinaleProgression.limit(n),50);await drain(c,c.NativeStory.interact(),0,'p1');
  assert.equal(encountered.at(-1),id);assert.ok(n.firstEndingWins.includes(id));assert.ok(n.flags.includes(flag));assert.equal(c.NativeStory.locked,false);
  const count=encountered.length,money=c.Journey.state.money;await drain(c,c.NativeStory.interact(),0,'p1');assert.equal(encountered.length,count,'No duplicate fight after victory');assert.equal(c.Journey.state.money,money,'No duplicate prize');
 }
 assert.deepEqual(Array.from(n.firstEndingWins),[228,230,229,231]);assert.equal(c.FinaleProgression.limit(n),52);assert.deepEqual(Array.from(n.badges),[0,1,2,3,4,5,6,7]);
});
