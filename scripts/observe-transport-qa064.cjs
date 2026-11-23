/* Optional low-overhead provenance: native inline DOM submission, not CDP text. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),Q=require('./observe-native-qa064.cjs');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),binding='__qaTransport064Done';
function installTransport({names,binding},installOwnership,readIdentity){
 installOwnership({names});
 const ownedAppend=Element.prototype.append,nativeAppend=window.__QASource064.originalAppend,encoder=new TextEncoder();
 const q={docId:crypto.randomUUID(),rows:[],jobs:[],digestPromise:null,readIdentity,error:null};
 Object.defineProperty(window,'__QATransport064',{value:q,configurable:true});
 function digest(node){
  if(node?.tagName!=='SCRIPT'||node.src)return;
  let text=node.textContent;const match=text.match(/\n\/\/# sourceURL=([^\n]+)$/);if(!match)return;
  const url=new URL(match[1]),file=url.pathname.replace(/^\//,''),tail='\n//# sourceURL='+url.href;
  if(!text.endsWith(tail)||node.type&&!['text/javascript','application/javascript'].includes(node.type))q.error='Invalid inline classic-script transport';
  const row={file,url:url.href};let bytes=encoder.encode(text.slice(0,-tail.length));row.bytes=bytes.byteLength;
  const job=crypto.subtle.digest('SHA-256',bytes).then(value=>{row.sha256=Array.from(new Uint8Array(value),n=>n.toString(16).padStart(2,'0')).join('');return row;});
  bytes=null;text=null;node=null;q.rows.push(row);q.jobs.push(job);job.catch(()=>{});
 }
 Element.prototype.append=function(...nodes){
  for(const node of nodes)digest(node);
  let result;try{result=ownedAppend.apply(this,nodes);}catch(error){q.error=String(error);Element.prototype.append=nativeAppend;throw error;}
  if(q.rows.length>=names.length&&!q.digestPromise){
   q.digestPromise=Promise.all(q.jobs).then(rows=>{if(q.error)throw Error(q.error);return window[binding]({docId:q.docId,url:location.href,rows,identity:readIdentity()});});
   q.digestPromise.catch(()=>{});q.jobs=[];
  }
  return result;
 };
}
function expectedBuild(site){const bytes=fs.readFileSync(path.join(site,'app.js'));return{expected:Q.inventory(bytes.toString('utf8')),appSHA256:sha(bytes)};}
async function instrument(browser,o){
 const {expected,appSHA256}=expectedBuild(o.site),file=path.join(o.out,'source-provenance.json'),report={schema:1,backend:'webcrypto-native-inline-dom-transport',result:'RUNNING',appSHA256,build:JSON.parse(fs.readFileSync(path.join(o.site,'build.json'))).revision,expectedModules:expected.length,pages:[],scope:'SHA256 of exact inline textContent source before synchronous captured native Element.append delegation, immutable module order and live ownership. Transport footer checked separately. No CDP getScriptSource, animation or visual approval.'};
 const save=()=>fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n'),fail=(row,error,key='error')=>{row.result='FAIL';row[key]=String(error.stack||error);report.result='FAIL';save();},newContext=browser.newContext.bind(browser);save();
 const init='(()=>{const ownership=('+Q.installObserver.toString()+'),identity=('+Q.liveIdentity.toString()+');('+installTransport.toString()+')('+JSON.stringify({names:expected.map(r=>r.file),binding})+',ownership,identity);})();';
 browser.newContext=async function(...args){
  const context=await newContext(...args),pages=new Map();let bindingFailure=null;
  try{await context.exposeBinding(binding,async(source,payload)=>{
   const row=pages.get(source.page);if(!row){bindingFailure=Error('Unowned provenance page');report.result='FAIL';report.bindingError=bindingFailure.message;save();throw bindingFailure;}
   try{
    if(source.frame!==source.page.mainFrame())throw Error('Provenance requires the owned main frame');
    if(!payload||typeof payload.docId!=='string'||!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(payload.docId)||row.documents.some(d=>d.docId===payload.docId))throw Error('Missing or duplicate provenance document');
    if(!Array.isArray(payload.rows)||payload.rows.length!==expected.length)throw Error('Incomplete inline transport document');
    for(let i=0;i<expected.length;i++){const actual=payload.rows[i],pin=expected[i];if(actual.file!==pin.file||actual.sha256!==pin.sha256||actual.bytes!==pin.bytes||actual.url!==new URL(pin.file,payload.url).href)throw Error('Inline source/order differs from immutable build: '+pin.file);}
    Q.checkIdentity(payload.identity);row.documents.push({docId:payload.docId,url:payload.url,modules:payload.rows,initial:payload.identity});save();return true;
   }catch(error){bindingFailure=error;fail(row,error,'documentError');throw error;}
  });await context.addInitScript({content:init});}catch(error){report.result='FAIL';report.setupError=String(error.stack||error);save();try{await context.close();}finally{throw error;}}
  const newPage=context.newPage.bind(context);
  context.newPage=async function(...args){
   const page=await newPage(...args),row={result:'RUNNING',mainNavigations:[],documents:[]};pages.set(page,row);report.pages.push(row);if(report.result!=='FAIL')report.result='RUNNING';save();
   page.on('framenavigated',frame=>{if(frame!==page.mainFrame()||frame.url()==='about:blank')return;row.mainNavigations.push({url:frame.url()});save();});return page;
  };
  const close=context.close.bind(context);
  context.close=async function(...args){
   let failure=null;
   try{for(const [page,row]of pages){try{
    if(page.isClosed())throw Error('Page closed before final inline provenance check');
    const final=await page.evaluate(async()=>{const q=window.__QATransport064;if(!q?.digestPromise)throw Error('Incomplete final inline transport document');await q.digestPromise;return{docId:q.docId,identity:q.readIdentity()};});
    if(row.result==='FAIL')throw Error('An earlier inline transport document failed');
    if(!row.mainNavigations.length||row.documents.length!==row.mainNavigations.length||!row.documents.some(d=>d.docId===final.docId))throw Error('Missing complete inline provenance for a main document');
    Q.checkIdentity(final.identity);row.final=final;row.result='PASS';save();
   }catch(error){fail(row,error,'finalError');failure??=error;}}
   if(!pages.size){failure=Error('No owned provenance pages');report.result='FAIL';report.finalError=failure.message;save();}failure??=bindingFailure;if(failure)throw failure;
   if(report.result!=='FAIL')report.result=report.pages.every(r=>r.result==='PASS')?'PASS':'RUNNING';save();
   }finally{try{await close(...args);}catch(error){report.result='FAIL';report.closeError=String(error.stack||error);save();throw error;}}
  };
  return context;
 };
 return report;
}
module.exports={instrument,installTransport};
