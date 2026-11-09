/* Chapter051 transport: data-only catalogs, bounded ownership and complete image packs. */
(function(root){
 function parse(raw,name,part){
  const variable=part.variable??'OPELUCID_PART_ASSETS';
  if(typeof variable!=='string'||! /^[A-Z][A-Z0-9_]*$/.test(variable))throw Error('Catalogo geografico non valido: '+name);
  const text=new TextDecoder().decode(raw),match=new RegExp('^\\s*window\\.'+variable+'\\s*=\\s*([\\s\\S]*?)\\s*;?\\s*$').exec(text);
  if(!match)throw Error('Catalogo geografico non valido: '+name);
  let data;try{data=JSON.parse(match[1]);}catch{throw Error('Catalogo geografico non valido: '+name);}
  if(data.family!==name||!data.models||!data.textures||!data.scenes||!data.sprites||!Array.isArray(part.zones))throw Error('Catalogo geografico incompleto: '+name);
  const actual=Object.keys(data.scenes).map(Number).sort((a,b)=>a-b),expected=[...part.zones].sort((a,b)=>a-b);
  if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Mappe geografiche incomplete: '+name);
  const sceneRows=Object.values(data.scenes);
  for(const [zone,variants]of Object.entries(data.variantScenes||{})){
   if(!expected.includes(+zone)||!variants||typeof variants!=='object')throw Error('Variante geografica non valida: '+name);
   sceneRows.push(...Object.values(variants));
  }
  for(const scene of sceneRows){
   if(!Array.isArray(scene.instances))throw Error('Geometria geografica incompleta: '+name);
   for(const instance of scene.instances)if(!data.models[instance.model])throw Error('Modello geografico mancante: '+name);
  }
  for(const model of Object.values(data.models))for(const group of model.groups||[])if(group.texture&&!data.textures[group.texture])throw Error('Texture geografica mancante: '+name);
  return data;
 }
 function create({manifest,assets,resources=root.RuntimeAssets,resource=file=>root.NativeTextLayout.resource(file),cacheFactory=root.OpelucidResourceCache?.create,onEvict=()=>{}}){
  if(!manifest?.families||!resources?.releaseImages||typeof cacheFactory!=='function')throw Error('Trasporto geografico non disponibile');
  const pack=part=>resource(part.pack);
  function release(name,data){resources.releaseImages(pack(manifest.families[name]));onEvict(name,data);}
  return cacheFactory({assets,manifest:manifest.families,limit:manifest.residentLimit,onEvict:release,onDiscard:release,loadFamily:async(name,part)=>{
   const data=parse(await resources.bytes(resource(part.src)),name,part);
   if(!await resources.preloadImages(pack(part))){resources.releaseImages(pack(part));throw Error('Immagini geografiche incomplete: '+name);}
   return data;
  }});
 }
 const api={create,parse};root.OpelucidFamilyLoader=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
