/* Native full-body NCER/NMCR layers in an authored HD-2D throw. */
(function(root){
 'use strict';
 const checkpoints=Object.freeze([0,14,34,40,46,54,61,76,82,86,100,112,128,139,150,162]);
 const assets=Object.freeze(['assets/capture/ball-0.png','assets/capture/ball-9.png','assets/capture/ball-10.png']);
 const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
 const rotate=(x,y,a)=>({x:x*Math.cos(a)-y*Math.sin(a),y:x*Math.sin(a)+y*Math.cos(a)});
 // Monotone cubic joints preserve velocity through the release and settle at reversals.
 function joint(keys,f){
  const i=Math.max(0,Math.min(keys.length-2,keys.findIndex(k=>k[0]>=f)-1));
  const a=keys[i],b=keys[i+1],span=b[0]-a[0],t=clamp((f-a[0])/span),slope=n=>{
   if(n<=0||n>=keys.length-1)return 0;
   const u=(keys[n][1]-keys[n-1][1])/(keys[n][0]-keys[n-1][0]),v=(keys[n+1][1]-keys[n][1])/(keys[n+1][0]-keys[n][0]);
   return u*v<=0?0:2*u*v/(u+v);
  };
  return (2*t**3-3*t*t+1)*a[1]+(t**3-2*t*t+t)*span*slope(i)+(-2*t**3+3*t*t)*b[1]+(t**3-t*t)*span*slope(i+1);
 }
 const shoulderKeys=[[0,0],[14,.10],[34,-.65],[46,-2.18],[61,-2.47],[76,-2.20],[100,-.60],[128,-.22],[150,0],[162,0]];
 const elbowKeys=[[0,0],[14,.18],[34,-.34],[46,-.75],[61,-.35],[76,-.10],[100,.15],[128,.14],[150,0],[162,0]];
 function anatomy(f){
  const scale=122/127,wind=smooth((f-14)/20),follow=smooth((f-34)/27),recover=smooth((f-76)/74);
  const actor={x:72-96*scale,y:130-158*scale,scale,lean:-.025*wind+.060*follow-.035*recover,arm:joint(shoulderKeys,f),forearm:joint(elbowKeys,f),wrist:joint([[0,0],[34,-.12],[46,.20],[76,.14],[128,-.10],[150,0],[162,0]],f),head:joint([[0,0],[34,-.025],[61,.045],[112,.035],[150,0],[162,0]],f),coat:Math.sin(clamp((f-26)/112)*Math.PI)*.06};
  const upper=rotate(-6,9,actor.arm),lower=rotate(-8,-7,actor.arm+actor.forearm),p=rotate(89+upper.x+lower.x-96,67+upper.y+lower.y-158,actor.lean);
  return {actor,hand:{x:actor.x+(96+p.x)*scale,y:actor.y+(158+p.y)*scale}};
 }
 const handVelocity=f=>{const a=anatomy(f-.001).hand,b=anatomy(f+.001).hand;return{x:(b.x-a.x)/.002,y:(b.y-a.y)/.002};};
 const bezier=(a,b,c,d,t)=>{const q=1-t;return q*q*q*a+3*q*q*t*b+3*q*t*t*c+t*t*t*d;};
 function curve(values,t){let row=values;while(row.length>1)row=row.slice(1).map((v,i)=>mix(row[i],v,t));return row[0];}
 function phase(f){return f<14?'prepare':f<34?'windup':f<46?'throw':f<76?'flight':f<86?'open':f<112?'emerge':f<128?'land':f<150?'return':'settled';}
 function pose(value){
  const f=Math.max(0,Math.min(162,Number(value)||0)),{actor,hand}=anatomy(f);
  let ball={...hand,angle:actor.arm+actor.forearm+actor.wrist+.3,cell:0};
  if(f>=46&&f<76){const held=anatomy(46),from=held.hand,v=handVelocity(46),t=(f-46)/30,start=held.actor.arm+held.actor.forearm+held.actor.wrist+.3;
   ball={x:curve([from.x,from.x+v.x*6,125,170,182,182],t),y:curve([from.y,from.y+v.y*6,6,26,94,94],t),angle:mix(start,Math.PI*2,smooth(t)),cell:0};
  }
  else if(f>=76&&f<128)ball={x:182,y:94,angle:0,cell:f<79?9:10};
  else if(f>=128&&f<150){const t=(f-128)/22,to=anatomy(150),v=handVelocity(150);ball={x:bezier(182,182,to.hand.x-v.x*22/3,to.hand.x,t),y:bezier(94,94,to.hand.y-v.y*22/3,to.hand.y,t)-16*Math.sin(t*Math.PI)**2,angle:mix(0,-Math.PI*2+to.actor.arm+to.actor.forearm+.3,smooth(t)),cell:t<.08?10:t<.16?9:0};}
  const emergence=clamp((f-86)/26),landing=clamp((f-112)/16);
  const pokemon={visible:f>=86,x:182,feet:f<112?mix(99,124,smooth(emergence)):128-4*(1-landing),scale:f<112?mix(.12,1.2,smooth(emergence)):1.2,stretch:f<112?mix(.65,1,smooth(emergence)):1-.12*Math.sin(landing*Math.PI),white:f<112?1-emergence:0,shadow:f<112?emergence:1};
  return {frame:f,phase:phase(f),actor,hand,ball,pokemon,flash:f>=76&&f<100?Math.sin(clamp((f-76)/24)*Math.PI):0};
 }
 function clock(){
  let f=0,last=null,finished=false;
  return{tick(now,{hidden=false,rate=1}={}){if(!Number.isFinite(now))throw Error('Invalid introduction clock');if(last===null){last=now;return pose(f);}const dt=Math.max(0,Math.min(100,now-last));last=now;if(!hidden&&!finished){const next=checkpoints.find(x=>x>f)??162;f=Math.min(next,f+dt*.06*Math.max(1,Math.min(4,Number(rate)||1)));if(f>=162)finished=true;}return pose(f);},get done(){return finished;},get frame(){return f;}};
 }
 function sprites(images){
  const parts={body:images.araliaBody,upper:images.araliaUpper,forearm:images.araliaForearm,hand:images.araliaHand,head:images.araliaHead,torso:images.araliaTorso,coatLeft:images.araliaCoatLeft,coatRight:images.araliaCoatRight};
  if(Object.values(parts).some(image=>!image||image.width!==192||image.height!==192))throw Error('Parti native di Aralia incomplete');
  return parts;
 }
 function draw(c,images,parts,p){
  const a=p.actor;c.save();c.fillStyle='#36574b22';c.beginPath();c.ellipse(a.x+96*a.scale,130,13,2.2,0,0,Math.PI*2);c.fill();c.translate(a.x+96*a.scale,130);c.scale(a.scale,a.scale);c.rotate(a.lean);c.translate(-96,-158);
  const layer=(image,x,y,angle)=>{c.save();c.translate(x,y);c.rotate(angle);c.translate(-x,-y);c.drawImage(image,0,0);c.restore();};
  if(parts.torso){layer(parts.coatLeft,83,98,a.coat);layer(parts.coatRight,113,98,-a.coat*.8);c.drawImage(parts.torso,0,0);layer(parts.head,96,64,a.head);}else c.drawImage(parts.body,0,0);
  c.save();c.translate(89,67);c.rotate(a.arm);c.translate(-89,-67);c.drawImage(parts.upper,0,0);
  c.translate(83,76);c.rotate(a.forearm);c.translate(-83,-76);c.drawImage(parts.forearm,0,0);layer(parts.hand,75,69,a.wrist);c.restore();c.restore();
  const ball=images.balls[p.ball.cell];c.save();c.translate(p.ball.x,p.ball.y);c.rotate(p.ball.angle);c.drawImage(ball,48,46,32,34,-4,-4.25,8,8.5);c.restore();
  if(p.flash>0){c.save();c.globalAlpha=p.flash*.8;c.fillStyle='#fff7ed';c.beginPath();c.ellipse(182,94,6+p.flash*22,5+p.flash*15,0,0,Math.PI*2);c.fill();c.strokeStyle='#f1c1dd';c.lineWidth=2;for(let i=0;i<8;i++){const angle=i*Math.PI/4;c.beginPath();c.moveTo(182+Math.cos(angle)*12,94+Math.sin(angle)*9);c.lineTo(182+Math.cos(angle)*(13+p.flash*25),94+Math.sin(angle)*(10+p.flash*19));c.stroke();}c.restore();}
  const m=p.pokemon;if(m.visible){c.save();c.fillStyle='rgba(34,56,48,'+(.22*m.shadow)+')';c.beginPath();c.ellipse(m.x,128,19*m.shadow,3.5*m.shadow,0,0,Math.PI*2);c.fill();const w=images.minccino.width*m.scale,h=images.minccino.height*m.scale*m.stretch;c.drawImage(images.minccino,m.x-w/2,m.feet-h,w,h);if(m.white>0){c.globalAlpha=m.white;c.drawImage(images.white,m.x-w/2,m.feet-h,w,h);}c.restore();}
 }
 function white(image,doc=root.document){const canvas=doc.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const c=canvas.getContext('2d');c.drawImage(image,0,0);c.globalCompositeOperation='source-in';c.fillStyle='#fff9fb';c.fillRect(0,0,canvas.width,canvas.height);return canvas;}
 function play({paint,onFrame=()=>{},sound=()=>{},cry=()=>{},document:doc=root.document,request=root.requestAnimationFrame,cancel=root.cancelAnimationFrame,rate=()=>root.GameSpeed?.rate||1}={}){
  const time=clock(),played=new Set();let raf,closed=false,resolve,reject;
  const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});
  const stop=()=>{if(closed)return;closed=true;if(raf!==undefined)cancel(raf);resolve(false);};
  const tick=now=>{if(closed)return;try{const p=time.tick(now,{hidden:doc.hidden,rate:rate()});if(!doc.hidden){paint(p);onFrame(p);for(const [frame,key,action]of [[46,'throw',()=>sound(1382)],[76,'open',()=>sound(1383)],[112,'cry',cry]])if(p.frame>=frame&&!played.has(key)){played.add(key);action();}}if(time.done){closed=true;resolve(true);}else raf=request(tick);}catch(error){closed=true;reject(error);}};
  raf=request(tick);return{promise,cancel:stop};
 }
 const api={assets,checkpoints,pose,clock,sprites,white,draw,play};root.IntroPokeball=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
