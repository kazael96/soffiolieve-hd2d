const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{setup}=require('./helpers/league-moves-host.cjs');
test('chapter052 retains every earlier machine and compatible species pair',()=>{
 const c=setup(),previous={};require('node:vm').runInNewContext(fs.readFileSync(path.join(__dirname,'../src/opelucid-data.js'),'utf8'),{window:previous});
 for(const [item,move]of Object.entries(previous.OPELUCID_DATA.machines)){
  assert.equal(c.LEAGUE_DATA.machines[item],move,'lost earlier machine '+item);
  for(const [name,items]of Object.entries(previous.OPELUCID_DATA.compatibility))if(items.includes(+item))assert.ok(c.LEAGUE_DATA.compatibility[name]?.includes(+item),'lost compatible machine '+name+'/'+item);
 }
});
test('the earlier choreography registration fails explicitly on the newly exposed level50 move',()=>{
 assert.throws(()=>setup({withoutLeague:true}),/Coreografia non definita: Munna \/ 500/);
});
test('all3987 legal pairs on137 records register with their own species identity, rig and authored emission point',()=>{
 const c=setup();assert.equal(Object.keys(c.TrainingMoves.pairs).length,137);assert.equal(Object.values(c.TrainingMoves.pairs).reduce((sum,ids)=>sum+ids.length,0),3987);
 for(const [name,ids]of Object.entries(c.TrainingMoves.pairs))for(const id of ids){const species=c.TRAINING_DATA.progression[name].id,p=c.SpeciesMoves.select(species,id);assert.ok(p,name+'/'+id);assert.equal(p.species,species);const rig=c.ChapterMoves.rigs[species]||c.DemoMoves.rigs[species];assert.ok(rig,name);if(p.chapter)assert.ok(Array.isArray(rig[p.attachment]),name+'/'+id+'/'+p.attachment);}
});
test('thirteen authored limb maps reference real non-overlapping native tracks on both sides',()=>{
 const c=setup();assert.equal(Object.keys(c.LeagueMotion.rows).length,13);
 for(const [id,sides]of Object.entries(c.LeagueMotion.parts))for(const [side,map]of Object.entries(sides)){
  const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../src/assets/animated',id+'-'+side+'.json'),'utf8')),native=new Set(data.maps.flatMap(rows=>rows.map(row=>row[0]))),tracks=Object.values(map).flat();
  assert.equal(tracks.length,new Set(tracks).size,id+'/'+side+' duplicated limb');for(const track of tracks)assert.ok(native.has(track),id+'/'+side+'/'+track);
 }
});
test('two-headed dragon gestures, opposing gears and supporting columns remain species-specific on either side',()=>{
 const c=setup();for(const side of ['p1','p2']){
  const p=c.SpeciesMoves.select(634,458),a=c.SpeciesMoves.sample(p,p.impact,side),left=c.SpeciesMoves.part(1,false,a),right=c.SpeciesMoves.part(0,false,a);assert.notEqual(left.rotation,right.rotation);assert.equal(a.arms,0);
  const gear=c.SpeciesMoves.select(601,508),spin=c.SpeciesMoves.sample(gear,gear.frames*.37,side);assert.ok(Math.abs(spin.gears)>0);assert.equal(c.SpeciesMoves.part(1,false,spin).rotation,-c.SpeciesMoves.part(2,false,spin).rotation);assert.equal(gear.attachment,'body');
  const punch=c.SpeciesMoves.select(534,359);assert.equal(punch.attachment,'hand');
  for(const id of [143,264]){const name=Object.keys(c.TrainingMoves.pairs).find(name=>c.TrainingMoves.pairs[name].includes(id)),species=c.TRAINING_DATA.progression[name].id,prepared=c.SpeciesMoves.select(species,id,{preparing:true});assert.equal(prepared.target,'self');assert.equal(prepared.damage,false);}
  for(const id of [584,589,601,617]){const move=c.TrainingMoves.pairs[c.GEN5.species.find(p=>p.id===id).en][0],profile=c.SpeciesMoves.select(id,move);assert.equal(c.SpeciesMoves.sample(profile,profile.impact,side).feet,0);}
 }
});

test('Dragon Tail uses a fitted tail contact instead of a mouth, leaf, or wing point on all eleven legal species',()=>{
 const c=setup(),names=Object.keys(c.TrainingMoves.pairs).filter(name=>c.TrainingMoves.pairs[name].includes(525));assert.equal(names.length,11);
 for(const name of names){const id=c.TRAINING_DATA.progression[name].id,p=c.SpeciesMoves.select(id,525),r=c.ChapterMoves.rigs[id]||c.DemoMoves.rigs[id];assert.equal(p.attachment,'tailPoint');assert.ok(r.tailPoint[0]<0&&r.tailPoint[1]<0);assert.notDeepEqual(r.tailPoint,r.mouth);}
});
