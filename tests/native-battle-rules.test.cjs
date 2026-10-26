const test=require('node:test'),assert=require('node:assert/strict'),{ppState}=require('../src/native-battle-rules.js');
test('native PP colors keep full and exhausted PP distinct at every original small maximum',()=>{
 for(let max=1;max<=7;max++){assert.equal(ppState(max,max),'normal');assert.equal(ppState(0,max),'zero');if(max>1)assert.equal(ppState(1,max),'quarter');if(max>2)assert.equal(ppState(2,max),'half');if(max>3)assert.equal(ppState(3,max),'normal');}
});
test('larger PP maxima use integer quarter and half boundaries',()=>{
 assert.equal(ppState(3,15),'quarter');assert.equal(ppState(4,15),'half');assert.equal(ppState(7,15),'half');assert.equal(ppState(8,15),'normal');
 assert.equal(ppState(10,40),'quarter');assert.equal(ppState(11,40),'half');assert.equal(ppState(20,40),'half');assert.equal(ppState(21,40),'normal');
});
