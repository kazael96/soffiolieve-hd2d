const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),path=require('node:path');
const root=path.resolve(__dirname,'../src'),c={FIELD_AUDIO:{old:{src:'keep.flac'}},ROM_AUDIO_CATALOG:{cries:{old:{file:'keep.wav'}}}};c.window=c;vm.runInNewContext(fs.readFileSync(path.join(root,'league-audio.js'),'utf8'),c);
test('the actual gym clips retain exact sample counts, hashes, loops and the earlier audio catalog',()=>{
 const catalog=c.LEAGUE_AUDIO;assert.deepEqual(Object.keys(catalog.music),['1054','1073','1084','1117']);assert.deepEqual(Object.keys(catalog.sounds),['1747','1748','1753','1774','1775','1788','1789']);
 for(const [id,r]of Object.entries({...catalog.music,...catalog.sounds})){
  const bytes=fs.readFileSync(path.join(root,r.src));assert.equal(bytes.subarray(0,4).toString(),'fLaC');assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),r.sha256);
  const info=bytes.readBigUInt64BE(18),rate=Number(info>>44n),samples=Number(info&((1n<<36n)-1n));assert.equal(rate,32768);assert.equal(samples/rate,r.duration);assert.ok(samples>0);
  if(r.loop)assert.ok(0<=r.loop[0]&&r.loop[0]<r.loop[1]&&r.loop[1]<=r.duration);
  assert.equal(c.FIELD_AUDIO[id],r);
 }
 assert.equal(c.FIELD_AUDIO.old.src,'keep.flac');assert.equal(c.ROM_AUDIO_CATALOG.cries.old.file,'keep.wav');
});
test('arm and neck motors declare their bounded capture and explicit native stop ownership',()=>{
 for(const [id,r]of Object.entries(c.LEAGUE_AUDIO.sounds)){const motor=['1748','1788','1774'].includes(id);assert.equal(r.sustain,motor);assert.equal(r.captureLimitSeconds,motor?12:null);assert.ok(r.nativeHandlers.length);assert.ok(r.duration>0&&r.duration<=12);}
});
