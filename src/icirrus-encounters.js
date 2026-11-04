/* Seasonal native tables. Reference-only phenomena never become ordinary slots. */
(function(root){
 function table(zone,season=new Date().getMonth()%4){
  if(!root.IcirrusChapter?.zones.includes(zone))return null;
  const source=root.ICIRRUS_DATA.encounters[zone]?.seasons[season];
  if(!source?.normal?.rate)return null;
  return {...source.normal,...(source.dark?.rate?{dark:source.dark}:{})};
 }
 root.IcirrusEncounters={table};
})(typeof window==='undefined'?globalThis:window);
