'use strict';
// The existing WebAudio fixture is read from its original test, not replaced by
// another engine. Only its loaders and the declared541 profile/options adapt.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),Module=require('node:module'),assert=require('node:assert/strict'),L=require('./liepard-protocol064/strict-loader.cjs');
const closed541Names=['minccino-moves.js','demo-moves.js','battle-presentation.js','audio-engine.js','move-fx.js'];
assert.equal(L.contract.revision,'coherent-v4-closed541-m3-tail-tynamo33-native-foe-dreamyard-floor-cut-target-under-actors');assert.deepEqual(L.contract.closed541Lineage?.sourceLFHashChanges,closed541Names);
// Explicit current revision; immutable pre-M3 closed541 basis stays distinct.
const historical541File=path.join(L.fixtures,'source-contract-v4-closed541-before-m3tail064.json'),historical541Text=L.decode(fs.readFileSync(historical541File),historical541File);
assert.equal(L.sha(Buffer.from(L.LF(historical541Text))),'b73ec24834acde208c73da44239fbd2d199d70930b7c5248b601c1b346a8e2a9','Immutable pre-M3 closed541 contract changed');
const historical541=JSON.parse(historical541Text);assert.equal(historical541.revision,'coherent-v4-typed-native572-partitions-closed541-singles');
assert.equal(L.contract.previousClosed541ContractCanonicalLFSHA256,'b73ec24834acde208c73da44239fbd2d199d70930b7c5248b601c1b346a8e2a9');
assert.deepEqual(L.contract.closed541Lineage,historical541.closed541Lineage,'All five declared541 lineage fields remain exact');assert.deepEqual(L.contract.native572Lineage,historical541.native572Lineage,'Typed native572 contract unchanged');assert.deepEqual(L.contract.rawAssetSHA256,historical541.rawAssetSHA256,'Original native RAW roles/pins unchanged');
assert.deepEqual(L.contract.nativeM3TailLineage.sourceLFHashChanges,['minccino-moves.js','move-fx.js','battle-presentation.js','audio-engine.js'],'Only the four explicit M3 program changes are admitted by current strict contract');
// Current shared Tynamo migration does not upgrade this non/late-render-host fixture.
assert.equal(L.contract.previousM3TailContractCanonicalLFSHA256,'a4af68356acbb8a7a335dbd1c93d23c7b55a62a361b9de8833b66b7300be747e');
assert.deepEqual(L.contract.tynamo33NativeFoeLineage.sourceLFHashChanges,['species-moves.js','move-fx.js','game.js']);
// Explicit field-only World migration; no native541/audio/body source is changed.
const beforeVisibilityFile=path.join(L.fixtures,'source-contract-v4-floor-before-target-fade064.json'),beforeVisibilityText=L.decode(fs.readFileSync(beforeVisibilityFile),beforeVisibilityFile);assert.equal(L.sha(Buffer.from(L.LF(beforeVisibilityText))),'83c04177e197d7100605cec4249edf025561581abfffafb4a5ccbdd61d902a47','Immutable pre-transparency floor contract changed');const beforeVisibility=JSON.parse(beforeVisibilityText);
const beforeFloorFile=path.join(L.fixtures,'source-contract-v4-native-foe-before-dreamyard-floor064.json'),beforeFloorText=L.decode(fs.readFileSync(beforeFloorFile),beforeFloorFile);assert.equal(L.sha(Buffer.from(L.LF(beforeFloorText))),'891ac3550f34f5602e82032f784ed299dec052d50be9c3df586a60f331f9f0a8','Immutable pre-floor native-foe contract changed');const beforeFloor=JSON.parse(beforeFloorText);assert.deepEqual(beforeVisibility,{...beforeFloor,status:'ACTUAL_V4_CLOSED541_M3_TAIL_TYNAMO33_NATIVE_FOE_DREAMYARD_FLOOR_SOURCE_CONTRACT_NOT_EXECUTION',revision:'coherent-v4-closed541-m3-tail-tynamo33-native-foe-dreamyard-floor',sourceLFHashes:{...beforeFloor.sourceLFHashes,'world3d.js':'c5bc8b14883014876ed81885d2150454279d61a2bb0a79ebc1adc082128f2da8'},previousTynamo33NativeFoeContractCanonicalLFSHA256:'891ac3550f34f5602e82032f784ed299dec052d50be9c3df586a60f331f9f0a8',dreamyardFloorLineage:{"schema":1,"sourceLFHashChanges":["world3d.js"],"sourceLFHashes":{"world3d.js":"c5bc8b14883014876ed81885d2150454279d61a2bb0a79ebc1adc082128f2da8"},"fieldGroundQuery":{"scene":"zone152","nativeModel":"acc-map-279","groundExcludedGroups":[6,27],"policy":"Only native arch cap and baked-shadow groups leave ground query; all other groups, highest/barycentric/cache and render geometry remain original"},"rawAssetPinsRetainOriginalMeaning":true,"scope":"Declared field-floor source migration only; battle body/draw, Tynamo, M3 and541 lineages unchanged; no new execution/motion/PCM/Android approval"}},'Only declared World ground-query pin and floor lineage may migrate');
const beforeUnderActorsFile=path.join(L.fixtures,'source-contract-v4-fade-before-under064.json'),beforeUnderActorsText=L.decode(fs.readFileSync(beforeUnderActorsFile),beforeUnderActorsFile);assert.equal(L.sha(Buffer.from(L.LF(beforeUnderActorsText))),'2dac324e7292721d334902c065bbe520b484876c0b52949a5a5b632ccd216458','Immutable pre-under-actors transparency contract changed');const beforeUnderActors=JSON.parse(beforeUnderActorsText);
assert.deepEqual(beforeUnderActors,{...beforeVisibility,status:'ACTUAL_V4_CLOSED541_M3_TAIL_TYNAMO33_NATIVE_FOE_DREAMYARD_FLOOR_CUT_TARGET_TRANSPARENCY_SOURCE_CONTRACT_NOT_EXECUTION',revision:'coherent-v4-closed541-m3-tail-tynamo33-native-foe-dreamyard-floor-cut-target-transparency',sourceLFHashes:{...beforeVisibility.sourceLFHashes,'world3d.js':'3b03cbfd301f65c8b5935b7ece12151260704e6ae332e4d65417e2fec92ccf5e'},previousDreamyardFloorContractCanonicalLFSHA256:'83c04177e197d7100605cec4249edf025561581abfffafb4a5ccbdd61d902a47',cutTargetTransparencyLineage:{"schema":1,"sourceLFHashChanges":["world3d.js"],"sourceLFHashes":{"world3d.js":"3b03cbfd301f65c8b5935b7ece12151260704e6ae332e4d65417e2fec92ccf5e"},"fieldForeground":{"scene":"zone152","nativeTargetModel":108,"move":15,"graphic":501,"direction":1,"targetIdentity":"Copied returned actor must match the captured original target source and active action owner; native NPC/save remains unchanged","opacityRange":[0.38,1],"planeOpacityArgument":11,"depthWrite":"false only around the owned deferred target plane; restored true in finally","ordinaryActorPass":"Existing opaque order/arguments remain unchanged; no generic actor.opacity coupling","floorQuery":"Prior Dreamyard floor query and its lineage remain unchanged"},"companionOutsideStrictSourceInventory":{"relative":"src/field-hm-world.js","canonicalLFSHA256":"154530e88a55383e88044f7ed9a7cd3804a5bfb455701bd70b481a356001fac2","role":"Semantic companion provenance only; not a 36th source entry or a source loaded by the native541 fixture"},"rawAssetPinsRetainOriginalMeaning":true,"scope":"Declared scoped field-target visibility source migration only; battle body/draw, Tynamo, M3 and541 lineages unchanged. ART_LIMIT: ghost appearance, shell readability and full move remain unapproved; no new541 execution/motion/PCM/Android/build approval"}},'Only declared World owned target transparency and explicit lineage may migrate');
assert.deepEqual(L.contract,{...beforeUnderActors,status:'ACTUAL_V4_CLOSED541_M3_TAIL_TYNAMO33_NATIVE_FOE_DREAMYARD_FLOOR_CUT_TARGET_UNDER_ACTORS_SOURCE_CONTRACT_NOT_EXECUTION',revision:'coherent-v4-closed541-m3-tail-tynamo33-native-foe-dreamyard-floor-cut-target-under-actors',sourceLFHashes:{...beforeUnderActors.sourceLFHashes,'world3d.js':'d1e3d8bf170a69de8b607701d12230e5ca7e223900aa14ebbf1ac1e8d756d102'},previousCutTargetTransparencyContractCanonicalLFSHA256:'2dac324e7292721d334902c065bbe520b484876c0b52949a5a5b632ccd216458',cutTargetUnderActorsLineage:{"schema":1,"sourceLFHashChanges":["world3d.js"],"sourceLFHashes":{"world3d.js":"d1e3d8bf170a69de8b607701d12230e5ca7e223900aa14ebbf1ac1e8d756d102"},"fieldForegroundPass":{"scene":"zone152","nativeTargetModel":108,"move":15,"graphic":501,"direction":1,"passOrder":["all original contact shadows","same owned target cutaway tree","all opaque actors","original player silhouette"],"opacityRange":[0.38,1],"planeOpacityArgument":11,"depthWrite":"false only around the same owned target plane; restored true in finally","drawBody":"Exact previously qualified target-pass body moved; ordinary actor order/arguments and source pixels unchanged","floorQuery":"Prior Dreamyard excluded groups6,27,highest,cache and render geometry unchanged"},"rawAssetPinsRetainOriginalMeaning":true,"scope":"Declared source-only target pass-order migration; native541,M3,Tynamo,battle bodies,clocks,audio and prior lineages remain unchanged. Scoped World component acceptance is not full-move,physical-contact,motion,PCM,Android,build or release approval."}},'Only declared World target-pass order and explicit lineage may migrate');



