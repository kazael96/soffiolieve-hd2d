/* Actual native event/field host. Battle winners and visual effects are isolated;
 * these tests certify reward/control flow, not the fight, badge pixels or audio. */
const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/league-field-host.cjs');
async function approach(){const c=await setup(),n=c.NativeStory.state;c.Journey.state.party=[c.Journey.pack(c.makeMon('Snivy',43),0)];c.Journey.displayPartner();c.player={x:11.5,y:-12.5};c.facing=0;n.fieldHeight=12.002914428710938;delete n.railCurrent;return c;}
test('the native Aristide interaction awards badge8 and reusable TM82 once, raises the cap to50 and records the next event',async()=>{
 const c=await approach(),n=c.NativeStory.state;assert.equal(c.Training.limit(n),43);await drain(c,c.NativeStory.interact(),0,'p1');assert.ok(n.badges.includes(7));assert.equal(c.Journey.itemCount(409),1);assert.equal(c.TRAINING_DATA.machines[409],525);assert.equal(c.Training.limit(n),50);assert.equal(n.vars[16568],1);assert.ok(n.flags.includes(2425));assert.ok(c.fieldEffects.includes(10));assert.equal(c.NativeStory.locked,false);
 await drain(c,c.NativeStory.interact(),0,'p1');assert.equal(c.Journey.itemCount(409),1);assert.equal(n.badges.filter(b=>b===7).length,1);
});
test('losing the native Aristide battle cannot award his badge, TM or next-story flag',async()=>{
 const c=await approach(),n=c.NativeStory.state;await drain(c,c.NativeStory.interact(),0,'p2');assert.equal(n.badges.includes(7),false);assert.equal(c.Journey.itemCount(409),0);assert.notEqual(n.vars[16568],1);assert.equal(c.Training.limit(n),43);assert.equal(c.NativeStory.locked,false);
});

test('the new reusable TM teaches its native move only to compatible Pokémon and survives learning',async()=>{
 const c=await approach(),n=c.NativeStory.state;assert.equal(c.Journey.addItem(409,1),true);c.Journey.state.party=[c.Journey.pack(c.makeMon('Serperior',43),0),c.Journey.pack(c.makeMon('Lillipup',43),0)];assert.ok(c.TRAINING_DATA.compatibility.Serperior.includes(409));assert.equal(await c.Journey.teachMachine(409,1),false);
 const learned=c.Journey.teachMachine(409,0);await drain(c,learned);assert.ok(c.Journey.state.party[0].pp.some(m=>m.id===525));assert.equal(c.Journey.itemCount(409),1);assert.equal(n.zone,121);
});
