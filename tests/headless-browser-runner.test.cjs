const {test}=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),runner=require('../scripts/test-browser-headless.cjs');
test('graphical QA always launches an isolated invisible browser and cannot accept a headed override',()=>{
 const o=runner.launchOptions('test-browser');assert.equal(o.headless,true);assert.equal(o.chromiumSandbox,true);assert.equal(o.executablePath,'test-browser');assert.equal(o.userDataDir,undefined);assert.equal(o.channel,undefined);assert.throws(()=>runner.options(['site','reports','--headed=true']),/Unsupported/);
});
test('the background runner preserves explicit case inventory and rejects duplicate, invalid and publication output paths',()=>{
 const o=runner.options(['site','reports','--cases=qaSubmerged051,qaQuicksand051','--timeout=240000']);assert.deepEqual(o.cases,['qaSubmerged051','qaQuicksand051']);assert.equal(o.timeout,240000);
 for(const args of [['site','site'],['site',path.join('site','qa')],['site','reports','--cases='],['site','reports','--cases=qaRun,qaRun'],['site','reports','--cases=qaRun;alert(1)'],['site','reports','--timeout=0']])assert.throws(()=>runner.options(args));
});
test('a cached passing case, wrong candidate, wrong viewport or unfinished replay cannot certify a new case',()=>{
 const r={build:'current',fixture:'fixture',viewport:[390,844],running:false,cases:[{result:'PASS'}],errors:[]};assert.equal(runner.validate(r,'current',{width:390,height:844},1),true);
 for(const [copy,build,vp,count]of [[r,'old',{width:390,height:844},1],[r,'current',{width:844,height:390},1],[r,'current',{width:390,height:844},2],[{...r,running:true},'current',{width:390,height:844},1]])assert.throws(()=>runner.validate(copy,build,vp,count));
 assert.equal(runner.validate({...r,cases:[{result:'FAIL'}]},'current',{width:390,height:844},1),false);assert.equal(runner.validate({...r,errors:['uncaught']},'current',{width:390,height:844},1),false);
});
