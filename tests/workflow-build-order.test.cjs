const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
for(const name of ['pages.yml','qa.yml'])test(name+' builds the site before invoking the shared regression runner',()=>{
 const text=fs.readFileSync(path.join(__dirname,'../.github/workflows',name),'utf8'),build=text.indexOf('python3 scripts/build-site.py site.zip _site'),deep=text.indexOf('node scripts/test-deep.cjs _site test-results/deep --python=python3');
 assert.ok(build>=0,'The checked site must be built explicitly');assert.ok(deep>build,'Asset-dependent tests must run on the built site via the same runner as pull requests');assert.equal(/node --test tests\/\*\.test\.cjs/.test(text),false,'A separate pre-build unit command loses the actual site path and drifts from the shared stage inventory');
});
