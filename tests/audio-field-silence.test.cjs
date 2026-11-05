const {test}=require('node:test'),assert=require('node:assert/strict'),{fixture}=require('./helpers/audio-engine-fixture.cjs');
test('IRBI SEQ_BGM_SILENCE_FIELD (1001) stops music while retaining field effects',async()=>{
 const f=fixture();await f.api.enable();const music=f.starts.find(s=>s.src==='music.flac');
 const effect=f.api.playSound(1738);await f.drain();const motor=f.fieldStarts()[0];
 await f.api.setScene(1001);assert.equal(f.api.errors.length,0);assert.equal(music.source.stopCalls.length,1);assert.equal(motor.source.stopCalls.length,0);
 assert.equal(f.elements.get('audioControls').dataset.music,'1001');assert.equal(f.api.scene,1001);assert.ok(!f.reads.some(s=>s.includes('1001')));
 await f.api.setScene('town');assert.equal(f.starts.filter(s=>s.src==='music.flac').length,2);f.api.stopSound(1738);await effect;
});
test('native silence invalidates pending music and remains silent after re-enable',async()=>{
 const f=fixture(),pending=f.hold('music.flac'),enabled=f.api.enable();await f.drain();await f.api.setScene(1001);pending.resolve();await enabled;await f.drain();
 assert.equal(f.starts.length,0);assert.equal(f.api.errors.length,0);f.api.disable();await f.api.enable();assert.equal(f.starts.length,0);assert.equal(f.elements.get('audioControls').dataset.music,'1001');
});
