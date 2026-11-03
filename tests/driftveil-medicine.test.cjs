const {test}=require('node:test'),assert=require('node:assert/strict'),medicine=require('../src/battle-medicine.js');
test('Gen V X Attack raises Attack by one only on a conscious active Pokemon below +6',()=>{
 const p={hp:10,maxhp:20,isActive:true,boosts:{atk:5,def:0}},calls=[],battle={boost(change,who){calls.push(change);for(const [stat,n]of Object.entries(change))who.boosts[stat]+=n;}};
 assert.equal(medicine.canUse(57,p),true);assert.equal(medicine.apply(battle,57,p),true);assert.deepEqual(calls,[{atk:1}]);assert.equal(p.boosts.atk,6);assert.equal(p.boosts.def,0);assert.equal(medicine.canUse(57,p),false);assert.equal(medicine.apply(battle,57,p),false);p.boosts.atk=0;p.isActive=false;assert.equal(medicine.canUse(57,p),false);p.isActive=true;p.hp=0;assert.equal(medicine.canUse(57,p),false);assert.equal(calls.length,1);
});
