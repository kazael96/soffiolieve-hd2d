const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('first-ending music resolves every native Black trainer and leaves earlier N and ordinary fights unchanged',()=>{
 const c={};c.window=c;vm.createContext(c);for(const file of ['finale-audio','finale-battle-music'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../src',file+'.js'),'utf8'),c);
 for(const [id,track]of [[228,1135],[229,1135],[230,1135],[231,1135],[587,1138],[232,1139]]){assert.equal(c.FinaleBattleMusic.sequence(id),track);const record=c.FINALE_AUDIO.music[track];assert.ok(record?.src.endsWith('.flac'));assert.ok(record.duration>90);assert.ok(fs.existsSync(path.join(__dirname,'../src',record.src)));}
 for(const id of [undefined,64,65,218,586,407,563,564,565,566,11,24])assert.equal(c.FinaleBattleMusic.sequence(id),null);
});
