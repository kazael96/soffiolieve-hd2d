/* Isolate corrupt puzzle records without discarding a valid party or story save. */
(function(root){
 function normalize(n){
  if(!n)return;const bit=v=>v===0||v===1,bits=v=>Array.isArray(v)&&v.length===3&&v.every(bit);
  if(n.brycenPuzzle!==undefined){
   let r=n.brycenPuzzle;
   if(!r||r.version!==1||!bits(r.states)||!bits(r.switches)){const states=[0,1,2].map(i=>n.vars?.[16385+i]===1?1:0);r={version:1,states,switches:[...states]};n.brycenPuzzleRecovered=true;}
   const t=r.task,good=t&&n.zone===114&&['platform','switch'].includes(t.kind)&&Number.isInteger(t.index)&&t.index>=0&&t.index<3&&bit(t.start)&&t.start===r.states[t.index]&&Number.isInteger(t.frame)&&t.frame>=0&&t.frame<(t.kind==='switch'?10:60)&&Number.isFinite(t.fraction)&&t.fraction>=0&&t.fraction<1;
   n.brycenPuzzle={version:1,states:[...r.states],switches:[...r.switches],...(good?{task:{kind:t.kind,index:t.index,start:t.start,frame:t.frame,fraction:t.fraction}}:{})};
  }
  if(n.brycenIceRide){const r=n.brycenIceRide;if(n.zone!==114||r.version!==1||typeof r.key!=='string'||!/^gate:[0-7]$|^auto:(6|17|34)$/.test(r.key)||!Number.isInteger(r.line)||r.line<0||r.line>40||!Number.isFinite(r.front)||r.front<0||r.front>64||!['align','travel'].includes(r.phase)||![r.x,r.y,r.height].every(v=>Number.isFinite(v)&&Math.abs(v)<4096))delete n.brycenIceRide;}
  if(n.zone!==114)delete n.brycenIceSlide;
 }
 const api={normalize};root.OpelucidGymSave=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
