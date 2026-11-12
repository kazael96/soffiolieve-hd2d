const test=require('node:test'),assert=require('node:assert/strict');
const {setup,drain}=require('./helpers/finale-field-host.cjs');
test('actual trainer battle notifications record first-ending wins only after completion and preserve losses',async()=>{
 const c=await setup(),n=c.NativeStory.state,m=c.NativeStory.vm;
 for(const id of [228,230,229,231]){
  assert.equal(n.firstEndingWins?.includes(id)||false,false);
  await drain(c,m.host.command({name:'CallTrainerBattle'},[id,0,0],[id,0,0],m),0,'p1');
  assert.ok(n.firstEndingWins.includes(id));
 }
 assert.equal(c.Training.limit(n),50,'native flags also required');
 n.flags.push(2409,2410,2411,2412);assert.equal(c.Training.limit(n),52);
 await drain(c,m.host.command({name:'CallTrainerBattle'},[587,0,0],[587,0,0],m),0,'p2');
 assert.equal(n.firstEndingWins.includes(587),false);assert.equal(c.Training.limit(n),52);
 await drain(c,m.host.command({name:'CallTrainerBattle'},[587,0,0],[587,0,0],m),0,'p1');
 assert.ok(n.firstEndingWins.includes(587));assert.equal(c.Training.limit(n),52,'phase4 is owned by the native event');
 n.vars[16566]=4;assert.equal(c.Training.limit(n),54);
});
