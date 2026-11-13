const test=require('node:test'),assert=require('node:assert/strict');
const {FieldEventVM}=require('../src/field-event-vm.js');
// IRBI274:30 and147..165. OP37 resolves flag, reads20142e8 and stores a work.
const native={op:37,name:'NativeOpcode37',args:[357,32784],end:36};
async function execute(commands,state){
 const code={};let at=30;for(const command of commands){code[at]={...command,end:at+6};at+=6;}code[at]={op:2,name:'RTEndGlobal',args:[],end:at+2};
 const vm=new FieldEventVM({scripts:{274:{entries:[30],code}}},state,{command:async()=>false});await vm.run(274,0);return state;
}
test('League flag read writes one without changing the flag list',async()=>{
 const state={flags:[357,2409],vars:{32784:999}};await execute([native],state);
 assert.equal(state.vars[32784],1);assert.deepEqual(state.flags,[357,2409]);
});
test('League flag read writes zero and preserves unrelated work',async()=>{
 const state={flags:[2410],vars:{32784:999,16400:7}};await execute([native],state);
 assert.equal(state.vars[32784],0);assert.equal(state.vars[16400],7);assert.deepEqual(state.flags,[2410]);
});
test('flag operand resolves work while output remains an address',async()=>{
 const state={flags:[357],vars:{16432:357,32784:999}};await execute([{...native,args:[16432,32784]}],state);
 assert.equal(state.vars[32784],1);assert.equal(state.vars[16432],357);assert.deepEqual(state.flags,[357]);
});
test('four native Elite Four reads preserve independent results and flags',async()=>{
 const state={flags:[2409,2412],vars:{}};
 await execute([2409,2410,2411,2412].map((flag,i)=>({...native,args:[flag,32801+i]})),state);
 assert.deepEqual([32801,32802,32803,32804].map(k=>state.vars[k]),[1,0,0,1]);assert.deepEqual(state.flags,[2409,2412]);
});
