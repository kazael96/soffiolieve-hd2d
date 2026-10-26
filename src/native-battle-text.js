/* IRBI narrative selection from simulator events; simulation remains authoritative. */
(function(root){
 const species=actor=>String(actor||'').replace(/^p[12][a-z]?:\s*/,''),side=(actor,trainer)=>/^p1/.test(actor)?0:trainer?2:1;
 function message(e,context={},fallback=()=>null){
  const a=context.catalog||root.BATTLE_NARRATIVE,trainer=!!context.trainer;if(!a)return fallback(e.line);
  const words=[species(e.actor)],s=side(e.actor,trainer),get=(ref,args=words,index=s)=>ref?NativeTextLayout.format(a.banks[ref.bank][ref.message??ref.base+index],args):undefined;
  const event=(key,args=words,index=s)=>get(a.events[key],args,index),status={psn:'poison',tox:'toxic',brn:'burn',par:'paralysis',frz:'freeze',slp:'sleep'};
  switch(e.kind){
   case 'turn':case 'upkeep':case 'start':case 'player':case 'teamsize':case 'gametype':case 'gen':case 'tier':case 'seed':case 'rule':return null;
   case 'move':{const id=context.moveId?.(e.args[0]);return id?NativeTextLayout.format(a.banks[13][id*3+s],words):fallback(e.line);}
   case 'faint':return event('faint');
   case '-boost':case '-unboost':{const n=Number(e.args[1]),family=n===0?(e.kind==='-boost'?'max':'min'):(e.kind==='-boost'?'+':'-')+Math.min(3,Math.abs(n));return get(a.stats[family]?.[e.args[0]])??fallback(e.line);}
   case '-supereffective':return event('superEffective');
   case '-resisted':return event('notVeryEffective');
   case '-crit':return event('critical');
   case '-immune':return event('immune');
   case '-miss':return event('miss',[species(e.args[0]||e.actor)],side(e.args[0]||e.actor,trainer));
   case '-fail':if(['boost','unboost'].includes(e.args[0]))return get(a.stats[e.args[0]==='boost'?'max':'min']?.[e.args[1]])??event('failed');if(status[e.args[0]])return event((e.args[0]==='tox'?'poison':status[e.args[0]])+'Already')??event('failed');return event('failed');
   case '-nothing':return event('nothingHappened');
   case '-notarget':return event('failed');
   case '-status':return event(status[e.args[0]])??fallback(e.line);
   case '-curestatus':return event((e.args[0]==='tox'?'poison':status[e.args[0]])+'Cured')??fallback(e.line);
   case '-cureteam':return event('statusCured');
   case '-start':if(e.args[0]==='confusion')return event('confusion');if(e.args[0]==='Attract')return event('infatuation');break;
   case '-end':if(e.args.includes('[silent]'))return null;if(e.args[0]==='confusion')return event('confusionCured');if(e.args[0]==='Attract')return event('infatuationCured');break;
   case 'cant':return event(({par:'paralysisCantMove',slp:'sleepCantMove',frz:'freezeCantMove',flinch:'flinch',Attract:'infatuationCantMove',nopp:'noPp'})[e.args[0]])??fallback(e.line);
   case '-activate':if(e.args[0]==='confusion')return event('confusionActive');break;
   case '-damage':{const from=e.args.find(v=>v.startsWith('[from] '));const key=({'[from] psn':'poisonDamage','[from] brn':'burnDamage','[from] confusion':'confusionSelfHit','[from] recoil':'recoil','[from] Sandstorm':'sandDamage','[from] Hail':'hailDamage'})[from];return key?event(key):null;}
   case '-heal':return event('heal');
   case 'switch':case 'drag':return s===0?event('sendOut'):trainer?event('trainerSendOut',[context.rival||'Allenatore',words[0]]):event('wildEncounter');
   case 'win':return e.actor===(context.playerId||'Alcide')?(trainer?event('winTrainer',[context.rival||'Allenatore']):null):event('lose',[context.playerName||'Alcide']);
   case 'message':if(/^Pozione:/.test(e.actor))return null;break;
  }
  return fallback(e.line);
 }
 root.NativeBattleText={message};if(typeof module!=='undefined')module.exports={message};
})(typeof window!=='undefined'?window:globalThis);
