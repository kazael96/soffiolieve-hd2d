const {test}=require('node:test'),assert=require('node:assert/strict'),{insert,step}=require('../src/native-shortcut-order.js');
test('Y reorders by insertion boundary and0xff appends after removing the source',()=>{
 const ids=['A','B','C'];assert.deepEqual(insert(ids,1,255),{ids:['A','C','B'],index:2});
 assert.deepEqual(insert(ids,0,2),{ids:['B','A','C'],index:1});assert.deepEqual(insert(ids,2,0),{ids:['C','A','B'],index:0});
 assert.deepEqual(insert(ids,1,2).ids,ids);assert.deepEqual(ids,['A','B','C']);
});
test('Y end marker is a separate navigation state and wraps across both edges',()=>{
 assert.deepEqual(step(2,false,1,3),{cursor:2,after:true});assert.deepEqual(step(2,true,1,3),{cursor:0,after:false});
 assert.deepEqual(step(0,false,-1,3),{cursor:2,after:true});assert.deepEqual(step(2,true,-1,3),{cursor:2,after:false});
});
