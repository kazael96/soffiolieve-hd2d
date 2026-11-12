const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {combine}=require('../src/league-geography.js');
function catalog(file,key){const c={window:{}};vm.runInNewContext(fs.readFileSync('src/'+file+'.js','utf8'),c);return c.window[key];}
test('all23 first-ending maps join the same three-family cache without replacing earlier geography',()=>{
 const old=combine({baseScenes:catalog('opelucid-scenes','OPELUCID_SCENES'),baseParts:catalog('opelucid-parts','OPELUCID_PARTS'),scenes:catalog('league-scenes','LEAGUE_SCENES'),parts:catalog('league-parts','LEAGUE_PARTS')});
 const scenes=catalog('finale-scenes','FINALE_SCENES'),parts=catalog('finale-parts','FINALE_PARTS');
 const next=combine({baseScenes:old.scenes,baseParts:old.parts,scenes,parts});
 assert.deepEqual(Object.keys(scenes).map(Number),[137,138,139,140,141,142,143,144,...Array.from({length:15},(_,i)=>264+i)]);
 assert.equal(next.parts.residentLimit,3);assert.equal(Object.keys(parts.families).length,10);
 for(const zone of Object.keys(old.scenes))assert.equal(next.scenes[zone],old.scenes[zone]);
 for(const zone of Object.keys(scenes))assert.equal(!!scenes[zone].outdoor,[137,138,139].includes(+zone));
 for(const zone of [145,147,148,149,150,151,279])assert.equal(next.scenes[zone],undefined,'excluded postgame/link map '+zone);
});
test('real bootstrap prepares native League and castle surfaces lazily and keeps only three resident families',async()=>{
 const {create}=require('./helpers/finale-field-host.cjs'),c=create(),chapter=c.OpelucidChapter;
 assert.equal(chapter.ready,false);
 for(const zone of [137,140,141,142,143,144,264,265,269,273,278]){
  assert.equal(await chapter.ensure(zone),true,'prepare '+zone);
  const scene=chapter.scene(zone);assert.equal(scene.zone,zone);assert.ok(scene.permissionGrids.length,'permissions '+zone);
  const stats=chapter.loader.stats();assert.equal(stats.limit,3);assert.ok(stats.resident.length<=3,'cache bound '+zone);assert.equal(stats.pending.length,0);
 }
 assert.equal(chapter.ready,true);
 assert.equal(c.TRAINING_DATA.levelCap,54);assert.equal(c.TRAINING_DATA.firstEndingPolicy,true);
 for(const flag of c.FINALE_INITIAL_STATE.initialActorFlags)assert.ok(c.NativeStory.state.flags.includes(flag));
});
