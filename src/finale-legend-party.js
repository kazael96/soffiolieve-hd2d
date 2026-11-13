/* IRBI overlay21:021b6818 (own Reshiram),021b67e8 (swap lead),
 *021b65ec/021b6734 (swap a chosen party member with own boxed Reshiram).
 * The demo has no trading; OT IDs retain its existing player identity format.
 */
(function(root){
 function own(p,state){return !!p&&!p.egg&&p.name==='Reshiram'&&Number.isInteger(p.otId)&&p.otId===state.trainer?.id;}
 function find(state){return state.party.findIndex(p=>own(p,state));}
 function lead(state){const i=find(state);if(i>0)[state.party[0],state.party[i]]=[state.party[i],state.party[0]];return i>=0;}
 function fromBox(state,storage,slot){
  if(!Number.isInteger(slot)||slot<0||slot>=state.party.length)throw Error('Scelta della squadra non valida');
  const boxes=state.storage?.boxes||[],current=state.storage?.current||0;
  // Native search begins at the current Box and wraps through all24 Boxes.
  for(let offset=0;offset<24;offset++){const box=(current+offset)%24;for(let index=0;index<30;index++)if(own(boxes[box]?.[index],state)){
   const outgoing=state.party[slot],held=outgoing.heldItem,letter=outgoing.mail,hadLetter=Object.hasOwn(outgoing,'mail'),hadMailbox=state.original?.pcMail!==undefined,beforeMailbox=hadMailbox?structuredClone(state.original.pcMail):null;
   const restore=()=>{outgoing.heldItem=held;if(hadLetter)outgoing.mail=letter;else delete outgoing.mail;if(state.original){if(hadMailbox)state.original.pcMail=beforeMailbox;else delete state.original.pcMail;}};
   if(root.MistraltonMail?.isMail(held)){
    const archived=root.MistraltonMail.archiveHeld?.(slot,{persist:false});if(!archived?.ok){const error=Error(archived?.reason==='full'?'La casella dei Messaggi è piena. Scegli un altro Pokémon.':'Il Messaggio non può essere archiviato. Scegli un altro Pokémon.');error.code=archived?.reason==='full'?'MAILBOX_FULL':'MAILBOX_INVALID';restore();throw error;}
   }
   try{const result=storage.move({box,slot:index},{party:true,slot});if(!result.ok)throw Error('Sostituzione della squadra non riuscita: '+result.reason);return lead(state);}catch(error){restore();throw error;}
  }}return false;
 }
 root.FinaleLegendParty={own,find,lead,fromBox};
})(typeof window==='undefined'?globalThis:window);
