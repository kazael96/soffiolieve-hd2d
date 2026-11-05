/* Bounded geographic asset families. A stale load never replaces the visible field. */
(function(root){
 function create({assets,manifest,loadFamily,limit=3,onEvict=()=>{},onDiscard=()=>{}}){
  if(!assets?.models||!assets?.textures||!manifest||typeof loadFamily!=='function'||!Number.isInteger(limit)||limit<1)throw Error('Configurazione delle risorse geografiche non valida');
  const resident=new Map(),pending=new Map(),originals=new Map(),available=new Map(),claims=new Map();let generation=0;
  const key=(kind,name)=>kind+':'+name;
  function remove(name){
   const old=resident.get(name);if(!old)return;resident.delete(name);
   for(const kind of ['models','textures'])for(const [id,value]of Object.entries(old[kind])){
    const replacement=[...resident.values()].reverse().find(data=>Object.hasOwn(data[kind],id));
    if(assets[kind][id]===value){if(replacement)assets[kind][id]=replacement[kind][id];else{const before=originals.get(key(kind,id));if(before===undefined)delete assets[kind][id];else assets[kind][id]=before;}}
    if(!replacement)originals.delete(key(kind,id));
   }
   onEvict(name,old);
  }
  async function load(name){
   if(resident.has(name))return resident.get(name);if(available.has(name))return available.get(name);if(pending.has(name))return pending.get(name);
   const task=(async()=>{const data=await loadFamily(name,manifest[name]);if(!data?.models||!data?.textures||!data?.scenes||data.family!==name)throw Error('Famiglia geografica incompleta: '+name);available.set(name,data);return data;})();pending.set(name,task);
   try{return await task;}finally{if(pending.get(name)===task)pending.delete(name);}
  }
  async function ensure(names){
   const needed=[...new Set(names)];if(!needed.length||needed.length>limit||needed.some(name=>!Object.hasOwn(manifest,name)))throw Error('Finestra geografica non valida');
   const token=++generation;for(const name of needed)claims.set(name,(claims.get(name)||0)+1);
   try{
   // Wait for all resource owners even on failure, so no successful sibling is leaked.
   const results=await Promise.allSettled(needed.map(load)),failure=results.find(r=>r.status==='rejected');
   if(failure)throw failure.reason;const data=results.map(r=>r.value);if(token!==generation)return false;
   for(let i=0;i<needed.length;i++){
    const name=needed[i],value=data[i];resident.delete(name);resident.set(name,value);
    for(const kind of ['models','textures'])for(const [id,row]of Object.entries(value[kind])){if(!originals.has(key(kind,id)))originals.set(key(kind,id),assets[kind][id]);assets[kind][id]=row;}
   }
   while(resident.size>limit){const old=[...resident.keys()].find(name=>!needed.includes(name));if(!old)throw Error('Budget geografico incoerente');remove(old);}
   return true;
   }finally{
    for(const name of needed){const count=claims.get(name)-1;if(count){claims.set(name,count);continue;}claims.delete(name);const value=available.get(name);available.delete(name);if(value&&resident.get(name)!==value)onDiscard(name,value);}
   }
  }
  function cancel(){generation++;}
  function clear(){cancel();for(const name of [...resident.keys()])remove(name);}
  return {ensure,cancel,clear,get:name=>resident.get(name)||null,stats:()=>({resident:[...resident.keys()],pending:[...pending.keys()],limit})};
 }
 const api={create};root.OpelucidResourceCache=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
