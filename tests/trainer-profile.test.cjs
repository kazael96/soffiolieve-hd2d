const test=require('node:test'),assert=require('node:assert/strict'),{create,normalize}=require('../src/trainer-profile.js');
test('trainer identity is generated once, survives normalization and rejects corrupt IDs',()=>{
 const p=create(Date.UTC(2026,9,26),()=>.5);assert.equal(p.id,32768);assert.deepEqual(normalize({...p,playSeconds:91.5}),{...p,playSeconds:91.5});
 assert.equal(normalize({...p,id:-1}),null);assert.equal(normalize({...p,startedAt:'invalid'}),null);
 assert.equal(normalize({...p,playSeconds:Infinity}).playSeconds,3599999);
});
