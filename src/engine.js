// ROM-backed Gen V facade. Resolution lives in battle-sim.js, not here.
const SPECIES=Object.fromEntries(GEN5.species.map(p=>[p.en,{id:p.id,type:ROM_BATTLE.typeNames[p.types[0]],base:p.baseStats,abilities:p.abilities}]));
function makeMon(name,level=8,options={}){
 const p=GEN5.bySpeciesKey[name.toLowerCase().replace(/[^a-z0-9]/g,'')]||GEN5.species.find(s=>s.en===name)||GEN5.species[494];
 const stats=['hp','atk','def','spe','spa','spd'],ivs=Object.fromEntries(stats.map(k=>[k,options.ivs?.[k]??15])),evs=Object.fromEntries(stats.map(k=>[k,options.evs?.[k]??0]));
 const nature=GEN5.dex.natures.get(options.nature||'Serious'),abilityId=options.abilityId||p.abilities[0];
 const value=key=>{const base=Math.floor((2*p.baseStats[key]+ivs[key]+Math.floor(evs[key]/4))*level/100);if(key==='hp')return base+level+10;return Math.floor((base+5)*(nature.plus===key?110:nature.minus===key?90:100)/100);};
 const learned=options.moves||options.pp?.map(m=>m.id)||p.learnset.filter(m=>m.level<=level).map(m=>m.id).filter((id,i,a)=>a.lastIndexOf(id)===i).slice(-4),moves=learned.map(id=>GEN5.moves.find(m=>m.id===id)).filter(Boolean);
 return {name:p.en,nickname:options.nickname||'',spriteId:p.id,level,max:value('hp'),hp:value('hp'),stats:Object.fromEntries(stats.map(k=>[k,value(k)])),ivs,evs,nature:nature.name,gender:options.gender||'M',happiness:options.happiness??70,type:p.types.map(t=>ROM_BATTLE.typeNames[t]).join('/'),ability:ROM_BATTLE.abilities[abilityId],abilityId,status:'',stage:{},moves:moves.map(m=>({...m,left:m.pp,cat:['Stato','Fisica','Speciale'][m.category]}))};
}
function newStoryMon(name,level,random=Math.random){
 const p=GEN5.species.find(s=>s.en===name),natures=GEN5.dex.natures.all();
 const ivs=Object.fromEntries(['hp','atk','def','spe','spa','spd'].map(k=>[k,Math.floor(random()*32)]));
 const gender=p.genderRatio===255?'N':p.genderRatio===254?'F':p.genderRatio===0?'M':Math.floor(random()*256)<p.genderRatio?'F':'M';
 return makeMon(name,level,{ivs,gender,nature:natures[Math.floor(random()*natures.length)].name,abilityId:p.abilities[Math.floor(random()*2)]});
}
// The initial rivals use only AI flag 4 (IRBI a/1/7/1, member 4).
// Score each available move; break ties randomly, as in the original routine.
function openingMoveScores(moves,turn,hp,maxhp,random){
 const percent=Math.floor(hp*100/maxhp);
 return moves.map(move=>{
  let score=100;
  if(move.category!=='Status'){if(turn===1)score++;}
  else if(percent<=50){if(random(256)>=128)score++;if(percent<=25&&random(256)>=128)score++;}
  return score;
 });
}
function configureOpeningBattle(session,options={}){
 if(options.aiFlags!==16)return;
 const fallback=session.ai.bind(session);
 session.ai=function(side='p2'){
  const request=this.battle[side].activeRequest;
  if(!request||request.wait||request.forceSwitch)return fallback(side);
  const choices=(request.active?.[0]?.moves||[]).map((m,i)=>({m,i})).filter(x=>!x.m.disabled&&x.m.pp>0);
  if(!choices.length)return fallback(side);
  const target=this.active(side==='p2'?'p1':'p2');
  const scores=openingMoveScores(choices.map(x=>this.battle.dex.moves.get(x.m.id)),this.battle.turn,target.hp,target.maxhp,n=>this.battle.random(n));
  const best=choices.filter((x,i)=>scores[i]===Math.max(...scores));
  this.battle.choose(side,'move '+(best[this.battle.random(best.length)].i+1));
 };
}
async function runOpeningCaptureTutorial(session,view){
 const data=ORIGINAL_EVENTS.captureTutorial,player=session.active(),enemy=session.active('p2');
 const message=(key,name)=>view.message(messagePages(data.messages[key],[name]).join('\n'));
 await message('playerMove',player.species.name);await view.move(data.playerMove,'p1');
 // The cartridge demonstrates a fixed gauge change, independently of damage RNG.
 enemy.sethp(Math.floor(enemy.maxhp/data.hpDivisor));await view.refresh();
 await message('enemyMove',enemy.species.name);await view.move(data.enemyMove,'p2');
 player.boosts.def=-1;await view.refresh();await message('defenseDown',player.species.name);
 await message('advice');await view.pause(2000);await message('ball');await view.ball();
 await message('caught',enemy.species.name);session.battle.win('p1');await view.refresh();
}
