const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),run=require('../scripts/stage-runner.cjs');
async function fixture(action){const base=fs.realpathSync(os.tmpdir()),dir=fs.mkdtempSync(path.join(base,'soffiolieve-stage-'));try{return await action(dir);}finally{const resolved=fs.realpathSync(dir);assert.ok(resolved.startsWith(base+path.sep+'soffiolieve-stage-'));fs.rmSync(resolved,{recursive:true,force:true});}}
test('live stage evidence appears before completion and a nonzero exit retains both output streams',async()=>fixture(async out=>{
 const pending=run('live',process.execPath,['-e','process.stdout.write("started\\n");setTimeout(()=>{process.stderr.write("finished\\n");process.exitCode=7},1000)'],{out,timeout:5000});
 let early='';for(let i=0;i<50;i++){await new Promise(done=>setTimeout(done,20));try{early=fs.readFileSync(path.join(out,'live.log'),'utf8');}catch{}if(early.includes('started'))break;}
 assert.match(early,/started/);assert.doesNotMatch(early,/finished/);const result=await pending;assert.equal(result.result,'FAIL');assert.equal(result.exitCode,7);assert.match(fs.readFileSync(path.join(out,result.log),'utf8'),/started[\s\S]*finished/);
}));
test('stalled processes keep partial evidence and fail at the original explicit budget',async()=>fixture(async out=>{
 const r=await run('timeout',process.execPath,['-e','console.log("before stall");setInterval(()=>{},1000)'],{out,timeout:500});assert.equal(r.result,'FAIL');assert.match(r.error,/exceeded 500ms/);assert.match(fs.readFileSync(path.join(out,r.log),'utf8'),/before stall[\s\S]*exceeded 500ms/);
}));
test('spawn failure and excess output cannot become a passing stage; successful stages flush all evidence',async()=>fixture(async out=>{
 const missing=await run('missing',path.join(out,'absent.exe'),[],{out,timeout:1000});assert.equal(missing.result,'FAIL');assert.match(missing.error,/process failed/);
 const unwritable=await run('log-error',process.execPath,['-e','setInterval(()=>{},1000)'],{out:path.join(out,'absent-directory'),timeout:1000});assert.equal(unwritable.result,'FAIL');assert.match(unwritable.error,/log failed/);
 const loud=await run('large',process.execPath,['-e','process.stdout.write("x".repeat(4096))'],{out,maxBytes:128,timeout:5000});assert.equal(loud.result,'FAIL');assert.match(loud.error,/exceeded 128 bytes/);assert.ok(fs.statSync(path.join(out,loud.log)).size<256);
 const ok=await run('success',process.execPath,['-e','console.log("complete")'],{out,timeout:5000});assert.equal(ok.result,'PASS');assert.equal(ok.exitCode,0);assert.match(fs.readFileSync(path.join(out,ok.log),'utf8'),/complete/);
}));
