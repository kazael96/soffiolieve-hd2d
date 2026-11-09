const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),stages=require('../scripts/unit-test-groups.cjs');
test('sequential unit groups include every real regression exactly once, with independent bounded processes',()=>{
 const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.cjs')).map(f=>path.join(__dirname,f)),groups=stages(files,{exe:'node',windows:true});
 assert.equal(groups.length,4);assert.deepEqual(groups.flatMap(g=>g[2].filter(a=>a.endsWith('.test.cjs'))).sort(),files.sort());
 for(const [index,g]of groups.entries()){assert.equal(g[0],'unit-'+(index+1)+'-of-4');assert.equal(g[1],'node');assert.deepEqual(g[2].slice(0,2),['--test','--test-isolation=none']);assert.ok(g[2].length>2);}
 assert.ok(Math.max(...groups.map(g=>g[2].length))-Math.min(...groups.map(g=>g[2].length))<=1);
 assert.deepEqual(stages([...files].reverse(),{exe:'node',windows:true}),groups);
});
test('Linux retains Node concurrency and tiny inventories produce no empty group',()=>{
 const groups=stages(['z.test.cjs','a.test.cjs'],{windows:false});assert.equal(groups.length,2);for(const g of groups)assert.ok(g[2].includes('--test-concurrency=2'));assert.deepEqual(groups.map(g=>g[2].at(-1)),['a.test.cjs','z.test.cjs']);
});
test('missing, duplicate or malformed regression inventories fail instead of silently omitting tests',()=>{
 for(const files of [[],['a.test.cjs','a.test.cjs'],['a.js'],[null]])assert.throws(()=>stages(files),/inventory/);
 for(const groups of [0,1.5,9])assert.throws(()=>stages(['a.test.cjs'],{groups}),/group count/);
});
