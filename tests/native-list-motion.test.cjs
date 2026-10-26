const {test}=require('node:test'),assert=require('node:assert/strict'),{Motion,target,thumb,releaseTier}=require('../src/native-list-motion.js');
const cfg={rowHeight:24,visibleRows:7,stepPixelsByTier:[24,12,8,6,4,3]},budgets=[32,24,16,10,6,4];
test('native row bookkeeping starts before pixel motion and all steps end exactly on row boundaries',()=>{
 for(let tier=0;tier<6;tier++){const m=new Motion(cfg,100,budgets);m.start(1,1,tier);m.tick();assert.equal(m.first,1);assert.equal(m.position,cfg.stepPixelsByTier[tier]);while(m.moving)m.tick();assert.equal(m.position,24);}
});
test('native inertia preserves counter ordering and clips at either boundary',()=>{
 for(let tier=0;tier<6;tier++){const m=new Motion(cfg,1000,budgets);m.start(1,budgets[tier],tier,true);let ticks=0;while(m.moving){m.tick();assert.ok(++ticks<2000);}assert.equal(m.first,[87,56,33,18,9,4][tier]);assert.equal(m.position,m.first*24);}
 const m=new Motion(cfg,26,budgets);m.set(18);m.start(1,32,0,true);while(m.moving)m.tick();assert.equal(m.first,19);m.start(-1,32,0,true);while(m.moving)m.tick();assert.equal(m.first,0);assert.equal(m.position,0);
});
test('native scrollbar uses floor at both ends and release tier comes from sampled displacement',()=>{
 assert.equal(target(84,19),9);assert.equal(target(-5,19),0);assert.equal(target(200,19),19);assert.equal(thumb(9,19),80);assert.equal(thumb(0,0),12);
 assert.equal(releaseTier(8,0,[[16,8,6,4,4,4]]),1);
});
