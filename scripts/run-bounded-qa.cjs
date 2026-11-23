/* One invisible owned browser batch. Wraps the tracked QA runner unchanged. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
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
function ownedProcess(mode,pid,startTicks,receipts){
 return new Promise((resolve,reject)=>{const args=['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'limit-owned-qa.ps1'),'-Mode',mode,'-OwnedPid',String(pid),...(startTicks?['-ExpectedStartTicks',String(startTicks)]:[]),...(receipts?['-PinnedProcessesJson',JSON.stringify(receipts)]:[])];
  cp.execFile('powershell.exe',args,{windowsHide:true,timeout:10000,maxBuffer:1024*1024},(error,stdout,stderr)=>{let result;try{result=JSON.parse(stdout.replace(/^\uFEFF/,''));}catch{reject(Error('Owned PID helper failed: '+(stderr||error?.message||stdout)));return;}if(result.result==='FAIL')reject(Error(result.error));else if(error)reject(error);else resolve(result);});});
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
 const save=()=>fs.writeFileSync(path.join(o.out,'bounded-report.json'),JSON.stringify(report,null,2)+'\n');save();let child,monitor,deadline,finished=false,aborting=false,checkRunning=false,workerRegistration,stopPromise,monitorTask=Promise.resolve();const known=new Map();
 const remember=row=>{for(const item of row.processes||[])known.set(item.pid+':'+item.startTicks,item);};
 const pin=async(pid,role)=>{if(role==='chromium'){await workerRegistration;const ancestry=await ownedProcess('Inspect',child.pid,workerTicks);remember(ancestry);if(!ancestry.processes?.some(p=>p.pid===pid))throw Error('Browser is not a descendant of the owned worker');}const observed=await ownedProcess('Birth',pid);if(observed.result==='GONE')throw Error('Owned '+role+' exited before registration');remember(observed);if(role==='node-worker')workerTicks=observed.startTicks;const owner={pid,role,startTicks:observed.startTicks,registeredMs:Date.now()-started,limitsApplied:false};report.owners.push(owner);const limited=await ownedProcess('Limit',pid,observed.startTicks);remember(limited);owner.limitsApplied=true;save();return observed.startTicks;};
 const refreshKnown=async()=>{for(const owner of report.owners){try{remember(await ownedProcess('Inspect',owner.pid,owner.startTicks));}catch(error){(report.cleanupErrors??=[]).push(error.message);}}};
 let workerTicks;
 try{
  const first=resources(o.out),problem=resourceFailure(first);if(problem)throw Error(problem);
  const log=fs.createWriteStream(path.join(o.out,'bounded-worker.log'),{flags:'wx'});
  child=cp.fork(__filename,['--worker',JSON.stringify(o)],{windowsHide:true,execArgv:['--max-old-space-size=400'],stdio:['ignore','pipe','pipe','ipc']});child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});
  const exited=new Promise(resolve=>child.once('exit',(code,signal)=>{finished=true;log.end();resolve({code,signal});}));
  const abort=reason=>{if(aborting||finished)return;aborting=true;report.failure=reason;child.send({type:'abort'},()=>{});};
  child.on('message',m=>{if(m.type==='bootstrap'){void workerRegistration.then(()=>child.send({type:'registered',id:m.id},()=>{}),error=>child.send({type:'registered',id:m.id,error:error.message},()=>{}));}else if(m.type==='owned'){void pin(m.pid,m.role).then(()=>child.send({type:'registered',id:m.id},()=>{}),error=>{child.send({type:'registered',id:m.id,error:error.message},()=>{});abort(error.message);});}else if(m.type==='goto'){report.gotos.push(m.url);}else if(m.type==='done'){report.workerResult=m.result;report.originalResult=m.originalResult;report.runnerOut=m.runnerOut;report.requestedScope=m.expectedCases?{expectedCases:m.expectedCases,actualCases:m.actualCases,scope:m.scope}:undefined;}});
  workerRegistration=pin(child.pid,'node-worker');workerTicks=await workerRegistration;
  const check=async()=>{if(checkRunning||finished)return;checkRunning=true;try{const sample={elapsedMs:Date.now()-started,...resources(o.out)};report.samples.push(sample);const issue=resourceFailure(sample);if(issue)abort(issue);const limited=await ownedProcess('Limit',child.pid,workerTicks);remember(limited);if(limited.result==='GONE'&&!finished)abort('Owned worker vanished');save();}catch(error){abort(error.message);}finally{checkRunning=false;}};
  monitor=setInterval(()=>{if(!checkRunning&&!finished)monitorTask=check();},LIMITS.monitorMs);
  const stopped=new Promise(resolve=>{deadline=setTimeout(()=>{abort('Outer240s deadline exceeded');resolve(null);},Math.max(0,LIMITS.deadlineMs-(Date.now()-started)));});
  // Resource aborts must not wait until the outer deadline.
  const abortPoll=setInterval(()=>{if(aborting&&!finished)void stopKnown();},500);
  function stopKnown(){if(!aborting)return Promise.resolve();if(stopPromise)return stopPromise;clearInterval(abortPoll);stopPromise=(async()=>{await refreshKnown();try{if(known.size)await ownedProcess('Stop',child.pid,workerTicks,[...known.values()]);}catch(error){(report.cleanupErrors??=[]).push(error.message);}if(!finished)child.kill();})();return stopPromise;}
  const outcome=await Promise.race([exited,stopped]);if(!outcome){await stopKnown();await Promise.race([exited,new Promise(resolve=>setTimeout(resolve,5000))]);}clearInterval(abortPoll);if(stopPromise)await stopPromise;
  report.exit=outcome;report.result=!aborting&&outcome?.code===0&&['PASS','REQUESTED_PASS'].includes(report.workerResult)?report.workerResult:'FAIL';
 }catch(error){report.result='FAIL';report.failure=String(error.stack||error);}
 finally{
  clearInterval(monitor);clearTimeout(deadline);
  await monitorTask;
  // Any orphan is checked against its pinned birth time before owner-only stop.
  await refreshKnown();report.cleanup=[];if(known.size)try{report.cleanup.push(await ownedProcess('Stop',child.pid,workerTicks,[...known.values()]));}catch(error){report.result='FAIL';(report.cleanupErrors??=[]).push(error.message);}
  if(child&&!finished)child.kill();report.elapsedMs=Date.now()-started;try{report.finalResources=resources(o.out);const issue=resourceFailure(report.finalResources);if(issue){report.result='FAIL';report.failure??=issue;}}catch(error){report.result='FAIL';report.failure??=error.message;}if(report.cleanupErrors?.length){report.result='FAIL';report.leaseRetained='Owner cleanup was not verified; do not start another batch';}save();if(!report.leaseRetained)release(lease);
 }
 return report;
}
if(require.main===module){if(process.argv[2]==='--worker')worker(JSON.parse(process.argv[3])).then(code=>{process.exitCode=code;process.disconnect();}).catch(error=>{console.error(error);process.exitCode=1;process.disconnect();});else Promise.resolve().then(()=>run(parse(process.argv.slice(2)))).then(report=>{console.log(report.result+' bounded isolated QA');process.exitCode=['PASS','REQUESTED_PASS'].includes(report.result)?0:1;}).catch(error=>{console.error(error);process.exitCode=1;});}
module.exports={LIMITS,parse,acquire,release,resources,resourceFailure,ownedProcess,createFacade,requestedCaseIds,toolResult,routeTool,run};
