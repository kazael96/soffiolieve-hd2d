const test=require('node:test'),assert=require('node:assert/strict');
const bag=require('../src/battle-bag.js'),medicine=require('../src/battle-medicine.js'),capture=require('../src/capture-rules.js');
test('the native Master Ball gift and eight-badge medicines are selectable in the battle bag',()=>{
 assert.deepEqual(bag.inventory('balls',id=>id===1?1:0),[{id:1,count:1}]);
 assert.deepEqual(bag.inventory('medicine',id=>[23,24,29].includes(id)?1:0).map(r=>r.id),[23,24,29]);
});
test('Master Ball follows overlay93 early success: three shakes, no critical catch or RNG',()=>{
 for(const hp of [1,100])for(const caught of [0,649]){
  const result=capture.roll({hp,maxhp:100,status:''},3,()=>{throw Error('Master Ball used ordinary RNG');},caught,1,{ballId:1});
  assert.equal(result.caught,true);assert.equal(result.shakes,3);assert.equal(result.critical,false);
 }
});
function target(hp=1,status='brn'){
 const p={hp,maxhp:101,status,volatiles:{confusion:{}},moveSlots:[{pp:0,maxpp:20}],side:{pokemonLeft:4},fainted:hp===0,faintQueued:hp===0,
  sethp(value){this.hp=value;},cureStatus(){this.status='';},removeVolatile(key){delete this.volatiles[key];},getHealth(){return this.hp;}};
 const events=[],battle={add(...args){events.push(args);},eachEvent(name){events.push([name]);}};return {p,battle,events};
}
test('Full Restore heals and clears status/confusion, including status-only use, without restoring PP',()=>{
 for(const hp of [1,101]){const {p,battle}=target(hp);assert.equal(medicine.apply(battle,23,p),true);assert.equal(p.hp,101);assert.equal(p.status,'');assert.equal(p.volatiles.confusion,undefined);assert.equal(p.moveSlots[0].pp,0);assert.equal(medicine.apply(battle,23,p),false);}
 const {p,battle}=target(101,'');assert.equal(medicine.apply(battle,23,p),true,'confusion alone must be cured');assert.equal(medicine.canUse(23,target(0).p),false);
});
test('Max Potion preserves status and PP; Max Revive restores full odd HP only on a fainted Pokémon',()=>{
 const {p,battle}=target();assert.equal(medicine.apply(battle,24,p),true);assert.equal(p.hp,101);assert.equal(p.status,'brn');assert.ok(p.volatiles.confusion);assert.equal(p.moveSlots[0].pp,0);assert.equal(medicine.apply(battle,24,p),false);
 for(const [id,hp]of [[28,50],[29,101]]){const f=target(0,'');assert.equal(medicine.apply(f.battle,id,f.p),true);assert.equal(f.p.hp,hp);assert.equal(f.p.fainted,false);assert.equal(f.p.faintQueued,false);assert.equal(f.p.side.pokemonLeft,5);assert.equal(f.p.moveSlots[0].pp,0);assert.equal(medicine.apply(f.battle,id,f.p),false);assert.equal(f.p.side.pokemonLeft,5);}
});
test('field medicines consume once, preserve PP, reject ineffective use and survive real save normalization',async()=>{
 const c=await require('./helpers/league-field-host.cjs').setup(),j=c.Journey;
 j.state.starter='Snivy';j.state.party=[j.pack(c.makeMon('Snivy',50),c.OPENING_DATA.Snivy.growth[50])];
 for(const id of [23,24,29]){const p=j.state.party[0],max=j.unpack(p).max;p.hp=id===29?0:1;p.status=id===23?'tox':'';p.pp[0].left=0;assert.ok(j.addItem(id,1));const before=j.itemCount(id);assert.equal(j.useMedicine(0,id),true);assert.equal(p.hp,max);assert.equal(p.status,'');assert.equal(p.pp[0].left,0);assert.equal(j.itemCount(id),before-1);assert.equal(j.useMedicine(0,id),false);assert.equal(j.itemCount(id),before-1);const saved=c.StoryState.read(c.localStorage);assert.equal(saved.party[0].hp,max);assert.equal(saved.party[0].pp[0].left,0);}
 for(const id of [1,23,24,29,49]){assert.ok(j.addItem(id,1));assert.equal(j.giveItem(id,0),true,'cannot hold native item '+id);assert.equal(c.StoryState.read(c.localStorage).party[0].heldItem,id,'held item lost '+id);assert.equal(j.takeItem(0),id);}
});
test('the obtainable Calcium uses Gen V per-stat100 and total510 EV limits',async()=>{
 const c=await require('./helpers/league-field-host.cjs').setup(),j=c.Journey;j.state.starter='Snivy';j.state.party=[j.pack(c.makeMon('Snivy',50),1000)];const p=j.state.party[0];p.evs={hp:100,atk:100,def:100,spe:100,spa:95,spd:10};assert.ok(j.addItem(49,2));const before=j.itemCount(49);assert.equal(j.useVitamin(0,49),true);assert.equal(p.evs.spa,100);assert.equal(Object.values(p.evs).reduce((a,b)=>a+b,0),510);assert.equal(j.itemCount(49),before-1);assert.equal(j.useVitamin(0,49),false);assert.equal(j.itemCount(49),before-1);assert.equal(c.StoryState.read(c.localStorage).party[0].evs.spa,100);
});
