const {test}=require('node:test'),assert=require('node:assert/strict');
const A=require('./ambient-audit.js'),R=require('../src/pokemon-anim.js');
const f=(cell,d,x=0)=>[cell,d,0,4096,4096,x,0];
test('audit tracks preserve Nitro loops, reverse modes and non-looping tails',()=>{
 for(const mode of [1,2,3,4])for(const loop of [0,1]){const a={frames:[f(0,2),f(1,3),f(0,1,2)],mode,loop},t=A.track(a),states=new Map();for(let tick=0;tick<250;tick++){const row=R.frame(a,tick),key=[row[0],...row.slice(2)].join(',');if(states.has(t.state(tick)))assert.equal(states.get(t.state(tick)),key);else states.set(t.state(tick),key);}for(let tick=t.start;tick<250-t.period;tick++)assert.equal(t.state(tick),t.state(tick+t.period));}
});
test('exhaustive ambient audit preserves multiplicities while yielding and deduplicating bit-identical poses',async()=>{
 const data={parent:[{frames:[f(0,7)],mode:2}],maps:[[[0,0,0],[1,0,0]]],animations:[{frames:[f(0,5),f(0,6)],mode:2},{frames:[f(0,13)],mode:2}]};
 let renders=0,yields=0;const result=await A.scan(data,R.frame,()=>{renders++;return {clipped:true};},{batch:10,yieldControl:async()=>{yields++;}});
 assert.equal(result.period,1001);assert.equal(result.poses,1001);assert.equal(result.uniquePoses,1);assert.equal(renders,1);assert.equal(result.clipped,1001);assert.ok(yields>=100);
});
