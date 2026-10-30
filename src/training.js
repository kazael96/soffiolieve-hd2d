/* Shared level policy. Browser I/O, menus and animations belong to Journey. */
(function(root){
 const data=()=>root.TRAINING_DATA;
 function limit(){return data()?.levelCap||15;}
 function cap(p){return Math.min(100,Math.max(limit(),p.level));}
 function xp(p,amount,growth){
  const before=Math.max(0,Number.isFinite(p.xp)?Math.floor(p.xp):0);
  // Old saves can exceed the demo's limit: never lower their level or XP.
  const ceiling=Math.max(before,growth[cap(p)]);
  const total=Math.min(ceiling,before+Math.max(0,Math.floor(amount)||0));
  return {total,earned:total-before};
 }
 function evolution(p,{allowFriendship=true,time='day'}={}){
  if(p.heldItem===229)return null; // Pietrastante / Everstone.
  return (data()?.evolutions[p.name]||[]).find(e=>
   e.method===4&&p.level>=e.parameter||allowFriendship&&(p.happiness??70)>=220&&
   (e.method===1||e.method===2&&time==='day'||e.method===3&&time==='night'))||null;
 }
 function ability(p,target){
  const from=data()?.progression[p.name]?.abilities,to=data()?.progression[target]?.abilities;
  if(!from||!to)throw Error('Dati abilità mancanti per l’evoluzione di '+p.name);
  const slot=from.indexOf(p.abilityId??from[0]);
  if(slot<0)throw Error('Abilità non valida per '+p.name);
  return to[slot]||to[0];
 }
 function starterFamily(name,starter){return name===starter||
  ({Snivy:['Servine'],Tepig:['Pignite'],Oshawott:['Dewott']}[starter]||[]).includes(name);}
 function moves(name,visited=new Set()){
  if(visited.has(name))return [];visited.add(name);
  const d=data(),p=d?.progression[name];if(!p)return [];
  const out=new Set(p.moves.map(m=>m.id));out.add(165);
  for(const id of d.compatibility[name]||[])if(d.machines[id])out.add(d.machines[id]);
  // Retained pre-evolution moves remain legal even if the evolution learns them later.
  for(const [from,entries]of Object.entries(d.evolutions))if(entries.some(e=>e.target===name&&
   (e.method===4&&e.parameter<=limit()||[1,2,3,8].includes(e.method)))){
   for(const id of moves(from,visited))out.add(id);
  }
  return [...out];
 }
 const api={limit,cap,xp,evolution,ability,starterFamily,moves};root.Training=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
