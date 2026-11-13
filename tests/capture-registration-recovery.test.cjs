/* Real capture-delivery host with supplied battle outcome and Pokedex output
 * fault injection. This does not certify the capture animation or combat. */
const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/finale-field-host.cjs');
test('a temporary Pokedex failure retries registration without recording or rewarding the capture twice',async()=>{
 const c=await setup(),j=c.Journey,n=c.NativeStory.state;n.pokedex=true;let attempts=0,gates=0;
 c.Pokedex.entry=async()=>{attempts++;if(attempts===1)throw Error('temporary dex image failure');};
 c.renderer.resourceGate=async(key,load)=>{gates++;assert.equal(key,'capture-register-Reshiram');try{return await load();}catch(error){assert.match(error.message,/temporary dex/);return load();}};
 const s=new c.GEN5.Session(j.configs(),[{name:'Reshiram',level:50}],{enemyName:'Pokémon selvatico',seed:[1,2,3,4]});c.configureOpeningBattle(s,{});j.attachBattle(s,'wild');s.battle.win('p1');
 const before=j.state.party.length,ball=c.makeMon('Reshiram',50);ball.ballId=1;
 await drain(c,j.afterBattle(s,'wild',ball,false));
 assert.equal(attempts,2);assert.equal(gates,1);assert.equal(j.state.party.length,before+1);assert.equal(j.state.party.filter(p=>p.name==='Reshiram').length,1);assert.equal(j.state.dex.caught.filter(name=>name==='Reshiram').length,1);assert.equal(n.battleResult,5);assert.equal(j.processing,false);
});
