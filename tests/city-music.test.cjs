const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('city stems start together, musician activation preserves playback, leaving fades all layers',async()=>{
 const calls=[],stopped=[],source=fs.readFileSync(require.resolve('../src/audio-engine.js'),'utf8');
 const c={scene:null,enabled:true,ctx:{currentTime:10},generation:0,musicVoice:null,catalog:{music:{}},data:{sounds:{1137:{src:'n'}}},FIELD_AUDIO:{1019:{src:'base',loop:[1,5],fadeFrames:60,layers:[{src:'piano',flag:1,loop:[1,5]},{src:'drums',flag:2,loop:[1,5]}]}},musicBus:{},labels:{},NativeStory:{state:{musicTracks:{}}},load:async src=>({src}),status(){},applyMusicLevel(){},el:()=>({dataset:{}}),problem:e=>{throw e},fadeStop:v=>{if(v)stopped.push(v);},voice(buffer,bus,options){const ramps=[],v={buffer,options,ramps,gain:{gain:{value:0,cancelScheduledValues(){},setValueAtTime(){},linearRampToValueAtTime:(n,t)=>ramps.push([n,t])}}};calls.push(v);return v;}};
 c.window=c;vm.createContext(c);vm.runInContext(source.slice(source.indexOf(' function setMusicTrack('),source.indexOf(' async function enable(')),c);
 await c.setScene(1019);assert.equal(calls.length,3);assert.equal(new Set(calls.map(v=>v.options.when)).size,1);assert.equal(calls[1].ramps.at(-1)[0],0);
 c.setMusicTrack(1,true);assert.equal(calls.length,3);assert.deepEqual(calls[1].ramps.at(-1),[1,11]);assert.equal(calls[2].ramps.at(-1)[0],0);
 await c.setScene(1137);assert.equal(stopped.length,3);assert.equal(calls.length,4);assert.equal(calls[3].buffer.src,'n');
});
