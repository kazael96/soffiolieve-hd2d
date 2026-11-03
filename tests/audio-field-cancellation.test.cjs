const {test}=require('node:test'),assert=require('node:assert/strict'),{fixture}=require('./helpers/audio-engine-fixture.cjs');
test('stopSound during a deferred load settles the caller and never starts the stale motor',async()=>{
 const f=fixture();await f.api.enable();const pending=f.hold('motor.flac');let done=false;const playing=f.api.playSound(1738).then(()=>done=true);f.api.stopSound(1738);await f.drain();assert.equal(done,true);pending.resolve();await f.drain();assert.equal(f.fieldStarts().length,0);await playing;
});
test('disable then re-enable cannot resurrect a pending field voice or cry',async()=>{
 const f=fixture();await f.api.enable();const motor=f.hold('motor.flac'),cry=f.hold('cry-592.wav');let fieldDone=false,cryDone=false;const a=f.api.playSound(1738).then(()=>fieldDone=true),b=f.api.cry('592-female').then(()=>cryDone=true);f.api.disable();await f.drain();assert.equal(fieldDone,true);assert.equal(cryDone,true);await f.api.enable();motor.resolve();cry.resolve();await f.drain();assert.equal(f.fieldStarts().length,0);await Promise.all([a,b]);
 const fresh=f.api.playSound(1738);await f.drain();assert.equal(f.fieldStarts().length,1);f.api.stopSound(1738);await fresh;
});
test('stopping one sound preserves other IDs and natural completion still resolves their promises',async()=>{
 const f=fixture();await f.api.enable();let motorDone=false,barrierDone=false;const a=f.api.playSound(1738).then(()=>motorDone=true),b=f.api.playSound(1741).then(()=>barrierDone=true);await f.drain();const motor=f.fieldStarts().find(s=>s.src==='motor.flac'),barrier=f.fieldStarts().find(s=>s.src==='barrier.flac');f.api.stopSound(1738);await f.drain();assert.equal(motorDone,true);assert.equal(barrierDone,false);assert.equal(motor.source.stopCalls.length,1);assert.equal(barrier.source.stopCalls.length,0);barrier.source.finish();await Promise.all([a,b]);assert.equal(barrierDone,true);
});
test('duplicate plays join one pending or playing voice and can play again after completion',async()=>{
 const f=fixture();await f.api.enable();const pending=f.hold('motor.flac'),a=f.api.playSound(1738),b=f.api.playSound(1738);pending.resolve();await f.drain();assert.equal(f.fieldStarts().length,1);const third=f.api.playSound(1738);await f.drain();assert.equal(f.fieldStarts().length,1);f.fieldStarts()[0].source.finish();await Promise.all([a,b,third]);const next=f.api.playSound(1738);await f.drain();assert.equal(f.fieldStarts().length,2);f.api.stopSound(1738);await next;
});
test('field offsets are bounded native seconds and active field sounds retain x1/x2/x4',async()=>{
 const f=fixture();await f.api.enable();for(const [offset,expected,rate]of [[2.5,2.5,1],[-5,0,2],[100,11.999,4]]){f.c.GameSpeed.rate=rate;const p=f.api.playSound(1739,{offset});await f.drain();const start=f.fieldStarts().at(-1);assert.equal(start.offset,expected);assert.equal(start.rate,rate);assert.equal(start.source.loop,undefined,'finite original PCM is not turned into a loop');f.c.GameSpeed.rate=rate===4?1:4;f.c.GameSpeed.listener();assert.equal(start.source.playbackRate.value,f.c.GameSpeed.rate);f.api.stopSound(1739);await p;}
});
test('direct cry data, preload and scheduled cries resolve gender/season graphics to native species',async()=>{
 const f=fixture();assert.ok(await f.api.cryData('521-female'));assert.ok(f.reads.includes('cry-521.wav'));assert.ok(await f.api.cryData(701));assert.ok(f.reads.includes('cry-585.wav'));await f.api.enable();await f.api.preloadMove(1,{p1:'521-female',p2:706});assert.ok(f.reads.includes('cry-586.wav'));await f.api.preloadEvents([],{p1:'592-female'});f.api.beginMove([{kind:'cry',target:14,start:0,raw:[]}],{moveId:1,frames:100,side:'p1',targetSide:'p2',cryIds:{p1:'592-female'},speed:1});assert.equal(f.elements.get('audioControls').dataset.cry,'592');f.api.cancelMove();
 const direct=f.api.cry(704);await f.drain();assert.equal(f.elements.get('audioControls').dataset.cry,'586');for(const source of f.sources)source.finish();await direct;
});
