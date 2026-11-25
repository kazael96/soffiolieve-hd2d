'use strict';
// Exercise the complete actual loader against real files. No mocked hash/fs,
// copied runtime, raster, fake R.draw or source-program VM is used here.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const loaderFile=path.join(__dirname,'helpers/liepard-protocol064/strict-loader.cjs'),metadataFile=path.join(__dirname,'fixtures/liepard-protocol064/source-contract.json');
const loaderBytes=fs.readFileSync(loaderFile),hostBytes=fs.readFileSync(path.join(__dirname,'helpers/liepard-protocol064/real-stage-host.cjs')),metadataRaw=fs.readFileSync(metadataFile),metadataLF=metadataRaw.toString('utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n'),expected=JSON.parse(metadataLF),geometryRaw=fs.readFileSync(path.join(__dirname,'fixtures/liepard-protocol064/native-geometry.json')),geometryLF=geometryRaw.toString('utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n'),expectedGeometry=JSON.parse(geometryLF);
const repo=path.resolve(process.env.SOFFIOLIEVE_TEST_REPO||path.join(__dirname,'..')),actualSite=path.resolve(process.env.SOFFIOLIEVE_TEST_SITE||path.join(repo,'_site'));
function withActualLoader(metadata,fn){
 const base=fs.realpathSync(os.tmpdir()),directory=fs.mkdtempSync(path.join(base,'soffiolieve-provider-pins064-')),helper=path.join(directory,'tests/helpers/liepard-protocol064/strict-loader.cjs'),fixtures=path.join(directory,'tests/fixtures/liepard-protocol064'),site=path.join(directory,'_site');
 const keys=['SOFFIOLIEVE_TEST_REPO','SOFFIOLIEVE_TEST_SOURCE','SOFFIOLIEVE_TEST_SITE'],previous=Object.fromEntries(keys.map(key=>[key,process.env[key]])),exitBefore=new Set(process.rawListeners('exit'));
 try{
  fs.mkdirSync(path.dirname(helper),{recursive:true});fs.mkdirSync(fixtures,{recursive:true});fs.mkdirSync(site,{recursive:true});fs.writeFileSync(helper,loaderBytes);fs.writeFileSync(path.join(fixtures,'source-contract.json'),metadata);
  assert(fs.readFileSync(helper).equals(loaderBytes),'The actual loader must be compiled without source substitution');
  // Synchronous setup only: restore the shared environment before returning to
  // the event loop. The loader captures these owned fixture paths at startup.
  process.env.SOFFIOLIEVE_TEST_REPO=directory;process.env.SOFFIOLIEVE_TEST_SOURCE=path.join(directory,'src');process.env.SOFFIOLIEVE_TEST_SITE=site;
  let loader;try{loader=require(helper);}finally{for(const key of keys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}}
  return fn(loader,{directory,site,fixtures,loadHost(){const file=path.join(path.dirname(helper),'real-stage-host.cjs');fs.writeFileSync(file,hostBytes);assert(fs.readFileSync(file).equals(hostBytes),'Actual host copied without source substitution');return require(file);}});
 }finally{
  for(const key of keys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}
  // A fresh actual loader installs an exit ledger hook. Remove only listeners
  // added during this synchronous fixture so it cannot overwrite another test's
  // real provenance ledger at process exit.
  for(const listener of process.rawListeners('exit'))if(!exitBefore.has(listener))process.removeListener('exit',listener);
  delete require.cache[helper];
  delete require.cache[path.join(path.dirname(helper),'real-stage-host.cjs')];
  const resolved=fs.realpathSync(directory),relative=path.relative(base,resolved);
  assert(relative&&relative!=='..'&&!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative)&&path.dirname(resolved)===base&&path.basename(resolved).startsWith('soffiolieve-provider-pins064-'),'Cleanup must stay inside the exact owned temp directory');
  fs.rmSync(resolved,{recursive:true,force:false});
 }
}
test('actual provider loader accepts identical metadata with LF, CRLF and optional UTF8 BOM',()=>{
 const historicalRaw=fs.readFileSync(path.join(__dirname,'fixtures/liepard-protocol064/source-contract-v4-before-ambient064.json')),historicalLF=historicalRaw.toString('utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
 const priorRaw=fs.readFileSync(path.join(__dirname,'fixtures/liepard-protocol064/source-contract-v4-plus-ambient064.json')),priorLF=priorRaw.toString('utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');
 const digest=text=>require('node:crypto').createHash('sha256').update(text).digest('hex');
 assert.equal(digest(historicalLF),'0d8e384dcf67db3ff6199d23b5cafab647460b85bab68378649a3520df393b13','Preserved original V4 FULL contract canonicalLF integrity');
 assert.equal(digest(priorLF),'e11f3856e7d5870fcdf3378f7507f022996d6844257121b073fc463387c5893e','Preserved previous V4+ROI contract canonicalLF integrity');
 const historical=JSON.parse(historicalLF),prior=JSON.parse(priorLF),roi=JSON.parse(historicalLF);
 assert.equal(historical.sourceLFHashes['battle-diorama.js'],'e36f3903827cedcb0ebced1d747d3ea1c21f79fa6c982a341e4ed77de57ead9f');
 roi.sourceLFHashes['battle-diorama.js']='56bccd637d8e48cbe409c832ac48ae5de379e58b178701261c8ea2c5efdbf0d7';roi.status='ACTUAL_V4_PLUS_AMBIENT064_SOURCE_CONTRACT_NOT_EXECUTION';roi.revision='coherent-v4-plus-ambient064';roi.basisSourceManifestSHA256=roi.sourceManifestSHA256;delete roi.sourceManifestSHA256;
 assert.deepEqual(prior,roi,'Previous reviewed FULL to ROI migration must remain exact historical evidence');
 const restored=JSON.parse(priorLF);restored.sourceLFHashes['battle-diorama.js']=historical.sourceLFHashes['battle-diorama.js'];restored.status='ACTUAL_V4_ORIGINAL_FULL_RESTORED_SOURCE_CONTRACT_NOT_EXECUTION';restored.revision='coherent-v4-original-full-restored';restored.previousAmbientContractCanonicalLFSHA256=digest(priorLF);restored.originalFullContractCanonicalLFSHA256=digest(historicalLF);
 assert.deepEqual(expected,restored,'Only original FULL restoration and explicit historical provenance may migrate');
 assert.deepEqual(expected.sourceLFHashes,historical.sourceLFHashes,'R and every source pin must return to the original FULL set');
 for(const key of ['rawAssetSHA256','buildProgramRawSHA256','fragmentLFHashes','geometryRawSHA256','G7','policy'])assert.deepEqual(expected[key],historical[key],'Original contract remains exact: '+key);
 const variants=[Buffer.from(metadataLF),Buffer.from(metadataLF.replace(/\n/g,'\r\n')),Buffer.concat([Buffer.from([0xef,0xbb,0xbf]),Buffer.from(metadataLF)])];assert(!variants[0].equals(variants[1]));
 for(const raw of variants)withActualLoader(raw,L=>{assert.deepEqual(L.contract,expected);assert.equal(L.contract.sourceLFHashes['liepard-moves.js'],expected.sourceLFHashes['liepard-moves.js']);});
});
test('actual provider loader rejects a substantive metadata change despite valid JSON',()=>{
 const changed=metadataLF.replace('"coherent-v4-original-full-restored"','"coherent-v4-original-full-restored-substantively-changed"');assert.notEqual(changed,metadataLF);assert.doesNotThrow(()=>JSON.parse(changed));let callbackReached=false;
 assert.throws(()=>withActualLoader(Buffer.from(changed),()=>{callbackReached=true;}),/Frozen source contract metadata changed/);assert.equal(callbackReached,false);
});
test('actual provider host accepts the same derived geometry metadata with LF and CRLF',()=>{
 for(const raw of [Buffer.from(geometryLF),Buffer.from(geometryLF.replace(/\n/g,'\r\n'))])withActualLoader(Buffer.from(metadataLF),(_L,owned)=>{fs.writeFileSync(path.join(owned.fixtures,'native-geometry.json'),raw);const host=owned.loadHost();assert.deepEqual(host.geometry,expectedGeometry);});
});
test('actual provider host rejects a numeric change in derived geometry metadata',()=>{
 let replaced=false;const changed=geometryLF.replace(/("groundBounds"\s*:\s*\[\s*)(-?\d+(?:\.\d+)?)/,(all,prefix,value)=>{replaced=true;return prefix+(Number(value)+.25);});assert(replaced);assert.notEqual(JSON.parse(changed).banks['510-front'].groundBounds[0],expectedGeometry.banks['510-front'].groundBounds[0]);
 withActualLoader(Buffer.from(metadataLF),(_L,owned)=>{fs.writeFileSync(path.join(owned.fixtures,'native-geometry.json'),changed);assert.throws(()=>owned.loadHost(),/Frozen derived geometry metadata changed/);});
});
test('actual provider nativeAsset rejects changed raw native JSON even when parsed data stays equal',()=>{
 const file='assets/animated/510-front.json',original=fs.readFileSync(path.join(actualSite,file));
 withActualLoader(Buffer.from(metadataLF),(L,owned)=>{
  const target=path.join(owned.site,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,original);assert(L.nativeAsset(file).equals(original),'First verify genuine pinned raw input');
  const altered=Buffer.concat([original,Buffer.from(' ')]);assert.deepEqual(JSON.parse(altered.toString('utf8')),JSON.parse(original.toString('utf8')));fs.writeFileSync(target,altered);
  assert.throws(()=>L.nativeAsset(file),/Original native asset raw hash differs/);
 });
});
