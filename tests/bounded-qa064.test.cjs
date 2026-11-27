const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),{once}=require('node:events');
const B=require('../scripts/run-bounded-qa.cjs');
function temp(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bounded-qa064-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));return dir;}
test('fresh output and exclusive lease preserve existing evidence and another owner',t=>{
 const dir=temp(t),out=path.join(dir,'evidence');fs.mkdirSync(out);fs.writeFileSync(path.join(out,'report.json'),'keep');assert.throws(()=>B.acquire({out,leaseRoot:dir}),/already exists/);assert.equal(fs.readFileSync(path.join(out,'report.json'),'utf8'),'keep');assert.equal(fs.existsSync(path.join(dir,'.bounded-qa-lease.json')),false);
 const fresh=path.join(dir,'fresh'),a=B.acquire({out:fresh,leaseRoot:dir});assert.ok(fs.existsSync(fresh));assert.throws(()=>B.acquire({out:path.join(dir,'other'),leaseRoot:dir}),/EEXIST/);B.release({lease:a.lease,token:'another owner'});assert.ok(fs.existsSync(a.lease));B.release(a);assert.equal(fs.existsSync(a.lease),false);
});
test('resource guard counts actual PNG bytes recursively without following links',t=>{
 const dir=temp(t);fs.mkdirSync(path.join(dir,'sub'));fs.writeFileSync(path.join(dir,'one.png'),Buffer.alloc(25));fs.writeFileSync(path.join(dir,'sub','two.PNG'),Buffer.alloc(15));fs.writeFileSync(path.join(dir,'other.json'),'not a PNG');
 const r=B.resources(dir);assert.equal(r.pngCount,2);assert.equal(r.pngBytes,40);assert.ok(r.freeBytes>0);assert.equal(B.resourceFailure({pngBytes:B.LIMITS.pngBytes,freeBytes:B.LIMITS.diskFloorBytes}),null);assert.match(B.resourceFailure({pngBytes:B.LIMITS.pngBytes+1,freeBytes:Infinity}),/64MiB/);assert.match(B.resourceFailure({pngBytes:0,freeBytes:B.LIMITS.diskFloorBytes-1}),/220MiB/);assert.equal(B.LIMITS.deadlineMs,240000);assert.equal(B.LIMITS.heapMiB,400);
});
test('bounded parser preserves original cases and selects exact rates; absolute tools are mandatory',()=>{
 const root=path.resolve(os.tmpdir()),args=['site',path.join(root,'out'),'--lease-root='+root,'--python='+path.join(root,'python.exe'),'--browser='+path.join(root,'chrome.exe'),'--playwright='+path.join(root,'pw'),'--cases=qaGustActions064','--viewports=portrait','--rates=2'];
 const o=B.parse(args);assert.deepEqual(o.cases,['qaGustActions064']);assert.deepEqual(o.viewports,[['portrait',390,844]]);assert.equal(o.rates,'2');assert.equal(o.timeout,220000);
 assert.throws(()=>B.parse(args.map(a=>a==='--rates=2'?'--rates=2,2':a)),/rates/);assert.throws(()=>B.parse([...args,'--timeout=300000']),/240s/);assert.throws(()=>B.parse(args.map(a=>a.startsWith('--browser=')?'--browser=chrome':a)),/absolute/);
});
test('facade keeps original launch options and results while enforcing invisible400MiB browser',async()=>{
 const seen=[],server={process:()=>({pid:123})},real={chromium:{async launchServer(options){seen.push(options);return server;}}},facade=B.createFacade(real,{}, {own:async(pid,role)=>{seen.push([pid,role]);}});
 const result=await facade.chromium.launchServer({headless:true,chromiumSandbox:true,executablePath:'original.exe',args:['--use-angle=swiftshader']});assert.equal(result,server);assert.equal(seen[0].executablePath,'original.exe');assert.equal(seen[0].chromiumSandbox,true);assert.deepEqual(seen[0].args,['--use-angle=swiftshader','--js-flags=--max-old-space-size=400','--mute-audio']);assert.deepEqual(seen[1],[123,'chromium']);assert.equal(real.chromium.launchServer===facade.chromium.launchServer,false);await assert.rejects(facade.chromium.launchServer({headless:false}),/invisible/);
});
test('observer runs before any context and goto adds rates without replacing native page operations',async t=>{
 const dir=temp(t),observer=path.join(dir,'observer.cjs'),events=[];global.__boundedQATestEvents=events;t.after(()=>delete global.__boundedQATestEvents);fs.writeFileSync(observer,"exports.instrument=async(browser,o)=>{global.__boundedQATestEvents.push(['observer',o.out]);};");
 const originalResult={navigation:'native'},page={goto:async(...args)=>{events.push(['goto',...args]);return originalResult;}},context={on:(name,handler)=>{events.push(['listen',name]);context.handler=handler;},pages:()=>[],newPage:async()=>{context.handler(page);return page;}},browser={newContext:async(...args)=>{events.push(['context',...args]);return context;}},real={chromium:{connect:async()=>browser}},seen=[];
 const f=B.createFacade(real,{observer,out:dir,rates:'2'},{goto:url=>seen.push(url)}),connected=await f.chromium.connect('native endpoint');assert.equal(connected,browser);assert.deepEqual(events,[['observer',dir]]);const c=await connected.newContext({viewport:{width:390,height:844}}),p=await c.newPage();const options={waitUntil:'load'},r=await p.goto('http://127.0.0.1:4200/?fieldAudio=1',options);assert.equal(r,originalResult);assert.equal(events[1][0],'context');assert.equal(events.at(-1)[2],options);assert.equal(new URL(seen[0]).searchParams.get('fieldAudio'),'1');assert.equal(new URL(seen[0]).searchParams.get('battleRates064'),'2');assert.throws(()=>p.goto('https://github.com/'),/isolated/);
});
test('direct tools preserve original API subsets and keep their output directory fresh',()=>{
 const dir=path.resolve(os.tmpdir()),base=['site',path.join(dir,'bounded-out'),'--lease-root='+dir,'--browser='+path.join(dir,'chrome.exe'),'--playwright='+path.join(dir,'pw'),'--viewports=portrait'];
 const intro=B.parse([...base,'--tool=intro-release','--rates=2','--recovery=false']);assert.equal(intro.tool,'intro-release');assert.equal(intro.recovery,'false');assert.deepEqual(B.requestedCaseIds(intro),['portrait-release-x2']);
 const calls=[],load=name=>({run:(...args)=>{calls.push([name,...args]);return 'original result';}});assert.equal(B.routeTool(intro,load),'original result');assert.equal(calls[0][0],'./test-intro-release-headless.cjs');assert.equal(calls[0][2],path.join(intro.out,'runner'));assert.equal(calls[0][3].rates,'2');assert.equal(calls[0][3].recovery,'false');assert.equal(calls[0][3].viewports,'portrait');
 const start=B.parse([...base,'--tool=start','--cases=fresh,unavailable']);assert.deepEqual(B.requestedCaseIds(start),['portrait-fresh','portrait-unavailable']);B.routeTool(start,load);assert.equal(calls[1][3].cases,'fresh,unavailable');
 const naming=B.parse([...base,'--tool=introduction']);assert.equal(naming.timeout,120000);B.routeTool(naming,load);assert.equal(calls[2][0],'./test-introduction-headless.cjs');assert.equal(calls[2][1].out,path.join(naming.out,'runner'));assert.deepEqual(calls[2][1].viewports,[['portrait',390,844]]);assert.equal(calls[2][1].timeout,120000);
 const slots=B.parse([...base,'--tool=slots']);assert.deepEqual(B.requestedCaseIds(slots),['portrait-roundtrip','portrait-denials']);B.routeTool(slots,load);assert.equal(calls[3][0],'./test-save-slots-headless.cjs');
 for(const tool of ['slots','start','introduction'])assert.throws(()=>B.parse([...base,'--tool='+tool,'--rates=2']),/rate subsets/);
 assert.throws(()=>B.parse([...base,'--tool=slots','--recovery=false']),/Recovery selection/);assert.throws(()=>B.parse([...base,'--tool=introduction','--timeout=1000']),/30000/);assert.throws(()=>B.parse([...base,'--tool=slots','--cases=fresh']),/cases selection/);
});
test('partial original report remains INCOMPLETE and only exact passing requested IDs earn REQUESTED_PASS',()=>{
 const o={tool:'intro-release',rates:'2',recovery:'true',viewports:[['portrait',390,844]]},report={result:'INCOMPLETE',visualReview:{result:'NOT_RUN'},cases:[{id:'portrait-release-x2',result:'PASS'},{id:'portrait-asset-recovery-x1',result:'PASS'}]},before=JSON.stringify(report),result=B.toolResult(o,report);
 assert.equal(result.result,'REQUESTED_PASS');assert.equal(result.originalResult,'INCOMPLETE');assert.equal(JSON.stringify(report),before);assert.equal(report.visualReview.result,'NOT_RUN');
 for(const cases of [[report.cases[0]],[...report.cases,{id:'extra',result:'PASS'}],[...report.cases].reverse(),[report.cases[0],{...report.cases[1],result:'FAIL'}]])assert.equal(B.toolResult(o,{...report,cases}).result,'FAIL');assert.equal(B.toolResult(o,{...report,error:'native failure'}).result,'FAIL');
});
test('direct launch delegates owned launchServer and connect before contexts, without injecting battle query',async()=>{
 const events=[],page={goto:async url=>url},context={newPage:async()=>page},browser={newContext:async()=>{events.push('context');return context;}},server={process:()=>({pid:123}),wsEndpoint:()=> 'owned endpoint'};
 const real={chromium:{launch(){throw Error('Unowned launch forbidden');},launchServer:async options=>{events.push(['launchServer',options.headless]);return server;},connect:async endpoint=>{events.push(['connect',endpoint]);return browser;}}},servers=new Set(),facade=B.createFacade(real,{tool:'intro-release',rates:'2'},{servers,own:async(pid,role)=>{events.push(['registered',pid,role]);}});
 const result=await facade.chromium.launch({headless:true,chromiumSandbox:true});assert.equal(result,browser);assert.equal(servers.has(server),true);assert.deepEqual(events,[['launchServer',true],['registered',123,'chromium'],['connect','owned endpoint']]);const c=await result.newContext(),p=await c.newPage();assert.equal(await p.goto('http://127.0.0.1:1234/'),'http://127.0.0.1:1234/');
});
test('worker bootstrap denial cannot load Playwright, build a fixture or start a browser',{timeout:10000},async t=>{
 const dir=temp(t),marker=path.join(dir,'playwright-was-loaded'),fake=path.join(dir,'fake-playwright.cjs'),out=path.join(dir,'never-created');fs.writeFileSync(fake,'require("node:fs").writeFileSync('+JSON.stringify(marker)+',"unexpected import");throw Error("Browser module must never load");');
 const child=cp.fork(require.resolve('../scripts/run-bounded-qa.cjs'),['--worker',JSON.stringify({playwright:fake,out})],{windowsHide:true,execArgv:['--max-old-space-size=400'],stdio:['ignore','ignore','ignore','ipc']});t.after(()=>{if(child.exitCode===null)child.kill();});const exited=once(child,'exit'),[message]=await once(child,'message');assert.equal(message.type,'bootstrap');assert.equal(message.pid,child.pid);assert.equal(fs.existsSync(marker),false);assert.equal(fs.existsSync(out),false);child.send({type:'registered',id:message.id,error:'Injected initial owner registration rejection'});const [code]=await exited;assert.equal(code,1);assert.equal(fs.existsSync(marker),false);assert.equal(fs.existsSync(out),false);
});
test('owned helper failures retain bounded process diagnostics in the message saved by callers',async()=>{
 const original=cp.execFile,calls=[];let reply;
 cp.execFile=(exe,args,options,callback)=>{calls.push({exe,args,options});callback(...reply);};
 const savedMessage=e=>{const report=JSON.parse(JSON.stringify({failure:e.message})),at=report.failure.indexOf(' [owned-helper ');assert(at>=0);return JSON.parse(report.failure.slice(at+' [owned-helper '.length,-1));};
 const rejectWith=async(error,stdout,stderr,check)=>{reply=[error,stdout,stderr];await assert.rejects(B.ownedProcess('Limit',123,'456'),e=>{check(e,savedMessage(e));return true;});};
 try{
  const cause=Object.assign(Error('Command failed: MUST_NOT_COPY_COMMAND'),{code:'ETIMEDOUT',killed:true,signal:'SIGTERM',cmd:'MUST_NOT_COPY_COMMAND',env:{TOKEN:'MUST_NOT_COPY_ENV'}}),stdout='partial\u0000'+String.fromCodePoint(0x1f33f).repeat(500),stderr='native diagnostic '.repeat(100);
  await rejectWith(cause,stdout,stderr,(e,d)=>{assert.match(e.message,/^Owned PID helper failed:/);assert(!e.message.includes('MUST_NOT_COPY'));assert.deepEqual(d,JSON.parse(JSON.stringify(e.ownedProcessDiagnostics)));assert.equal(d.code,'ETIMEDOUT');assert.equal(d.killed,true);assert.equal(d.signal,'SIGTERM');assert.equal(d.mode,'Limit');assert.equal(d.pid,123);for(const [key,value]of Object.entries({stdout,stderr})){assert.equal(d[key].bytes,Buffer.byteLength(value));assert.equal(d[key].truncated,true);assert(d[key].text.startsWith(value.slice(0,7)));assert(Buffer.byteLength(d[key].text)<=515);}assert(Buffer.byteLength(e.message)<8192);});
  await rejectWith(Object.assign(Error('MUST_NOT_COPY_COMMAND'),{code:'ERR_CHILD_PROCESS_STDIO_MAXBUFFER',killed:false,signal:null}),'not-json','',(e,d)=>{assert.equal(d.code,'ERR_CHILD_PROCESS_STDIO_MAXBUFFER');assert.equal(d.killed,false);assert.equal(d.signal,null);assert.equal(d.stderr.bytes,0);assert.equal(d.stderr.truncated,false);});
  const primary='Owned PID start time changed; refusing process operation';await rejectWith(Object.assign(Error('MUST_NOT_COPY_COMMAND'),{code:1,killed:false,signal:null}),JSON.stringify({result:'FAIL',error:primary}),'',(e,d)=>{assert(e.message.startsWith(primary+' [owned-helper '));assert.equal(d.code,1);assert.equal(d.stdout.truncated,false);assert.equal(d.stderr.text,'');});
  await rejectWith(Object.assign(Error('MUST_NOT_COPY_COMMAND'),{code:1,killed:true,signal:'SIGTERM'}),JSON.stringify({result:'PASS'}),'',(e,d)=>{assert.match(e.message,/process rejected after JSON reply/);assert.equal(d.code,1);assert.equal(d.killed,true);});
  const success={result:'PASS',pid:123,startTicks:'456',processes:[]};reply=[null,'\uFEFF'+JSON.stringify(success),''];assert.deepEqual(await B.ownedProcess('Birth',123),success);
  assert.equal(calls.length,5);for(const c of calls){assert.equal(c.exe,'powershell.exe');assert.deepEqual(c.options,{windowsHide:true,timeout:10000,maxBuffer:1024*1024});assert.equal(c.args[c.args.indexOf('-OwnedPid')+1],'123');assert(c.args.includes('-NoProfile')&&c.args.includes('-NonInteractive'));assert.equal(c.args[c.args.indexOf('-File')+1],path.resolve(__dirname,'../scripts/limit-owned-qa.ps1'));}
 }finally{cp.execFile=original;}
});

