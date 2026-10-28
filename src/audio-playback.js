/* Completion guards for foreground mobile audio interruptions; no gameplay timer. */
(function(root){
 function ended(source,context,cleanup,{loop=false,hidden=()=>root.document?.hidden}={}){let settled=false,timer,resolve;const done=new Promise(r=>resolve=r);const finish=()=>{if(settled)return;settled=true;if(timer)root.clearInterval(timer);cleanup();resolve();};source.onended=finish;
  if(!loop){let stalled=0;timer=root.setInterval(()=>{if(hidden()||context.state==='running'){stalled=0;return;}if(context.state==='closed'||++stalled>=2){try{source.stop();}catch{}finish();}},1000);}return done;
 }
 async function fetchAudio(url){const controller=new AbortController(),timer=root.setTimeout(()=>controller.abort(),15000);try{return await root.fetch(url,{signal:controller.signal});}finally{root.clearTimeout(timer);}}
 const api={ended,fetch:fetchAudio};root.AudioPlayback=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
