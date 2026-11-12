/* Opening events with all052 modules installed, matching release startup scope.
 * Explicit battle outcomes isolate story branches; this is not a GPU replay. */
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {environment,drain}=require('./helpers/league-field-host.cjs');
for(const [starter,name]of ['Snivy','Tepig','Oshawott'].entries())for(const outcome of ['p1','p2'])test('052 modules preserve the original opening and tutorial for '+name+'/'+outcome,async()=>{
 const c=environment({league:true,sourceRoot:path.resolve(__dirname,'../src')}),n=c.NativeStory,j=c.Journey;await c.OpelucidChapter.ensure();
 await drain(c,n.run(4,782),starter,outcome);await drain(c,n.run(8,782),starter,outcome);assert.equal(j.state.starter,name);assert.equal(j.state.phase,'mother');
 c.player={x:-7.2,y:-13.5};j.step(1,false);const stairs=n.tryWarp(1,0,-7.1,-13.5);assert.ok(stairs);await drain(c,stairs,starter,outcome);assert.equal(n.state.zone,390);assert.equal(n.state.phone,true);
 await n.changeZone(392,5,9);await drain(c,n.run(2,784),starter,outcome);await n.changeZone(396,4,11);await drain(c,n.run(0,792),starter,outcome);assert.equal(n.state.pokedex,true);
 await n.changeZone(389,777,741);await drain(c,n.run(11,778),starter,outcome);assert.equal(n.state.map,true);c.player={x:4.5,y:-12.5};await drain(c,n.run(13,778),starter,outcome);assert.equal(n.state.vars[16508],1);assert.equal(j.state.pokeballs,5);
 assert.equal(n.departures.records.has('Nardo'),false);assert.equal(c.LeagueJourneys.prepareEvent(355,1),false);assert.equal(n.state.vars[16568]??0,0);assert.equal(n.state.badges?.length??0,0);assert.equal(c.Training.limit(),31);
 assert.equal(j.save(true),true);const saved=c.StoryState.read(c.localStorage);assert.equal(saved.starter,name);assert.equal(saved.original.chapter052,true);assert.equal(saved.original.vars[16508],1);
});
