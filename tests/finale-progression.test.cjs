const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../src/finale-progression.js');
const fs=require('node:fs'),vm=require('node:vm');
function training(){const text=fs.readFileSync('src/finale-data.js','utf8'),data=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));const context={TRAINING_DATA:{levelCap:data.levelCap,capSteps:data.capSteps,firstEndingPolicy:true},FinaleProgression:policy};context.window=context;vm.runInNewContext(fs.readFileSync('src/training.js','utf8'),context);return context;}
test('fresh eighth-badge approach stays50 and prebattle Elite Four flags cannot unlock52',()=>{
 const s={flags:[2409,2410,2411,2412],vars:{},firstEndingWins:[228,229,230]};
 assert.equal(policy.limit({}),50);assert.equal(policy.limit(s),50);policy.recordBattle(s,231,false);assert.equal(policy.limit(s),50);
 policy.recordBattle(s,231,true);assert.equal(policy.limit(s),52);
});
test('native Castle opening unlocks N52, caught preparation phase5 stays52, victory phase4 unlocks54',()=>{
 const s={flags:[185],vars:{16566:0}};assert.equal(policy.limit(s),52);
 for(const phase of [1,2,3,5]){s.vars[16566]=phase;assert.equal(policy.limit(s),52);}
 for(const phase of [4,6]){s.vars[16566]=phase;assert.equal(policy.limit(s),54);}
 assert.equal(policy.limit(s,50),50);
});
test('postgame parties, White N and failed or duplicate results do not produce new first-ending wins',()=>{
 const s={firstEndingWins:[228,228,999,586,'231',null],flags:[],vars:{}};policy.normalize(s);assert.deepEqual(s.firstEndingWins,[228]);
 for(const id of [407,563,564,565,566,586,591])assert.equal(policy.recordBattle(s,id,true),false);
 assert.equal(policy.recordBattle(s,587,false),false);assert.equal(policy.recordBattle(s,587,1),false);assert.deepEqual(s.firstEndingWins,[228]);
 policy.recordBattle(s,587,true);policy.recordBattle(s,587,true);assert.deepEqual(s.firstEndingWins,[228,587]);
});
test('native round reset removes the flags required for an old set of Elite Four results',()=>{
 const s={flags:[],vars:{},firstEndingWins:[228,229,230,231]};assert.equal(policy.limit(s),50);
 assert.equal(policy.enter(s,136),true);assert.deepEqual(s.firstEndingWins,[]);
 s.flags=[2409,2410,2411,2412];for(const id of [228,229,230])policy.recordBattle(s,id,true);assert.equal(policy.limit(s),50);
 policy.recordBattle(s,231,true);assert.equal(policy.limit(s),52);
 s.flags.push(185);assert.equal(policy.enter(s,136),false);assert.equal(policy.limit(s),52);
});
test('shared training keeps every previous badge threshold before applying the finale policy',()=>{
 const c=training();for(const [badges,expected]of [[[0,1,2,3],31],[[0,1,2,3,4],35],[[0,1,2,3,4,5],39],[[0,1,2,3,4,5,6],43]])assert.equal(c.Training.limit({badges,flags:[185],vars:{16566:4}}),expected);
 // Native BadgeSet7 is the eighth badge; there is no BadgeSet8 in this story.
 assert.equal(c.Training.limit({badges:[0,1,2,3,4,5,6,7],flags:[],vars:{}}),50);
 assert.equal(c.Training.limit({badges:[0,1,2,3,4,5,6,7],flags:[185],vars:{16566:5}}),52);
 assert.equal(c.Training.limit({badges:[0,1,2,3,4,5,6,7],flags:[185],vars:{16566:4}}),54);
});
test('legacy levels and XP above54 remain intact and old chapters keep their previous policy',()=>{
 const c=training();c.NativeStory={state:{badges:[0,1,2,3,4,5,6,7],flags:[],vars:{}}};
 const pokemon={level:70,xp:400000},growth=Array.from({length:101},(_,i)=>i**3);
 assert.equal(c.Training.cap(pokemon),70);assert.deepEqual(JSON.parse(JSON.stringify(c.Training.xp(pokemon,100,growth))),{total:400000,earned:0});
 delete c.TRAINING_DATA.firstEndingPolicy;assert.equal(c.Training.limit(c.NativeStory.state),54);
});
