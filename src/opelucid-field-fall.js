/* IRBI583:021b219c, task021c7614/curve021c75a8. Units:16px/tile.
 * The native task runs independently for40 field ticks, with250px of drop.
 * Keep the actor's ground support separate from its transient vertical offset.
 */
(function(root){
 function create({state,actor,ground,sound=()=>{}}){
  const tasks=new Map();
  function drop(id,point,direction){
   const body=actor(id);if(!body)throw Error('Personaggio della caduta non disponibile');
   if(tasks.has(id))throw Error('Caduta del personaggio già in corso');
   if(!Number.isFinite(point.x)||!Number.isFinite(point.y))throw Error('Destinazione della caduta non valida');
   const height=ground(point.x,point.y);if(!Number.isFinite(height))throw Error('Supporto della caduta non disponibile');
   const task={body,zone:state().zone,frame:0,fraction:0,noShadow:body.noShadow};
   Object.assign(body,{x:point.x,y:point.y,height,direction,jumpLift:250/16,noShadow:true});tasks.set(id,task);sound(1665);
  }
  function clear(id,task){delete task.body.jumpLift;if(task.noShadow===undefined)delete task.body.noShadow;else task.body.noShadow=task.noShadow;tasks.delete(id);}
  function tick(dt){if(!Number.isFinite(dt)||dt<0)return;for(const [id,task]of tasks){if(task.zone!==state().zone||actor(id)!==task.body){clear(id,task);continue;}task.fraction+=dt*30;while(task.fraction+1e-8>=1){task.fraction=Math.max(0,task.fraction-1);task.frame++;const fraction=Math.min(1,task.frame/40);task.body.jumpLift=(250-250*fraction*fraction)/16;if(task.frame>=40){clear(id,task);sound(1666);break;}}}}
  function reset(){for(const [id,task]of tasks)clear(id,task);}
  return {drop,tick,reset,busy:id=>tasks.has(id)};
 }
 root.OpelucidFieldFall={create};
})(typeof window==='undefined'?globalThis:window);
