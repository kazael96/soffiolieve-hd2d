'use strict';
// Produce reviewable fixture/helper outputs from explicitly declared Game deltas.
// This tool neither edits the source nor grants a PASS to the resulting contract.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const args=Object.fromEntries(process.argv.slice(2).map(arg=>{const m=/^--(repo|source|declarations|out)=(.+)$/.exec(arg);if(!m)throw Error('Use --declarations=FILE --out=NEW_DIRECTORY [--repo=DIR] [--source=DIR]');return[m[1],m[2]];}));
if(!args.declarations||!args.out)throw Error('Explicit declared deltas and a fresh review output directory are required');
const repo=path.resolve(args.repo||path.join(__dirname,'..')),source=path.resolve(args.source||process.env.SOFFIOLIEVE_TEST_SOURCE||path.join(repo,'src')),out=path.resolve(args.out),canonical=s=>s.replace(/\r\n/g,'\n'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
if(fs.existsSync(out))throw Error('Preserve the previous review output; choose a new directory');
const declarations=JSON.parse(canonical(fs.readFileSync(path.resolve(args.declarations),'utf8')));if(!Array.isArray(declarations)||!declarations.length)throw Error('Expected an explicit ordered delta array');
const operations=declarations.filter(op=>op.file==='game.js');if(!operations.length)throw Error('No declared Game deltas');
for(const op of operations)if(typeof op.before!=='string'||!op.before||typeof op.after!=='string'||!op.after||typeof op.purpose!=='string'||!op.purpose||!Number.isInteger(op.count??1)||(op.count??1)<1)throw Error('Each Game delta requires before, after, count and review purpose');
const current=canonical(fs.readFileSync(path.join(source,'game.js'),'utf8')),baseline=canonical(fs.readFileSync(path.join(repo,'tests/fixtures/minccino-slap-reference064/game-preclear064.js'),'utf8'));let restored=current;const steps=[];
assert.equal(sha(baseline),'3b1a8610e90ca91838c0037bc7d6753adf6eee9d984029d7d8c5bdb233af5a23','The original Game baseline fixture must not change');
for(const op of operations.slice().reverse()){const count=op.count??1;assert.equal(restored.split(op.after).length-1,count,'Declared inverse count mismatch: '+op.purpose);restored=restored.split(op.after).join(op.before);steps.push({group:op.group||'declared',purpose:op.purpose,remove:op.after,restore:op.before,count,outputLF_SHA256:sha(restored)});}
assert.equal(restored,baseline,'Declared changes must invert every source byte to the untouched original fixture');
const contract={schema:1,scope:'Explicitly reviewed Game changes only; no source execution or PASS transfer',candidateLF_SHA256:sha(current),baselineLF_SHA256:sha(baseline),steps},metadata=JSON.stringify(contract,null,2)+'\n';
let helper=canonical(fs.readFileSync(path.join(repo,'tests/helpers/c11-game-inversion064.cjs'),'utf8'));const pin=/if\(sha\(raw\)!=='[0-9a-f]{64}'\)/g;assert.equal([...helper.matchAll(pin)].length,1,'Expected exactly one metadata pin');helper=helper.replace(pin,"if(sha(raw)!=='"+sha(metadata)+"')");
fs.mkdirSync(path.join(out,'tests/fixtures'),{recursive:true});fs.mkdirSync(path.join(out,'tests/helpers'),{recursive:true});fs.writeFileSync(path.join(out,'tests/fixtures/c11-game-delta064.json'),metadata);fs.writeFileSync(path.join(out,'tests/helpers/c11-game-inversion064.cjs'),helper);
fs.writeFileSync(path.join(out,'review.json'),JSON.stringify({status:'PREPARED_NOT_TESTED_REVIEW_AND_REGRESSIONS_REQUIRED',sourceGameLF_SHA256:sha(current),baselineLF_SHA256:sha(baseline),declaredDeltas:operations.length,metadataLF_SHA256:sha(metadata),helperLF_SHA256:sha(helper),sourceEdited:false,baselineEdited:false},null,2)+'\n');
console.log('Prepared explicit Game inverse contract for review. Run its positive/body-mutation controls and full compatibility before integration.');
