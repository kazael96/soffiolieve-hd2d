const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const name of ['pages.yml','qa.yml'])test(name+' builds the site before invoking the shared regression runner',()=>{
 const text=fs.readFileSync(path.join(__dirname,'../.github/workflows',name),'utf8'),build=text.indexOf('python3 scripts/build-site.py site.zip _site'),deep=text.indexOf('node scripts/test-deep.cjs _site test-results/deep --python=python3');
 assert.ok(build>=0,'The checked site must be built explicitly');assert.ok(deep>build,'Asset-dependent tests must run on the built site via the same runner as pull requests');assert.equal(/node --test tests\/\*\.test\.cjs/.test(text),false,'A separate pre-build unit command loses the actual site path and drifts from the shared stage inventory');
});

for(const name of ['pages.yml','qa.yml'])test(name+' gates every publication on the reported phone regressions, preserving all formats and failure artifacts',()=>{
 const text=fs.readFileSync(path.join(__dirname,'../.github/workflows',name),'utf8'),line=text.split(/\r?\n/).find(row=>row.includes('node scripts/test-browser-headless.cjs _site test-results/phone057'));
 assert.ok(line,'Reported phone defects need a persistent browser gate');
 for(const id of ['qaFieldCamera057','qaFieldGate057','qaPhoneIdentity057','qaBattleClearings057','qaBattleDoubles057'])assert.ok(line.includes(id));
 assert.ok(line.includes('--renderer=software')&&line.includes('--fail-fast=true'));
 assert.doesNotMatch(line,/--viewports=|--timeout=(?:[3-9]\d{5}|\d{7,})/,'Retain all three formats and the approved case budget');
 assert.match(text,/path: test-results\/phone057/);
 const at=text.indexOf(line);assert.ok(at>text.indexOf('node scripts/test-deep.cjs'));if(name==='pages.yml')assert.ok(at<text.indexOf('uses: actions/upload-pages-artifact@'));
});

function job(text,name){
 const match=text.match(new RegExp('^  '+name+':\\r?\\n([\\s\\S]*?)(?=^  [A-Za-z][\\w-]*:\\r?$|(?![\\s\\S]))','m'));
 assert.ok(match,'Missing separate '+name+' job');return match[1];
}
test('a Pages transfer failure can retry deployment without rebuilding the verified artifact',()=>{
 const text=fs.readFileSync(path.join(__dirname,'../.github/workflows/pages.yml'),'utf8'),build=job(text,'build'),deploy=job(text,'deploy');
 assert.match(deploy,/^    needs: build\r?$/m,'Publishing must depend on the successful checked build');
 assert.match(deploy,/uses: actions\/deploy-pages@/);assert.doesNotMatch(deploy,/build-site\.py|test-deep\.cjs|actions\/checkout@|upload-pages-artifact@/,'Retrying only the failed deploy job must retain the checked artifact');
 const checked=build.indexOf('node scripts/test-deep.cjs'),upload=build.indexOf('uses: actions/upload-pages-artifact@');assert.ok(checked>=0&&upload>checked,'Only a successful complete regression can publish the artifact');
 assert.doesNotMatch(build.slice(upload),/if: always\(\)|continue-on-error:/,'A failed regression must never produce a deployable artifact');
});
test('Pages publishing credentials belong only to the deployment job',()=>{
 const text=fs.readFileSync(path.join(__dirname,'../.github/workflows/pages.yml'),'utf8'),build=job(text,'build'),deploy=job(text,'deploy');
 assert.doesNotMatch(text.split('jobs:')[0],/pages: write|id-token: write/);assert.doesNotMatch(build,/pages: write|id-token: write/);assert.match(deploy,/pages: write/);assert.match(deploy,/id-token: write/);
});
