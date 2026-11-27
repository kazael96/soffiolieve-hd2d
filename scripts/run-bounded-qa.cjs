/* One invisible owned browser batch. Wraps the tracked QA runner unchanged. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto'),{performance}=require('node:perf_hooks');
const LIMITS=Object.freeze({deadlineMs:240000,heapMiB:400,pngBytes:64*1024*1024,diskFloorBytes:220*1024*1024,monitorMs:2500});
function parse(argv){
 const own=new Map(),rest=[];
 for(const arg of argv){const m=/^--(tool|rates|recovery|lease-root|observer)=(.*)$/.exec(arg);if(m){if(own.has(m[1]))throw Error('Repeated bounded option '+m[1]);own.set(m[1],m[2]);}else rest.push(arg);}
 const tool=own.get('tool')||'browser';if(!['browser','intro-release','slots','introduction','start'].includes(tool))throw Error('Invalid bounded tool');
 if(!own.get('lease-root'))throw Error('Pass --lease-root=ABS_REVIEW_DIRECTORY');
 let startCases;
 if(tool!=='browser'){
  for(const flag of ['preview',...(tool==='introduction'?[]:['fail-fast','timeout'])])if(rest.some(a=>a.startsWith('--'+flag+'=')))throw Error('Original '+tool+' API does not support --'+flag);
  const cases=rest.filter(a=>a.startsWith('--cases='));if(cases.length){if(tool!=='start'||cases.length!==1)throw Error('Original '+tool+' API does not support that cases selection');startCases=cases[0].slice(8);rest.splice(rest.indexOf(cases[0]),1);}
  if(tool==='start'){startCases??='fresh,legacy-restart,corrupt-changed,unavailable,asset-recovery';const kinds=startCases.split(',');if(!kinds.length||new Set(kinds).size!==kinds.length||kinds.some(k=>!['fresh','legacy-restart','corrupt-changed','unavailable','asset-recovery'].includes(k)))throw Error('Invalid original start cases');}
  if(!rest.some(a=>a.startsWith('--renderer=')))rest.push('--renderer=software');
 }
 if(!rest.some(a=>a.startsWith('--timeout=')))rest.push('--timeout='+(tool==='browser'?220000:120000));
 const o=require('./test-browser-headless.cjs').options(rest);if(o.timeout>LIMITS.deadlineMs)throw Error('Case timeout exceeds outer240s budget');
 if(tool==='introduction'&&o.timeout<30000)throw Error('Original introduction API requires at least30000ms per case');
 if(!path.isAbsolute(own.get('lease-root')))throw Error('lease-root must be absolute');
 if(!path.isAbsolute(o.browser||'')||!path.isAbsolute(o.playwright)||(tool==='browser'&&!path.isAbsolute(o.python)))throw Error('Pass absolute browser, Python (browser tool) and Playwright paths');
 const rates=own.get('rates');if(rates!==undefined&&(!/^[124](?:,[124])*$/.test(rates)||new Set(rates.split(',')).size!==rates.split(',').length))throw Error('Invalid bounded rates');
 if(rates!==undefined&&!['browser','intro-release'].includes(tool))throw Error('Original '+tool+' API does not support rate subsets');
 const recovery=own.get('recovery');if(recovery!==undefined&&(tool!=='intro-release'||!['true','false'].includes(recovery)))throw Error('Recovery selection is supported only by intro-release');
 const observer=own.get('observer');if(observer!==undefined&&!path.isAbsolute(observer))throw Error('Observer must be an absolute module path');
 return {...o,tool,cases:tool==='browser'?o.cases:tool==='start'?startCases:undefined,leaseRoot:path.resolve(own.get('lease-root')),rates,recovery,observer};
}
function acquire(o){
 if(fs.existsSync(o.out))throw Error('Report output already exists; previous evidence will not be overwritten');
 if(!fs.statSync(o.leaseRoot).isDirectory())throw Error('Lease root must be a directory');
 const lease=path.join(o.leaseRoot,'.bounded-qa-lease.json'),token=crypto.randomUUID(),record={schema:1,pid:process.pid,created:new Date().toISOString(),token,out:o.out};
 const fd=fs.openSync(lease,'wx');try{fs.writeFileSync(fd,JSON.stringify(record,null,2)+'\n');}finally{fs.closeSync(fd);}
 try{fs.mkdirSync(o.out,{recursive:false});}catch(error){release({lease,token});throw error;}
 return {lease,token};
}
function release(owner){try{const row=JSON.parse(fs.readFileSync(owner.lease,'utf8'));if(row.token===owner.token)fs.unlinkSync(owner.lease);}catch(error){if(error.code!=='ENOENT')throw error;}}
function resources(out){let pngBytes=0,pngCount=0;function visit(dir){for(const row of fs.readdirSync(dir,{withFileTypes:true})){if(row.isSymbolicLink())continue;const p=path.join(dir,row.name);if(row.isDirectory())visit(p);else if(row.isFile()&&/\.png$/i.test(row.name)){pngBytes+=fs.statSync(p).size;pngCount++;}}}visit(out);const stat=fs.statfsSync(out),freeBytes=Number(stat.bavail)*Number(stat.bsize);return {pngBytes,pngCount,freeBytes};}
function resourceFailure(sample){if(sample.pngBytes>LIMITS.pngBytes)return 'PNG evidence exceeds64MiB';if(sample.freeBytes<LIMITS.diskFloorBytes)return 'Free disk below220MiB';return null;}
function ownedProcess(mode,pid,startTicks,receipts,onMetrics){
 const started=performance.now();
 return new Promise((resolve,reject)=>{const args=['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'limit-owned-qa.ps1'),'-Mode',mode,'-OwnedPid',String(pid),...(startTicks?['-ExpectedStartTicks',String(startTicks)]:[]),...(receipts?['-PinnedProcessesJson',JSON.stringify(receipts)]:[])];
  cp.execFile('powershell.exe',args,{windowsHide:true,timeout:10000,maxBuffer:1024*1024},(error,stdout,stderr)=>{
   const clipped=(value,limit)=>{const raw=Buffer.from(String(value??''));return{text:raw.subarray(0,limit).toString('utf8'),bytes:raw.length,truncated:raw.length>limit};};
   const failure=message=>{const detail={mode:clipped(mode,16).text,pid:Number.isInteger(pid)?pid:null,code:typeof error?.code==='number'?error.code:typeof error?.code==='string'?clipped(error.code,48).text:null,killed:typeof error?.killed==='boolean'?error.killed:null,signal:typeof error?.signal==='string'?clipped(error.signal,24).text:null,stdout:clipped(stdout,512),stderr:clipped(stderr,512)},e=Error(message);e.message+=' [owned-helper '+JSON.stringify(detail)+']';e.ownedProcessDiagnostics=detail;return e;};
   let result,primary;try{result=JSON.parse(stdout.replace(/^\uFEFF/,''));}catch{primary=failure('Owned PID helper failed: invalid JSON reply');}
   if(!primary){if(result.result==='FAIL')primary=failure(result.error);else if(error)primary=failure('Owned PID helper failed: process rejected after JSON reply');}
   if(typeof onMetrics==='function'){
    const phases=[],seen=new Set(),pattern=/^OWNED_QA_PHASE (ENTER|INTEROP|NATIVE|DONE) (\d+(?:\.\d+)?)$/;
    for(const line of String(stderr??'').split(/\r?\n/)){const match=pattern.exec(line);if(!match||seen.has(match[1]))continue;const elapsedMs=Number(match[2]);if(!Number.isFinite(elapsedMs)||elapsedMs>Number.MAX_SAFE_INTEGER)continue;seen.add(match[1]);phases.push({phase:match[1],elapsedMs});if(phases.length===4)break;}
    try{onMetrics({mode:clipped(mode,16).text,pid:Number.isInteger(pid)?pid:null,wallElapsedMs:performance.now()-started,phases});}catch(metricsError){if(!primary)primary=metricsError;}
   }
   if(primary)reject(primary);else resolve(result);
  });});
}
// Private stdio transport. The PS host retains only historical ownership receipts;
// it takes a new Toolhelp snapshot and rechecks births for every operation.
function createOwnedSession({out,onLedger,onMetrics}){
 const sessionStarted=performance.now(),maxBytes=1024*1024,requestMs=10000,token=crypto.randomUUID(),ledgerPath=path.join(out,'owned-helper-ledger.json');
 if(!path.isAbsolute(out)||fs.existsSync(ledgerPath)||fs.existsSync(ledgerPath+'.pending'))throw Error('Owned helper ledger must be fresh');
 const keys=(v,list)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length!==list.length||Object.keys(v).some(k=>!list.includes(k)))throw Error('Owned helper message schema');};
 const integer=n=>Number.isInteger(n)&&n>0&&n<=2147483647,ticks=n=>typeof n==='string'&&/^\d{1,20}$/.test(n);
 const receipts=new Map(),queue=[],pending=new Set();let state='STARTING',serial=0,active=null,buffer=Buffer.alloc(0),startupBytes=0,startupStderr='',startupStderrBytes=0,owner,firstFailure,closing=false,closingFinal=false,closedReply=false;
 let readyResolve,readyReject,exitResolve;
 const ready=new Promise((resolve,reject)=>{readyResolve=resolve;readyReject=reject;}),exited=new Promise(resolve=>{exitResolve=resolve;});
 // A rejection handler is attached before any child event; callers still receive it.
 ready.catch(()=>{});
 const child=cp.spawn('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'limit-owned-qa.ps1'),'-Mode','Birth','-OwnedPid',String(process.pid),'-Session','-SessionToken',token,'-LedgerPath',ledgerPath],{windowsHide:true,stdio:['pipe','pipe','pipe']});
 const {TextDecoder}=require('node:util'),decoder=new TextDecoder('utf-8',{fatal:true});
 const clipped=value=>{const bytes=Buffer.from(String(value??''));return{text:bytes.subarray(0,512).toString('utf8'),bytes:bytes.length,truncated:bytes.length>512};};
 const failure=(message,item)=>{const stdout=clipped(item?.wire||''),stderr=clipped(item?item.stderr:startupStderr);stdout.bytes=item?.bytes??startupBytes;stdout.truncated=stdout.bytes>512;stderr.bytes=item?.stderrBytes??startupStderrBytes;stderr.truncated=stderr.bytes>512;const detail={mode:item?.mode||'Ready',pid:item?.pid??child.pid??null,requestId:item?.id??0,code:'OWNED_SESSION_FAILED',killed:child.killed===true,signal:child.signalCode??null,stdout,stderr},error=Error(message+' [owned-helper '+JSON.stringify(detail)+']');error.ownedProcessDiagnostics=detail;return error;};
 function row(value){
  const allowed=['pid','startTicks','depth','affinity','priority','stopped'];
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!allowed.includes(k))||!integer(value.pid)||!ticks(value.startTicks)||!Number.isInteger(value.depth)||value.depth<0||value.depth>2147483647)throw Error('Invalid persistent owned receipt');
  if(value.affinity!==undefined&&(typeof value.affinity!=='string'||!/^\d{1,19}$/.test(value.affinity)))throw Error('Invalid owned affinity');
  if(value.priority!==undefined&&(typeof value.priority!=='string'||value.priority.length>32))throw Error('Invalid owned priority');
  if(value.stopped!==undefined&&value.stopped!==true)throw Error('Invalid owned Stop receipt');
  return{pid:value.pid,startTicks:value.startTicks,depth:value.depth};
 }
 function remember(values){if(!Array.isArray(values))throw Error('Owned receipts must be an array');for(const value of values){const r=row(value);receipts.set(r.pid+':'+r.startTicks,r);}onLedger?.([...receipts.values()]);}
 function recoverLedger(){
  if(!fs.existsSync(ledgerPath))return [...receipts.values()];
  if(fs.lstatSync(ledgerPath).isSymbolicLink()||fs.statSync(ledgerPath).size>maxBytes)throw Error('Invalid persistent ledger file');
  const saved=JSON.parse(fs.readFileSync(ledgerPath,'utf8'));
  keys(saved,['schema','token','helperPid','helperStartTicks','parentPid','parentStartTicks','processes']);
  if(saved.schema!==1||saved.token!==token||saved.helperPid!==child.pid||!ticks(saved.helperStartTicks)||saved.parentPid!==process.pid||!ticks(saved.parentStartTicks)||(owner&&(saved.helperStartTicks!==owner.startTicks||saved.parentStartTicks!==owner.parentStartTicks)))throw Error('Foreign persistent ownership ledger');
  remember(saved.processes);return [...receipts.values()];
 }
 function finish(item,error,value){
  clearTimeout(item.timer);
  if(item.mode!=='Close')try{onMetrics?.({mode:item.mode,pid:item.pid,wallElapsedMs:performance.now()-item.started,phases:item.phases});}catch(metricsError){if(!error)error=metricsError;}
  if(active===item)active=null;
  error?item.reject(error):item.resolve(value);
 }
 function die(message){
  if(state==='DEAD'||state==='CLOSED')return;
  state='DEAD';clearTimeout(startupTimer);firstFailure??=failure(message,active);
  try{recoverLedger();}catch(error){firstFailure.message+=' [ledger recovery: '+clipped(error.message).text+']';}
  readyReject(firstFailure);
  if(active)finish(active,firstFailure);
  for(const item of queue.splice(0))finish(item,failure(message,item));
  // Only this original ChildProcess capability is used; never a process-name search.
  if(child.exitCode===null&&child.signalCode===null)try{child.kill();}catch(error){firstFailure.message+=' [original helper child kill: '+clipped(error.message).text+']';}
 }
 function pump(){
  if(state!=='READY'||active||!queue.length)return;
  const item=queue.shift();active=item;
  if(performance.now()-item.started>=requestMs){die('Owned helper request expired in queue');return;}
  const message=item.mode==='Close'?{kind:'close',id:item.id,token}:{kind:'request',id:item.id,token,mode:item.mode,pid:item.pid,startTicks:item.startTicks,receipts:item.receipts};
  const line=JSON.stringify(message)+'\n';if(Buffer.byteLength(line)>maxBytes){die('Owned helper request exceeds1MiB');return;}
  try{child.stdin.write(line,error=>{if(error)die('Owned helper stdin rejected');});}catch(error){die('Owned helper stdin write failed: '+clipped(error.message).text);}
 }
 function frame(value){
  if(state==='STARTING'){
   if(performance.now()-sessionStarted>=requestMs)throw Error('Owned helper READY past deadline10s');
   keys(value,['kind','token','pid','startTicks','parentPid','parentStartTicks','affinity','priority']);
   if(value.kind!=='ready'||value.token!==token||value.pid!==child.pid||!ticks(value.startTicks)||value.parentPid!==process.pid||!ticks(value.parentStartTicks)||typeof value.affinity!=='string'||!/^\d{1,19}$/.test(value.affinity)||value.priority!=='BelowNormal')throw Error('Invalid owned helper READY');
   const count=BigInt(value.affinity).toString(2).split('').filter(bit=>bit==='1').length;if(count!==Math.min(2,require('node:os').availableParallelism()))throw Error('Helper READY CPU count');
   owner={pid:value.pid,startTicks:value.startTicks,parentPid:value.parentPid,parentStartTicks:value.parentStartTicks,affinity:value.affinity,priority:value.priority,readyWallElapsedMs:performance.now()-sessionStarted};
   recoverLedger();clearTimeout(startupTimer);state='READY';readyResolve(owner);pump();return;
  }
  if(!active||value.token!==token||value.id!==active.id)throw Error('Stale or unsolicited owned helper reply');
  if(performance.now()-active.started>=requestMs)throw Error('Owned helper reply past deadline10s including queue');
  if(value.kind==='fatal'){keys(value,['kind','token','id','error']);throw Error(typeof value.error==='string'?value.error:'Invalid helper failure');}
  if(value.kind==='phase'){
   keys(value,['kind','token','id','phase','elapsedMs']);const order=['ENTER','INTEROP','NATIVE','DONE'],index=order.indexOf(value.phase),previous=active.phases.at(-1);
   if(index<0||!Number.isFinite(value.elapsedMs)||value.elapsedMs<0||value.elapsedMs>Number.MAX_SAFE_INTEGER||active.phases.some(p=>p.phase===value.phase)||(previous&&(order.indexOf(previous.phase)>=index||previous.elapsedMs>value.elapsedMs)))throw Error('Invalid owned helper phase');
   active.phases.push({phase:value.phase,elapsedMs:value.elapsedMs});return;
  }
  if(value.kind==='ledger'){keys(value,['kind','token','id','processes']);remember(value.processes);return;}
  if(value.kind==='closed'){
   keys(value,['kind','token','id']);if(active.mode!=='Close')throw Error('Unexpected owned helper shutdown');closedReply=true;finish(active,null,{result:'CLOSED'});return;
  }
  keys(value,['kind','token','id','value']);if(value.kind!=='result'||active.mode==='Close')throw Error('Invalid owned helper result');
  const result=value.value,allowed=['result','pid','startTicks','mode','processes','error'];
  const pinnedStop=active.mode==='Stop'&&active.receipts.length>0;
  if(!result||typeof result!=='object'||Object.keys(result).some(k=>!allowed.includes(k))||!['PASS','GONE','FAIL'].includes(result.result)||(result.pid!==active.pid&&!(pinnedStop&&result.pid===undefined))||!Array.isArray(result.processes)||(result.mode!==undefined&&result.mode!==active.mode)||(result.startTicks!==undefined&&!ticks(result.startTicks)))throw Error('Malformed owned helper result');
  if(result.result==='PASS'&&!pinnedStop&&!ticks(result.startTicks))throw Error('Missing owned helper result birth');
  if(result.result==='PASS'&&(active.mode!=='Birth'&&result.startTicks!==undefined&&result.startTicks!==active.startTicks))throw Error('Owned helper returned foreign birth');
  if(pinnedStop){
   // Original pinned Stop acknowledgements intentionally have NO depth.
   // Ownership/depth come exclusively from the registered historical receipt.
   const stopped=result.processes.map(ack=>{keys(ack,['pid','startTicks','stopped']);if(!integer(ack.pid)||!ticks(ack.startTicks)||ack.stopped!==true)throw Error('Invalid owned Stop acknowledgement');const known=receipts.get(ack.pid+':'+ack.startTicks),sent=active.receipts.find(r=>r.pid===ack.pid&&r.startTicks===ack.startTicks);if(!known||!sent)throw Error('Unregistered owned Stop acknowledgement');return known;});
   remember(stopped);
  }else remember(result.processes);
  if(result.result==='FAIL'){if(typeof result.error!=='string')throw Error('Missing owned helper error');die(result.error);return;}
  finish(active,null,result);pump();
 }
 const startupTimer=setTimeout(()=>die('Owned helper READY timeout10s'),Math.max(0,requestMs-(performance.now()-sessionStarted)));
 child.stdout.on('data',chunk=>{
  if(state==='DEAD'||state==='CLOSED')return;
  try{
   if(state==='STARTING'){startupBytes+=chunk.length;if(startupBytes>maxBytes)throw Error('Owned helper startup exceeds1MiB');}
   else if(active){active.bytes+=chunk.length;if(active.bytes>maxBytes)throw Error('Owned helper response exceeds1MiB');active.wire=(active.wire+chunk.toString('utf8')).slice(0,512);}
   buffer=Buffer.concat([buffer,chunk]);if(buffer.length>maxBytes)throw Error('Owned helper line exceeds1MiB');
   let at;while((at=buffer.indexOf(10))>=0){const line=buffer.subarray(0,at);buffer=buffer.subarray(at+1);if(!line.length)throw Error('Empty owned helper frame');frame(JSON.parse(decoder.decode(line)));}
  }catch(error){die(error.message);}
 });
 child.stderr.on('data',chunk=>{if(state==='DEAD'||state==='CLOSED')return;const value=chunk.toString('utf8');if(active){active.stderrBytes+=chunk.length;active.stderr=(active.stderr+value).slice(0,512);if(active.stderrBytes>maxBytes)die('Owned helper stderr exceeds1MiB');}else{startupStderrBytes+=chunk.length;startupStderr=(startupStderr+value).slice(0,512);if(startupStderrBytes>maxBytes)die('Owned helper startup/idle stderr exceeds1MiB');}});
 child.stdin.on('error',()=>die('Owned helper stdin failed'));
 child.stdout.on('error',()=>die('Owned helper stdout failed'));
 child.stderr.on('error',()=>die('Owned helper stderr failed'));
 child.on('error',error=>die('Owned helper process error: '+error.message));
 child.once('close',(code,signal)=>{exitResolve({code,signal});if(state==='DEAD')return;if(buffer.length){die('Owned helper EOF with partial JSON frame');return;}if(closedReply&&code===0){state='CLOSED';return;}die('Owned helper EOF before verified shutdown');});
 function enqueue(mode,pid,startTicks,values){
  if(state==='DEAD'||state==='CLOSED'||closingFinal&&mode!=='Close'||closing&&!['Inspect','Stop','Close'].includes(mode))return Promise.reject(firstFailure||Error('Owned helper is closed for new work'));
  if(serial===2147483647)return Promise.reject(Error('Owned helper request ID exhausted'));
  const started=performance.now(),promise=new Promise((resolve,reject)=>{const item={id:++serial,mode,pid,startTicks,receipts:values,started,phases:[],bytes:0,wire:'',stderr:'',stderrBytes:0,resolve,reject};item.timer=setTimeout(()=>die('Owned helper request timeout10s including queue'),requestMs);queue.push(item);pump();});pending.add(promise);promise.then(()=>pending.delete(promise),()=>pending.delete(promise));return promise;
 }
 return{
  ready,get owner(){return owner;},get alive(){return state==='READY';},get failure(){return firstFailure;},recoverLedger,
  async beginCleanup(){closing=true;await Promise.allSettled([...pending]);},
  async settleForFallback(timeoutMs=requestMs){
   if(!Number.isInteger(timeoutMs)||timeoutMs<=0||timeoutMs>requestMs)throw Error('Invalid helper death budget');
   if(!firstFailure)throw Error('Fallback requires a failed owned helper');
   const started=performance.now();closing=true;closingFinal=true;await Promise.allSettled([...pending]);
   let timer;try{const remaining=Math.max(0,timeoutMs-(performance.now()-started)),exit=await Promise.race([exited,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Owned helper death not verified before fallback')),remaining);})]);if(performance.now()-started>=timeoutMs)throw Error('Owned helper death verification past deadline');const rows=recoverLedger();return{exit,owner,processes:rows,ledgerStableAfterOriginalChildExit:true};}finally{clearTimeout(timer);}
  },
  request(mode,pid,startTicks,values){
   if(!['Birth','Inspect','Limit','Stop'].includes(mode)||!integer(pid)||(mode==='Birth'?startTicks!==undefined&&startTicks!=='':!ticks(startTicks))||(values!==undefined&&(!Array.isArray(values)||mode!=='Stop')))return Promise.reject(Error('Invalid owned helper request'));
   let normalized;try{normalized=(values||[]).map(row);}catch(error){return Promise.reject(error);}
   return enqueue(mode,pid,startTicks||'',normalized);
  },
  async close(){
   const closingStarted=performance.now(),priorFailure=firstFailure;
   closing=true;closingFinal=true;
   if(state!=='DEAD'&&state!=='CLOSED')await enqueue('Close',null,'',[]);
   if(state==='CLOSED'){if(performance.now()-closingStarted>=requestMs)throw Error('Owned helper shutdown past deadline10s');return{result:'CLOSED',owner,forced:false};}
   let timer;try{const remaining=Math.max(0,requestMs-(performance.now()-closingStarted)),result=await Promise.race([exited,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Owned helper original child did not exit within10s')),remaining);})]);if(performance.now()-closingStarted>=requestMs)throw Error('Owned helper shutdown past deadline10s');if(firstFailure&&firstFailure!==priorFailure)throw firstFailure;if(result.code!==0&&state!=='DEAD')throw Error('Owned helper shutdown rejected');return{result:'CLOSED',owner,forced:state==='DEAD'};}finally{clearTimeout(timer);}
  }
 };
}
function createFacade(real,o,hooks={}){
 const chromium={async launchServer(options){if(options.headless!==true)throw Error('Only invisible Chromium is permitted');const args=[...(options.args||[]),'--js-flags=--max-old-space-size='+LIMITS.heapMiB,'--mute-audio'];const server=await real.chromium.launchServer({...options,headless:true,args});hooks.servers?.add(server);await hooks.own?.(server.process().pid,'chromium');return server;},async connect(...args){const browser=await real.chromium.connect(...args);if(o.observer){const observer=require(o.observer);if(typeof observer.instrument!=='function')throw Error('Observer must export instrument(browser,o)');await observer.instrument(browser,o);}
  if((o.tool||'browser')==='browser'&&o.rates!==undefined){const original=browser.newContext.bind(browser),patched=new WeakSet();const patch=page=>{if(patched.has(page))return;patched.add(page);const goto=page.goto.bind(page);page.goto=function(url,...rest){const u=new URL(url);if(!['127.0.0.1','localhost','[::1]'].includes(u.hostname))throw Error('Rate injection is only permitted on the isolated local QA page');u.searchParams.set('battleRates064',o.rates);hooks.goto?.(u.href);return goto(u.href,...rest);};};browser.newContext=async function(...contextArgs){const context=await original(...contextArgs);context.on('page',patch);for(const page of context.pages())patch(page);const newPage=context.newPage.bind(context);context.newPage=async(...pageArgs)=>{const page=await newPage(...pageArgs);patch(page);return page;};return context;};}return browser;}};
 chromium.launch=async function(options){const server=await chromium.launchServer(options);try{return await chromium.connect(server.wsEndpoint());}catch(error){await require('./close-owned-browser.cjs')(undefined,server);throw error;}};
 return {...real,chromium};
}
function requestedCaseIds(o){
 const names=o.viewports.map(v=>v[0]),formats=['desktop','portrait','landscape'].filter(v=>names.includes(v)),tool=o.tool||'browser';
 if(tool==='browser')return null;
 if(tool==='introduction')return require('./test-introduction-headless.cjs').casePlan(o.viewports).map(row=>row.id);
 if(tool==='slots')return formats.flatMap(v=>['roundtrip','denials'].map(kind=>v+'-'+kind));
 if(tool==='start')return formats.flatMap(v=>o.cases.split(',').map(kind=>v+'-'+kind));
 const rates=(o.rates||'1,2,4').split(',').map(Number);return formats.flatMap(v=>[...rates.map(rate=>v+'-release-x'+rate),...((o.recovery||'true')==='true'?[v+'-asset-recovery-x1']:[])]);
}
function toolResult(o,report){
 if((o.tool||'browser')==='browser')return {result:report.result==='PASS'?'PASS':'FAIL',originalResult:report.result};
 const expected=requestedCaseIds(o),actual=report.cases?.map(row=>row.id)||[],passed=!report.error&&['FUNCTIONAL_PASS','INCOMPLETE'].includes(report.result)&&actual.length===expected.length&&actual.every((id,i)=>id===expected[i])&&report.cases.every(row=>row.result==='PASS');
 return {result:passed?(report.result==='INCOMPLETE'?'REQUESTED_PASS':'PASS'):'FAIL',originalResult:report.result,expectedCases:expected,actualCases:actual,scope:'Requested original API cases only; original report and visual-review status preserved'};
}
function routeTool(o,load=require){
 const tool=o.tool||'browser';if(tool==='browser')return load('./test-browser-headless.cjs').run(o);
 const out=path.join(o.out,'runner'),options={playwright:o.playwright,browser:o.browser,renderer:o.renderer,viewports:o.viewports.map(v=>v[0]).join(',')};
 if(tool==='introduction')return load('./test-introduction-headless.cjs').run({...o,out});
 if(tool==='intro-release')return load('./test-intro-release-headless.cjs').run(o.site,out,{...options,rates:o.rates||'1,2,4',recovery:o.recovery||'true'});
 if(tool==='slots')return load('./test-save-slots-headless.cjs').run(o.site,out,options);
 if(tool==='start')return load('./test-start-menu-headless.cjs').run(o.site,out,{...options,cases:o.cases});
 throw Error('Unsupported tool');
}
async function worker(o){
 const servers=new Set(),pending=new Map();let serial=0;
 const request=(type,detail)=>new Promise((resolve,reject)=>{const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(Error('Owner registration timeout'));},15000);pending.set(id,{resolve,reject,timer});process.send({type,id,...detail});});
 process.on('message',m=>{if(m.type==='registered'){const p=pending.get(m.id);if(p){clearTimeout(p.timer);pending.delete(m.id);m.error?p.reject(Error(m.error)):p.resolve();}}if(m.type==='abort'){for(const server of servers)void server.kill().catch(()=>{});}});
 // No fixture, server, Playwright import or browser can start before the parent
 // has pinned this exact worker and applied its scheduler limits.
 await request('bootstrap',{pid:process.pid});
 const realPath=require.resolve(o.playwright),real=require(realPath);
 require.cache[realPath].exports=createFacade(real,o,{servers,own:(pid,role)=>request('owned',{pid,role}),goto:url=>process.send({type:'goto',url})});
 try{const report=await routeTool(o),result=toolResult(o,report);process.send({type:'done',...result,runnerOut:(o.tool||'browser')==='browser'?o.out:path.join(o.out,'runner')});return ['PASS','REQUESTED_PASS'].includes(result.result)?0:1;}finally{require.cache[realPath].exports=real;for(const server of servers){const cleanup=await require('./close-owned-browser.cjs')(undefined,server);if(cleanup.result!=='PASS')throw Error('Owned browser server cleanup failed');}}
}
async function run(o){
 if(process.platform!=='win32')throw Error('This bounded owner/affinity wrapper requires Windows');
 const lease=acquire(o),started=Date.now(),report={schema:1,result:'RUNNING',created:new Date().toISOString(),limits:LIMITS,tool:o.tool||'browser',site:o.site,out:o.out,cases:o.cases,rates:o.rates||null,recovery:o.recovery??null,viewports:o.viewports,observer:o.observer||null,lease:lease.lease,environment:{headless:true,personalBrowserAttached:false,workerHeapMiB:400,rendererHeapMiB:400},owners:[],samples:[],gotos:[]};
 const save=()=>fs.writeFileSync(path.join(o.out,'bounded-report.json'),JSON.stringify(report,null,2)+'\n');save();let child,monitor,deadline,finished=false,aborting=false,checkRunning=false,workerRegistration,stopPromise,fallbackPromise,session,monitorTask=Promise.resolve();const known=new Map();
 const metric=row=>{const calls=report.helperCalls??=[];if(calls.length<256)calls.push(row);else report.helperCallsOmitted=(report.helperCallsOmitted||0)+1;};
 const fallbackStop=()=>{
  if(fallbackPromise)return fallbackPromise;
  fallbackPromise=(async()=>{
   report.helperFallback={attempts:0,status:'AWAITING_ORIGINAL_HELPER_EXIT'};
   try{
    const remaining=LIMITS.deadlineMs-(Date.now()-started);if(remaining<=0)throw Error('Outer budget exhausted before stable-ledger cleanup');
    const stable=await session.settleForFallback(Math.min(10000,remaining));remember({processes:stable.processes});report.ownedProcessLedger=[...known.values()];report.helperFallback.helperExit=stable.exit;report.helperFallback.stableLedger=stable.ledgerStableAfterOriginalChildExit;
    const rows=[...known.values()];if(!rows.length)throw Error('Fallback has no registered owned receipts');if(LIMITS.deadlineMs-(Date.now()-started)<10000)throw Error('Insufficient outer budget for original10s cleanup');
    const root=rows.find(r=>r.pid===child?.pid&&(!workerTicks||r.startTicks===workerTicks))||rows[0];report.helperFallback.owner=root;report.helperFallback.attempts=1;report.helperFallback.status='ORIGINAL_STOP_SUBMITTED';save();
    const reply=await ownedProcess('Stop',root.pid,root.startTicks,rows,metric);report.helperFallback.status=reply.result;save();return reply;
   }catch(error){report.helperFallback.status='FAIL';report.helperFallback.error=error.message;try{save();}catch(writeError){(report.cleanupErrors??=[]).push('Fallback report: '+writeError.message);}throw error;}
  })();
  fallbackPromise.catch(()=>{});return fallbackPromise;
 };
 const helper=async(mode,pid,startTicks,receipts)=>{
  if(session?.alive)return session.request(mode,pid,startTicks,receipts);
  if(session){try{remember({processes:session.recoverLedger()});report.ownedProcessLedger=[...known.values()];save();}catch(error){(report.cleanupErrors??=[]).push('Persistent ledger recovery: '+error.message);}}
  if(session&&mode==='Stop'&&receipts?.length)return fallbackStop();
  throw session?.failure||Error('Persistent owned helper is unavailable');
 };
 const remember=row=>{for(const item of row.processes||[])known.set(item.pid+':'+item.startTicks,item);};
 const pin=async(pid,role)=>{if(role==='chromium'){await workerRegistration;const ancestry=await helper('Inspect',child.pid,workerTicks);remember(ancestry);if(!ancestry.processes?.some(p=>p.pid===pid))throw Error('Browser is not a descendant of the owned worker');}const observed=await helper('Birth',pid);if(observed.result==='GONE')throw Error('Owned '+role+' exited before registration');remember(observed);if(role==='node-worker')workerTicks=observed.startTicks;const owner={pid,role,startTicks:observed.startTicks,registeredMs:Date.now()-started,limitsApplied:false};report.owners.push(owner);const limited=await helper('Limit',pid,observed.startTicks);remember(limited);owner.limitsApplied=true;save();return observed.startTicks;};
 const refreshKnown=async()=>{for(const owner of report.owners){try{remember(await helper('Inspect',owner.pid,owner.startTicks));}catch(error){(report.cleanupErrors??=[]).push(error.message);}}};
 let workerTicks;
 try{
  const first=resources(o.out),problem=resourceFailure(first);if(problem)throw Error(problem);
  session=createOwnedSession({out:o.out,onMetrics:metric,onLedger:rows=>{remember({processes:rows});report.ownedProcessLedger=[...known.values()];save();}});
  report.helperOwner=await session.ready;save();
  const log=fs.createWriteStream(path.join(o.out,'bounded-worker.log'),{flags:'wx'});
  child=cp.fork(__filename,['--worker',JSON.stringify(o)],{windowsHide:true,execArgv:['--max-old-space-size=400'],stdio:['ignore','pipe','pipe','ipc']});child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});
  const exited=new Promise(resolve=>child.once('exit',(code,signal)=>{finished=true;log.end();resolve({code,signal});}));
  const abort=reason=>{if(aborting||finished)return;aborting=true;report.failure=reason;report.failureElapsedMs=Date.now()-started;child.send({type:'abort'},()=>{});};
  child.on('message',m=>{if(m.type==='bootstrap'){void workerRegistration.then(()=>child.send({type:'registered',id:m.id},()=>{}),error=>child.send({type:'registered',id:m.id,error:error.message},()=>{}));}else if(m.type==='owned'){void pin(m.pid,m.role).then(()=>child.send({type:'registered',id:m.id},()=>{}),error=>{child.send({type:'registered',id:m.id,error:error.message},()=>{});abort(error.message);});}else if(m.type==='goto'){report.gotos.push(m.url);}else if(m.type==='done'){report.workerResult=m.result;report.originalResult=m.originalResult;report.runnerOut=m.runnerOut;report.requestedScope=m.expectedCases?{expectedCases:m.expectedCases,actualCases:m.actualCases,scope:m.scope}:undefined;}});
  workerRegistration=pin(child.pid,'node-worker');workerTicks=await workerRegistration;
  const check=async()=>{if(checkRunning||finished||aborting)return;checkRunning=true;try{const sample={elapsedMs:Date.now()-started,...resources(o.out)};report.samples.push(sample);const issue=resourceFailure(sample);if(issue){abort(issue);save();return;}const limited=await helper('Limit',child.pid,workerTicks);remember(limited);if(limited.result==='GONE'&&!finished){report.workerGone={pid:child.pid,startTicks:workerTicks,elapsedMs:Date.now()-started};save();await Promise.race([exited,stopped]);}save();}catch(error){abort(error.message);}finally{checkRunning=false;}};
  monitor=setInterval(()=>{if(!checkRunning&&!finished&&!aborting)monitorTask=check();},LIMITS.monitorMs);
  const stopped=new Promise(resolve=>{deadline=setTimeout(()=>{abort('Outer240s deadline exceeded');resolve(null);},Math.max(0,LIMITS.deadlineMs-(Date.now()-started)));});
  // Resource aborts must not wait until the outer deadline.
  const abortPoll=setInterval(()=>{if(aborting&&!finished)void stopKnown();},500);
  function stopKnown(){if(!aborting)return Promise.resolve();if(stopPromise)return stopPromise;clearInterval(abortPoll);stopPromise=(async()=>{await refreshKnown();try{if(known.size)await helper('Stop',child.pid,workerTicks,[...known.values()]);}catch(error){(report.cleanupErrors??=[]).push(error.message);}if(!finished)child.kill();})();return stopPromise;}
  const outcome=await Promise.race([exited,stopped]);if(!outcome){await stopKnown();await Promise.race([exited,new Promise(resolve=>setTimeout(resolve,5000))]);}clearInterval(abortPoll);if(stopPromise)await stopPromise;
  report.exit=outcome;report.result=!aborting&&outcome?.code===0&&['PASS','REQUESTED_PASS'].includes(report.workerResult)?report.workerResult:'FAIL';
 }catch(error){report.result='FAIL';if(report.failure===undefined){report.failure=String(error.stack||error);report.failureElapsedMs=Date.now()-started;}}
 finally{
  clearInterval(monitor);clearTimeout(deadline);
  if(session)await session.beginCleanup();
  await monitorTask;
  if(session)try{remember({processes:session.recoverLedger()});report.ownedProcessLedger=[...known.values()];}catch(error){(report.cleanupErrors??=[]).push('Persistent ledger recovery: '+error.message);}
  // Any orphan is checked against its pinned birth time before owner-only stop.
  await refreshKnown();report.cleanup=[];if(known.size)try{report.cleanup.push(await helper('Stop',child.pid,workerTicks,[...known.values()]));}catch(error){report.result='FAIL';(report.cleanupErrors??=[]).push(error.message);}
  if(child&&!finished)child.kill();
  const preserveHelperFailure=()=>{if(session?.failure){report.result='FAIL';report.helperFailure=session.failure.message;if(report.failure===undefined){report.failure=session.failure.message;report.failureElapsedMs=Date.now()-started;}}};
  preserveHelperFailure();
  if(session)try{report.helperShutdown=await session.close();}catch(error){report.result='FAIL';(report.cleanupErrors??=[]).push('Persistent helper shutdown: '+error.message);}
  preserveHelperFailure();
  report.elapsedMs=Date.now()-started;try{report.finalResources=resources(o.out);const issue=resourceFailure(report.finalResources);if(issue){report.result='FAIL';if(report.failure===undefined){report.failure=issue;report.failureElapsedMs=Date.now()-started;}}}catch(error){report.result='FAIL';if(report.failure===undefined){report.failure=error.message;report.failureElapsedMs=Date.now()-started;}}if(report.cleanupErrors?.length){report.result='FAIL';report.leaseRetained='Owner cleanup was not verified; do not start another batch';}save();if(!report.leaseRetained)release(lease);
 }
 return report;
}
if(require.main===module){if(process.argv[2]==='--worker')worker(JSON.parse(process.argv[3])).then(code=>{process.exitCode=code;process.disconnect();}).catch(error=>{console.error(error);process.exitCode=1;process.disconnect();});else Promise.resolve().then(()=>run(parse(process.argv.slice(2)))).then(report=>{console.log(report.result+' bounded isolated QA');process.exitCode=['PASS','REQUESTED_PASS'].includes(report.result)?0:1;}).catch(error=>{console.error(error);process.exitCode=1;});}
module.exports={LIMITS,parse,acquire,release,resources,resourceFailure,ownedProcess,createOwnedSession,createFacade,requestedCaseIds,toolResult,routeTool,run};
