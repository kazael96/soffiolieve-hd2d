/* Isolated graphical QA. Never attaches to a personal browser or opens a window. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const viewports=[['desktop',1280,720],['portrait',390,844],['landscape',844,390]];
function options(argv){
 const positional=argv.filter(a=>!a.startsWith('--')),flags=new Map();
 for(const arg of argv.filter(a=>a.startsWith('--'))){const at=arg.indexOf('=');if(at<3)throw Error('Use --name=value');const name=arg.slice(2,at);if(!['python','playwright','browser','cases','timeout','renderer','preview','fail-fast'].includes(name)||flags.has(name))throw Error('Unsupported or repeated option: '+name);flags.set(name,arg.slice(at+1));}
 if(positional.length!==2)throw Error('Pass built site and external report directory');
 const site=path.resolve(positional[0]),out=path.resolve(positional[1]);if(out===site||out.startsWith(site+path.sep))throw Error('Reports must remain outside the published site');
 const cases=(flags.has('cases')?flags.get('cases'):'qaSubmerged051,qaNpcFalls051,qaQuicksand051').split(',');if(cases.some(id=>!/^qa[A-Za-z0-9]+$/.test(id))||new Set(cases).size!==cases.length)throw Error('Invalid or repeated case ID');
 const timeout=Number(flags.get('timeout')||300000);if(!Number.isInteger(timeout)||timeout<1000||timeout>900000)throw Error('Invalid case budget');
 const renderer=flags.get('renderer')||'auto';if(!['auto','software'].includes(renderer))throw Error('Invalid renderer');
 const preview=flags.get('preview');if(preview!==undefined&&preview!=='leagueGym')throw Error('Invalid isolated preview');
 if(flags.has('fail-fast')&&!['true','false'].includes(flags.get('fail-fast')))throw Error('Invalid fail-fast option');
 return {site,out,cases,timeout,renderer,preview,failFast:flags.get('fail-fast')==='true',python:flags.get('python')||'python',playwright:flags.get('playwright')||'playwright',browser:flags.get('browser')};
}
function launchOptions(browser,renderer='auto'){return {headless:true,chromiumSandbox:true,...(browser?{executablePath:browser}:{}),args:renderer==='software'?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:[]};}
function validate(report,build,viewport,count){
 if(report.build!==build||!report.fixture||report.viewport?.[0]!==viewport.width||report.viewport?.[1]!==viewport.height)throw Error('Wrong build, fixture or viewport');
 if(report.running||report.cases?.length!==count)throw Error('Stale or incomplete browser result');
 return report.cases.at(-1).result==='PASS'&&report.errors?.length===0;
}
async function startServer(o,fixture){
 const root=path.resolve(__dirname,'..'),server=cp.spawn(o.python,[path.join(__dirname,'serve-browser-qa.py'),o.site,fixture,'--port','0'],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
 const log=fs.createWriteStream(path.join(o.out,'server.log'));server.stderr.pipe(log);let buffer='';
 try{const url=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('QA server did not start')),15000);server.on('error',e=>{clearTimeout(timer);reject(e);});server.on('exit',code=>{clearTimeout(timer);reject(Error('QA server exited: '+code));});server.stdout.on('data',chunk=>{buffer+=chunk;const match=buffer.match(/QA (http:\/\/127\.0\.0\.1:\d+\/qa-browser\.html)/);if(match){clearTimeout(timer);resolve(match[1]);}});});return {server,log,url};}catch(e){server.kill();log.end();throw e;}
}
async function run(o){
 fs.mkdirSync(o.out,{recursive:true});const manifest=JSON.parse(fs.readFileSync(path.join(o.site,'build.json'),'utf8')),fixture=path.join(o.out,'fixture');require('./build-browser-qa.cjs')(o.site,fixture,{preview:o.preview});
 const {chromium}=require(o.playwright);let service,browser;const report={schema:1,build:manifest.revision,version:manifest.version,created:new Date().toISOString(),result:'RUNNING',environment:{headless:true,isolatedProfile:true,rendererRequested:o.renderer,audioOutputMuted:true,personalBrowserAttached:false},requestedCases:o.cases,preview:o.preview||null,viewports:[],limits:['Desktop WebGL backend recorded per viewport, not physical Android GPU certification','Audio engine active when fieldAudio=1; speaker output muted by the test browser','No audible cartridge comparison','Fixture prerequisites remain explicit in individual case details']};
 const save=()=>fs.writeFileSync(path.join(o.out,'report.json'),JSON.stringify(report,null,2)+'\n');save();
 try{
  service=await startServer(o,fixture);browser=await chromium.launch(launchOptions(o.browser,o.renderer));report.environment.browser=browser.version();
  for(const [name,width,height]of viewports){const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage(),errors=[],consoleErrors=[],failedRequests=[];page.on('pageerror',e=>errors.push(String(e.stack||e)));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());});page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));const row={name,viewport:[width,height],result:'RUNNING',cases:[],errors};report.viewports.push(row);save();
   try{
    await page.goto(service.url+'?fieldAudio=1&headless=1',{waitUntil:'load',timeout:90000});
    row.webgl=await page.evaluate(()=>{const g=renderer.gl,e=g.getExtension('WEBGL_debug_renderer_info');return {vendor:g.getParameter(e?e.UNMASKED_VENDOR_WEBGL:g.VENDOR),renderer:g.getParameter(e?e.UNMASKED_RENDERER_WEBGL:g.RENDERER),version:g.getParameter(g.VERSION)};});
    for(const id of o.cases){await page.locator('#'+id).click({timeout:45000});await page.waitForFunction(count=>{const p=document.querySelector('#qaReport');if(!p)return false;const r=JSON.parse(p.textContent);return !r.running&&r.cases.length===count;},row.cases.length+1,{timeout:o.timeout});const result=JSON.parse(await page.locator('#qaReport').textContent());validate(result,manifest.revision,{width,height},row.cases.length+1);row.cases=result.cases;row.fixture=result.fixture;row.report=result;fs.writeFileSync(path.join(o.out,name+'.json'),JSON.stringify(result,null,2)+'\n');console.log(result.cases.at(-1).result+' '+name+' '+id+' '+result.cases.at(-1).durationMs+'ms');save();}
    await page.waitForLoadState('networkidle',{timeout:20000});
    if(await page.locator('#deepQA').getAttribute('data-report-sink')==='unavailable')throw Error('The QA artifact sink failed; exported evidence is incomplete');
    const saved=JSON.parse(fs.readFileSync(path.join(fixture,`report-${width}x${height}.json`),'utf8'));if(!validate(saved,manifest.revision,{width,height},o.cases.length))throw Error('The exported report does not certify passing cases');row.artifacts={reportSink:true,snapshots:fs.readdirSync(fixture).filter(f=>f.startsWith(width+'x'+height+'-')&&f.endsWith('.png')).length};
    await page.screenshot({path:path.join(o.out,name+'-screen.png')});row.result=row.cases.length===o.cases.length&&row.cases.every(c=>c.result==='PASS')&&!errors.length&&row.report.errors.length===0?'PASS':'FAIL';
   }catch(e){row.result='FAIL';row.error=String(e.stack||e);await page.screenshot({path:path.join(o.out,name+'-failure.png'),timeout:10000}).catch(()=>{});row.dom=await page.content().catch(()=>'');console.error('FAIL '+name+' '+e.message);}finally{row.consoleErrors=consoleErrors;row.failedRequests=failedRequests;await context.close();save();}
   if(o.failFast&&row.result==='FAIL'){report.stoppedAfterFailure=name;break;}
  }
  report.result=report.viewports.length===viewports.length&&report.viewports.every(r=>r.result==='PASS')?'PASS':'FAIL';
 }catch(e){report.result='FAIL';report.error=String(e.stack||e);throw e;}finally{await browser?.close();service?.server.kill();service?.log.end();save();}
 return report;
}
if(require.main===module)run(options(process.argv.slice(2))).then(r=>{console.log(r.result+' background browser QA');process.exitCode=r.result==='PASS'?0:1;}).catch(e=>{console.error(e);process.exitCode=1;});
module.exports={options,launchOptions,validate,run};
