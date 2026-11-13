/* Actual GLB/geometry loader. PNG dimensions are read without a graphics context. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function create(){
 const base=path.resolve(__dirname,'../../src'),reads=[];
 const file=url=>path.join(base,new URL(url,'http://isolated.test/').pathname);
 const c={URL,TextDecoder,DataView,Uint8Array,Float32Array,Math,Map,WeakMap,Promise,console,location:{href:'http://isolated.test/'}};c.window=c;
 c.RuntimeAssets={bytes:async url=>{const b=fs.readFileSync(file(url));return b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);},image:async url=>{reads.push(url);const b=fs.readFileSync(file(url));return {url,width:b.readUInt32BE(16),height:b.readUInt32BE(20)};}};
 vm.createContext(c);for(const name of ['starter-scene.js','field-model-assets.js','field-models.js','finale-field-models.js'])vm.runInContext(fs.readFileSync(path.join(base,name),'utf8'),c,{filename:name});
 c.FinaleFieldModels.install();return {c,reads};
}
module.exports={create};
