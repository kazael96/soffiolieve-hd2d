/* Original scripts and native flags; rendering, audio output and input prompts mocked. */
const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/finale-field-host.cjs');
test('Sages, Gym Leaders, three corridor encounters and Ghetsis entry all finish before changing map',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.vars[16546]=1;n.vars[16434]=548;n.flags.push(2428);
 for(const [zone,x,z,work]of [[264,25,20,16549],[265,16,15,16550],[269,4,13,16596],[273,7,15,16597],[277,24,9,16604]]){
  await drain(c,c.NativeStory.changeZone(zone,x,z));
  // A floor trigger may have begun during the reveal. run() intentionally
  // ignores duplicate requests; wait for that same original event to finish.
  await drain(c,c.NativeStory.run(0),0,'play',()=>n.vars[work]===1&&!c.NativeStory.locked);
  assert.equal(n.zone,zone);assert.equal(n.vars[work],1);assert.equal(c.NativeStory.vm.running,false);assert.equal(c.Journey.processing,false);assert.equal(c.$('world').dataset.eventError,undefined);
  if(zone===264){assert.equal(c.npcs.length,14,'Six Sages and eight Gym Leaders remain resident');for(let id=0;id<14;id++)assert.ok(c.npcs.some(a=>a.uid===id&&!a.hidden));}
  if([265,269,273].includes(zone))assert.equal(c.npcs.length,0,'Temporary corridor actor removed after covered exit');
  if(zone===277){const g=c.npcs.find(a=>a.uid===0);assert.equal(g.name,'Ghecis');assert.equal(g.hidden,undefined);assert.deepEqual([g.x,g.y],[6.5,-5.5]);}
 }
 assert.ok(c.soundRequests.some(s=>s.id===1975));
});
