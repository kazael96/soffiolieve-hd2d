const test=require('node:test'),assert=require('node:assert/strict'),{setup,drain}=require('./helpers/finale-field-host.cjs');
test('actual map-event host replaces Champion stairs and throne wall with native geometry, collision and height data',async()=>{
 const c=await setup(),n=c.NativeStory.state,vm=c.NativeStory.vm;
 for(const [zone,event,work,value,base,matrix,member]of [[144,1,16434,548,125,218,617],[278,3,16436,4617,172,212,608]]){
  await drain(c,c.NativeStory.changeZone(zone,1,1));
  const original=c.OpelucidChapter.scene(zone).instances.map(i=>i.model);assert.equal(c.OpelucidChapter.scene(zone).sourceMatrix,base);
  const bank=9003;vm.data.scripts[bank]={entries:[0],supportedEntries:[0],code:{0:{op:218,name:'MapReplaceSetEvent',args:[event,1,1],end:8},8:{op:330,name:'FieldOpen',args:[],end:10},10:{op:2,name:'VMHalt',args:[],end:12}}};
  await drain(c,vm.run(bank,0));assert.equal(n.vars[work],value);
  const scene=c.OpelucidChapter.scene(zone);assert.equal(scene.sourceMatrix,matrix);assert.ok(scene.instances.some(i=>i.model==='fn-variant-map-'+member));assert.notDeepEqual(scene.instances.map(i=>i.model),original);
  const variant=c.FINALE_MAP_VARIANTS[zone];assert.equal(c.OpelucidChapter.grids(zone)[0].bytes.length,variant.scene.permissionGrids[0].bytes.length);
  const g=variant.scene.permissionGrids[0],width=g.bytes[0]|g.bytes[1]<<8,depth=g.bytes[2]|g.bytes[3]<<8;let checked=0;
  for(let z=0;z<depth;z++)for(let x=0;x<width;x++){const index=8+(z*width+x)*8,wx=g.x-16+x+.5,wz=g.z-16+z+.5;assert.equal(c.OpelucidChapter.blockedAt(zone,wx,wz),!!(g.bytes[index+2]&1));const p=c.OpelucidChapter.rawSurfaceAt(zone,wx,wz,0);if(p){assert.ok(Number.isFinite(p.height));checked++;}}
  assert.ok(checked>0,'Native surface planes must be selected');
  await drain(c,c.NativeStory.changeZone(146,7,12));await drain(c,c.NativeStory.changeZone(zone,1,1));assert.equal(c.OpelucidChapter.scene(zone).sourceMatrix,matrix,'Retained on reentry');
  vm.data.scripts[bank].code[0].args[1]=0;await drain(c,vm.run(bank,0));await c.OpelucidChapter.ensure(zone);assert.equal(c.OpelucidChapter.scene(zone).sourceMatrix,base,'Reverting cannot retain variant metadata');assert.deepEqual(c.OpelucidChapter.scene(zone).instances.map(i=>i.model),original);
 }
});
