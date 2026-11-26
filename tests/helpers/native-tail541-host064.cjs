'use strict';
// Portable existing-host adapter. Policy bank/images/audio transport/marks;
// no Game, R.draw, PCM or turn simulation is claimed by these tests.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),Module=require('node:module'),assert=require('node:assert/strict'),L=require('./liepard-protocol064/strict-loader.cjs');
const cfg={repo:L.repo,site:L.site},closed541Names=['minccino-moves.js','demo-moves.js','battle-presentation.js','audio-engine.js','move-fx.js'];
assert.equal(L.contract.revision,'coherent-v4-closed541-m3-tail-tynamo33-native-foe');
assert.deepEqual(L.contract.closed541Lineage?.sourceLFHashChanges,closed541Names,'Only the explicitly migrated five-source contract is accepted');
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



for(const file of closed541Names){assert(Object.hasOwn(L.contract.sourceLFHashes,file));assert(fs.existsSync(path.join(L.target,file)),'Explicit closed541 source missing');L.validate(file);}
function candidate(c,file){assert(closed541Names.includes(file),'Declared closed541 program');assert(fs.existsSync(path.join(L.target,file)),'Explicit five-source selection must exist');const r=L.read(file);assert.equal(r.canonicalLFSHA256,L.contract.sourceLFHashes[file]);return L.run(c,file);}
function finale(){const file=path.join(cfg.repo,'tests/helpers/liepard-protocol064/finale-host.cjs'),m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m.require=id=>id==='./strict-loader.cjs'?{...L,run(c,f){if(f==='minccino-moves.js'){c.original541Samples=[];for(const object of [c.ChapterMoves,c.DemoMoves]){const old=object.sample;object.sample=function(...args){const value=Reflect.apply(old,this,args);if(args[0]?.nativeTail541064==='native572-tail541-oam-partition/v1')c.original541Samples.push({value,snapshot:Reflect.ownKeys(value).map(key=>[key,value[key]])});return value;};}}return closed541Names.includes(f)?candidate(c,f):L.run(c,f);}}:Module.prototype.require.call(m,id);m._compile(fs.readFileSync(file,'utf8'),file);return m.exports;}
const drain=()=>new Promise(setImmediate),defer=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
function host({side='p1',original=false}={}){
 if(global.gc)global.gc();
 const c=finale().setup(),R=c.ROM_SPRITE_ANIM,events=[],transports=[],legacyTimers=new Map();let now=10000,serial=0,resourceGate=null,audioGate=null,resourceError=null,finishGate=null;
 Object.assign(c,{console,performance:{now:()=>now},setTimeout:()=>null,clearTimeout(){},Image:class{constructor(){this.complete=true;this.naturalWidth=16;this.policyImage=true;}set src(v){this.url=v;}},document:{hidden:false,addEventListener(){}},arena:{width:1280,height:720},visualState:{p1:{},p2:{}},partner:{name:'Minccino',id:572},enemy:{name:'Minccino',id:572}});
 const actors={p1:{species:{num:572},hp:50},p2:{species:{num:572},hp:50}};c.session={battle:{gameType:'singles',p1:{active:[actors.p1]},p2:{active:[actors.p2]}},double:false,multi:false,active(role){return this.battle[role].active[0];}};
 for(const view of ['back','front']){const logical='assets/animated/572-'+view+'.json',raw=original?L.originalNativeAsset(logical):L.nativeAsset(logical);R.cache['572-'+view]={ready:true,pending:false,data:JSON.parse(raw.toString('utf8')),image:{policyImage:true,complete:true,naturalWidth:512,naturalHeight:256},groundBounds:view==='back'?[-35,-49,23,0]:[-21,-49,36,0]};}
 const originalPrepare=R.prepare,originalDraw=R.draw;R.prepare=async function(keys){events.push(['prepare',Array.from(keys)]);if(resourceError){const error=resourceError;resourceError=null;throw error;}const gate=resourceGate;resourceGate=null;if(gate)await gate.promise;return true;};R.draw=()=>{throw Error('No raster permitted in this policy host');};
 c.GameSpeed={rate:1,now:()=>now,schedule(fn,ms){legacyTimers.set(++serial,{fn,ms});return serial;},cancel(id){legacyTimers.delete(id);},flush(){events.push('flush');}};
 function transport(){const t={cancelled:false,canPresent(){return true;},acknowledge(f,next){events.push(['ack',f,next]);},pause(f){events.push(['pause',f]);},resume(f){events.push(['resume',f]);},cancel(){this.cancelled=true;events.push(['ownAudioCancel',transports.indexOf(this)]);},finish(){events.push('finish');return finishGate?.promise||Promise.resolve({cancelled:false});}};transports.push(t);return t;}
 c.AudioEngine={cancelMove(){events.push('globalCancel');},async preloadMove(){},beginMove(){events.push('legacyBegin');},async preparePresentation(audio,options){events.push(['audioPrepare',JSON.parse(JSON.stringify(options))]);const t=transport(),gate=audioGate;audioGate=null;if(gate){await gate.promise;return t;}return t;}};
 for(const f of ['assets/move-fx-data.js','assets/native-audio-bank.js','native-audio.js','native-visual.js','battle-ground.js'])L.run(c,f);
 const game=L.extract('game.js','function acquireTynamo33Render064(','\nfunction syncBattleActorFraming',{label:'actual Game acquisition declaration and owner-reader'});L.runFragment(c,game);
 candidate(c,'battle-presentation.js');candidate(c,'move-fx.js');
 function start(context={hitIndex:0,hitCount:2},options={}){const rawOptions={cryIds:{p1:572,p2:572},targetSide:side==='p1'?'p2':'p1',context,...options},promise=c.MoveFX.play(541,side,rawOptions),settled=promise.then(value=>({value}),error=>({error}));return{promise,settled,options:rawOptions};}
 async function drawAll(){const M=c.MoveFX,keys=Array.from(M.presentationState().clock.required),seen=[];for(const expected of keys){now+=10000;assert.equal(M.beforeArenaFrame(1280,720),true);const token=M.beginArenaFrame();assert(token);assert.equal(token.token.frame,expected);M.speciesPose(side,572);M.markArenaActor('p1',572);M.markArenaActor('p2',572);const ack=M.presentedArenaFrame(token,true);assert(ack);seen.push(ack.frame);}await drain();return seen;}
 return{c,R,side,events,transports,legacyTimers,start,drawAll,drain,setNow(value){now=value;},holdResources(){resourceGate=defer();return resourceGate;},holdAudio(){audioGate=defer();return audioGate;},holdFinish(){finishGate=defer();return finishGate;},failResources(){resourceError=Error('Fixture owned R.prepare503');},restore(){c.MoveFX.cancel();R.prepare=originalPrepare;R.draw=originalDraw;},get now(){return now;}};
}
module.exports={host,drain};
