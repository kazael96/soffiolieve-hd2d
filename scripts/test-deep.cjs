/* One reproducible command; failed/skipped stages are never reported as a green build. */
const fs=require('fs'),path=require('path'),runStage=require('./stage-runner.cjs');
const root=path.resolve(__dirname,'..'),site=path.resolve(process.argv[2]||'_site'),out=path.resolve(process.argv[3]||'test-results/deep'),python=process.argv.find(a=>a.startsWith('--python='))?.slice(9)||'python';fs.mkdirSync(out,{recursive:true});
if(!fs.existsSync(path.join(site,'build.json')))throw Error('Pass a built site directory as first argument');
if(out===site||out.startsWith(site+path.sep))throw Error('Test reports must be outside the published site');
const temp=path.join(out,'tmp');fs.mkdirSync(temp,{recursive:true});
const unitFiles=fs.readdirSync(path.join(root,'tests')).filter(f=>f.endsWith('.test.cjs')).map(f=>path.join(root,'tests',f));
const stages=[...require('./unit-test-groups.cjs')(unitFiles),['builder',python,['-m','unittest','discover','-s','tests','-p','test_*.py']],...['built-site','render-assets','story-runtime','accumula-runtime','route2-runtime','striaton-runtime','route3-runtime','training-runtime','pinwheel-runtime','castelia-runtime','castelia-moves','castelia-residents','castelia-navigation','nimbasa-runtime','nimbasa-moves','nimbasa-residents','nimbasa-navigation','driftveil-assets','driftveil-runtime','driftveil-moves','driftveil-residents','driftveil-navigation','driftveil-continuity','driftveil-guards','mistralton-runtime','mistralton-moves','mistralton-residents','mistralton-navigation','mistralton-fly','mistralton-story-battles','icirrus-moves','opelucid-moves','icirrus-runtime','double-runtime','field-stress','mobile-runtime','opponent-runtime','checkpoint-stress','combat-stress'].map(n=>[n,process.execPath,['tests/check-'+n+'.cjs',site]])];
async function main(){
const results=[];for(const [name,exe,args]of stages){const result=await runStage(name,exe,args,{cwd:root,out,timeout:180000,maxBytes:8*1024*1024,env:{...process.env,PYTHONUTF8:'1',SOFFIOLIEVE_TEST_SITE:site,TMP:temp,TEMP:temp}});results.push(result);console.log(result.result+' '+name+' '+result.durationMs+'ms');}

const report={schema:1,build:JSON.parse(fs.readFileSync(path.join(site,'build.json'),'utf8')).revision,created:new Date().toISOString(),result:results.every(r=>r.result==='PASS')?'PASS':'FAIL',stages:results,browser:{result:'NOT_RUN',instruction:'Generate the isolated browser QA site and run it through a browser. CLI success alone does not certify pixels, touch or physical phone GPUs.'}};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));process.exitCode=report.result==='PASS'?0:1;

}
main().catch(error=>{console.error(error);process.exitCode=1;});
