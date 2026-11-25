'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),L=require('../liepard-protocol064/strict-loader.cjs'),collector=require('../liepard-protocol064/registration-collector.cjs'),catalog=require('../../fixtures/liepard-recovery064/catalog.json');
let registered=false;
function register(group,index,id){
 assert.equal(registered,false,'Recovery/G7 wrappers require one directly owned top-level process each');registered=true;
 assert(process.execArgv.includes('--test-isolation=none'),'Do not spawn hidden Node isolation children for heavyRecovery');assert(['recovery','g7fixed'].includes(group));L.ensureLedger(id);
 require(group==='recovery'?'./resource-recovery.cases.cjs':'./g7-fixed.cases.cjs');
 const expected=catalog[group];assert.equal(expected.length,group==='recovery'?16:2);assert.deepEqual(collector.entries.map(e=>e.name),expected.map(e=>e.name),'Complete HOSTR3 callback inventory must match exactly');
 const entry=expected[index],selected=collector.entries[index];assert(entry&&selected);assert.equal(entry.id,id);assert.equal(entry.index,index);assert.equal(entry.name,selected.name);process.env.LIEPARD_RECOVERY_CASE_LABEL=selected.name;
 test(selected.name,selected.fn);
 process.once('exit',()=>{fs.writeFileSync(process.env.C11_PROTOCOL_LEDGER.replace(/\.json$/,'.selection.json'),JSON.stringify({group,index,id,name:selected.name,collected:collector.entries.length,registeredWithNodeTest:1,skippedByPattern:0,scope:'Exactly one unchanged HOSTR3 fixed callback in directly owned process. Uses shared provider;no historical runtime baseline.'},null,2)+'\n');});
}
module.exports={register};
