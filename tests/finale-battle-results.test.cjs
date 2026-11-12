/* Real VM/result callback; outcomes supplied explicitly, not a combat test. */
const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/finale-field-host.cjs');
test('native379/380 distinguish caught, KO, loss and escape rather than treating every win as a catch',async()=>{
 const c=await setup(),n=c.NativeStory.state,vm=c.NativeStory.vm,bank=9002;
 vm.data.scripts[bank]={entries:[0],supportedEntries:[0],code:{0:{op:379,name:'NativeOpcode379',args:[0x8010],end:4},4:{op:380,name:'NativeOpcode380',args:[0x8011],end:8},8:{op:2,name:'VMHalt',args:[],end:10}}};
 for(const [winner,receipt,result,proceed,capture]of [
  ['Alcide',{},1,1,2],['Avversario',{},2,0,1],['Alcide',{escaped:true},3,1,1],['Alcide',{captured:{name:'Reshiram'}},5,1,0],['',{},0,0,1]
 ]){
  assert.equal(c.NativeStory.battleDone({battle:{winner}},'wild',receipt),false);
  await drain(c,vm.run(bank,0));assert.equal(n.battleResult,result);assert.equal(n.vars[0x8010],proceed);assert.equal(n.vars[0x8011],capture);
 }
});
test('capture registration and Box transfer deliver the catch result to the native host after storage succeeds',async()=>{
 const c=await setup(),n=c.NativeStory.state;
 while(c.Journey.state.party.length<6)c.Journey.state.party.push(c.Journey.pack(c.makeMon('Serperior',50)));
 const session=new c.GEN5.Session(c.Journey.configs(),[{name:'Reshiram',level:50}],{enemyName:'Pokémon selvatico',seed:[1,2,3,4]});
 c.configureOpeningBattle(session,{});c.Journey.attachBattle(session,'wild');session.battle.win('p1');
 const caught=c.makeMon('Reshiram',50);caught.ballId=1;
 await drain(c,c.Journey.afterBattle(session,'wild',caught,false));
 assert.equal(n.battleResult,5);assert.equal(n.won,true);assert.equal(c.Journey.state.party.length,6);
 const boxed=c.Journey.state.storage.boxes.flat().filter(Boolean);assert.equal(boxed.length,1);assert.equal(boxed[0].name,'Reshiram');assert.equal(boxed[0].ballId,1);assert.ok(c.Journey.state.dex.caught.includes('Reshiram'));assert.equal(c.Journey.processing,false);
});
