const test=require('node:test'),assert=require('node:assert/strict'),cleanup=require('../scripts/close-owned-browser.cjs');
test('normal isolated cleanup closes client and owned server without a forced termination',async()=>{
 const calls=[],result=await cleanup({async close(){calls.push('browser');}},{async close(){calls.push('server');},async kill(){throw Error('Must not kill a closed server');}},{timeoutMs:100});assert.equal(result.result,'PASS');assert.equal(result.forced,false);assert.deepEqual(calls,['browser','server']);
});
test('a stalled client and server cannot hang final report creation and only the supplied server is killed',async()=>{
 const calls=[],never=new Promise(()=>{}),result=await cleanup({close:()=>never},{close:()=>never,async kill(){calls.push('owned-server');}},{timeoutMs:20});assert.equal(result.result,'PASS');assert.equal(result.graceful,false);assert.equal(result.forced,true);assert.deepEqual(calls,['owned-server']);assert.equal(result.browser.result,'TIMEOUT');assert.equal(result.server.result,'TIMEOUT');
});
test('an unsuccessful owned kill remains a cleanup failure with the original errors',async()=>{
 const result=await cleanup({async close(){throw Error('Client transport rejected');}},{close:()=>new Promise(()=>{}),async kill(){throw Error('Owned server kill rejected');}},{timeoutMs:20});assert.equal(result.result,'FAIL');assert.equal(result.forced,true);assert.match(result.browser.error,/Client transport rejected/);assert.match(result.kill.error,/Owned server kill rejected/);
});
test('without an owned server, a stalled close is reported as failure and no process search is performed',async()=>{
 const result=await cleanup({close:()=>new Promise(()=>{})},null,{timeoutMs:20});assert.equal(result.result,'FAIL');assert.equal(result.forced,false);
});