test('actual owner stops resource-failed work before another Limit and releases its pinned lease',async t=>{
 const vm=require('node:vm'),{EventEmitter}=require('node:events'),{PassThrough}=require('node:stream'),dir=temp(t),out=path.join(dir,'resource-abort'),ownerFile=require.resolve('../scripts/run-bounded-qa.cjs');
 const timers=new Map(),calls=[],messages=[],logs=[],pid=43210,startTicks='638000000000000001',record={pid,startTicks,depth:0};let clock=1700000000000,nextTimer=0,diskReads=0;
 class TestDate extends Date{constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;}}
 const child=new EventEmitter();Object.assign(child,{pid,exitCode:null,stdout:new PassThrough(),stderr:new PassThrough(),send(message,callback){messages.push(message);callback?.();},kill(){if(this.exitCode!==null)return;this.exitCode=1;this.stdout.end();this.stderr.end();this.emit('exit',1,'SIGTERM');}});
 const fakeCP={fork(file,args,options){calls.push({kind:'fork',file,args,options});return child;},execFile(exe,args,options,callback){const value=key=>args[args.indexOf(key)+1],mode=value('-Mode');calls.push({kind:'helper',mode,pid:Number(value('-OwnedPid')),ticks:args.includes('-ExpectedStartTicks')?value('-ExpectedStartTicks'):null,receipts:args.includes('-PinnedProcessesJson')?JSON.parse(value('-PinnedProcessesJson')):null});callback(null,JSON.stringify({result:'PASS',pid,startTicks,processes:mode==='Stop'?[]:[record]}),'');}};
 // Declared UNIT transport adapter: the resource/lease assertions below remain
 // the actual owner code; this fixture does not certify native process discovery.
 fakeCP.spawn=(exe,args,options)=>{
  const token=args[args.indexOf('-SessionToken')+1],ledger=args[args.indexOf('-LedgerPath')+1],helper=new EventEmitter(),helperTicks='638000000000000000',parentTicks='637000000000000000';
  Object.assign(helper,{pid:90001,exitCode:null,signalCode:null,killed:false,stdin:new PassThrough(),stdout:new PassThrough(),stderr:new PassThrough(),kill(){if(this.exitCode!==null)return;this.killed=true;this.exitCode=1;this.signalCode='SIGTERM';this.emit('close',1,'SIGTERM');}});
  const save=rows=>fs.writeFileSync(ledger,JSON.stringify({schema:1,token,helperPid:helper.pid,helperStartTicks:helperTicks,parentPid:12345,parentStartTicks:parentTicks,processes:rows}));
  const emit=value=>helper.stdout.write(JSON.stringify(value)+'\n');save([]);
  helper.stdin.on('data',chunk=>{const m=JSON.parse(chunk.toString());if(m.kind==='close'){emit({kind:'closed',token,id:m.id});helper.exitCode=0;helper.emit('close',0,null);return;}
   calls.push({kind:'helper',mode:m.mode,pid:m.pid,ticks:m.startTicks||null,receipts:m.receipts.length?m.receipts:null});save([record]);emit({kind:'ledger',token,id:m.id,processes:[record]});emit({kind:'result',token,id:m.id,value:{result:'PASS',pid,startTicks,processes:m.mode==='Stop'?[]:[record]}});
  });
  queueMicrotask(()=>emit({kind:'ready',token,pid:helper.pid,startTicks:helperTicks,parentPid:12345,parentStartTicks:parentTicks,affinity:Math.min(2,os.availableParallelism())===1?'1':'3',priority:'BelowNormal'}));return helper;
 };
 const fakeFS={...fs,statfsSync(){return{bavail:++diskReads===1?1024*1024*1024:1,bsize:1};},createWriteStream(...args){const log=fs.createWriteStream(...args);logs.push(log);return log;}};
 const localRequire=name=>{if(name==='node:fs')return fakeFS;if(name==='node:child_process')return fakeCP;return require(name);},moduleCopy={exports:{}};
 const schedule=(callback,ms,interval)=>{const id=++nextTimer;timers.set(id,{callback,ms,interval});return id;};
 vm.runInNewContext(fs.readFileSync(ownerFile,'utf8'),{require:localRequire,module:moduleCopy,__filename:ownerFile,__dirname:path.dirname(ownerFile),process:{platform:'win32',pid:12345},Buffer,URL,Date:TestDate,setInterval:(fn,ms)=>schedule(fn,ms,true),setTimeout:(fn,ms)=>schedule(fn,ms,false),clearInterval:id=>timers.delete(id),clearTimeout:id=>timers.delete(id)},{filename:ownerFile});
 const drain=async()=>{for(let i=0;i<20;i++)await Promise.resolve();},tick=async ms=>{const timer=[...timers.values()].find(row=>row.interval&&row.ms===ms);assert.ok(timer,'expected active '+ms+'ms interval');clock+=ms;timer.callback();await drain();};
 const running=moduleCopy.exports.run({out,leaseRoot:dir,site:dir,cases:['never-run'],viewports:[['portrait',390,844]]});let report,afterResource,afterAbort;
 try{
  await drain();assert.equal(calls.filter(row=>row.mode==='Birth').length,1);assert.equal(calls.filter(row=>row.mode==='Limit').length,1);
  await tick(2500);afterResource=calls.filter(row=>row.mode==='Limit').length;
  await tick(2500);afterAbort=calls.filter(row=>row.mode==='Limit').length;
  await tick(500);report=await running;
 }finally{child.kill();await running;await Promise.all(logs.map(log=>log.closed?Promise.resolve():once(log,'close')));}
 assert.equal(afterResource,1,'resource failure must return before invoking Limit');assert.equal(afterAbort,1,'an aborting owner must not start another resource/Limit check');
 assert.equal(messages.filter(row=>row.type==='abort').length,1);assert.equal(report.result,'FAIL');assert.equal(report.failure,'Free disk below220MiB');assert.equal(report.failureElapsedMs,2500);assert.ok(report.failureElapsedMs<=report.elapsedMs);assert.equal(report.samples.length,1);
 const stops=calls.filter(row=>row.mode==='Stop');assert.ok(stops.length>0);for(const stop of stops){assert.equal(stop.pid,pid);assert.equal(stop.ticks,startTicks);assert.deepEqual(stop.receipts,[record]);}
 assert.equal(report.cleanupErrors,undefined);assert.equal(report.leaseRetained,undefined);assert.equal(fs.existsSync(path.join(dir,'.bounded-qa-lease.json')),false);assert.equal(child.exitCode,1);
 const saved=JSON.parse(fs.readFileSync(path.join(out,'bounded-report.json'),'utf8'));assert.equal(saved.failure,report.failure);assert.equal(saved.failureElapsedMs,2500);assert.equal(saved.result,'FAIL');
 const fork=calls.find(row=>row.kind==='fork');assert.equal(fork.file,ownerFile);assert.equal(JSON.stringify(fork.options.execArgv),JSON.stringify(['--max-old-space-size=400']));assert.equal(fork.options.windowsHide,true);
});
test('optional owned helper metrics preserve results and expose only bounded wall and phase stamps',async()=>{
 const original=cp.execFile,metrics=[],success={result:'PASS',pid:123,startTicks:'456',processes:[]};let reply,calls=0;
 cp.execFile=(exe,args,options,callback)=>{calls++;assert.equal(exe,'powershell.exe');assert.equal(options.timeout,10000);callback(...reply);};
 const phases=[{phase:'ENTER',elapsedMs:0},{phase:'INTEROP',elapsedMs:1.25},{phase:'NATIVE',elapsedMs:2.5},{phase:'DONE',elapsedMs:3.75}],stderr=['DO_NOT_COPY '+('x'.repeat(4096)),'OWNED_QA_PHASE UNKNOWN 1','OWNED_QA_PHASE INTEROP 1,25','OWNED_QA_PHASE NATIVE Infinity',...phases.map(row=>'OWNED_QA_PHASE '+row.phase+' '+row.elapsedMs.toFixed(3)),'OWNED_QA_PHASE ENTER 9.000','OWNED_QA_PHASE DONE NaN','untrusted trailing diagnostic'].join('\n');
 const check=(row,expected)=>{assert.deepEqual(Object.keys(row).sort(),['mode','phases','pid','wallElapsedMs']);assert.equal(row.mode,'Limit');assert.equal(row.pid,123);assert.ok(Number.isFinite(row.wallElapsedMs)&&row.wallElapsedMs>=0);assert.deepEqual(row.phases,expected);assert.ok(Buffer.byteLength(JSON.stringify(row))<1024);assert.equal(JSON.stringify(row).includes('DO_NOT_COPY'),false);};
 try{
  reply=[null,JSON.stringify(success),stderr];assert.deepEqual(await B.ownedProcess('Limit',123,'456'),success);assert.equal(metrics.length,0);
  assert.deepEqual(await B.ownedProcess('Limit',123,'456',undefined,row=>metrics.push(row)),success);assert.equal(metrics.length,1);check(metrics[0],phases);
  reply=[Object.assign(Error('DO_NOT_COPY_COMMAND'),{code:null,killed:true,signal:'SIGTERM'}),'','OWNED_QA_PHASE ENTER 0.000\nOWNED_QA_PHASE INTEROP 2.125\nOWNED_QA_PHASE NATIVE '];
  await assert.rejects(B.ownedProcess('Limit',123,'456',undefined,row=>metrics.push(row)),error=>{assert.match(error.message,/^Owned PID helper failed: invalid JSON reply/);assert.equal(error.ownedProcessDiagnostics.killed,true);assert.equal(error.ownedProcessDiagnostics.signal,'SIGTERM');return true;});
  assert.equal(metrics.length,2);check(metrics[1],[{phase:'ENTER',elapsedMs:0},{phase:'INTEROP',elapsedMs:2.125}]);assert.equal(calls,3);
 }finally{cp.execFile=original;}
});

