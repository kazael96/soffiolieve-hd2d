/* One lazy native Route8/Moor season: geometry, permissions and planes agree. */
(function(root){
 let loaded=null,pending=null,serial=0;const originals=new Map(),floors=new Map(),zones=[113,205,345,346];
 const current=()=>root.FieldSeason.current(),resource=file=>root.NativeTextLayout.resource(file),pack=season=>resource('assets/opelucid-season-'+season+'-pack.bin');
 function restore(){if(!loaded)return;for(const kind of ['models','textures'])for(const [key,value]of Object.entries(loaded.data[kind]))if(root.OPENING_ASSETS[kind][key]===value){const old=originals.get(kind+':'+key);if(old===undefined)delete root.OPENING_ASSETS[kind][key];else root.OPENING_ASSETS[kind][key]=old;}originals.clear();floors.clear();root.RuntimeAssets.releaseImages(pack(loaded.season));}
 async function catalog(season){const raw=new TextDecoder().decode(await root.RuntimeAssets.bytes(resource('opelucid-season-'+season+'-assets.js'))),prefix='window.OPELUCID_SEASON_ASSETS=';if(!raw.startsWith(prefix))throw Error('Catalogo stagionale orientale non valido');const data=JSON.parse(raw.slice(prefix.length).trim().replace(/;$/,''));if(data.season!==season||data.source?.rom!=='IRBI'||!data.models||!data.textures||!data.surfaces?.grids||zones.some(z=>!data.scenes[z]?.instances?.length||!data.surfaces.scenes[z]?.length))throw Error('Variante stagionale orientale incompleta');return data;}
 async function prepare(zone){
  if(!zones.includes(zone))return false;const season=current();if(loaded?.season===season)return true;if(pending?.season===season)return pending.promise;
  const token=++serial,request={season};request.promise=(async()=>{const data=await catalog(season);if(token!==serial||current()!==season)return false;if(!await root.RuntimeAssets.preloadImages(pack(season)))throw Error('Immagini della stagione orientale incomplete');if(token!==serial||current()!==season){root.RuntimeAssets.releaseImages(pack(season));return false;}
   const sampler=root.NativeSurfaces.create({...root.NATIVE_SURFACE_DATA,...data.surfaces});restore();loaded={season,data,sampler};for(const kind of ['models','textures'])for(const [key,value]of Object.entries(data[kind])){originals.set(kind+':'+key,root.OPENING_ASSETS[kind][key]);root.OPENING_ASSETS[kind][key]=value;}return true;
  })().catch(error=>{if(loaded?.season!==season)root.RuntimeAssets.releaseImages(pack(season));throw error;}).finally(()=>{if(pending===request)pending=null;});pending=request;return request.promise;
 }
 function scene(zone){return loaded?.season===current()?loaded.data.scenes[zone]||null:null;}
 function variant(zone){const value=scene(zone);return value?{key:'season'+loaded.season,descriptor:{...root.OPELUCID_SCENES[zone],sourceMatrix:value.sourceMatrix,permissionGrids:value.permissionGrids},scene:value}:null;}
 function surfaceAt(zone,x,z,height){return scene(zone)?loaded.sampler.at(zone,x,z,height):null;}
 function materialAt(context){
  const key=[context.zone,...context.origin,context.height||0,context.kind||''].join(':');if(floors.has(key))return floors.get(key);const value=scene(context.zone);if(!value)return {texture:context.floor};const [x,z]=context.origin,height=surfaceAt(context.zone,x,z,context.height||0)?.height??context.height??0;
  for(const i of value.instances){if(!/^op-season\d+-map-\d+$/.test(i.model))continue;const cs=Math.cos(i.rotation||0),sn=Math.sin(i.rotation||0);
   for(const g of loaded.data.models[i.model].groups)for(let k=0;k<g.verts.length;k+=33){const [a,b,c]=[0,11,22].map(o=>{const at=k+o,v=g.verts;return [v[at]*cs+v[at+2]*sn+i.x,v[at+1]+i.y,-v[at]*sn+v[at+2]*cs+i.z,v[at+3],v[at+4]];}),den=(b[2]-c[2])*(a[0]-c[0])+(c[0]-b[0])*(a[2]-c[2]);if(Math.abs(den)<1e-7)continue;const u=((b[2]-c[2])*(x-c[0])+(c[0]-b[0])*(z-c[2]))/den,v=((c[2]-a[2])*(x-c[0])+(a[0]-c[0])*(z-c[2]))/den,w=1-u-v;
    if(Math.min(u,v,w)<-1e-5||Math.abs(a[1]*u+b[1]*v+c[1]*w-height)>=.035)continue;
    const result={texture:g.texture};if(context.kind!=='surf'&&/(?:sp|w)_(?:o11m|marsh)/.test(g.texture)){
     const t=loaded.data.textures[g.texture],dx=[(b[2]-c[2])/den,(c[2]-a[2])/den,(a[2]-b[2])/den],dz=[(c[0]-b[0])/den,(a[0]-c[0])/den,(b[0]-a[0])/den],values=[a,b,c],span=index=>(Math.abs(values.reduce((n,p,j)=>n+p[index]*dx[j],0))+Math.abs(values.reduce((n,p,j)=>n+p[index]*dz[j],0)))/2,wrap=(n,size,repeat)=>repeat?(n%size+size)%size:Math.max(0,Math.min(size-1,n)),cu=wrap(a[3]*u+b[3]*v+c[3]*w,t.w,g.repeatS),cv=wrap(a[4]*u+b[4]*v+c[4]*w,t.h,g.repeatT),ru=Math.min(t.w/4,Math.max(.5,span(3))),rv=Math.min(t.h/4,Math.max(.5,span(4)));
     result.patch=[Math.max(0,cu-ru),Math.max(0,cv-rv),Math.min(t.w-.001,cu+ru),Math.min(t.h-.001,cv+rv)];
    }floors.set(key,result);return result;
   }
  }throw Error('Materiale nativo della stagione non trovato: '+key);
 }

 const api={prepare,scene,variant,surfaceAt,battle:context=>{if(!scene(context.zone))return context;const sample=materialAt(context);return {...context,season:loaded.season,floor:sample.texture,...(sample.patch?{floorUV:sample.patch}:{})};},cancel(){serial++;pending=null;},stats:()=>({season:loaded?.season??null,catalogs:loaded?1:0,pending:pending?.season??null,models:Object.keys(loaded?.data.models||{}).length,textures:Object.keys(loaded?.data.textures||{}).length})};root.OpelucidSeasons=api;
})(typeof window==='undefined'?globalThis:window);
