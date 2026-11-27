'use strict';
// Merge with the final shared scheduler, including A's one602 dedication once.
// This helper never spawns; it returns directly owned stage argv lists.
const {isolationFlag}=require('./node-test-options.cjs');
const path=require('node:path'),assert=require('node:assert/strict'),catalog=require('../tests/fixtures/liepard-protocol064/catalog.json'),recoveryCatalog=require('../tests/fixtures/liepard-recovery064/catalog.json');
const name=file=>file.split(/[\\/]/).at(-1),lifeNames=catalog.lifecycle.map(c=>path.basename(c.wrapper)),legacyName=path.basename(catalog.legacyWrapper),recoveryEntries=[...recoveryCatalog.recovery,...recoveryCatalog.g7fixed],recoveryNames=recoveryEntries.map(c=>path.basename(c.wrapper));
function validateCatalog(){assert.equal(lifeNames.length,21);assert.equal(new Set(lifeNames).size,21);assert.equal(new Set(catalog.lifecycle.map(c=>c.id)).size,21);assert.equal(catalog.legacy.length,28);catalog.lifecycle.forEach((c,index)=>{assert.equal(c.index,index);assert.equal(c.id,'lifecycle-'+String(index+1).padStart(2,'0'));});assert.equal(recoveryCatalog.recovery.length,16);assert.equal(recoveryCatalog.g7fixed.length,2);assert.equal(new Set(recoveryNames).size,18);assert.equal(new Set(recoveryEntries.map(c=>c.id)).size,18);}
function applies(files){return files.some(file=>lifeNames.includes(name(file))||recoveryNames.includes(name(file))||name(file)===legacyName);}
function augment(baseUnitStages,files,{exe=process.execPath,windows=process.platform==='win32',groups=8,nodeVersion=process.versions.node,dedicatedFromOtherWork=[]}={}){
 const noIsolation=isolationFlag(nodeVersion);
 validateCatalog();assert.equal(typeof baseUnitStages,'function');assert(Array.isArray(files)&&files.length&&new Set(files).size===files.length);assert(Array.isArray(dedicatedFromOtherWork)&&new Set(dedicatedFromOtherWork).size===dedicatedFromOtherWork.length);
 const byName=new Map();for(const file of files){assert(typeof file==='string'&&file.endsWith('.test.cjs'));assert(!byName.has(name(file)),'Ambiguous test basename');byName.set(name(file),file);}
 for(const required of [...lifeNames,...recoveryNames,legacyName])assert(byName.has(required),'Incomplete lifecycle/recovery/legacy inventory: '+required);
 for(const other of dedicatedFromOtherWork){assert(!lifeNames.includes(other)&&!recoveryNames.includes(other)&&other!==legacyName);assert(byName.has(other),'Missing explicit other dedicated fixture '+other);}
 const dedicated=new Set([...lifeNames,...recoveryNames,...dedicatedFromOtherWork]),ordinary=files.filter(file=>!dedicated.has(name(file))),base=ordinary.length?baseUnitStages(ordinary,{exe,windows,groups,nodeVersion}):[];
 const own=lifeNames.map((file,index)=>['unit-liepard-life-'+String(index+1).padStart(2,'0'),exe,['--max-old-space-size=400','--test',noIsolation,byName.get(file)]]);
 const other=dedicatedFromOtherWork.slice().sort().map((file,index)=>['unit-other-dedicated-'+String(index+1).padStart(2,'0')+'-'+file.replace('.test.cjs',''),exe,['--max-old-space-size=400','--test',noIsolation,byName.get(file)]]);
 const recovery=recoveryNames.map((file,index)=>['unit-liepard-recovery-'+String(index+1).padStart(2,'0'),exe,['--max-old-space-size=400','--test',noIsolation,byName.get(file)]]);
 const result=[...base,...own,...recovery,...other],assigned=result.flatMap(stage=>stage[2].filter(arg=>arg.endsWith('.test.cjs')));assert.deepEqual(assigned.slice().sort(),files.slice().sort(),'Each actual test file must be assigned exactly once');assert.equal(new Set(assigned).size,files.length);return result;
}
module.exports={augment,applies,validateCatalog,lifeNames,recoveryNames,legacyName};
