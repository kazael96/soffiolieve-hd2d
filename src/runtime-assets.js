/* Bounded, retryable visual resources. Missing images are errors, never white actors. */
(function(root){
 // Resource retries only: never replay a story event or reload the page.
 class Recovery{
  constructor({attempts=3,delays=[800,2400,6000],online=()=>root.navigator?.onLine!==false,visible=()=>!root.document?.hidden,setTimer=(fn,ms)=>root.setTimeout(fn,ms),clearTimer=id=>root.clearTimeout(id),listen=true}={}){Object.assign(this,{attempts,delays,online,visible,setTimer,clearTimer});this.entries=new Map();this.wake=()=>{for(const e of this.entries.values()){if(!this.online()||!this.visible()){if(e.timer!==null)this.clearTimer(e.timer);e.timer=null;this.schedule(e);}else{if(e.attempt>=this.attempts)e.attempt=0;this.schedule(e);}}};if(listen){root.addEventListener?.('online',this.wake);root.addEventListener?.('offline',this.wake);root.document?.addEventListener?.('visibilitychange',this.wake);}}
  register(key,task,{valid=()=>true,report=()=>{}}={}){let e=this.entries.get(key);if(!e){e={key,attempt:0,timer:null,busy:false,promise:null};this.entries.set(key,e);}Object.assign(e,{task,valid,report});this.schedule(e);return e;}
  current(e){return this.entries.get(e.key)===e;}
  refresh(){for(const e of this.entries.values())this.schedule(e);}
  schedule(e){if(!this.current(e))return;if(!e.valid()){this.clear(e.key);return;}if(e.busy){e.report('retrying',e.attempt);return;}if(!this.online()||!this.visible()){e.report(!this.online()?'offline':'hidden',e.attempt);return;}if(e.attempt>=this.attempts){e.report('manual',e.attempt);return;}e.report('waiting',e.attempt);if(e.timer===null)e.timer=this.setTimer(()=>{e.timer=null;void this.run(e.key);},this.delays[Math.min(e.attempt,this.delays.length-1)]);}
  run(key,manual=false){const e=this.entries.get(key);if(!e)return Promise.resolve(false);if(e.busy)return e.promise;if(!e.valid()){this.clear(key);return Promise.resolve(false);}if(e.timer!==null)this.clearTimer(e.timer);e.timer=null;if(!manual&&(!this.online()||!this.visible())){this.schedule(e);return Promise.resolve(false);}if(manual)e.attempt=0;else e.attempt++;e.busy=true;e.report('retrying',e.attempt);e.promise=Promise.resolve().then(()=>e.task()).then(value=>{if(this.current(e)&&value!==false)this.clear(key);return value;},()=>false).finally(()=>{e.busy=false;if(this.current(e))this.schedule(e);});return e.promise;}
  clear(key){const e=this.entries.get(key);if(e?.timer!==null&&e?.timer!==undefined)this.clearTimer(e.timer);this.entries.delete(key);}
  dispose(){for(const key of this.entries.keys())this.clear(key);root.removeEventListener?.('online',this.wake);root.removeEventListener?.('offline',this.wake);root.document?.removeEventListener?.('visibilitychange',this.wake);}
 }
 async function retry(task,{attempts=2,wait=ms=>new Promise(resolve=>root.setTimeout(resolve,ms))}={}){let error;for(let i=0;i<attempts;i++){if(i){if(root.navigator?.onLine===false)break;await wait(350*i);}try{return await task();}catch(e){error=e;}}throw error;}
 class Pool{constructor(limit=6){this.limit=limit;this.active=0;this.queue=[];this.peak=0;}run(job){return new Promise((resolve,reject)=>{this.queue.push({job,resolve,reject});this.pump();});}pump(){while(this.active<this.limit&&this.queue.length){const x=this.queue.shift();this.active++;this.peak=Math.max(this.peak,this.active);Promise.resolve().then(x.job).then(x.resolve,x.reject).finally(()=>{this.active--;this.pump();});}}}
 function decodePack(raw){const view=new DataView(raw);if(view.byteLength<8||view.getUint32(0,false)!==0x53465031)throw Error("Pacchetto grafico non valido");const length=view.getUint32(4,true);if(length>view.byteLength-8)throw Error("Indice grafico incompleto");const index=JSON.parse(new root.TextDecoder().decode(new Uint8Array(raw,8,length))),result=new Map(),base=8+length;for(const [name,range]of Object.entries(index)){const [at,size]=range;if(!name.startsWith("assets/")||name.includes("..")||!Number.isSafeInteger(at)||!Number.isSafeInteger(size)||at<0||size<1||base+at+size>raw.byteLength)throw Error("Risorsa grafica fuori limite");result.set(name,new root.Blob([raw.slice(base+at,base+at+size)],{type:"image/png"}));}return result;}
 function create({limit=6,attempts=3,timeout=15000,cacheEntries=512,cacheBytes=16*1024*1024,makeImage=()=>new root.Image(),wait=ms=>new Promise(r=>root.setTimeout(r,ms))}={}){const pool=new Pool(limit),pending=new Map(),decoded=new Map(),packed=new Map(),packTasks=new Map(),packOwners=new Map();let decodedBytes=0;
  function packKey(src){try{const base=new URL(".",root.location?.href||"http://local.invalid/"),url=new URL(src,base);return url.origin===base.origin&&url.pathname.startsWith(base.pathname)?url.pathname.slice(base.pathname.length):null;}catch{return null;}}
  function releaseImages(src){
   packTasks.delete(src);const previous=packOwners.get(src);packOwners.delete(src);if(!previous)return;
   for(const [name,blob]of previous)if(packed.get(name)===blob){
    const replacement=[...packOwners.values()].reverse().find(images=>images.has(name));
    if(replacement)packed.set(name,replacement.get(name));else packed.delete(name);
   }
  }
  function preloadImages(src){
   if(packTasks.has(src))return packTasks.get(src);
   const task=Promise.resolve().then(async()=>{
    const controller=new root.AbortController(),timer=root.setTimeout(()=>controller.abort(),15000);
    try{
     if(root.navigator?.onLine===false)throw Error("Connessione assente");
     const response=await root.fetch(src,{signal:controller.signal});if(!response.ok)throw Error("Pacchetto non disponibile");
     const decoded=decodePack(await response.arrayBuffer());
     if(packTasks.get(src)!==task)return false;
     packOwners.set(src,decoded);for(const [name,blob]of decoded)packed.set(name,blob);return true;
    }catch{if(packTasks.get(src)===task)packTasks.delete(src);return false;}
    finally{root.clearTimeout(timer);}
   });packTasks.set(src,task);return task;
  }
  function imageKey(src){try{const url=new URL(src,root.location?.href||'http://local.invalid/'),revision=root.document?.documentElement?.dataset?.build;if(revision&&url.searchParams.get('v')===revision)url.searchParams.delete('v');return url.href;}catch{return src;}}
  function keep(key,img){const bytes=img.naturalWidth*img.naturalHeight*4;if(!cacheEntries||bytes>cacheBytes)return;decoded.set(key,{img,bytes});decodedBytes+=bytes;while(decoded.size>cacheEntries||decodedBytes>cacheBytes){const oldest=decoded.keys().next().value;decodedBytes-=decoded.get(oldest).bytes;decoded.delete(oldest);}}
  function image(src){const key=imageKey(src);if(decoded.has(key)){const entry=decoded.get(key);decoded.delete(key);decoded.set(key,entry);return Promise.resolve(entry.img);}if(pending.has(key))return pending.get(key);const task=pool.run(async()=>{let error;for(let n=0;n<attempts;n++){if(root.navigator?.onLine===false&&(n>0||!packed.has(packKey(src)))){error=Error("Connessione assente: "+src);break;}if(n)await wait(250*n);try{return await new Promise((resolve,reject)=>{const img=makeImage(),blob=n===0?packed.get(packKey(src)):null,objectURL=blob?root.URL.createObjectURL(blob):null;let settled=false;const timer=root.setTimeout(()=>finish(Error('Tempo scaduto: '+src)),timeout);function finish(failure){if(settled)return;settled=true;root.clearTimeout(timer);img.onload=img.onerror=null;if(objectURL)root.URL.revokeObjectURL(objectURL);if(failure){try{img.src='';}catch{}reject(failure);}else resolve(img);}img.onload=()=>img.naturalWidth===0||img.naturalHeight===0?finish(Error('Immagine vuota: '+src)):finish();img.onerror=()=>finish(Error('Immagine non caricata: '+src));img.src=objectURL||src+(n?(src.includes('?')?'&':'?')+'asset_retry='+n:'');});}catch(e){error=e;}}throw error;});pending.set(key,task);task.then(img=>{pending.delete(key);keep(key,img);},()=>pending.delete(key));return task;}
  function bytes(src){const key='bytes:'+src;if(pending.has(key))return pending.get(key);const task=pool.run(async()=>{let error;for(let n=0;n<attempts;n++){if(root.navigator?.onLine===false){error=Error("Connessione assente: "+src);break;}if(n)await wait(250*n);const controller=new root.AbortController(),timer=root.setTimeout(()=>controller.abort(),timeout);try{const response=await root.fetch(src+(n?(src.includes('?')?'&':'?')+'asset_retry='+n:''),{signal:controller.signal});if(!response.ok)throw Error('Risorsa non caricata: '+src);return await response.arrayBuffer();}catch(e){error=e;}finally{root.clearTimeout(timer);}}throw error;});pending.set(key,task);task.then(()=>pending.delete(key),()=>pending.delete(key));return task;}
  return{preloadImages,releaseImages,get packedCount(){return packed.size;},get decodedCount(){return decoded.size;},get decodedBytes(){return decodedBytes;},image,bytes,json:async src=>JSON.parse(new root.TextDecoder().decode(await bytes(src))),pool};
 }
 const loader=create();root.RuntimeAssets=Object.defineProperties({decodePack,Pool,Recovery,retry,create},Object.getOwnPropertyDescriptors(loader));if(typeof module!=='undefined')module.exports=root.RuntimeAssets;
})(typeof window!=='undefined'?window:globalThis);
