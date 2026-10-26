const test=require('node:test'),assert=require('node:assert/strict'),{characteristic,natureId}=require('../src/summary-model.js');
test('original characteristic tie scan starts at PID modulo six in native stat order',()=>{
 const ivs={hp:31,atk:31,def:31,spe:31,spa:31,spd:31};
 for(let pid=0;pid<6;pid++)assert.equal(characteristic(ivs,pid),54+pid*5);
 assert.equal(characteristic({...ivs,spd:32},0),53+25+2);assert.equal(natureId('Serious'),12);assert.equal(natureId('Adamant'),3);
});
