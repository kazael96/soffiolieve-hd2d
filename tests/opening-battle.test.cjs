const {test}=require('node:test'),assert=require('node:assert/strict');
const {hint}=require('../src/opening-battle-rules.js');
const {prize,loss}=require('../src/opening-battle-rules.js');
test('first rivals speak after surviving damage, only once, with no multi-Pokemon hint',()=>{
 const messages={17:'damage',20:'last Pokemon low HP'},shown=new Set(),party=[{hp:20,maxhp:20}];
 assert.equal(hint(messages,party,shown),null);
 party[0].hp=19;assert.equal(hint(messages,party,shown),'damage');
 party[0].hp=1;assert.equal(hint(messages,party,shown),null);
 assert.equal(shown.has(20),false);
 party[0].hp=0;assert.equal(hint(messages,party,shown),null);
});
test('original reward uses the last level; scripted opening losses cost nothing',()=>{
 assert.equal(prize({moneyMultiplier:25,party:[{level:5}]}),500);
 assert.equal(prize({moneyMultiplier:25,party:[{level:30},{level:5}]}),500);
 assert.equal(prize(null),0);
 assert.equal(loss([{level:5}],3000,true),0);
 assert.equal(loss([{level:5},{level:7}],3000),56);
 assert.equal(loss([{level:7}],12),12);
});
test('native hint priority consumes all eligible messages and returns the last',()=>{
 const shown=new Set(),messages={17:'damage',18:'half',19:'last',20:'last low'};
 assert.equal(hint(messages,[{hp:0,maxhp:20},{hp:10,maxhp:20}],shown),'last low');
 assert.deepEqual([...shown],[18,17,19,20]);
 assert.equal(hint(messages,[{hp:0,maxhp:20},{hp:1,maxhp:20}],shown),null);
});
