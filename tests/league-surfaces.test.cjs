const test=require('node:test'),assert=require('node:assert/strict'),{at}=require('../src/league-surfaces.js');
test('the actual native Gym entrance WB cell remains walkable when no ribbon is present',()=>{
 const floor={height:0,behavior:0,flags:128},base={at:()=>floor},rails={locate:()=>null};assert.equal(at(121,11.5,33.5,0,base,rails),floor);assert.equal(at(214,11.5,33.5,0,base,rails),null,'NG exterior must never borrow a WB floor');
});
test('native163 entrances cannot bypass disabled ribbons, and higher decks do not fall onto a lower WB plane',()=>{
 const entry={height:0,behavior:163,flags:128},base={at:()=>entry},rails={locate:()=>null};assert.equal(at(121,-15,23.5,0,base,rails).flags&1,1);assert.equal(entry.flags,128);
 assert.equal(at(121,11.5,-8,12,{at:()=>({height:2.498138427734375,flags:128})},rails),null);
 const ribbon={height:12,line:47,front:1,side:0,flags:128,behavior:163,attributes:8388771};assert.deepEqual(at(121,11.5,-8,12,base,{surfaceAt:()=>ribbon}),ribbon);
});
test('unrelated native floors and their full attributes pass through unchanged',()=>{
 const floor={height:6,flags:128,behavior:0};assert.equal(at(120,0,0,0,{at:()=>floor}),floor);
});
