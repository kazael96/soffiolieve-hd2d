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
 const api={valid,calendar,current,transition};root.FieldSeason=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
