/* Apply the native initial hidden actors once to saves from chapters before053. */
(function(root){
 function migrate(state,data=root.FINALE_INITIAL_STATE){
  if(!state||state.chapter053===true)return false;
  if(!Array.isArray(data?.initialActorFlags)||data.initialActorFlags.some(id=>!Number.isInteger(id)))throw Error('Stato iniziale del finale non disponibile');
  const inFinale=state.zone>=137&&state.zone<=144||state.zone>=264&&state.zone<=278||state.flags?.includes(185)||(state.vars?.[16566]||0)>0;
  state.flags??=[];
  if(!inFinale)for(const flag of data.initialActorFlags)if(!state.flags.includes(flag))state.flags.push(flag);
  state.chapter053=true;return true;
 }
 const api={migrate};root.FinaleMigration=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
