const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),stages=require('../scripts/unit-test-groups.cjs');
test('sequential unit groups include every real regression exactly once, with independent bounded processes',()=>{
 const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.cjs')).map(f=>path.join(__dirname,f)),groups=stages(files,{exe:'node',windows:true});
 assert.equal(groups.length,11);assert.deepEqual(groups.flatMap(g=>g[2].filter(a=>a.endsWith('.test.cjs'))).sort(),files.sort());
 for(const [index,g]of groups.entries()){if(index<8)assert.equal(g[0],'unit-'+(index+1)+'-of-8');else{assert.match(g[0],/^unit-isolated-/);assert.equal(g[2].filter(a=>a.endsWith('.test.cjs')).length,1);}assert.equal(g[1],'node');assert.deepEqual(g[2].slice(0,2),['--test','--test-isolation=none']);assert.ok(g[2].length>2);}
 const ordinary=groups.slice(0,8);assert.ok(Math.max(...ordinary.map(g=>g[2].length))-Math.min(...ordinary.map(g=>g[2].length))<=1);
 assert.deepEqual(groups.slice(8).map(g=>path.basename(g[2].at(-1))),['battle-actor-framing064.test.cjs','emboar-contact064.test.cjs','league-journeys.test.cjs']);
 assert.ok(ordinary.every(g=>g[2].every(a=>!a.endsWith('league-journeys.test.cjs'))));
 assert.deepEqual(stages([...files].reverse(),{exe:'node',windows:true}),groups);
});
test('two memory fixtures and physical journeys each retain one process in tiny Windows inventories',()=>{
 const files=['x\\league-journeys.test.cjs','x\\emboar-contact064.test.cjs','x\\battle-actor-framing064.test.cjs'];const groups=stages(files,{windows:true});assert.equal(groups.length,3);for(const group of groups){assert.match(group[0],/^unit-isolated-/);assert.equal(group[2].filter(x=>x.endsWith('.test.cjs')).length,1);assert.deepEqual(group[2].slice(0,2),['--test','--test-isolation=none']);}assert.deepEqual(groups.flatMap(g=>g[2].slice(2)).sort(),files.sort());assert.deepEqual(stages([...files].reverse(),{windows:true}),groups);
});
test('Linux retains Node concurrency and tiny inventories produce no empty group',()=>{
 const groups=stages(['z.test.cjs','a.test.cjs'],{windows:false});assert.equal(groups.length,2);for(const g of groups)assert.ok(g[2].includes('--test-concurrency=2'));assert.deepEqual(groups.map(g=>g[2].at(-1)),['a.test.cjs','z.test.cjs']);
 const isolated=stages(['x/league-journeys.test.cjs','x/emboar-contact064.test.cjs','x/battle-actor-framing064.test.cjs'],{windows:false});assert.equal(isolated.length,3);for(const g of isolated){assert.deepEqual(g[2].slice(0,2),['--test','--test-concurrency=2']);assert.equal(g[2].filter(a=>a.endsWith('.test.cjs')).length,1);}
});
test('missing, duplicate or malformed regression inventories fail instead of silently omitting tests',()=>{
 for(const files of [[],['a.test.cjs','a.test.cjs'],['a.js'],[null]])assert.throws(()=>stages(files),/inventory/);
 for(const groups of [0,1.5,9])assert.throws(()=>stages(['a.test.cjs'],{groups}),/group count/);
});
