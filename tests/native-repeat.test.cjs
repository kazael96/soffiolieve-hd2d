const {test}=require('node:test'),assert=require('node:assert/strict'),{Hold}=require('../src/native-repeat.js');
test('Bag stylus repeat matches native frame boundaries and accelerates at121',()=>{
 const h=new Hold();assert.deepEqual(h.advance(),[1]);assert.deepEqual(h.advance(29),[]);assert.deepEqual(h.advance(),[1]);
 assert.equal(h.advance(89).length,89);assert.equal(h.frames,120);assert.deepEqual(h.advance(2),[10,10]);h.reset();assert.deepEqual(h.advance(),[1]);
});
