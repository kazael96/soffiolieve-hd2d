const test=require('node:test'),assert=require('node:assert/strict'),{create}=require('../src/opelucid-resource-cache.js');
const family=(name,shared=false)=>({family:name,models:{[name]:{name},...(shared?{common:{owner:name}}:{})},textures:{[name]:{src:name+'.png'}},scenes:{[name]:{instances:[]}}});
function setup({limit=3,loadFamily=async name=>family(name,['a','b'].includes(name))}={}){const before={old:true},assets={models:{common:before},textures:{}},evicted=[],cache=create({assets,manifest:{a:{},b:{},c:{},d:{}},loadFamily,limit,onEvict:name=>evicted.push(name)});return {assets,cache,before,evicted};}
test('evicting a shared-model owner restores the still-resident family instead of deleting its model',async()=>{
 const f=setup();await f.cache.ensure(['a']);const a=f.assets.models.common;await f.cache.ensure(['b']);assert.equal(f.assets.models.common.owner,'b');await f.cache.ensure(['c']);await f.cache.ensure(['a']);await f.cache.ensure(['d']);assert.deepEqual(f.evicted,['b']);assert.equal(f.assets.models.common,a);assert.deepEqual(f.cache.stats().resident,['c','a','d']);f.cache.clear();assert.equal(f.assets.models.common,f.before);assert.deepEqual(Object.keys(f.assets.models),['common']);assert.deepEqual(f.assets.textures,{});
});
test('late old geography cannot evict or replace the current family',async()=>{
 let release;const f=setup({limit:1,loadFamily:name=>name==='a'?new Promise(done=>release=()=>done(family('a',true))):Promise.resolve(family(name))}),old=f.cache.ensure(['a']);assert.equal(await f.cache.ensure(['b']),true);release();assert.equal(await old,false);assert.deepEqual(f.cache.stats().resident,['b']);assert.equal(f.assets.models.a,undefined);assert.ok(f.assets.models.b);assert.equal(f.assets.models.common,f.before);
});
test('a failed family stays retryable and never installs partial models or textures',async()=>{
 let attempts=0;const f=setup({loadFamily:async name=>{if(++attempts===1)throw Error('missing image pack');return family(name);}});await assert.rejects(f.cache.ensure(['a']),/missing image pack/);assert.deepEqual(f.cache.stats().resident,[]);assert.deepEqual(f.cache.stats().pending,[]);assert.deepEqual(Object.keys(f.assets.models),['common']);assert.equal(await f.cache.ensure(['a']),true);assert.ok(f.assets.models.a);assert.equal(attempts,2);
});
test('external asset replacement remains owned by that loader during eviction',async()=>{
 const f=setup({limit:1});await f.cache.ensure(['a']);const external={owner:'external'};f.assets.models.common=external;await f.cache.ensure(['c']);assert.equal(f.assets.models.common,external);f.cache.clear();assert.equal(f.assets.models.common,external);
});
test('a complete neighboring window stays resident and malformed or over-budget requests fail',async()=>{
 const f=setup();assert.equal(await f.cache.ensure(['a','b','c','a']),true);assert.deepEqual(f.cache.stats().resident,['a','b','c']);for(const n of ['a','b','c'])assert.ok(f.assets.models[n]);await assert.rejects(f.cache.ensure(['a','b','c','d']),/non valida/);await assert.rejects(f.cache.ensure(['missing']),/non valida/);const broken=setup({loadFamily:async()=>({family:'wrong',models:{},textures:{},scenes:{}})});await assert.rejects(broken.cache.ensure(['a']),/incompleta/);assert.deepEqual(broken.cache.stats().resident,[]);
});

test('failed and cancelled windows release loaded packs without releasing a family claimed by the new window',async()=>{
 const discarded=[],releases={},cache=create({assets:{models:{},textures:{}},manifest:{a:{},b:{},c:{}},limit:2,onDiscard:name=>discarded.push(name),loadFamily:name=>new Promise((resolve,reject)=>releases[name]={resolve:()=>resolve(family(name)),reject})});
 const old=cache.ensure(['a','b']),current=cache.ensure(['b','c']);releases.a.resolve();releases.b.resolve();releases.c.resolve();assert.equal(await old,false);assert.equal(await current,true);assert.deepEqual(discarded,['a']);assert.deepEqual(cache.stats().resident,['b','c']);
 cache.clear();const failed=cache.ensure(['a','b']);releases.a.resolve();releases.b.reject(Error('missing pack'));await assert.rejects(failed,/missing pack/);assert.deepEqual(discarded,['a','a']);assert.deepEqual(cache.stats().resident,[]);assert.deepEqual(cache.stats().pending,[]);
});
