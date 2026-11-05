/* One native Mountain variant retained; images prepared only before presentation. */
(function(root){
 let loaded=null,pending=null,sequence=0;const originals=new Map();
 function restore(){if(!loaded)return;for(const kind of ['models','textures'])for(const [key,value]of Object.entries(loaded.data[kind]))if(OPENING_ASSETS[kind][key]===value){const before=originals.get(kind+':'+key);if(before===undefined)delete OPENING_ASSETS[kind][key];else OPENING_ASSETS[kind][key]=before;}originals.clear();}
 function install(){if(!loaded)return;const target=OPENING_ASSETS.scenes.zone199,source=loaded.data.scenes[199];if(target)Object.assign(target,{instances:source.instances,permissionGrids:source.permissionGrids,outdoor:true,fieldSeason:loaded.season});}
 async function catalog(season){
  const path='field-season-'+season+'-assets.js',bytes=await RuntimeAssets.bytes(NativeTextLayout.resource(path)),text=new TextDecoder().decode(bytes),prefix='window.ICIRRUS_SEASON_ASSETS=';
  if(!text.startsWith(prefix))throw Error('Catalogo stagionale non valido');const data=JSON.parse(text.slice(prefix.length).trim().replace(/;$/,''));
  if(data.season!==season||data.source.zone!==199||data.source.matrix!==[93,93,93,193][season]||data.scenes[199]?.surfaces.length!==4)throw Error('Variante stagionale incompleta');return data;
 }
 async function prepare(zone=199,{images=true}={}){
  if(zone!==199)return true;const season=FieldSeason.current();
  if(loaded?.season!==season){
   if(pending?.season===season)await pending.task;
   else {const serial=++sequence,request={season};request.task=(async()=>{
    const data=await catalog(season);if(serial!==sequence||FieldSeason.current()!==season)return;
    restore();loaded={season,data,images:null};for(const kind of ['models','textures'])for(const [key,value]of Object.entries(data[kind])){originals.set(kind+':'+key,OPENING_ASSETS[kind][key]);OPENING_ASSETS[kind][key]=value;}
   })();pending=request;try{await request.task;}finally{if(pending===request)pending=null;}}
   if(loaded?.season!==FieldSeason.current())return prepare(zone,{images});
  }
  install();if(images){const record=loaded;if(!record.images)record.images=RuntimeAssets.preloadImages(NativeTextLayout.resource('assets/field-season-'+record.season+'-pack.bin')).catch(error=>{record.images=null;throw error;});await record.images;if(record!==loaded)return prepare(zone,{images});}return true;
 }
 const portalHeight=w=>(w.y<<16>>16)/16;
 function portalOpen(w){if(!loaded)return true;const [dx,dz]=({1:[0,1],2:[0,-1],3:[1,0],4:[-1,0]})[w.a],height=portalHeight(w),x=w.x/16+(w.width-1)/2-16-dx,z=w.z/16+(w.height-1)/2-16-dz,row=root.IcirrusChapter.surfaceAt(199,x,z,height);return !!row&&!(row.flags&1)&&Math.abs(row.height-height)<.75;}
 root.IcirrusSeasons={prepare,portalHeight,portalOpen,scene:zone=>zone===199?loaded?.data.scenes[199]:null,stats:()=>({season:loaded?.season??null,catalogs:loaded?1:0,pending:pending?.season??null,models:Object.keys(loaded?.data.models||{}).length,textures:Object.keys(loaded?.data.textures||{}).length})};
})(typeof window==='undefined'?globalThis:window);
