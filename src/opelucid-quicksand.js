/* IRBI193 and terrain124: special centre/fast-movement trigger, not a door.
 * Native pull60/120 ticks and sink34 ticks. Continuous field movement adds
 * up to4 alignment ticks when already inside the centre cell but off-centre.
 */
(function(root){
 const zones=[160,161,162,163,164];
 function trigger(zone,record,position,{behavior,running=false,mounted=false}={}){
  if(!zones.includes(zone)||behavior!==124)return null;
  if(record.rail||record.type!==0||record.var!==16384||record.value!==0)return false;
  const x=Math.floor(position.x+16),z=Math.floor(position.y+16);
  if(x<record.x||x>=record.x+record.width||z<record.z||z>=record.z+record.height)return false;
  return x===record.x+Math.floor(record.width/2)&&z===record.z+Math.floor(record.height/2)||running||mounted;
 }
 function create({state,hero,ground}){
  let task=null,held=null;
  function begin(kind,target,frames){if(task||held)throw Error('Sabbie mobili già in movimento');const body=hero();let resolve;const promise=new Promise(done=>resolve=done);task={kind,body,zone:state().zone,start:{x:body.x,y:body.y},target,frames,elapsed:0,noShadow:body.noShadow,resolve};return promise;}
  function pull(target){if(!Number.isFinite(target?.x)||!Number.isFinite(target?.y))throw Error('Centro delle sabbie mobili non valido');const body=hero(),dx=Math.abs(Math.floor(body.x+16)-Math.floor(target.x+16)),dy=Math.abs(Math.floor(body.y+16)-Math.floor(target.y+16));const frames=dx===0&&dy===0?(Math.hypot(body.x-target.x,body.y-target.y)<.001?0:4):dx<2&&dy<2?60:120;if(!frames)return Promise.resolve(true);return begin('pull',{...target},frames);}
  function sink(){return begin('sink',null,34);}
  function restore(current){delete current.body.jumpLift;if(current.noShadow===undefined)delete current.body.noShadow;else current.body.noShadow=current.noShadow;}
  function finish(ok){if(!task)return;const current=task;task=null;if(current.kind==='sink'){if(ok)held=current;else restore(current);}current.resolve(ok);}
  function tick(dt){if(!task||!Number.isFinite(dt)||dt<0)return;if(task.zone!==state().zone||task.body!==hero()){finish(false);return;}const current=task;current.elapsed=Math.min(current.frames,current.elapsed+dt*30);const f=current.elapsed/current.frames;
   if(current.kind==='pull'){current.body.x=current.start.x+(current.target.x-current.start.x)*f;current.body.y=current.start.y+(current.target.y-current.start.y)*f;const h=ground(current.body.x,current.body.y);if(Number.isFinite(h))current.body.height=h;}
   else{current.body.jumpLift=-1.875*f;current.body.noShadow=true;}
   if(f===1)finish(true);
  }
  function reset(){finish(false);if(held){restore(held);held=null;}}
  return {pull,sink,tick,reset,get busy(){return !!task;}};
 }
 root.OpelucidQuicksand={zones,trigger,create};
})(typeof window==='undefined'?globalThis:window);
