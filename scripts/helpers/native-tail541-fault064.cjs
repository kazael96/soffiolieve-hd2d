'use strict';
// PRIVATE proposal: called by a distinct recovery mode, never by nominal mode.
// Does not launch a browser or change any app source/API.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const zlib=require('node:zlib');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const timestamp=/^\|t:\|\d+$/,canonical=s=>({...s,log:s.log.map(v=>typeof v==='string'&&timestamp.test(v)?'|t:|0':v)}),positions=s=>s.log.flatMap((v,i)=>typeof v==='string'&&timestamp.test(v)?[i]:[]);
function validateCase(p,c){
 assert.equal(p.status,'ACTUAL541_SWITCH_RESOURCE_RECOVERY_TECHNICAL_PASS_VISUAL_REVIEW_REQUIRED');assert(!p.error);assert.equal(p.sourceModules,399);assert(p.actualCommand&&p.explicitPreviewCalls===0&&p.explicitRdraw===0&&p.assetRouteOverrides===1&&p.expectedFaultRouteOnly);
 assert.equal(p.turns.length,1);assert.equal(p.actions.length,2);assert.equal(p.coldProofs.length,2);assert.deepEqual(p.errors,[]);assert.equal(p.overflow,0);assert.equal(p.command.count,1);assert.equal(p.command.choice,'switch 2');
 const t=p.turns[0],r=p.recovery;assert.equal(t.phase,'recovery-command');assert.equal(r.state,'RECOVERED');assert.equal(r.gateKey,'sprites:572-back');assert(r.entryAndPromiseStable&&r.manualObserved);assert.equal(r.settlement.state,'resolved');assert.equal(r.settlement.count,1);assert(r.manualNetwork.faultCount>0&&r.manualNetwork.success200===0&&r.manualNetwork.armed);assert(r.networkAfter.faultCount>0&&r.networkAfter.success200>0&&!r.networkAfter.armed);assert(['ORIGINAL_MANUAL_BUTTON','AUTOMATIC_AFTER_RELEASE_NOT_MANUAL_CLAIM'].includes(r.resumePath));
 for(const [actual,expected]of[[t.before,t.forecastBefore],[p.command.before,t.before],[p.command.after,t.expected],[r.firstPending,t.expected],[r.manualNative,t.expected],[t.after,t.expected]]){assert.deepEqual(canonical(actual),canonical(expected));assert.deepEqual(positions(actual),positions(expected));}
 assert.equal(r.cursorBefore,t.cursorBefore);assert.equal(r.firstPendingCursor,t.cursorBefore);assert.equal(r.manualCursor,t.cursorBefore);assert(r.firstPendingBusy&&r.manualBusy);assert.equal(r.cursorAfter,t.after.log.length);assert.equal(t.after.active.p2.pp[0],t.before.active.p2.pp[0]-1);assert.equal(t.attempt.hitCount,2);assert.equal(t.attempt.miss,false);
 assert.equal(p.captures.length,2);assert.deepEqual(p.captures.map(v=>v.label),['pending','recovered']);assert.equal(r.actualBackProof.kind,c.caseConfig.kinds.back);
 for(let i=0;i<2;i++){
  const row=p.actions[i];assert.equal(row.phase,'recovery-command');assert.equal(row.side,'p2');assert.equal(row.context.hitIndex,i);assert.equal(row.context.hitCount,2);assert.equal(row.miss,false);assert.equal(row.profile.marker,c.caseConfig.marker);assert.equal(row.profile.frames,126);assert.equal(row.profile.impact,60);assert.equal(row.source.kind,c.caseConfig.kinds.front);assert.equal(row.required.length,48);assert.equal(new Set(row.required).size,48);assert.deepEqual(row.keys.map(k=>k.frame).sort((a,b)=>a-b),row.required);assert(row.keys.every(k=>k.bothOriginalPositiveBodies&&k.originalClockShown&&k.newRequiredAck));assert(row.nativeStateUnchanged);assert.deepEqual(row.before,row.after);assert(row.spa.length>0&&row.spa.every(v=>v.nativeFrame>=0&&v.nativeFrame<=39));
  const s=row.audio;assert.equal(s.mode,'native-battle-presentation');assert(!s.droppedLogs);assert.equal(s.voices.length,2);const onsets=s.ledger.filter(v=>v.event==='voice-onset');assert.equal(onsets.length,2);for(let j=0;j<2;j++){const v=s.voices[j],o=onsets[j];assert.equal(v.order,j);assert.equal(v.id,[1651,1427][j]);assert.equal(v.onsetFrame,60);assert.equal(v.nativeStart,0);assert.equal(v.nativeEnd,39);assert.equal(o.order,j);assert.equal(o.id,v.id);assert.equal(o.onsetFrame,60);assert.equal(o.ackFrame,60);assert(c.caseConfig.nativeVoiceSources.includes(v.src));}assert(s.finished||s.cancelled);assert(s.backend.closed&&s.backend.activeRecords===0);
 }
 for(const ar of p.arenas){if(!ar.newRequiredAck){assert.equal(ar.accepted,false);continue;}assert(ar.accepted&&ar.newRequiredKeys.length===1&&ar.newRequiredKeys[0]===ar.frame&&!ar.clockBefore.shown.includes(ar.frame)&&ar.clockSnapshot.shown.includes(ar.frame));assert(ar.bothBodies&&ar.originalClockShown&&ar.completed);assert(['p1','p2'].every(role=>ar.marks.some(m=>m.side===role&&m.mainPaint&&m.alpha>0&&m.recordMatches&&m.arenaSerial===ar.serial&&m.tokenId===ar.tokenId)));assert.deepEqual(ar.rootMatrix.actual,ar.rootMatrix.expected);for(const k of['offsetX','offsetY','lift'])assert(ar.attackerShadow.options[k]===0);assert.equal(ar.attackerShadow.options.scale,1);}
 for(const value of Object.values(p.restoration))assert.equal(value,true);assert(p.restoration.actualAct&&p.restoration.requiredNativeBindings);assert(p.teardown.active&&!p.teardown.battling&&!p.teardown.busy&&!p.teardown.contextLost);assert.deepEqual(p.teardown.resourceGateKeys,[]);return p;
}
async function installRecovery(page,{config,out}){
 assert(config.enabled===true&&config.caseConfig.enabled===true,'Recovery config remains disabled until reviewed/sealed');
 assert.equal(config.caseId,'qaTail541RecoverySwitchP1064');assert.equal(config.fault.pathname,'/assets/animated/572-back.json');assert.equal(config.fault.status,503);
 const target=config.nativeAssets[config.fault.pathname];assert(target&&target.sha256===target.manifestSHA256&&target.sha256===target.provenanceSHA256,'C15 derived asset/provenance required');
 assert.equal(config.candidateRevision,config.fault.v);assert.equal(config.limits.PNGTotalIncludingFailure,2);assert.equal(config.limits.diagnosticStoredBytes,4194304);
 const screenshot=page.screenshot,requests=new WeakMap(),tasks=[];let armed=false,closed=false,serial=0,primary=null,sinkCount=0,finalReceiptMetadata=null;
 const report={schema:1,status:'INSTALLED_NOT_ARMED',candidateRevision:config.candidateRevision,armed:false,faultCount:0,success200:0,records:[],diagnostics:[],errors:[],errorCounts:[],errorCalls:0,captures:[],restoration:{},overflow:0,routeRemoved:false};
 const write=()=>{const b=Buffer.from(JSON.stringify(report)+'\n');assert(b.length<=16384,'Recovery network metadata16KiB');fs.writeFileSync(path.join(out,'fault-ledger.json'),b);};
 const record=v=>{assert(report.records.length<32,'Recovery network32records');report.records.push(v);write();};
 // Unique full stacks are retained once; repetitions have explicit counts.
 const recordError=e=>{const text=String(e.stack||e),key=sha(Buffer.from(text)),row=report.errorCounts.find(v=>v.sha256===key);report.errorCalls++;if(row)row.count++;else{report.errors.push(text);report.errorCounts.push({sha256:key,count:1});}};
 const fail=e=>{primary??=e;report.status='FAIL';recordError(e);try{write();}catch(metadataError){
  // Do not let a second logging failure escape a route/response catch. The RAW
  // network16KiB assertion still failed; this diagnostic cannot qualify a PASS.
  report.overflow++;report.metadataBudgetFailed=true;recordError(metadataError);
  try{const raw=Buffer.from(JSON.stringify(report)+'\n'),encoded=zlib.gzipSync(raw);assert(encoded.length<=16384,'Failed-ledger diagnostic stored16KiB');const file='fault-ledger-overflow.json.gz',target=path.join(out,file);fs.writeFileSync(target,encoded);const stored=fs.readFileSync(target),decoded=zlib.gunzipSync(stored,{maxOutputLength:raw.length});assert(stored.equals(encoded)&&decoded.equals(raw),'Failure diagnostic exact readback');const header={schema:1,status:'FAIL_METADATA_16K_BUDGET_NOT_QUALIFIED',faultCount:report.faultCount,success200:report.success200,errorCalls:report.errorCalls,uniqueErrors:report.errorCounts.length,overflow:report.overflow,primaryCaseError:String(primary.message||primary),fullFailedLedger:{file,bytes:stored.length,sha256:sha(stored),rawBytes:raw.length,rawSHA256:sha(raw),encoding:'gzip-json-utf8',roundtripExact:true,budgetQualified:false}};const b=Buffer.from(JSON.stringify(header)+'\n');assert(b.length<=16384,'Failure header16KiB');fs.writeFileSync(path.join(out,'fault-ledger.json'),b);}catch(evidenceError){recordError(evidenceError);report.failureEvidenceError=String(evidenceError.message||evidenceError);/* original primary is thrown by owned close */}
 }};
 const exact=u=>u.hostname==='127.0.0.1'&&u.pathname===config.fault.pathname;
 const query=u=>{assert.equal(u.protocol,'http:');assert.deepEqual(u.searchParams.getAll('v'),[config.candidateRevision]);const retry=u.searchParams.getAll('asset_retry');assert(retry.length===0||retry.length===1&&['1','2'].includes(retry[0]),'Only original RuntimeAssets.bytes retry1/2');assert.deepEqual([...u.searchParams.keys()],retry.length?['v','asset_retry']:['v']);};
 const pattern=u=>exact(u);
 const handler=async route=>{
  const request=route.request(),u=new URL(request.url());
  if(primary){fail(primary);try{await route.abort('failed');}catch(abortError){fail(abortError);}return;}
  try{query(u);assert.equal(request.method(),'GET');assert(!closed,'Late owned route after closure');
   if(!armed)return await route.continue();
   assert(report.faultCount<32,'Actual fault count bound');const id=++serial,row={event:'OWNED_503',id,url:u.href,status:503,utc:new Date().toISOString(),fulfilled503:true,responseObserved:false,console:null};requests.set(request,row);report.faultCount++;record(row);
   await route.fulfill({status:503,contentType:'text/plain; charset=utf-8',headers:{'cache-control':'no-store'},body:'Intentional isolated native572 recovery probe'});
  }catch(e){fail(e);try{await route.abort('failed');}catch(abortError){fail(abortError);} }
 };
 const response=r=>{
  const u=new URL(r.url());if(!exact(u))return;
  if(tasks.length>=32){fail(Error('Actual target responses bound'));return;}tasks.push((async()=>{try{
   query(u);const own=requests.get(r.request());
   if(r.status()===503){assert(own?.fulfilled503&&own.url===u.href,'Unowned503 cannot be whitelisted');own.responseObserved=true;write();return;}
   assert.equal(r.status(),200,'Only owned503 or real200 allowed for target');assert(!own,'A fault fulfilled503 must not become a synthetic200');const b=await r.body();assert.equal(b.length,target.bytes);assert.equal(sha(b),target.sha256);report.success200++;record({event:'ORIGINAL_200_VALIDATED',url:u.href,status:200,sha256:sha(b),bytes:b.length,manifestSHA256:target.manifestSHA256,provenanceSHA256:target.provenanceSHA256});
  }catch(e){fail(e);}})());
 };
 // Existing observer may exempt ONLY responses proved by this owned request map.
 const isExpectedFault=r=>r.status()===503&&requests.get(r.request())?.url===r.url();
 const isExpectedFaultConsole=m=>{
  if(m.type()!=='error')return false;let u;try{u=new URL(m.location().url);}catch{return false;}
  if(!exact(u)||!/^Failed to load resource:.*\b503\b/.test(m.text()))return false;
  try{query(u);const row=report.records.find(v=>v.fulfilled503&&v.url===u.href&&!v.console);assert(row,'503 console needs an actual owned request');row.console={text:m.text(),location:m.location()};write();return true;}catch(e){fail(e);return false;}
 };
 page.on('response',response);await page.route(pattern,handler);
 const status=()=>({armed,faultCount:report.faultCount,success200:report.success200,errors:report.errors.slice(),overflow:report.overflow});
 await page.exposeFunction('Native541RecoveryFault064',command=>{
  if(primary)throw primary;assert(!closed,'Owned fault adapter unavailable');
  if(command==='arm'){assert(!armed&&report.faultCount===0&&report.success200===0);armed=true;report.armed=true;report.status='ARMED';record({event:'ARMED'});}
  else if(command==='release'){assert(armed&&report.faultCount>0);armed=false;report.armed=false;report.status='RELEASED_TO_ORIGINAL_NETWORK';record({event:'RELEASED'});}
  else assert.equal(command,'status');return status();
 });
 const addPNG=(label,b)=>{
  assert(report.captures.length<2,'Two PNG maximum including failures');assert(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Original PNG required');
  const file='recovery-'+label+'.png';fs.writeFileSync(path.join(out,file),b,{flag:'wx'});const v={label,file,sha256:sha(b),bytes:b.length};report.captures.push(v);write();return v;
 };
 await page.exposeFunction('CaptureNative541Recovery064',async(label,dataURL)=>{
  if(primary)throw primary;assert(!closed);assert(['pending','recovered'].includes(label));assert(!report.captures.some(v=>v.label===label));
  if(label==='pending'){assert(armed&&report.faultCount>0&&report.success200===0);return addPNG(label,await Reflect.apply(screenshot,page,[{type:'png'}]));}
  assert(!armed&&report.success200>0);assert(typeof dataURL==='string'&&dataURL.startsWith('data:image/png;base64,')&&dataURL.length<4*1024*1024);return addPNG(label,Buffer.from(dataURL.slice('data:image/png;base64,'.length),'base64'));
 });
 // Called by recovery mode INSTEAD OF the nominal sink, preserving compact4MiB.
 const storeReceipt=p=>{
  assert.equal(p.side,'p2');assert(['after-turn-before-teardown','failure-before-restore','after-restore'].includes(p.label));assert(++sinkCount<=3,'Three full-stage receipts maximum');
    const raw=Buffer.from(JSON.stringify(p)+'\n'),rawSHA256=sha(raw),limit=4*1024*1024,encoding='gzip-json-utf8',name=p.side+'-'+p.label+'.json.gz',target=path.join(out,name);let encoded;
    try{
     encoded=zlib.gzipSync(raw);assert(encoded.length<=limit,'Case diagnostic4MiB STORED gzip exceeds cap: encoded='+encoded.length+', RAW='+raw.length);
     fs.writeFileSync(target,encoded,{flag:'wx'});const stored=fs.readFileSync(target);assert.equal(stored.length,encoded.length);assert(stored.length<=limit,'Stored gzip4MiB cap');assert(stored.equals(encoded),'Stored gzip bytes changed');
     const decoded=zlib.gunzipSync(stored,{maxOutputLength:raw.length});assert.equal(decoded.length,raw.length);assert(decoded.equals(raw),'Whole JSON RAW byte roundtrip differs');assert.equal(sha(decoded),rawSHA256);
     const d={file:name,side:p.side,label:p.label,sourceStage:p.label,sha256:sha(stored),bytes:stored.length,encodedBytes:stored.length,rawBytes:raw.length,rawSHA256,encoding,artifactLimitBytes:limit,artifactLimitAppliesTo:'stored gzip only; RAW size is separately explicit',roundtripExact:true,status:p.status,error:p.error||null};report.diagnostics.push(d);if(p.label==='after-restore')finalReceiptMetadata=d;write();return d;
    }catch(error){
     const primaryError=p.error||p.errors?.[0]||String(error.stack||error);report.primaryCaseError??=primaryError;
     const scalar={schema:1,status:'FAIL_DIAGNOSTIC_ENCODING_OR_BUDGET',side:p.side,label:p.label,sourceStage:p.label,sourceStatus:p.status,encodedBytes:encoded?.length??null,rawBytes:raw.length,rawSHA256,encoding,artifactLimitBytes:limit,artifactLimitAppliesTo:'stored gzip only',encodedArtifactWritten:fs.existsSync(target),fullPayloadQualified:false,primaryError,encodingError:String(error.stack||error),caseError:p.error||null,firstObserverError:p.errors?.[0]||null};
     const failureName=p.side+'-'+p.label+'-encoding-failure.json',bytes=Buffer.from(JSON.stringify(scalar)+'\n');fs.writeFileSync(path.join(out,failureName),bytes,{flag:'wx'});report.diagnostics.push({file:failureName,side:p.side,label:p.label,sourceStage:p.label,sha256:sha(bytes),bytes:bytes.length,status:scalar.status,error:primaryError,rawBytes:raw.length,rawSHA256,encodedBytes:encoded?.length??null,encoding,fullPayloadQualified:false});write();throw error;
    }
 };
 await page.exposeFunction('SaveActualTail541Receipt064',storeReceipt);
 const screenshotOwned=async function(options){
  // Original driver failure diagnostic: keep total PNG<=2, never create a third.
  if(!/-failure\.png$/.test(path.basename(options?.path||''))){record({event:'SUCCESS_PAGE_EXTRA_SUPPRESSED_NO_PNG',file:path.basename(options?.path||'')});return Buffer.alloc(0);}
  if(report.captures.length>=2){record({event:'FAILURE_PNG_SUPPRESSED_TOTAL_ALREADY_TWO',file:path.basename(options?.path||'')});return Buffer.alloc(0);}
  const b=await Reflect.apply(screenshot,this,arguments);report.captures.push({label:'original-driver-failure',file:path.basename(options.path),sha256:sha(b),bytes:b.length});write();return b;
 };
 page.screenshot=screenshotOwned;write();
 return{
  report,isExpectedFault,isExpectedFaultConsole,
  async validate(){await Promise.all(tasks);if(primary)throw primary;assert(report.faultCount>0&&report.success200>0&&!armed&&report.errors.length===0&&report.overflow===0);const d=finalReceiptMetadata;assert(d?.roundtripExact&&d.encoding==='gzip-json-utf8','Verified final gzip receipt required');const stored=fs.readFileSync(path.join(out,d.file));assert.equal(stored.length,d.bytes);assert.equal(sha(stored),d.sha256);const raw=zlib.gunzipSync(stored,{maxOutputLength:d.rawBytes});assert.equal(raw.length,d.rawBytes);assert.equal(sha(raw),d.rawSHA256);const p=JSON.parse(raw.toString('utf8'));if(p.error){report.primaryCaseError=p.error;write();throw Error(p.error);}return validateCase(p,config);},
  async close(){let error;closed=true;armed=false;report.armed=false;try{await page.unroute(pattern,handler);report.routeRemoved=true;}catch(e){error=e;fail(e);}page.off('response',response);report.restoration.screenshot=page.screenshot===screenshotOwned;if(report.restoration.screenshot)page.screenshot=screenshot;else{error??=Error('Foreign screenshot binding preserved');fail(error);}await Promise.all(tasks);error=primary||error||(report.errors.length||report.overflow?Error(report.errors[0]||'Recovery closure overflow'):null);if(error){report.status='FAIL';report.primaryCaseError??=String(error.stack||error);}try{write();}catch(metadataError){fail(metadataError);error=primary||error||metadataError;}if(error)throw error;}
 };
}
module.exports={installRecovery,validateCase};
