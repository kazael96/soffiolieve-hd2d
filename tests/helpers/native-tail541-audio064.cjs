'use strict';
// The existing WebAudio fixture is read from its original test, not replaced by
// another engine. Only its loaders and the declared541 profile/options adapt.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),Module=require('node:module'),assert=require('node:assert/strict'),L=require('./liepard-protocol064/strict-loader.cjs');
const closed541Names=['minccino-moves.js','demo-moves.js','battle-presentation.js','audio-engine.js','move-fx.js'];
assert.equal(L.contract.revision,'coherent-v4-closed541-m3-native-tail-whiff');assert.deepEqual(L.contract.closed541Lineage?.sourceLFHashChanges,closed541Names);
// Explicit current revision; immutable pre-M3 closed541 basis stays distinct.
const historical541File=path.join(L.fixtures,'source-contract-v4-closed541-before-m3tail064.json'),historical541Text=L.decode(fs.readFileSync(historical541File),historical541File);
assert.equal(L.sha(Buffer.from(L.LF(historical541Text))),'b73ec24834acde208c73da44239fbd2d199d70930b7c5248b601c1b346a8e2a9','Immutable pre-M3 closed541 contract changed');
const historical541=JSON.parse(historical541Text);assert.equal(historical541.revision,'coherent-v4-typed-native572-partitions-closed541-singles');
assert.equal(L.contract.previousClosed541ContractCanonicalLFSHA256,'b73ec24834acde208c73da44239fbd2d199d70930b7c5248b601c1b346a8e2a9');
assert.deepEqual(L.contract.closed541Lineage,historical541.closed541Lineage,'All five declared541 lineage fields remain exact');assert.deepEqual(L.contract.native572Lineage,historical541.native572Lineage,'Typed native572 contract unchanged');assert.deepEqual(L.contract.rawAssetSHA256,historical541.rawAssetSHA256,'Original native RAW roles/pins unchanged');
assert.deepEqual(L.contract.nativeM3TailLineage.sourceLFHashChanges,['minccino-moves.js','move-fx.js','battle-presentation.js','audio-engine.js'],'Only the four explicit M3 program changes are admitted by current strict contract');


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
const file=__filename+':qualified-existing-WebAudio-fixture',m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(__filename));m.native541Loader=L;m.native541Load=loadProgram;
const compiled="'use strict';const L=module.native541Loader,loadActualProgram=module.native541Load;\n"+adapted+'\nmodule.exports={fixture,data};\n';m._compile(compiled,file);
module.exports=m.exports;
