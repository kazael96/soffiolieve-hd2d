const test=require('node:test'),assert=require('node:assert/strict'),RouteEncounter=require('../src/encounter-rules.js');
test('IRBI gives the first post-battle step rate 1, subsequent steps the direct zone rate 8',()=>{
 for(const [draw,caught]of [[1311,true],[1312,false]])assert.equal(new RouteEncounter(8).advance(1,true,()=>draw),caught);
 for(const [draw,caught]of [[5903,true],[5904,false]]){const state=new RouteEncounter(8);assert.equal(state.advance(1,false,()=>{throw Error('No roll outside grass')}),false);assert.equal(state.advance(1,true,n=>{assert.equal(n,65535);return draw}),caught)}
});
test('actual distance is independent of frame rate, speed, diagonal input and wall collisions',()=>{
 for(const frames of [1,5,30,60,144]){const state=new RouteEncounter(8);let calls=0;for(let i=0;i<frames;i++)state.advance(10/frames,true,()=>{calls++;return 65534});assert.equal(state.steps,10);assert.equal(calls,10);assert.ok(state.distance<1e-8)}
 const state=new RouteEncounter(8);let calls=0;state.advance(.6,true,()=>{calls++;return 65534});for(let i=0;i<100;i++)state.advance(0,true,()=>{calls++;return 65534});assert.equal(calls,0);state.advance(.4,true,()=>{calls++;return 65534});assert.equal(calls,1);
});
test('leaving grass preserves the original counter, a new battle resets it, and time alone never counts',()=>{
 const state=new RouteEncounter(8);state.advance(8,false,()=>{throw Error('No encounter outside grass')});assert.equal(state.steps,8);assert.equal(state.advance(1,true,()=>2000),true);assert.equal(state.steps,0);assert.equal(state.distance,0);assert.equal(state.advance(1,true,()=>2000),false);assert.equal(state.steps,1);state.reset();assert.equal(state.steps,0);
});
