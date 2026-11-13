/* Metadata survives eviction; geometry belongs to the current geographic window. */
(function(root){
 const defaultNeighbors={113:[198,205,345],205:[113],345:[113],157:[62,326],348:[120],120:[348]};
 const dimensions=g=>({width:(g.bytes?.[0]|g.bytes?.[1]<<8)||32,depth:(g.bytes?.[2]|g.bytes?.[3]<<8)||32});
 const contains=(g,x,z)=>{const {width,depth}=dimensions(g);return x>=g.x-16&&x<g.x-16+width&&z>=g.z-16&&z<g.z-16+depth;};
 function create({metadata,parts,assets,loader,legacyDescriptor=()=>null,legacyScene=()=>null,legacyEnsure=async()=>{},neighbors=defaultNeighbors,surfaces=null,afterPrepare=async()=>{},variant=()=>null}){
  const owned=new Map(),zones=Object.keys(metadata).map(Number),globalZones=zones.filter(z=>metadata[z].sourceMatrix===0);let generation=0,loading=null;
  const descriptor=z=>variant(z)?.descriptor||metadata[z]||legacyDescriptor(z),members=z=>[z,...(neighbors[z]||[])],grids=z=>members(z).flatMap(id=>descriptor(id)?.permissionGrids||[]);
  const geometry=(data,z)=>variant(z)?.scene||data?.variantScenes?.[z]?.[variant(z)?.key]||data?.scenes[z];
  const crosses=(a,b)=>a===b||(neighbors[a]||[]).includes(b)||(neighbors[b]||[]).includes(a);
  function evict(name){for(const [zone,scene]of owned)if(parts.zoneFamily[zone]===name&&assets.scenes['zone'+zone]===scene){scene.instances=[];scene.assetsPending=true;}}
  async function prepare(zone){
   if(!owned.has(zone))throw Error('Mappa del capitolo non disponibile: '+zone);
   if(loading?.zone===zone)return loading.promise;
   const token=++generation,ids=members(zone),families=[...new Set(ids.filter(id=>!variant(id)?.scene).map(id=>parts.zoneFamily[id]).filter(Boolean))];if(!families.length)loader.cancel();
   const promise=Promise.resolve().then(async()=>{
    await Promise.all(ids.filter(id=>!parts.zoneFamily[id]).map(legacyEnsure));if(token!==generation)return false;
    if(families.length&&!await loader.ensure(families)||token!==generation)return false;
    const scene=owned.get(zone);if(assets.scenes['zone'+zone]!==scene)return false;
    const current=geometry(loader.get(parts.zoneFamily[zone]),zone);if(!current)throw Error('Geometria della mappa incompleta: '+zone);
    const instances=ids.flatMap(id=>{
     const data=parts.zoneFamily[id]?geometry(loader.get(parts.zoneFamily[id]),id):legacyScene(id);
     if(!data?.instances)throw Error('Geometria della mappa adiacente incompleta: '+id);return data.instances;
    });
    // Preserve the descriptor handle used by the renderer, itineraries and collisions.
    Object.assign(scene,descriptor(zone),current,{instances,permissionGrids:grids(zone),assetsPending:true});
    await afterPrepare(zone,scene);if(token!==generation||assets.scenes['zone'+zone]!==scene)return false;
    scene.assetsPending=false;return true;
   }).finally(()=>{if(loading?.token===token)loading=null;});loading={zone,token,promise};return promise;
  }
  function register(){if(owned.size)return api;for(const zone of zones){const scene={...metadata[zone],zone,chapter051:true,verticalMap:true,permissionGrids:grids(zone),instances:[],assetsPending:true,ensureAssets:()=>prepare(zone)};owned.set(zone,scene);assets.scenes['zone'+zone]=scene;}return api;}
  function cancel(){generation++;loading=null;loader.cancel();}
  function fieldAt(x,z){return [...new Set([...globalZones,...Object.values(neighbors).flat().filter(id=>descriptor(id)?.sourceMatrix===0)])].find(id=>descriptor(id)?.permissionGrids?.some(g=>contains(g,x,z)))??null;}
  function boundaryBlocked(zone,x,z){if(!globalZones.includes(zone))return false;const next=fieldAt(x,z);return next!==null&&!crosses(zone,next);}
  function blockedAt(zone,x,z){if(boundaryBlocked(zone,x,z))return true;const grid=grids(zone).find(g=>contains(g,x,z));if(!grid)return true;const {width}=dimensions(grid),offset=8+((Math.floor(z-grid.z)+16)*width+Math.floor(x-grid.x)+16)*8;return offset+2>=grid.bytes.length||!!(grid.bytes[offset+2]&1);}
  function surfaceAt(zone,x,z,height=0){if(!owned.has(zone))return null;const selected=globalZones.includes(zone)?fieldAt(x,z)??zone:zone;return surfaces?.at(selected,x,z,height)||null;}
  function geometryScene(zone,key=null){const data=loader.get(parts.zoneFamily[zone]),scene=key===null?data?.scenes?.[zone]:data?.variantScenes?.[zone]?.[key];if(!scene)throw Error('Geometria richiesta non disponibile: '+zone+'/'+key);return scene;}
  const api={geometryScene,register,prepare,cancel,evict,members,grids,crosses,fieldAt,blockedAt,boundaryBlocked,surfaceAt,zones,globalZones,sameField:(a,b)=>a===b||members(a).includes(b),scene:zone=>owned.get(zone)||null};return api;
 }
 const api={create};root.OpelucidSceneWindow=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
