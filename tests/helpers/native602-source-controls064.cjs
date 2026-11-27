'use strict';
// Loader-only controlled variants. Runtime files are always read from src/env.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {repo,sourceRoot,sourcePath}=require('./minccino-slap-paths064.cjs'),sha=s=>crypto.createHash('sha256').update(s).digest('hex'),canonical=s=>s.replace(/\r\n/g,'\n');
const meta=canonical(fs.readFileSync(path.join(__dirname,'../fixtures/native602-control-deltas064.json'),'utf8'));
if(sha(meta)!=='b40b11b4bc3925d07671c4eb15aa68eec4318e0da4c69e769373f1e91b1c7181')throw Error('Declared native602 control delta metadata changed');
const contract=JSON.parse(meta),source=file=>canonical(fs.readFileSync(sourcePath(file),'utf8'));
function replace(text,from,to,count=1){assert.equal(text.split(from).length-1,count,'Native602 control must match the exact declared delta count');return text.split(from).join(to);}
function section(text,start,end){const a=text.indexOf(start),b=text.indexOf(end,a);assert(a>=0&&b>a,'Shared full-silhouette helper section unavailable');return text.slice(a,b);}
function read(file,variant='candidate'){
 const current=source(file);if(!['candidate','common','base'].includes(variant))throw Error('Unknown native602 control variant');if(variant==='candidate')return current;
 if(variant==='common'){
  if(file!=='battle-ground.js')return current;assert.equal(section(current,contract.slotStart,contract.slotEnd),contract.densitySlot,'Density policy changed: review and update only its declared control delta');const controlled=replace(current,contract.densitySlot,contract.commonSlot);assert.equal(replace(controlled,contract.commonSlot,contract.densitySlot),current);return controlled;
 }
 if(!['game.js','battle-ground.js','double-battles.js'].includes(file))return current;
 let controlled=current,shared=null;if(file==='battle-ground.js'){shared=section(current,contract.fullStart,contract.fullEnd);controlled=replace(controlled,shared,'');}
 const inverse=contract.operations.filter(op=>op.file===file).slice().reverse();assert(inverse.length,'Missing declared native602 inverse');for(const op of inverse)controlled=replace(controlled,op.after,op.before,op.count);
 if(shared){controlled=replace(controlled,contract.fullEnd,shared+contract.fullEnd);assert.equal(section(controlled,contract.fullStart,contract.fullEnd),shared,'Every control must retain the identical current full-silhouette helper bytes');}
 // Prove the baseline differs only by the reviewed602 changes, even if an
 // unrelated future C11 correction changes other current source bytes.
 let forward=controlled;if(shared)forward=replace(forward,shared,'');for(const op of inverse.slice().reverse())forward=replace(forward,op.before,op.after,op.count);if(shared)forward=replace(forward,contract.fullEnd,shared+contract.fullEnd);assert.equal(forward,current,'Native602 inverse/forward must restore all current source bytes');return controlled;
}
module.exports={repo,sourceRoot,sourcePath,read};
