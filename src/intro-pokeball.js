/* Native full-body NCER/NMCR layers in an authored HD-2D throw. */
(function(root){
 'use strict';
 const checkpoints=Object.freeze([0,14,34,46,61,76,82,86,100,112,128,139,150,162]);
 const assets=Object.freeze(['assets/capture/ball-0.png','assets/capture/ball-9.png','assets/capture/ball-10.png']);
 const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
 const rotate=(x,y,a)=>({x:x*Math.cos(a)-y*Math.sin(a),y:x*Math.sin(a)+y*Math.cos(a)});
 function phase(f){return f<14?'prepare':f<34?'windup':f<46?'throw':f<76?'flight':f<86?'open':f<112?'emerge':f<128?'land':f<150?'return':'settled';}
 function pose(value){
  const f=Math.max(0,Math.min(162,Number(value)||0)),opening=smooth(f/14);
  const wind=smooth((f-14)/20),throwing=smooth((f-34)/12),follow=smooth((f-46)/30),recover=smooth((f-100)/50);
  const arm=f<14?.2*opening:f<34?mix(.2,-.6,wind):f<46?mix(-.6,-3,throwing):f<76?mix(-3,-3.1,follow):mix(-3.1,0,recover);
  const forearm=f<14?.15*opening:f<34?mix(.15,-.5,wind):f<46?mix(-.5,-1.4,throwing):mix(-1.4,0,recover);
  const scale=122/127,actor={x:mix(128+scale,66,opening)-96*scale,y:130-158*scale,scale,lean:f<34?-.025*wind:f<76?mix(-.025,.035,smooth((f-34)/42)):.035*(1-smooth((f-76)/74)),arm,forearm};
  function point(x,y){const q=rotate(x-96,y-158,actor.lean);return{x:actor.x+(96+q.x)*actor.scale,y:actor.y+(158+q.y)*actor.scale};}
  const upper=rotate(83-89,76-67,arm),lower=rotate(75-83,69-76,arm+forearm),hand=point(89+upper.x+lower.x,67+upper.y+lower.y);
  let ball={...hand,angle:arm+forearm+.3,cell:0};
  if(f>=46&&f<76){const held=pose(46-1e-7),from=held.hand,t=(f-46)/30;ball={x:mix(from.x,182,t),y:mix(from.y,94,t)-42*4*t*(1-t),angle:mix(held.ball.angle,held.ball.angle+Math.PI*3,t),cell:0};}
  else if(f>=76&&f<128)ball={x:182,y:94,angle:0,cell:f<79?9:10};
  else if(f>=128&&f<150){const t=(f-128)/22;ball={x:mix(182,hand.x,smooth(t)),y:mix(94,hand.y,smooth(t))-18*Math.sin(t*Math.PI),angle:mix(0,-Math.PI*2+.3,t),cell:t<.15?10:0};}
  const emergence=clamp((f-86)/26),landing=clamp((f-112)/16);
  const pokemon={visible:f>=86,x:182,feet:f<112?mix(99,124,smooth(emergence)):128-4*(1-landing),scale:f<112?mix(.12,1.2,smooth(emergence)):1.2,stretch:f<112?mix(.65,1,smooth(emergence)):1-.12*Math.sin(landing*Math.PI),white:f<112?1-emergence:0,shadow:f<112?emergence:1};
  return {frame:f,phase:phase(f),actor,hand,ball,pokemon,flash:f>=76&&f<100?Math.sin(clamp((f-76)/24)*Math.PI):0};
 }
 function clock(){
  let f=0,last=null,finished=false;
  return{tick(now,{hidden=false,rate=1}={}){if(!Number.isFinite(now))throw Error('Invalid introduction clock');if(last===null){last=now;return pose(f);}const dt=Math.max(0,Math.min(100,now-last));last=now;if(!hidden&&!finished){const next=checkpoints.find(x=>x>f)??162;f=Math.min(next,f+dt*.06*Math.max(1,Math.min(4,Number(rate)||1)));if(f>=162)finished=true;}return pose(f);},get done(){return finished;},get frame(){return f;}};
 }
 function sprites(images){
  const parts={body:images.araliaBody,upper:images.araliaUpper,forearm:images.araliaForearm,hand:images.araliaHand};
  if(Object.values(parts).some(image=>!image||image.width!==192||image.height!==192))throw Error('Parti native di Aralia incomplete');
  return parts;
 }
 function draw(c,images,parts,p){
  const a=p.actor;c.save();c.translate(a.x+96*a.scale,130);c.scale(a.scale,a.scale);c.rotate(a.lean);c.translate(-96,-158);c.drawImage(parts.body,0,0);
  c.save();c.translate(89,67);c.rotate(a.arm);c.translate(-89,-67);c.drawImage(parts.upper,0,0);
  c.translate(83,76);c.rotate(a.forearm);c.translate(-83,-76);c.drawImage(parts.forearm,0,0);c.drawImage(parts.hand,0,0);c.restore();c.restore();
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
