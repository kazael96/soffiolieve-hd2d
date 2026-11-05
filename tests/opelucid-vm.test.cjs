const test=require('node:test'),assert=require('node:assert/strict'),{FieldEventVM}=require('../src/field-event-vm.js');
function run(code,vars){const state={vars,flags:[575]},vm=new FieldEventVM({scripts:{426:{entries:[258],supportedEntries:[0],code}}},state,{command:async()=>false});return {state,vm,done:vm.run(426,0)};}
test('Tower213 native event sets bits1 and16 without discarding existing mask bits',async()=>{
 const f=run({258:{op:19,name:'VarOr',args:[32801,1],end:264},264:{op:19,name:'VarOr',args:[32801,16],end:270},270:{op:2,name:'VMHalt',args:[],end:272}},{32801:32768});
 await f.done;assert.equal(f.state.vars[32801],32785);assert.deepEqual(f.state.flags,[575]);assert.deepEqual(f.vm.trace,[[426,258,19],[426,264,19],[426,270,2]]);
});
test('native OR reads a variable source and leaves its value unchanged',async()=>{
 const f=run({258:{op:19,name:'VarOr',args:[32801,32802],end:264},264:{op:2,name:'VMHalt',args:[],end:266}},{32801:65520,32802:15});
 await f.done;assert.equal(f.state.vars[32801],65535);assert.equal(f.state.vars[32802],15);
});
