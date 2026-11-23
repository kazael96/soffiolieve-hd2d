'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {options,isolatedCaseUrl,validateRateCoverage}=require('../scripts/test-browser-headless.cjs');
const base=['_site','test-results/rates','--cases=qaTynamoActions064'];
test('explicit subsets reach only the isolated native QA URL with audio and normal defaults intact',()=>{
 for(const rates of ['1','2','4','1,2,4','4,1']){const o=options([...base,'--rates='+rates]);assert.equal(o.rates,rates);const u=new URL(isolatedCaseUrl('http://127.0.0.1:4200/qa-browser.html?existing=1',o.rates));assert.equal(u.searchParams.get('battleRates064'),rates);assert.equal(u.searchParams.get('fieldAudio'),'1');assert.equal(u.searchParams.get('headless'),'1');assert.equal(u.searchParams.get('existing'),'1');}
 const o=options(base);assert.equal(o.rates,undefined);assert.equal(new URL(isolatedCaseUrl('http://localhost:42/qa-browser.html',o.rates)).searchParams.has('battleRates064'),false);
 assert.throws(()=>isolatedCaseUrl('https://kazael96.github.io/soffiolieve-hd2d/','1'),/isolated local/);
});
test('unknown, duplicate and unsupported rate options fail before browser startup',()=>{
 for(const rates of ['','0','3','1,1','1,2,','2,4,2','1 2'])assert.throws(()=>options([...base,'--rates='+rates]),/battle rates/);
 assert.throws(()=>options([...base,'--rates=1','--rates=2']),/repeated option/);
 assert.throws(()=>options(['_site','test-results/rates','--cases=qaPhoneIdentity057','--rates=1']),/supported battle case/);
});
test('a selected rate requires completed actual turn evidence rather than a URL alone',()=>{
 const result=speeds=>({details:{turns:speeds.map(speed=>({speed}))}});
 validateRateCoverage(result([2,2,2]),'2');validateRateCoverage(result([4,1,2,2]),'1,2,4');
 for(const row of [{},result([]),result([1]),result([1,2,4]),result(['2'])])assert.throws(()=>validateRateCoverage(row,'2'),/actual native turn/);
 validateRateCoverage({},undefined);
});
