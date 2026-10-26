/* IRBI overlay93 021ce7f0: trainer remarks at the next command selection.
 * The original loop consumes every matching hint, returning the last one.
 * Message 20 exists for the first rivals but requires a party of >1 Pokémon.
 */
(function(root){
  function hint(messages,party,shown){
    const active=party.find(p=>p.hp>0);if(!active)return null;
    const alive=party.filter(p=>p.hp>0).length;
    const eligible={18:active.hp<=Math.max(1,Math.floor(active.maxhp/2)),17:active.hp<active.maxhp,
      19:party.length>1&&alive===1,20:party.length>1&&alive===1&&active.hp<=Math.max(1,Math.floor(active.maxhp/2))};
    let result=null;
    for(const id of [18,17,19,20])if(!shown.has(id)){
      if(!messages[id])shown.add(id);
      else if(eligible[id]){shown.add(id);result=messages[id];}
    }
    return result;
  }
  const api={hint};root.OpeningBattleRules=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
