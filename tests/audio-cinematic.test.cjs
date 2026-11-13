const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{fixture}=require('./helpers/audio-engine-fixture.cjs');
test('a movie with its own native BGM masks field music while preserving effects and the latest field volume',async()=>{
 const f=fixture();await f.api.enable();const first=f.api.createCinematic('movie.flac',{ownsMusic:true}),second=f.api.createCinematic('movie2.flac',{ownsMusic:true});await first.prepare();await second.prepare();assert.equal(f.gains[1].gain.value,0,'No town music under the movie soundtrack');assert.equal(f.gains[2].gain.value,.7,'Movie effects remain audible');f.api.setFieldMusicVolume(64);assert.equal(f.gains[1].gain.value,0);first.stop();first.stop();assert.equal(f.gains[1].gain.value,0,'Second owner still masks field music');second.stop();assert.equal(f.gains[1].gain.value,.45*64/127);
});
test('failed movie audio preparation never masks the field music',async()=>{
 const f=fixture();await f.api.enable();const held=f.hold('bad.flac'),movie=f.api.createCinematic('bad.flac',{ownsMusic:true}),failed=assert.rejects(movie.prepare(),/offline/);held.reject(Error('offline'));await failed;assert.equal(f.gains[1].gain.value,.45);movie.stop();assert.equal(f.gains[1].gain.value,.45);
});
test('native rest-only BGM1002 stops music without inventing a missing PCM resource',async()=>{
 const f=fixture();await f.api.enable();await f.api.setScene(1002);assert.equal(f.api.errors.length,0);assert.equal(f.api.scene,1002);assert.ok(f.starts[0].source.stopCalls.length);assert.ok(!f.reads.some(s=>s.includes('1002')));
});
test('cinematic origin uses actual source start when allocating audio nodes advances the context clock',async()=>{
 const f=fixture();await f.api.enable();const audio=f.api.createCinematic('movie.flac');await audio.prepare();const ctx=f.contexts[0],create=ctx.createBufferSource.bind(ctx);ctx.createBufferSource=()=>{ctx.currentTime+=.03;return create();};
 audio.sync(30,4);const start=f.fieldStarts().at(-1);assert.equal(start.offset,1);assert.equal(audio.status.offset,1,'Source just started at this offset; allocation delay is not played audio');audio.stop();
});
test('a delayed cinematic observation compares visual and audio offsets at the same sampled clock',async()=>{
 const f=fixture();await f.api.enable();const audio=f.api.createCinematic('movie.flac');await audio.prepare();audio.sync(30,4);const ctx=f.contexts[0];ctx.currentTime+=.03;
 const state=audio.status;assert.ok(Math.abs(state.offset-1)>.1,'A later live observation alone produces the old false failure at4x');assert.ok(Number.isFinite(state.sampledAt)&&Number.isFinite(state.syncedAt));assert.ok(Math.abs(state.offset-(state.visualOffset+(state.sampledAt-state.syncedAt)*state.visualRate))<1e-9);audio.stop();
});
test('cinematic playback follows native seconds and x1/x2/x4 without duplicating a current voice',async()=>{
 const f=fixture();await f.api.enable();const audio=f.api.createCinematic('movie.flac');await audio.prepare();assert.equal(f.fieldStarts().length,0);audio.sync(30,1);assert.equal(f.fieldStarts().length,1);assert.equal(f.fieldStarts()[0].offset,1);
 const ctx=f.contexts[0];ctx.currentTime+=.1;audio.sync(33,2);assert.equal(f.fieldStarts().length,1);assert.equal(f.fieldStarts()[0].source.playbackRate.value,2);ctx.currentTime+=.1;audio.sync(39,4);assert.equal(f.fieldStarts().length,1);assert.equal(f.fieldStarts()[0].source.playbackRate.value,4);audio.stop();assert.equal(f.fieldStarts()[0].source.stopCalls.length,1);
});
test('background pause resumes at the visual frame, and a stalled visual clock seeks to recover drift',async()=>{
 const f=fixture();await f.api.enable();const audio=f.api.createCinematic('movie.flac');await audio.prepare();audio.sync(90);f.c.document.hidden=true;audio.sync(90);assert.equal(f.fieldStarts()[0].source.stopCalls.length,1);f.c.document.hidden=false;f.contexts[0].currentTime+=5;audio.sync(90);assert.equal(f.fieldStarts().at(-1).offset,3);assert.equal(f.fieldStarts().length,2);
 f.contexts[0].currentTime+=1;audio.sync(93);assert.equal(f.fieldStarts().length,3);assert.equal(f.fieldStarts().at(-1).offset,3.1);audio.stop();
});
test('disabling audio cannot resurrect a pending cinematic; re-enabling resumes the current frame',async()=>{
 const f=fixture();await f.api.enable();const held=f.hold('movie.flac'),audio=f.api.createCinematic('movie.flac'),pending=audio.prepare();f.api.disable();held.resolve();await pending;await f.drain();audio.sync(120);assert.equal(f.fieldStarts().length,0);await f.api.enable();audio.sync(120);await f.drain();audio.sync(120);assert.equal(f.fieldStarts().length,1);assert.equal(f.fieldStarts()[0].offset,4);audio.stop();
});
test('ending while a cinematic is loading cancels it without starting any late voice',async()=>{
 const f=fixture();await f.api.enable();const held=f.hold('movie.flac'),audio=f.api.createCinematic('movie.flac'),pending=audio.prepare();audio.stop();held.resolve();await pending;audio.sync(30);assert.equal(f.fieldStarts().length,0);audio.stop();
});
test('failed preparation retries explicitly, and an ended clip never loops its last sample',async()=>{
 const f=fixture();await f.api.enable();const held=f.hold('movie.flac'),audio=f.api.createCinematic('movie.flac'),first=assert.rejects(audio.prepare(),/offline/);held.reject(Error('offline'));await first;audio.sync(0);await f.drain();assert.equal(f.fieldStarts().length,0);const retry=f.hold('movie.flac'),prepared=audio.prepare();retry.resolve();await prepared;audio.sync(0);assert.equal(f.fieldStarts().length,1);audio.sync(360);audio.sync(400);assert.equal(f.fieldStarts().length,1);assert.equal(f.fieldStarts()[0].source.stopCalls.length,1);assert.throws(()=>audio.sync(NaN),/non valido/);audio.stop();
});
test('exported film audio retains the exact native control records, sample rate, duration and hashes',()=>{
 const src=path.resolve(__dirname,'../src'),text=fs.readFileSync(path.join(src,'opelucid-cinematics-data.js'),'utf8'),films=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,'')).films;
 for(const [id,f]of Object.entries(films)){const a=f.audio,b=fs.readFileSync(path.join(src,a.src));assert.equal(b.subarray(0,4).toString(),'fLaC');assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256);const info=b.readBigUInt64BE(18),samples=Number(info&((1n<<36n)-1n));assert.equal(Number(info>>44n),32768);assert.equal(Number((info>>41n)&7n)+1,2);assert.equal(samples,Math.round(f.frames*32768/30));assert.equal(a.duration,samples/32768);assert.equal(a.nativePitchAndVolumeBaked,true);assert.equal(a.cues.length,2);
  for(const cue of a.cues){const native=f.timeline.find(e=>e.kind===1&&e.args[0]===cue.sequence);assert.ok(native);const control=cue.controls[0];assert.equal(control.playerVolume127,native.args[1]);assert.equal(control.pan128,native.args[2]);assert.equal(control.pitch64,native.args[3]);assert.equal(cue.startFrame,native.frame);}
  assert.equal(a.cues[0].sequence,id==='13'?2044:2046);
 }
});
test('pausing a cinematic releases only the voice and resumes the same buffered clip at the visual frame',async()=>{const f=fixture();await f.api.enable();const audio=f.api.createCinematic('movie.flac');await audio.prepare();audio.sync(6,2);const old=f.fieldStarts()[0];audio.pause();assert.equal(old.source.stopCalls.length,1);assert.equal(audio.status.ready,true);audio.pause();assert.equal(old.source.stopCalls.length,1);audio.sync(6,4);assert.equal(f.fieldStarts().length,2);assert.equal(f.fieldStarts().at(-1).offset,.2);assert.equal(f.fieldStarts().at(-1).source.playbackRate.value,4);audio.stop();});
