const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {create,parse}=require('../src/opelucid-family-loader.js'),cacheFactory=require('../src/opelucid-resource-cache.js').create;
const root=path.resolve(__dirname,'../src'),read=name=>fs.readFileSync(path.join(root,name)),parts=JSON.parse(read('opelucid-parts.js').toString().split('=').slice(1).join('=').trim().replace(/;$/,''));

test('explicit data carriers can share the bounded loader without executing code or accepting another chapter',()=>{
 const data={family:'drayden',models:{dragon:{groups:[{texture:'skin'}]}},textures:{skin:{}},scenes:{121:{instances:[{model:'dragon'}]}},sprites:{}},part={zones:[121],variable:'LEAGUE_PART_ASSETS'},raw=Buffer.from('window.LEAGUE_PART_ASSETS='+JSON.stringify(data)+';');
 assert.deepEqual(parse(raw,'drayden',part),data);
 assert.throws(()=>parse(raw,'drayden',{zones:[121]}),/non valido/);
 assert.throws(()=>parse(raw,'drayden',{...part,variable:'OTHER_PART_ASSETS'}),/non valido/);
 assert.throws(()=>parse(raw,'drayden',{...part,variable:'LEAGUE_PART_ASSETS|.*'}),/non valido/);
 assert.throws(()=>parse(Buffer.from(raw+';globalThis.executed=true;'),'drayden',part),/non valido/);
 data.models.dragon.groups[0].texture='missing';
 assert.throws(()=>parse(Buffer.from('window.LEAGUE_PART_ASSETS='+JSON.stringify(data)+';'),'drayden',part),/Texture geografica mancante/);
});

test('all ten actual catalogs parse as data with their exact scene and geometry dependencies',()=>{
 for(const [name,part]of Object.entries(parts.families)){const data=parse(read(part.src),name,part);assert.equal(data.family,name);assert.equal(Object.keys(data.scenes).length,part.zones.length);}
 const part=parts.families.brycen,raw=read(part.src).toString();
 assert.throws(()=>parse(Buffer.from(raw+'globalThis.executed=true;'),'brycen',part),/non valido/);
 assert.throws(()=>parse(read(part.src),'brycen',{...part,zones:[114,115]}),/Mappe geografiche/);
});

test('a corrupt alternate bridge model is rejected before installing the family',()=>{
 const part=parts.families.dragonspiral,data=JSON.parse(read(part.src).toString().split('=').slice(1).join('=').trim().replace(/;$/,''));
 data.variantScenes[206].bridge.instances[0].model='missing-bridge';
 assert.throws(()=>parse(Buffer.from('window.OPELUCID_PART_ASSETS='+JSON.stringify(data)+';'),'dragonspiral',part),/Modello geografico mancante/);
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

test('a season change during a pending family load installs only the latest catalog and releases the actual old pack',async()=>{
 let season=0;const parts=[0,1,2].map(i=>({src:'s'+i+'.js',pack:'pack'+i,zones:[355],variable:'LEAGUE_PART_ASSETS',season:i})),manifest={residentLimit:3,families:{route10:parts[0]}},released=[],waiting=new Map(),assets={models:{},textures:{}};
 const resources={bytes:async file=>{const i=+file[1];return Buffer.from('window.LEAGUE_PART_ASSETS='+JSON.stringify({family:'route10',season:i,models:{body:{season:i,groups:[]}},textures:{},scenes:{355:{instances:[{model:'body'}]}},sprites:{}})+';');},preloadImages:file=>new Promise(done=>waiting.set(file,done)),releaseImages:file=>released.push(file)};
 const loader=create({manifest,assets,resources,resource:f=>f,cacheFactory,resolvePart:()=>parts[season]}),old=loader.ensure(['route10']);await new Promise(done=>setImmediate(done));assert.ok(waiting.has('pack0'));
 season=1;loader.clear();const current=loader.ensure(['route10']);waiting.get('pack0')(true);await new Promise(done=>setImmediate(done));assert.ok(waiting.has('pack1'),'A pending old-season catalog cannot satisfy the new request');waiting.get('pack1')(true);
 assert.equal(await old,false);assert.equal(await current,true);assert.equal(assets.models.body.season,1);assert.deepEqual(released,['pack0']);season=2;loader.clear();assert.deepEqual(released,['pack0','pack1'],'Eviction must release the loaded pack, not the current season');
});
test('an unstable seasonal selector fails after bounded metadata attempts instead of waiting forever',async()=>{
 let reads=0,selection=0;const rows=[0,1].map(season=>({src:'s'+season+'.js',pack:'pack'+season,zones:[355],variable:'LEAGUE_PART_ASSETS',season})),assets={models:{},textures:{}},resources={releaseImages(){},preloadImages:async()=>{throw Error('An obsolete image pack must not load');},bytes:async file=>{reads++;return Buffer.from('window.LEAGUE_PART_ASSETS='+JSON.stringify({family:'route10',season:+file[1],models:{},textures:{},scenes:{355:{instances:[]}},sprites:{}})+';');}};
 const loader=create({manifest:{residentLimit:3,families:{route10:rows[0]}},assets,resources,resource:f=>f,cacheFactory,resolvePart:()=>rows[selection++%2]});await assert.rejects(loader.ensure(['route10']),/continua a cambiare/);assert.equal(reads,4);assert.deepEqual(assets.models,{});assert.deepEqual(loader.stats().resident,[]);
});
test('a selector error after image preparation releases that pack and installs no partial family',async()=>{
 let calls=0;const released=[],part={src:'season.js',pack:'season-pack',zones:[355],variable:'LEAGUE_PART_ASSETS',season:0},assets={models:{},textures:{}},resources={releaseImages:file=>released.push(file),preloadImages:async()=>true,bytes:async()=>Buffer.from('window.LEAGUE_PART_ASSETS={"family":"route10","season":0,"models":{},"textures":{},"sprites":{},"scenes":{"355":{"instances":[]}}};')};
 const loader=create({manifest:{residentLimit:3,families:{route10:part}},assets,resources,resource:f=>f,cacheFactory,resolvePart:()=>{if(++calls===3)throw Error('Invalid saved season');return part;}});await assert.rejects(loader.ensure(['route10']),/Invalid saved season/);assert.deepEqual(released,['season-pack']);assert.deepEqual(assets.models,{});assert.deepEqual(loader.stats().resident,[]);
});
