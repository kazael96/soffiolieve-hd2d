'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),L=require('./helpers/liepard-protocol064/strict-loader.cjs'),catalog=require('./fixtures/liepard-protocol064/catalog.json'),collector=require('./helpers/liepard-protocol064/registration-collector.cjs');
L.ensureLedger('legacy28');
for(const group of ['audio-boundary','controller','review','wiring'])require('./helpers/liepard-protocol064/'+group+'.cases.cjs');
assert.equal(collector.entries.length,28);assert.deepEqual(collector.entries.map(e=>e.name),catalog.legacy.map(c=>c.name),'Every original V4 legacy callback must be registered once');
for(const entry of collector.entries)test(entry.name,entry.fn);
