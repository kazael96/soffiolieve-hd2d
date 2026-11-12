/* Original portal record and real field dispatch; covered waypoint, no GPU. */
const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/league-field-host.cjs');
async function upper(){const c=await setup();await drain(c,c.NativeStory.changeZone(121,27,1,12.002914428710938));c.Journey.step(.9,false);return c;}
test('the native directionless upper return pad reaches its declared lower landing exactly once',async()=>{
 const c=await upper(),n=c.NativeStory.state,pad=c.ORIGINAL_EVENTS.zones[121].warps[1];assert.equal(pad.a,0);assert.equal(pad.transition,5);assert.equal(pad.zone,121);assert.equal(pad.warp,2);const pending=c.NativeStory.tryWarp(0,-1,11.5,-15.2);assert.ok(pending,'Native directionless return pad was ignored');assert.equal(c.NativeStory.tryWarp(0,-1,11.5,-15.2),false);await drain(c,pending);assert.equal(n.zone,121);assert.equal(n.fieldHeight,0);assert.ok(Math.abs(c.player.x-10.5)<.01);assert.ok(Math.abs(c.player.y-30.5)<.01);assert.equal(c.NativeStory.locked,false);assert.equal(c.blocked(c.player.x,c.player.y),false);assert.equal(c.elements.get('world').dataset.eventError,undefined);
});
test('the upper return pad cannot trigger through another floor, beside its tile or from a stationary probe',async()=>{
 const c=await upper(),n=c.NativeStory.state;n.fieldHeight=0;assert.equal(c.NativeStory.tryWarp(0,-1,11.5,-15.2),false);n.fieldHeight=12;assert.equal(c.NativeStory.tryWarp(0,-1,12.5,-15.2),false);assert.equal(c.NativeStory.tryWarp(0,0,11.5,-15.5),false);assert.equal(n.zone,121);assert.equal(c.NativeStory.locked,false);
});
test('leaving through the actual Gym door starts Aralia once and grants the native Master Ball before the next route',async()=>{
 const c=await setup(),n=c.NativeStory.state;n.badges=[0,1,2,3,4,5,6,7];n.vars[16568]=1;n.vars[16552]=2;n.flags.push(2425);await drain(c,c.NativeStory.changeZone(121,27,49,0));c.Journey.step(.9,false);const pending=c.NativeStory.tryWarp(0,1,11.5,34);assert.ok(pending,'Native Gym exit did not start');await drain(c,pending);assert.equal(n.zone,120);assert.equal(n.vars[16568],2);assert.equal(c.Journey.itemCount(1),1);assert.equal(c.NativeStory.locked,false);
 // The original on-entry work value must not re-award the gift on re-entry.
 await drain(c,c.NativeStory.changeZone(121,27,49,0));c.Journey.step(.9,false);await drain(c,c.NativeStory.tryWarp(0,1,11.5,34));assert.equal(c.Journey.itemCount(1),1);assert.equal(n.vars[16568],2);assert.equal(c.NativeStory.locked,false);
});
