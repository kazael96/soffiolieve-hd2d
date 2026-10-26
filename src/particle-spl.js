/* SPL data reconstruction, independent JS. Projection remains HD-2D. */
(function(root){
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),rand=n=>{let x=Math.sin(n*127.1+311.7)*43758.5453123;return x-Math.floor(x)},rgb=n=>[n&31,n>>5&31,n>>10&31],byte=(seed)=>Math.floor(rand(seed)*256);
 const scaled=(n,r,seed)=>n*(255-Math.floor(r*byte(seed)/256))/256,double=(n,r,seed)=>n*(255+r-Math.floor(r*byte(seed)/128))/256;
 function life(e,seed){return Math.max(1,Math.floor(scaled(e.life||1,e.randomLife||0,seed+9))+1)}
 function rate(age,duration,loopFrames=0,offset=0){let factor=Math.floor(65535/Math.max(1,loopFrames||duration));return(offset+Math.floor(factor*age/256))&255}
 function curve(values,t,bounds){let [a,b]=bounds||[0,255];if(t<a)return values[0]+(values[1]-values[0])*t/Math.max(1,a);if(t>=b)return values[1]+(values[2]-values[1])*(t-b)/Math.max(1,255-b);return values[1]}
 function animation(e,age,duration,seed){let normal=rate(age,duration),loop=rate(age,duration,e.framesPerLoop||1,e.flags&0x100000?byte(seed+23):0),scale=e.scaleKeys?curve(e.scaleKeys,e.scaleFlags&1?loop:normal,(e.scaleTimes||[0,1]).map(n=>Math.round(n*255))):1,alpha=e.alphaKeys?curve(e.alphaKeys,e.alphaFlags&256?loop:normal,(e.alphaTimes||[0,1]).map(n=>Math.round(n*255))):31,color=rgb(e.color??32767),texture=e.texture;
  if(e.alphaFlags&255)alpha=scaled(alpha,e.alphaFlags&255,seed+Math.floor(age)*71);
  if(e.colorKeys){let colors=e.colorKeys.map(rgb),flags=e.colorFlags||0,t=flags&2?loop:normal,bounds=e.colorTimingBytes||[0,128,255];if(flags&1)color=colors[Math.floor(rand(seed+13)*3)];else if(t<bounds[0])color=colors[0];else if(t>=bounds[2])color=colors[2];else{let left=t<bounds[1]?0:1,right=left+1,p=(t-bounds[left])/Math.max(1,bounds[right]-bounds[left]);color=flags&4?colors[left].map((c,i)=>c+Math.trunc((colors[right][i]-c)*p)):colors[right]}}
  if(e.textureKeys){let count=clamp(e.textureFrames||1,1,8),slot=e.textureFlags&1?Math.floor(rand(seed+17)*count):Math.min(count-1,Math.floor((e.textureFlags&2?loop:normal)/Math.max(1,e.textureStep||1)));texture=e.textureKeys[slot]}
  let angular=e.flags&4096?e.rotation[0]+rand(seed+6)*(e.rotation[1]-e.rotation[0]):0,angle=(e.flags&8192?rand(seed+18)*65536:e.baseRotation||0)+angular*age;
  return{scale:Math.abs(double(e.scale||0,e.randomScale||0,seed+7))*scale,alpha:clamp((e.alpha||0)*Math.floor(alpha)/961,0,1),color:color.map(n=>n*255/31),texture,angle:angle*Math.PI/32768,angular};
 }
 function initial(e,seed){let shape=e.flags&15,axis=e.flags>>6&3,theta=rand(seed)*Math.PI*2,z=rand(seed+2)*2-1,r=e.radius||0,pos=[0,0,0],rr=[4,5,7,9].includes(shape)?Math.cbrt(rand(seed+3)):1;
  if([1,4,8,9].includes(shape)){if(shape>=8)z=Math.abs(z);let q=Math.sqrt(1-z*z);pos=[r*q*Math.cos(theta)*rr,r*z*rr,r*q*Math.sin(theta)*rr]}
  else if(shape){let radial=shape===5||shape===7?Math.sqrt(rand(seed+3)):1,u=Math.cos(theta)*r*radial,v=Math.sin(theta)*r*radial,h=shape>=6?(rand(seed+4)-.5)*(e.length||0):0;pos=axis===1?[u,h,v]:axis===2?[h,u,v]:[u,v,h]}
  let length=Math.hypot(...pos),direction;if(length)direction=pos.map(v=>v/length);else{const t=rand(seed+31)*Math.PI*2,z=rand(seed+32)*2-1,q=Math.sqrt(1-z*z);direction=[q*Math.cos(t),z,q*Math.sin(t)];} // Native SPL chooses a random unit vector at a zero-radius origin.
  let radial=double(e.radialVelocity||0,e.randomVelocity||0,seed+5),axial=double(e.axialVelocity||0,e.randomVelocity||0,seed+6),velocity=direction.map((v,i)=>v*radial+(e.axis?.[i]||0)*axial);return{p:pos,v:velocity};
 }
 function step(e,state,age,seed){let p=state.p.slice(),v=state.v.slice(),acc=(e.gravity||[0,0,0]).slice();
  if(e.random&&age%Math.max(1,e.random[3])===0)for(let i=0;i<3;i++)acc[i]+=e.random[i]*(Math.floor(rand(seed+age*97+i)*512)-256)/256;
  if(e.magnet)for(let i=0;i<3;i++)acc[i]+=e.magnet[3]*(e.magnet[i]-p[i]-v[i]);
  if(e.rotationField){let angle=e.rotationField[0]*Math.PI/32768,axis=e.rotationField[1],a=(axis+1)%3,b=(axis+2)%3,A=p[a],B=p[b];p[a]=A*Math.cos(angle)-B*Math.sin(angle);p[b]=A*Math.sin(angle)+B*Math.cos(angle)}
  if(e.convergence)for(let i=0;i<3;i++)p[i]+=e.convergence[3]*(e.convergence[i]-p[i]);
  if(e.collision){let anchor=e.position?.[1]||0,plane=e.collision[0];if((anchor-plane)*(anchor+p[1]-plane)<0){p[1]=plane-anchor;if(e.collision[2]===1)v[1]=-v[1]*e.collision[1];else state.dead=true}}
  const drag=(384+(e.resistance||0))/512;for(let i=0;i<3;i++){v[i]=v[i]*drag+acc[i];p[i]+=v[i]}return{p,v,dead:state.dead};
 }
 let cache=new WeakMap();function motion(e,age,seed,initialState){let m=cache.get(e);if(!m){m=new Map();cache.set(e,m)}let key=seed,states=m.get(key);if(!states){if(m.size>2048)m.clear();states=[initialState||initial(e,seed)];m.set(key,states)}let n=Math.max(0,Math.floor(age));while(states.length<=n&&states.length<1000)states.push(step(e,states.at(-1),states.length-1,seed));return states[Math.min(n,states.length-1)]}
 function children(e,duration,age){if(!e.child)return[];let c=e.child,threshold=duration*c.delay/256,interval=Math.max(1,c.interval),first=Math.max(Math.ceil(threshold),Math.ceil(age-c.life)),last=Math.min(duration,Math.floor(age)),births=[];for(let birth=first;birth<=last;birth++)if(Math.floor(birth-threshold)%interval===0)for(let n=0;n<c.rate;n++)births.push({birth,index:n,age:age-birth});return births}
 function child(e,parentState,parentAppearance,birth,seed){let c=e.child,flags=c.flags,rotationType=flags>>3&3,texturePosition=e.childTexturePosition||0;let resource={...e,child:null,flags:((flags>>7&3)<<4)|(rotationType===2?4096:0)|(flags&32?32768:0),life:c.life,randomLife:0,randomScale:0,randomVelocity:0,scale:parentAppearance.scale*(Math.round(c.scaleRatio*256)+1)/64,alpha:Math.floor(parentAppearance.alpha*31),color:flags&64?c.color:parentAppearance.color.map(v=>Math.round(v*31/255)).reduce((n,v,i)=>n|(v<<(i*5)),0),texture:c.texture,textureKeys:null,colorKeys:null,scaleKeys:flags&2?[1,1,c.scale]:null,scaleTimes:[0,0],alphaKeys:flags&4?[31,31,0]:null,alphaTimes:[0,0],alphaFlags:0,baseRotation:rotationType?parentAppearance.angle*32768/Math.PI:0,rotation:rotationType===2?[parentAppearance.angular,parentAppearance.angular]:[0,0],texturePositionFlags:((texturePosition>>4)&3),textureLoopFlags:texturePosition&15};
  if(!(flags&1))for(let k of ['gravity','random','magnet','rotationField','collision','convergence'])resource[k]=null;
  let initialState={p:parentState.p.slice(),v:parentState.v.map((v,i)=>v*c.velocityRatio+c.randomVelocity*(Math.floor(rand(seed+i)*512)-256)/256)};return{resource,initialState};
 }
 root.ParticleSPL={rand,life,rate,animation,motion,children,child,clear(){cache=new WeakMap()}};if(typeof module!=='undefined')module.exports=root.ParticleSPL;
})(typeof window!=='undefined'?window:globalThis);
