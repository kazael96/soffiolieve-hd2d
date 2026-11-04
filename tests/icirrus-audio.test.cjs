const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../src'),c={FIELD_AUDIO:{prior:{src:'keep.flac'}},ROM_AUDIO_CATALOG:{cries:{prior:{file:'keep.wav'}}}};c.window=c;vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(root,'icirrus-audio.js'),'utf8'),c);const d=c.ICIRRUS_AUDIO;
function lossless(record,id){
 const bytes=fs.readFileSync(path.join(root,record.src));assert.equal(bytes.toString('ascii',0,4),'fLaC');assert.equal(bytes[4]&127,0);assert.equal(bytes.readUIntBE(5,3),34);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.sha256,id);
 const packed=bytes.readBigUInt64BE(18),rate=Number(packed>>44n),samples=Number(packed&((1n<<36n)-1n));
 assert.equal(rate,32768);assert.equal(record.rate,rate);assert.ok(samples>0);assert.ok(Math.abs(record.duration-samples/rate)<.5/rate,'Exact duration '+id);
 if(record.loop)assert.ok(record.loop[0]>=0&&record.loop[1]>record.loop[0]&&record.loop[1]<=record.duration+1/rate);
 assert.equal(c.FIELD_AUDIO[id],record);
}
test('all16 native music clips retain sample-exact durations, hashes and valid loops',()=>{
 assert.equal(Object.keys(d.music).length,16);
 for(const id of [1013,1031,1032,1046,1047,1048,1049,1060,1062,1079,1081,1086,1090,1092,1093,1101])assert.ok(d.music[id]);
 for(const[id,record]of Object.entries(d.music))lossless(record,id);
 assert.equal(c.FIELD_AUDIO.prior.src,'keep.flac');
});
test('all21 scripted/cannon/bell effects have native provenance and bounded one-shot duration',()=>{
 assert.equal(Object.keys(d.sounds).length,21);
 for(const[id,record]of Object.entries(d.sounds)){lossless(record,id);assert.ok(record.duration>0&&record.duration<=12);assert.equal(record.sustain,false);assert.ok(record.nativeHandlers.length);}
 for(const id of [1688,1689,1696,1686,1687,1697,1969])assert.ok(d.sounds[id]);
});
test('all24 new cries contain actual mono PCM16 samples with native pitch/volume metadata',()=>{
 const proof=JSON.parse(fs.readFileSync(path.join(root,'assets/animated/provenance-050.json')));
 assert.deepEqual(Object.keys(d.cries).map(Number),proof.species);
 for(const[id,record]of Object.entries(d.cries)){
  const bytes=fs.readFileSync(path.join(root,record.file));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WAVE');assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),record.wavSha256);
  let data=false;
  for(let offset=12;offset+8<=bytes.length;){const kind=bytes.toString('ascii',offset,offset+4),size=bytes.readUInt32LE(offset+4);assert.ok(offset+8+size<=bytes.length);
   if(kind==='fmt '){assert.equal(bytes.readUInt16LE(offset+8),1);assert.equal(bytes.readUInt16LE(offset+10),1);assert.equal(bytes.readUInt32LE(offset+12),record.sampleRate);assert.equal(bytes.readUInt16LE(offset+22),16);}
   if(kind==='data'){assert.equal(size,record.samples*2);let peak=0;for(let at=offset+8;at<offset+8+size;at+=2)peak=Math.max(peak,Math.abs(bytes.readInt16LE(at)));assert.ok(peak>0,'Nonzero cry '+id);data=true;}
   offset+=8+size+(size&1);
  }
  assert.equal(data,true);assert.ok(record.nativeSpeed>0&&record.baseVolume>0&&record.baseVolume<=127);assert.equal(c.ROM_AUDIO_CATALOG.cries[id],record);
 }
 assert.equal(c.ROM_AUDIO_CATALOG.cries.prior.file,'keep.wav');
});
test('audio installer preserves prior catalogs and rejects incomplete dependencies',()=>{
 assert.equal(c.IcirrusAudio.install(),true);assert.equal(c.FIELD_AUDIO.prior.src,'keep.flac');assert.throws(()=>c.IcirrusAudio.install({},null),/Native audio catalogs unavailable/);
});
