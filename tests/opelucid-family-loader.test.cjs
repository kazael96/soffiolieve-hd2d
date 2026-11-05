const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {create,parse}=require('../src/opelucid-family-loader.js'),cacheFactory=require('../src/opelucid-resource-cache.js').create;
const root=path.resolve(__dirname,'../src'),read=name=>fs.readFileSync(path.join(root,name)),parts=JSON.parse(read('opelucid-parts.js').toString().split('=').slice(1).join('=').trim().replace(/;$/,''));

test('all ten actual catalogs parse as data with their exact scene and geometry dependencies',()=>{
 for(const [name,part]of Object.entries(parts.families)){const data=parse(read(part.src),name,part);assert.equal(data.family,name);assert.equal(Object.keys(data.scenes).length,part.zones.length);}
 const part=parts.families.brycen,raw=read(part.src).toString();
 assert.throws(()=>parse(Buffer.from(raw+'globalThis.executed=true;'),'brycen',part),/non valido/);
 assert.throws(()=>parse(read(part.src),'brycen',{...part,zones:[114,115]}),/Mappe geografiche/);
});

test('real family geometry remains absent until its image pack succeeds; failure is retryable',async()=>{
 const assets={models:{},textures:{}},released=[];let release,fail=true;
 const resources={bytes:async file=>read(file),releaseImages:file=>released.push(file),preloadImages:()=>new Promise(done=>release=()=>done(!fail))};
 const loader=create({manifest:parts,assets,resources,resource:file=>file,cacheFactory});
 const first=loader.ensure(['brycen']);await new Promise(done=>setImmediate(done));assert.deepEqual(assets.models,{});release();await assert.rejects(first,/Immagini geografiche/);assert.deepEqual(loader.stats().resident,[]);assert.equal(released.length,1);
 fail=false;const second=loader.ensure(['brycen']);await new Promise(done=>setImmediate(done));assert.deepEqual(assets.models,{});release();assert.equal(await second,true);assert.ok(assets.models['op-map-527']);loader.clear();assert.deepEqual(assets.models,{});assert.equal(released.length,2);
});

test('moving across four real areas releases the oldest pack and geometry within the three-family budget',async()=>{
 const released=[],assets={models:{},textures:{}},resources={bytes:async file=>read(file),preloadImages:async()=>true,releaseImages:file=>released.push(file)};
 const loader=create({manifest:parts,assets,resources,resource:file=>file,cacheFactory});
 for(const name of ['brycen','dragonspiral','route8','tubeline'])assert.equal(await loader.ensure([name]),true);
 assert.deepEqual(loader.stats().resident,['dragonspiral','route8','tubeline']);assert.deepEqual(released,['assets/opelucid-brycen-pack.bin']);assert.equal(assets.models['op-map-527'],undefined);
 loader.clear();assert.equal(released.length,4);assert.deepEqual(assets.models,{});assert.deepEqual(assets.textures,{});
});
