/* Synthetic operands exercise the actual host and persistent inventory, without a renderer. */
const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/finale-field-host.cjs');
test('native184 reads item/quantity work operands without consuming or granting Castle items',async()=>{
 const c=await setup(),n=c.NativeStory.state,vm=c.NativeStory.vm;assert.ok(c.Journey.addItem(17,2));assert.ok(c.Journey.addItem(617,1));
 const bank=9001,dest=0x8010,itemWork=0x8020,quantityWork=0x8021;
 vm.data.scripts[bank]={entries:[0],supportedEntries:[0],code:{0:{op:184,name:'NativeOpcode184',args:[itemWork,quantityWork,dest],end:8},8:{op:2,name:'VMHalt',args:[],end:10}}};
 for(const[id,qty,expected]of [[17,1,1],[17,2,1],[17,3,0],[17,0,1],[617,1,1],[616,1,0],[616,0,0],[0,1,0]]){
  const before=c.Journey.itemCount(id);n.vars[itemWork]=id;n.vars[quantityWork]=qty;await drain(c,vm.run(bank,0));assert.equal(n.vars[dest],expected,'Item '+id+' quantity '+qty);assert.equal(c.Journey.itemCount(id),before);assert.equal(vm.running,false);
 }
});
