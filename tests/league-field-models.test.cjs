const test=require('node:test'),assert=require('node:assert/strict'),{targets}=require('../src/field-models.js');
test('052 native badge gate parents resolve the chapter scope without requiring an animated child',()=>{
 const record={key:'lg-field-True-13-162',class:3,source:{archive:'a/2/2/9',member:13}},instance={model:'lg-prop-True-13-162',x:4,y:0,z:6,rotation:0},assets={models:{},children:{},scopes:{lg:{models:{'True-13-162':record},children:{}}}};
 const result=targets({instances:[instance]},assets);assert.equal(result.length,1);assert.equal(result[0].record,record);assert.equal(result[0].instance,instance);assert.equal(result[0].child,false);assert.deepEqual([result[0].x,result[0].y,result[0].z],[4,0,6]);
 assert.equal(targets({instances:[{...instance,model:'lg-prop-False-13-162'}]},assets).length,0);
});
test('identical raw identifiers in the previous and new geographic scopes keep different resources',()=>{
 const make=key=>({key,source:{archive:'a/2/2/9'}}),old=make('old'),next=make('next'),assets={models:{},children:{},scopes:{op:{models:{'True-13-162':old},children:{}},lg:{models:{'True-13-162':next},children:{}}}};
 const rows=targets({instances:['op','lg'].map(prefix=>({model:prefix+'-prop-True-13-162',x:0,y:0,z:0,rotation:0}))},assets);assert.deepEqual(rows.map(row=>row.record.key),['old','next']);
});
