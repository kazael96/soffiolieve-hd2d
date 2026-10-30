const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require.resolve('../src/battle-screen.js'),'utf8');
test('battle UI images use bounded resource loading, deduplicate and release failed requests',async()=>{
 let attempts=0;const c={images:new Map(),NativeTextLayout:{resource:s=>s+'?v=build'},RuntimeAssets:{image:src=>{assert.equal(src,'panel.png?v=build');attempts++;return attempts===1?Promise.reject(Error('temporary network failure')):Promise.resolve({width:256});}}};
 vm.runInNewContext(source.slice(source.indexOf('  function load('),source.indexOf('  let loading='))+';this.loadImage=load;',c);
 const first=c.loadImage('panel.png');assert.equal(c.loadImage('panel.png'),first);await assert.rejects(first,/temporary network failure/);const image=await c.loadImage('panel.png');assert.equal(image.width,256);assert.equal(await c.loadImage('panel.png'),image);assert.equal(attempts,2);
});
test('battle UI initialization rejects failures, retains canvases and retries once for concurrent callers',async()=>{
 let attempts=0,release;const stage={dataset:{},setAttribute(k,v){this[k]=v;},set textContent(v){throw Error('Canvas removed on failure');}},c={stage,ready:false,Promise};
 c.initialize=()=>{attempts++;return attempts===1?Promise.reject(Error('image unavailable')):new Promise(resolve=>{release=()=>{c.ready=true;resolve();};});};
 const start=source.indexOf('  let loading='),end=source.indexOf('  async function initialize',start);assert.ok(start>=0&&end>start);vm.runInNewContext(source.slice(start,end)+';this.prepareUI=prepare;',c);
 await assert.rejects(c.prepareUI(),/image unavailable/);assert.equal(stage.dataset.resources,'error');assert.equal(stage.dataset.resourceError,'image unavailable');const retry=c.prepareUI();assert.equal(c.prepareUI(),retry);assert.equal(stage.dataset.resources,'loading');release();assert.equal(await retry,true);assert.equal(stage.dataset.resources,'ready');assert.equal(stage.dataset.resourceError,undefined);assert.equal(await c.prepareUI(),true);assert.equal(attempts,2);
 assert.ok(!source.includes('stage.textContent=error.message'),'Failed startup must not destroy the battle canvas');assert.match(source,/get loading\(\)\{return prepare\(\);\}/);
});
