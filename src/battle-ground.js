/* One camera/ground projection for feet, contact shadows and effect attachment. */
(function(root){
 const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0),sub=(a,b)=>a.map((v,i)=>v-b[i]),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),cache=new Map();
 function project(view,p,w,h){const d=sub(p,view.eye),depth=dot(d,view.forward);return{x:w*(.5+dot(d,view.right)/(2*view.lens[0]*depth)),y:h*(.5-dot(d,view.up)/(2*view.lens[1]*depth)),depth};}
 function groundPoint(view,x,y,w,h,elevation){const u=(2*x/w-1)*view.lens[0],v=(1-2*y/h)*view.lens[1],ray=view.forward.map((n,i)=>n+view.right[i]*u+view.up[i]*v),distance=(elevation-view.eye[1])/ray[1];if(!(distance>0))throw Error('Il punto di appoggio non interseca il terreno');return view.eye.map((n,i)=>n+ray[i]*distance);}
 function layout(w,h,context=root.BattleEnvironment?.context,view){
  view??=root.BattleDiorama?.supported(context||{})?root.BattleDiorama.camera(context,w/h):null;const key=[w,h,context?.id,context?.terrain,view?.eye,view?.lens].join(':');if(cache.has(key))return cache.get(key);
  const room=context?.id==='bedroomMess',s=Math.min(w/1000,h/650),result={};
  for(const side of ['p1','p2']){const own=side==='p1',x=w*(own?.31:room?.67:context?.terrain==='path'?.60:.64),y=h*(own?.80:room?.56:.60);
   if(view){const world=groundPoint(view,x,y,w,h,room?.125:.02),foot=project(view,world,w,h),pixelsPerUnit=h/(2*view.lens[1]*foot.depth),height=clamp(pixelsPerUnit*1.35,h*(own?.17:.12),Math.min(w*(own?.38:.27),h*(own?.34:.25)));result[side]={...foot,world,view,x,y,height,size:height/80,pixelsPerUnit,w,h};}
   else {const size=s*(own?2.3:1.7);result[side]={x:w*(own?.31:.69),y:h*(own?.66:.43),height:80*size,size,w,h};}
  }cache.set(key,result);if(cache.size>12)cache.delete(cache.keys().next().value);return result;
 }
 function effect(side,w,h,context){const a=layout(w,h,context)[side];return{x:a.x,y:a.y-a.height*.55};}
 function shadow(c,a,{offsetX=0,opacity=1,lift=0,scale=1}={}){if(opacity<=0||scale<=0)return;c.save();c.filter='none';c.globalAlpha=opacity;const heightWorld=a.height/(a.pixelsPerUnit||a.height),radius=heightWorld*.23*scale,fade=1/(1+lift/Math.max(1,a.height)*2);
  function ellipse(dx,dz,rx,rz,alpha){let center,ex,ez;if(a.world){const p=[a.world[0]+dx,a.world[1]+.005,a.world[2]+dz];center=project(a.view,p,a.w,a.h);const px=project(a.view,[p[0]+rx,p[1],p[2]],a.w,a.h),pz=project(a.view,[p[0],p[1],p[2]+rz],a.w,a.h);ex=[px.x-center.x,px.y-center.y];ez=[pz.x-center.x,pz.y-center.y];}else{center=a;ex=[a.height*.25*scale,0];ez=[0,a.height*.055*scale];}c.save();c.transform(ex[0],ex[1],ez[0],ez[1],center.x+offsetX,center.y);const g=c.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba(17,32,28,'+alpha*fade+')');g.addColorStop(.5,'rgba(17,32,28,'+alpha*.65*fade+')');g.addColorStop(1,'rgba(17,32,28,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,1,0,Math.PI*2);c.fill();c.restore();}
  // Light comes from upper-left/front, matching the environment shader.
  ellipse(radius*.35,-radius*.4,radius*1.6,radius*.8,.25);ellipse(0,0,radius,radius*.5,.34);c.restore();
 }
 const api={project,groundPoint,layout,effect,shadow};root.BattleGround=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
