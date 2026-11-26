/* One qualified Windows owner, using the existing bounded browser runner. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const FIXTURE_LF='5f71cc021464f64209b9b096f9a348462b7eb9f32658c9e7066f19f137adfd9e';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function utf8(raw,label){const s=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(raw);assert(Buffer.from(s).equals(raw),'Exact UTF8 roundtrip: '+label);return s;}
const lf=s=>s.replace(/\r\n/g,'\n');
function options(argv,{repo=path.resolve(__dirname,'..'),env=process.env}={}){
 const flags=new Map(),pos=[];
 for(const a of argv){if(a.startsWith('--')){const m=/^--(mode|viewport|rate|python|playwright|browser|renderer|lease-root)=(.+)$/.exec(a);assert(m,'Unknown native541 option: '+a);assert(!flags.has(m[1]),'Repeated native541 option: '+m[1]);flags.set(m[1],m[2]);}else pos.push(a);}
 assert(pos.length<=2,'Pass SITE OUT and explicit named options only');
 const mode=flags.get('mode');assert(['nominal','recovery'].includes(mode),'Explicit mode nominal/recovery required');
 const viewport=flags.get('viewport')||'desktop',rate=Number(flags.get('rate')||1),sizes={desktop:[1280,720],portrait:[390,844],landscape:[844,390]};
 assert(Object.hasOwn(sizes,viewport),'Unknown viewport');assert([1,2,4].includes(rate),'Exact rate1/2/4 required');
 if(mode==='recovery')assert(viewport==='desktop'&&rate===1,'Recovery is qualified only for desktop x1');
 const site=path.resolve(pos[0]||env.SOFFIOLIEVE_TEST_SITE||path.join(repo,'_site')),out=path.resolve(pos[1]||path.join(repo,'test-results','native541-'+mode+'-'+viewport+'-x'+rate));
 assert(out!==site&&!out.startsWith(site+path.sep),'Reports must be outside the build');
 const renderer=flags.get('renderer')||'software';assert(['software','auto'].includes(renderer),'Unknown renderer');
 return{repo:path.resolve(repo),site,out,mode,viewport:{name:viewport,width:sizes[viewport][0],height:sizes[viewport][1]},rate,renderer,sourceRoot:path.resolve(env.SOFFIOLIEVE_TEST_SOURCE||path.join(repo,'src')),python:flags.get('python'),playwright:flags.get('playwright')||'playwright',browser:flags.get('browser'),leaseRoot:path.resolve(flags.get('lease-root')||path.join(repo,'test-results','native541-owner'))};
}
function metadata(file,expected){const raw=fs.readFileSync(file),text=utf8(raw,file);assert.equal(sha(Buffer.from(lf(text))),expected,'Metadata canonicalLF changed: '+file);return JSON.parse(text);}
function validateFixtureMigration(fixture,repo){
 const historical=metadata(path.join(repo,'tests/fixtures/native-tail541-actual-pre-m3tail064.json'),'ba957688c66173899d9e83e101961fa370ddf36fb5f28a1f3b65e621c84e68ff');
 const expected={...historical,sourceContract:{...historical.sourceContract,canonicalLFSHA256:'891ac3550f34f5602e82032f784ed299dec052d50be9c3df586a60f331f9f0a8',revision:'coherent-v4-closed541-m3-tail-tynamo33-native-foe'}};
 assert.deepEqual(fixture,expected,'Actual541 fixture migration admits only the two explicit current source-contract fields; native/order/timing/limits stay historical');
 return fixture;
}


function validateSourceContractMigration(contract,repo){
 const previous=metadata(path.join(repo,'tests/fixtures/liepard-protocol064/source-contract-v4-m3tail-before-tynamo33064.json'),'a4af68356acbb8a7a335dbd1c93d23c7b55a62a361b9de8833b66b7300be747e');
 const changes={"species-moves.js":"149445824000e0bbd6f4dc17fe9207a10474c4cc2d00c5568c6c517b6ad6fc37","move-fx.js":"1f0e563be80263b4263332f89266aad8266ded2a196ed9a6ce9a0c48615887c9","game.js":"c5e14ea5afdca2f9f975476a9077a6f61c64cfd76b042a243775286546e98a13"},lineage={"schema":1,"sourceLFHashChanges":["species-moves.js","move-fx.js","game.js"],"sourceLFHashes":{"species-moves.js":"149445824000e0bbd6f4dc17fe9207a10474c4cc2d00c5568c6c517b6ad6fc37","move-fx.js":"1f0e563be80263b4263332f89266aad8266ded2a196ed9a6ce9a0c48615887c9","game.js":"c5e14ea5afdca2f9f975476a9077a6f61c64cfd76b042a243775286546e98a13"},"defaultNativeMetadata":{"relative":"assets/native-alpha-rle-v1/","indexSHA256":"032f32995bf3ab3d4477f3af4aca88b90fd04b61aa973679b8e04a9a32a9b0f9","inventorySHA256":"5f0269fb8c59b663a929c367f44c2f8a14b26bccea693b1d7219f3b2d3fcf5c6"},"libraryBoundary":"Absent BattleGround keeps base API; a later host does not auto-install; malformed supplied host rejects","renderHost":"Original index has BattleGround before SpeciesMoves; default native602/33 integration is installed there","rawAssetPinsRetainOriginalMeaning":true,"scope":"Declared shared source migration only; no new541 execution/Game/motion/PCM/Android approval"};
 const expected={...previous,status:'ACTUAL_V4_CLOSED541_M3_TAIL_TYNAMO33_NATIVE_FOE_SOURCE_CONTRACT_NOT_EXECUTION',revision:'coherent-v4-closed541-m3-tail-tynamo33-native-foe',sourceLFHashes:{...previous.sourceLFHashes,...changes},previousM3TailContractCanonicalLFSHA256:'a4af68356acbb8a7a335dbd1c93d23c7b55a62a361b9de8833b66b7300be747e',tynamo33NativeFoeLineage:lineage};
 assert.deepEqual(contract,expected,'Current shared source-contract migration admits only three qualified Tynamo runtime pins and explicit lineage; native/541/M3 fields stay historical');return contract;
}

function compiledSource(raw,label){return Buffer.from(lf(utf8(raw,label)));}
function verify399({repo,site,sourceRoot},fixture,build){
 const native=require('./observe-native-qa064.cjs'),appFile=path.join(site,'app.js'),app=fs.readFileSync(appFile),modules=native.inventory(utf8(app,appFile));
 assert.equal(modules.length,399);assert.equal(fixture.sourceOrder.length,399);assert.equal(new Set(fixture.sourceOrder.map(r=>r.file)).size,399);assert.deepEqual(modules.map(r=>r.file),fixture.sourceOrder.map(r=>r.file));assert.equal(build.archive_sha256,fixture.archiveSHA256,'Authenticated native base differs');
 const inputs=[],origins=[];
 for(let i=0;i<modules.length;i++){
  const actual=modules[i],decl=fixture.sourceOrder[i],file=path.join(decl.origin==='source'?sourceRoot:site,decl.file);assert(!path.isAbsolute(decl.file)&&!decl.file.split('/').includes('..'),'Relative source only');
  assert(fs.existsSync(file),'Missing actual selected source '+decl.file);const raw=fs.readFileSync(file),compiled=compiledSource(raw,file);assert.equal(actual.sha256,sha(compiled),'Compiled source differs: '+decl.file);assert.equal(actual.bytes,compiled.length);
  const siteFile=path.join(site,decl.file),siteRaw=fs.readFileSync(siteFile);assert.equal(sha(compiledSource(siteRaw,siteFile)),actual.sha256,'Normal static source differs from carrier: '+decl.file);
  if(decl.origin==='source'){assert.equal(build.files[decl.file],sha(raw),'Build source RAW declaration differs: '+decl.file);assert.equal(sha(siteRaw),sha(raw),'Normal source bytes differ from selected checkout');}
  else{assert.equal(decl.origin,'native-base-zip');assert.equal(decl.member,'soffiolieve/'+decl.file);assert.equal(sha(raw),decl.rawSHA256,'Native ZIP program RAW differs');assert.equal(actual.sha256,decl.compiledLFSHA256);assert.equal(actual.bytes,decl.compiledBytes);}
  inputs.push({path:file,sha256:sha(raw)});if(siteFile!==file)inputs.push({path:siteFile,sha256:sha(siteRaw)});origins.push({file:decl.file,origin:decl.origin,rawSHA256:sha(raw),compiledLFSHA256:actual.sha256,compiledBytes:actual.bytes});
 }
 assert.equal(origins.filter(r=>r.origin==='native-base-zip').length,10);return{modules,origins,inputs,appSHA256:sha(app)};
}
function nativeAssets(o,fixture,build){
 const helper=require('../tests/helpers/native572-assets064.cjs'),api=helper.create(o),assets={};
 for(const view of ['back','front']){
  const a=api.candidate(view);assert.equal(a.kind,fixture.kinds[view],'Real SITE must contain the exact declared partition; originals remain separate references');
  const key='/assets/animated/572-'+view+'.json',digest=sha(a.rawJSON),record=a.provenance.records.find(r=>r.relative===key.slice(1));assert(record);
  assets[key]={sha256:digest,bytes:a.rawJSON.length,sourceKind:'derived-json-build-assets-and-provenance',manifestSHA256:build.assets[key.slice(1)],provenanceSHA256:record.derivedJSONRawSHA256,referencePNGSHA256:null};
 }
 for(const[key,decl]of Object.entries(fixture.nativeAssets)){
  const b=fs.readFileSync(path.join(o.site,key.slice(1)));assert.equal(sha(b),decl.sha256,'Normal native asset RAW changed: '+key);assert.equal(b.length,decl.bytes);assets[key]={...decl,manifestSHA256:build.assets[key.slice(1)]??null};
  if(decl.sourceQualification){assert.equal(decl.sourceQualification.archiveSHA256,build.archive_sha256);assert.equal(decl.sourceQualification.member,'soffiolieve'+key);}
 }
 assert.equal(Object.keys(assets).length,10);return assets;
}
function prepare(o){
 const fixtureFile=path.join(o.repo,'tests/fixtures/native-tail541-actual064.json'),fixture=validateFixtureMigration(metadata(fixtureFile,FIXTURE_LF),o.repo),contractFile=path.join(o.repo,fixture.sourceContract.relative),contract=validateSourceContractMigration(metadata(contractFile,fixture.sourceContract.canonicalLFSHA256),o.repo);assert.equal(contract.revision,fixture.sourceContract.revision);
 // Explicit selected source is mandatory. Never fall back from an incomplete override.
 assert(fs.statSync(o.sourceRoot).isDirectory());for(const[file,digest]of Object.entries(contract.sourceLFHashes)){const source=path.join(o.sourceRoot,file),raw=fs.readFileSync(source);assert.equal(sha(compiledSource(raw,source)),digest,'Qualified runtime source differs: '+file);}
 const buildFile=path.join(o.site,'build.json'),build=JSON.parse(utf8(fs.readFileSync(buildFile),buildFile));assert.match(build.revision,/^[a-f0-9]{16}$/);
 const proof=verify399(o,fixture,build),assets=nativeAssets(o,fixture,build);assert(!fs.existsSync(o.out),'Output already exists; old evidence is preserved');
 const inputDir=o.out+'-inputs';assert(!fs.existsSync(inputDir),'Input receipt directory already exists');fs.mkdirSync(inputDir,{recursive:true});fs.mkdirSync(o.leaseRoot,{recursive:true});
 const expected399=path.join(inputDir,'expected399.json');fs.writeFileSync(expected399,JSON.stringify({modules:proof.modules},null,2)+'\n',{flag:'wx'});
 fs.writeFileSync(path.join(inputDir,'source-origins.json'),JSON.stringify({scope:'Actual current source and authenticated native base programs; no private snapshot dependency',appSHA256:proof.appSHA256,modules:proof.origins},null,2)+'\n',{flag:'wx'});
 const recovery=o.mode==='recovery',scope=recovery?'ONE_COMMITTED_UI_SWITCH2_WITH_REAL572BACK503_RETRY_AND_REMAINING_541P2_NOT_DIRECT_PREPARE_FAILURE':'FOUR_ORIGINAL_GEN5_UI_TURNS_BOTH_ROLES_COLD_WARM_NO_MOTION_OR_LISTENING_APPROVAL';
 const caseConfig={enabled:true,mode:recovery?'native541-recovery':'native541-nominal',candidateRevision:build.revision,scope,marker:fixture.marker,kinds:fixture.kinds,nativeVoiceSources:fixture.nativeVoiceSources,viewport:o.viewport,rate:o.rate};
 const dependencies=['scripts/test-native-tail541-actual064.cjs','scripts/observe-native-tail541064.cjs','scripts/helpers/native-tail541-fault064.cjs','scripts/observe-native-qa064.cjs','scripts/run-bounded-qa.cjs','scripts/limit-owned-qa.ps1','scripts/close-owned-browser.cjs','scripts/test-browser-headless.cjs','scripts/serve-browser-qa.py','scripts/build-browser-qa.cjs','scripts/native572_tail064.py','scripts/gym-preview052.cjs','scripts/finale-preview053.cjs','tests/browser-qa.js','tests/qa-tail-actual064.js','tests/qa-artifact-queue.js','tests/qa-input-health.js','tests/ambient-audit.js','tests/field-regression057.js','tests/field-hm-regression064.js','tests/qa-gust064.js','tests/qa-body-actions064.js','tests/qa-tail-reference064.js','tests/qa-tail-mixed064.js','tests/qa-gust-reference064.js','tests/fixtures/brycen-input-route.json','tests/fixtures/drayden-field-input.json','tests/helpers/native572-assets064.cjs','tests/fixtures/native572-original064/manifest.json'];
 const inputs=[...proof.inputs,...dependencies.map(f=>({path:path.join(o.repo,f)})),{path:fixtureFile},{path:path.join(o.repo,'tests/fixtures/native-tail541-actual-pre-m3tail064.json')},{path:contractFile},{path:path.join(o.repo,'tests/fixtures/liepard-protocol064/source-contract-v4-m3tail-before-tynamo33064.json')},{path:buildFile},{path:path.join(o.site,'app.js')},{path:expected399}];
 for(const key of Object.keys(assets))inputs.push({path:path.join(o.site,key.slice(1))});inputs.push({path:path.join(o.site,'assets/animated/572-tail-partition064.provenance.json')});
 for(const view of ['back','front'])for(const ext of ['json','png'])inputs.push({path:path.join(o.repo,'tests/fixtures/native572-original064/assets/animated/572-'+view+'.'+ext)});
 const unique=[...new Map(inputs.map(p=>[path.resolve(p.path),{path:path.resolve(p.path),sha256:sha(fs.readFileSync(p.path))}])).values()];
 const c={schema:1,enabled:true,status:recovery?'SEALED_ACTUAL541_RECOVERY_NOT_EXECUTED':'SEALED_ACTUAL541_NOT_EXECUTED',mode:caseConfig.mode,site:o.site,out:o.out,scope,candidateRevision:build.revision,candidateManifestSHA256:sha(fs.readFileSync(buildFile)),nativeObserver:path.join(o.repo,'scripts/observe-native-qa064.cjs'),expected399,inputs:unique,caseConfig,viewport:o.viewport,rate:o.rate,nativeAssets:assets,requiredResponsePaths:fixture.requiredResponsePaths,limits:{outerMs:240000,caseMs:180000,heapMiB:400,maxWebM:0,PNGTotalIncludingFailure:recovery?2:13,diagnosticStoredBytes:4194304,faultRecords:32,faultBytes:16384}};
 if(recovery){c.caseId='qaTail541RecoverySwitchP1064';c.fault={method:'GET',hostname:'127.0.0.1',pathname:'/assets/animated/572-back.json',v:build.revision,status:503,arm:'AFTER_BATTLE_READY_UNCACHED_PRECHECK_BEFORE_ORIGINAL_PARTY_INPUT',release:'AFTER_REAL_MANUAL_RECOVERY_OBSERVED',maxActualRequests:32,allowedNativeRetryStrings:['1','2']};}
 const configFile=path.join(inputDir,'config.json');fs.writeFileSync(configFile,JSON.stringify(c,null,2)+'\n',{flag:'wx'});return{configFile,config:c};
}
function tools(o){
 const pw=path.isAbsolute(o.playwright)?o.playwright:path.dirname(require.resolve(o.playwright+'/package.json'));
 assert(fs.statSync(pw).isDirectory());const version=JSON.parse(fs.readFileSync(path.join(pw,'package.json'),'utf8')).version;assert.equal(version,'1.62.1','Use the qualified pinned browser driver');
 const browser=path.resolve(o.browser||require(pw).chromium.executablePath());assert(fs.statSync(browser).isFile(),'Missing installed browser');assert(o.python&&path.isAbsolute(o.python),'Pass the setup-python absolute executable');assert(fs.statSync(o.python).isFile());return{playwright:pw,browser,python:o.python};
}
async function main(argv){
 assert.equal(process.platform,'win32','This actual UI owner is qualified on Windows only; no unqualified Linux fallback');
 const o=options(argv),t=tools(o),{configFile,config:c}=prepare(o),owner=require('./run-bounded-qa.cjs');
 const args=[o.site,o.out,'--tool=browser','--cases='+(o.mode==='recovery'?'qaTail541RecoverySwitchP1064':'qaTail541ActualP1064,qaTail541ActualP2064'),'--viewports='+o.viewport.name,'--timeout=180000','--fail-fast=true','--renderer='+o.renderer,'--lease-root='+o.leaseRoot,'--observer='+path.join(o.repo,'scripts/observe-native-tail541064.cjs'),'--browser='+t.browser,'--playwright='+t.playwright,'--python='+t.python];
 const previous=process.env.SOFFIOLIEVE_ACTUAL_TAIL541_CONFIG;process.env.SOFFIOLIEVE_ACTUAL_TAIL541_CONFIG=configFile;let report;
 try{report=await owner.run(owner.parse(args));}finally{if(previous===undefined)delete process.env.SOFFIOLIEVE_ACTUAL_TAIL541_CONFIG;else process.env.SOFFIOLIEVE_ACTUAL_TAIL541_CONFIG=previous;const unchanged=c.inputs.every(p=>sha(fs.readFileSync(p.path))===p.sha256);if(fs.existsSync(o.out))fs.writeFileSync(path.join(o.out,'source-after.json'),JSON.stringify({sourceUnchanged:unchanged,candidateRevision:c.candidateRevision,scope:c.scope},null,2)+'\n');assert(unchanged,'Actual source/input changed during replay');}
 assert(['PASS','REQUESTED_PASS'].includes(report.result),'Bounded actual541 owner failed; preserve the full report');return report;
}
if(require.main===module)main(process.argv.slice(2)).then(r=>console.log(r.result+' actual541 Windows owner; full receipts remain external')).catch(e=>{console.error(e);process.exitCode=1;});
module.exports={options,metadata,validateFixtureMigration,validateSourceContractMigration,compiledSource,verify399,nativeAssets,prepare,tools,main,FIXTURE_LF};
