const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {setup}=require('./helpers/finale-moves-host.cjs');
test('the previous registration rejects newly exposed54-cap pairs explicitly',()=>{assert.throws(()=>setup({withoutFinale:true}),/Coreografia non definita|Anatomia non definita/);});
test('4365 legal pairs retain species identity, fitted attachments and finite poses on both sides',()=>{
 const c=setup();assert.equal(Object.keys(c.TrainingMoves.pairs).length,147);assert.equal(Object.values(c.TrainingMoves.pairs).reduce((n,ids)=>n+ids.length,0),4365);
 for(const [name,ids]of Object.entries(c.TrainingMoves.pairs))for(const id of ids){
  const sid=c.TRAINING_DATA.progression[name].id,p=c.SpeciesMoves.select(sid,id);assert.equal(p.species,sid,name+'/'+id);
  const rig=c.ChapterMoves.rigs[p.graphic]||c.ChapterMoves.rigs[sid]||c.DemoMoves.rigs[sid];assert.ok(rig,name);if(p.chapter)assert.ok(Array.isArray(rig[p.attachment]),name+'/'+id+'/'+p.attachment);
  for(const side of ['p1','p2'])for(const f of [0,p.impact,p.frames]){const a=c.SpeciesMoves.sample(p,f,side,false);for(const n of Object.values(a).filter(n=>typeof n==='number'))assert.ok(Number.isFinite(n),name+'/'+id);if(f===0||f===p.frames)for(const k of ['reach','crouch','lift','head','tail','arms','feet','mane','sideHeads','wings','flame'])assert.ok(Math.abs(a[k]||0)<1e-7,name+'/'+id+'/'+k);}
 }
});
test('ten native limb maps never assign one tile to two joints and use actual tracks on either side',()=>{
 const c=setup();assert.equal(Object.keys(c.FinaleMotion.rows).length,10);
 for(const [sid,sides]of Object.entries(c.FinaleMotion.parts))for(const [side,map]of Object.entries(sides)){
  const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../src/assets/animated',sid+'-'+side+'.json'),'utf8')),native=new Set(data.maps.flatMap(rows=>rows.map(r=>r[0]))),tracks=Object.values(map).flat();
  assert.equal(tracks.length,new Set(tracks).size,sid+'/'+side+' duplicated joint');for(const track of tracks)assert.ok(native.has(track),sid+'/'+side+'/'+track);
 }
});
test('both legendary fusion moves charge the body and tail, Chandelure casts fire from its flame',()=>{
 const c=setup();for(const [sid,id]of [[643,558],[644,559]])for(const side of ['p1','p2']){const p=c.SpeciesMoves.select(sid,id),a=c.SpeciesMoves.sample(p,p.frames*.42,side);assert.equal(p.attachment,'body');assert.ok(a.breath>0);assert.ok(Math.abs(a.tail)>0);}
 assert.equal(c.SpeciesMoves.select(609,126).attachment,'flamePoint');assert.equal(c.SpeciesMoves.select(630,198).attachment,'bonePoint');
 for(const sid of [579,609,635]){const name=Object.keys(c.TrainingMoves.pairs).find(n=>c.TRAINING_DATA.progression[n].id===sid),p=c.SpeciesMoves.select(sid,c.TrainingMoves.pairs[name][0]);assert.equal(c.SpeciesMoves.sample(p,p.impact,'p1').feet,0);}
});
