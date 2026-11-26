'use strict';
// PREPARED, NOT RUN. Real C11 M.play/acquireProfile/lease/stage/controller;
// native data + real Session, explicit Canvas-operation/audio-transport stand-ins.
// No fake raster/ACK supplied as evidence of a drawn native frame.
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{create}=require('../liepard-protocol064/real-stage-host.cjs'),L=require('../liepard-protocol064/strict-loader.cjs');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return{promise,resolve,reject};};
const drain=async()=>{for(let i=0;i<40;i++)await Promise.resolve();};
const turn=()=>new Promise(setImmediate);
const attestations=[],rss=[];
process.once('exit',()=>{if(process.env.C11_PROTOCOL_LEDGER)fs.writeFileSync(process.env.C11_PROTOCOL_LEDGER.replace(/\.json$/,'.real-stage.json'),JSON.stringify({status:'ACTUAL_EXECUTION_ATTESTATIONS_NOT_PREPARATION_PASS',scope:'Only executed CPU protocol fixtures. Audio transport and Canvas operations are stand-ins.',attestations,rssSnapshots:rss,maximumObservedRSS:Math.max(0,...rss)},null,2)+'\n');});
function fixture(){const h=create({variant:'v4.1'}),e=h.setup('p2',390,490),c=h.c,stage=c.LiepardMoves.staging064;require('./framing-observer.cjs').observeStageFraming(c);h.pins.gameFramingTrace=c.protocolTrace.stageFraming;assert.equal(h.pins.privateLiepard,L.contract.sourceLFHashes['liepard-moves.js']);assert.equal(h.pins.privateBG,L.contract.sourceLFHashes['battle-ground.js']);const bgSource=L.text(path.join(L.target,'battle-ground.js')).replace(/\r\n/g,'\n'),typed572="if(tail){const nativeData=JSON.stringify(bank.data)===tail.canonicalData;let partition=false;if(!nativeData&&graphic===572){try{partition=root.MinccinoMoves?.verifyNativeBank064?.(bank,view)?.kind===(view==='back'?'native572-back-cell7-oam-partition/v1':'native572-front-cell12-oam-partition/v1');}catch{}}if((!nativeData&&!partition)||",original572="if(tail){if(JSON.stringify(bank.data)!==tail.canonicalData||";assert.equal(bgSource.split(typed572).length-1,1,'Exactly one declared typed-native572 condition');assert.equal(require('node:crypto').createHash('sha256').update(bgSource.replace(typed572,original572)).digest('hex'),'828451711278ffe5c72d351b53109f7597bbb08e19bfe92e16bb8496bd47a19e','Only the declared native572 condition may differ from the historical BG');assert(h.pins.actualVMCompilations.every(p=>p.compiledTextRoundTripExact&&p.rawSHA256===p.actualCompiledUTF8SHA256));
 attestations.push(h.pins);rss.push(process.memoryUsage().rss);assert(rss.at(-1)<400*1024*1024,'observed fixture RSS must remain below400MiB');
 function start(){let error,settled=false;const promise=c.MoveFX.play(10,e.side,{cryIds:e.cryIds,targetSide:'p1'}).catch(x=>{error=x;}).finally(()=>settled=true);return{promise,get error(){return error;},get settled(){return settled;}};}
 async function active(job){const audio=await Promise.race([c.protocolAudioReached.promise,job.promise.then(()=>{throw job.error||Error('Call settled before real audio await');})]);assert.equal(c.MoveFX.active,null);audio.gate.resolve();await drain();assert(c.MoveFX.active,'Audio return must reach actual active commit');return{action:c.MoveFX.active,audio};}
 async function close(job){c.MoveFX.cancel();await job?.promise;assert(stage.stats.coldSAT<=8192*stage.stats.compilations,'unchanged per-compilation SAT budget');rss.push(process.memoryUsage().rss);assert(rss.at(-1)<400*1024*1024,'observed fixture RSS must remain below400MiB');stage.clear();global.gc?.();}
 function resize(w,h){c.SpeciesMoves.beforeArenaResize();c.arena.width=w;c.arena.height=h;return c.SpeciesMoves.afterArenaResize();}
 function gateNextStage(){const original=stage.prepare,gate=deferred(),calls=[];stage.prepare=async function(...args){calls.push(args);await gate.promise;return original.apply(this,args);};return{gate,calls,restore(){stage.prepare=original;}};}
 async function blocked(){await turn();await drain();}
 async function ready(){for(let i=0;i<10000;i++){c.syncBattleActorFraming();if(c.MoveFX.beforeArenaFrame?.(c.arena.width,c.arena.height)!==false&&c.SpeciesMoves.beforeArenaFrame())return;await turn();}throw Error('Fixture did not reach ready within10000 cooperative turns');}
 return{h,e,c,stage,start,active,close,resize,gateNextStage,blocked,ready};}


module.exports={fixture,deferred,drain,turn};
