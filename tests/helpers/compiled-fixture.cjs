/* Cache compilation only. Every invocation executes in its caller's fresh VM.
 * Exact source equality also covers edited files with unchanged timestamps. */
const vm=require('node:vm');
function create({maxEntries=192,maxBytes=96*1024*1024}={}){
 if(!Number.isInteger(maxEntries)||maxEntries<1||!Number.isInteger(maxBytes)||maxBytes<1)throw Error('Invalid fixture compilation budget');
 const cache=new Map();let bytes=0,compilations=0,hits=0;
 function run(source,context,{filename='fixture.js'}={}){
  if(typeof source!=='string')throw Error('Fixture source must be text');
  let entry=cache.get(filename);
  if(entry?.source===source){hits++;cache.delete(filename);cache.set(filename,entry);}
  else{
   const script=new vm.Script(source,{filename});compilations++;
   if(entry){bytes-=entry.bytes;cache.delete(filename);}
   entry={source,script,bytes:Buffer.byteLength(source)};
   if(entry.bytes<=maxBytes){cache.set(filename,entry);bytes+=entry.bytes;while(cache.size>maxEntries||bytes>maxBytes){const key=cache.keys().next().value;bytes-=cache.get(key).bytes;cache.delete(key);}}
  }
  return entry.script.runInContext(context);
 }
 return {run,stats:()=>({entries:cache.size,sourceBytes:bytes,compilations,hits})};
}
module.exports={create,...create()};
