const test=require('node:test'),assert=require('node:assert/strict'),{fixture}=require('./helpers/audio-engine-fixture.cjs');
test('hidden audio suspends the context and resumes the same native voice without replaying its start',async()=>{
 const f=fixture();await f.api.enable();const playing=f.api.playSound(1738);await f.drain();const ctx=f.contexts[0],voice=f.fieldStarts()[0];assert.ok(voice);f.hidden(true);await f.drain();assert.equal(ctx.state,'suspended');assert.equal(ctx.suspendCalls,1);f.hidden(true);await f.drain();assert.equal(ctx.suspendCalls,1);assert.equal(voice.source.stopCalls.length,0);f.hidden(false);await f.drain();assert.equal(ctx.state,'running');assert.equal(f.fieldStarts().length,1);assert.equal(f.fieldStarts()[0],voice);assert.equal(voice.source.stopCalls.length,0);f.api.stopSound(1738);await playing;
});
test('disabling audio while hidden cannot restart it or resurrect voices on visibility resume',async()=>{
 const f=fixture();await f.api.enable();const ctx=f.contexts[0];f.hidden(true);await f.drain();assert.equal(ctx.state,'suspended');f.api.disable();const resumes=ctx.resumeCalls;f.hidden(false);await f.drain();assert.equal(f.api.enabled,false);assert.equal(ctx.resumeCalls,resumes);assert.equal(ctx.state,'suspended');assert.deepEqual(Array.from(f.api.errors),[]);
});
test('an enable operation completed after hiding keeps the context paused until visible',async()=>{
 const f=fixture();f.hidden(true);await f.api.enable();assert.equal(f.contexts[0].state,'suspended');assert.equal(f.api.enabled,true);f.hidden(false);await f.drain();assert.equal(f.contexts[0].state,'running');f.api.disable();
});
test('a pending suspend cannot leave audio paused after a rapid hide and show',async()=>{
 const f=fixture();await f.api.enable();const playing=f.api.playSound(1738);await f.drain();const ctx=f.contexts[0],voice=f.fieldStarts()[0];let finish;
 ctx.suspend=()=>new Promise(resolve=>{finish=()=>{ctx.state='suspended';resolve();};});
 f.hidden(true);assert.equal(typeof finish,'function');f.hidden(false);finish();await f.drain();
 assert.equal(ctx.state,'running');assert.equal(f.fieldStarts().length,1);assert.equal(f.fieldStarts()[0],voice);assert.equal(voice.source.stopCalls.length,0);f.api.stopSound(1738);await playing;
});
test('a pending resume cannot leave audio running after hiding again',async()=>{
 const f=fixture();await f.api.enable();const ctx=f.contexts[0];f.hidden(true);await f.drain();let finish;
 ctx.resume=()=>new Promise(resolve=>{finish=()=>{ctx.state='running';resolve();};});
 f.hidden(false);assert.equal(typeof finish,'function');f.hidden(true);finish();await f.drain();assert.equal(ctx.state,'suspended');f.api.disable();
});
test('finishing a pending visibility request after disable cannot resume the context',async()=>{
 const f=fixture();await f.api.enable();const ctx=f.contexts[0],resumes=ctx.resumeCalls;let finish;
 ctx.suspend=()=>new Promise(resolve=>{finish=()=>{ctx.state='suspended';resolve();};});
 f.hidden(true);f.api.disable();f.hidden(false);finish();await f.drain();assert.equal(f.api.enabled,false);assert.equal(ctx.state,'suspended');assert.equal(ctx.resumeCalls,resumes);assert.equal(f.api.errors.length,0);
});
test('a failed visibility resume is retryable by a new actual input gesture without replaying voices',async()=>{
 const f=fixture();await f.api.enable();const playing=f.api.playSound(1738);await f.drain();const ctx=f.contexts[0],voice=f.fieldStarts()[0],resume=ctx.resume;
 f.hidden(true);await f.drain();ctx.resume=()=>Promise.reject(Error('Injected transient resume rejection'));f.hidden(false);await f.drain();assert.equal(ctx.state,'suspended');assert.equal(f.api.errors.length,1);
 ctx.resume=resume;f.dispatchDocument('keydown');await f.drain();assert.equal(ctx.state,'running');assert.equal(f.api.enabled,true);assert.equal(f.fieldStarts().length,1);assert.equal(f.fieldStarts()[0],voice);f.api.stopSound(1738);await playing;
});
