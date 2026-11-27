/* Read-only provenance for an owned, isolated browser. No supplied game poses. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const prefix='/* Generated classic-script transport; source files remain available. */\nfor(const [file,source] of ';
const suffix='){const tag=document.createElement("script");tag.textContent=source+"\\n//# sourceURL="+new URL(file,location.href).href;document.body.append(tag);tag.remove();}\n';
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
function inventory(text){
 if(!text.startsWith(prefix)||!text.endsWith(suffix))throw Error('Unknown classic source transport');
 const rows=JSON.parse(text.slice(prefix.length,-suffix.length)),seen=new Set();
 if(!Array.isArray(rows)||!rows.length)throw Error('Empty transported sources');
 return rows.map(row=>{if(!Array.isArray(row)||row.length!==2||row.some(s=>typeof s!=='string')||seen.has(row[0]))throw Error('Invalid or repeated transported module');seen.add(row[0]);return {file:row[0],sha256:sha(row[1]),bytes:Buffer.byteLength(row[1])};});
}
function installObserver({names}){
 const wanted=new Set(names),important=new Set(['species-moves.js','pokemon-anim.js','tail-whip-moves.js','unfezant-moves.js','emboar-contact-moves.js']),rows=[],refs={},append=Element.prototype.append;
 const q={rows,refs,before:{},originalAppend:append};
 Object.defineProperty(window,'__QASource064',{value:q,configurable:true});
 Element.prototype.append=function(...nodes){
  for(const node of nodes){if(node?.tagName!=='SCRIPT'||node.src)continue;const match=node.textContent.match(/\n\/\/# sourceURL=([^\n]+)$/);if(!match)continue;const file=new URL(match[1]).pathname.replace(/^\//,'');if(important.has(file))q.before[file]={draw:window.ROM_SPRITE_ANIM?.draw,part:window.SpeciesMoves?.part,sample:window.SpeciesMoves?.sample};}
  const result=append.apply(this,nodes);
  for(const node of nodes){if(node?.tagName!=='SCRIPT'||node.src)continue;const match=node.textContent.match(/\n\/\/# sourceURL=([^\n]+)$/);if(!match)continue;const url=new URL(match[1]),file=url.pathname.replace(/^\//,'');if(!wanted.has(file))continue;
   rows.push({file,url:url.href});
   if(important.has(file))refs[file]={draw:window.ROM_SPRITE_ANIM?.draw,frame:window.ROM_SPRITE_ANIM?.frame,part:window.SpeciesMoves?.part,sample:window.SpeciesMoves?.sample,pose:window.SpeciesMoves?.pose};
   if(rows.length===names.length){q.final={draw:window.ROM_SPRITE_ANIM?.draw,frame:window.ROM_SPRITE_ANIM?.frame,part:window.SpeciesMoves?.part,sample:window.SpeciesMoves?.sample,pose:window.SpeciesMoves?.pose};Element.prototype.append=append;}
  }
  return result;
 };
}
function liveIdentity(){
 const q=window.__QASource064,final=q?.final,contact=window.EmboarContactMoves?.instance;
 if(!final)return {ready:false};
 const unchanged={draw:ROM_SPRITE_ANIM.draw===final.draw,frame:ROM_SPRITE_ANIM.frame===final.frame,part:SpeciesMoves.part===final.part,sample:SpeciesMoves.sample===final.sample,pose:SpeciesMoves.pose===final.pose};
 const native=q.refs['pokemon-anim.js'],wing=q.refs['unfezant-moves.js'];
 return {ready:true,unchanged,appendRestored:Element.prototype.append===q.originalAppend,installedDrawPinned:final.draw===(wing?.draw||native?.draw),nativeDrawPredecessorPinned:!wing||q.before['unfezant-moves.js']?.draw===native?.draw,unfezantPartPinned:!wing||final.part===wing.part,contactExpected:!!q.refs['emboar-contact-moves.js'],contact:!contact?null:{poseInstalled:final.pose===contact.installedPoseRef,partPinned:contact.sourceReferences?.part===final.part,samplePinned:contact.sourceReferences?.sample===final.sample,nativeFramePinned:contact.sourceReferences?.nativeFrame===final.frame},functionText:Object.fromEntries(Object.entries(final).map(([k,v])=>[k,typeof v==='function'?Function.prototype.toString.call(v):null]))};
}
async function instrument(browser,o){
 const expected=inventory(fs.readFileSync(path.join(o.site,'app.js'),'utf8')),byFile=new Map(expected.map(row=>[row.file,row])),out=path.join(o.out,'source-provenance.json'),report={schema:1,appSHA256:sha(fs.readFileSync(path.join(o.site,'app.js'))),build:JSON.parse(fs.readFileSync(path.join(o.site,'build.json'))).revision,expectedModules:expected.length,pages:[],scope:'Actual CDP script text, synchronous transport execution order and live function identity. Not animation or visual approval.'};
 const save=()=>fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n'),newContext=browser.newContext.bind(browser);save();
 browser.newContext=async function(...args){
  const context=await newContext(...args);await context.addInitScript(installObserver,{names:expected.map(row=>row.file)});
  const newPage=context.newPage.bind(context),checks=[];
  context.newPage=async function(...args){
   const page=await newPage(...args),cdp=await context.newCDPSession(page),scripts=[];cdp.on('Debugger.scriptParsed',e=>scripts.push(e));await cdp.send('Debugger.enable');
   const goto=page.goto.bind(page),row={result:'RUNNING',modules:[],documents:[]};report.pages.push(row);checks.push({page,row});
   async function verifyDocuments(){
    const actual=await page.evaluate(()=>__QASource064.rows);if(actual.map(r=>r.file).join('\n')!==expected.map(r=>r.file).join('\n'))throw Error('Executed module order differs from immutable build');
    const urls=new Map(actual.map(module=>[module.url,module.file])),groups=new Map();
    for(const script of scripts){if(!urls.has(script.url))continue;const group=groups.get(script.executionContextId)||[];group.push(script);groups.set(script.executionContextId,group);}
    if(!groups.size)throw Error('Actual document script context missing');
    for(const [contextId,group]of groups){
     if(row.documents.some(document=>document.executionContextId===contextId))continue;
     if(group.map(s=>urls.get(s.url)).join('\n')!==expected.map(r=>r.file).join('\n'))throw Error('Incomplete, repeated or reordered actual document modules');
     const document={executionContextId:contextId,modules:[]};
     for(const s of group){const file=urls.get(s.url),raw=(await cdp.send('Debugger.getScriptSource',{scriptId:s.scriptId})).scriptSource,tail='\n//# sourceURL='+s.url;if(!raw.endsWith(tail))throw Error('Actual sourceURL suffix differs: '+file);const source=raw.slice(0,-tail.length),pin=byFile.get(file),hash=sha(source);if(hash!==pin.sha256)throw Error('Actual executed source differs: '+file);document.modules.push({file,sha256:hash,scriptId:s.scriptId,executionContextId:contextId});}
     row.documents.push(document);if(!row.modules.length)row.modules=document.modules;save();
    }
   }
   row.verifyDocuments=verifyDocuments;
   page.goto=async function(url,...args){
    row.url=String(url);save();try{
     const result=await goto(url,...args);row.actualURL=page.url();await page.waitForFunction(n=>window.__QASource064?.rows.length===n,expected.length,{timeout:45000});
     await verifyDocuments();
     row.initial=await page.evaluate(liveIdentity);checkIdentity(row.initial);row.result='PASS';save();return result;
    }catch(error){row.result='FAIL';row.error=String(error.stack||error);save();throw error;}
   };
   return page;
  };
  const close=context.close.bind(context);context.close=async function(...args){try{for(const {page,row}of checks){try{if(page.isClosed())throw Error('Page closed before final source ownership check');await row.verifyDocuments();row.final=await page.evaluate(liveIdentity);checkIdentity(row.final);save();}catch(error){row.result='FAIL';row.finalError=String(error.stack||error);save();throw error;}}}finally{await close(...args);}};
  return context;
 };
 return report;
}
function checkIdentity(value){
 const names=['draw','frame','part','sample','pose'];
 if(!value.ready||!value.appendRestored||!value.installedDrawPinned||!value.nativeDrawPredecessorPinned||!value.unfezantPartPinned||names.some(name=>value.unchanged?.[name]!==true||typeof value.functionText?.[name]!=='string')||(value.contactExpected||value.contact)&&['poseInstalled','partPinned','samplePinned','nativeFramePinned'].some(name=>value.contact?.[name]!==true))throw Error('Actual runtime function binding differs from executed module ownership');
 for(const [name,text]of Object.entries(value.functionText))value.functionText[name]=text===null?null:{sha256:sha(text.replace(/\r\n/g,'\n')),bytes:Buffer.byteLength(text)};
}
module.exports={instrument,inventory,checkIdentity,installObserver,liveIdentity};
