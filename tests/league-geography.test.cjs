const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{combine}=require('../src/league-geography.js');
function read(name,key){const c={window:{}};vm.runInNewContext(fs.readFileSync('src/'+name,'utf8'),c);return c.window[key];}
function fixture(){const baseScenes=read('opelucid-scenes.js','OPELUCID_SCENES'),baseParts=read('opelucid-parts.js','OPELUCID_PARTS');return {baseScenes,baseParts,scenes:{121:{family:'drayden',sourceMatrix:66},214:{family:'victoryOutside',sourceMatrix:162}},parts:{residentLimit:3,families:{drayden:{zones:[121]},victoryOutside:{zones:[214]}},zoneFamily:{121:'drayden',214:'victoryOutside'}}};}
test('all existing geographic descriptor identities survive extension under one resident budget',()=>{
 const f=fixture(),before=JSON.stringify(f),joined=combine(f);for(const zone of Object.keys(f.baseScenes))assert.equal(joined.scenes[zone],f.baseScenes[zone]);for(const zone of [120,123,132])assert.equal(joined.scenes[zone],f.baseScenes[zone]);
 assert.equal(joined.parts.residentLimit,3);assert.equal(joined.parts.families.drayden,f.parts.families.drayden);assert.equal(Object.keys(joined.scenes).length,Object.keys(f.baseScenes).length+2);assert.equal(JSON.stringify(f),before);
});
test('overwriting shared geometry or ownership and increasing the cache budget fail before any installation',()=>{
 let f=fixture();f.scenes[120]={family:'drayden'};f.parts.families.drayden.zones.push(120);f.parts.zoneFamily[120]='drayden';assert.throws(()=>combine(f),/sostituisce/);
 f=fixture();f.parts.residentLimit=6;assert.throws(()=>combine(f),/incompleto/);
 f=fixture();f.parts.families.opelucid=f.parts.families.drayden;delete f.parts.families.drayden;f.scenes[121].family='opelucid';f.parts.zoneFamily[121]='opelucid';assert.throws(()=>combine(f),/già posseduta/);
});
test('missing, duplicate and phantom zone assignments cannot create a partially registered chapter',()=>{
 const mutations=[f=>delete f.parts.zoneFamily[121],f=>f.parts.families.drayden.zones.push(121),f=>f.parts.zoneFamily[145]='drayden',f=>delete f.scenes[214]];
 for(const mutate of mutations){const f=fixture();mutate(f);assert.throws(()=>combine(f),/geografic[oa]/);}
});
