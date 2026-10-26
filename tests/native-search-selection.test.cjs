const {test}=require('node:test'),assert=require('node:assert/strict');
const {toggle}=require('../src/pokedex-search.js');
const {wrapQuantity}=require('../src/native-ui.js');
test('native search retains two unordered types and toggles either selection off',()=>{
 let q=toggle({order:0},'types',12);q=toggle(q,'types',4);assert.equal(q.typeA,12);assert.equal(q.typeB,4);
 q=toggle(q,'types',12);assert.equal(q.typeA,null);assert.equal(q.typeB,4);
 q=toggle(q,'types',7);assert.equal(q.typeA,7);assert.equal(q.typeB,4);
 q=toggle(q,'types',9);assert.equal(q.typeA,7);assert.equal(q.typeB,9);
});
test('shape zero is a selectable native criterion, order cannot be unset',()=>{
 let q=toggle({},'shape',0);assert.equal(q.shape,0);q=toggle(q,'shape',0);assert.equal(q.shape,null);
 q=toggle(q,'order',0);q=toggle(q,'order',0);assert.equal(q.order,0);
});
test('Bag quantity crosses either boundary by wrapping even with ten-item steps',()=>{
 assert.equal(wrapQuantity(1,-1,5),5);assert.equal(wrapQuantity(5,1,5),1);
 assert.equal(wrapQuantity(1,10,5),1);assert.equal(wrapQuantity(3,-10,5),5);
 assert.equal(wrapQuantity(14,10,99),24);assert.equal(wrapQuantity(1,-10,1),1);
});