test('Windows helper pins an owned CPU-only process, refuses stale birthtime and stops only its receipt',{skip:process.platform!=='win32',timeout:30000},async t=>{
 const child=cp.spawn(process.execPath,['--max-old-space-size=400','-e','setInterval(()=>{},1000)'],{windowsHide:true,stdio:'ignore'});const exit=once(child,'exit');t.after(()=>{if(child.exitCode===null)child.kill();});
 const metrics={},capture=key=>row=>{assert.equal(metrics[key],undefined);metrics[key]=row;};
 const birth=await B.ownedProcess('Birth',child.pid,undefined,undefined,capture('birth'));assert.equal(birth.result,'PASS');assert.equal(birth.processes.length,1);const found=await B.ownedProcess('Inspect',child.pid,birth.startTicks,undefined,capture('inspect'));assert.equal(found.result,'PASS');assert.ok(found.processes.some(p=>p.pid===child.pid));await assert.rejects(B.ownedProcess('Limit',child.pid,'1',undefined,capture('stale')),e=>{assert.match(e.message,/start time changed/);assert.equal(e.ownedProcessDiagnostics.mode,'Limit');assert.equal(e.ownedProcessDiagnostics.pid,child.pid);assert.equal(e.ownedProcessDiagnostics.code,1);assert(e.message.includes(' [owned-helper '));return true;});
 const limited=await B.ownedProcess('Limit',child.pid,found.startTicks,undefined,capture('limit'));const record=limited.processes.find(p=>p.pid===child.pid);assert.equal(record.priority,'BelowNormal');const bits=BigInt(record.affinity).toString(2).split('').filter(c=>c==='1').length;assert.equal(bits,Math.min(2,os.availableParallelism()));
 const stopped=await B.ownedProcess('Stop',child.pid,found.startTicks,limited.processes,capture('stop'));assert.equal(stopped.result,'PASS');await exit;
 for(const [key,mode]of Object.entries({birth:'Birth',inspect:'Inspect',stale:'Limit',limit:'Limit',stop:'Stop'})){const row=metrics[key];assert.equal(row.mode,mode);assert.equal(row.pid,child.pid);assert.ok(Number.isFinite(row.wallElapsedMs)&&row.wallElapsedMs>=0);assert.deepEqual(row.phases.map(phase=>phase.phase),['inspect','limit'].includes(key)?['ENTER','INTEROP','NATIVE','DONE']:['ENTER','DONE']);let previous=0;for(const phase of row.phases){assert.ok(Number.isFinite(phase.elapsedMs)&&phase.elapsedMs>=previous);previous=phase.elapsedMs;}}
});

