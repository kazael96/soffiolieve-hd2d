/* Exhaustive numerical choreography coverage; browser evidence remains separate. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{environment}=require('./check-story-runtime.cjs');
const c=environment({castelia:true,sourceRoot:process.env.QA_SOURCE_ROOT}),site=path.resolve(process.argv[2]||'_site');
for(const f of ['purrloin-moves','demo-moves','chapter-moves','route3-moves','species-moves','tepig-moves','oshawott-moves','patrat-moves','lillipup-moves','training-moves','battle-reactions']){const source=process.env.QA_SOURCE_ROOT&&path.join(process.env.QA_SOURCE_ROOT,f+'.js');vm.runInContext(fs.readFileSync(source&&fs.existsSync(source)?source:path.join(site,f+'.js'),'utf8'),c,{filename:f});}
const layout={p1:{x:250,y:520,height:180,w:1000,h:650},p2:{x:720,y:330,height:130,w:1000,h:650}};let count=0;
for(const [name,row]of Object.entries(c.TRAINING_DATA.progression))for(const id of c.Training.moves(name)){
 const p=c.SpeciesMoves.select(row.id,id);assert.ok(p,`${name}/${id}`);count++;
 for(let f=0;f<=p.frames;f++)for(const side of ['p1','p2'])for(const miss of [false,true]){
  const sample=c.SpeciesMoves.sample(p,f,side,miss),pose=c.SpeciesMoves.pose(p,f,side,side,miss,layout),reaction=c.BattleReactions.sample(p,f,side,row.id,miss);
  for(const data of [sample,pose,reaction])if(data)for(const n of Object.values(data).filter(v=>typeof v==='number'))assert.ok(Number.isFinite(n),`${name}/${id}/${f}/${side}`);
  if(f===0||f===p.frames)for(const k of ['reach','crouch','lift','head','tail','arms','feet','lean','breath'])assert.ok(Math.abs(sample[k]??0)<1e-7,`${name}/${id} recovery ${k}`);
 }
}
assert.equal(Object.keys(c.TRAINING_DATA.progression).length,44);console.log(`PASS Castelia choreography: ${count} pairs /44species; every frame, both sides, misses, reactions, recovery.`);
