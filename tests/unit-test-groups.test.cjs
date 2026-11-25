const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),stages=require('../scripts/unit-test-groups.cjs');
test('sequential unit groups include every real regression exactly once, with independent bounded processes',()=>{
 const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.cjs')).map(f=>path.join(__dirname,f)),groups=stages(files,{exe:'node',windows:true});
 assert.equal(groups.length,51);assert.deepEqual(groups.flatMap(g=>g[2].filter(a=>a.endsWith('.test.cjs'))).sort(),files.slice().sort());
 const heavy=require('../scripts/liepard-lifecycle-stages064.cjs'),expectedDedicated=['battle-actor-framing064.test.cjs','emboar-contact064.test.cjs','league-journeys.test.cjs','native602-density064.test.cjs',...heavy.lifeNames,...heavy.recoveryNames].sort();
 assert.equal(expectedDedicated.length,43);assert.deepEqual(groups.slice(8).map(g=>path.basename(g[2].at(-1))).sort(),expectedDedicated);
 for(const [index,g]of groups.entries()){
  assert.equal(g[1],'node');
  if(index<8){assert.equal(g[0],'unit-'+(index+1)+'-of-8');assert.deepEqual(g[2].slice(0,2),['--test','--test-isolation=none']);}
  else{assert.equal(g[2].filter(a=>a.endsWith('.test.cjs')).length,1);assert(g[2].includes('--test'));assert(g[2].includes('--test-isolation=none'));if(!g[0].startsWith('unit-isolated-'))assert(g[2].includes('--max-old-space-size=400'));}
  assert(g[2].some(a=>a.endsWith('.test.cjs')));
 }
 const ordinary=groups.slice(0,8);assert.ok(Math.max(...ordinary.map(g=>g[2].length))-Math.min(...ordinary.map(g=>g[2].length))<=1);
 assert(ordinary.every(g=>g[2].every(a=>!expectedDedicated.includes(path.basename(a)))));
 assert.deepEqual(stages([...files].reverse(),{exe:'node',windows:true}),groups);
 const linux=stages(files,{exe:'node',windows:false});assert.equal(linux.length,51);assert.deepEqual(linux.flatMap(g=>g[2].filter(a=>a.endsWith('.test.cjs'))).sort(),files.slice().sort());
 for(const g of linux){if(g[0].startsWith('unit-liepard-')||g[0].startsWith('unit-other-dedicated-')){assert(g[2].includes('--test-isolation=none'));assert(!g[2].includes('--test-concurrency=2'));assert(g[2].includes('--max-old-space-size=400'));}else assert(g[2].includes('--test-concurrency=2'));}
 assert.deepEqual(stages([...files].reverse(),{exe:'node',windows:false}),linux);
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

test('lifecycle scheduling rejects partial catalogs and basename collisions instead of hiding heavy tests in ordinary groups',()=>{
 const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.cjs')).map(f=>path.join(__dirname,f)),heavy=require('../scripts/liepard-lifecycle-stages064.cjs');
 for(const missing of [heavy.lifeNames[0],heavy.recoveryNames.at(-1),heavy.legacyName,'native602-density064.test.cjs'])assert.throws(()=>stages(files.filter(f=>path.basename(f)!==missing)),/Incomplete|Missing explicit/);
 assert.throws(()=>stages([...files,path.join(__dirname,'other',heavy.lifeNames[0])]),/Ambiguous test basename/);
 const standalone=stages(['a.test.cjs','native602-density064.test.cjs'],{windows:true});assert.equal(standalone.length,2);assert.equal(standalone[1][2].at(-1),'native602-density064.test.cjs');assert.equal(standalone[1][2].filter(f=>f.endsWith('.test.cjs')).length,1);
});
