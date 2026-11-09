const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../src'),c={};c.window=c;vm.createContext(c);for(const name of ['opelucid-field-motion-data.js','opelucid-actor-motion.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),c);
test('both dragons use their native looping idle and wing programs rather than human directional cells',()=>{
 for(const model of [211,213]){const seen=new Set(),idle=new Set();for(let tick=0;tick<500;tick++){const standing=c.OpelucidActorMotion.visual({model},tick/30),flying=c.OpelucidActorMotion.visual({model,nativeDragonFlight:true},tick/30);idle.add(standing.frame);seen.add(flying.frame);assert.ok(![4,5,6,14].includes(flying.frame),'unrelated human/padding cell');}assert.deepEqual([...idle].sort((a,b)=>a-b),[0,1,2,3]);assert.ok([7,8,9,10,11,13].every(frame=>seen.has(frame)));}
 assert.equal(c.OpelucidActorMotion.visual({model:7},100),null);
});
test('native loop markers repeat the tail while retaining introduction and held frames',()=>{
 const p={steps:[[1,2],[2,3],[3,4]],loop:1},sample=c.OpelucidActorMotion.sample;assert.equal(sample(p,0),1);assert.equal(sample(p,1.99),1);assert.equal(sample(p,2),2);assert.equal(sample(p,5),3);assert.equal(sample(p,9),2);assert.equal(sample(p,12),3);assert.equal(sample({steps:p.steps,loop:null},500),3);
});
test('dragon world size follows the64px native bitmap rather than the32px character default',()=>{
 for(const model of [211,213]){const b=fs.readFileSync(path.join(root,'assets/opelucid/actor-'+model+'-0.png')),v=c.OpelucidActorMotion.visual({model},0);assert.equal(v.worldWidth,b.readUInt32BE(16)/16);assert.equal(v.worldHeight,b.readUInt32BE(20)/16);assert.equal(v.worldHeight,4);}
});