// Only transport failure/queue tests use this declared UNIT host. No fake reply
// here establishes Toolhelp ancestry, scheduler application or actual Game work.
function sessionUnit(t,{deferKill=false}={}){
 const vm=require('node:vm'),{EventEmitter}=require('node:events'),{PassThrough}=require('node:stream'),dir=temp(t),ownerFile=require.resolve('../scripts/run-bounded-qa.cjs'),timers=new Map(),queries=[],ledgers=[];
 let clock=0,nextTimer=0,helper,token,ledgerPath,helperKills=0;const helperTicks='638000000000000000',parentTicks='637000000000000000';
 const frame=value=>helper.stdout.write(JSON.stringify(value)+'\n');
 const save=rows=>fs.writeFileSync(ledgerPath,JSON.stringify({schema:1,token,helperPid:helper.pid,helperStartTicks:helperTicks,parentPid:12345,parentStartTicks:parentTicks,processes:rows}));
 const fakeCP={...cp,spawn(exe,args,options){
  assert.equal(exe,'powershell.exe');assert.equal(options.windowsHide,true);assert.deepEqual(Array.from(options.stdio),['pipe','pipe','pipe']);assert(args.includes('-Session'));
  token=args[args.indexOf('-SessionToken')+1];ledgerPath=args[args.indexOf('-LedgerPath')+1];helper=new EventEmitter();
  Object.assign(helper,{pid:90001,exitCode:null,signalCode:null,killed:false,stdin:new PassThrough(),stdout:new PassThrough(),stderr:new PassThrough(),kill(){assert.equal(this,helper);helperKills++;this.killed=true;if(!deferKill){this.exitCode=1;this.signalCode='SIGTERM';this.emit('close',1,'SIGTERM');}}});
  helper.stdin.on('data',chunk=>queries.push(JSON.parse(chunk.toString())));save([]);return helper;
 }};
 const localRequire=name=>name==='node:child_process'?fakeCP:name==='node:perf_hooks'?{performance:{now:()=>clock}}:require(name),copy={exports:{}};
 const schedule=(fn,ms)=>{const id=++nextTimer;timers.set(id,{fn,at:clock+ms,ms});return id;};
 vm.runInNewContext(fs.readFileSync(ownerFile,'utf8'),{require:localRequire,module:copy,__filename:ownerFile,__dirname:path.dirname(ownerFile),process:{platform:'win32',pid:12345},Buffer,URL,setTimeout:schedule,clearTimeout:id=>timers.delete(id),setInterval,clearInterval},{filename:ownerFile});
 const session=copy.exports.createOwnedSession({out:dir,onLedger:rows=>ledgers.push(JSON.parse(JSON.stringify(rows)))});
 const ready=()=>frame({kind:'ready',token,pid:helper.pid,startTicks:helperTicks,parentPid:12345,parentStartTicks:parentTicks,affinity:Math.min(2,os.availableParallelism())===1?'1':'3',priority:'BelowNormal'});
 const advance=ms=>{clock+=ms;for(const[id,value]of [...timers])if(value.at<=clock){timers.delete(id);value.fn();}};
 t.after(async()=>{if(helper.exitCode===null)helper.kill();await session.close();});
 return{session,ready,queries,frame,save,advance,elapseWithoutTimers:ms=>{clock+=ms;},ledgers,helper,get token(){return token;},get helperKills(){return helperKills;},get ledgerPath(){return ledgerPath;}};
}

test('persistent queue deadline is measured from enqueue and never reset when the request starts',async t=>{
 const unit=sessionUnit(t);unit.ready();await unit.session.ready;
 const first=unit.session.request('Inspect',222,'100'),second=unit.session.request('Inspect',333,'101');
 const rejected=assert.rejects(second,/timeout10s including queue/);assert.equal(unit.queries.length,1);
 unit.advance(9000);const sent=unit.queries[0];unit.frame({kind:'result',token:unit.token,id:sent.id,value:{result:'GONE',pid:222,processes:[]}});assert.equal((await first).result,'GONE');assert.equal(unit.queries.length,2);
 unit.advance(1000);await rejected;assert.equal(unit.helperKills,1);await assert.rejects(unit.session.request('Inspect',222,'100'),/timeout10s/);assert.equal(unit.queries.length,2);
});

test('persistent malformed JSON, stale reply, EOF and oversized line fail closed on the original child',async t=>{
 for(const kind of ['bad-json','stale-id','eof','oversize','partial-line']){
  const unit=sessionUnit(t);unit.ready();await unit.session.ready;const promise=unit.session.request('Limit',222,'100'),rejected=assert.rejects(promise,/owned-helper/);
  if(kind==='bad-json')unit.helper.stdout.write('{not JSON}\n');
  if(kind==='stale-id')unit.frame({kind:'result',token:unit.token,id:99,value:{result:'GONE',pid:222,processes:[]}});
  if(kind==='eof'){unit.helper.exitCode=1;unit.helper.emit('close',1,null);}
  if(kind==='oversize')unit.helper.stdout.write(Buffer.alloc(1024*1024+1,120));
  if(kind==='partial-line'){unit.helper.stdout.write('{"kind":');unit.helper.exitCode=1;unit.helper.emit('close',1,null);}
  await rejected;assert.equal(unit.session.alive,false);assert.ok(unit.helperKills<=1);await assert.rejects(unit.session.request('Limit',222,'100'),/owned-helper/);
 }
});

test('persistent READY rejects foreign identity and durable receipts survive EOF before a reply',async t=>{
 const foreign=sessionUnit(t);const badReady=assert.rejects(foreign.session.ready,/READY/);foreign.frame({kind:'ready',token:foreign.token,pid:88888,startTicks:'10',parentPid:12345,parentStartTicks:'9',affinity:'3',priority:'BelowNormal'});await badReady;assert.equal(foreign.queries.length,0);
 const unit=sessionUnit(t);unit.ready();await unit.session.ready;const promise=unit.session.request('Limit',222,'100'),rejected=assert.rejects(promise,/EOF/);
 const rows=[{pid:222,startTicks:'100',depth:0},{pid:333,startTicks:'101',depth:1}];unit.save(rows); // durable write precedes the deliberately missing reply
 unit.helper.exitCode=1;unit.helper.emit('close',1,null);await rejected;
 assert.deepEqual(JSON.parse(JSON.stringify(unit.session.recoverLedger())),rows);assert.deepEqual(unit.ledgers.at(-1),rows);
 const saved=JSON.parse(fs.readFileSync(unit.ledgerPath,'utf8'));saved.token='foreign';fs.writeFileSync(unit.ledgerPath,JSON.stringify(saved));assert.throws(()=>unit.session.recoverLedger(),/Foreign/);assert.deepEqual(unit.ledgers.at(-1),rows);
});

test('persistent cleanup fence drains submitted requests and rejects fresh work without losing Stop access',async t=>{
 const unit=sessionUnit(t);unit.ready();await unit.session.ready;const pending=unit.session.request('Inspect',222,'100'),drain=unit.session.beginCleanup();
 await assert.rejects(unit.session.request('Limit',222,'100'),/closed for new work/);assert.equal(unit.queries.length,1);
 unit.frame({kind:'result',token:unit.token,id:1,value:{result:'GONE',pid:222,processes:[]}});await pending;await drain;
 const stop=unit.session.request('Stop',222,'100');assert.equal(unit.queries.length,2);
 unit.frame({kind:'result',token:unit.token,id:2,value:{result:'GONE',pid:222,processes:[]}});assert.equal((await stop).result,'GONE');
 const closing=unit.session.close(),rejected=assert.rejects(closing,/partial JSON/);assert.equal(unit.queries.at(-1).kind,'close');unit.frame({kind:'closed',token:unit.token,id:3});unit.helper.stdout.write('partial');unit.helper.exitCode=0;unit.helper.emit('close',0,null);await rejected;
});

