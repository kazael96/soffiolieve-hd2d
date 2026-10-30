/* Native rail curves and tile permissions, with continuous HD-2D walking.
 * Positions are ROM fixed-point coordinates converted to the field's tile units.
 * Math is implemented here; the DS fixed-point rounding/camera is not emulated. */
(function(root){
 const tables=()=>root.PINWHEEL_RAILS||{},clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,n)=>a.map(v=>v*n),dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0),norm=a=>mul(a,1/(Math.hypot(...a)||1));
 function slerp(a,b,t){const la=Math.hypot(...a),lb=Math.hypot(...b),na=norm(a),nb=norm(b),angle=Math.acos(clamp(dot(na,nb),-1,1));if(angle<1e-7)return mul(norm(add(mul(na,1-t),mul(nb,t))),la+(lb-la)*t);const sn=Math.sin(angle);return mul(norm(add(mul(na,Math.sin((1-t)*angle)/sn),mul(nb,Math.sin(t*angle)/sn))),la+(lb-la)*t);}
 function position(zone,id,front,side=0){
  const r=tables()[zone],l=r?.lines[id];if(!l)throw Error('Linea nativa non disponibile: '+zone+'/'+id);
  const a=r.points[l.a].position,b=r.points[l.b].position,t=clamp(front/l.length,0,1),curve=r.curves[l.curve],delta=sub(b,a);let p,direction;
  if(curve?.kind===1||curve?.kind===2){
   const center=[...curve.center];if(curve.kind===1)center[1]=a[1]+delta[1]*t;
   const av=sub(a,center),bv=sub(b,center);if(curve.kind===1)av[1]=bv[1]=0;
   const radial=slerp(av,bv,t);p=add(center,radial);direction=norm([radial[0],0,radial[2]]);
   // Orient lateral distance as the right-hand perpendicular of the chord.
   const tangent=norm([delta[0],0,delta[2]]);if(direction[2]*tangent[0]-direction[0]*tangent[2]<0)direction=mul(direction,-1);
  }else{p=add(a,mul(delta,t));direction=norm([-delta[2],0,delta[0]]);}
  p=add(p,mul(direction,side*16*r.tileWidth));return {x:p[0],height:p[1],z:p[2]};
 }
 function halfWidth(zone,id,front){const r=tables()[zone],l=r.lines[id],a=r.points[l.a],b=r.points[l.b],wa=a.widths[a.lines.indexOf(+id)],wb=b.widths[b.lines.indexOf(+id)];return (wa+(wb-wa)*clamp(front/Math.max(1,l.length-1),0,1))/16;}
 const meshes=new Map();
 function mesh(zone){
  if(meshes.has(zone))return meshes.get(zone);const r=tables()[zone];if(!r)return null;
  const bins=new Map(),cells=[];
  for(const [id,l]of r.lines.entries()){
   const tiles=l.tiles;
   for(let row=0;row<tiles.length;row++)for(let col=0;col<tiles.width;col++){
    if(tiles.values[row*tiles.width+col]&0x10000)continue;
    const side=col-Math.floor(tiles.width/2);if(Math.abs(side)>halfWidth(zone,id,row+.5)+.5)continue;
    const corners=[[row,side-.5],[row+1,side-.5],[row+1,side+.5],[row,side+.5]].map(([f,s])=>{const width=halfWidth(zone,id,f)+.5;return position(zone,id,f,clamp(s,-width,width));});
    const cell={line:id,front:row,side,corners:corners.map(p=>({x:p.x-16,z:p.z-16,height:p.height}))};cells.push(cell);
    const minX=Math.floor(Math.min(...cell.corners.map(p=>p.x))),maxX=Math.floor(Math.max(...cell.corners.map(p=>p.x))),minZ=Math.floor(Math.min(...cell.corners.map(p=>p.z))),maxZ=Math.floor(Math.max(...cell.corners.map(p=>p.z)));
    for(let x=minX;x<=maxX;x++)for(let z=minZ;z<=maxZ;z++){const key=x+':'+z;if(!bins.has(key))bins.set(key,[]);bins.get(key).push(cell);}
   }
  }
  const value={bins,cells};meshes.set(zone,value);return value;
 }
 function triangle(x,z,a,b,c){const d=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(d)<1e-8)return null;const u=((b.z-c.z)*(x-c.x)+(c.x-b.x)*(z-c.z))/d,v=((c.z-a.z)*(x-c.x)+(a.x-c.x)*(z-c.z))/d;if(u<-.00001||v<-.00001||u+v>1.00001)return null;return a.height*u+b.height*v+c.height*(1-u-v);}
 function locate(zone,x,z,{height,line}={}){
  const list=mesh(zone)?.bins.get(Math.floor(x)+':'+Math.floor(z))||[];let best=null,score=Infinity;
  for(const cell of list){const q=cell.corners,h=triangle(x,z,q[0],q[1],q[2])??triangle(x,z,q[0],q[2],q[3]);if(h===null)continue;
   const delta=height===undefined?0:Math.abs(h-height);if(delta>1.8)continue;const distance=delta+(line===undefined||cell.line===line?0:.001);
   if(distance<score){score=distance;best={height:h,line:cell.line,front:cell.front,side:cell.side};}
  }
  return best;
 }
 function warp(zone,w){
  const front=w.y+(w.width-1)*.5,side=(w.z<<16>>16)+(w.height-1)*.5,center=position(zone,w.x,front,side),a=position(zone,w.x,front-.05,side),b=position(zone,w.x,front+.05,side),c=position(zone,w.x,front,side+.1),forward=norm([b.x-a.x,0,b.z-a.z]),lateral=norm([c.x-center.x,0,c.z-center.z]);
  const primary=w.b===2?lateral:forward,secondary=w.b===2?mul(forward,-1):lateral,axis=w.a<=2?primary:secondary,out=mul(axis,[1,4].includes(w.a)?-1:1);
  return {...center,line:w.x,front,side,out:{x:out[0],z:out[2]}};
 }
 function actor(zone,n){const p=position(zone,n.x,n.z,n.y<<16>>16);return {...n,railOriginal:{...n},x:p.x-.5,z:p.z-.5,y:Math.round(p.height*65536)};}
 const landings=new Map();
 function landing(zone,w){
  const key=[zone,w.x,w.y,w.z,w.width,w.height,w.a,w.b].join(':');if(landings.has(key))return landings.get(key);
  const p=warp(zone,w),hint={height:p.height,line:p.line};
  for(let distance=1;distance<=3;distance+=.25){const x=p.x-16-p.out.x*distance,z=p.z-16-p.out.z*distance,rail=locate(zone,x,z,hint);if(!rail)continue;
   if([[-.2,-.2],[.2,.2],[-.2,.2],[.2,-.2]].every(([dx,dz])=>locate(zone,x+dx,z+dz,hint))){const result={x,z,distance,rail};landings.set(key,result);return result;}
  }
  throw Error('Ingresso sui binari non percorribile: '+zone+'/'+w.x);
 }
 function cameraYaw(zone,x,z,hint={}){
  if(+zone!==28)return 0;
  const data=tables()[zone],at=locate(zone,x,z,hint),cam=data?.cameras[data.lines[at?.line??0]?.camera];if(!cam)return 0;const p=cam.params;
  if(cam.kind===3)return Math.atan2(p[0]-p[3],p[2]-p[5]);
  if([5,6,7].includes(cam.kind))return Math.atan2(x+16-p[2]/65536,z+16-p[4]/65536);
  if(cam.kind===8)return Math.atan2(x+16-p[2]/65536,z+16-p[3]/65536);
  if([1,15,17,19].includes(cam.kind))return p[1]*Math.PI*2/65536;
  throw Error('Orientamento nativo non gestito: '+cam.kind);
 }
 function screenDirection(direction,yaw){const [x,z]=[[0,-1],[0,1],[-1,0],[1,0]][direction],c=Math.cos(yaw),s=Math.sin(yaw),dx=x*c-z*s,dz=x*s+z*c;return Math.abs(dx)>Math.abs(dz)?dx>0?3:2:dz>0?1:0;}
 const api={landing,cameraYaw,screenDirection,position,halfWidth,mesh,locate,warp,actor,has:zone=>!!tables()[zone]};root.NativeRails=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
