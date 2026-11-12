const test=require('node:test'),assert=require('node:assert/strict');
const {create,drain}=require('./helpers/finale-field-host.cjs');
test('native217 selects League return context without healing or changing the map',async()=>{
 const c=create(),n=c.NativeStory.state,m=c.NativeStory.vm;
 n.healZone=122;const beforeZone=n.zone;c.Journey.state.party=[{name:'Snivy',level:5,hp:1,status:'psn',pp:[]}];
 assert.equal(await m.host.command({name:'NativeOpcode217'},[12],[12],m),true);
 assert.equal(n.returnContext,12);assert.equal(n.healZone,122);assert.equal(n.zone,beforeZone);
 assert.equal(c.Journey.state.party[0].hp,1);assert.equal(c.Journey.state.party[0].status,'psn');
 assert.equal(await m.host.command({name:'NativeOpcode217'},[99],[99],m),true);assert.equal(n.returnContext,12);
});
test('actual blackout resolves context12 to Center146 at native7/12 facing1',async()=>{
 const c=create(),n=c.NativeStory.state;Object.assign(n,{intro:true,initialized:true,returnContext:12,healZone:122});
 await drain(c,c.NativeStory.blackout());
 assert.equal(n.zone,146);assert.equal(c.facing,3);
 // The renderer uses centered native coordinates, not the return-context index.
 assert.equal(c.player.x,-8.5);assert.equal(c.player.y,-3.5);
 assert.equal(c.NativeStory.locked,false);assert.equal(c.elements.get('world')?.dataset.eventError,undefined);
});
test('return context survives a real storage round trip without replacing legacy progress',async()=>{
 const {setup}=require('./helpers/finale-field-host.cjs'),c=await setup(),n=c.NativeStory.state;
 n.returnContext=12;n.firstEndingWins=[228,228,999,587];c.Journey.state.money=54321;
 assert.equal(c.Journey.save(true),true);const saved=c.StoryState.read(c.localStorage);
 assert.equal(saved.original.returnContext,12);assert.deepEqual(Array.from(saved.original.firstEndingWins),[228,587]);
 const next=create({save:saved});assert.equal(next.Journey.state.money,54321);assert.equal(next.NativeStory.state.returnContext,12);
 await drain(next,next.NativeStory.blackout());assert.equal(next.NativeStory.state.zone,146);assert.equal(next.player.y,-3.5);
});
test('actual nurse replaces the League return context when healing in Opelucid',async()=>{
 const {setup}=require('./helpers/finale-field-host.cjs'),c=await setup(),n=c.NativeStory.state;
 n.returnContext=12;await drain(c,c.NativeStory.changeZone(122,7,12));
 const nurse=c.npcs.find(a=>a.uid===2);assert.ok(nurse);Object.assign(c.player,{x:nurse.x,y:nurse.y+2});c.facing=0;
 c.Journey.state.party[0].hp=1;c.testChoices=[0];await drain(c,c.NativeStory.interact());
 assert.equal(n.healZone,122);assert.equal(n.returnContext,10);
 await drain(c,c.NativeStory.blackout());assert.equal(n.zone,122);assert.equal(c.player.x,-8.5);assert.equal(c.player.y,-3.5);
});
