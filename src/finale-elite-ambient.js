/* IRBI overlay56 callbacks420: animation-gated cues and work0x4001 beds.
 * Cross gates using the real automatic model clock, including skipped frames. */
(function(root){
 function create({state,controller,play,stop}){
  let current=null;
  function clear(){if(current?.bed)stop(current.bed);current=null;}
  function begin(room){
   const zone=139+room;if(!Number.isInteger(room)||room<1||room>4||state().zone!==zone)throw Error('Ambiente della Lega fuori dalla propria sala');
   if(current?.zone===zone)return true;
   clear();const key=room===1?'fn-field-False-33-115':room===4?'fn-field-False-53-123':null;
   const target=key?controller.records().find(t=>t.record.key===key):null;if(key&&!target)throw Error('Modello ambientale originale non disponibile');
   const bed=room===1?1862:room===2?1878:room===3?2031:null;
   current={zone,room,target,frame:target?.frame??0,bed:bed&&(room===1||!(state().vars[16385]||0))?bed:null};
   if(current.bed)play(current.bed);return true;
  }
  function tick(){
   const r=current;if(!r)return;if(r.zone!==state().zone){clear();return;}
   if(root.document?.hidden)return;
   if([2,3].includes(r.room)&&r.bed&&(state().vars[16385]||0)){stop(r.bed);r.bed=null;}
   if(!r.target)return;const now=r.target.frame??0;
   if(now<r.frame){r.frame=now;return;}
   const period=r.room===1?301:241,cues=r.room===1?[[6,1682]]:[[90,1859],[120,1902],[213,1859],[243,1902]];
   const pending=[];
   for(const [offset,id]of cues){let cycle=Math.max(0,Math.floor((r.frame-offset)/period)+1);for(let at=offset+cycle*period;at<=now;at+=period)pending.push({at,id});}
   pending.sort((a,b)=>a.at-b.at);for(const cue of pending)play(cue.id);r.frame=now;
  }
  return {begin,tick,clear,get snapshot(){return current;}};
 }
 const api={create};root.FinaleEliteAmbient=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
