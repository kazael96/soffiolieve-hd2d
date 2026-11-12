/* Sequential callers get live, bounded evidence even if a child stalls. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
function runStage(name,exe,args,{cwd,out,env=process.env,timeout=180000,maxBytes=8*1024*1024}={}){
 if(!/^[a-z0-9-]+$/.test(name)||!Number.isInteger(timeout)||timeout<1||!Number.isInteger(maxBytes)||maxBytes<1)throw Error('Invalid stage budget or name');
 const start=Date.now(),log=name+'.log',file=path.join(out,log);
 return new Promise(resolve=>{
  const sink=fs.createWriteStream(file);let child,reason=null,size=0,timer,finished=false;
  const failure=message=>{if(reason)return;reason=message;child?.kill();};
  const finish=code=>{if(finished)return;finished=true;clearTimeout(timer);if(reason)sink.write('\n'+reason+'\n');sink.end(()=>resolve({name,result:code===0&&!reason?'PASS':'FAIL',exitCode:code,durationMs:Date.now()-start,log,...(reason?{error:reason}:{})}));};
  sink.on('error',error=>{failure('Stage log failed: '+error.message);finished=true;clearTimeout(timer);resolve({name,result:'FAIL',exitCode:null,durationMs:Date.now()-start,log,error:reason});});
  child=cp.spawn(exe,args,{cwd,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
  const consume=(stream,chunk)=>{const keep=Math.max(0,Math.min(chunk.length,maxBytes-size));size+=chunk.length;if(keep&&!sink.write(chunk.subarray(0,keep))){stream.pause();sink.once('drain',()=>stream.resume());}if(size>maxBytes)failure('Stage output exceeded '+maxBytes+' bytes');};
  child.stdout.on('data',chunk=>consume(child.stdout,chunk));child.stderr.on('data',chunk=>consume(child.stderr,chunk));
  child.on('error',error=>failure('Stage process failed: '+error.message));child.on('close',code=>finish(code));
  timer=setTimeout(()=>failure('Stage exceeded '+timeout+'ms'),timeout);
 });
}
module.exports=runStage;
