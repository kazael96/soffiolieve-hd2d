'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),H=require('../scripts/node-test-options.cjs'),stages=require('../scripts/unit-test-groups.cjs');
const experimental='--experimental-test-isolation=none',stable='--test-isolation=none';
test('Node22.8+ and early23 use the experimental name;23.6+ and24+ use the stable name',()=>{
 for(const version of ['22.8.0','22.23.5','v22.23.5','23.0.0','23.5.9'])assert.equal(H.isolationFlag(version),experimental,version);
 for(const version of ['23.6.0','23.7.0','24.0.0','24.22.3','26.3.0'])assert.equal(H.isolationFlag(version),stable,version);
});
test('Older, malformed and prerelease versions fail explicitly instead of guessing a flag',()=>{
 for(const version of ['20.19.0','21.7.3','22.7.9','22.8','22.x.0','23.6.0-pre','v24.0.0-nightly','024.0.0','',null,{},'9007199254740992.0.0'])assert.throws(()=>H.isolationFlag(version),{code:'UNSUPPORTED_NODE_TEST_ISOLATION'});
});
test('Direct process guard requires test plus exactly the version-correct isolation flag',()=>{
 for(const[version,correct,wrong]of [['22.23.5',experimental,stable],['24.22.3',stable,experimental]]){
  assert.equal(H.assertDirectTestInvocation(['--max-old-space-size=400','--test',correct],version),correct);
  for(const argv of [[correct],['--test'],['--test',wrong],['--test',correct,wrong],['--test',correct,correct],['--test','--test',correct],['--test',correct.replace('=none','=process')],['--test',correct.split('=')[0],'none']])assert.throws(()=>H.assertDirectTestInvocation(argv,version));
 }
});
function completeInventory(){const life=require('./fixtures/liepard-protocol064/catalog.json'),recovery=require('./fixtures/liepard-recovery064/catalog.json');return['a.test.cjs','z.test.cjs','battle-actor-framing064.test.cjs','emboar-contact064.test.cjs','league-journeys.test.cjs','native602-density064.test.cjs',path.basename(life.legacyWrapper),...life.lifecycle.map(c=>path.basename(c.wrapper)),...recovery.recovery.map(c=>path.basename(c.wrapper)),...recovery.g7fixed.map(c=>path.basename(c.wrapper))];}
test('Scheduler uses exact Node22/24 flags without changing direct39+602 processes or Linux ordinary concurrency',()=>{
 const files=completeInventory();for(const[version,expected]of [['22.23.5',experimental],['24.22.3',stable]])for(const windows of [true,false]){
  const groups=stages(files,{exe:'selected-node',windows,nodeVersion:version});assert.equal(groups.length,46);assert.deepEqual(groups.flatMap(g=>g[2].filter(arg=>arg.endsWith('.test.cjs'))).sort(),files.slice().sort());
  const direct=groups.filter(g=>g[0].startsWith('unit-liepard-')||g[0].startsWith('unit-other-dedicated-'));assert.equal(direct.length,40);for(const g of direct){assert.equal(g[1],'selected-node');assert.deepEqual(g[2].slice(0,3),['--max-old-space-size=400','--test',expected]);assert.equal(g[2].filter(a=>a.endsWith('.test.cjs')).length,1);H.assertDirectTestInvocation(g[2].filter(a=>!a.endsWith('.test.cjs')),version);}
  for(const g of groups.filter(g=>!direct.includes(g))){assert.equal(g[2][0],'--test');if(windows)assert.equal(g[2][1],expected);else assert.equal(g[2][1],'--test-concurrency=2');}
 }
});
test('Scheduler rejects unsupported Node versions on both platforms before returning stages',()=>{
 for(const windows of [true,false]){assert.throws(()=>stages(['a.test.cjs'],{windows,nodeVersion:'22.7.9'}),{code:'UNSUPPORTED_NODE_TEST_ISOLATION'});assert.throws(()=>stages(completeInventory(),{windows,nodeVersion:'22.7.9'}),{code:'UNSUPPORTED_NODE_TEST_ISOLATION'});}
});
function guardFixture(relative,version,argv,group){
 // Real register-one source, protocol require stubs only to isolate its entry
 // guard. Functional lifecycle/recovery callbacks are never loaded or run here.
 const source=fs.readFileSync(path.join(__dirname,relative),'utf8'),life=require('./fixtures/liepard-protocol064/catalog.json'),recovery=require('./fixtures/liepard-recovery064/catalog.json'),catalog=group?recovery:life,collector={entries:[]},registered=[],state={bodyLoads:0,ledgerCalls:0},fakeProcess={versions:{node:version},execArgv:argv,env:{},once(){}};
 const req=name=>{if(name==='node:test')return(name,fn)=>registered.push({name,fn});if(name==='node:assert/strict')return assert;if(name==='node:fs')return fs;if(name==='node:path')return path;if(name.includes('node-test-options.cjs'))return H;if(name.includes('strict-loader.cjs'))return{ensureLedger(){state.ledgerCalls++;fakeProcess.env.C11_PROTOCOL_LEDGER='explicit-guard-protocol.json';}};if(name.includes('registration-collector.cjs'))return collector;if(name.endsWith('catalog.json'))return catalog;if(/(?:real-stage-lifecycle|resource-recovery|g7-fixed)\.cases\.cjs$/.test(name)){state.bodyLoads++;const entries=group?catalog[group]:catalog.lifecycle;collector.entries=entries.map(e=>({name:e.name,fn:function untouchedCallbackProtocol(){}}));return;}throw Error('Unexpected guard dependency '+name);};
 const module={exports:{}};new vm.Script('(function(require,module,exports,process){\n'+source+'\n})',{filename:relative+':guard-protocol-wrapper'}).runInThisContext()(req,module,module.exports,fakeProcess);return{state,registered,collector,invoke(){const entry=group?catalog[group][0]:catalog.lifecycle[0];return group?module.exports.register(group,0,entry.id):module.exports.register(0,entry.id);}};
}
test('Both actual register-one guards reject wrong flags before callbacks and register exactly one unchanged callback for Node22/24',()=>{
 const cases=[['helpers/liepard-protocol064/register-one.cjs',null],['helpers/liepard-recovery064/register-one.cjs','recovery'],['helpers/liepard-recovery064/register-one.cjs','g7fixed']];
 for(const[relative,group]of cases)for(const[version,correct,wrong]of [['22.23.5',experimental,stable],['24.22.3',stable,experimental]]){
  for(const argv of [[correct],['--test',wrong],['--test',correct,wrong],['--test',correct,correct]]){const f=guardFixture(relative,version,argv,group);assert.throws(()=>f.invoke());assert.equal(f.state.bodyLoads,0);assert.equal(f.state.ledgerCalls,0);assert.equal(f.registered.length,0);}
  const f=guardFixture(relative,version,['--max-old-space-size=400','--test',correct],group);f.invoke();assert.equal(f.state.bodyLoads,1);assert.equal(f.state.ledgerCalls,1);assert.equal(f.registered.length,1);assert.equal(f.registered[0].fn,f.collector.entries[0].fn);
 }
});
