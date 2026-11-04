const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function environment(){
 const ready=new Set(),calls=[],images=[],canvases=[],c={console,Promise,Map,BATTLE_ENVIRONMENT_ASSETS:{textures:{floor:{src:'floor.png'}},environments:{a:{kind:'outdoor',surfaces:{ground:'floor'},decorations:{}}}},RuntimeAssets:{image:async src=>{images.push(src);return {width:16,height:16};}},document:{documentElement:{dataset:{build:'test'}},createElement(){const canvas={width:0,height:0,getContext:()=>({imageSmoothingEnabled:true})};canvases.push(canvas);return canvas;}},BattleDiorama:{async prepare(context){calls.push(context.id);ready.add(context.id);return true;},paint(context){assert.ok(ready.has(context.id),'an evicted context must be prepared before painting');return true;},drawAmbient(){}}};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('src/battle-environment.js','utf8'),c);return {c,ready,calls,images,canvases,api:c.BattleEnvironment};
}
test('returning to an evicted diorama revalidates GPU resources while reusing its surface images',async()=>{
 const f=environment(),context={id:'a',terrain:'path'};await f.api.prepare(context);assert.deepEqual(f.calls,['a']);f.ready.clear();await f.api.prepare(context);assert.deepEqual(f.calls,['a','a']);assert.equal(f.images.length,1);
});
test('a failed diorama retry keeps successful image dependencies and never caches a rejected gate',async()=>{
 const f=environment(),context={id:'a',terrain:'path'},prepare=f.c.BattleDiorama.prepare;let failed=true;f.c.BattleDiorama.prepare=async value=>{if(failed)throw Error('temporary GPU scene failure');return prepare(value);};await assert.rejects(f.api.prepare(context),/temporary GPU/);assert.equal(f.images.length,1);failed=false;await f.api.prepare(context);assert.ok(f.ready.has('a'));assert.equal(f.images.length,1);
});
test('resizing a battle releases old private canvases under both byte and entry budgets',async()=>{
 const f=environment(),context={id:'a',terrain:'path'};f.api.set(context);await f.api.prepare(context);for(let i=0;i<20;i++)f.api.draw({drawImage(){}},1100+i,720);let stats=f.api.cacheStats();assert.ok(stats.frames>0&&stats.frames<=stats.limitEntries);assert.ok(stats.bytes<=stats.limitBytes);assert.ok(f.canvases.some(canvas=>canvas.width===0));await f.api.prepare(context);stats=f.api.cacheStats();assert.equal(stats.frames,0);assert.equal(stats.bytes,0);assert.ok(f.canvases.every(canvas=>canvas.width===0));
});
test('a single oversized current frame stays renderable without retaining older backing stores',async()=>{
 const f=environment(),context={id:'a',terrain:'path'};f.api.set(context);await f.api.prepare(context);f.api.draw({drawImage(){}},390,844);f.api.draw({drawImage(){}},3840,2160);const stats=f.api.cacheStats();assert.equal(stats.frames,1);assert.equal(stats.overBudget,true);assert.equal(stats.bytes,3840*2160*4*3);let draws=0;f.api.draw({drawImage(){draws++;}},3840,2160);assert.equal(draws,3);assert.equal(f.api.cacheStats().bytes,stats.bytes);
});
