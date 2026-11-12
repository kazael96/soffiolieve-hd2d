const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Intro=require('../src/trainer-intro-music.js'),c={window:{}};vm.runInNewContext(fs.readFileSync('src/trainer-intro-music-data.js','utf8'),c);const table=c.window.TRAINER_INTRO_MUSIC;

test('native male/female veteran and default encounter themes use the original class lookup',()=>{
 assert.equal(Intro.sequence({trainerClass:70},table),1117);assert.equal(Intro.sequence({trainerClass:71},table),1117);
 assert.equal(Intro.sequence({trainerClass:2},table),1114);assert.equal(Intro.sequence({trainerClass:3},table),1115);
 assert.equal(Intro.sequence({trainerClass:0},table),1114);assert.equal(Intro.sequence({trainerClass:39},table),1127);
 assert.equal(table.arm9Sha256,'a972ed6ac0177f1b86dce216d5377e49a96b5e8b5ac9055bc56a74c5fc855ba5');
});
test('intro joins actual audio preparation before continuing',async()=>{
 let finish;const calls=[],options={trainers:{274:{trainerClass:70}},table,catalog:{1117:{src:'native.flac'}},audio:{setScene:id=>{calls.push(id);return new Promise(done=>finish=done);}}};
 let ended=false;const pending=Intro.start(274,options).then(id=>{ended=true;return id;});await Promise.resolve();assert.equal(ended,false);assert.deepEqual(calls,[1117]);finish();assert.equal(await pending,1117);
});
test('missing trainer/resources and transient audio errors remain explicit and retryable',async()=>{
 const options={trainers:{274:{trainerClass:70}},table,catalog:{},audio:{setScene(){throw Error('should not play');}}};
 await assert.rejects(Intro.start(274,options),/mancante: 1117/);await assert.rejects(Intro.start(999,options),/originale/);
 let attempts=0;options.catalog[1117]={};options.audio.setScene=async()=>{if(++attempts===1)throw Error('temporary');};
 await assert.rejects(Intro.start(274,options),/temporary/);assert.equal(await Intro.start(274,options),1117);assert.equal(attempts,2);
});
