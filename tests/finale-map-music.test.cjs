/* Actual VM host and native map catalogs, with the audio output mocked. */
const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/finale-field-host.cjs');
test('587 queues the current Castle map music and its fades without waiting for the entire song transition',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 await drain(c,c.NativeStory.changeZone(278,10,10));
 const tracks=[];c.AudioEngine.setScene=async id=>tracks.push(id);
 n.music=1140;n.fieldMusicVolume=127;
 await drain(c,c.NativeStory.vm.host.command({name:'NativeOpcode587'},[6],[6],c.NativeStory.vm));
 assert.ok(n.fieldMusicFade||tracks.includes(1076),'The original map-music request was not submitted');
 for(let i=0;i<90;i++){c.Journey.step(1/30,false);await Promise.resolve();}
 assert.deepEqual(tracks,[1076]);assert.equal(n.music,1076);assert.equal(n.fieldMusicVolume,127);assert.equal(n.fieldMusicFade,undefined);
 assert.equal(n.nimbasaCameraDuration,undefined,'587 is a map-music request, not a camera command');
});
