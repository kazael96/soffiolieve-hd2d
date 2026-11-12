/* Gen V field/battle medicines unlocked in the playable chapter. */
(function(root){
 const healing={17:20,25:200,26:50,30:50,155:10},ids=[17,18,19,20,21,22,23,24,25,26,27,28,29,30,38,57,58,60,150,155,158,591];
 function canUse(id,p){if(!p)return false;const max=p.maxhp??p.max;if(id===28||id===29)return p.hp===0;if(!p.hp)return false;if(id===23)return p.hp<max||!!p.status||!!p.volatiles?.confusion;if(id===24)return p.hp<max;return id===38?(p.moveSlots||p.moves||[]).some(m=>(m.pp??m.left)<(m.maxpp??m.maxPP??0)):id===57||id===58||id===60?!!(p.isActive??p.active)&&(p.boosts?.[id===60?'accuracy':id===57?'atk':'def']??0)<6:id===158?p.hp<max:healing[id]?p.hp<max:id===18?['psn','tox'].includes(p.status):id===19?p.status==='brn':id===20?p.status==='frz':id===21||id===150?p.status==='slp':id===22?p.status==='par':id===27||id===591?!!p.status||!!p.volatiles?.confusion:false;}
 function apply(battle,id,p){if(!canUse(id,p))return false;if(id===28){p.fainted=false;p.faintQueued=false;p.side.pokemonLeft++;p.hp=Math.max(1,Math.floor(p.maxhp/2));battle.add('-heal',p,p.getHealth,'[from] item: Revitalizzante');}else if(healing[id]){p.sethp(Math.min(p.maxhp,p.hp+healing[id]));battle.add('-heal',p,p.getHealth,'[from] item: '+({17:'Pozione',25:'Iperpozione',26:'Superpozione',30:'Acqua Fresca',155:'Baccarancia'})[id]);}else{p.cureStatus();if(id===27||id===591)p.removeVolatile?.('confusion');}battle.eachEvent('Update');return true;}
 const originalApply=apply;
 function use(battle,id,p,moveIndex){
  if(!canUse(id,p))return false;
  if(id===23||id===24){
   if(p.hp<p.maxhp){p.sethp(p.maxhp);battle.add('-heal',p,p.getHealth,'[from] item: '+(id===23?'Ricarica Tot':'Pozione Max'));}
   if(id===23){p.cureStatus();p.removeVolatile?.('confusion');}
   battle.eachEvent('Update');return true;
  }
  if(id===29){p.fainted=false;p.faintQueued=false;p.side.pokemonLeft++;p.hp=p.maxhp;p.cureStatus();p.removeVolatile?.('confusion');battle.add('-heal',p,p.getHealth,'[from] item: Revital. Max');battle.eachEvent('Update');return true;}
  if(id===38){const move=p.moveSlots[moveIndex];if(!move||move.pp>=move.maxpp)return false;move.pp=Math.min(move.maxpp,move.pp+10);battle.add('-message','Sono stati restituiti PP a '+p.name+'.');return true;}
  if(id===158){p.sethp(Math.min(p.maxhp,p.hp+Math.max(1,Math.floor(p.maxhp/4))));battle.add('-heal',p,p.getHealth,'[from] item: Baccacedro');battle.eachEvent('Update');return true;}
  if(id===60){battle.boost({accuracy:1},p,p,null,true);return true;}
  if(id===57||id===58){battle.boost({[id===57?"atk":"def"]:1},p,p,null,true);return true;}
  return originalApply(battle,id,p);
 }
 const api={ids,canUse,apply:use};root.BattleMedicine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
