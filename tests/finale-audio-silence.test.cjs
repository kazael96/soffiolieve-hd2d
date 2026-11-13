const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {fixture}=require('./helpers/audio-engine-fixture.cjs');
function setup(){const f=fixture();vm.runInContext(fs.readFileSync('src/finale-silent-audio.js','utf8'),f.c);f.c.FIELD_AUDIO=f.c.FINALE_SILENT_AUDIO;return f;}
test('native rest-only ENDING2 stops old music without fetching fake PCM or stopping field effects',async()=>{
 const f=setup();await f.api.enable();const music=f.starts.find(s=>s.src==='music.flac');
 const effect=f.api.playSound(1738);await f.drain();const motor=f.fieldStarts()[0];
 await f.api.setScene(1017);assert.equal(f.api.errors.length,0);assert.equal(music.source.stopCalls.length,1);assert.equal(motor.source.stopCalls.length,0);
 assert.equal(f.elements.get('audioControls').dataset.music,'1017');assert.ok(!f.reads.some(file=>file===undefined||String(file).includes('1017')));
 await f.api.setScene('town');assert.equal(f.starts.filter(s=>s.src==='music.flac').length,2);f.api.stopSound(1738);await effect;
});
test('ENDING2 cancels stale pending music and remains silent on reenable; unknown tracks still fail',async()=>{
 const f=setup(),hold=f.hold('music.flac'),enabled=f.api.enable();await f.drain();await f.api.setScene(1017);hold.resolve();await enabled;await f.drain();
 assert.equal(f.starts.length,0);assert.equal(f.api.errors.length,0);f.api.disable();await f.api.enable();assert.equal(f.starts.length,0);
 await f.api.setScene(2999);assert.equal(f.api.errors.length,1);assert.match(String(f.api.errors[0]),/Musica non trovata/);
});
