/* IRBI storage rules. Presentation, persistence and record conversion are host-owned. */
(function(root){
 'use strict';
 const BOXES=24,SLOTS=30;
 const fresh=()=>({version:1,unlocked:8,current:0,boxes:Array.from({length:BOXES},()=>Array(SLOTS).fill(null))});
 function normalize(raw,clean=p=>structuredClone(p)){
  const result=fresh();if(!raw||raw.version!==1)return result;
  result.unlocked=[8,16,24].includes(raw.unlocked)?raw.unlocked:8;
  result.current=Number.isInteger(raw.current)&&raw.current>=0&&raw.current<result.unlocked?raw.current:0;
  for(let b=0;b<BOXES;b++)for(let s=0;s<SLOTS;s++){const p=raw.boxes?.[b]?.[s];if(p&&typeof p==='object')result.boxes[b][s]=clean(p)||null;}
  // Never hide valid records from a damaged unlocked count.
  if(result.boxes.slice(16).some(b=>b.some(Boolean)))result.unlocked=24;
  else if(result.boxes.slice(8).some(b=>b.some(Boolean)))result.unlocked=Math.max(16,result.unlocked);
  return result;
 }
 function create(state,{toBox,toParty,isMail=()=>false,isUsable=p=>!!p&&!p.egg&&p.hp>0,allowed=()=>true}={}){
  const data=()=>state.storage??(state.storage=fresh()),usable=isUsable;
  const location=p=>!!p&&(p.party===true?Number.isInteger(p.slot)&&p.slot>=0&&p.slot<=state.party.length&&p.slot<6:Number.isInteger(p.box)&&p.box>=0&&p.box<data().unlocked&&Number.isInteger(p.slot)&&p.slot>=0&&p.slot<SLOTS);
  const get=p=>p.party===true?state.party[p.slot]||null:data().boxes[p.box][p.slot];
  function enter(){const d=data();if(d.unlocked<BOXES&&d.boxes.slice(0,d.unlocked).every(b=>b.some(Boolean)))d.unlocked+=8;return d;}
  function space(){const d=data(),order=[...Array.from({length:d.unlocked},(_,i)=>(d.current+i)%d.unlocked),...Array.from({length:BOXES-d.unlocked},(_,i)=>d.unlocked+i)];for(const box of order)for(let slot=0;slot<SLOTS;slot++)if(!d.boxes[box][slot])return {box,slot};return null;}
  function move(from,to){
   if(!allowed())return {ok:false,reason:'busy'};
   if(to?.party===true&&to.slot===state.party.length&&state.party.length>=6)return {ok:false,reason:'partyFull'};
   if(!location(from)||!location(to))return {ok:false,reason:'location'};
   if(from.party===to.party&&from.box===to.box&&from.slot===to.slot)return {ok:false,reason:'same'};
   const a=get(from),b=get(to);if(!a)return {ok:false,reason:'empty'};
   if(from.party===true&&to.party===true){[state.party[from.slot],state.party[to.slot]]=[b,a];state.party=state.party.filter(Boolean);return {ok:true};}
   if(from.party===true||to.party===true){
    const outgoing=from.party===true?a:b,incoming=from.party===true?b:a,slot=from.party===true?from.slot:to.slot;
    if(outgoing&&isMail(outgoing.heldItem))return {ok:false,reason:'mail'};
    const next=state.party.slice();if(incoming)next[slot]=incoming;else next.splice(slot,1);
    // A boxed incoming Pokemon is recovered by the native Box->party conversion.
    if(!incoming&&!next.some(usable))return {ok:false,reason:'last'};
    if(next.length>6)return {ok:false,reason:'partyFull'};
   }
   // Convert both records before writing either destination: exceptions cannot
   // leave a half-swap or a duplicated Pokemon in the persistent state.
   const convert=(p,source,dest)=>!p?null:source.party===true&&dest.party!==true?toBox(structuredClone(p)):source.party!==true&&dest.party===true?toParty(structuredClone(p)):structuredClone(p);
   const moved=convert(a,from,to),returned=convert(b,to,from);
   if(from.party===true||to.party===true){const next=state.party.slice(),at=from.party===true?from:to,p=from.party===true?returned:moved;if(p)next[at.slot]=p;else next.splice(at.slot,1);if(!next.some(usable))return {ok:false,reason:'last'};}
   const write=(at,p)=>{if(at.party===true)state.party[at.slot]=p;else data().boxes[at.box][at.slot]=p;};
   write(to,moved);write(from,returned);state.party=state.party.filter(Boolean);return {ok:true};
  }
  function capture(p){
   if(!allowed())return {ok:false,reason:'busy'};
   if(state.party.length<6){const slot=state.party.length;state.party.push(structuredClone(p));return {ok:true,party:true,slot};}
   const target=space();if(!target)return {ok:false,reason:'full'};
   const converted=toBox(structuredClone(p)),d=data();while(target.box>=d.unlocked)d.unlocked+=8;
   d.boxes[target.box][target.slot]=converted;return {ok:true,...target};
  }
  function release(at){
   if(!allowed())return {ok:false,reason:'busy'};
   if(!location(at))return {ok:false,reason:'location'};const p=get(at);
   if(!p)return {ok:false,reason:'empty'};if(p.egg)return {ok:false,reason:'egg'};if(isMail(p.heldItem))return {ok:false,reason:'mail'};
   if(at.party===true&&!state.party.some((q,i)=>i!==at.slot&&usable(q)))return {ok:false,reason:'last'};
   if(at.party===true)state.party.splice(at.slot,1);else data().boxes[at.box][at.slot]=null;return {ok:true};
  }
  return {enter,space,move,capture,release,get:at=>location(at)?get(at):null,get full(){return state.party.length>=6&&!space();}};
 }
 const api={BOXES,SLOTS,fresh,normalize,create};root.PokemonStorage=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
