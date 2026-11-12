const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
function catalog(file,key){const c={};c.window=c;vm.runInNewContext(fs.readFileSync('src/'+file+'.js','utf8'),c);return c[key];}
test('finale native catalog owns16 sounding music tracks24 effects and10 preserved cries plus explicit silence',()=>{
 const d=catalog('finale-audio','FINALE_AUDIO');assert.equal(d.sdatSha256,'062073d5e29bc953979d75f1ba4f5f26d53cb3fd41130660fe1bca6041189e13');
 assert.equal(Object.keys(d.music).length,17);assert.equal(Object.keys(d.sounds).length,24);assert.equal(Object.keys(d.cries).length,10);
 for(const [id,record]of Object.entries({...d.music,...d.sounds})){
  if(id==='1017'){assert.equal(record.nativeSilence,true);assert.equal(record.src,undefined);continue;}
  assert.ok(!record.nativeSilence);assert.match(record.src,/^assets\/field-audio\/\d+\.flac$/);
  const bytes=fs.readFileSync('src/'+record.src);assert.equal(bytes.toString('ascii',0,4),'fLaC');assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256);
  assert.equal(record.rate,32768);assert.ok(record.duration>0);if(record.loop)assert.ok(record.loop[0]>=0&&record.loop[1]>record.loop[0]&&record.loop[1]<=record.duration+1/record.rate);
 }
});
test('every extracted map music explicit field cue and Elite Four timeline sound has its native record',()=>{
 const d=catalog('finale-audio','FINALE_AUDIO'),events=catalog('finale-events','FINALE_EVENTS'),controls=catalog('finale-elite-controls','FINALE_ELITE_CONTROLS');
 for(const zone of Object.values(events.zones))assert.ok(d.music[zone.music],'map music '+zone.music);
 for(const program of Object.values(events.scripts))for(const instruction of Object.values(program.code)){
  if(instruction.name==='SEPlay')assert.ok(d.sounds[instruction.args[0]],'field effect '+instruction.args[0]);
  if(['BGMPlay','NativeOpcode159'].includes(instruction.name))assert.ok(d.music[instruction.args[0]],'field music '+instruction.args[0]);
 }
 for(const room of Object.values(controls.rooms))for(const event of room.events)assert.ok(d.sounds[event.id],'native room cue '+event.id);
 assert.equal(d.sounds[1856].sustain,true);assert.ok(d.sounds[1856].duration>520/30,'Marzio effect must last until native stop610 from start90');
 for(const id of [1682,1862,1878,1902])assert.ok(d.sounds[id],'ambient callback effect '+id);assert.equal(d.sounds[1862].sustain,true);
});
test('scoped installer preserves existing music and cry entries and fails explicitly without target catalogs',()=>{
 const c={FIELD_AUDIO:{1114:{src:'prior.flac'}},ROM_AUDIO_CATALOG:{cries:{1:{file:'prior.wav'}}}};c.window=c;vm.runInNewContext(fs.readFileSync('src/finale-audio.js','utf8'),c);
 assert.equal(c.FIELD_AUDIO[1114].src,'prior.flac');assert.equal(c.ROM_AUDIO_CATALOG.cries[1].file,'prior.wav');assert.equal(c.FIELD_AUDIO[1017].nativeSilence,true);assert.ok(c.ROM_AUDIO_CATALOG.cries[644]);
 assert.throws(()=>c.FinaleAudio.install(null,null),/catalogs unavailable/);
});
