/* First-ending caps follow native first parties: E4 50, IRBI N587 52,
 * Ghetsis232 54. Preparation flag2409..12 is set before battle, so it is
 * never sufficient by itself to count the final Elite Four victory. */
(function(root){
 const elite=[228,229,230,231],allowed=new Set([...elite,587,232]);
 function normalize(state){if(!state)return;state.firstEndingWins=[...new Set((Array.isArray(state.firstEndingWins)?state.firstEndingWins:[]).filter(id=>Number.isInteger(id)&&allowed.has(id)))];}
 function recordBattle(state,id,won){if(!state||won!==true||!allowed.has(id))return false;normalize(state);if(!state.firstEndingWins.includes(id))state.firstEndingWins.push(id);return true;}
 function enter(state,zone){
  // Native272:34..46 clears all four flags when a fresh challenge begins.
  if(zone!==136||!state||state.flags?.includes(185)||[2409,2410,2411,2412].some(id=>state.flags?.includes(id)))return false;
  normalize(state);state.firstEndingWins=state.firstEndingWins.filter(id=>!elite.includes(id));return true;
 }
 function limit(state,ceiling=54){
  const phase=state?.vars?.[16566],wins=state?.firstEndingWins||[],flags=state?.flags||[];
  if(phase===4||phase===6)return Math.min(54,ceiling); // Native556:2543 /5632, after victory /credits.
  const complete=elite.every(id=>wins.includes(id))&&[2409,2410,2411,2412].every(id=>flags.includes(id));
  return Math.min(flags.includes(185)||complete?52:50,ceiling);
 }
 const api={normalize,recordBattle,enter,limit};root.FinaleProgression=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
