/* IRBI shore gates and persistent travel; continuous timing is an HD-2D adaptation. */
(function(root){
 const dirs=[[0,-1],[0,1],[-1,0],[1,0]],special=row=>row&&[65,68].includes(row.behavior),water=row=>!!row&&!(row.flags&1)&&!!(row.flags&2),land=row=>!!row&&!(row.flags&3)&&row.behavior!==255;
 function create({state,hero,surface,party,occupied=()=>false,save=()=>{},music=()=>{},prepare=async()=>{},direction=()=>0}){
  let preparing=false,generation=0;
  const known=p=>!!p&&!p.egg&&p.pp?.some(m=>m.id===57);
  const mounted=()=>state().surf===true;
  const allowed=z=>![75,76,150,151,422].includes(z)&&!(z>=279&&z<=316);
  function coast(dir=direction(),landing=false){
   const n=state(),p=hero(),d=dirs[dir];if(!d||!allowed(n.zone)||landing!==mounted())return null;
   const h=n.fieldHeight??0,x=Math.floor(p.x)+.5,y=Math.floor(p.y)+.5,here=surface(n.zone,x,y,h);if(landing?!water(here):!land(here))return null;
   const front={x:x+d[0],y:y+d[1]},edge=surface(n.zone,front.x,front.y,here.height);if(!edge||edge.behavior===255)return null;
   const cells=special(edge)?2:1,to={x:x+d[0]*cells,y:y+d[1]*cells},at=surface(n.zone,to.x,to.y,here.height);
   if(!(landing?land(at):water(at))||occupied(front.x,front.y)||occupied(to.x,to.y))return null;
   return {zone:n.zone,direction:dir,from:{x:p.x,y:p.y,height:here.height},to:{...to,height:at.height},cells,landing};
  }
  function user(index){if(Number.isInteger(index))return known(party()[index])?index:-1;return party().findIndex(known);}
  async function start(index,dir=direction()){
   if(preparing||state().surfMotion||mounted()||user(index)<0)return false;
   const plan=coast(dir);if(!plan)return false;const ticket=++generation;preparing=true;
   try{await prepare();if(ticket!==generation||state().zone!==plan.zone||mounted()||user(index)<0)return false;
    const current=coast(dir);if(!current||Math.hypot(hero().x-plan.from.x,hero().y-plan.from.y)>.01)return false;
    state().bicycle=false;state().surf=true;state().surfMotion={...plan,phase:'wait',wait:0,travel:0};music();save();return true;
   }finally{if(ticket===generation)preparing=false;}
  }
  function tryLanding(dx,dy){if(!mounted())return false;if(state().surfMotion||preparing)return true;
   const dir=Math.abs(dx)>Math.abs(dy)?dx>0?3:2:dy>0?1:0,plan=coast(dir,true);if(!plan)return false;
   state().surfMotion={...plan,phase:'move',wait:16,travel:0};save();return true;
  }
  function tick(dt){const n=state(),r=n.surfMotion;if(!r)return;
   if(r.zone!==n.zone){delete n.surfMotion;n.surf=false;music();return;}
   if(r.phase==='wait'){r.wait+=dt*60;if(r.wait<16)return;r.phase='move';save();return;}
   r.travel=Math.min(1,r.travel+dt*4/Math.max(1,r.cells));const p=hero();p.x=r.from.x+(r.to.x-r.from.x)*r.travel;p.y=r.from.y+(r.to.y-r.from.y)*r.travel;n.fieldHeight=r.from.height+(r.to.height-r.from.height)*r.travel;
   if(r.travel===1){n.fieldHeight=r.to.height;if(r.landing)n.surf=false;delete n.surfMotion;music();save();}
  }
  function blocked(x,y){const n=state(),at=surface(n.zone,x,y,n.fieldHeight??0);if(!at)return null;if(at.flags&1||at.behavior===255)return true;return mounted()?!water(at):!!(at.flags&2);}
  function cancel(){generation++;preparing=false;const n=state(),r=n.surfMotion;if(r&&r.zone===n.zone){Object.assign(hero(),{x:r.from.x,y:r.from.y});n.fieldHeight=r.from.height;n.surf=!!r.landing;}delete n.surfMotion;music();}
  function restore(){const n=state(),r=n.surfMotion;if(r){const valid=r.zone===n.zone&&dirs[r.direction]&&[1,2].includes(r.cells)&&['wait','move'].includes(r.phase)&&Number.isFinite(r.wait)&&r.wait>=0&&r.wait<=60&&Number.isFinite(r.travel)&&r.travel>=0&&r.travel<=1&&[r.from,r.to].every(p=>p&&[p.x,p.y,p.height].every(v=>Number.isFinite(v)&&Math.abs(v)<4096));if(!valid){delete n.surfMotion;return false;}}
   if(!r&&mounted()&&!water(surface(n.zone,hero().x,hero().y,n.fieldHeight??0)))n.surf=false;return !!r||mounted();
  }
  return {known,user,coast,start,tryLanding,tick,blocked,cancel,restore,mounted,get preparing(){return preparing;},get busy(){return preparing||!!state().surfMotion;}};
 }
 root.SurfFieldMotion={create,water,land};
})(typeof window==='undefined'?globalThis:window);
