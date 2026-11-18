const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../src/battle-screen.js'),'utf8');
// Run the production entry until its first metadata read, keeping transport pending.
// If initialization starts individual reads first, latency savings disappear.
for(const result of [true,false])test('battle initialization awaits optional packed transport; result '+result+' retains individual fallback',async()=>{
 let release,packReads=0;const reads=[],stop=Error('metadata checkpoint'),context={RuntimeAssets:{
  preloadImages(src){packReads++;assert.equal(src,'assets/battle-ui-pack.bin?v=revision');return new Promise(resolve=>release=()=>resolve(result));},
  async json(src){reads.push(src);throw stop;}
 },NativeTextLayout:{resource:src=>src+'?v=revision'}};
 vm.createContext(context);const start=source.indexOf('  async function initialize()'),end=source.indexOf('  const text=',start);
 vm.runInContext(source.slice(start,end)+';this.start=initialize;',context);
 const pending=context.start();await Promise.resolve();assert.equal(packReads,1);assert.deepEqual(reads,[]);
 release();await assert.rejects(pending,error=>error===stop);
 assert.deepEqual(reads,['assets/battle-ui/provenance.json?v=revision']);
});
