const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../src'),read=name=>{const raw=fs.readFileSync(path.join(root,name+'.js'),'utf8');return JSON.parse(raw.slice(raw.indexOf('=')+1).trim().replace(/;$/,''));},metadata=read('opelucid-scenes'),parts=read('opelucid-parts'),canonical=read('opelucid-assets');
const makeWindow=require('../src/opelucid-scene-window.js').create,makeCache=require('../src/opelucid-resource-cache.js').create;
function setup({loadFamily=async name=>read('opelucid-'+name+'-assets'),afterPrepare=async()=>{},legacyEnsure=async()=>{}}={}){
 const assets={models:{},textures:{},scenes:{}},legacy={instances:[{model:'legacy198'}]};let sceneWindow;const loader=makeCache({assets,manifest:parts.families,limit:3,loadFamily,onEvict:name=>sceneWindow.evict(name),onDiscard:name=>sceneWindow.evict(name)});
 sceneWindow=makeWindow({metadata,parts,assets,loader,legacyDescriptor:()=>null,legacyScene:()=>legacy,legacyEnsure,afterPrepare}).register();return {assets,loader,sceneWindow,legacy};
}

test('all scene descriptors remain usable before geometry; current and neighbors install as one bounded window',async()=>{
 const f=setup(),scene=f.sceneWindow.scene(113),grids=scene.permissionGrids;assert.equal(Object.keys(f.assets.scenes).length,48);assert.equal(Object.keys(f.assets.models).length,0);assert.equal(scene.assetsPending,true);assert.ok(grids.length>metadata[113].permissionGrids.length);f.sceneWindow.register();assert.equal(f.sceneWindow.scene(113),scene);
 assert.equal(await f.sceneWindow.prepare(113),true);assert.equal(f.assets.scenes.zone113,scene);assert.equal(scene.assetsPending,false);assert.deepEqual(f.loader.stats().resident,['icirrus','dragonspiral','route8']);
 assert.equal(scene.instances.length,[113,205,345].reduce((sum,z)=>sum+canonical.scenes[z].instances.length,1));assert.ok(scene.instances.includes(f.legacy.instances[0]));
 await f.sceneWindow.prepare(120);assert.equal(f.sceneWindow.scene(113),scene);assert.equal(scene.assetsPending,true);assert.equal(scene.instances.length,0);assert.equal(f.loader.stats().resident.length,3);assert.equal(f.sceneWindow.scene(120).assetsPending,false);
});

test('late legacy dependency cannot supersede the newer destination or reclaim a descriptor',async()=>{
 let release;const f=setup({legacyEnsure:()=>new Promise(done=>release=done)}),old=f.sceneWindow.prepare(113);await new Promise(done=>setImmediate(done));const scene=f.sceneWindow.scene(120);assert.equal(await f.sceneWindow.prepare(120),true);release();assert.equal(await old,false);assert.equal(f.assets.scenes.zone120,scene);assert.equal(scene.assetsPending,false);assert.deepEqual(f.loader.stats().resident,['opelucid','route9']);
 const replacement={instances:[],owner:'other chapter'};f.assets.scenes.zone120=replacement;assert.equal(await f.sceneWindow.prepare(120),false);f.sceneWindow.evict('opelucid');assert.equal(f.assets.scenes.zone120,replacement);assert.equal(replacement.assetsPending,undefined);
});

test('failed actor preparation remains covered and retry does not require rebuilding metadata or resources',async()=>{
 let fail=true,calls=0;const f=setup({afterPrepare:async()=>{calls++;if(fail)throw Error('missing actor');}}),scene=f.sceneWindow.scene(114);await assert.rejects(f.sceneWindow.prepare(114),/missing actor/);assert.equal(scene.assetsPending,true);assert.deepEqual(f.loader.stats().resident,['brycen']);fail=false;assert.equal(await f.sceneWindow.prepare(114),true);assert.equal(f.sceneWindow.scene(114),scene);assert.equal(scene.assetsPending,false);assert.equal(calls,2);
});