// Native test fixture owns ONE service and birth-pinned CPU-only roots. Its ONE
// after-hook cleans descendants before helper closure and directory removal.
async function realWindowsFixture(t){
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'bounded-qa064-real-session-')),session=B.createOwnedSession({out}),roots=[],known=new Map();let cleanupPromise;
 const remember=rows=>{for(const r of rows){assert.ok(Number.isInteger(r.pid)&&/^\d+$/.test(r.startTicks)&&Number.isInteger(r.depth));known.set(r.pid+':'+r.startTicks,{pid:r.pid,startTicks:r.startTicks,depth:r.depth});}};
 const cleanup=()=>{
  if(cleanupPromise)return cleanupPromise;
  cleanupPromise=(async()=>{
   const errors=[];let stopped,shutdown,quiescent=false;
   try{
    await session.beginCleanup();
    quiescent=session.alive;
    if(!session.alive&&session.failure)try{const stable=await session.settleForFallback();remember(stable.processes);quiescent=true;}catch(e){errors.push(e);}
    if(!quiescent)errors.push(Error('Native fixture helper quiescence not verified'));
    try{remember(session.recoverLedger());}catch(e){errors.push(e);}
    // An assertion can fail after the flag created a child but BEFORE Limit
    // recorded it. Fresh Inspect of the already-pinned root captures that case.
    if(quiescent)for(const root of roots)if(root.birth)try{const found=await B.ownedProcess('Inspect',root.child.pid,root.birth.startTicks);remember(found.processes);if(root.maySpawn&&found.result==='GONE'&&!root.descendantObserved)errors.push(Error('Root vanished before descendant ownership was captured'));if(found.processes.some(r=>r.depth>0))root.descendantObserved=true;}catch(e){errors.push(e);}
    const rows=[...known.values()];if(quiescent&&rows.length){const owner=rows[0];try{stopped=await B.ownedProcess('Stop',owner.pid,owner.startTicks,rows);if(stopped.result!=='PASS')throw Error('Pinned native fixture Stop failed');}catch(e){errors.push(e);}}
   }finally{
    // Stop/join every original ChildProcess capability even on uncertain cleanup.
    // This is never a new PID-based ownership claim; errors/evidence stay failed.
    for(const root of roots){
     try{if(root.child.exitCode===null&&root.child.signalCode===null)root.child.kill();}catch(e){errors.push(e);}
     let timer;try{await Promise.race([root.exit,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Original native root did not exit')),2000);})]);}catch(e){errors.push(e);}finally{clearTimeout(timer);}
    }
    try{shutdown=await session.close();}catch(e){errors.push(e);}
   }
   if(errors.length)throw Error('Native fixture cleanup unverified; preserved '+out+': '+errors.map(e=>e.message).join(' | '));
   const proof={processes:[...known.values()],stopped,shutdown};fs.rmSync(out,{recursive:true,force:true});return proof;
  })();cleanupPromise.catch(()=>{});return cleanupPromise;
 };
 t.after(()=>cleanup());await session.ready;
 return{out,session,cleanup,remember,async spawn(script='setInterval(()=>{},1000)',args=[]){if(cleanupPromise)throw Error('Native fixture cleanup already started; refusing spawn');const child=cp.spawn(process.execPath,['--max-old-space-size=400','-e',script,...args],{windowsHide:true,stdio:'ignore'}),root={child,exit:once(child,'exit'),birth:null,maySpawn:false,descendantObserved:false};root.exit.catch(()=>{});roots.push(root);const birth=await session.request('Birth',child.pid);assert.equal(birth.result,'PASS');root.birth=birth;remember(root.birth.processes);return root;}};
}

test('one persistent Windows host discovers a real child born between Limits and refuses stale or foreign ownership',{skip:process.platform!=='win32',timeout:30000},async t=>{
 const fixture=await realWindowsFixture(t),{out,session}=fixture,helper=session.owner,first=await fixture.spawn(),before=await session.request('Limit',first.child.pid,first.birth.startTicks);
 assert(before.processes.some(p=>p.pid===first.child.pid));
 // A second directly owned root is born AFTER the first snapshot; this validates
 // fresh session ancestry/limiting. An actual grandchild is requested from root1.
 const spawnGrandchild=path.join(out,'spawn-grandchild.flag'),grandchildPid=path.join(out,'grandchild.pid');
 const root=await fixture.spawn(`const fs=require('node:fs'),cp=require('node:child_process');let done=false;setInterval(()=>{if(!done&&fs.existsSync(process.argv[1])){done=true;const c=cp.spawn(process.execPath,['--max-old-space-size=400','-e','setInterval(()=>{},1000)'],{windowsHide:true,stdio:'ignore'});fs.writeFileSync(process.argv[2],String(c.pid));}},10)`,[spawnGrandchild,grandchildPid]);
 assert.equal(fs.existsSync(spawnGrandchild),false);assert.equal(fs.existsSync(grandchildPid),false);
 const initial=await session.request('Limit',root.child.pid,root.birth.startTicks);
 const initialState={flag:fs.existsSync(spawnGrandchild),childFile:fs.existsSync(grandchildPid),receipts:initial.processes.slice(0,16).map(({pid,startTicks,depth})=>({pid,startTicks,depth}))};
 assert.equal(initialState.flag,false,JSON.stringify(initialState));assert.equal(initialState.childFile,false,JSON.stringify(initialState));
 root.maySpawn=true;fs.writeFileSync(spawnGrandchild,'go');const until=Date.now()+3000;while(!fs.existsSync(grandchildPid)&&Date.now()<until)await new Promise(resolve=>setTimeout(resolve,10));assert(fs.existsSync(grandchildPid),'real child must be born');
 const childPid=Number(fs.readFileSync(grandchildPid,'utf8')),after=await session.request('Limit',root.child.pid,root.birth.startTicks),record=after.processes.find(p=>p.pid===childPid);root.descendantObserved=!!record;fixture.remember(after.processes);
 assert(record,'the next real Toolhelp snapshot must discover the new descendant');assert(!initial.processes.some(p=>p.pid===childPid&&p.startTicks===record.startTicks),'Controlled child already present before its flag: '+JSON.stringify(initialState));assert.equal(record.priority,'BelowNormal');assert.equal(BigInt(record.affinity).toString(2).split('').filter(b=>b==='1').length,Math.min(2,os.availableParallelism()));assert.equal(session.owner.pid,helper.pid);assert.equal(session.owner.startTicks,helper.startTicks);
 const ledger=session.recoverLedger();assert(ledger.some(p=>p.pid===childPid&&p.startTicks===record.startTicks));
 assert.equal((await session.request('Stop',first.child.pid,first.birth.startTicks,[{pid:first.child.pid,startTicks:first.birth.startTicks,depth:0}])).result,'PASS');await first.exit;
 await assert.rejects(session.request('Limit',root.child.pid,'1'),/start time changed/);assert.equal(session.alive,false);
 // The dead-channel fallback is the ORIGINAL one-shot Stop, with ONLY the
 // persisted ownership receipts. No retry of Limit or new browser is allowed.
 const proof=await fixture.cleanup();assert.equal(proof.stopped.result,'PASS');await Promise.all([root.exit,first.exit]);assert.equal((await B.ownedProcess('Birth',childPid)).result,'GONE');
 const foreign=await realWindowsFixture(t),foreignHelper=foreign.session.owner;
 await assert.rejects(foreign.session.request('Inspect',process.pid,foreignHelper.parentStartTicks),/cannot target|descendant/); // never mutate the owner
});

test('actual owner retains lease and every durable receipt when the session dies and original fallback cleanup fails',async t=>{
 const vm=require('node:vm'),{EventEmitter}=require('node:events'),{PassThrough}=require('node:stream'),dir=temp(t),out=path.join(dir,'dead-channel'),ownerFile=require.resolve('../scripts/run-bounded-qa.cjs'),timers=new Map(),fallback=[];
 const pid=43210,startTicks='638000000000000001',rootRecord={pid,startTicks,depth:0},newRecord={pid:43211,startTicks:'638000000000000002',depth:1};let nextTimer=0,limits=0;const logs=[];
 const child=new EventEmitter();Object.assign(child,{pid,exitCode:null,stdout:new PassThrough(),stderr:new PassThrough(),send(m,cb){cb?.();if(m.type==='abort')this.kill();},kill(){if(this.exitCode!==null)return;this.exitCode=1;this.stdout.end();this.stderr.end();this.emit('exit',1,'SIGTERM');}});
 // Declared UNIT transport: only the bootstrap precondition is acknowledged;
 // the monitored operation and the ORIGINAL fallback both fail deliberately.
 const fakeCP={fork(){return child;},execFile(exe,args,options,cb){assert.equal(exe,'powershell.exe');assert.equal(options.timeout,10000);assert.equal(args[args.indexOf('-Mode')+1],'Stop');fallback.push(JSON.parse(args[args.indexOf('-PinnedProcessesJson')+1]));cb(Object.assign(Error('injected original fallback timeout'),{killed:true,signal:'SIGTERM'}),'','');},spawn(exe,args){
  const token=args[args.indexOf('-SessionToken')+1],ledger=args[args.indexOf('-LedgerPath')+1],helper=new EventEmitter(),helperTicks='638000000000000000',parentTicks='637000000000000000';
  Object.assign(helper,{pid:90001,exitCode:null,signalCode:null,killed:false,stdin:new PassThrough(),stdout:new PassThrough(),stderr:new PassThrough(),kill(){if(this.exitCode!==null)return;this.killed=true;this.exitCode=1;this.emit('close',1,'SIGTERM');}});
  const save=rows=>fs.writeFileSync(ledger,JSON.stringify({schema:1,token,helperPid:helper.pid,helperStartTicks:helperTicks,parentPid:12345,parentStartTicks:parentTicks,processes:rows})),emit=m=>helper.stdout.write(JSON.stringify(m)+'\n');save([]);
  helper.stdin.on('data',chunk=>{const m=JSON.parse(chunk.toString());assert.equal(m.kind,'request');if(m.mode==='Limit'&&++limits===2){save([rootRecord,newRecord]);helper.exitCode=1;helper.emit('close',1,null);return;}save([rootRecord]);emit({kind:'ledger',token,id:m.id,processes:[rootRecord]});emit({kind:'result',token,id:m.id,value:{result:'PASS',pid,startTicks,processes:[rootRecord]}});});
  queueMicrotask(()=>emit({kind:'ready',token,pid:helper.pid,startTicks:helperTicks,parentPid:12345,parentStartTicks:parentTicks,affinity:Math.min(2,os.availableParallelism())===1?'1':'3',priority:'BelowNormal'}));return helper;
 }};
 const fakeFS={...fs,statfsSync(){return{bavail:1024*1024*1024,bsize:1};},createWriteStream(...args){const log=fs.createWriteStream(...args);logs.push(log);return log;}},copy={exports:{}},localRequire=n=>n==='node:child_process'?fakeCP:n==='node:fs'?fakeFS:require(n);
 const schedule=(fn,ms,interval)=>{const id=++nextTimer;timers.set(id,{fn,ms,interval});return id;};
 vm.runInNewContext(fs.readFileSync(ownerFile,'utf8'),{require:localRequire,module:copy,__filename:ownerFile,__dirname:path.dirname(ownerFile),process:{platform:'win32',pid:12345},Buffer,URL,setTimeout:(f,m)=>schedule(f,m,false),clearTimeout:id=>timers.delete(id),setInterval:(f,m)=>schedule(f,m,true),clearInterval:id=>timers.delete(id)},{filename:ownerFile});
 const running=copy.exports.run({out,leaseRoot:dir,site:dir,cases:['never-run'],viewports:[['portrait',390,844]]});
 const drain=async()=>{for(let n=0;n<40;n++)await Promise.resolve();};await drain();assert.equal(limits,1);const monitor=[...timers.values()].find(r=>r.interval&&r.ms===2500);assert(monitor);monitor.fn();await drain();
 const report=await running;await Promise.all(logs.map(log=>log.closed?Promise.resolve():once(log,'close')));
 assert.equal(report.result,'FAIL');assert.match(report.failure,/EOF/);assert.match(report.cleanupErrors.join('\n'),/Stop/);assert.equal(report.helperShutdown.result,'CLOSED');assert.equal(report.helperShutdown.forced,true);
 assert.deepEqual(JSON.parse(JSON.stringify(report.ownedProcessLedger)),[rootRecord,newRecord]);assert.equal(fallback.length,1);assert.deepEqual(fallback[0],[rootRecord,newRecord]);assert.match(report.leaseRetained,/not verified/);assert(fs.existsSync(path.join(dir,'.bounded-qa-lease.json')));
 const saved=JSON.parse(fs.readFileSync(path.join(out,'bounded-report.json'),'utf8'));assert.equal(saved.failure,report.failure);assert.deepEqual(saved.ownedProcessLedger,[rootRecord,newRecord]);
});

test('original depthless Stop ACKs require the requested historical PID and birth without changing reply shape',async t=>{
 const unit=sessionUnit(t);unit.ready();await unit.session.ready;const rows=[{pid:222,startTicks:'100',depth:2}],ack={pid:222,startTicks:'100',stopped:true};unit.save(rows);unit.session.recoverLedger();
 const stopped=unit.session.request('Stop',222,'100',rows);unit.frame({kind:'result',token:unit.token,id:1,value:{result:'PASS',mode:'Stop',processes:[ack]}});
 assert.deepEqual(JSON.parse(JSON.stringify((await stopped).processes)),[ack]);assert.deepEqual(JSON.parse(JSON.stringify(unit.session.recoverLedger())),rows);
 for(const bad of [{pid:333,startTicks:'100',stopped:true},{pid:222,startTicks:'101',stopped:true},{pid:222,startTicks:'100',depth:0,stopped:true},{pid:222,startTicks:'100',stopped:false}]){
  const rejectedUnit=sessionUnit(t);rejectedUnit.ready();await rejectedUnit.session.ready;rejectedUnit.save(rows);rejectedUnit.session.recoverLedger();const promise=rejectedUnit.session.request('Stop',222,'100',rows),rejected=assert.rejects(promise,/Stop acknowledgement|schema/);rejectedUnit.frame({kind:'result',token:rejectedUnit.token,id:1,value:{result:'PASS',mode:'Stop',processes:[bad]}});await rejected;
 }
});

test('startup and active stderr enforce1MiB while diagnostics retain exact byte counts and clipping',async t=>{
 for(const phase of ['startup','active']){
  const unit=sessionUnit(t);let promise;if(phase==='active'){unit.ready();await unit.session.ready;promise=unit.session.request('Limit',222,'100');}else promise=unit.session.ready;
  const rejected=assert.rejects(promise,error=>{assert.match(error.message,/stderr exceeds1MiB/);assert.equal(error.ownedProcessDiagnostics.stderr.bytes,1024*1024+1);assert.equal(error.ownedProcessDiagnostics.stderr.truncated,true);assert.ok(Buffer.byteLength(error.ownedProcessDiagnostics.stderr.text)<=515);return true;});
  unit.helper.stderr.write(Buffer.alloc(1024*1024,120));if(phase==='active')assert.equal(unit.session.alive,true);unit.helper.stderr.write(Buffer.from('x'));await rejected;assert.equal(unit.helperKills,1);
 }
});

test('shutdown rejects late exit delivery on both CLOSED fast path and after awaited exit without timer callbacks',async t=>{
 for(const phase of ['closed-fast-path','await-exit']){
  const unit=sessionUnit(t);unit.ready();await unit.session.ready;const closing=unit.session.close(),rejected=assert.rejects(closing,/shutdown past deadline10s/);
  unit.elapseWithoutTimers(9000);unit.frame({kind:'closed',token:unit.token,id:1});
  if(phase==='await-exit')for(let n=0;n<5;n++)await Promise.resolve();
  unit.elapseWithoutTimers(1001);unit.helper.exitCode=0;unit.helper.emit('close',0,null);await rejected;
 }
});

test('an assertion before the second native snapshot still cleans the actual born descendant before helper and fixture removal',{skip:process.platform!=='win32',timeout:30000},async t=>{
 const fixture=await realWindowsFixture(t),flag=path.join(fixture.out,'birth.flag'),pidFile=path.join(fixture.out,'child.pid');
 const root=await fixture.spawn(`const fs=require('node:fs'),cp=require('node:child_process');let born=false;setInterval(()=>{if(!born&&fs.existsSync(process.argv[1])){born=true;const c=cp.spawn(process.execPath,['--max-old-space-size=400','-e','setInterval(()=>{},1000)'],{windowsHide:true,stdio:'ignore'});fs.writeFileSync(process.argv[2],String(c.pid));}},10)`,[flag,pidFile]);
 root.maySpawn=true;fs.writeFileSync(flag,'go');const until=Date.now()+3000;while(!fs.existsSync(pidFile)&&Date.now()<until)await new Promise(resolve=>setTimeout(resolve,10));assert(fs.existsSync(pidFile));const childPid=Number(fs.readFileSync(pidFile,'utf8'));
 let sentinel;try{assert.fail('intentional assertion before post-birth Limit');}catch(error){sentinel=error;}assert.match(sentinel.message,/intentional assertion/);
 const proof=await fixture.cleanup();assert(proof.processes.some(r=>r.pid===childPid&&r.depth>0));assert(proof.stopped.processes.some(r=>r.pid===childPid&&r.stopped===true));assert.equal(proof.shutdown.result,'CLOSED');assert.equal(fs.existsSync(fixture.out),false);
});

// Narrow UNIT owner transport for the two regression paths missed by V1.
// Worker PASS is only an adversarial precondition; both tests require FAIL.
function lifecycleOwnerUnit(t,{idleDeath=false}={}){
 const vm=require('node:vm'),{EventEmitter}=require('node:events'),{PassThrough}=require('node:stream'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'bounded-qa064-owner-v2-')),out=path.join(dir,'out'),ownerFile=require.resolve('../scripts/run-bounded-qa.cjs'),timers=new Map(),fallback=[],logs=[];
 const root={pid:43210,startTicks:'638000000000000001',depth:0},late={pid:43211,startTicks:'638000000000000002',depth:1};let timerId=0,limits=0,helper,saveLedger;
 const worker=new EventEmitter();Object.assign(worker,{pid:root.pid,exitCode:null,stdout:new PassThrough(),stderr:new PassThrough(),send(m,cb){cb?.();},kill(){if(this.exitCode!==null)return;this.exitCode=1;this.stdout.end();this.stderr.end();this.emit('exit',1,'SIGTERM');}});
 const exitHelper=()=>{if(helper.exitCode!==null)return;helper.exitCode=1;helper.signalCode='SIGTERM';helper.emit('close',1,'SIGTERM');};
 const fakeCP={fork(){return worker;},execFile(exe,args,options,callback){assert.notEqual(helper.exitCode,null,'original helper must be gone BEFORE fallback');assert.equal(options.timeout,10000);assert.equal(args[args.indexOf('-Mode')+1],'Stop');fallback.push(JSON.parse(args[args.indexOf('-PinnedProcessesJson')+1]));callback(Object.assign(Error('injected fallback failure'),{killed:true,signal:'SIGTERM'}),'','');},spawn(exe,args){
  const token=args[args.indexOf('-SessionToken')+1],ledger=args[args.indexOf('-LedgerPath')+1],helperTicks='638000000000000000',parentTicks='637000000000000000';helper=new EventEmitter();
  Object.assign(helper,{pid:90001,exitCode:null,signalCode:null,killed:false,stdin:new PassThrough(),stdout:new PassThrough(),stderr:new PassThrough(),kill(){this.killed=true;/* Deliberately no exit: the test must supply the original-handle close event. */}});
  saveLedger=rows=>fs.writeFileSync(ledger,JSON.stringify({schema:1,token,helperPid:helper.pid,helperStartTicks:helperTicks,parentPid:12345,parentStartTicks:parentTicks,processes:rows}));const frame=m=>helper.stdout.write(JSON.stringify(m)+'\n');saveLedger([]);
  helper.stdin.on('data',chunk=>{const m=JSON.parse(chunk.toString());assert.equal(m.kind,'request');if(!idleDeath&&m.mode==='Limit'&&++limits===2){helper.stdout.write('{bad JSON}\n');return;}
   if(m.mode==='Limit')limits=Math.max(limits,1);saveLedger([root]);
   if(m.mode==='Stop'){frame({kind:'result',token,id:m.id,value:{result:'PASS',mode:'Stop',processes:[]}});if(idleDeath)exitHelper();return;}
   const gone=idleDeath&&worker.exitCode!==null;frame({kind:'ledger',token,id:m.id,processes:[root]});frame({kind:'result',token,id:m.id,value:gone?{result:'GONE',pid:root.pid,processes:[]}:{result:'PASS',pid:root.pid,startTicks:root.startTicks,processes:[root]}});
  });queueMicrotask(()=>frame({kind:'ready',token,pid:helper.pid,startTicks:helperTicks,parentPid:12345,parentStartTicks:parentTicks,affinity:Math.min(2,os.availableParallelism())===1?'1':'3',priority:'BelowNormal'}));return helper;
 }};
 const fakeFS={...fs,statfsSync(){return{bavail:1024*1024*1024,bsize:1};},createWriteStream(...a){const log=fs.createWriteStream(...a);logs.push(log);return log;}},copy={exports:{}},localRequire=n=>n==='node:child_process'?fakeCP:n==='node:fs'?fakeFS:require(n),schedule=(fn,ms,interval)=>{const id=++timerId;timers.set(id,{fn,ms,interval});return id;};
 vm.runInNewContext(fs.readFileSync(ownerFile,'utf8'),{require:localRequire,module:copy,__filename:ownerFile,__dirname:path.dirname(ownerFile),process:{platform:'win32',pid:12345},Buffer,URL,setTimeout:(f,m)=>schedule(f,m,false),clearTimeout:id=>timers.delete(id),setInterval:(f,m)=>schedule(f,m,true),clearInterval:id=>timers.delete(id)},{filename:ownerFile});
 const running=copy.exports.run({out,leaseRoot:dir,site:dir,cases:['UNIT-never-Game'],viewports:[['portrait',390,844]]}),drain=async()=>{for(let n=0;n<60;n++)await Promise.resolve();};running.catch(()=>{});
 t.after(async()=>{worker.kill();if(helper)exitHelper();await running;await Promise.all(logs.map(log=>log.closed?Promise.resolve():once(log,'close')));fs.rmSync(dir,{recursive:true,force:true});});
 return{running,drain,root,late,fallback,worker,dir,out,get limits(){return limits;},tick:async ms=>{const timer=[...timers.values()].find(r=>r.interval&&r.ms===ms);assert(timer);timer.fn();await drain();},saveFinalLedger:()=>saveLedger([root,late]),exitHelper,finishPass:()=>{worker.emit('message',{type:'done',result:'PASS',originalResult:'PASS'});worker.exitCode=0;worker.stdout.end();worker.stderr.end();worker.emit('exit',0,null);}};
}

test('idle helper death after successful final Stop still fails the batch even when cleanup is verified',async t=>{
 const unit=lifecycleOwnerUnit(t,{idleDeath:true});await unit.drain();assert.equal(unit.limits,1);unit.finishPass();const report=await unit.running;
 assert.equal(report.workerResult,'PASS');assert.equal(report.cleanup[0].result,'PASS');assert.equal(report.helperShutdown.result,'CLOSED');assert.equal(report.result,'FAIL');assert.match(report.failure,/EOF/);assert.match(report.helperFailure,/EOF/);assert.equal(report.cleanupErrors,undefined);assert.equal(unit.fallback.length,0);assert.equal(fs.existsSync(path.join(unit.dir,'.bounded-qa-lease.json')),false);
});

test('abort and finally share one fallback only after helper death and final durable-ledger recovery',async t=>{
 const unit=lifecycleOwnerUnit(t);await unit.drain();assert.equal(unit.limits,1);await unit.tick(2500);assert.equal(unit.worker.exitCode,null,'the worker stays alive on abort in this regression');await unit.tick(500);assert.equal(unit.fallback.length,0,'no fallback while the original helper can still mutate');
 unit.saveFinalLedger();unit.exitHelper();await unit.drain();const report=await unit.running;
 assert.equal(unit.fallback.length,1);assert.deepEqual(unit.fallback[0],[unit.root,unit.late]);assert.equal(report.helperFallback.attempts,1);assert.equal(report.helperFallback.stableLedger,true);assert.equal(report.helperFallback.status,'FAIL');assert.deepEqual(JSON.parse(JSON.stringify(report.ownedProcessLedger)),[unit.root,unit.late]);assert.match(report.failure,/JSON/);assert.match(report.cleanupErrors.join('\n'),/Stop/);assert.match(report.leaseRetained,/not verified/);assert.equal(fs.existsSync(path.join(unit.dir,'.bounded-qa-lease.json')),true);
});

test('unqualified original fixture roots are stopped and joined even when Birth and ledger or fencing fail',async()=>{
 const vm=require('node:vm'),{EventEmitter}=require('node:events'),source=fs.readFileSync(__filename,'utf8'),first=source.indexOf('async function realWindowsFixture(t){'),last=source.indexOf("\ntest('one persistent Windows host",first);assert(first>=0&&last>first);
 // Execute the ACTUAL fixture function, not a mirrored cleanup implementation.
 // This is a controlled UNIT ChildProcess capability: no process is spawned and
 // no descendant is invented or inspected. The three original Birth/GONE
 // negatives still reject admission; the fourth case admits one declared UNIT
 // root then fails its later Inspect, without proving native discovery.
 for(const kind of ['admitted-later-Inspect-fail','Birth-reject-ledger-fail','Birth-GONE-ledger-fail','Birth-reject-fence-fail']){
  const admitted=kind==='admitted-later-Inspect-fail',events=[],hooks=[],child=new EventEmitter(),exit=once(child,'exit'),birthError=Error('intentional Birth rejection'),ledgerError=Error('intentional ledger failure'),fenceError=Error('intentional fence failure'),inspectError=Error('intentional later Inspect failure'),record={pid:54321,startTicks:'638000000000000001',depth:0};let out,killCount=0,processOperations=0,removed=0,spawns=0;
  Object.assign(child,{pid:54321,exitCode:null,signalCode:null,kill(){assert.equal(this,child,'only the original ChildProcess capability');killCount++;events.push('kill');queueMicrotask(()=>{this.exitCode=1;this.signalCode='SIGTERM';events.push('exit');this.emit('exit',1,'SIGTERM');});}});
  const session={ready:Promise.resolve(),alive:admitted,failure:admitted?null:birthError,async request(mode,pid){assert.equal(mode,'Birth');assert.equal(pid,child.pid);if(admitted)return{result:'PASS',pid,startTicks:record.startTicks,processes:[record]};if(kind.includes('GONE'))return{result:'GONE',pid,processes:[]};throw birthError;},async beginCleanup(){if(kind.includes('fence'))throw fenceError;},async settleForFallback(){throw Error('intentional helper death not verified');},recoverLedger(){if(admitted)return[record];throw ledgerError;},async close(){assert.equal(child.exitCode,1,'join must precede helper close');events.push('helper-close');return{result:'CLOSED'};}};
  const fixtureFS={...fs,mkdtempSync(prefix){out=fs.mkdtempSync(prefix);return out;},rmSync(){removed++;throw Error('uncertain evidence must not be removed');}},copy={exports:{}};
  vm.runInNewContext(source.slice(first,last)+'\nmodule.exports=realWindowsFixture;',{module:copy,B:{createOwnedSession:()=>session,ownedProcess(mode,pid,ticks,rows){processOperations++;assert.equal(admitted,true,'unqualified PID must never be inspected or stopped by PID');assert.equal(pid,record.pid);assert.equal(ticks,record.startTicks);if(mode==='Inspect')throw inspectError;assert.equal(mode,'Stop');assert.deepEqual(JSON.parse(JSON.stringify(rows)),[record]);events.push('trusted-stop');return Promise.resolve({result:'PASS',processes:[{pid:record.pid,startTicks:record.startTicks,stopped:true}]});}},cp:{spawn(){spawns++;return child;}},fs:fixtureFS,path,os,assert,once,process:{execPath:process.execPath},setTimeout,clearTimeout},{filename:'declared-unit-realWindowsFixture-v3'});
  try{
   const fixture=await copy.exports({after:hook=>hooks.push(hook)});
   if(admitted){const root=await fixture.spawn();assert.equal(root.birth.startTicks,record.startTicks);}else await assert.rejects(fixture.spawn(),error=>kind.includes('GONE')?error.code==='ERR_ASSERTION':error===birthError);
   assert.equal(hooks.length,1);const cleanup=fixture.cleanup();assert.equal(hooks[0](),cleanup,'one memoized cleanup');const refusedSpawn=fixture.spawn();refusedSpawn.catch(()=>{});await assert.rejects(cleanup,error=>{assert.match(error.message,admitted?/intentional later Inspect failure/:kind.includes('fence')?/intentional fence failure/:/intentional ledger failure/);return true;});
   assert.equal(killCount,1);assert.deepEqual(events,admitted?['trusted-stop','kill','exit','helper-close']:['kill','exit','helper-close']);assert.equal(processOperations,admitted?2:0);await assert.rejects(refusedSpawn,/cleanup already started; refusing spawn/);assert.equal(spawns,1,'cleanup fencing must prevent creation of another ChildProcess');assert.equal(removed,0);assert.equal(fs.existsSync(out),true,'uncertain evidence remains');
  }finally{if(child.exitCode===null)child.kill();await exit;if(out)fs.rmSync(out,{recursive:true,force:true});}
 }
});

test('PowerShell5 one-shot replies enter the actual caller pipeline for Birth Inspect Limit and pinned Stop',{skip:process.platform!=='win32',timeout:30000},async t=>{
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'bounded-qa064-ps-pipeline-')),script=path.join(out,'pipeline.ps1'),helper=require.resolve('../scripts/limit-owned-qa.ps1');
 const child=cp.spawn(process.execPath,['--max-old-space-size=400','-e','setInterval(()=>{},1000)'],{windowsHide:true,stdio:'ignore'}),exit=once(child,'exit');exit.catch(()=>{});
 t.after(async()=>{let timer,joined=false;try{if(child.exitCode===null&&child.signalCode===null)child.kill();await Promise.race([exit,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Original pipeline test root did not exit')),2000);})]);joined=true;}finally{clearTimeout(timer);if(joined)fs.rmSync(out,{recursive:true,force:true});}});
 // This is a REAL powershell.exe caller invoking the helper in-process with
 // &, exactly the success-pipeline shape used by the original8501 owner.
 fs.writeFileSync(script,`param([string]$Helper,[int]$RootPid)
$ErrorActionPreference='Stop'
function Require-Reply($Value,[string]$Mode) {
 if ($null -eq $Value -or $Value.result -cne 'PASS') { throw ('Missing original success-pipeline reply: '+$Mode) }
 return $Value
}
$birth=Require-Reply -Value (& $Helper -Mode Birth -OwnedPid $RootPid | ConvertFrom-Json) -Mode Birth
if ($birth.pid -ne $RootPid -or $birth.startTicks -notmatch '^\\d+$') { throw 'Invalid pipeline Birth' }
$inspected=Require-Reply -Value (& $Helper -Mode Inspect -OwnedPid $RootPid -ExpectedStartTicks $birth.startTicks | ConvertFrom-Json) -Mode Inspect
$limited=Require-Reply -Value (& $Helper -Mode Limit -OwnedPid $RootPid -ExpectedStartTicks $birth.startTicks | ConvertFrom-Json) -Mode Limit
$native=@($limited.processes | Where-Object { $_.pid -eq $RootPid -and $_.startTicks -ceq $birth.startTicks })
if ($native.Count -ne 1 -or $native[0].priority -cne 'BelowNormal') { throw 'Pipeline Limit did not apply scheduler' }
$receipts=ConvertTo-Json -InputObject @($limited.processes) -Compress -Depth 6
$stopped=Require-Reply -Value (& $Helper -Mode Stop -OwnedPid $RootPid -ExpectedStartTicks $birth.startTicks -PinnedProcessesJson $receipts | ConvertFrom-Json) -Mode Stop
if (@($stopped.processes | Where-Object { $_.pid -eq $RootPid -and $_.startTicks -ceq $birth.startTicks -and $_.stopped -eq $true }).Count -ne 1) { throw 'Original pinned Stop ACK not received in pipeline' }
@{result='PASS';psVersion=$PSVersionTable.PSVersion.ToString();modes=@('Birth','Inspect','Limit','Stop');birth=$birth;inspect=$inspected;limit=$limited;stop=$stopped} | ConvertTo-Json -Compress -Depth 7
`);
 const receipt=await new Promise((resolve,reject)=>cp.execFile('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',script,'-Helper',helper,'-RootPid',String(child.pid)],{windowsHide:true,timeout:10000,maxBuffer:1024*1024},(error,stdout)=>{if(error){reject(error);return;}try{resolve(JSON.parse(stdout.replace(/^\uFEFF/,'')));}catch(parseError){reject(parseError);}}));
 assert.equal(receipt.result,'PASS');assert.match(receipt.psVersion,/^5\.1\./);assert.deepEqual(receipt.modes,['Birth','Inspect','Limit','Stop']);assert.equal(receipt.birth.pid,child.pid);assert(receipt.inspect.processes.some(r=>r.pid===child.pid&&r.startTicks===receipt.birth.startTicks));
 const applied=receipt.limit.processes.find(r=>r.pid===child.pid);assert.equal(applied.priority,'BelowNormal');assert.equal(BigInt(applied.affinity).toString(2).split('').filter(b=>b==='1').length,Math.min(2,os.availableParallelism()));assert.deepEqual(Object.keys(receipt.stop.processes[0]).sort(),['pid','startTicks','stopped']);await exit;
});

// Declared UNIT transport executing the actual owner/session source. Its child,
// disk and helper replies do not prove native discovery, browser or Game behavior.
function terminalRaceOwnerUnit(t){
 const vm=require('node:vm'),{EventEmitter}=require('node:events'),{PassThrough}=require('node:stream'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'bounded-qa064-terminal-')),out=path.join(dir,'terminal-race'),ownerFile=require.resolve('../scripts/run-bounded-qa.cjs'),timers=new Map(),logs=[],calls=[],sent=[];
 const root={pid:43210,startTicks:'638000000000000001',depth:0};let nextTimer=0,helper,releaseMonitor,monitorCount=0,workerKills=0;
 const worker=new EventEmitter();Object.assign(worker,{pid:root.pid,exitCode:null,signalCode:null,stdout:new PassThrough(),stderr:new PassThrough(),send(m,cb){sent.push(m);cb?.();},kill(){workerKills++;exitWorker(1,'SIGTERM');}});
 function exitWorker(code,signal=null){if(worker.exitCode!==null||worker.signalCode!==null)return;worker.exitCode=code;worker.signalCode=signal;worker.stdout.end();worker.stderr.end();worker.emit('exit',code,signal);}
 const fakeCP={fork(){return worker;},execFile(){throw Error('No one-shot fallback is expected in this healthy-session UNIT');},spawn(exe,args){
  const token=args[args.indexOf('-SessionToken')+1],ledger=args[args.indexOf('-LedgerPath')+1],helperTicks='638000000000000000',parentTicks='637000000000000000';helper=new EventEmitter();
  Object.assign(helper,{pid:90001,exitCode:null,signalCode:null,killed:false,stdin:new PassThrough(),stdout:new PassThrough(),stderr:new PassThrough(),kill(){this.killed=true;this.exitCode=1;this.signalCode='SIGTERM';this.emit('close',1,'SIGTERM');}});
  const frame=m=>helper.stdout.write(JSON.stringify(m)+'\n'),save=()=>fs.writeFileSync(ledger,JSON.stringify({schema:1,token,helperPid:helper.pid,helperStartTicks:helperTicks,parentPid:12345,parentStartTicks:parentTicks,processes:[root]}));save();
  helper.stdin.on('data',chunk=>{const m=JSON.parse(chunk.toString());
   if(m.kind==='close'){frame({kind:'closed',token,id:m.id});helper.exitCode=0;helper.emit('close',0,null);return;}
   calls.push({mode:m.mode,pid:m.pid,startTicks:m.startTicks,receipts:m.receipts});save();
   if(m.mode==='Limit'&&++monitorCount===2){releaseMonitor=(result='GONE')=>{frame({kind:'result',token,id:m.id,value:result==='FAIL'?{result:'FAIL',pid:root.pid,processes:[],error:'Exact helper sentinel'}:{result:'GONE',pid:root.pid,processes:[]}});};return;}
   frame({kind:'ledger',token,id:m.id,processes:[root]});frame({kind:'result',token,id:m.id,value:m.mode==='Stop'?{result:'PASS',mode:'Stop',processes:[]}:(worker.exitCode!==null||worker.signalCode!==null)?{result:'GONE',pid:root.pid,processes:[]}:{result:'PASS',pid:root.pid,startTicks:root.startTicks,processes:[root]}});
  });queueMicrotask(()=>frame({kind:'ready',token,pid:helper.pid,startTicks:helperTicks,parentPid:12345,parentStartTicks:parentTicks,affinity:Math.min(2,os.availableParallelism())===1?'1':'3',priority:'BelowNormal'}));return helper;
 }};
 const fakeFS={...fs,statfsSync(){return{bavail:1024*1024*1024,bsize:1};},createWriteStream(...a){const log=fs.createWriteStream(...a);logs.push(log);return log;}},copy={exports:{}},localRequire=n=>n==='node:child_process'?fakeCP:n==='node:fs'?fakeFS:require(n),schedule=(fn,ms,interval)=>{const id=++nextTimer;timers.set(id,{fn,ms,interval});return id;};
 vm.runInNewContext(fs.readFileSync(ownerFile,'utf8'),{require:localRequire,module:copy,__filename:ownerFile,__dirname:path.dirname(ownerFile),process:{platform:'win32',pid:12345},Buffer,URL,setTimeout:(f,m)=>schedule(f,m,false),clearTimeout:id=>timers.delete(id),setInterval:(f,m)=>schedule(f,m,true),clearInterval:id=>timers.delete(id)},{filename:ownerFile});
 const running=copy.exports.run({out,leaseRoot:dir,site:dir,cases:['UNIT-no-Game'],viewports:[['portrait',390,844]]}),drain=async()=>{for(let i=0;i<80;i++)await Promise.resolve();};running.catch(()=>{});
 t.after(async()=>{if(releaseMonitor){releaseMonitor();releaseMonitor=null;}exitWorker(1,'SIGTERM');await running;await Promise.all(logs.map(log=>log.closed?Promise.resolve():once(log,'close')));fs.rmSync(dir,{recursive:true,force:true});});
 return{running,drain,root,worker,calls,sent,out,dir,get workerKills(){return workerKills;},async monitor(){const timer=[...timers.values()].find(r=>r.interval&&r.ms===2500);assert(timer);timer.fn();await drain();},async reply(result='GONE'){assert(releaseMonitor,'actual monitor request must be pending');const reply=releaseMonitor;releaseMonitor=null;reply(result);await drain();},done(result='PASS'){worker.emit('message',{type:'done',result,originalResult:result});},exit:exitWorker,async deadline(){const timer=[...timers.values()].find(r=>!r.interval&&r.ms>200000);assert(timer,'original outer deadline remains active');timer.fn();await drain();}};
}

test('GONE during the awaited monitor joins the original worker exit without presuming IPC completion order',async t=>{
 for(const order of ['gone-done-exit','done-gone-exit','done-exit-gone']){
  const unit=terminalRaceOwnerUnit(t);await unit.drain();assert.equal(unit.calls.filter(r=>r.mode==='Limit').length,1);await unit.monitor();assert.equal(unit.calls.filter(r=>r.mode==='Limit').length,2);
  if(order.startsWith('done'))unit.done();
  if(order==='done-exit-gone')unit.exit(0);
  await unit.reply();assert.equal(unit.sent.filter(m=>m.type==='abort').length,0,'GONE alone must not abort a normally terminating original child');
  if(order==='gone-done-exit')unit.done();
  if(order!=='done-exit-gone'){await unit.monitor();assert.equal(unit.calls.filter(r=>r.mode==='Limit').length,2,'no more Limits while the GONE terminal join is pending');unit.exit(0);}
  const report=await unit.running;assert.equal(report.result,'PASS');assert.equal(report.workerResult,'PASS');assert.deepEqual(JSON.parse(JSON.stringify(report.exit)),{code:0,signal:null});assert.equal(report.failure,undefined);assert.equal(unit.workerKills,0);
  assert.equal(report.cleanup[0].result,'PASS');assert.equal(report.helperShutdown.result,'CLOSED');assert.equal(report.cleanupErrors,undefined);assert.equal(report.leaseRetained,undefined);assert.equal(fs.existsSync(path.join(unit.dir,'.bounded-qa-lease.json')),false);
  assert.deepEqual(JSON.parse(JSON.stringify(report.ownedProcessLedger)),[unit.root]);const stop=unit.calls.find(r=>r.mode==='Stop');assert.equal(stop.startTicks,unit.root.startTicks);assert.deepEqual(JSON.parse(JSON.stringify(stop.receipts)),[unit.root]);
 }
});

test('GONE never grants success without original done and clean exit, and retains the original deadline and helper failure',async t=>{
 for(const kind of ['missing-done','failed-done','nonzero','signal','no-exit','helper-failure']){
  const unit=terminalRaceOwnerUnit(t);await unit.drain();await unit.monitor();
  if(kind!=='missing-done')unit.done(kind==='failed-done'?'FAIL':'PASS');await unit.reply(kind==='helper-failure'?'FAIL':'GONE');
  if(kind==='no-exit'){assert.equal(unit.sent.filter(m=>m.type==='abort').length,0);await unit.deadline();}
  else unit.exit(kind==='nonzero'?7:kind==='signal'?null:0,kind==='signal'?'SIGTERM':null);
  const report=await unit.running;assert.equal(report.result,'FAIL',kind);assert.equal(unit.calls.filter(r=>r.mode==='Limit').length,2);assert.equal(fs.existsSync(path.join(unit.dir,'.bounded-qa-lease.json')),kind==='helper-failure');
  if(kind==='no-exit'){assert.equal(report.failure,'Outer240s deadline exceeded');assert.equal(unit.sent.filter(m=>m.type==='abort').length,1);}
  if(kind==='helper-failure'){assert.match(report.failure,/Exact helper sentinel/);assert.match(report.helperFailure,/Exact helper sentinel/);assert.equal(report.result,'FAIL');}
  else{assert.equal(report.cleanup[0].result,'PASS');assert.equal(report.helperShutdown.result,'CLOSED');assert.equal(report.cleanupErrors,undefined);}
 }
});
