/* Native cannon coordinates and camera arithmetic; field/controller wiring is separate. */
(function(root){
 const directions=[[0,-1],[0,1],[-1,0],[1,0]],opposite=[1,0,3,2],edges={81:[3],82:[2],83:[0],84:[1],85:[0,3],86:[0,2],87:[1,3],88:[1,2]};
 function edgeBlocked(current,candidate,direction){
  if(!Number.isInteger(direction)||direction<0||direction>3)return true;
  return !!(edges[current]?.includes(direction)||edges[candidate]?.includes(opposite[direction]));
 }
 function scalar(start,end,elapsed,duration){if(duration<=0||elapsed>=duration)return end;if(elapsed<=0)return start;return start+Math.trunc((end-start)*elapsed/duration);}
 function angle(start,end,elapsed,duration){let delta=((end-start)&65535);if(delta>32768)delta-=65536;return scalar(start,start+delta,elapsed,duration)&65535;}
 function create(data){
  function activation(x,z,direction,{frontBlocked=false,backgroundEvent=false}={}){
   if(!Number.isFinite(x)||!Number.isFinite(z)||!directions[direction]||frontBlocked||backgroundEvent)return null;
   const [dx,dz]=directions[direction],tx=Math.trunc(x+16)+dx*2,tz=Math.trunc(z+16)+dz*2;
   const index=data.anchors.findIndex(p=>p[0]===tx&&p[2]===tz);if(index<0)return null;
   const column=data.nativeDirectionToColumn[direction],route=data.routes[index][column];
   return route.member<0?null:{index,column,route};
  }
  function point(index,column,frame,{settled=false}={}){
   const route=data.routes[index]?.[column];if(!route||route.member<0)return null;
   if(settled)return [route.destination[0]+.5-16,route.destination[1],route.destination[2]+.5-16];
   const points=data.paths[route.member].pointsQ16,p=points[Math.max(0,Math.min(points.length-1,Math.floor(frame)))];
   return p.map((v,k)=>data.origins[index][k]+v/65536-(k===1?0:16));
  }
  function orbit(pitch,yaw,distance,target){
   const [sp,cp]=data.sinCosQ12[(pitch&65535)>>>4],[sy,cy]=data.sinCosQ12[(yaw&65535)>>>4],horizontal=Math.max(Math.abs(cp),512),qmul=(a,b)=>Math.floor((a*b+2048)/4096),v=[qmul(sy,horizontal),sp,qmul(cy,horizontal)],length=Math.hypot(...v);
   return v.map((n,i)=>target[i]+n*distance/length);
  }
  return {activation,point,orbit};
 }
 root.IcirrusGymMotion={create,scalar,angle,edgeBlocked};
})(typeof window==='undefined'?globalThis:window);
