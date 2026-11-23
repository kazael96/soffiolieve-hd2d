'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const formats=['portrait','landscape','desktop'],rates=[1,2,4];
const core=['qaBattleActions064','qaEmboarActions064','qaGustActions064','qaTailActions064','qaTailMixedActions064'];
const workflows=['pages.yml','qa.yml'];
const readWorkflow=file=>fs.readFileSync(path.join(__dirname,'../.github/workflows',file),'utf8').replace(/\r\n/g,'\n');
function steps(source){const out=[];let current;for(const line of source.split(/\r?\n/)){if(/^      - /.test(line)){current={index:out.length,text:line+'\n'};out.push(current);}else if(current)current.text+=line+'\n';}return out;}
function verify(source){
 source=source.replace(/\r\n/g,'\n');const all=steps(source),animation=all.filter(s=>/node scripts\/test-browser-headless\.cjs.*test-results\/animation064-/.test(s.text));
 assert.equal(animation.length,12,'Keep one core batch and three sequential Tynamo rate batches per viewport');
 const inventory=[],outputs=new Set();
 for(const [index,step]of animation.entries()){
  const command=step.text.split('\n').find(l=>l.includes('node scripts/test-browser-headless.cjs'));
  assert.match(command,/^        run: node scripts\/test-browser-headless\.cjs _site /,'One bounded command per step');
  assert.equal((step.text.match(/node scripts\/test-browser-headless\.cjs/g)||[]).length,1);
  const args=command.trim().slice(5).split(/\s+/),options=Object.fromEntries(args.filter(a=>a.startsWith('--')).map(a=>{const p=a.indexOf('=');return[a.slice(2,p),a.slice(p+1)];}));
  const format=formats[Math.floor(index/4)],part=index%4;
  assert.equal(options.viewports,format,'Keep the original serial viewport order');
  const expectedCases=part===0?core:['qaTynamoActions064'],expectedRates=part===0?undefined:String(rates[part-1]);
  assert.deepEqual(options.cases.split(','),expectedCases,'Preserve the exact native case batch');
  assert.equal(options.rates,expectedRates,'Tynamo must run each original rate exactly once');
  assert.equal(options.timeout,'180000','Do not raise the per-case budget');
  assert.equal(options['fail-fast'],'true');assert.equal(options.renderer,'software');assert.equal(options.browser,'/opt/google/chrome/chrome');
  const output='test-results/animation064-'+format+(part===0?'':'-tynamo-x'+rates[part-1]);
  assert.ok(args.includes(output),'Keep independent report output');assert.ok(!outputs.has(output),'Do not overwrite a previous batch');outputs.add(output);
  assert.match(step.text,/^        timeout-minutes: 30$/m,'Retain the existing step deadline');
  assert.doesNotMatch(step.text,/continue-on-error:|^        if:|for viewport|\|\|\s*true|\&\s*$/m,'Runtime steps must retain default success/fail-fast');
  for(const id of expectedCases)for(const rate of part===0?rates:[rates[part-1]])inventory.push(format+':'+id+':'+rate);
 }
 const expected=formats.flatMap(format=>[...core,'qaTynamoActions064'].flatMap(id=>rates.map(rate=>format+':'+id+':'+rate))).sort();
 assert.deepEqual(inventory.slice().sort(),expected,'Keep all54 logical viewport/case/rate cells without omissions or duplicates');
 assert.equal(new Set(inventory).size,54);
 const upload=all.find(s=>/uses: actions\/upload-artifact@/.test(s.text)&&/path: test-results\/animation064-\*/.test(s.text));
 assert.ok(upload&&upload.index>animation.at(-1).index,'Upload all partial reports after runtime steps');assert.match(upload.text,/^        if: always\(\)$/m,'Preserve failure evidence');
 assert.equal((source.match(/python3 scripts\/build-site\.py site\.zip _site/g)||[]).length,1,'Do not repeat the build');
 assert.equal((source.match(/releases\/download\/v0\.8\/soffiolieve-demo-v08\.zip/g)||[]).length,1,'Do not repeat the base download');
 if(source.includes('actions/upload-pages-artifact@'))assert.ok(source.indexOf('uses: actions/upload-pages-artifact@')>source.indexOf(animation.at(-1).text.trimEnd()),'Publication follows the final successful rate batch');
 return inventory;
}
for(const file of workflows)test(file+' retains54 logical animation cells and unchanged per-case budgets',()=>assert.equal(verify(readWorkflow(file)).length,54));
const source=readWorkflow('qa.yml');
test('inventory accepts Git LF and Windows CRLF',()=>assert.deepEqual(verify(source.replace(/\n/g,'\r\n')),verify(source)));
test('inventory rejects a missing viewport, case, rate or duplicate rate',()=>{
 const block=steps(source).find(s=>s.text.includes('animation064-landscape-tynamo-x2')).text;
 assert.throws(()=>verify(source.replace(block,'')),/three sequential/);
 assert.throws(()=>verify(source.replace(',qaTailMixedActions064\n','\n')),/exact native case/);
 assert.throws(()=>verify(source.replace('--rates=2','--rates=1')),/original rate exactly once/);
 assert.throws(()=>verify(source.replace('--rates=2','--rates=1,2')),/original rate exactly once/);
});
test('budget guard rejects relaxed limits and swallowed failure',()=>{
 assert.throws(()=>verify(source.replace('--timeout=180000','--timeout=180001')),/per-case budget/);
 assert.throws(()=>verify(source.replace('timeout-minutes: 30','timeout-minutes: 31')),/step deadline/);
 for(const injected of ['continue-on-error: true','if: always()'])assert.throws(()=>verify(source.replace('timeout-minutes: 30','timeout-minutes: 30\n        '+injected)),/default success/);
});
test('artifact guard rejects losing failure evidence or report output',()=>{
 const block=steps(source).find(s=>s.text.includes('path: test-results/animation064-*')).text.trimEnd();
 const modified=source.replace(block,block.replace('        if: always()\n',''));assert.notEqual(modified,source);assert.throws(()=>verify(modified),/failure evidence/);
 assert.throws(()=>verify(source.replace('test-results/animation064-portrait-tynamo-x2','test-results/animation064-portrait-tynamo-x1')),/independent report output/);
});
