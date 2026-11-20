/* Authored full-body pose sequence, registered to a grounded shoe landmark. */
(function(root){
 'use strict';
 const checkpoints=Object.freeze([0,14,26,34,40,46,52,54,61,76,82,86,100,112,128,139,150,162]);
 const assets=Object.freeze(['assets/capture/ball-0.png','assets/capture/ball-9.png','assets/capture/ball-10.png']);
 const clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
 // These are inspected palm landmarks, not the centre of each changing alpha box.
 const palms=Object.freeze([[73,81],[74,93],[67,102],[62,106],[102,99],[115,81],[124,61],[133,64],[125,73],[88,90],[72,83],[74,81]].map(Object.freeze));
 const poses=Object.freeze([[0,0],[14,1],[26,2],[34,3],[40,4],[46,5],[52,6],[61,7],[76,8],[100,9],[128,10],[139,11],[150,0]].map(Object.freeze));
 function anatomy(f){
  const scale=122/127,index=poses.findLast(p=>f>=p[0])[1];
  const actor={x:72-96*scale,y:130-158*scale,scale,cell:index,lean:0,arm:0,forearm:0,wrist:0,head:0,coat:0};
  const palm={x:actor.x+palms[index][0]*scale,y:actor.y+palms[index][1]*scale};
  // The sphere rests ON the palm; its centre must not obscure the fingers.
  return {actor,palm,hand:{x:palm.x+1,y:palm.y-10*22/64}};
 }
 // A cel has no derivative while held. Inherit the last authored contact displacement.
 const launchVelocity=()=>{const a=anatomy(40).hand,b=anatomy(46).hand;return{x:(b.x-a.x)/6,y:(b.y-a.y)/6};};
 const bezier=(a,b,c,d,t)=>{const q=1-t;return q*q*q*a+3*q*q*t*b+3*q*t*t*c+t*t*t*d;};
 function curve(values,t){let row=values;while(row.length>1)row=row.slice(1).map((v,i)=>mix(row[i],v,t));return row[0];}
 function phase(f){return f<14?'prepare':f<34?'windup':f<46?'throw':f<76?'flight':f<86?'open':f<112?'emerge':f<128?'land':f<150?'return':'settled';}
 function pose(value){
  const f=Math.max(0,Math.min(162,Number(value)||0)),{actor,palm,hand}=anatomy(f);
  let ball={...hand,angle:actor.arm+actor.forearm+actor.wrist+.3,cell:0,size:10};
  if(f>=46&&f<76){const held=anatomy(46),from=held.hand,v=launchVelocity(),t=(f-46)/30,start=.3;
   ball={x:curve([from.x,from.x+v.x*6,125,170,182,182],t),y:curve([from.y,from.y+v.y*6,6,26,94,94],t),angle:mix(start,Math.PI*2,smooth(t)),cell:0,size:mix(10,13,smooth(t))};
  }
  else if(f>=76&&f<128)ball={x:182,y:94,angle:0,cell:f<79?9:10,size:13};
  else if(f>=128&&f<150){const t=(f-128)/22,to=anatomy(150);ball={x:curve([182,182,35,35,to.hand.x,to.hand.x],t),y:curve([94,118,118,90,to.hand.y,to.hand.y],t),angle:mix(0,-Math.PI*2+.3,smooth(t)),cell:t<.08?10:t<.16?9:0,size:mix(13,10,smooth(t))};}
  const emergence=clamp((f-86)/26),landing=clamp((f-112)/16);
  const pokemon={visible:f>=86,x:182,feet:f<112?mix(99,124,smooth(emergence)):128-4*(1-landing),scale:f<112?mix(.12,1.2,smooth(emergence)):1.2,stretch:f<112?mix(.65,1,smooth(emergence)):1-.12*Math.sin(landing*Math.PI),white:f<112?1-emergence:0,shadow:f<112?emergence:1};
  const trail=f>47&&f<75?[4.5,3,1.5].filter(age=>f-age>=46).map(age=>{const frame=f-age,t=(frame-46)/30,held=anatomy(46),v=launchVelocity();return {frame,x:curve([held.hand.x,held.hand.x+v.x*6,125,170,182,182],t),y:curve([held.hand.y,held.hand.y+v.y*6,6,26,94,94],t)};}):[];
  return {frame:f,phase:phase(f),actor,palm,hand,ball,pokemon,trail,flash:f>=76&&f<100?Math.sin(clamp((f-76)/24)*Math.PI):0};
 }
 function clock(){
  let f=0,last=null,finished=false;
   return{tick(now,{hidden=false,rate=1}={}){if(!Number.isFinite(now))throw Error('Invalid introduction clock');if(last===null){last=now;return pose(f);}const dt=Math.max(0,Math.min(100,now-last));last=now;if(!hidden&&!finished){const next=checkpoints.find(x=>x>f)??162;f=Math.min(next,f+dt*.045*Math.max(1,Math.min(4,Number(rate)||1)));if(f>=162)finished=true;}return pose(f);},get done(){return finished;},get frame(){return f;}};
 }
 function sprites(images){
  const atlas=images.araliaThrow;
  if(!atlas||atlas.width!==768||atlas.height!==576)throw Error('Pose del lancio di Aralia incomplete');
  return {atlas};
 }
 function draw(c,images,parts,p){
  const a=p.actor;c.save();c.fillStyle='#36574b22';c.beginPath();c.ellipse(a.x+96*a.scale,130,13,2.2,0,0,Math.PI*2);c.fill();
  c.drawImage(parts.atlas,(a.cell%4)*192,Math.floor(a.cell/4)*192,192,192,a.x,a.y,192*a.scale,192*a.scale);c.restore();
  if(p.trail?.length){c.save();c.globalAlpha=.28*Math.sin((p.frame-46)/30*Math.PI);c.strokeStyle='#fff5df';c.lineWidth=1.15;c.beginPath();for(let i=0;i<p.trail.length;i++){const t=p.trail[i];if(i)c.lineTo(t.x,t.y);else c.moveTo(t.x,t.y);}c.lineTo(p.ball.x,p.ball.y);c.stroke();c.restore();}
  const ball=images.balls[p.ball.cell],size=p.ball.size||10;c.save();c.translate(p.ball.x,p.ball.y);c.rotate(p.ball.angle);c.drawImage(ball,48,46,32,34,-size/2,-size*34/64,size,size*34/32);c.restore();
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
 const api={assets,checkpoints,poses,palms,launchVelocity,pose,clock,sprites,white,draw,play};root.IntroPokeball=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
