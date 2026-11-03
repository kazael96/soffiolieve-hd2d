/* Every frame and outcome is numerical evidence; original sprite/battle QA is separate. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const site=path.resolve(process.argv[2]||'_site'),root=path.resolve(__dirname,'..'),source=process.env.QA_SOURCE_ROOT&&path.resolve(process.env.QA_SOURCE_ROOT),c={console,Buffer,TextEncoder,TextDecoder,structuredClone};c.window=c;vm.createContext(c);
const read=f=>fs.readFileSync(source&&fs.existsSync(path.join(source,f))?path.join(source,f):path.join(site,f),'utf8');
for(const f of ['assets/battle-data.js','battle-sim.js','training-data.js','mistralton-data.js','pokemon-visuals.js','training.js'])vm.runInContext(read(f),c,{filename:f});
for(const k of ['evolutions','progression','pokemonData','compatibility','machines'])Object.assign(c.TRAINING_DATA[k],c.MISTRALTON_DATA[k]);c.TRAINING_DATA.levelCap=35;
for(const f of ['purrloin-moves','demo-moves','chapter-moves','route3-moves','species-moves','tepig-moves','oshawott-moves','patrat-moves','lillipup-moves','training-moves','battle-reactions'])vm.runInContext(read(f+'.js'),c,{filename:f});
const layout={p1:{x:250,y:520,height:180,w:1000,h:650},p2:{x:720,y:330,height:130,w:1000,h:650}},rows=[];let count=0;
for(const [name,row]of Object.entries(c.TRAINING_DATA.progression)){
 const moves=Array.from(c.Training.moves(name));rows.push({name,species:row.id,graphic:c.PokemonVisuals.graphic({name,id:row.id,form:row.form}),moves});
 for(const id of moves){
  const p=c.SpeciesMoves.select(row.id,id);assert.ok(p,`${name}/${id}`);count++;
  for(let f=0;f<=p.frames;f++)for(const side of ['p1','p2'])for(const miss of [false,true]){
   const a=c.SpeciesMoves.sample(p,f,side,miss),pose=c.SpeciesMoves.pose(p,f,side,side,miss,layout),reaction=c.BattleReactions.sample(p,f,side,row.id,miss);
   for(const v of [a,pose,reaction])if(v)for(const x of Object.values(v).filter(v=>typeof v==='number'))assert.ok(Number.isFinite(x),`${name}/${id}/${f}/${side}`);
   if(f===0||f===p.frames)for(const k of ['reach','crouch','lift','head','tail','arms','feet','lean','breath','gears'])assert.ok(Math.abs(a[k]??0)<1e-7,`${name}/${id} recovery ${k}`);
   if(miss||p.target==='self')assert.equal(reaction,null,`${name}/${id} reaction on missed/self move`);
  }
 }
}
for(const [graphic,base]of [[699,550],[701,585],[702,585],[703,585],[704,586],[705,586],[706,586],['521-female',521],['592-female',592]])for(const id of c.Training.moves(c.GEN5.species.find(p=>p.id===base).en))assert.equal(c.SpeciesMoves.select(graphic,id)?.species,base,`${graphic}/${id}`);
for(const name of ['Pidove','Tranquill','Unfezant','Woobat','Swoobat','Ducklett','Swanna','Sigilyph'])assert.ok(c.Training.moves(name).includes(19),name+' native Fly');
assert.ok(!c.Training.moves('Archen').includes(19),'Native Archen cannot learn Fly before evolving');
assert.ok(c.Training.moves('Excadrill').includes(523));assert.ok(!c.Training.moves('Tynamo').includes(19));assert.equal(c.SpeciesMoves.select(521,19,{preparing:true}).target,'self');assert.equal(c.SpeciesMoves.select(521,19,{preparing:false}).target,'foe');
const report={count,species:rows.length,rows,proof:'Numerical every-frame/side/miss/recovery, not visual certification'};
if(process.env.QA_REPORT){fs.mkdirSync(path.dirname(process.env.QA_REPORT),{recursive:true});fs.writeFileSync(process.env.QA_REPORT,JSON.stringify(report,null,2));}
console.log(`PASS Ponentopoli choreography: ${count} pairs / ${rows.length} species and forms; every frame, both sides, misses, reactions and recovery.`);
