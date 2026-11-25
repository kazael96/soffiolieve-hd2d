'use strict';
// Portable FULL runtime / immutable historical ROI oracle. Native R and raster host remain shared.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const sha=raw=>crypto.createHash('sha256').update(raw).digest('hex'),canonicalLF=raw=>Buffer.from(raw.toString('utf8').replace(/\r\n/g,'\n'),'utf8');
const repo=process.env.SOFFIOLIEVE_TEST_REPO||path.resolve(__dirname,'../..'),site=process.env.SOFFIOLIEVE_TEST_SITE||path.join(repo,'_site'),fixture=path.resolve(__dirname,'../fixtures/ambient-readback064'),metadata=path.join(fixture,'source-contract.json'),metadataBytes=fs.readFileSync(metadata);
assert.equal(sha(canonicalLF(metadataBytes)),'4397a241a0c3586128e21de65623a14cd4930b7ccfed60b7bd6750295d2b2706','Ambient source metadata canonicalLF integrity');
const contract=JSON.parse(metadataBytes.toString('utf8'));
function source(file){const override=process.env.SOFFIOLIEVE_TEST_SOURCE&&path.join(process.env.SOFFIOLIEVE_TEST_SOURCE,file);return override&&fs.existsSync(override)?override:path.join(repo,'src',file);}
function program(key,fragment=null){const p=contract.programs[key],slice=fragment&&contract.fragments[fragment];return{path:source(p.file),sha256:slice?slice.canonicalLFSHA256:p.canonicalLFSHA256,domain:'program',parentSHA256:p.canonicalLFSHA256,...(slice?{slice}:{})};}
function pinned(p){
 const raw=fs.readFileSync(p.path);if(p.domain==='raw'){assert.equal(sha(raw),p.sha256,'Raw native input changed: '+p.path);return raw;}
 assert(raw.equals(Buffer.from(raw.toString('utf8'),'utf8')),'Raw UTF8 must roundtrip exactly: '+p.path);assert.equal(sha(canonicalLF(raw)),p.parentSHA256||p.sha256,'CanonicalLF source changed: '+p.path);let result=raw;
 if(p.slice){const text=raw.toString('utf8'),s=p.slice,start=text.indexOf(s.start);assert(start>=0&&text.indexOf(s.start,start+1)<0,'Unique source slice start required');let from=start,end;
  if(s.lineFunction){from+=s.removePrefix.length;let lineEnd=text.indexOf('\n',from);if(lineEnd<0)lineEnd=text.length;let line=text.slice(from,lineEnd);if(line.endsWith('\r'))line=line.slice(0,-1);assert(line.endsWith(';'));result=Buffer.from(line.slice(0,-1),'utf8');}
  else{end=text.indexOf(s.end,start+s.start.length);assert(end>start,'Source slice terminator required');if(s.includeEnd)end+=s.end.length;result=Buffer.from(text.slice(start,end),'utf8');}
  assert.equal(sha(canonicalLF(result)),p.sha256,'Extracted current source slice changed');assert.equal(canonicalLF(result).length,s.canonicalLFBytes);
 }
 return result;
}
function historical(key){const h=contract.historicalROI.fragments[key];return{path:path.join(fixture,h.file),sha256:h.canonicalLFSHA256,domain:'program'};}
const historicalContract={path:path.join(fixture,contract.historicalROI.contract.file),sha256:contract.historicalROI.contract.canonicalLFSHA256,domain:'program'},history=JSON.parse(pinned(historicalContract).toString('utf8'));
for(const [key,h]of Object.entries(contract.historicalROI.fragments)){assert.equal(h.originProgramCanonicalLFSHA256,history.programs.diorama.canonicalLFSHA256);assert.equal(h.canonicalLFSHA256,history.fragments[key].canonicalLFSHA256);assert.equal(h.canonicalLFBytes,history.fragments[key].canonicalLFBytes);}
assert.equal(contract.programs.diorama.canonicalLFSHA256,contract.baseline.originFullProgramRawSHA256,'Qualified FULL parent required');
assert.equal(contract.fragments.ambientPose.canonicalLFSHA256,contract.baseline.canonicalLFSHA256,'Current FULL pose must match immutable original FULL fixture');
const renderer=program('renderer'),speciesSource=program('species'),ambientCanvas=program('diorama','ambientCanvas'),ambientHistoricalCanvas=historical('ambientCanvas'),ambientHelper=historical('ambientHelper'),ambientA=historical('ambientPose'),ambientB=program('diorama','ambientPose'),immutableFullPose={path:path.join(fixture,contract.baseline.file),sha256:contract.baseline.canonicalLFSHA256,domain:'program'},wingWrapper=program('unfezant','wingWrapper');
const nativeAssets=contract.nativeAssets.map(p=>({...p,path:path.join(site,p.relative),domain:'raw'}));
const plan={schema:1,scope:contract.scope,programs:{A:renderer,B:renderer},speciesSource,ambientCanvas,ambientHelper,ambientPose:{A:ambientA,B:ambientB},wingWrapper,canvasModule:process.env.SOFFIOLIEVE_CANVAS_MODULE||'@napi-rs/canvas',nativeAssets,limits:contract.limits,inputs:[renderer,speciesSource,program('diorama'),program('unfezant'),program('index'),ambientCanvas,ambientHistoricalCanvas,ambientHelper,ambientA,ambientB,immutableFullPose,historicalContract,wingWrapper,...nativeAssets,{path:metadata,sha256:'4397a241a0c3586128e21de65623a14cd4930b7ccfed60b7bd6750295d2b2706',domain:'program'}]};
assert.equal(require(path.join(plan.canvasModule,'package.json')).version,contract.canvasVersion,'Native canvas version');
const native=require(plan.canvasModule);
const assets=new Map(plan.nativeAssets.map(p=>[p.relative,p]));
const plain=x=>JSON.parse(JSON.stringify(x));
function host(label){
 assert(['A','B'].includes(label));
 const allowedBindingFaults=new Set(),canvases=[],contexts=new WeakMap(),decoded=new Map(),originalImages=new Map(),counts={productionReadbacks:0,productionPixels:0,productionReturnedPixels:0,ambientReadbacks:0,ambientPixels:0,ambientReturnedPixels:0,ambientReturnedBytes:0,oracleReadbacks:0,contextAttributeQueries:0,draws:0,ambientCalls:0,JSONLoads:0,PNGDecodes:0};
 async function decode(relative){const p=assets.get(relative);assert(p&&relative.endsWith('.png'));counts.PNGDecodes++;return native.loadImage(pinned(p));}
 function canvas(role='fixture'){
  const value=native.createCanvas(1,1),get=value.getContext,stack=role==='renderer-owned'?String(new Error().stack):'',row={canvas:value,role:role==='renderer-owned'?(/\bat layer \(/.test(stack)?'native-layer':/\bat opaqueReference \(/.test(stack)?'native-opaque-reference':'unclassified-native'):role,firstContext:null};canvases.push(row);
  value.getContext=function(...args){
   const context=Reflect.apply(get,this,args);if(args[0]!=='2d')return context;
   if(!contexts.has(context)){
    const getData=context.getImageData,getAttrs=context.getContextAttributes;
    let actual=null,attributeError=null;try{if(typeof getAttrs==='function')actual=plain(Reflect.apply(getAttrs,context,[]));}catch(e){attributeError=String(e);}
    const meta={context,canvas:value,role:row.role,getData,getAttrs,actualAttributes:actual,attributeError};contexts.set(context,meta);
    context.getImageData=function(...a){counts.productionReadbacks++;counts.productionPixels+=a[2]*a[3];meta.lastReadback=a.slice(0,4);const imageData=Reflect.apply(getData,this,a);counts.productionReturnedPixels+=imageData.width*imageData.height;if(row.role==='ambient-frame'){counts.ambientReadbacks++;counts.ambientPixels+=a[2]*a[3];counts.ambientReturnedPixels+=imageData.width*imageData.height;counts.ambientReturnedBytes+=imageData.data.byteLength;}return imageData;};
    if(typeof getAttrs==='function')context.getContextAttributes=function(...a){counts.contextAttributeQueries++;return Reflect.apply(getAttrs,this,a);};
   }
   if(!row.firstContext)row.firstContext={argc:args.length,requested:plain(args[1]??null),actual:contexts.get(context).actualAttributes,attributeError:contexts.get(context).attributeError,width:value.width,height:value.height};
   return context;
  };return value;
 }
 const c={console,document:{createElement(tag){assert.equal(tag,'canvas');return canvas('renderer-owned');}},RuntimeAssets:{
  async json(src){const p=assets.get(src);assert(p&&src.endsWith('.json'),'Raw native JSON allowlist only');counts.JSONLoads++;return JSON.parse(pinned(p).toString('utf8'));},
  async image(src){const p=assets.get(src);assert(p&&src.endsWith('.png'),'Raw native PNG allowlist only');if(!decoded.has(src))decoded.set(src,decode(src));return decoded.get(src);}
 }};c.window=c;vm.createContext(c);
 vm.runInContext(pinned(plan.speciesSource).toString('utf8'),c,{filename:plan.speciesSource.path});
 vm.runInContext(pinned(plan.programs[label]).toString('utf8'),c,{filename:plan.programs[label].path});
 vm.runInContext(pinned(label==='A'?ambientHistoricalCanvas:plan.ambientCanvas).toString('utf8')+'\n'+(label==='A'?pinned(plan.ambientHelper).toString('utf8')+'\n':'')+pinned(plan.ambientPose[label]).toString('utf8')+'\nthis.OriginalAmbientPose064=ambientPose;'+(label==='A'?'this.BindAmbientReadback064=bindAmbientReadback;':''),c,{filename:'EXACT_AMBIENT_SUBSTRINGS_'+label});
 const R=c.ROM_SPRITE_ANIM,original={draw:R.draw,frame:R.frame,parts:R.parts,bounds:R.bounds,batches:R.batches,prepare:R.prepare,alphaBounds:R.alphaBounds};
 function stable(){for(const [key,value]of Object.entries(original))if(!allowedBindingFaults.has(key))assert.equal(R[key],value,'Real original API changed: '+key);}
 function target(role,hint){const surface=canvas(role);surface.width=surface.height=256;const context=surface.getContext('2d',{willReadFrequently:hint});context.imageSmoothingEnabled=false;return{canvas:surface,context};}
 async function actor(id,hint){if(!originalImages.has(id))originalImages.set(id,decode('assets/pokemon/'+id+'-front.png'));const image=await originalImages.get(id),frame=target('ambient-frame',hint),source=target('ambient-source',false);const actor={id,frame:frame.canvas,frameContext:frame.context,source:source.canvas,ctx:source.context,original:{image}};if(label==='A')c.BindAmbientReadback064(actor);return actor;}
 function read(context){const meta=contexts.get(context);assert(meta,'Owned actual context required');counts.oracleReadbacks++;const value=Reflect.apply(meta.getData,context,[0,0,256,256]);return Buffer.from(value.data.buffer,value.data.byteOffset,value.data.byteLength);}
 function bounds(rgba){const value=R.alphaBounds(rgba,256,256);return value?Array.from(value):null;}
 function render(key,tick,surface,isActor){
  stable();let result,frame,source=null;
  if(isActor){counts.ambientCalls++;result=plain(c.OriginalAmbientPose064(surface,tick));frame=read(surface.frameContext);source=read(surface.ctx);}
  else{surface.context.clearRect(0,0,256,256);counts.draws++;const id=+key.split('-')[0],back=key.endsWith('-back');assert.equal(R.draw(surface.context,id,back,128,192,.8,tick,true),true,'Actual native R.draw must succeed');frame=read(surface.context);result={bounds:bounds(frame)};}
  const rawBounds=bounds(frame),bank=R.cache[key],metrics={...result,rawBounds,groundBounds:Array.from(bank.groundBounds),nativeBounds:Array.from(bank.bounds),supportBottom:result.bounds?.[3]??null,lift:isActor&&rawBounds?rawBounds[3]-result.bounds[3]:null};
  return{frame,source,metrics};
 }
 function renderOnly(key,tick,surface,isActor){stable();if(isActor){counts.ambientCalls++;c.OriginalAmbientPose064(surface,tick);}else{surface.context.clearRect(0,0,256,256);counts.draws++;assert.equal(R.draw(surface.context,+key.split('-')[0],key.endsWith('-back'),128,192,.8,tick,true),true);}}
 function audit(){return{label,counts:{...counts},canvases:canvases.length,layerCanvases:canvases.filter(x=>x.role==='native-layer').length,layerHintRequested:canvases.filter(x=>x.role==='native-layer'&&x.firstContext?.requested?.willReadFrequently===true).length,layerDefaultRequested:canvases.filter(x=>x.role==='native-layer'&&x.firstContext?.argc===1).length,actualNativeDestinationHints:canvases.filter(x=>x.role==='ambient-frame'||x.role==='back-frame').map(x=>({role:x.role,requested:x.firstContext?.requested,actual:x.firstContext?.actual,error:x.firstContext?.attributeError})),stats:plain(R.cacheStats()),APIBindingsOriginal:Object.keys(original).every(k=>R[k]===original[k])};}
 return{label,R,c,canvases,counts,target,actor,render,renderOnly,audit,stable,decode,plain,readback:context=>contexts.get(context)?.lastReadback?.slice(),allowBindingFault:key=>allowedBindingFaults.add(key)};
}
module.exports={host,plan,pinned,sha,plain};
