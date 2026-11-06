/* IRBI distinguishes the loaded field season from the calendar month. */
(function(root){
 const valid=n=>Number.isInteger(n)&&n>=0&&n<4,calendar=(date=new Date())=>date.getMonth()%4,boot=calendar();
 function current(state=root.NativeStory?.state||root.Journey?.state?.original){if(!state)return boot;if(!valid(state.fieldSeason))state.fieldSeason=calendar();return state.fieldSeason;}
 function transition(state,{covered=false,outdoor=false,fromOutdoor=true,busy=false,date=new Date()}={}){
  const previous=current(state),next=calendar(date);if(next===previous)return {changed:false,season:previous};
  // Browser staging: keep the old terrain until a covered indoor->outdoor
  // transition with no travelling NPC. Never replan a visible body mid-route.
  if(!covered||!outdoor||fromOutdoor||busy)return {changed:false,deferred:true,season:previous};
  state.fieldSeason=next;return {changed:true,previous,season:next};
 }
 // IRBI ARM9 020113f0 indexes 0209dea4 by effective season*24 + hour.
 // These are five native phases; early night4 is distinct from evening2/night3.
 const hours=[
  [4,4,4,4,4,0,0,0,0,0,1,1,1,1,1,1,1,2,2,2,3,3,3,3],
  [4,4,4,4,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,2,2,3,3,3],
  [4,4,4,4,4,4,0,0,0,0,1,1,1,1,1,1,1,2,2,2,3,3,3,3],
  [4,4,4,4,4,4,4,0,0,0,0,1,1,1,1,1,1,2,2,3,3,3,3,3]
 ];
 function phase(state,date=new Date()){const hour=date.getHours();if(!Number.isInteger(hour)||hour<0||hour>23)throw Error('Ora del campo non valida');return hours[current(state)][hour];}
 const api={valid,calendar,current,transition,phase};root.FieldSeason=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
