'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),Module=require('node:module'),crypto=require('node:crypto'),assert=require('node:assert/strict'),os=require('node:os');
const repo=path.resolve(process.env.SOFFIOLIEVE_TEST_REPO||path.join(__dirname,'../../..')),target=path.resolve(process.env.SOFFIOLIEVE_TEST_SOURCE||path.join(repo,'src')),site=path.resolve(process.env.SOFFIOLIEVE_TEST_SITE||path.join(repo,'_site')),fixtures=path.resolve(__dirname,'../../fixtures/liepard-protocol064');
const records=[],sha=b=>crypto.createHash('sha256').update(b).digest('hex'),LF=text=>text.replace(/\r\n/g,'\n');
function decode(raw,file){const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(raw);assert(Buffer.from(text,'utf8').equals(raw),'strict UTF8 raw roundtrip '+file);return text;}
const contractRaw=fs.readFileSync(path.join(fixtures,'source-contract.json')),contractText=decode(contractRaw,'source-contract.json');
assert.equal(sha(Buffer.from(LF(contractText.replace(/^\uFEFF/,'')))),'b73ec24834acde208c73da44239fbd2d199d70930b7c5248b601c1b346a8e2a9','Frozen source contract metadata changed');
const contract=JSON.parse(contractText.replace(/^\uFEFF/,''));assert.equal(contract.schema,1);
const native572Module=require('../native572-assets064.cjs'),native572=native572Module.create({repo,site,sourceRoot:target});
function within(root,file){const relative=path.relative(root,file);return relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative));}
function sourcePath(file){assert(typeof file==='string'&&!path.isAbsolute(file)&&!file.split(/[\\/]/).includes('..'),'Relative source name required');if(file.startsWith('assets/')||Object.hasOwn(contract.buildProgramRawSHA256,file))return path.join(site,file);assert(Object.hasOwn(contract.sourceLFHashes,file),'Unlisted actual source '+file);const selected=path.join(target,file);return fs.existsSync(selected)?selected:path.join(repo,'src',file);}
function resolve(file){if(!path.isAbsolute(file))return sourcePath(file);const absolute=path.resolve(file);for(const root of [target,path.join(repo,'src')])if(within(root,absolute))return sourcePath(path.relative(root,absolute).split(path.sep).join('/'));assert(within(site,absolute),'No private/frozen runtime source path permitted: '+absolute);return absolute;}
function read(file){
 const actual=resolve(file),raw=fs.readFileSync(actual),text=decode(raw,actual),rawSHA256=sha(raw),canonicalLFSHA256=sha(Buffer.from(LF(text)));
 let logical=null;if(within(site,actual))logical=path.relative(site,actual).split(path.sep).join('/');else for(const root of [target,path.join(repo,'src')])if(within(root,actual)){logical=path.relative(root,actual).split(path.sep).join('/');break;}
 assert(logical,'Unresolved program identity');const asset=contract.rawAssetSHA256[logical]||contract.buildProgramRawSHA256[logical];
 if(native572Module.identify(logical)){assert(raw.equals(native572.actualAsset(logical)),'Actual qualified native572 asset bytes');}else if(asset)assert.equal(rawSHA256,asset,'Original build input raw hash changed: '+logical);else{assert(Object.hasOwn(contract.sourceLFHashes,logical),'Unlisted source '+logical);assert.equal(canonicalLFSHA256,contract.sourceLFHashes[logical],'Actual source differs from the qualified source contract: '+logical);}
 return{file:actual,logical,raw,text,rawSHA256,canonicalLFSHA256};
}
function text(file){return read(file).text;}
function validate(file){const r=read(file);records.push({kind:'whole-source-validated-not-compiled',file:r.file,logical:r.logical,rawSHA256:r.rawSHA256,canonicalLFSHA256:r.canonicalLFSHA256,exact:true});return r;}
function run(c,file){const r=read(file),compiled=Buffer.from(r.text,'utf8');assert(compiled.equals(r.raw));records.push({kind:'whole-raw-program-compiled',engine:'vm.runInContext',file:r.file,logical:r.logical,rawSHA256:r.rawSHA256,canonicalLFSHA256:r.canonicalLFSHA256,actualCompiledUTF8SHA256:sha(compiled),compiledTextRoundTripExact:true});return vm.runInContext(r.text,c,{filename:r.file});}
function extract(file,start,end,{includeEnd=false,includeEOL=false,label='source-fragment',bound=null}={}){
 const r=validate(file),a=r.text.indexOf(start);assert(a>=0&&r.text.indexOf(start,a+1)===-1,'Unique exact fragment start required: '+label);const found=r.text.indexOf(end,a+start.length);assert(found>a,'Exact fragment end required: '+label);
 const limit=bound?r.text.indexOf(bound,a+start.length):r.text.length;assert(limit>found&&(!bound||r.text.indexOf(bound,limit+bound.length)===-1),'Unique reviewed fragment scope required: '+label);const repeated=r.text.indexOf(end,found+end.length);assert(repeated<0||repeated>=limit,'Ambiguous fragment end in reviewed scope: '+label);
 let b=found+(includeEnd?end.length:0);if(includeEOL){if(r.text.slice(b,b+2)==='\r\n')b+=2;else if(r.text[b]==='\n')b++;}
 const code=r.text.slice(a,b),rawStart=Buffer.byteLength(r.text.slice(0,a)),rawEnd=Buffer.byteLength(r.text.slice(0,b)),raw=r.raw.subarray(rawStart,rawEnd);assert(raw.equals(Buffer.from(code,'utf8')),'Fragment must be exact raw parent bytes');
 return{file:r.file,logical:r.logical,text:code,raw,parentRawSHA256:r.rawSHA256,parentCanonicalLFSHA256:r.canonicalLFSHA256,startUTF16:a,endUTF16:b,startByte:rawStart,endByte:rawEnd,label,rawSHA256:sha(raw),canonicalLFSHA256:sha(Buffer.from(LF(code)))};
}
function fragmentRecord(f,engine){return{kind:'exact-parent-substring-compiled',engine,file:f.file,logical:f.logical,label:f.label,parentRawSHA256:f.parentRawSHA256,parentCanonicalLFSHA256:f.parentCanonicalLFSHA256,startUTF16:f.startUTF16,endUTF16:f.endUTF16,startByte:f.startByte,endByte:f.endByte,rawSHA256:f.rawSHA256,canonicalLFSHA256:f.canonicalLFSHA256,actualCompiledUTF8SHA256:sha(Buffer.from(f.text)),compiledTextRoundTripExact:true,exactParentSubstring:true};}
function runFragment(c,f){records.push(fragmentRecord(f,'vm.runInContext'));return vm.runInContext(f.text,c,{filename:f.file+':'+f.label});}
function slice(c,file,start,end){return runFragment(c,extract(file,start,end));}
const IIFE_END="})(typeof window!=='undefined'?window:globalThis);";
function componentFragment(kind){
 assert(['controller','adapter','planner'].includes(kind));let f,key;
 if(kind==='planner'){f=extract('liepard-moves.js'," const nativeScratchMarker064='private-native-claw-SPA170';",' D.attachment=',{label:'liepard-planner-bridge'});key='planner-bridge-selected-slice';}
 else{const start=kind==='controller'?'/* PRIVATE510/10 layout barrier.':'/* PRIVATE adapter; explicit install only after source geometry is feasible. */',bound=kind==='controller'?'/* PRIVATE adapter; explicit install only after source geometry is feasible. */':'/* Liepard510/Scratch10:';f=extract('liepard-moves.js',start,IIFE_END,{includeEnd:true,includeEOL:true,label:'liepard-'+kind,bound});key=kind==='controller'?'layout-controller.js':'stage-adapter.js';}
 assert.equal(f.canonicalLFSHA256,contract.fragmentLFHashes[key],'Exact embedded component differs: '+kind);return f;
}
function validateFragment(kind){return componentFragment(kind);}
let controllerModule=null;
function controller(){
 if(controllerModule)return controllerModule;
 const f=componentFragment('controller'),file=sourcePath('liepard-moves.js')+':controller-fragment',m=new Module(file,module),owner=typeof globalThis.window==='undefined'?globalThis:globalThis.window,before=Object.getOwnPropertyDescriptor(owner,'LiepardLayoutController064');
 m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(sourcePath('liepard-moves.js')));records.push(fragmentRecord(f,'CommonJS Module._compile (Node wrapper around exact fragment)'));
 try{m._compile(f.text,file);controllerModule=m.exports;}finally{if(before)Object.defineProperty(owner,'LiepardLayoutController064',before);else assert(Reflect.deleteProperty(owner,'LiepardLayoutController064'),'Controller fixture export cleanup');}
 assert.equal(typeof controllerModule.create,'function');assert.equal(typeof controllerModule.canvasCache,'function');return controllerModule;
}
function gameFragments(c){
 const bpo=extract('game.js','window.BattlePresentationOwners=','function syncBattleActorFraming(){',{label:'Game.BattlePresentationOwners'}),sync=extract('game.js','function syncBattleActorFraming(){','function drawArena(){',{label:'Game.syncBattleActorFraming'});
 runFragment(c,bpo);runFragment(c,sync);return{BPO:{...fragmentRecord(bpo,'vm.runInContext')},sync:{...fragmentRecord(sync,'vm.runInContext')}};
}
function json(file){const raw=fs.readFileSync(file),text=decode(raw,file);return JSON.parse(text.replace(/^\uFEFF/,''));}
function originalNativeAsset(file){assert(native572Module.identify(file),'Reference API is only for the four immutable native572 RAW inputs');return native572.originalAsset(file);}
function nativeAsset(file){assert(Object.hasOwn(contract.rawAssetSHA256,file),'Unlisted native/build asset '+file);if(native572Module.identify(file)){validate('minccino-moves.js');const raw=native572.actualAsset(file);records.push({kind:'actual-SITE-native572-qualified-graph',logical:file,rawSHA256:sha(raw),originalRawSHA256:contract.rawAssetSHA256[file],referenceRole:'separate immutable RAW fixture; no SITE redirection'});return raw;}const raw=fs.readFileSync(path.join(site,file));assert.equal(sha(raw),contract.rawAssetSHA256[file],'Original native asset raw hash differs: '+file);return raw;}
function ensureLedger(id){assert(/^[a-z0-9-]+$/.test(id));if(process.env.C11_PROTOCOL_LEDGER)return process.env.C11_PROTOCOL_LEDGER;const directory=process.env.SOFFIOLIEVE_TEST_LEDGER_DIR||fs.mkdtempSync(path.join(os.tmpdir(),'soffiolieve-liepard064-'));fs.mkdirSync(directory,{recursive:true});const file=path.join(directory,id+'-'+process.pid+'.json');assert(!fs.existsSync(file),'Preserve previous source ledger');process.env.C11_PROTOCOL_LEDGER=file;return file;}
process.once('exit',()=>{const report={schema:1,scope:'Actual raw whole programs vs exact parent substrings are distinct; not raster/PCM/browser proof.',sourceContract:contract.revision,records};if(process.env.C11_PROTOCOL_LEDGER)fs.writeFileSync(process.env.C11_PROTOCOL_LEDGER,JSON.stringify(report,null,2)+'\n');});
module.exports={repo,root:repo,target,sourceRoot:target,site,fixtures,contract,read,text,run,slice,validate,extract,runFragment,componentFragment,validateFragment,controller,gameFragments,nativeAsset,originalNativeAsset,json,ensureLedger,sha,LF,decode,records,sourcePath};
