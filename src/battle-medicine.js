/* Gen V field/battle medicines unlocked in the playable chapter. */
(function(root){
 const healing={17:20,25:200,26:50,30:50,155:10},ids=[17,18,21,22,25,26,27,28,30,150,155];
 function canUse(id,p){if(!p)return false;const max=p.maxhp??p.max;return id===28?p.hp===0:!!p.hp&&(healing[id]?p.hp<max:id===18?['psn','tox'].includes(p.status):id===21||id===150?p.status==='slp':id===22?p.status==='par':id===27?!!p.status:false);}
 function apply(battle,id,p){if(!canUse(id,p))return false;if(id===28){p.fainted=false;p.faintQueued=false;p.side.pokemonLeft++;p.hp=Math.max(1,Math.floor(p.maxhp/2));battle.add('-heal',p,p.getHealth,'[from] item: Revitalizzante');}else if(healing[id]){p.sethp(Math.min(p.maxhp,p.hp+healing[id]));battle.add('-heal',p,p.getHealth,'[from] item: '+({17:'Pozione',25:'Iperpozione',26:'Superpozione',30:'Acqua Fresca',155:'Baccarancia'})[id]);}else p.cureStatus();battle.eachEvent('Update');return true;}
 const api={ids,canUse,apply};root.BattleMedicine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
