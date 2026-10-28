const assert=require('node:assert/strict'),{environment,drain}=require('./check-story-runtime.cjs');
let reloads=0;
(async()=>{for(let starter=0;starter<3;starter++){
 let c=environment();
 function reload(label){c.NativeStory.captureActors();assert.equal(c.Journey.save(true),true,label+' save');const saved=c.StoryState.read(c.localStorage),before=JSON.stringify(saved),old=c;c=environment({save:saved});const loaded=c.StoryState.read(c.localStorage);assert.equal(JSON.stringify(loaded),before,label+' storage changed');assert.equal(c.Journey.state.phase,saved.phase,label+' phase');assert.equal(c.NativeStory.state.zone,saved.original.zone,label+' zone');assert.equal(c.Journey.state.starter,saved.starter,label+' starter');const party=p=>JSON.stringify(Array.from(p,m=>[m.name,m.hp,m.pp.map(v=>[v.id,v.left])]));assert.equal(party(c.Journey.state.party),party(saved.party),label+' party');for(const r of old.NativeStory.departures.save()){const restored=c.NativeStory.departures.records.get(r.key);assert.ok(restored,label+' missing departure');assert.equal(restored.actor.x,r.actor.x);assert.equal(restored.actor.y,r.actor.y);}reloads++;}
 await drain(c,c.NativeStory.run(4,782),starter);reload('intro');
 await drain(c,c.NativeStory.run(8,782),starter);reload('rivals');
 c.player={x:-7.2,y:-13.5};c.Journey.step(1,false);await drain(c,c.NativeStory.tryWarp(1,0,-7.1,-13.5),starter);reload('mother');
 await c.NativeStory.changeZone(392,5,9);await drain(c,c.NativeStory.run(2,784),starter);reload('Belle house');
 await c.NativeStory.changeZone(396,4,11);await drain(c,c.NativeStory.run(0,792),starter);reload('lab');
 await c.NativeStory.changeZone(389,777,741);await drain(c,c.NativeStory.run(11,778),starter);reload('map');
 c.player={x:4.5,y:-12.5};await drain(c,c.NativeStory.run(13,778),starter);reload('capture tutorial');assert.equal(c.Journey.state.pokeballs,5);
 await drain(c,c.NativeStory.run(1,634),starter);reload('route potion');const potions=c.potions;await drain(c,c.NativeStory.run(1,634),starter);assert.equal(c.potions,potions,'reloading duplicates potion');
 c.player={x:6.5,y:-73.5};await drain(c,c.NativeStory.run(4,634),starter);reload('comparison');
 c.player={x:6.5,y:-80.5};c.Journey.step(1/30,true);if(c.$('dialogue').open)c.continue();reload('arrival');assert.equal(c.Journey.state.phase,'arrival');
 console.log('PASS checkpoint replay starter='+['Snivy','Tepig','Oshawott'][starter]);
 }console.log(JSON.stringify({suite:'checkpoint-stress',reloads,result:'PASS'}));
})().catch(e=>{console.error(e);process.exitCode=1});
