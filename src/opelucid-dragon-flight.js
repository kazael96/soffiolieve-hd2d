/* HD-2D staging for the native summit: one body, physical boarding, proved exit. */
(function(root){
 function create(options){
  let task=null,dragon=null,rider=null,attached=false,retiring=null,retired=false,proof=null,zero=0,age=0;
  const isDragon=n=>options.zone()===213&&[211,213].includes(n?.model);
  const enabled=n=>isDragon(n)&&options.presented(n);
  const smooth=f=>f*f*(3-2*f),copy=n=>({x:n.x,y:n.y,height:n.height||0});
  function animate(seconds,apply){if(task)throw Error('Movimento del drago già in corso');return new Promise((resolve,reject)=>task={seconds,apply,resolve,reject,elapsed:0});}
  function flight(n){n.nativeDragonFlight=true;n.nativeAnimationStart=options.time();n.noShadow=true;n.exitProbe=true;}
  function follow(){if(!attached||!dragon||!rider)return;Object.assign(rider,{x:dragon.x,y:dragon.y+.2,height:dragon.height+.9,noShadow:true,exitProbe:true});delete rider.jumpLift;}
  async function relocate(n,to){dragon=n;const from=copy(n);flight(n);await animate(Math.max(.4,Math.min(1.5,Math.hypot(to.x-from.x,to.y-from.y)/8)),f=>{const p=smooth(f);for(const key of ['x','y','height'])n[key]=from[key]+(to[key]-from[key])*p;});n.nativeDragonFlight=false;n.nativeAnimationStart=options.time();n.noShadow=n.height>.1;}
  async function board(n,mount){
   if(!enabled(mount))return false;dragon=mount;rider=n;retired=false;attached=false;flight(mount);
   // The native relocation puts the dragon on the right of the DS frame.
   // In the wider field it visibly returns to the central aisle to pick N up.
   const from=copy(mount),landing={x:n.x,y:n.y-4,height:.3};await animate(1,f=>{const p=smooth(f);for(const k of ['x','y','height'])mount[k]=from[k]+(landing[k]-from[k])*p;});
   const goal={x:mount.x,y:mount.y+1,height:n.height||0},path=options.path(n,goal),last=path?.at(-1)||n;
   if(!Array.isArray(path)||Math.hypot(last.x-goal.x,last.y-goal.y)>.01)throw Error('Percorso di imbarco di N non percorribile');
   for(const point of path){const start=copy(n),length=Math.hypot(point.x-n.x,point.y-n.y),dir=Math.abs(point.x-n.x)>Math.abs(point.y-n.y)?point.x>n.x?3:2:point.y>n.y?1:0;if(length<.00001)continue;await animate(length/5,(f,elapsed)=>{n.x=start.x+(point.x-start.x)*f;n.y=start.y+(point.y-start.y)*f;options.pose(n,dir,1+Math.floor(elapsed*10)%2);});}
   const start=copy(n);n.noShadow=true;await animate(.6,f=>{const p=smooth(f);n.x=start.x+(mount.x-start.x)*p;n.y=start.y+(mount.y+.2-start.y)*p;n.height=start.height+(mount.height+.9-start.height)*p;n.jumpLift=Math.sin(Math.PI*f)*.65;});
   delete n.jumpLift;options.pose(n,1);n.nativeDragonRider=true;attached=true;const base=mount.height;await animate(.6,f=>{mount.height=base+(3-base)*smooth(f);follow();});follow();return true;
  }
  function has(n){return !!rider&&(n===rider||n===dragon);}
  function depart(n){if(!has(n))return null;if(retired)return Promise.resolve(true);if(retiring)return retiring.promise;flight(dragon);rider.exitProbe=true;let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});retiring={promise,resolve,reject};age=0;zero=0;proof=null;return promise;}
  function observe(){
   if(!retiring||task||options.moving(dragon))return;const samples=[options.sample(dragon),options.sample(rider)];if(samples.some(s=>!s||typeof s.visible!=='boolean'||!Number.isFinite(s.sequence))){zero=0;return;}const stamp=samples.map(s=>s.sequence).join(':');if(stamp===proof)return;proof=stamp;zero=samples.some(s=>s.visible)?0:zero+1;
   if(zero>=2){const wait=retiring;retiring=null;retired=true;wait.resolve(true);}
  }
  function tick(dt){
   dt=Math.max(0,Math.min(.1,dt));if(task){const current=task;current.elapsed+=dt;const f=Math.min(1,current.elapsed/current.seconds);try{current.apply(f,current.elapsed);if(f===1){task=null;current.resolve();}}catch(error){task=null;current.reject(error);}}
   if(retiring){age+=dt;if(!task&&!options.moving(dragon))dragon.y+=8*dt;if(age>10){const wait=retiring;retiring=null;wait.reject(Error('Verifica della partenza di N e del drago non disponibile'));}}
   follow();
  }
  function reset(){task?.reject(Error('Movimento della vetta annullato'));retiring?.reject(Error('Partenza della vetta annullata'));task=null;retiring=null;dragon=null;rider=null;attached=false;retired=false;}
  return {isDragon,enabled,relocate,board,depart,has,observe,tick,reset,get attached(){return attached;},get retired(){return retired;}};
 }
 root.OpelucidDragonFlight={create};if(typeof module!=='undefined')module.exports={create};
})(typeof window==='undefined'?globalThis:window);
