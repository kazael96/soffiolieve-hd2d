/* Native Gym114 curves/connectivity with explicit HD-2D travel speed. */
(function(root){
 function create({routes=root.OPELUCID_GYM_ROUTES,table=root.OPELUCID_RAILS?.[114],rails=root.NativeRails,puzzle,state=()=>root.NativeStory?.state,hero=()=>player,speed=3.75,resetInput=()=>{},save=()=>{}}={}){
  if(!routes||!table||!rails||!puzzle||!Number.isFinite(speed)||speed<=0)throw Error('Percorsi di ghiaccio non disponibili');
  let ride=null,resolve=null,promise=null;
  const routeFor=key=>key.startsWith('gate:')?routes.entries.find(r=>'gate:'+r.gate===key):routes.automatic.find(r=>'auto:'+r.line===key);
  const point=(line,front)=>{const p=rails.position(114,line,front);return {x:p.x-16,y:p.z-16,height:p.height};};
  function place(p){const h=hero(),n=state();h.x=p.x;h.y=p.y;n.fieldHeight=p.height;}
  function persist(){if(ride){const p=hero();state().brycenIceRide={...ride,x:p.x,y:p.y,height:state().fieldHeight??0};}}
  function finish(ok){ride=null;const n=state();if(n)delete n.brycenIceRide;const done=resolve;resolve=null;promise=null;resetInput();save();done?.(ok);}
  function joined(){if(!promise)promise=new Promise(done=>resolve=done);return promise;}
  function start(route,key,direction){
   if(state()?.zone!==114||!route||!Number.isInteger(direction)||direction<0||direction>3)return false;
   if(ride)return ride.key===key?joined():false;
   const p=hero(),a=point(route.line,0),b=point(route.line,table.lines[route.line].length),vx=b.x-a.x,vz=b.y-a.y,length2=vx*vx+vz*vz;
   const [dx,dz]=[[0,-1],[0,1],[-1,0],[1,0]][direction];if(vx*dx+vz*dz<=0)return false;
   const front=((p.x-a.x)*vx+(p.y-a.y)*vz)/length2*table.lines[route.line].length,target=point(route.line,front);
   if(!Number.isFinite(front)||front<0||front>table.lines[route.line].length||Math.hypot(p.x-target.x,p.y-target.y)>.51||Math.abs((state().fieldHeight??0)-target.height)>.25)return false;
   // Directional scripts fire on entering their tile, not only at its center.
   if(key.startsWith('gate:')&&Math.abs(front-route.front)>.51)return false;
   if(key.startsWith('auto:')&&front>.51)return false;
   ride={version:1,key,line:route.line,front,phase:'align'};persist();resetInput();save();return joined();
  }
  function startGate(index,mode,direction){const route=routes.entries.find(r=>r.gate===index);if(!route||direction!==route.direction||!puzzle.gate(index,mode))return false;return start(route,'gate:'+index,direction);}
  function startAutomatic(line,direction){return start(routes.automatic.find(r=>r.line===line),'auto:'+line,direction);}
  function restore(){
   const n=state(),r=n?.brycenIceRide;if(!r||ride)return !!ride;
   const route=typeof r.key==='string'&&routeFor(r.key),line=route&&table.lines[r.line],p=hero();
   const valid=n.zone===114&&r.version===1&&route?.lines.includes(r.line)&&line&&Number.isFinite(r.front)&&r.front>=0&&r.front<=line.length&&['align','travel'].includes(r.phase)&&[r.x,r.y,r.height].every(Number.isFinite)&&Math.hypot(p.x-r.x,p.y-r.y)<.001&&Math.abs((n.fieldHeight??0)-r.height)<.001;
   if(!valid){delete n.brycenIceRide;resetInput();return false;}
   const target=point(r.line,r.front);
   if(Math.hypot(p.x-target.x,p.y-target.y)>(r.phase==='align'?.51:.001)||Math.abs(r.height-target.height)>.001){delete n.brycenIceRide;resetInput();return false;}
   ride={version:1,key:r.key,line:r.line,front:r.front,phase:r.phase};resetInput();return true;
  }
  function tick(dt){
   if(!Number.isFinite(dt)||dt<0||dt>60)return false;if(!ride)restore();if(!ride)return false;if(state()?.zone!==114){finish(false);return false;}
   let budget=dt*speed,moved=false,guard=0;
   while(ride&&budget>1e-9&&guard++<128){
    const target=point(ride.line,ride.front),p=hero();
    if(ride.phase==='align'){
     const d=Math.hypot(p.x-target.x,p.y-target.y);if(d>1e-8){const distance=Math.min(budget,d);place({x:p.x+(target.x-p.x)*distance/d,y:p.y+(target.y-p.y)*distance/d,height:target.height});budget-=distance;moved=true;if(distance<d)break;}
     ride.phase='travel';continue;
    }
    const remaining=table.lines[ride.line].length-ride.front,travel=Math.min(budget,remaining);ride.front+=travel;budget-=travel;place(point(ride.line,ride.front));moved||=travel>0;
    if(travel+1e-8<remaining)break;
    const route=routeFor(ride.key),next=route.lines[route.lines.indexOf(ride.line)+1];if(next===undefined){finish(true);break;}ride.line=next;ride.front=0;
   }
   if(guard>=128)throw Error('Percorso di ghiaccio non convergente');if(ride)persist();return moved;
  }
  return {startGate,startAutomatic,tick,restore,cancel:()=>finish(false),wait:()=>ride?joined():Promise.resolve(false),get busy(){return !!ride;},get snapshot(){return ride?{...ride}:null;}};
 }
 const api={create};root.OpelucidIceRails=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
