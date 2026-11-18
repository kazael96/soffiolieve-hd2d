/* Actual production boot and localStorage, isolated invisible Chrome only. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {startServer}=require('./test-introduction-headless.cjs'),{launchOptions}=require('./test-browser-headless.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
async function run(site,out,{playwright='playwright',browser:executable,renderer='software',viewports='desktop,portrait,landscape'}={}){
 site=path.resolve(site);out=path.resolve(out);assert.ok(!fs.existsSync(out),'Preserve old evidence');fs.mkdirSync(out,{recursive:true});
 const manifest=JSON.parse(fs.readFileSync(path.join(site,'build.json'))),key='soffiolieve-black-opening-v2',S=require('../src/story-state.js');
 const formats=[['desktop',1280,720],['portrait',390,844],['landscape',844,390]].filter(v=>viewports.split(',').includes(v[0]));assert.ok(formats.length);
 const report={result:'RUNNING',build:manifest.revision,version:manifest.version,runnerSHA256:sha(fs.readFileSync(__filename)),created:new Date().toISOString(),environment:{headless:true,isolatedBrowser:true,personalBrowserAttached:false,rendererRequested:renderer},cases:[],screenshots:[],limits:['Explicit isolated prepared saves exercise boot selection and failure boundaries; normal introduction has its separate production runner.','No physical Android certification or audible comparison. Every exported PNG requires manual review.']};
 let service,browser;const persist=()=>fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');persist();
 try{
  service=await startServer(site);browser=await require(playwright).chromium.launch(launchOptions(executable,renderer));report.environment.browser=browser.version();
  for(const [viewport,width,height]of formats)for(const kind of ['fresh','legacy-restart','corrupt-changed','unavailable','asset-recovery']){
   const row={id:viewport+'-'+kind,viewport,kind,result:'RUNNING',errors:[],httpErrors:[],failedRequests:[],screenshots:[],audits:[]};report.cases.push(row);persist();
   const legacy={...S.fresh(),playerName:'ABCDEFGHIJ',playerGender:'F',introductionComplete:true,trainer:{id:12345,nature:0,startedAt:'2026-10-23T12:00:00.000Z',playSeconds:3671}};
   if(kind==='legacy-restart'){delete legacy.playerGender;delete legacy.introductionComplete;}
   const savedRaw=kind==='legacy-restart'?JSON.stringify(legacy):kind==='corrupt-changed'?'{broken':kind==='unavailable'?JSON.stringify(legacy):null;
   const storageState=savedRaw===null?undefined:{cookies:[],origins:[{origin:new URL(service.url).origin,localStorage:[{name:key,value:savedRaw},{name:'soffiolieve-game-speed',value:'4'}]}]};
   const context=await browser.newContext({viewport:{width,height},isMobile:viewport!=='desktop',hasTouch:viewport!=='desktop',deviceScaleFactor:1,...(storageState?{storageState}:{})});let page,faults=0;
   try{
    if(kind==='unavailable')await context.addInitScript(key=>{const original=Storage.prototype.getItem;Storage.prototype.getItem=function(name){if(this===localStorage&&name===key)throw Error('Injected read denial');return original.call(this,name);};},key);
    if(kind==='asset-recovery')await context.route('**/*',async route=>{if(new URL(route.request().url()).pathname.endsWith('/assets/finale/credits/title.png')&&faults++===0)return route.abort('failed');return route.continue();});
    page=await context.newPage();page.setDefaultTimeout(20000);
    page.on('pageerror',e=>row.errors.push(String(e.stack||e)));page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/favicon.ico'))row.httpErrors.push({url:r.url(),status:r.status()});});
    page.on('requestfailed',r=>row.failedRequests.push({url:r.url(),error:r.failure()?.errorText}));
    const start=Date.now();await page.goto(service.url,{waitUntil:'domcontentloaded',timeout:60000});
    const panel=page.locator('#gameStart');await page.locator('#gameStart[data-step=title]').waitFor();
    const current=()=>page.evaluate(key=>localStorage.getItem(key),key);
    async function shot(label){
     const audit=await page.evaluate(()=>{
      const d=document.getElementById('gameStart'),screen=d?.querySelector('.start-screen'),rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
      const nodes=[d,screen,...(d?.querySelectorAll('.start-choices button')||[]),...document.querySelectorAll('#touch button')].filter(e=>e&&e.getClientRects().length&&getComputedStyle(e).display!=='none');
      const missing=value=>[...new Set([...value].filter(ch=>!/[\n\r]/.test(ch)&&!NAMING_ASSETS.font.glyphs[ch]))];
      const artwork=[...(d?.querySelectorAll('.start-art img')||[])].map(e=>{const c=document.createElement('canvas');c.width=e.naturalWidth;c.height=e.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(e,0,0);const pixels=ctx.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=0,y1=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(pixels[(y*c.width+x)*4+3]>0){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+1);y1=Math.max(y1,y+1);}const r=e.getBoundingClientRect(),a=e.parentElement.getBoundingClientRect(),scale=Math.min(r.width/c.width,r.height/c.height),left=r.x+(r.width-c.width*scale)/2,top=r.y+(r.height-c.height*scale)/2;return {alt:e.alt,visiblePixels:[left+x0*scale,top+y0*scale,left+x1*scale,top+y1*scale],art:[a.left,a.top,a.right,a.bottom],clipped:left+x0*scale<a.left-1||top+y0*scale<a.top-1||left+x1*scale>a.right+1||top+y1*scale>a.bottom+1};});
      return {step:d?.dataset.step||null,viewport:[innerWidth,innerHeight],bootLocked:GameStart.pending,savingBlocked:GameStart.savingBlocked,
       controls:nodes.map(e=>({label:e.getAttribute('aria-label')||e.textContent,rect:rect(e),hit:e.matches('button')?e.contains(document.elementFromPoint(rect(e).x+rect(e).width/2,rect(e).y+rect(e).height/2)):true})),
       captions:[...(d?.querySelectorAll('.start-choices button')||[])].map(e=>({text:e.getAttribute('aria-label'),bitmap:!!e.querySelector('canvas'),widths:e.getAttribute('aria-label').split('\n').map(line=>NativeTextLayout.width(line,NAMING_ASSETS.font))})),
       missingGlyphs:missing([...(d?.querySelectorAll('.start-choices button')||[])].map(e=>e.getAttribute('aria-label')).join('\n')+'\n'+(d?.querySelector('.start-message')?.dataset.text||'')),artwork,
       images:[...(d?.querySelectorAll('.start-art img')||[])].map(e=>({alt:e.alt,width:e.naturalWidth,height:e.naturalHeight,complete:e.complete})),
       runtimeError:document.getElementById('world')?.dataset.runtimeError||'',eventError:document.getElementById('world')?.dataset.eventError||''};
     });
     row.audits.push({label,...audit});
     if(audit.step){assert.equal(audit.bootLocked,true);assert.deepEqual(audit.missingGlyphs,[]);assert.ok(audit.artwork.every(image=>!image.clipped),'Native title artwork is cropped');assert.ok(audit.images.length===2&&audit.images.every(i=>i.complete&&i.width>0&&i.height>0));for(const control of audit.controls){assert.ok(control.rect.x>=-2&&control.rect.y>=-2&&control.rect.right<=width+2&&control.rect.bottom<=height+2,'Clipped boot control '+control.label);assert.equal(control.hit,true,'Obscured boot control '+control.label);}assert.ok(audit.captions.every(c=>c.bitmap&&c.widths.every(w=>w<=232)),'Missing/clipped native title caption');}
     assert.equal(audit.runtimeError,'');assert.equal(audit.eventError,'');
     const file=row.id+'-'+label+'.png';await page.screenshot({path:path.join(out,file)});const record={file,sha256:sha(fs.readFileSync(path.join(out,file))),case:row.id};row.screenshots.push(record);report.screenshots.push(record);
    }
    async function menu(){await panel.getByRole('button',{name:'PREMI START',exact:true}).click();await page.locator('#gameStart[data-step=menu]').waitFor();}
    async function welcome(){await page.locator('#gameIntroduction[data-step=welcome]').waitFor();assert.equal(await page.locator('#gameStart[open]').count(),0);}
    if(kind==='fresh'){
     await shot('title');assert.equal(await current(),null);assert.equal(await page.evaluate(()=>Journey.save(true)),false);await menu();assert.equal(await panel.getByRole('button',{name:/^CONTINUA/}).count(),0);await shot('new-only');
     await page.keyboard.press('b');await page.locator('#gameStart[data-step=title]').waitFor();await page.keyboard.press('Enter');await page.locator('#gameStart[data-step=menu]').waitFor();
     await panel.getByRole('button',{name:'NUOVO GIOCO',exact:true}).click();await welcome();assert.equal(await current(),null);
    }else if(kind==='legacy-restart'){
     assert.equal(await current(),savedRaw);await page.waitForTimeout(350);assert.equal(await current(),savedRaw);assert.equal(await page.evaluate(()=>Journey.save(true)),false);
     await menu();assert.match(await panel.getByRole('button',{name:/^CONTINUA/}).getAttribute('aria-label'),/ABCDEFGHIJ.*\n.*1:01|ABCDEFGHIJ[\s\S]*1:01/);await shot('continue');
     await panel.getByRole('button',{name:/^CONTINUA/}).click();await panel.waitFor({state:'hidden'});assert.equal(await page.locator('#gameIntroduction[open]').count(),0);assert.equal(await page.evaluate(()=>Journey.state.playerName),'ABCDEFGHIJ');assert.equal(await page.evaluate(()=>Journey.state.playerGender),'M');
     await page.reload({waitUntil:'domcontentloaded'});await page.locator('#gameStart[data-step=title]').waitFor();await menu();const before=await current();
     await panel.getByRole('button',{name:'NUOVO GIOCO',exact:true}).click();await shot('confirm-new');await page.keyboard.press('b');await page.locator('#gameStart[data-step=menu]').waitFor();assert.equal(await current(),before);
     await panel.getByRole('button',{name:'NUOVO GIOCO',exact:true}).click();
     await page.evaluate(key=>{const original=Storage.prototype.removeItem;window.restoreBootStorage=()=>Storage.prototype.removeItem=original;Storage.prototype.removeItem=function(name){if(this===localStorage&&name===key)throw Error('Injected delete denial');return original.call(this,name);};},key);
     await panel.getByRole('button',{name:'SÌ, NUOVO GIOCO',exact:true}).click();await page.locator('#gameStart[data-step=error]').waitFor();assert.equal(await current(),before);assert.equal(await page.evaluate(()=>GameStart.consumeRestart()),false);await shot('delete-denied');
     await page.evaluate(()=>window.restoreBootStorage());await panel.getByRole('button',{name:'INDIETRO',exact:true}).click();await panel.getByRole('button',{name:'NUOVO GIOCO',exact:true}).click();
     await Promise.all([page.waitForEvent('domcontentloaded'),panel.getByRole('button',{name:'SÌ, NUOVO GIOCO',exact:true}).click()]);await welcome();assert.equal(await current(),null);assert.equal(await page.evaluate(()=>GameStart.consumeRestart()),false);assert.equal(await page.evaluate(()=>Journey.state.playerName),'Alcide');
    }else if(kind==='corrupt-changed'){
     await menu();assert.equal(await panel.getByRole('button',{name:/^CONTINUA/}).count(),0);assert.equal(await current(),savedRaw);await shot('damaged-save');await panel.getByRole('button',{name:'NUOVO GIOCO',exact:true}).click();
     const newer=JSON.stringify({...legacy,playerName:'Nuovo'});await page.evaluate(({key,newer})=>localStorage.setItem(key,newer),{key,newer});await panel.getByRole('button',{name:'SÌ, NUOVO GIOCO',exact:true}).click();await page.locator('#gameStart[data-step=error]').waitFor();assert.equal(await current(),newer);await shot('changed-save');
    }else if(kind==='unavailable'){
     await menu();assert.equal(await page.evaluate(()=>GameStart.savingBlocked),true);await shot('unavailable');await panel.getByRole('button',{name:'NUOVO GIOCO',exact:true}).click();await welcome();assert.equal(await page.evaluate(()=>Journey.save(true)),false);
     const storage=(await context.storageState()).origins.find(o=>o.origin===new URL(service.url).origin)?.localStorage;assert.equal(storage?.find(r=>r.name===key)?.value,savedRaw);
    }else{
     assert.ok(faults>=2,'Required native title request/retry was not actually observed');assert.equal(row.failedRequests.length,1);assert.equal(await panel.getByRole('button',{name:'RIPROVA',exact:true}).count(),0);await shot('auto-recovered');row.fault={injectedFailures:1,requests:faults,manualRetryRequired:false};
    }
    assert.deepEqual(row.errors,[]);assert.deepEqual(row.httpErrors,[]);if(kind!=='asset-recovery')assert.deepEqual(row.failedRequests,[]);row.result='PASS';row.durationMs=Date.now()-start;
   }catch(error){row.result='FAIL';row.error=String(error.stack||error);if(page){const file=row.id+'-failure.png';await page.screenshot({path:path.join(out,file)}).then(()=>{const r={file,sha256:sha(fs.readFileSync(path.join(out,file))),case:row.id};row.screenshots.push(r);report.screenshots.push(r);}).catch(()=>{});}}
   finally{await context.close();persist();console.log(row.result+' '+row.id);}
   if(row.result==='FAIL')throw Error(row.error);
  }
  report.result='FUNCTIONAL_PASS';
 }catch(error){report.result='FAIL';report.error=String(error.stack||error);process.exitCode=1;}
 finally{await browser?.close();await service?.close();report.browserClosed=true;report.finished=new Date().toISOString();persist();}
 return report;
}
module.exports={run};
if(require.main===module){const [site,out,...args]=process.argv.slice(2),options=Object.fromEntries(args.map(arg=>{assert.match(arg,/^--(?:playwright|browser|renderer|viewports)=/);const at=arg.indexOf('=');return [arg.slice(2,at),arg.slice(at+1)];}));run(site,out,options).then(r=>console.log(r.result+' production start menu')).catch(e=>{console.error(e);process.exitCode=1;});}
