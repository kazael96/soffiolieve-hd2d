const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../src/capture-rules.js'),vectors=require('./fixtures/capture-irbi.json');
test('capture rate and Nitro divider/square-root rounding match IRBI reference vectors',()=>{
 for(const v of vectors){assert.equal(C.rate(v,v.catchRate),v.rate);assert.equal(C.threshold(v.rate),v.threshold)}
 // Healthy Patrat/Lillipup at full HP: three quarter-root checks, not 3/16.
 assert.equal(C.threshold(C.rate({hp:14,maxhp:14},255)),49802);
});
test('capture consumes only the required RNG calls and reports the native shake parameter',()=>{
 for(let failure=0;failure<3;failure++){let calls=0;const r=C.roll({hp:14,maxhp:14},255,n=>{assert.equal(n,65536);return calls++===failure?49802:49801});assert.equal(r.caught,false);assert.equal(r.shakes,failure);assert.equal(calls,failure+1);assert.equal(r.critical,false)}
 let calls=0;const r=C.roll({hp:14,maxhp:14},255,n=>{calls++;return 49801});assert.equal(r.caught,true);assert.equal(r.shakes,3);assert.equal(calls,3);
 const guaranteed=C.roll({hp:1,maxhp:14,status:'slp'},255,()=>{throw Error('Guaranteed opening capture must not consume RNG')});assert.equal(guaranteed.caught,true);assert.equal(guaranteed.shakes,3);
});
test('critical captures are impossible for the opening Pokédex and use one check above 30 caught species',()=>{
 for(const count of [0,1,5,30]){const requests=[];const r=C.roll({hp:14,maxhp:14},255,n=>{requests.push(n);return 0},count);assert.equal(r.critical,false);assert.deepEqual(requests,[65536,65536,65536])}
 const requests=[];const r=C.roll({hp:14,maxhp:14},255,n=>{requests.push(n);return 0},31);assert.equal(r.critical,true);assert.equal(r.shakes,1);assert.deepEqual(requests,[256,65536]);
});
