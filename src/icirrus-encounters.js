/* Seasonal native tables. Reference-only phenomena never become ordinary slots. */
(function(root){
 function chapterSeason(zone,season){
  if(!root.OpelucidChapter?.zones.includes(zone))return null;
  const data=root.LEAGUE_DATA?.encounters?.[zone]??root.OPELUCID_DATA?.encounters?.[zone];
  return data?.seasons[season]||null;
 }
 function table(zone,season=root.FieldSeason?.current()??new Date().getMonth()%4){
  const next=chapterSeason(zone,season);
  if(next)return {...(next.normal||{rate:0,slots:[]}),...(next.dark?.rate?{dark:next.dark}:{})};
  if(!root.IcirrusChapter?.zones.includes(zone))return null;
  const source=root.ICIRRUS_DATA.encounters[zone]?.seasons[season];
  if(!source?.normal?.rate)return null;
  return {...source.normal,...(source.dark?.rate?{dark:source.dark}:{})};
 }
 function water(zone,season=root.FieldSeason?.current()??new Date().getMonth()%4){
  const next=chapterSeason(zone,season);return next?(next.surf||{rate:0,slots:[]}):null;
 }
 root.IcirrusEncounters={table,water};
})(typeof window==='undefined'?globalThis:window);
