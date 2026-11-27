/* Windows-only feedback for the real PowerShell fixtures; no shared-stage inventory change. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),runStage=require('./stage-runner.cjs'),{isolationFlag}=require('./node-test-options.cjs');
const root=path.resolve(__dirname,'..'),name='unit-owned-helper-windows';
function stageArgs(version=process.versions.node){return ['--max-old-space-size=400','--test',isolationFlag(version),'--test-concurrency=1',path.join(root,'tests/bounded-qa064.test.cjs')];}
function verifyResult(stage,log){
 assert.equal(stage.result,'PASS','Original owned-helper stage failed');assert.equal(stage.exitCode,0,'Original owned-helper child exit must be zero');
 const expected={tests:27,pass:27,fail:0,cancelled:0,skipped:0,todo:0};
 for(const [key,value]of Object.entries(expected)){const found=[...log.matchAll(new RegExp('^# '+key+' (\\d+)\\r?$','gm'))];assert.equal(found.length,1,'Missing/duplicate original TAP summary '+key);assert.equal(Number(found[0][1]),value,'Original Windows callback outcome '+key);}return expected;
}
async function main(siteArgument,outArgument){
 assert.equal(process.platform,'win32','Real PowerShell fixtures require Windows; do not report skipped Linux fixtures as qualified');
 assert(siteArgument&&outArgument,'Pass built site and fresh external report directory');const site=path.resolve(siteArgument),out=path.resolve(outArgument);
 assert(fs.existsSync(path.join(site,'build.json')),'Pass an actual built site');assert(out!==site&&!out.startsWith(site+path.sep),'Reports must stay outside published site');assert(!fs.existsSync(out),'Fresh report directory required; preserve first failure');
 const args=stageArgs();fs.mkdirSync(out,{recursive:true});const temp=path.join(out,'tmp');fs.mkdirSync(temp);
 const stage=await runStage(name,process.execPath,args,{cwd:root,out,timeout:180000,maxBytes:8*1024*1024,env:{...process.env,PYTHONUTF8:'1',SOFFIOLIEVE_TEST_SITE:site,TMP:temp,TEMP:temp}});
 let counts=null,error=stage.result==='PASS'&&stage.exitCode===0?null:String(stage.error||('Original child exit '+stage.exitCode)).slice(0,2048);
 try{counts=verifyResult(stage,fs.readFileSync(path.join(out,stage.log),'utf8'));}catch(failure){error??=String(failure.message).slice(0,2048);}
 const report={schema:1,result:error?'FAIL':'PASS',platform:process.platform,nodeVersion:process.versions.node,build:JSON.parse(fs.readFileSync(path.join(site,'build.json'),'utf8')).revision,stage,counts,argv:args,...(error?{error}:{}),scope:'All27 original bounded-qa064 callbacks on Windows, including actual PowerShell5.1 and child cleanup. Shared deep registry, browser cases and budgets unchanged; no Game/art/audio approval or global RSS claim.'};
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(report.result+' '+name+' '+stage.durationMs+'ms');process.exitCode=report.result==='PASS'?0:1;return report;
}
if(require.main===module){if(process.argv.length!==4){console.error('Usage: node scripts/test-owned-helper-windows064.cjs <built-site> <fresh-report-out>');process.exitCode=1;}else main(process.argv[2],process.argv[3]).catch(error=>{console.error(error);process.exitCode=1;});}
module.exports={stageArgs,verifyResult,main};
