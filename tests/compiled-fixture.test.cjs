const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),{create}=require('./helpers/compiled-fixture.cjs');
test('reusing compilation still executes fresh state in each isolated fixture and preserves thrown errors',()=>{
 const cache=create(),a=vm.createContext({}),b=vm.createContext({}),source='globalThis.state={items:[]};state';
 const first=cache.run(source,a);first.items.push(42);const second=cache.run(source,b);assert.equal(second.items.length,0);assert.notEqual(first,second);assert.equal(cache.stats().compilations,1);assert.equal(cache.stats().hits,1);
 assert.throws(()=>cache.run('throw Error("fixture failure")',a),/fixture failure/);assert.throws(()=>cache.run('throw Error("fixture failure")',b),/fixture failure/);
});
test('same filename with changed source never reuses stale compiled code, even for equal-length edits',()=>{
 const cache=create(),context=vm.createContext({});assert.equal(cache.run('1+1',context,{filename:'same.js'}),2);assert.equal(cache.run('2+2',context,{filename:'same.js'}),4);assert.equal(cache.run('1+1',context,{filename:'other.js'}),2);assert.equal(cache.stats().compilations,3);assert.equal(cache.stats().hits,0);
 assert.throws(()=>cache.run('}',context,{filename:'same.js'}),/Unexpected token/);assert.equal(cache.run('2+2',context,{filename:'same.js'}),4);
});
test('entry and source-byte budgets evict LRU code without skipping execution or caching failures',()=>{
 const cache=create({maxEntries:2,maxBytes:8}),c=vm.createContext({});for(const [file,source]of [['a','1+1'],['b','2+2'],['a','1+1'],['c','3+3']])cache.run(source,c,{filename:file});assert.equal(cache.stats().entries,2);assert.equal(cache.stats().sourceBytes,6);const compiled=cache.stats().compilations;assert.equal(cache.run('2+2',c,{filename:'b'}),4);assert.equal(cache.stats().compilations,compiled+1);
 assert.equal(cache.run('123456789',c),123456789);assert.ok(cache.stats().sourceBytes<=8);assert.ok(cache.stats().entries<=2);assert.throws(()=>create({maxEntries:0}),/budget/);
});
test('the actual field host reuses compilation without sharing party, native state, map actors or inventories',()=>{
 const path=require('node:path'),old=process.argv[2];process.argv[2]=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site');const {environment}=require('./check-story-runtime.cjs');process.argv[2]=old;
 const cache=require('./helpers/compiled-fixture.cjs'),options={mistralton:true,sourceRoot:path.resolve(__dirname,'../src')},a=environment(options),before=cache.stats();
 a.NativeStory.state.vars[16527]=99;a.NativeStory.state.flags.push(2421);a.NativeStory.state.extraItems={1:99};a.Journey.state.party.push({name:'fixture-only'});a.MISTRALTON_EVENTS.zones[97].actors[0].model=9999;
 const b=environment(options),after=cache.stats();assert.equal(after.compilations,before.compilations);assert.ok(after.hits-before.hits>70);assert.notEqual(b.NativeStory.state.vars[16527],99);assert.ok(!b.NativeStory.state.flags.includes(2421));assert.notEqual(b.NativeStory.state.extraItems?.[1],99);assert.ok(!b.Journey.state.party.some(p=>p.name==='fixture-only'));assert.notEqual(b.MISTRALTON_EVENTS.zones[97].actors[0].model,9999);
});
