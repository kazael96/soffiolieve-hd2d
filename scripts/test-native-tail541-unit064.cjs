'use strict';
/* Additional fast feedback; the original full94 registry and paired child stay unchanged. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),runStage=require('./stage-runner.cjs'),unitStages=require('./unit-test-groups.cjs'),{isolationFlag}=require('./node-test-options.cjs');
const root=path.resolve(__dirname,'..'),pair=['native-tail541-protocol064.test.cjs','native-tail541-audio064.test.cjs'],metricsHelper=path.join(root,'tests/helpers/native-tail541-metrics064.cjs');
function selectStage(files){
 const selected=unitStages(files).filter(stage=>stage[0]==='unit-native-tail541');assert.equal(selected.length,1,'Exactly one original native541 paired stage required');
 const stage=selected[0];assert.deepEqual(stage,[stage[0],process.execPath,['--expose-gc','--max-old-space-size=400','--require',metricsHelper,'--test',isolationFlag(),'--test-concurrency=1',...pair.map(name=>path.join(root,'tests',name))]],'Original paired argv/metrics/ownership must remain exact');return stage;
}
function verifyResult(stage,metrics,log){
 assert.equal(stage.result,'PASS','Original paired stage failed');assert.equal(stage.exitCode,0,'Original paired child exit must be zero');
 assert(metrics&&Number.isInteger(metrics.pid)&&metrics.pid>0,'Original native541 metrics missing or invalid');assert.equal(metrics.exitCode,0);
 assert.equal(metrics.observedRSSLimitKiB,409600);assert.equal(metrics.heapLimitMiB,400);assert.equal(metrics.observedRSSWithinLimit,true);
 assert(Number.isInteger(metrics.maxRSSKiB)&&metrics.maxRSSKiB>0&&metrics.maxRSSKiB<=409600,'Original observed RSS limit exceeded');
 const expected={tests:16,pass:16,fail:0,cancelled:0,skipped:0,todo:0};for(const [key,value]of Object.entries(expected)){const found=[...log.matchAll(new RegExp('^# '+key+' (\\d+)\\r?$','gm'))];assert.equal(found.length,1,'Missing/duplicate original TAP summary '+key);assert.equal(Number(found[0][1]),value,'Original paired callback outcome '+key);}return expected;
}
async function main(siteArgument,outArgument){
 assert(siteArgument&&outArgument,'Pass built site and fresh external report directory');const site=path.resolve(siteArgument),out=path.resolve(outArgument);
 assert(fs.existsSync(path.join(site,'build.json')),'Pass an actual built site');assert(out!==site&&!out.startsWith(site+path.sep),'Reports must stay outside published site');assert(!fs.existsSync(out),'Fresh report directory required; preserve first failure');
 const files=fs.readdirSync(path.join(root,'tests')).filter(name=>name.endsWith('.test.cjs')).map(name=>path.join(root,'tests',name)),[name,exe,args]=selectStage(files);
 fs.mkdirSync(out,{recursive:true});const temp=path.join(out,'tmp'),metricsFile=path.join(out,'native541-metrics.json');fs.mkdirSync(temp);
 const stage=await runStage(name,exe,args,{cwd:root,out,timeout:180000,maxBytes:8*1024*1024,env:{...process.env,PYTHONUTF8:'1',SOFFIOLIEVE_TEST_SITE:site,TMP:temp,TEMP:temp,NATIVE541_METRICS:metricsFile}});
 let metrics=null,counts=null,error=stage.result==='PASS'&&stage.exitCode===0?null:String(stage.error||('Original paired child exit '+stage.exitCode)).slice(0,2048);try{assert(fs.statSync(metricsFile).size<=4096,'Original metrics report exceeds4KiB');metrics=JSON.parse(fs.readFileSync(metricsFile,'utf8'));counts=verifyResult(stage,metrics,fs.readFileSync(path.join(out,stage.log),'utf8'));}catch(failure){error??=String(failure.message).slice(0,2048);}
 const report={schema:1,build:JSON.parse(fs.readFileSync(path.join(site,'build.json'),'utf8')).revision,created:new Date().toISOString(),result:error?'FAIL':'PASS',stage,metrics,counts,...(error?{error}:{}),scope:'Additional original native541 paired stage only; full94 and Windows remain required. Observed RSS is not an OS reservation or Game/art approval.'};
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(report.result+' '+name+' '+stage.durationMs+'ms');process.exitCode=report.result==='PASS'?0:1;return report;
}
if(require.main===module){if(process.argv.length!==4){console.error('Usage: node scripts/test-native-tail541-unit064.cjs <built-site> <fresh-report-out>');process.exitCode=1;}else main(process.argv[2],process.argv[3]).catch(error=>{console.error(error);process.exitCode=1;});}
module.exports={selectStage,verifyResult,main};
