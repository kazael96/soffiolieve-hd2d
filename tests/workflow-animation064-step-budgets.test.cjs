'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const formats=['portrait','landscape','desktop'];
const cases=['qaBattleActions064','qaEmboarActions064','qaGustActions064','qaTailActions064','qaTailMixedActions064','qaTynamoActions064'];
const workflows=['pages.yml','qa.yml'];
const readWorkflow=file=>fs.readFileSync(path.join(__dirname,'../.github/workflows',file),'utf8').replace(/\r\n/g,'\n');
function steps(source){
 const lines=source.split(/\r?\n/),out=[];let current=null;
 for(const line of lines){if(/^      - /.test(line)){current={line:out.length,text:line+'\n'};out.push(current);}else if(current)current.text+=line+'\n';}
 return out;
}
function verify(source){
 source=source.replace(/\r\n/g,'\n');
 const all=steps(source),animation=all.filter(s=>/node scripts\/test-browser-headless\.cjs.*--cases=qaBattleActions064/.test(s.text));
 assert.equal(animation.length,3,'Each viewport needs its own step deadline, not a shared three-viewport shell loop');
 const inventory=[];
 for(const[index,step]of animation.entries()){
  const command=step.text.split('\n').find(l=>l.includes('node scripts/test-browser-headless.cjs'));
  assert.match(command,/^        run: node scripts\/test-browser-headless\.cjs _site /,'One bounded command per step');
  assert.equal((step.text.match(/node scripts\/test-browser-headless\.cjs/g)||[]).length,1);
  const args=command.trim().slice(5).split(/\s+/),options=Object.fromEntries(args.filter(a=>a.startsWith('--')).map(a=>{const p=a.indexOf('=');return[a.slice(2,p),a.slice(p+1)];}));
  assert.equal(options.viewports,formats[index],'Keep the original serial viewport order');
  assert.deepEqual(options.cases.split(','),cases,'Preserve all six cases, once, in each viewport');
  assert.equal(options.timeout,'180000','Do not raise the per-case budget');
  assert.equal(options['fail-fast'],'true');assert.equal(options.renderer,'software');assert.equal(options.browser,'/opt/google/chrome/chrome');
  assert.ok(args.includes('test-results/animation064-'+formats[index]),'Keep independent report output');
  assert.match(step.text,/^        timeout-minutes: 30$/m,'Retain the approved deadline for each viewport step');
  assert.doesNotMatch(step.text,/continue-on-error:|^        if:|for viewport|\|\|\s*true|\&\s*$/m,'Runtime steps must retain default success/fail-fast, not run after or swallow failure');
  for(const id of options.cases.split(','))inventory.push(formats[index]+':'+id);
 }
 assert.equal(new Set(inventory).size,18,'Keep the complete3×6 viewport/case inventory');
 const upload=all.find(s=>/uses: actions\/upload-artifact@/.test(s.text)&&/path: test-results\/animation064-\*/.test(s.text));
 assert.ok(upload&&upload.line>animation.at(-1).line,'Upload partial/all reports after runtime steps');
 assert.match(upload.text,/^        if: always\(\)$/m,'Preserve failure and timeout evidence');
 assert.equal((source.match(/python3 scripts\/build-site\.py site\.zip _site/g)||[]).length,1,'Do not triple the build');
 assert.equal((source.match(/releases\/download\/v0\.8\/soffiolieve-demo-v08\.zip/g)||[]).length,1,'Do not triple the base download');
 if(source.includes('actions/upload-pages-artifact@')){
  assert.ok(source.indexOf('uses: actions/upload-pages-artifact@')>source.indexOf(animation.at(-1).text.trimEnd()),'Publication follows the final successful viewport');
 }
 return inventory;
}
for(const file of workflows)test(file+' retains18 animation cases with independent sequential viewport deadlines',()=>{
 assert.equal(verify(readWorkflow(file)).length,18);
});
const source=readWorkflow('qa.yml');
test('workflow inventory checks accept both Git LF and Windows CRLF checkouts',()=>{
 assert.deepEqual(verify(source.replace(/\n/g,'\r\n')),verify(source));
});
test('inventory guard rejects a missing viewport or native animation case',()=>{
 const block=steps(source).find(s=>s.text.includes('--viewports=landscape')).text;
 assert.throws(()=>verify(source.replace(block,'')),/own step deadline/);
 assert.throws(()=>verify(source.replace(',qaTynamoActions064\n','\n')),/six cases/);
});
test('budget guard rejects relaxed case limits and swallowed viewport failures',()=>{
 const command='--timeout=180000 --viewports=portrait';
 assert.throws(()=>verify(source.replace(command,'--timeout=180001 --viewports=portrait')),/per-case budget/);
 assert.throws(()=>verify(source.replace('timeout-minutes: 30','timeout-minutes: 30\n        continue-on-error: true')),/default success/);
 assert.throws(()=>verify(source.replace('timeout-minutes: 30','timeout-minutes: 30\n        if: always()')),/default success/);
});
test('artifact guard rejects losing failure evidence',()=>{
 const block=steps(source).find(s=>s.text.includes('path: test-results/animation064-*')).text.trimEnd();
 assert.ok(source.includes(block),'The negative control must alter the actual final artifact step');
 const modified=source.replace(block,block.replace('        if: always()\n',''));
 assert.notEqual(modified,source,'Removing artifact always() must be a real mutation');
 assert.throws(()=>verify(modified),/failure and timeout evidence/);
});
