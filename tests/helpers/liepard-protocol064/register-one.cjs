'use strict';
const {assertDirectTestInvocation}=require('../../../scripts/node-test-options.cjs');
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),L=require('./strict-loader.cjs'),catalog=require('../../fixtures/liepard-protocol064/catalog.json'),collector=require('./registration-collector.cjs');
let registered=false;
function register(index,id){
 assert.equal(registered,false,'Lifecycle wrappers must have one dedicated direct process each');registered=true;
 assertDirectTestInvocation(process.execArgv,process.versions.node);L.ensureLedger(id);
 require('./real-stage-lifecycle.cases.cjs');
 assert.equal(catalog.lifecycle.length,21);assert.deepEqual(collector.entries.map(e=>e.name),catalog.lifecycle.map(c=>c.name),'Complete original21declarations differ');
 const expected=catalog.lifecycle[index],selected=collector.entries[index];assert(expected&&selected);assert.equal(expected.id,id);assert.equal(expected.index,index);assert.equal(expected.name,selected.name);
 test(selected.name,selected.fn);
 process.once('exit',()=>{fs.writeFileSync(process.env.C11_PROTOCOL_LEDGER.replace(/\.json$/,'.selection.json'),JSON.stringify({id,index,name:selected.name,collected:collector.entries.length,registeredWithNodeTest:1,skippedByPattern:0,scope:'One unchanged original callback in the directly owned top-level Node test process.'},null,2)+'\n');});
}
module.exports={register};
