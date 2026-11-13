const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {create}=require('../src/finale-elite-sound.js');
function data(){const c={window:{}};vm.runInNewContext(fs.readFileSync('src/finale-elite-controls.js','utf8'),c);return JSON.parse(JSON.stringify(c.window.FINALE_ELITE_CONTROLS));}
test('native nine-channel control ordering yields the19 actual room events including Marshal stop610',()=>{
 const d=data();assert.deepEqual(d.channels,[6,7,8,0,1,2,3,4,5]);assert.equal(Object.values(d.rooms).reduce((sum,r)=>sum+r.events.length,0),19);
 assert.deepEqual(d.rooms[140].events.map(e=>[e.frame,e.id]),[[33,1864],[67,1865],[400,1866]]);
 assert.deepEqual(d.rooms[142].events.filter(e=>e.frame===610).map(e=>[e.action,e.id]),[['stop',1856],['play',1880]]);
 assert.deepEqual(d.rooms[143].destination,[14,0,16]);assert.equal(d.rooms[141].facing,3);
});
test('native clock crossings preserve all cues once at1x2x4 and low frame rates',()=>{
 for(const [zone,room]of Object.entries(data().rooms))for(const step of [.5,1,2,4,7.25]){
  const actual=[],track=create({room,play:(id,event)=>actual.push({...event}),stop:(id,event)=>actual.push({...event})});
  for(let frame=0;frame<room.frames+step;frame+=step)track.advance(frame);
  assert.deepEqual(actual,room.events,'zone'+zone+' step'+step);assert.equal(track.finished,true);
  track.advance(room.frames+100);assert.deepEqual(actual,room.events,'finished task must not replay sound');
 }
});
test('cancelling owns only sounds emitted by this task and cannot replay them',()=>{
 const stops=[],room=data().rooms[142],track=create({room,play(){},stop:(id,event)=>stops.push([id,event.action])});
 track.advance(100);assert.equal(track.finished,false);assert.equal(track.cancel(),true);
 assert.deepEqual(stops,[[1879,'cancel'],[1881,'cancel'],[1856,'cancel']]);assert.equal(track.cancel(),false);
 assert.equal(track.advance(610),false);assert.equal(stops.length,3);
});
test('invalid controls and backwards clocks fail explicitly',()=>{
 const room=data().rooms[140];assert.throws(()=>create({room:{...room,events:[{frame:0,id:65535,action:'play'}]},play(){},stop(){}}),/non valido/);
 const track=create({room,play(){},stop(){}});for(const frame of [NaN,Infinity,-1])assert.throws(()=>track.advance(frame),/non valido/);
 track.advance(40);assert.throws(()=>track.advance(39),/non valido/);
});
