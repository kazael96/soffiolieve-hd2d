/* IRBI overlay10:021618a8. Eight ascent samples, then half a tile per tick. */
(function(root){
 const heights=[8192,16384,24576,32768,36864,40960,40960,40960,36864,32768,24576,20480,12288,8192,0,0];
 function create({state,actor,sound=()=>{}}){
  let task=null;
  function jump(id,target){
   if(task)throw Error('Un salto narrativo è già in corso');
   const n=actor(id);if(!n)throw Error('Personaggio del salto non disponibile');
   const start=[n.x,n.height||0,n.y];let resolve;
   const promise=new Promise(done=>resolve=done);
   task={zone:state().zone,n,start,target:[...target],frame:0,fraction:0,resolve};sound(1374);return promise;
  }
  function tick(dt){
   if(!task||!Number.isFinite(dt)||dt<0)return;
   if(state().zone!==task.zone){task.resolve(false);task=null;return;}
   task.fraction+=dt*30;
   while(task&&task.fraction+1e-8>=1){
    const t=task;t.fraction=Math.max(0,t.fraction-1);
    if(t.frame<8){const index=t.frame*2,f=(index+2)/15;
     t.n.x=t.start[0]+(t.target[0]-t.start[0])*f;
     t.n.y=t.start[2]+(t.target[2]-t.start[2])*f;
     t.n.height=t.start[1]+heights[index]/65536;t.frame++;
    }else if(t.n.height-.5>t.target[1])t.n.height-=.5;
    else{[t.n.x,t.n.height,t.n.y]=t.target;sound(1659);task=null;t.resolve(true);}
   }
  }
  return {jump,tick,get busy(){return !!task;}};
 }
 root.IcirrusFieldMotion={create};
})(typeof window==='undefined'?globalThis:window);
