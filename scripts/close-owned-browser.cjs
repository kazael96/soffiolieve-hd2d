/* Only operates on the isolated Playwright server supplied by its owner. */
async function bounded(action,timeoutMs){
 let timer;try{return await Promise.race([Promise.resolve().then(action).then(()=>({result:'CLOSED'}),error=>({result:'ERROR',error:String(error?.stack||error)})),new Promise(resolve=>{timer=setTimeout(()=>resolve({result:'TIMEOUT'}),timeoutMs);})]);}finally{clearTimeout(timer);}
}
module.exports=async function closeOwnedBrowser(browser,server,{timeoutMs=5000}={}){
 if(!Number.isInteger(timeoutMs)||timeoutMs<=0)throw Error('Invalid isolated browser cleanup budget');
 const report={result:'PASS',graceful:true,forced:false};
 if(browser)report.browser=await bounded(()=>browser.close(),timeoutMs);
 if(server){report.server=await bounded(()=>server.close(),timeoutMs);if(report.server.result!=='CLOSED'){report.graceful=false;report.forced=true;report.kill=await bounded(()=>server.kill(),timeoutMs);if(report.kill.result!=='CLOSED')report.result='FAIL';}}
 if(report.browser&&report.browser.result!=='CLOSED')report.graceful=false;
 if(!server&&report.browser&&report.browser.result!=='CLOSED')report.result='FAIL';
 return report;
};
