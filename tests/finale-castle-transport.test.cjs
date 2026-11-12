const test=require('node:test'),assert=require('node:assert/strict');
const {setup,drain}=require('./helpers/finale-field-host.cjs');
async function center(){const c=await setup(),n=c.NativeStory.state;n.flags=n.flags.filter(flag=>flag!==669);n.flags.push(185);await drain(c,c.NativeStory.changeZone(146,7,12));const grunt=c.npcs.find(a=>a.uid===0);assert.ok(grunt);Object.assign(c.player,{x:grunt.x+1,y:grunt.y});c.facing=6;return c;}
test('actual League transport dialogue reaches native Castle room2729/8 and releases input',async()=>{
 const c=await center();c.testChoices=[0];await drain(c,c.NativeStory.interact());
 assert.equal(c.NativeStory.state.zone,272);assert.equal(c.player.x,-6.5);assert.equal(c.player.y,-7.5);assert.equal(c.facing,3);
 assert.equal(c.NativeStory.locked,false);assert.equal(c.StoryState.read(c.localStorage).original.zone,272);
 assert.ok(c.npcs.some(a=>a.model===98),'destination Plasma role is available');
});
test('declining the native Castle transport keeps the party and recorded Center intact',async()=>{
 const c=await center(),before=JSON.stringify(c.Journey.state.party);c.testChoices=[1];await drain(c,c.NativeStory.interact());
 assert.equal(c.NativeStory.state.zone,146);assert.equal(JSON.stringify(c.Journey.state.party),before);assert.equal(c.NativeStory.locked,false);
});