for(const file of closed541Names){assert(fs.existsSync(path.join(L.target,file)),'Explicit closed541 source missing');L.validate(file);}
const metaFile=path.join(L.repo,'tests/fixtures/native-tail541-audio064.json'),metaRaw=fs.readFileSync(metaFile),metaText=L.decode(metaRaw,metaFile);
assert.equal(L.sha(Buffer.from(L.LF(metaText))),'119eb3bfb8fb314963a06505426fc6f60c5e04f2646a4b88a9365d347763c112','Native541 audio fixture metadata changed');
const meta=JSON.parse(metaText);
function loadProgram(c,file){
 if(Object.hasOwn(L.contract.sourceLFHashes,file)||Object.hasOwn(L.contract.rawAssetSHA256,file))return L.run(c,file);
 let actual,expected,raw;
 if(Object.hasOwn(meta.originalRawAudioPrograms,file)){actual=path.join(L.site,file);raw=fs.readFileSync(actual);assert.equal(L.sha(raw),meta.originalRawAudioPrograms[file],'Original native audio program RAW changed');}
 else{assert.equal(file,'audio-playback.js','Unlisted541 fixture program');const selected=path.join(L.target,file);actual=fs.existsSync(selected)?selected:path.join(L.repo,'src',file);raw=fs.readFileSync(actual);expected=meta.originalAudioPlaybackCanonicalLFSHA256;}
 const text=L.decode(raw,actual);if(expected)assert.equal(L.sha(Buffer.from(L.LF(text))),expected,'Original audio playback dependency changed');assert(Buffer.from(text,'utf8').equals(raw),'Compile actual UTF8 bytes');return vm.runInContext(text,c,{filename:actual});
}
const sourceFile=path.join(L.repo,'tests/audio-presentation064.test.cjs'),raw=fs.readFileSync(sourceFile),text=L.decode(raw,sourceFile),boundary=/\r?\ntest\('production prepare uses original native buffers/.exec(text);
assert(boundary,'Qualified original WebAudio fixture boundary');const prefix=text.slice(0,boundary.index);assert.equal(L.sha(Buffer.from(L.LF(prefix))),meta.originalFixturePrefixCanonicalLFSHA256,'Existing WebAudio fixture changed');
let adapted=prefix;const operations=[];
function replace(before,after,label){assert.equal(adapted.split(before).length-1,1,'Exact fixture adaptation '+label);adapted=adapted.replace(before,after);operations.push({before,after});}
replace("const site=process.env.SOFFIOLIEVE_TEST_SITE||path.resolve(__dirname,'../_site'),sourceRoot=path.resolve(__dirname,'../src'),data=",'const site=L.site,sourceRoot=L.target,data=','portable source/site loader');
replace("vm.runInContext(fs.readFileSync(fs.existsSync(source)?source:path.join(site,name),'utf8'),data,{filename:name});",'loadActualProgram(data,name);','actual pinned data programs');
replace("vm.runInContext(fs.readFileSync(path.join(sourceRoot,'audio-playback.js'),'utf8'),c);","loadActualProgram(c,'audio-playback.js');",'actual pinned playback');
replace("vm.runInContext(fs.readFileSync(path.join(sourceRoot,'audio-engine.js'),'utf8'),c);","loadActualProgram(c,'audio-engine.js');",'actual current541 AudioEngine');
replace('miss=false,realBytes=false}={})','miss=false,realBytes=false,hitIndex=0,hitCount=2}={})','genuine context parameters');
replace('profile={species:moveId===16?521:500,id:moveId,frames:126,impact:60,nativeEffects:true}',"profile=moveId===541?{species:572,id:541,key:'training-572-541',kind:'tailSlam',chapter:true,training:true,nativeEffects:true,attachment:'mouth',target:'foe',damage:true,frames:126,impact:60,nativeTail541064:'native572-tail541-oam-partition/v1',nativeTailContext541:{hitIndex,hitCount}}:{species:moveId===16?521:500,id:moveId,frames:126,impact:60,nativeEffects:true}",'only qualified541 branch');
replace('requiredKeys:keys},nextKey=',"requiredKeys:keys,...(moveId===541?{profileSpecies:572,profileKey:profile.key,profileKind:profile.kind,profileMarker:profile.nativeTail541064,nativeTailContext541:{hitIndex,hitCount},nativeWaitGroups:false}:{})},nextKey=",'only541 contract metadata');
let inverse=adapted;for(const op of operations.slice().reverse()){assert.equal(inverse.split(op.after).length-1,1);inverse=inverse.replace(op.after,op.before);}assert.equal(inverse,prefix,'No undeclared fixture math/body rewrite');
const file=__filename+':qualified-existing-WebAudio-fixture';
const compiled="'use strict';const L=module.native541Loader,loadActualProgram=module.native541Load;\n"+adapted+'\nmodule.exports={fixture,data};\n';
let ownedFixtureModule=null,initialized=false,released=false;const completedCases=new Set();
function releaseOwnedFixture(){
 const m=ownedFixtureModule;if(!m)return;
 m.exports=null;m.native541Loader=null;m.native541Load=null;
 const owned=module.children.indexOf(m);if(owned>=0)module.children.splice(owned,1);
 ownedFixtureModule=null;
}
function fixture(...args){
 assert(!released,'Finite native541 audio fixture released after its four cases');
 if(!initialized){
  initialized=true;const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(__filename));m.native541Loader=L;m.native541Load=loadProgram;ownedFixtureModule=m;
  try{m._compile(compiled,file);}catch(error){released=true;releaseOwnedFixture();throw error;}
 }
 return Reflect.apply(ownedFixtureModule.exports.fixture,this,args);
}
function completeCase(id){
 assert(Number.isInteger(id)&&id>=0&&id<4,'Declared finite native541 audio case');completedCases.add(id);
 if(completedCases.size===4){released=true;releaseOwnedFixture();}
}
module.exports={fixture,completeCase};
