const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),run=require('../scripts/stage-runner.cjs');
async function fixture(action){const base=fs.realpathSync(os.tmpdir()),dir=fs.mkdtempSync(path.join(base,'soffiolieve-stage-'));try{return await action(dir);}finally{const resolved=fs.realpathSync(dir);assert.ok(resolved.startsWith(base+path.sep+'soffiolieve-stage-'));fs.rmSync(resolved,{recursive:true,force:true});}}
test('live stage evidence appears before completion and a nonzero exit retains both output streams',async()=>fixture(async out=>{
 const pending=run('live',process.execPath,['-e','process.stdout.write("started\\n");setTimeout(()=>{process.stderr.write("finished\\n");process.exitCode=7},1000)'],{out,timeout:5000});
 let early='';for(let i=0;i<50;i++){await new Promise(done=>setTimeout(done,20));try{early=fs.readFileSync(path.join(out,'live.log'),'utf8');}catch{}if(early.includes('started'))break;}
 assert.match(early,/started/);assert.doesNotMatch(early,/finished/);const result=await pending;assert.equal(result.result,'FAIL');assert.equal(result.exitCode,7);assert.match(fs.readFileSync(path.join(out,result.log),'utf8'),/started[\s\S]*finished/);
}));
test('a stalled native process fails at the original explicit budget including startup',async()=>fixture(async out=>{
 const r=await run('timeout',process.execPath,['-e','console.log("before stall");setInterval(()=>{},1000)'],{out,timeout:500});assert.equal(r.result,'FAIL');assert.match(r.error,/exceeded 500ms/);assert.match(fs.readFileSync(path.join(out,r.log),'utf8'),/exceeded 500ms/);
}));
test('output already emitted by a stalled child is retained before timeout and flushed after close',async()=>fixture(async out=>{
 // Inject only the OS process port: startup latency cannot determine whether this
 // test has emitted evidence. The real-child test above still budgets startup.
 const {EventEmitter}=require('node:events'),{PassThrough}=require('node:stream'),vm=require('node:vm'),child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();let killed=0,closed=false,spawned=0;
 child.kill=()=>{killed++;queueMicrotask(()=>{child.stdout.end();child.stderr.end();closed=true;child.emit('close',null);});return true;};
 const module={exports:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../scripts/stage-runner.cjs'),'utf8'),{module,process,Date,setTimeout,clearTimeout,require:id=>id==='node:child_process'?{spawn(){spawned++;queueMicrotask(()=>child.stdout.write('before stall\n'));return child;}}:require(id)});
 const r=await module.exports('emitted-timeout','fixture-child',[],{out,timeout:500});assert.equal(spawned,1);assert.equal(killed,1);assert.equal(closed,true);assert.equal(r.result,'FAIL');assert.match(r.error,/exceeded 500ms/);assert.match(fs.readFileSync(path.join(out,r.log),'utf8'),/before stall[\s\S]*exceeded 500ms/);
}));
test('spawn failure and excess output cannot become a passing stage; successful stages flush all evidence',async()=>fixture(async out=>{
 const missing=await run('missing',path.join(out,'absent.exe'),[],{out,timeout:1000});assert.equal(missing.result,'FAIL');assert.match(missing.error,/process failed/);
 const unwritable=await run('log-error',process.execPath,['-e','setInterval(()=>{},1000)'],{out:path.join(out,'absent-directory'),timeout:1000});assert.equal(unwritable.result,'FAIL');assert.match(unwritable.error,/log failed/);
 const loud=await run('large',process.execPath,['-e','process.stdout.write("x".repeat(4096))'],{out,maxBytes:128,timeout:5000});assert.equal(loud.result,'FAIL');assert.match(loud.error,/exceeded 128 bytes/);assert.ok(fs.statSync(path.join(out,loud.log)).size<256);
 const ok=await run('success',process.execPath,['-e','console.log("complete")'],{out,timeout:5000});assert.equal(ok.result,'PASS');assert.equal(ok.exitCode,0);assert.match(fs.readFileSync(path.join(out,ok.log),'utf8'),/complete/);
}));

test('targeted native541 command selects the exact original paired stage and rejects incomplete or ambiguous inventories',()=>{
 const focused=require('../scripts/test-native-tail541-unit064.cjs'),registry=require('../scripts/unit-test-groups.cjs'),files=fs.readdirSync(__dirname).filter(name=>name.endsWith('.test.cjs')).map(name=>path.join(__dirname,name));
 const original=registry(files).filter(stage=>stage[0]==='unit-native-tail541');assert.equal(original.length,1);assert.deepEqual(focused.selectStage(files),original[0]);
 for(const missing of ['native-tail541-protocol064.test.cjs','native-tail541-audio064.test.cjs'])assert.throws(()=>focused.selectStage(files.filter(file=>path.basename(file)!==missing)),/Incomplete native-tail541/);
 assert.throws(()=>focused.selectStage([...files,path.join(__dirname,'other/native-tail541-protocol064.test.cjs')]),/Ambiguous native-tail541/);
});
test('targeted native541 result preserves a real nonzero child and rejects missing metrics, RSS overflow or incomplete paired TAP',async()=>fixture(async out=>{
 const focused=require('../scripts/test-native-tail541-unit064.cjs'),metrics={pid:1,exitCode:0,maxRSSKiB:333176,observedRSSLimitKiB:409600,observedRSSWithinLimit:true,heapLimitMiB:400},log='# tests 16\n# pass 16\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n',pass={result:'PASS',exitCode:0};
 assert.equal(focused.verifyResult(pass,metrics,log).tests,16);
 const failed=await run('paired-nonzero',process.execPath,['-e','console.error("original nonzero evidence");process.exitCode=7'],{out,timeout:5000,maxBytes:8*1024*1024});assert.equal(failed.exitCode,7);assert.match(fs.readFileSync(path.join(out,failed.log),'utf8'),/original nonzero evidence/);assert.throws(()=>focused.verifyResult(failed,metrics,log),/stage failed/);
 assert.throws(()=>focused.verifyResult(pass,null,log),/metrics missing/);assert.throws(()=>focused.verifyResult(pass,{...metrics,maxRSSKiB:417668,observedRSSWithinLimit:false},log));
 for(const changed of [{...metrics,observedRSSLimitKiB:500000},{...metrics,heapLimitMiB:512},{...metrics,observedRSSWithinLimit:false}])assert.throws(()=>focused.verifyResult(pass,changed,log));
 for(const changed of [log.replace('# pass 16','# pass 15'),log.replace('# skipped 0','# skipped 1'),log.replace('# tests 16\n',''),log+'# tests 16\n'])assert.throws(()=>focused.verifyResult(pass,metrics,changed));
}));
test('Linux native541 feedback is an additional independent fresh-build job while full94 and Windows stay required',()=>{
 const text=fs.readFileSync(path.join(__dirname,'../.github/workflows/qa.yml'),'utf8').replace(/\r\n/g,'\n'),marker='\n  native541-linux:\n',at=text.indexOf(marker);assert(at>0,'Additional Linux paired job required');assert.equal(text.indexOf(marker,at+1),-1);
 const earlier=text.slice(0,at),job=text.slice(at);assert.match(earlier,/node scripts\/test-deep\.cjs _site test-results\/deep --python=python3/);assert.match(earlier,/\n  native541-windows:\n/);assert.match(earlier,/--mode=nominal --viewport=desktop --rate=1/);assert.match(earlier,/--mode=recovery --viewport=desktop --rate=1/);
 assert.match(job,/runs-on: ubuntu-latest/);assert.match(job,/node-version: '22'/);assert.match(job,/@napi-rs\/canvas@0\.1\.100/);assert.doesNotMatch(job,/needs:|continue-on-error:|--test-name-pattern|--test-skip-pattern/);
 const build=job.indexOf('python3 scripts/build-site.py site.zip _site --native572-tail-partition064'),check=job.indexOf('node scripts/test-native-tail541-unit064.cjs _site test-results/native541-linux');assert(build>=0&&check>build,'Run the original stage only after a fresh standard build');assert.match(job,/if: always\(\)[\s\S]*name: native541-linux-pair-report[\s\S]*path: test-results\/native541-linux/);
});

test('Windows owned-helper gate runs all29 direct callbacks and rejects skips, partial TAP or a failed child',()=>{
 const focused=require('../scripts/test-owned-helper-windows064.cjs'),args=['--max-old-space-size=400','--test','--experimental-test-isolation=none','--test-concurrency=1',path.join(__dirname,'bounded-qa064.test.cjs')];
 assert.deepEqual(focused.stageArgs('22.23.5'),args);assert.throws(()=>focused.stageArgs('22.7.0'),{code:'UNSUPPORTED_NODE_TEST_ISOLATION'});
 const log='# tests 29\n# pass 29\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n',pass={result:'PASS',exitCode:0};assert.equal(focused.verifyResult(pass,log).tests,29);
 assert.throws(()=>focused.verifyResult({result:'FAIL',exitCode:7},log),/stage failed/);
 for(const altered of [log.replace('# pass 29','# pass 28'),log.replace('# skipped 0','# skipped 1'),log.replace('# tests 29\n',''),log+'# tests 29\n'])assert.throws(()=>focused.verifyResult(pass,altered));
 const workflow=fs.readFileSync(path.join(__dirname,'../.github/workflows/qa.yml'),'utf8').replace(/\r\n/g,'\n'),windows=workflow.split('\n  native541-windows:\n')[1].split('\n  native541-linux:\n')[0];
 assert.equal((windows.match(/run: node --max-old-space-size=400 scripts\/test-owned-helper-windows064\.cjs _site test-results\/owned-helper-windows/g)||[]).length,1);assert.doesNotMatch(windows,/--test-name-pattern|--test-skip-pattern|continue-on-error:/);assert.match(windows,/if: always\(\)[\s\S]*name: owned-helper-windows-report[\s\S]*path: test-results\/owned-helper-windows/);
});
