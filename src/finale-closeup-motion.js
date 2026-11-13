/* IRBI overlay82:021f5628/021f5720. Original BG3 eye/mouth tile cycles.
 * Native delay is decremented on its own updates; a delay2 means three ticks
 * between tile replacements. 469 restarts speech, without rewinding its pose.
 */
(function(root){
 function create({speed=2,random=Math.random}={}){
  if(![1,2,3].includes(speed))throw Error('Velocità del testo non valida');
  const eye={done:true,index:0,delay:0,interval:2,frame:0},mouth={done:true,index:0,delay:0,interval:4-speed,frame:0};let blink=0,frames=0,armed=true,speaking=false,printing=null;
  function cycle(state,sequence){if(state.delay){state.delay--;return;}if(state.index===0&&state.done)return;state.frame=sequence[state.index++];state.delay=state.interval;if(state.index===sequence.length){state.index=0;state.done=true;}}
  function restart(){armed=true;speaking=false;printing=null;}
  function message(printer){printing=printer;}
  function tick(){
   frames++;
   if(printing){if(!printing.done){mouth.done=false;armed=false;speaking=true;}else if(!armed)speaking=false;}
   cycle(mouth,[1,2,1,0]);
   if(!blink){eye.done=false;blink=80+Math.min(19,Math.max(0,Math.floor(random()*20)));}else blink--;
   cycle(eye,[0,1,2,1,0]);
  }
  return {restart,message,tick,get snapshot(){return {eyes:eye.frame,mouth:mouth.frame,frames,blink,speaking,armed,mouthCycleComplete:mouth.done};}};
 }
 const api={create};root.FinaleCloseupMotion=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
