/* Reconcile safe native gate initializers on cold scene preparation too.
 * No event or animation is replayed; the current live animation owns its pose. */
(function(root){
 const rows={};for(let zone=356;zone<=363;zone++){
  const header=root.LEAGUE_EVENTS?.zones[zone];if(!header)continue;const code=Object.values(root.LEAGUE_EVENTS.scripts[header.script].code),flag=code.find(c=>c.name==='StackPushFlag')?.args[0],hide=code.find(c=>c.name==='NativeOpcode299')?.args,work=header.triggers[0]?.var;
  if(!Number.isInteger(flag)||!hide||work!==16384)throw Error('Inizializzatore originale del portale incompleto');rows[zone]={bank:header.script,flag,type:hide[0],x:hide[1]-16,z:hide[2]-16,work};
 }
 function prepare(control,scene,native=root.NativeStory?.state){
  const row=rows[scene?.zone];if(!row||native?.zone!==scene.zone)return false;
  const open=native.flags.includes(row.flag);native.vars[row.work]=open?1:0;
  const vm=root.NativeStory?.vm;if(vm?.running&&vm.bank===row.bank)return true;
  const target=control.find(row.type,row.x,row.z);if(!target)throw Error('Modello originale del portale non disponibile');
  if(target.animation===undefined){if(open)control.hide(row.type,row.x,row.z);else delete target.hidden;}return true;
 }
 const api={prepare,rows};root.LeagueGates=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
