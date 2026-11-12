/* Numerical every-frame proof; native sprites and browser pixels are separate. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
if(process.argv[2])process.env.SOFFIOLIEVE_TEST_SITE=path.resolve(process.argv[2]);
const sourceRoot=process.env.QA_SOURCE_ROOT?path.resolve(process.env.QA_SOURCE_ROOT):null,c=require('./helpers/league-moves-host.cjs').setup({sourceRoot}),layout={p1:{x:250,y:520,height:180,w:1000,h:650},p2:{x:720,y:330,height:130,w:1000,h:650}},rows=[];let pairs=0,frames=0;
for(const [name,ids]of Object.entries(c.TrainingMoves.pairs)){
 const species=c.TRAINING_DATA.progression[name].id;rows.push({name,species,moves:[...ids]});
 for(const id of ids){const profile=c.SpeciesMoves.select(species,id);assert.ok(profile,name+'/'+id);pairs++;
  for(let f=0;f<=profile.frames;f++)for(const side of ['p1','p2'])for(const miss of [false,true]){
   const a=c.SpeciesMoves.sample(profile,f,side,miss),pose=c.SpeciesMoves.pose(profile,f,side,side,miss,layout),reaction=c.BattleReactions.sample(profile,f,side,species,miss);
   for(const record of [a,pose,reaction])if(record)for(const v of Object.values(record).filter(v=>typeof v==='number'))assert.ok(Number.isFinite(v),name+'/'+id+'/'+f+'/'+side);
   if(f===0||f===profile.frames)for(const key of ['reach','crouch','lift','head','tail','arms','feet','lean','breath','gears','twins'])assert.ok(Math.abs(a[key]||0)<1e-7,name+'/'+id+' recovery '+key);
   if(miss||profile.target==='self')assert.equal(reaction,null,name+'/'+id+' missed/self reaction');
   frames++;
  }
 }
}
assert.equal(pairs,3987);assert.equal(rows.length,137);
const report={schema:1,result:'PASS',pairs,species:rows.length,frames,rows,sourceRoot,builtSite:process.env.SOFFIOLIEVE_TEST_SITE,scope:'Numerical every frame, both sides, miss/self reactions, recovery; not GPU or cartridge visual certification'};
if(process.env.QA_REPORT)fs.writeFileSync(process.env.QA_REPORT,JSON.stringify(report,null,2));
console.log('PASS052 numerical choreography:',pairs,'pairs /',rows.length,'records /',frames,'frame-side-outcome samples');
