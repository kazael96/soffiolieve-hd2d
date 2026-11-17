const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');

test('the native introduction cue installs without replacing field music and matches its lossless stream and loop',()=>{
 const c={FIELD_AUDIO:{1100:{retained:true}}};c.window=c;vm.runInNewContext(fs.readFileSync(require.resolve('../src/introduction-audio.js'),'utf8'),c);
 assert.equal(c.FIELD_AUDIO[1100].retained,true);assert.equal(c.FIELD_AUDIO[1008],undefined);assert.deepEqual(Object.keys(c.FIELD_AUDIO).sort(),['1009','1100']);
 c.IntroductionAudio.install();assert.equal(Object.keys(c.FIELD_AUDIO).length,2);
 const record=c.FIELD_AUDIO[1009],path=require('node:path'),crypto=require('node:crypto'),bytes=fs.readFileSync(path.join(__dirname,'../src',record.src));
 assert.equal(bytes.subarray(0,4).toString(),'fLaC');assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256);
 assert.equal(bytes[4]&127,0);assert.equal(bytes.readUIntBE(5,3),34);
 const info=bytes.readBigUInt64BE(18),rate=Number(info>>44n),channels=Number(info>>41n&7n)+1,samples=Number(info&((1n<<36n)-1n));
 assert.equal(rate,32768);assert.equal(channels,2);assert.equal(samples/rate,record.duration);assert.ok(record.loop[0]>0&&record.loop[0]<record.loop[1]&&record.loop[1]===record.duration);
 assert.equal(record.nativeVolume127,90);assert.equal(record.nativeVolumeAppliedToPCM,true);assert.equal(record.gain,undefined,'Do not apply native volume to the already rendered PCM a second time');
 assert.deepEqual(Array.from(c.INTRODUCTION_AUDIO.proof.messageBankRow.words),[19,1,44,0,0,1]);assert.deepEqual(Array.from(c.INTRODUCTION_AUDIO.proof.musicRow.words),[12,1009,0,0,0,1]);
});
test('field sounds follow x1/x2/x4 and changes to speed update a playing field sound only',async()=>{let onLoad;const source=fs.readFileSync(require.resolve('../src/audio-engine.js'),'utf8'),calls=[],voices=new Set(),c={audioEpoch:0,fieldSounds:new Map(),enabled:true,ctx:{currentTime:2},catalog:{},data:{sounds:{1351:{src:'sound.wav'}}},sfxBus:{},load:async()=>({}),voice(buffer,bus,options){calls.push(options);return {done:Promise.resolve()}},problem(e){throw e},GameSpeed:{rate:1,subscribe(fn){this.listener=fn}},voices,addEventListener(name,fn){assert.equal(name,'load');onLoad=fn;}};c.window=c;vm.createContext(c);vm.runInContext(source.slice(source.indexOf(' async function playSound('),source.indexOf(' function setMono(')),c);for(const rate of [1,2,4]){c.GameSpeed.rate=rate;await c.playSound(1351);assert.equal(calls.at(-1).rate,rate);assert.equal(calls.at(-1).kind,'field');}vm.runInContext(source.slice(source.indexOf(" addEventListener('load'"),source.indexOf(' const api=window.AudioEngine=')),c);onLoad();const updated=[],voice=kind=>({kind,source:{playbackRate:{setValueAtTime:rate=>updated.push([kind,rate])}}});voices.add(voice('field'));voices.add(voice('music'));voices.add(voice('sfx'));c.GameSpeed.listener();assert.deepEqual(updated,[['field',4]]);});
