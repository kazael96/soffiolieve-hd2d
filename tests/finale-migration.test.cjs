const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {migrate}=require('../src/finale-migration.js'),text=fs.readFileSync('src/finale-initial-state.js','utf8'),data=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));
test('legacy052 receives only the seven native hidden actor flags, once, without granting progress',()=>{
 const s={zone:136,vars:{16591:1},flags:[594,599],chapter052:true};assert.equal(migrate(s,data),true);
 assert.deepEqual([...s.flags].sort((a,b)=>a-b),[594,...data.initialActorFlags].sort((a,b)=>a-b));assert.deepEqual(s.vars,{16591:1});assert.equal(s.flags.includes(185),false);assert.equal(s.chapter053,true);
 s.flags=s.flags.filter(f=>f!==617);assert.equal(migrate(s,data),false);assert.equal(s.flags.includes(617),false);
});
test('resuming a real finale scene or Castle progress never rehides actors revealed by events',()=>{
 for(const seed of [{zone:278,flags:[],vars:{16566:5}},{zone:137,flags:[2409],vars:{}},{zone:146,flags:[185],vars:{}}]){const s=structuredClone(seed);assert.equal(migrate(s,data),true);assert.deepEqual(s.flags,seed.flags);assert.deepEqual(s.vars,seed.vars);}
});
