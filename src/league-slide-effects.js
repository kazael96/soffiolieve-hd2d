/* Original hero_kemu BTP keys; world billboard is the HD-2D presentation. */
(function(root){
 function create({data=root.LEAGUE_SLIDE_EFFECTS,sprites=root.OPENING_SPRITES}={}){
  const name='Polvere Via Vittoria',items=[];
  if(data){if(data.frames!==12||data.keys?.length!==4||data.keys.some((k,i)=>k.frame!==i*3)||!sprites)throw Error('Sequenza originale della polvere non disponibile');sprites[name]=data.keys.map(k=>k.url);}
  const alive=p=>p.age*30<data.frames-1e-8;
  function tick(dt){if(!data||!Number.isFinite(dt)||dt<=0)return;for(const p of items)p.age+=dt;for(let i=items.length-1;i>=0;i--)if(!alive(items[i]))items.splice(i,1);}
  function emit(body,age=0){if(!data)return;if(![body.x,body.y,body.height,age].every(Number.isFinite)||age<0)throw Error('Posizione della polvere non valida');const p={x:body.x+data.offset[0],z:body.y+data.offset[2],height:body.height+data.offset[1],age};if(alive(p))items.push(p);}
  function visuals(){return items.map(p=>({name,x:p.x,z:p.z,height:p.height,frame:Math.min(3,Math.floor((p.age*30+1e-8)/3)),worldWidth:data.worldSize?.[0]??2,worldHeight:data.worldSize?.[1]??1,noShadow:true}));}
  return {tick,emit,visuals,clear:()=>{items.length=0;},resources:()=>data?[{name}]:[]};
 }
 const api={create};root.LeagueSlideEffects=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
