const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../src'),c={FIELD_AUDIO:{prior:{src:'kept.flac'}},ROM_AUDIO_CATALOG:{cries:{prior:{file:'kept.wav'}}}};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'opelucid-audio.js'),'utf8'),c);const data=c.OPELUCID_AUDIO;
function flac(record){const b=fs.readFileSync(path.join(root,record.src));assert.equal(b.subarray(0,4).toString(),'fLaC');assert.equal(crypto.createHash('sha256').update(b).digest('hex'),record.sha256);const info=b.readBigUInt64BE(18),rate=Number(info>>44n),samples=Number(info&((1n<<36n)-1n));assert.equal(rate,record.rate);assert.equal(record.duration,samples/rate);assert.ok(samples>0);if(record.loop)assert.ok(0<=record.loop[0]&&record.loop[0]<record.loop[1]&&record.loop[1]<=record.duration);}
test('all23 field music and22 effects have sample-exact native clips; shared catalog entries survive',()=>{
 assert.equal(Object.keys(data.music).length,23);assert.equal(Object.keys(data.sounds).length,22);for(const [id,r]of Object.entries({...data.music,...data.sounds})){flac(r);assert.equal(c.FIELD_AUDIO[id],r);}assert.equal(c.FIELD_AUDIO.prior.src,'kept.flac');assert.equal(c.ROM_AUDIO_CATALOG.cries.prior.file,'kept.wav');
});
test('new scripted cries include both dragons and preserve original PCM identities',()=>{
 assert.equal(Object.keys(data.cries).length,19);for(const id of [553,556,558,563,576,593,598,606,608,611,619,621,623,624,626,643,644])assert.ok(data.cries[id]);
 for(const [id,r]of Object.entries(data.cries)){const b=fs.readFileSync(path.join(root,r.file));assert.equal(b.subarray(0,4).toString(),'RIFF');assert.equal(b.subarray(8,12).toString(),'WAVE');assert.equal(crypto.createHash('sha256').update(b).digest('hex'),r.wavSha256);assert.equal(c.ROM_AUDIO_CATALOG.cries[id],r);}
});
test('native platform motor retains explicit sustain and all other scripted sounds stay bounded',()=>{
 for(const [id,r]of Object.entries(data.sounds)){assert.ok(r.nativeHandlers.length);assert.ok(r.duration>0&&r.duration<=12);assert.equal(r.sustain,+id===1744);assert.equal(r.captureLimitSeconds,+id===1744?12:null);}for(const id of [1650,1665,1743,1744,1776,1924,2024])assert.ok(data.sounds[id]);
});
