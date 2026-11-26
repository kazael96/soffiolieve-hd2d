const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),stages=require('../scripts/unit-test-groups.cjs');
const currentNoIsolationFlag=require('../scripts/node-test-options.cjs').isolationFlag();
const isAmbient=file=>file.split(/[\\/]/).at(-1)==='ambient-readback064.test.cjs';
const tail541Names=['native-tail541-protocol064.test.cjs','native-tail541-audio064.test.cjs'],basename541=file=>file.split(/[\\/]/).at(-1);
function assertTail541(stage,files,flag){assert.equal(stage[0],'unit-native-tail541');assert.deepEqual(stage[2],['--expose-gc','--max-old-space-size=400','--require',path.join(__dirname,'helpers/native-tail541-metrics064.cjs'),'--test',flag,'--test-concurrency=1',...tail541Names.map(name=>files.find(file=>basename541(file)===name))]);assert.equal(stage[2].filter(arg=>arg.endsWith('.test.cjs')).length,2);assert(!stage[2].includes('--test-concurrency=2'));}
test('sequential unit groups include every real regression exactly once, with independent bounded processes',()=>{
 const files=fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.cjs')).map(f=>path.join(__dirname,f)),groups=stages(files,{exe:'node',windows:true});
 assert.equal(files.length,427);assert.equal(groups.length,53);assertTail541(groups.at(-1),files,currentNoIsolationFlag);const previousFiles=files.filter(file=>!tail541Names.includes(basename541(file)));assert.deepEqual(groups.slice(0,-1),stages(previousFiles,{exe:'node',windows:true}),'All previous52 Windows argv remain exact');assert.deepEqual(groups.flatMap(g=>g[2].filter(a=>a.endsWith('.test.cjs'))).sort(),files.slice().sort());
 const heavy=require('../scripts/liepard-lifecycle-stages064.cjs'),expectedDedicated=['ambient-readback064.test.cjs','battle-actor-framing064.test.cjs','emboar-contact064.test.cjs','league-journeys.test.cjs','native602-density064.test.cjs',...heavy.lifeNames,...heavy.recoveryNames].sort();
 assert.equal(expectedDedicated.length,44);assert.deepEqual(groups.slice(8,-1).map(g=>path.basename(g[2].at(-1))).sort(),expectedDedicated);
 for(const [index,g]of groups.entries()){
  assert.equal(g[1],'node');
  if(index<8){assert.equal(g[0],'unit-'+(index+1)+'-of-8');assert.deepEqual(g[2].slice(0,2),['--test',currentNoIsolationFlag]);}
  else if(g[0]==='unit-native-tail541')assertTail541(g,files,currentNoIsolationFlag);
  else{assert.equal(g[2].filter(a=>a.endsWith('.test.cjs')).length,1);assert(g[2].includes('--test'));assert(g[2].includes(currentNoIsolationFlag));if(!g[0].startsWith('unit-isolated-'))assert(g[2].includes('--max-old-space-size=400'));}
  if(isAmbient(g[2].at(-1)))assert.deepEqual(g[2],['--expose-gc','--max-old-space-size=400','--test',currentNoIsolationFlag,g[2].at(-1)]);
  assert(g[2].some(a=>a.endsWith('.test.cjs')));
 }
 const ordinary=groups.slice(0,8);assert.ok(Math.max(...ordinary.map(g=>g[2].length))-Math.min(...ordinary.map(g=>g[2].length))<=1);
 assert(ordinary.every(g=>g[2].every(a=>!expectedDedicated.includes(path.basename(a)))));
 assert.deepEqual(stages([...files].reverse(),{exe:'node',windows:true}),groups);
 const linux=stages(files,{exe:'node',windows:false});assert.equal(linux.length,53);assertTail541(linux.at(-1),files,currentNoIsolationFlag);assert.deepEqual(linux.slice(0,-1),stages(previousFiles,{exe:'node',windows:false}),'All previous52 Linux argv remain exact');assert.deepEqual(linux.flatMap(g=>g[2].filter(a=>a.endsWith('.test.cjs'))).sort(),files.slice().sort());
 for(const g of linux){if(g[0]==='unit-native-tail541')assertTail541(g,files,currentNoIsolationFlag);else if(g[0].startsWith('unit-liepard-')||g[0].startsWith('unit-other-dedicated-')){assert(g[2].includes(currentNoIsolationFlag));assert(!g[2].includes('--test-concurrency=2'));assert(g[2].includes('--max-old-space-size=400'));}else if(isAmbient(g[2].at(-1)))assert.deepEqual(g[2],['--expose-gc','--max-old-space-size=400','--test',currentNoIsolationFlag,g[2].at(-1)]);else assert(g[2].includes('--test-concurrency=2'));}
 assert.deepEqual(stages([...files].reverse(),{exe:'node',windows:false}),linux);
 for(const nodeVersion of ['22.23.5','24.22.3'])for(const windows of [true,false]){const selected=stages(files,{exe:'node',windows,nodeVersion}),ambient=selected.filter(g=>g[2].at(-1).endsWith('ambient-readback064.test.cjs'));assert.equal(ambient.length,1);const file=ambient[0][2].at(-1),flag=require('../scripts/node-test-options.cjs').isolationFlag(nodeVersion);assert.deepEqual(ambient[0][2],['--expose-gc','--max-old-space-size=400','--test',flag,file]);assert.equal(selected.length,53);assertTail541(selected.at(-1),files,flag);assert.deepEqual(selected.slice(0,-1),stages(previousFiles,{exe:'node',windows,nodeVersion}),'All previous52 argv remain exact for the selected Node/platform');assert.equal(selected.flatMap(g=>g[2].filter(a=>a.endsWith('.test.cjs'))).filter(f=>f===file).length,1);}
});
test('three memory fixtures and physical journeys each retain one process in tiny Windows inventories',()=>{
 const files=['x\\ambient-readback064.test.cjs','x\\league-journeys.test.cjs','x\\emboar-contact064.test.cjs','x\\battle-actor-framing064.test.cjs'];const groups=stages(files,{windows:true});assert.equal(groups.length,4);for(const group of groups){assert.match(group[0],/^unit-isolated-/);assert.equal(group[2].filter(x=>x.endsWith('.test.cjs')).length,1);if(isAmbient(group[2].at(-1)))assert.deepEqual(group[2],['--expose-gc','--max-old-space-size=400','--test',currentNoIsolationFlag,group[2].at(-1)]);else assert.deepEqual(group[2].slice(0,2),['--test',currentNoIsolationFlag]);}assert.deepEqual(groups.flatMap(g=>g[2].filter(a=>a.endsWith('.test.cjs'))).sort(),files.sort());assert.deepEqual(stages([...files].reverse(),{windows:true}),groups);
});
test('Linux retains Node concurrency and tiny inventories produce no empty group',()=>{
 const groups=stages(['z.test.cjs','a.test.cjs'],{windows:false});assert.equal(groups.length,2);for(const g of groups)assert.ok(g[2].includes('--test-concurrency=2'));assert.deepEqual(groups.map(g=>g[2].at(-1)),['a.test.cjs','z.test.cjs']);
 const isolated=stages(['x/ambient-readback064.test.cjs','x/league-journeys.test.cjs','x/emboar-contact064.test.cjs','x/battle-actor-framing064.test.cjs'],{windows:false});assert.equal(isolated.length,4);for(const g of isolated){if(isAmbient(g[2].at(-1)))assert.deepEqual(g[2],['--expose-gc','--max-old-space-size=400','--test',currentNoIsolationFlag,g[2].at(-1)]);else assert.deepEqual(g[2].slice(0,2),['--test','--test-concurrency=2']);assert.equal(g[2].filter(a=>a.endsWith('.test.cjs')).length,1);}
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

test('native541 pair has one directly owned GC stage in minimal Node22/24 Windows/Linux inventories',()=>{
 const pair=['tiny\\native-tail541-protocol064.test.cjs','tiny\\native-tail541-audio064.test.cjs'];
 for(const nodeVersion of ['22.23.5','24.22.3'])for(const windows of [true,false]){
  const options={exe:'node',windows,nodeVersion},flag=require('../scripts/node-test-options.cjs').isolationFlag(nodeVersion),only=stages(pair,options);assert.equal(only.length,1);assertTail541(only[0],pair,flag);assert.deepEqual(stages(pair.slice().reverse(),options),only);
  const previous=['tiny/a.test.cjs','tiny/ambient-readback064.test.cjs','tiny/battle-actor-framing064.test.cjs','tiny/emboar-contact064.test.cjs','tiny/league-journeys.test.cjs','tiny/native602-density064.test.cjs'],all=[...previous,...pair],baseline=stages(previous,options),extended=stages(all,options);assert.equal(extended.length,baseline.length+1);assert.deepEqual(extended.slice(0,-1),baseline);assertTail541(extended.at(-1),all,flag);assert.deepEqual(extended.flatMap(stage=>stage[2].filter(arg=>arg.endsWith('.test.cjs'))).sort(),all.slice().sort());assert.deepEqual(stages(all.slice().reverse(),options),extended);
 }
});
test('native541 incomplete or ambiguous pair is rejected before ordinary grouping',()=>{
 const files=fs.readdirSync(__dirname).filter(file=>file.endsWith('.test.cjs')).map(file=>path.join(__dirname,file));
 for(const nodeVersion of ['22.23.5','24.22.3'])for(const windows of [true,false]){
  const options={windows,nodeVersion};for(const missing of tail541Names)assert.throws(()=>stages(files.filter(file=>basename541(file)!==missing),options),/Incomplete native-tail541/);
  for(const one of tail541Names)assert.throws(()=>stages([one],options),/Incomplete native-tail541/);
  assert.throws(()=>stages([...tail541Names,'other/native-tail541-protocol064.test.cjs'],options),/Ambiguous native-tail541/);
 }
});
test('real427-file scheduler and unchanged deep registry produce53 unit and94 CLI stages',()=>{
 const files=fs.readdirSync(__dirname).filter(file=>file.endsWith('.test.cjs')).map(file=>path.join(__dirname,file)),deep=fs.readFileSync(path.join(__dirname,'../scripts/test-deep.cjs'),'utf8'),match=deep.match(/\.\.\.(\['built-site',[^\]]+\])\.map/);assert(match,'Exact runtime stage registry must remain explicit');const runtime=JSON.parse(match[1].replace(/'/g,'"'));assert.equal(runtime.length,40);assert.equal(new Set(runtime).size,40);for(const name of runtime)assert(fs.existsSync(path.join(__dirname,'check-'+name+'.cjs')),'Existing runtime file '+name);assert(deep.includes("['builder',python,['-m','unittest','discover','-s','tests','-p','test_*.py']]"));
 for(const nodeVersion of ['22.23.5','24.22.3'])for(const windows of [true,false]){const selected=stages(files,{windows,nodeVersion});assert.equal(files.length,427);assert.equal(selected.length,53);assert.equal(selected.length+1+runtime.length,94);}
});
