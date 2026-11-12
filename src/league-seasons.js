/* Native052 seasonal catalogs use the ordinary geographic cache and its budget. */
(function(root){
 function partFor(name,part,season=root.FieldSeason?.current()??0){
  if(!part.seasons)return part;
  if(!Number.isInteger(season)||season<0||season>3)throw Error('Stagione geografica non valida');
  const selected=part.seasons[season],zones=row=>JSON.stringify([...(row?.zones||[])].sort((a,b)=>a-b));
  if(!selected||selected.season!==season||zones(selected)!==zones(part)||selected.variable!=='LEAGUE_PART_ASSETS')throw Error('Catalogo stagionale incompleto: '+name);
  return selected;
 }
 const api={partFor};root.LeagueSeasons=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
