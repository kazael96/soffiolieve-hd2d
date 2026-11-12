/* Original overlay56 controls are nine sound gates, not model transforms.
 * Call advance with the shared native30Hz task clock; never wall-clock audio timers. */
(function(root){
 function create({room,play,stop}){
  if(!room||!Number.isInteger(room.frames)||room.frames<=0||!Array.isArray(room.events)||typeof play!=='function'||typeof stop!=='function')throw Error('Tracciato sonoro della Lega non disponibile');
  let previous=-1;
  for(const event of room.events){if(!Number.isInteger(event.frame)||event.frame<0||event.frame>=room.frames||event.frame<previous||!Number.isInteger(event.id)||event.id<1000||event.id>2500||!['play','stop'].includes(event.action))throw Error('Comando sonoro della Lega non valido');previous=event.frame;}
  let frame=-1,cursor=0,closed=false;const owned=new Set();
  function advance(next){
   if(!Number.isFinite(next)||next<0||next<frame)throw Error('Tempo sonoro della Lega non valido');
   if(closed)return false;
   const target=Math.min(room.frames-1,Math.floor(next));
   while(cursor<room.events.length&&room.events[cursor].frame<=target){
    const event=room.events[cursor++];
    if(event.action==='play'){owned.add(event.id);play(event.id,event);}else{owned.delete(event.id);stop(event.id,event);}
   }
   frame=next;return true;
  }
  function cancel(){if(closed)return false;closed=true;for(const id of owned)stop(id,{action:'cancel',frame:Math.max(0,frame)});owned.clear();return true;}
  return {advance,cancel,get frame(){return frame;},get finished(){return cursor===room.events.length;}};
 }
 const api={create};root.FinaleEliteSound=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
