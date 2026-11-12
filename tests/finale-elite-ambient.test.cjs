const test=require('node:test'),assert=require('node:assert/strict'),{create}=require('../src/finale-elite-ambient.js');
test('book cues cross native6/301 gates even at4x and a duplicate initializer does not duplicate its bed',()=>{
 const n={zone:140,vars:{}},target={record:{key:'fn-field-False-33-115'},frame:0},played=[],stopped=[],c=create({state:()=>n,controller:{records:()=>[target]},play:id=>played.push(id),stop:id=>stopped.push(id)});
 c.begin(1);c.begin(1);for(let i=4;i<700;i+=4){target.frame=i;c.tick();}assert.deepEqual(played,[1862,1682,1682,1682]);
 n.zone=141;c.tick();assert.deepEqual(stopped,[1862]);assert.equal(c.snapshot,null);
});
test('native work16385 stops the Mirton and Marzio beds once and never restarts them on a later write',()=>{
 for(const [room,id]of [[2,1878],[3,2031]]){const n={zone:139+room,vars:{16385:0}},played=[],stopped=[],c=create({state:()=>n,controller:{records:()=>[]},play:id=>played.push(id),stop:id=>stopped.push(id)});
 c.begin(room);n.vars[16385]=1;c.tick();c.tick();n.vars[16385]=0;c.tick();assert.deepEqual(played,[id]);assert.deepEqual(stopped,[id]);c.clear();assert.deepEqual(stopped,[id]);}
});
test('Catlina original90/213 gates retain30-frame delay across the241-frame wrap',()=>{
 const n={zone:143,vars:{}},target={record:{key:'fn-field-False-53-123'},frame:0},events=[],c=create({state:()=>n,controller:{records:()=>[target]},play:id=>events.push([target.frame,id]),stop(){}});
 c.begin(4);for(let i=1;i<=500;i++){target.frame=i;c.tick();}assert.deepEqual(events,[[90,1859],[120,1902],[213,1859],[243,1902],[331,1859],[361,1902],[454,1859],[484,1902]]);
});
