'use strict';
// Actual selected src programs and original native bank data. Canvas operations
// and audio transport are explicit protocol fixtures, never raster/PCM proof.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),L=require('./strict-loader.cjs'),hash=L.sha;
const gp=path.join(L.fixtures,'native-geometry.json'),rawGeometry=fs.readFileSync(gp),geometryText=L.decode(rawGeometry,gp).replace(/^\uFEFF/,''),geometryCanonicalLFSHA256=hash(Buffer.from(L.LF(geometryText)));
assert.equal(geometryCanonicalLFSHA256,'eb88e84ef63bdb233cbfe77d2783483c5a53e57cdb6ffc2af08a2e4f31c52c59','Frozen derived geometry metadata changed');
const geometry=JSON.parse(geometryText),bankCopies=new Map();
function banks(){for(const [key,g]of Object.entries(geometry.banks)){if(bankCopies.has(key))continue;const jb=L.nativeAsset('assets/animated/'+key+'.json'),pb=L.nativeAsset('assets/animated/'+key+'.png');assert.equal(hash(jb),g.jsonSHA256);assert.equal(hash(pb),g.pngSHA256);const data=JSON.parse(L.decode(jb,key+'.json'));assert.equal(JSON.stringify(data),g.canonicalData);bankCopies.set(key,{data,image:{width:g.imageSize[0],height:g.imageSize[1],naturalWidth:g.imageSize[0],naturalHeight:g.imageSize[1],CPU_DIMENSIONS_ONLY_NOT_RASTER:true},groundBounds:g.groundBounds.slice()});}return bankCopies;}
function create({baseline=false,variant=process.env.LIEPARD_VARIANT||'v4.1',holdPredecessor=false}={}){
 assert.equal(baseline,false,'Portable protocol provider has no copied historical runtime baseline');assert(['v4.0','v4.1'].includes(variant));
 const startRecord=L.records.length;
 for(const file of ['liepard-moves.js','battle-ground.js','game.js','move-fx.js','double-battles.js'])L.validate(file);
 // Validate extracted public component parents, without executing duplicate
 // controller/adapter copies alongside the full selected Liepard program.
 L.validateFragment('controller');L.validateFragment('adapter');
 const c=require('./finale-host.cjs').setup({withoutLiepard:true});
 c.performance=performance;c.setTimeout=setTimeout;c.scheduler={yield:()=>new Promise(setImmediate)};c.Image=class{};c.GameSpeed={now:()=>1000,flush(){}};c.BattleEnvironment={context:{id:'route1',terrain:'grass'}};c.arena={width:390,height:490};
 for(const file of ['assets/form-sprites.js','assets/move-fx-data.js','assets/visual-camera.js','native-visual.js','native-audio.js','battle-diorama.js','double-rules.js','move-fx.js'])L.run(c,file);
 L.run(c,'battle-ground.js');for(const [key,b]of banks())c.ROM_SPRITE_ANIM.cache[key]={...b,ready:true,pending:false,groundBounds:b.groundBounds.slice()};c.document={createElement(){throw Error('Unexpected Canvas allocation');}};
 const gameOrigins=L.gameFragments(c);protocolEnvironment(c,holdPredecessor);L.run(c,'liepard-moves.js');
 function setup(side='p1',w=390,h=490){
  const ids=side==='p1'?[510,572]:[572,510],team=id=>[{name:id===510?'Liepard':'Minccino',level:54,moves:id===510?[10,45,154,289]:[1,3,47,541]}];
  c.session=new c.GEN5.Session(team(ids[0]),team(ids[1]),{seed:[1,2,3,4]});c.partner={id:ids[0],spriteId:ids[0]};c.enemy={id:ids[1],spriteId:ids[1]};c.visualState={p1:{},p2:{}};c.arena.width=w;c.arena.height=h;
  const framed=c.syncBattleActorFraming();assert(framed.supported,JSON.stringify(framed));
  const actors=Object.fromEntries(['p1','p2'].map(s=>{const n=c.session.battle[s].active[0],id=n.species.num;return[s,{nativeMon:n,graphic:id,slot:n.getSlot(),back:s==='p1',visible:true,bank:c.ROM_SPRITE_ANIM.cache[id+'-'+(s==='p1'?'back':'front')]}];})),layout=c.BattleGround.layout(w,h),p=c.SpeciesMoves.select(510,10);assert.equal(p.key,'training-510-10');
  return{c,p,layout,side,actors,cryIds:{p1:ids[0],p2:ids[1]},framing:c.BattleGround.framingStatus};
 }
 const source=L.read('liepard-moves.js'),bg=L.read('battle-ground.js'),pins={variant,contextRevision:'portable-protocol-v4-r1',sourceSite:L.target,privateLiepard:source.canonicalLFSHA256,privateBG:bg.canonicalLFSHA256,privateBGRaw:bg.rawSHA256,geometry:hash(rawGeometry),geometryCanonicalLFSHA256,geometryOriginalRawSHA256:L.contract.geometryRawSHA256,site:L.site,gameSyncOrigin:gameOrigins.sync,gameBPOOrigin:gameOrigins.BPO,sourceIdentityHashPolicy:'privateLiepard/privateBG identify canonicalLF source; privateBGRaw and compilation records separately identify raw bytes',validatedUTF8Programs:L.records.slice(startRecord).filter(r=>r.kind==='whole-source-validated-not-compiled'),actualVMCompilations:L.records.slice(startRecord).filter(r=>r.compiledTextRoundTripExact),sourceFragments:L.records.slice(startRecord).filter(r=>r.exactParentSubstring)};
 assert.equal(pins.privateBG,L.contract.sourceLFHashes['battle-ground.js']);assert(pins.actualVMCompilations.some(p=>p.logical==='battle-ground.js'&&p.kind==='whole-raw-program-compiled'));
 return{c,setup,geometry,pins};
}
function protocolEnvironment(c,holdPredecessor){
 const trace=c.protocolTrace={previousPrepare:[],previousPose:[],canvas:[],audio:[],flushes:0},oldPrepare=c.SpeciesMoves.prepare,oldPose=c.SpeciesMoves.pose;
 if(holdPredecessor){let resolve;c.protocolPredecessorGate={promise:new Promise(done=>resolve=done),resolve:()=>resolve()};}c.SpeciesMoves.prepare=function(...a){trace.previousPrepare.push(a);if(holdPredecessor)return c.protocolPredecessorGate.promise.then(()=>oldPrepare?.apply(this,a));return oldPrepare?.apply(this,a);};
 c.SpeciesMoves.pose=function(...a){trace.previousPose.push(a);return oldPose.apply(this,a);};
 let loading=null;
 function context(label){return{save(){},restore(){},setTransform(){},fillRect(...a){trace.canvas.push([label,'fill',...a]);},drawImage(...a){trace.canvas.push([label,'copy',...a]);}};}
 const arenaContext=context('arena');c.arena.getContext=()=>arenaContext;
 function element(tag){if(tag==='canvas')return{width:0,height:0,getContext:()=>context('surface')};return{dataset:{},children:[],textContent:'',replaceChildren(...a){this.children=[...a];},append(...a){this.children.push(...a);},remove(){if(loading===this)loading=null;}};}
 c.document={hidden:false,addEventListener(){},createElement:element,getElementById:id=>id==='loading'?loading:null,body:{append(x){if(x.id==='loading')loading=x;}}};
 c.protocolLoading=()=>loading;c.protocolSetForeignLoading=x=>loading=x;c.renderer={ready:true};
 c.Image=class{constructor(){this.complete=true;this.naturalWidth=this.width=1;this.naturalHeight=this.height=1;}addEventListener(){}};
 c.scheduler={yield:()=>new Promise(setImmediate),postTask:fn=>setImmediate(fn)};c.GameSpeed={rate:1,now:()=>performance.now(),flush(){trace.flushes++;},cancel(){}};c.clearTimeout=clearTimeout;
 const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};c.protocolAudioReached=deferred();
 c.AudioEngine={preloadMove:async()=>{},preloadEvents:async()=>{},cancelMove(){},async preparePresentation(){const gate=deferred(),audio={gate,cancelled:0,canPresent:()=>true,acknowledge(){},pause(){},resume(){},cancel(){audio.cancelled++;},async finish(){}};trace.audio.push(audio);c.protocolAudioReached.resolve(audio);await gate.promise;return audio;}};
 L.run(c,'battle-presentation.js');L.run(c,'assets/native-audio-bank.js');
 // syncBattleActorFraming is already the exact selected Game substring. No
 // replacement/no-op or halo-specific QA observer is installed by this host.
}
module.exports={create,geometry,repo:L.repo,site:L.site,sourceSite:L.target,hash};
