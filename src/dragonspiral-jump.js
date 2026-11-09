/* One-way native ramp markers; airborne arc and continuous timing are HD-2D. */
(function(root){
 const length=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.height||0)-(b.height||0));
 function normalize(n){const r=n?.dragonspiralJump;if(!r)return;const good=n.zone===211&&r.zone===211&&[17,32,45].includes(r.line)&&r.row===(r.line===45?2:1)&&Number.isFinite(r.distance)&&r.distance>=0&&r.distance<20&&r.origin&&[r.origin.x,r.origin.y,r.origin.height].every(v=>Number.isFinite(v)&&Math.abs(v)<512);if(!good)delete n.dragonspiralJump;}
 function create(options={}){
  const state=options.state||(()=>root.NativeStory?.state),hero=options.hero||(()=>player),save=options.save||(()=>root.Journey?.save(true)),face=options.face||(d=>{facing=d*3;}),reset=options.resetInput||(()=>{if(typeof resetInput==='function')resetInput();});let current=null;
  function points(r){const jump=root.NativeRailPaths.jumpLinks(211).find(j=>j.line===r.line&&j.row===r.row);if(!jump||length(r.origin,jump.from)>.65)return null;return [{...r.origin,jumpLift:0},{...jump.from,jumpLift:0},...jump.path];}
  function pose(r,path){let remaining=r.distance,p=path[0];for(let i=1;i<path.length;i++){const next=path[i],size=length(p,next);if(remaining<=size&&size>1e-8){const f=remaining/size,body=hero();body.x=p.x+(next.x-p.x)*f;body.y=p.y+(next.y-p.y)*f;body.jumpLift=(p.jumpLift||0)+((next.jumpLift||0)-(p.jumpLift||0))*f;state().fieldHeight=p.height+(next.height-p.height)*f;const dx=next.x-p.x,dy=next.y-p.y;if(Math.hypot(dx,dy)>1e-8)face(Math.abs(dx)>Math.abs(dy)?dx>0?3:2:dy>0?1:0);return false;}remaining-=size;p=next;}
   Object.assign(hero(),{x:p.x,y:p.y});delete hero().jumpLift;state().fieldHeight=p.height;return true;
  }
  function restore(){const n=state();normalize(n);current=null;if(!n?.dragonspiralJump){delete hero().jumpLift;return false;}const path=points(n.dragonspiralJump);if(!path||n.dragonspiralJump.distance>path.reduce((sum,p,i)=>sum+(i?length(path[i-1],p):0),0)){delete n.dragonspiralJump;delete hero().jumpLift;return false;}current={record:n.dragonspiralJump,path};pose(current.record,path);return true;}
  function tryStep(dx,dy){const n=state();if(n?.zone!==211)return false;if(n.dragonspiralJump)return true;const p=hero(),magnitude=Math.hypot(dx,dy);if(!magnitude)return false;
   for(const jump of root.NativeRailPaths.jumpLinks(211)){if(length({...p,height:n.fieldHeight||0},jump.from)>.6)continue;const next=jump.path[0],vx=next.x-jump.from.x,vy=next.y-jump.from.y;if((dx*vx+dy*vy)/(magnitude*Math.hypot(vx,vy))<.65)continue;if((options.occupied||root.NativeStory?.occupied)?.(jump.to.x,jump.to.y))continue;
    const record={zone:211,line:jump.line,row:jump.row,distance:0,origin:{x:p.x,y:p.y,height:n.fieldHeight||0}},path=points(record);if(!path)continue;
    // The short alignment to the ramp must remain on its actual floor.
    if(![.25,.5,.75].every(f=>root.NativeRails.locate(211,p.x+(jump.from.x-p.x)*f,p.y+(jump.from.y-p.y)*f,{height:n.fieldHeight||0})))continue;
    n.dragonspiralJump=record;current={record,path};reset();save();return true;
   }return false;
  }
  function tick(dt){const n=state();if(n?.zone!==211){if(n)delete n.dragonspiralJump;current=null;delete hero().jumpLift;return;}if(!n.dragonspiralJump)return;if(current?.record!==n.dragonspiralJump&&!restore())return;if(!Number.isFinite(dt)||dt<=0)return;current.record.distance+=Math.min(dt,.1)*3.5;if(pose(current.record,current.path)){delete n.dragonspiralJump;current=null;save();}}
  return {tryStep,tick,restore,enter:()=>restore(),normalize,heightAt:(x,y)=>state()?.dragonspiralJump&&Math.hypot(x-hero().x,y-hero().y)<.001?state().fieldHeight:null,get busy(){return state()?.zone===211&&!!state()?.dragonspiralJump;}};
 }
 const api={create,normalize};Object.defineProperties(api,Object.getOwnPropertyDescriptors(create()));root.DragonspiralJump=api;
})(typeof window==='undefined'?globalThis:window);
